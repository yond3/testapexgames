// Import Firebase modules directly
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js"; // Can remove if only used on dashboard
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail // <-- *** 1. ADDED THIS IMPORT ***
    // Optional: Import for auth state observer later
    // onAuthStateChanged,
    // signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc // Needed to check if username exists
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Your web app's Firebase configuration (Provided by you)
const firebaseConfig = {
  apiKey: "AIzaSyB4shH6owP4rwuYTwEIcRjaZRJh5p6b_6s",
  authDomain: "apexgames-a5903.firebaseapp.com",
  projectId: "apexgames-a5903",
  storageBucket: "apexgames-a5903.appspot.com",
  messagingSenderId: "927388647652",
  appId: "1:927388647652:web:f065997c4969510b056cf1",
  measurementId: "G-B5GKRLC8X7"
};

// Initialize Firebase
try {
    const app = initializeApp(firebaseConfig);
    // const analytics = getAnalytics(app); // Initialize if needed globally
    const auth = getAuth(app);
    const db = getFirestore(app); // Initialize Firestore

    // --- Get HTML Elements ---
    // Sign In / Sign Up Modal
    const signInModal = document.getElementById('signInModal');
    const signInBtn = document.getElementById('signInBtn'); // Button in main header
    const closeModalBtn = signInModal ? signInModal.querySelector('.close-modal') : null;
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const signupUsername = document.getElementById('signupUsername');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const signupPasswordRepeat = document.getElementById('signupPasswordRepeat');
    const loginIdentifier = document.getElementById('loginIdentifier');
    const loginPassword = document.getElementById('loginPassword');
    const loginSwitchBtns = document.querySelectorAll('.login-switch-btn');
    const signupSwitchBtns = document.querySelectorAll('.signup-switch-btn');
    const passwordToggles = document.querySelectorAll('#signInModal .toggle-password i');
    const genericAuthErrorElement = document.getElementById('genericAuthError');
    const forgotPasswordLink = document.querySelector('.forgot-password'); // <-- *** 2. ADDED ELEMENT REF ***

    // Choose Username Modal
    const chooseUsernameModal = document.getElementById('chooseUsernameModal');
    const chooseUsernameInput = document.getElementById('chooseUsernameInput');
    const saveUsernameBtn = document.getElementById('saveUsernameBtn');
    const chooseUsernameErrorElement = document.getElementById('chooseUsernameError');
    const genericUsernameErrorElement = document.getElementById('genericUsernameError');


    // --- Modal Visibility Functions ---
    // ... (keep existing functions: openModal, closeModal, openChooseUsernameModal, closeChooseUsernameModal) ...
     function openModal() { if (signInModal) { signInModal.style.display = 'flex'; switchToSignupTab(); clearAllErrors(); clearGenericError('genericAuthError'); } }
     function closeModal() { if (signInModal) { signInModal.style.display = 'none'; } }
     function openChooseUsernameModal() { if (chooseUsernameModal) { clearError('chooseUsernameInput'); clearGenericError('genericUsernameError'); chooseUsernameModal.style.display = 'flex'; } }
     function closeChooseUsernameModal() { if (chooseUsernameModal) { chooseUsernameModal.style.display = 'none'; } }

    // --- Tab Switching Functions ---
    // ... (keep existing functions: switchToLoginTab, switchToSignupTab) ...
     function switchToLoginTab() { if (!loginTab || !signupTab || !loginForm || !signupForm) return; loginTab.classList.add('active-tab'); signupTab.classList.remove('active-tab'); loginForm.classList.remove('hidden-form'); signupForm.classList.add('hidden-form'); clearAllErrors(); clearGenericError('genericAuthError'); }
     function switchToSignupTab() { if (!loginTab || !signupTab || !loginForm || !signupForm) return; signupTab.classList.add('active-tab'); loginTab.classList.remove('active-tab'); signupForm.classList.remove('hidden-form'); loginForm.classList.add('hidden-form'); clearAllErrors(); clearGenericError('genericAuthError'); }

    // --- Password Visibility Toggle ---
    // ... (keep existing function: togglePasswordVisibility) ...
    function togglePasswordVisibility(event) { const wrapper = event.target.closest('.input-wrapper'); if (!wrapper) return; const passwordInput = wrapper.querySelector('input[type="password"], input[type="text"]'); const icon = event.target; if (passwordInput && icon) { if (passwordInput.type === 'password') { passwordInput.type = 'text'; icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); } else { passwordInput.type = 'password'; icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); } } }


    // --- Error Handling Helpers ---
    // ... (keep existing functions: displayGenericError, clearGenericError, mapFirebaseAuthError) ...
    function displayGenericError(message, errorElementId = 'genericAuthError') { const errorElement = document.getElementById(errorElementId); if (errorElement) { errorElement.textContent = message; errorElement.classList.add('visible'); } else { alert(message); } console.error("Generic Error:", message); }
    function clearGenericError(errorElementId = 'genericAuthError') { const errorElement = document.getElementById(errorElementId); if (errorElement) { errorElement.classList.remove('visible'); errorElement.textContent = ''; } }
    function mapFirebaseAuthError(errorCode) { switch (errorCode) { case 'auth/invalid-email': return 'Please enter a valid email address.'; case 'auth/user-not-found': case 'auth/invalid-credential': return 'Incorrect email or password.'; case 'auth/wrong-password': return 'Incorrect password.'; case 'auth/email-already-in-use': return 'This email address is already registered.'; case 'auth/weak-password': return 'Password is too weak (must be at least 6 characters).'; case 'auth/operation-not-allowed': return 'Email/Password sign-in is not enabled in Firebase.'; case 'auth/missing-password': return 'Password is required.'; default: console.error("Firebase Auth Error Code:", errorCode); return 'An unexpected error occurred. Please try again.'; } }


    // --- Validation Helper Functions ---
    // ... (keep existing functions: isValidEmail, displayError, clearError, clearAllErrors, validateSignupForm, validateLoginForm, validateUsernameForm) ...
     function isValidEmail(email) { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return emailRegex.test(email); }
     function displayError(inputId, message) { const inputElement = document.getElementById(inputId); const errorElement = document.getElementById(inputId + 'Error'); if (inputElement && errorElement) { inputElement.classList.add('invalid'); errorElement.textContent = message; errorElement.classList.add('visible'); } else { console.warn(`Could not find input or error element for ID: ${inputId}`); } }
     function clearError(inputId) { const inputElement = document.getElementById(inputId); const errorElement = document.getElementById(inputId + 'Error'); if (inputElement && errorElement) { inputElement.classList.remove('invalid'); errorElement.classList.remove('visible'); } }
     function clearAllErrors() { const errorMessages = document.querySelectorAll('#signInModal .error-message, #chooseUsernameModal .error-message'); const invalidInputs = document.querySelectorAll('#signInModal input.invalid, #chooseUsernameModal input.invalid'); errorMessages.forEach(span => { span.classList.remove('visible'); }); invalidInputs.forEach(input => input.classList.remove('invalid')); clearGenericError('genericAuthError'); clearGenericError('genericUsernameError'); }
     function validateSignupForm() { if (!signupUsername || !signupEmail || !signupPassword || !signupPasswordRepeat) { console.error("Signup form elements not found!"); return false; } clearAllErrors(); let isValid = true; const minPasswordLength = 6; if (!signupUsername.value.trim()) { displayError('signupUsername', 'Username is required.'); isValid = false; } if (!signupEmail.value.trim()) { displayError('signupEmail', 'Email is required.'); isValid = false; } else if (!isValidEmail(signupEmail.value.trim())) { displayError('signupEmail', 'Please enter a valid email address.'); isValid = false; } if (!signupPassword.value) { displayError('signupPassword', 'Password is required.'); isValid = false; } else if (signupPassword.value.length < minPasswordLength) { displayError('signupPassword', `Password must be at least ${minPasswordLength} characters long.`); isValid = false; } if (!signupPasswordRepeat.value) { displayError('signupPasswordRepeat', 'Please repeat your password.'); isValid = false; } else if (signupPassword.value && signupPassword.value !== signupPasswordRepeat.value) { displayError('signupPasswordRepeat', 'Passwords do not match.'); isValid = false; } return isValid; }
     function validateLoginForm() { if (!loginIdentifier || !loginPassword) { console.error("Login form elements not found!"); return false; } clearAllErrors(); let isValid = true; if (!loginIdentifier.value.trim()) { displayError('loginIdentifier', 'Username or Email is required.'); isValid = false; } if (!loginPassword.value) { displayError('loginPassword', 'Password is required.'); isValid = false; } return isValid; }
     function validateUsernameForm() { clearError('chooseUsernameInput'); clearGenericError('genericUsernameError'); let isValid = true; if (!chooseUsernameInput || !chooseUsernameInput.value.trim()) { displayError('chooseUsernameInput', 'Username cannot be empty.'); isValid = false; } else if (chooseUsernameInput.value.trim().length < 3) { displayError('chooseUsernameInput', 'Username must be at least 3 characters.'); isValid = false; } else if (!/^[a-zA-Z0-9_]+$/.test(chooseUsernameInput.value.trim())) { displayError('chooseUsernameInput', 'Username can only contain letters, numbers, and underscores.'); isValid = false; } return isValid; }


    // --- *** 4. ADDED: Forgot Password Function *** ---
    function handleForgotPassword() {
        const email = window.prompt("Please enter the email address for your account:");
        clearGenericError('genericAuthError'); // Clear previous errors in auth modal

        if (!email || !email.trim()) {
            console.log("Password reset cancelled or no email entered.");
            return; // Exit the function
        }
        const trimmedEmail = email.trim();

        if (!isValidEmail(trimmedEmail)) {
            displayGenericError("Please enter a valid email address.", 'genericAuthError');
            return; // Exit if email is invalid
        }

        console.log(`Attempting to send password reset email to: ${trimmedEmail}`);
        displayGenericError('Sending reset email...', 'genericAuthError'); // Indicate processing

        sendPasswordResetEmail(auth, trimmedEmail)
            .then(() => {
                console.log("Password reset email processing initiated.");
                displayGenericError(`If an account exists for ${trimmedEmail}, a password reset link has been sent. Please check your inbox (and spam folder).`, 'genericAuthError');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = mapFirebaseAuthError(errorCode); // Reuse existing error mapping
                console.error("Password reset failed:", errorCode, error.message);
                displayGenericError(`Error sending reset email: ${errorMessage}`, 'genericAuthError');
            });
    }
    // --- *** End Forgot Password Function *** ---


    // --- Event Listeners Setup (Modals) ---
    if (signInBtn) signInBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (signInModal) signInModal.addEventListener('click', (event) => { if (event.target === signInModal) closeModal(); });
    if (loginTab) loginTab.addEventListener('click', switchToLoginTab);
    if (signupTab) signupTab.addEventListener('click', switchToSignupTab);
    loginSwitchBtns.forEach(btn => btn.addEventListener('click', switchToLoginTab));
    signupSwitchBtns.forEach(btn => btn.addEventListener('click', switchToSignupTab));
    passwordToggles.forEach(icon => {
        const parentSpan = icon.closest('.toggle-password');
        if (parentSpan) { parentSpan.style.cursor = 'pointer'; parentSpan.setAttribute('tabindex', '0'); icon.addEventListener('click', togglePasswordVisibility); parentSpan.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); togglePasswordVisibility({ target: icon }); } }); }
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (signInModal && signInModal.style.display === 'flex') closeModal(); if (chooseUsernameModal && chooseUsernameModal.style.display === 'flex') closeChooseUsernameModal(); } });
    [signupUsername, signupEmail, signupPassword, signupPasswordRepeat, loginIdentifier, loginPassword, chooseUsernameInput].forEach(input => { if (input) { input.addEventListener('input', () => { if (document.getElementById(input.id + 'Error')) clearError(input.id); }); } });

    // --- *** 3. ADDED: Forgot Password Listener *** ---
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault(); // Stop link from navigating to #
            handleForgotPassword();
        });
    }
    // --- *** End Add Forgot Password Listener *** ---


    // --- Form Submit Handlers (Auth & Firestore) ---
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            clearAllErrors();

            if (validateSignupForm()) {
                const email = signupEmail.value;
                const password = signupPassword.value;
                const username = signupUsername.value.trim();

                console.log('Attempting Firebase signup...');
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        console.log('Signup successful:', user);
                        const userDocRef = doc(db, "users", user.uid);
                        setDoc(userDocRef, { username: username, email: user.email }, { merge: true })
                            .then(() => {
                                console.log("Initial username saved to Firestore");
                                alert(`Account created successfully! Welcome, ${username}! Redirecting...`);
                                signupForm.reset();
                                closeModal();
                                window.location.href = '/dashboard.html';
                            })
                            .catch((dbError) => {
                                console.error("Error saving initial username to Firestore:", dbError);
                                alert('Account created, but failed to save username. Please choose one now.');
                                signupForm.reset();
                                closeModal();
                                openChooseUsernameModal();
                            });
                    })
                    .catch((error) => {
                        const errorCode = error.code; const errorMessage = mapFirebaseAuthError(errorCode); console.error('Signup failed:', errorCode, error.message); displayGenericError(`Signup failed: ${errorMessage}`, 'genericAuthError'); if (errorCode === 'auth/email-already-in-use') { displayError('signupEmail', errorMessage); } else if (errorCode === 'auth/weak-password') { displayError('signupPassword', errorMessage); }
                    });
            } else { console.log('Client-side signup form validation failed.'); }
        });
    } else { console.warn("Signup form element not found."); }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            clearAllErrors();

            if (validateLoginForm()) {
                const email = loginIdentifier.value;
                const password = loginPassword.value;

                console.log('Attempting Firebase login...');
                signInWithEmailAndPassword(auth, email, password)
                    .then(async (userCredential) => {
                        const user = userCredential.user;
                        console.log('Login successful:', user);
                        loginForm.reset();
                        closeModal();

                        const userDocRef = doc(db, "users", user.uid);
                        try {
                            const docSnap = await getDoc(userDocRef);
                            if (docSnap.exists() && docSnap.data().username) {
                                console.log("Username found on login:", docSnap.data().username);
                                window.location.href = '/dashboard.html';
                            } else {
                                console.log("No username found on login for user:", user.uid);
                                alert('Welcome! Please choose a username.');
                                openChooseUsernameModal();
                            }
                        } catch (dbError) {
                             console.error("Error checking username on login:", dbError);
                             alert('Could not verify username. Please choose one.');
                             openChooseUsernameModal();
                        }
                    })
                    .catch((error) => {
                        const errorCode = error.code; const errorMessage = mapFirebaseAuthError(errorCode); console.error('Login failed:', errorCode, error.message); displayGenericError(`Login failed: ${errorMessage}`, 'genericAuthError');
                    });
            } else { console.log('Client-side login form validation failed.'); }
        });
    } else { console.warn("Login form element not found."); }

    // --- Save Username Button Listener ---
    if (saveUsernameBtn) {
        saveUsernameBtn.addEventListener('click', async () => {
             clearGenericError('genericUsernameError');

            if (validateUsernameForm()) {
                const chosenUsername = chooseUsernameInput.value.trim();
                const currentUser = auth.currentUser;

                if (currentUser) {
                    const uid = currentUser.uid;
                    const userDocRef = doc(db, "users", uid);

                    console.log(`Attempting to save username "${chosenUsername}" for user ${uid}`);
                    saveUsernameBtn.disabled = true; saveUsernameBtn.textContent = 'Saving...';

                    try {
                        await setDoc(userDocRef, { username: chosenUsername, email: currentUser.email }, { merge: true });
                        console.log("Username successfully saved to Firestore!");
                        alert("Username saved! Redirecting to dashboard...");
                        chooseUsernameInput.value = ''; closeChooseUsernameModal();
                        window.location.href = '/dashboard.html';
                    } catch (error) {
                        console.error("Error saving username to Firestore: ", error);
                        displayGenericError("Failed to save username. Please try again.", 'genericUsernameError');
                    } finally {
                         saveUsernameBtn.disabled = false; saveUsernameBtn.textContent = 'Save Username';
                    }
                } else {
                    console.error("No user logged in to save username for."); displayGenericError("Authentication error. Please log in again.", 'genericUsernameError'); closeChooseUsernameModal();
                }
            } else { console.log("Choose username form validation failed."); }
        });
    } else if (document.getElementById('chooseUsernameModal')) {
         console.warn("Save Username button not found, although choose username modal exists.");
    }


} catch (error) {
    console.error("Error initializing Firebase or setting up script:", error);
    alert("Error initializing application. Please try refreshing the page.");
    if(signInBtn) signInBtn.disabled = true;
}
