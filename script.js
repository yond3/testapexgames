// Import Firebase modules directly
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
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
    const analytics = getAnalytics(app);
    const auth = getAuth(app);
    const db = getFirestore(app); // Initialize Firestore

    // --- Get HTML Elements ---
    // Sign In / Sign Up Modal
    const signInModal = document.getElementById('signInModal');
    const signInBtn = document.getElementById('signInBtn');
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
    const passwordToggles = document.querySelectorAll('.toggle-password i');
    const genericAuthErrorElement = document.getElementById('genericAuthError');

    // Choose Username Modal
    const chooseUsernameModal = document.getElementById('chooseUsernameModal');
    const chooseUsernameInput = document.getElementById('chooseUsernameInput');
    const saveUsernameBtn = document.getElementById('saveUsernameBtn');
    const chooseUsernameErrorElement = document.getElementById('chooseUsernameError');
    const genericUsernameErrorElement = document.getElementById('genericUsernameError');


    // --- Modal Visibility Functions ---
    function openModal() {
        if (signInModal) { signInModal.style.display = 'flex'; switchToSignupTab(); clearAllErrors(); clearGenericError('genericAuthError'); }
    }
    function closeModal() {
        if (signInModal) { signInModal.style.display = 'none'; }
    }
    function openChooseUsernameModal() {
        if (chooseUsernameModal) {
             clearError('chooseUsernameInput'); // Clear previous errors
             clearGenericError('genericUsernameError');
             chooseUsernameModal.style.display = 'flex';
        }
    }
    function closeChooseUsernameModal() {
        if (chooseUsernameModal) { chooseUsernameModal.style.display = 'none'; }
    }

    // --- Tab Switching Functions ---
    function switchToLoginTab() {
        if (!loginTab || !signupTab || !loginForm || !signupForm) return;
        loginTab.classList.add('active-tab'); signupTab.classList.remove('active-tab');
        loginForm.classList.remove('hidden-form'); signupForm.classList.add('hidden-form');
        clearAllErrors(); clearGenericError('genericAuthError');
    }
    function switchToSignupTab() {
        if (!loginTab || !signupTab || !loginForm || !signupForm) return;
        signupTab.classList.add('active-tab'); loginTab.classList.remove('active-tab');
        signupForm.classList.remove('hidden-form'); loginForm.classList.add('hidden-form');
        clearAllErrors(); clearGenericError('genericAuthError');
    }

    // --- Password Visibility Toggle ---
    function togglePasswordVisibility(event) {
        const wrapper = event.target.closest('.input-wrapper'); if (!wrapper) return;
        const passwordInput = wrapper.querySelector('input[type="password"], input[type="text"]'); const icon = event.target;
        if (passwordInput && icon) { if (passwordInput.type === 'password') { passwordInput.type = 'text'; icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); } else { passwordInput.type = 'password'; icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); } }
    }

    // --- Error Handling Helpers ---
    function displayGenericError(message, errorElementId = 'genericAuthError') { // Added ID parameter
        const errorElement = document.getElementById(errorElementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        } else { alert(message); } // Fallback
        console.error("Generic Error:", message);
    }
    function clearGenericError(errorElementId = 'genericAuthError') { // Added ID parameter
        const errorElement = document.getElementById(errorElementId);
        if (errorElement) {
             errorElement.classList.remove('visible');
             errorElement.textContent = '';
        }
    }
    function mapFirebaseAuthError(errorCode) { /* ... keep existing ... */
        switch (errorCode) {
            case 'auth/invalid-email': return 'Please enter a valid email address.';
            case 'auth/user-not-found': case 'auth/invalid-credential': return 'Incorrect email or password.';
            case 'auth/wrong-password': return 'Incorrect password.';
            case 'auth/email-already-in-use': return 'This email address is already registered.';
            case 'auth/weak-password': return 'Password is too weak (must be at least 6 characters).';
            case 'auth/operation-not-allowed': return 'Email/Password sign-in is not enabled in Firebase.';
            case 'auth/missing-password': return 'Password is required.';
            default: console.error("Firebase Auth Error Code:", errorCode); return 'An unexpected error occurred. Please try again.';
        }
    }

    // --- Validation Helper Functions ---
    function isValidEmail(email) { /* ... keep existing ... */
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return emailRegex.test(email);
    }
    function displayError(inputId, message) { /* ... keep existing ... */
        const inputElement = document.getElementById(inputId); const errorElement = document.getElementById(inputId + 'Error');
        if (inputElement && errorElement) { inputElement.classList.add('invalid'); errorElement.textContent = message; errorElement.classList.add('visible'); } else { console.warn(`Could not find input or error element for ID: ${inputId}`); }
    }
    function clearError(inputId) { /* ... keep existing ... */
        const inputElement = document.getElementById(inputId); const errorElement = document.getElementById(inputId + 'Error');
        if (inputElement && errorElement) { inputElement.classList.remove('invalid'); errorElement.classList.remove('visible'); }
    }
    function clearAllErrors() { /* ... keep existing, add username clear ... */
        const errorMessages = document.querySelectorAll('#signInModal .error-message, #chooseUsernameModal .error-message'); // Select from both modals
        const invalidInputs = document.querySelectorAll('#signInModal input.invalid, #chooseUsernameModal input.invalid');
        errorMessages.forEach(span => { span.classList.remove('visible'); });
        invalidInputs.forEach(input => input.classList.remove('invalid'));
        // Clear generic errors in both places if they exist
        clearGenericError('genericAuthError');
        clearGenericError('genericUsernameError');
    }
    function validateSignupForm() { /* ... keep existing ... */
        if (!signupUsername || !signupEmail || !signupPassword || !signupPasswordRepeat) { console.error("Signup form elements not found!"); return false; }
        clearAllErrors(); let isValid = true; const minPasswordLength = 6;
        if (!signupUsername.value.trim()) { displayError('signupUsername', 'Username is required.'); isValid = false; }
        if (!signupEmail.value.trim()) { displayError('signupEmail', 'Email is required.'); isValid = false; } else if (!isValidEmail(signupEmail.value.trim())) { displayError('signupEmail', 'Please enter a valid email address.'); isValid = false; }
        if (!signupPassword.value) { displayError('signupPassword', 'Password is required.'); isValid = false; } else if (signupPassword.value.length < minPasswordLength) { displayError('signupPassword', `Password must be at least ${minPasswordLength} characters long.`); isValid = false; }
        if (!signupPasswordRepeat.value) { displayError('signupPasswordRepeat', 'Please repeat your password.'); isValid = false; } else if (signupPassword.value && signupPassword.value !== signupPasswordRepeat.value) { displayError('signupPasswordRepeat', 'Passwords do not match.'); isValid = false; }
        return isValid;
    }
    function validateLoginForm() { /* ... keep existing ... */
        if (!loginIdentifier || !loginPassword) { console.error("Login form elements not found!"); return false; }
        clearAllErrors(); let isValid = true;
        if (!loginIdentifier.value.trim()) { displayError('loginIdentifier', 'Username or Email is required.'); isValid = false; }
        if (!loginPassword.value) { displayError('loginPassword', 'Password is required.'); isValid = false; }
        return isValid;
    }
    function validateUsernameForm() { // Added validation for username modal
        clearError('chooseUsernameInput'); // Clear previous specific error
        clearGenericError('genericUsernameError'); // Clear previous generic error
        let isValid = true;
        if (!chooseUsernameInput || !chooseUsernameInput.value.trim()) {
            displayError('chooseUsernameInput', 'Username cannot be empty.');
            isValid = false;
        }
        // Example: Check length
        else if (chooseUsernameInput.value.trim().length < 3) {
             displayError('chooseUsernameInput', 'Username must be at least 3 characters.');
             isValid = false;
        }
        // Example: Check characters (allow letters, numbers, underscore)
        else if (!/^[a-zA-Z0-9_]+$/.test(chooseUsernameInput.value.trim())) {
             displayError('chooseUsernameInput', 'Username can only contain letters, numbers, and underscores.');
             isValid = false;
        }
        return isValid;
    }


    // --- Event Listeners Setup ---
    if (signInBtn) signInBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal); // Login modal close button
    if (signInModal) signInModal.addEventListener('click', (event) => { if (event.target === signInModal) closeModal(); });
    if (loginTab) loginTab.addEventListener('click', switchToLoginTab);
    if (signupTab) signupTab.addEventListener('click', switchToSignupTab);
    loginSwitchBtns.forEach(btn => btn.addEventListener('click', switchToLoginTab));
    signupSwitchBtns.forEach(btn => btn.addEventListener('click', switchToSignupTab));
    passwordToggles.forEach(icon => { /* ... keep existing keyboard/click logic ... */
        const parentSpan = icon.closest('.toggle-password');
        if (parentSpan) { parentSpan.style.cursor = 'pointer'; parentSpan.setAttribute('tabindex', '0'); icon.addEventListener('click', togglePasswordVisibility); parentSpan.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); togglePasswordVisibility({ target: icon }); } }); }
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (signInModal && signInModal.style.display === 'flex') closeModal(); if (chooseUsernameModal && chooseUsernameModal.style.display === 'flex') closeChooseUsernameModal(); /* Optional: close username modal on Esc too */ } });
    // Clear errors on input for all relevant fields (incl. chooseUsernameInput)
    [signupUsername, signupEmail, signupPassword, signupPasswordRepeat, loginIdentifier, loginPassword, chooseUsernameInput].forEach(input => { if (input) { input.addEventListener('input', () => { if (document.getElementById(input.id + 'Error')) clearError(input.id); }); } });


    // --- MODIFIED Form Submit Event Listeners ---
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            clearAllErrors(); // Use updated clearAllErrors

            if (validateSignupForm()) {
                const email = signupEmail.value;
                const password = signupPassword.value;
                const username = signupUsername.value.trim(); // Get username for saving

                console.log('Attempting Firebase signup...');
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        console.log('Signup successful:', user);

                        // --- Store initial username (and email) immediately ---
                        const userDocRef = doc(db, "users", user.uid);
                        setDoc(userDocRef, { username: username, email: user.email }, { merge: true })
                            .then(() => {
                                console.log("Initial username saved to Firestore");
                                alert(`Account created successfully! Welcome, ${username}! Redirecting...`);
                                signupForm.reset();
                                closeModal(); // Close signup/login modal
                                window.location.href = '/dashboard.html'; // Redirect to dashboard
                            })
                            .catch((dbError) => {
                                console.error("Error saving initial username to Firestore:", dbError);
                                // Fallback: User created, but username not saved. Prompt to choose.
                                alert('Account created, but failed to save username. Please choose one now.');
                                signupForm.reset();
                                closeModal(); // Close signup/login modal
                                openChooseUsernameModal(); // Open username modal
                            });
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = mapFirebaseAuthError(errorCode);
                        console.error('Signup failed:', errorCode, error.message);
                        displayGenericError(`Signup failed: ${errorMessage}`, 'genericAuthError');
                        if (errorCode === 'auth/email-already-in-use') { displayError('signupEmail', errorMessage); }
                        else if (errorCode === 'auth/weak-password') { displayError('signupPassword', errorMessage); }
                    });
            } else {
                console.log('Client-side signup form validation failed.');
            }
        });
    } else {
         console.warn("Signup form element not found.");
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            clearAllErrors(); // Use updated clearAllErrors

            if (validateLoginForm()) {
                const email = loginIdentifier.value; // Assuming identifier is email
                const password = loginPassword.value;

                console.log('Attempting Firebase login...');
                signInWithEmailAndPassword(auth, email, password)
                    .then(async (userCredential) => { // Make async for await getDoc
                        const user = userCredential.user;
                        console.log('Login successful:', user);
                        loginForm.reset();
                        closeModal(); // Close login modal FIRST

                        // --- Check if user has a username in Firestore ---
                        const userDocRef = doc(db, "users", user.uid);
                        try {
                            const docSnap = await getDoc(userDocRef);
                            if (docSnap.exists() && docSnap.data().username) {
                                // Username exists, proceed to dashboard
                                console.log("Username found:", docSnap.data().username);
                                alert(`Welcome back, ${docSnap.data().username}! Redirecting...`);
                                window.location.href = '/dashboard.html'; // Redirect
                            } else {
                                // No username found, prompt user to choose one
                                console.log("No username found in Firestore for user:", user.uid);
                                alert('Welcome! Please choose a username.');
                                openChooseUsernameModal(); // Open username modal AFTER closing login modal
                            }
                        } catch (dbError) {
                             console.error("Error checking for username in Firestore:", dbError);
                             alert('Could not verify username. Please choose one.');
                             openChooseUsernameModal(); // Open username modal on error too
                        }
                        // --- End Check ---
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = mapFirebaseAuthError(errorCode);
                        console.error('Login failed:', errorCode, error.message);
                        displayGenericError(`Login failed: ${errorMessage}`, 'genericAuthError');
                    });
            } else {
                console.log('Client-side login form validation failed.');
            }
        });
    } else {
        console.warn("Login form element not found.");
    }

    // --- Listener for the Save Username Button ---
    if (saveUsernameBtn) {
        saveUsernameBtn.addEventListener('click', async () => { // Make async
             clearGenericError('genericUsernameError'); // Clear generic errors for this modal

            if (validateUsernameForm()) {
                const chosenUsername = chooseUsernameInput.value.trim();
                const currentUser = auth.currentUser;

                if (currentUser) {
                    const uid = currentUser.uid;
                    const userDocRef = doc(db, "users", uid);

                    console.log(`Attempting to save username "${chosenUsername}" for user ${uid}`);
                    saveUsernameBtn.disabled = true; // Prevent double clicks
                    saveUsernameBtn.textContent = 'Saving...';

                    try {
                        // Save username (and email if not already there) to Firestore
                        await setDoc(userDocRef, {
                            username: chosenUsername,
                            email: currentUser.email // Good practice to store email too
                        }, { merge: true }); // Merge ensures we don't overwrite other fields

                        console.log("Username successfully saved to Firestore!");
                        alert("Username saved! Redirecting to dashboard...");
                        chooseUsernameInput.value = ''; // Clear input
                        closeChooseUsernameModal();
                        window.location.href = '/dashboard.html'; // Redirect to dashboard

                    } catch (error) {
                        console.error("Error saving username to Firestore: ", error);
                        displayGenericError("Failed to save username. Please try again.", 'genericUsernameError');
                    } finally {
                         saveUsernameBtn.disabled = false; // Re-enable button
                         saveUsernameBtn.textContent = 'Save Username';
                    }

                } else {
                    console.error("No user logged in to save username for.");
                    displayGenericError("Authentication error. Please log in again.", 'genericUsernameError');
                    closeChooseUsernameModal(); // Close this modal
                    // Might want to open login modal here: openModal(); switchToLoginTab();
                }
            } else {
                 console.log("Choose username form validation failed.");
            }
        });
    } else {
         console.warn("Save Username button not found.");
    }


     // --- Optional: Add Auth State Observer ---
    // import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    // onAuthStateChanged(auth, (user) => { /* ... keep existing logic ... */ });


} catch (error) {
    console.error("Error initializing Firebase or setting up script:", error);
    alert("Error initializing application. Please try refreshing the page.");
    if(signInBtn) signInBtn.disabled = true;
}
