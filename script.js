// Import Firebase modules directly
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"; // Use compatible versions
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration (Provided by you)
const firebaseConfig = {
  apiKey: "AIzaSyB4shH6owP4rwuYTwEIcRjaZRJh5p6b_6s", // Using your key
  authDomain: "apexgames-a5903.firebaseapp.com",
  projectId: "apexgames-a5903",
  storageBucket: "apexgames-a5903.appspot.com", // Corrected key name from firebasestorage.app
  messagingSenderId: "927388647652",
  appId: "1:927388647652:web:f065997c4969510b056cf1",
  measurementId: "G-B5GKRLC8X7"
};

// Initialize Firebase
try {
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app); // Initialize Analytics
    const auth = getAuth(app);         // Initialize Auth

    // --- Get HTML Elements ---
    const signInModal = document.getElementById('signInModal');
    const signInBtn = document.getElementById('signInBtn');
    const closeModalBtn = signInModal ? signInModal.querySelector('.close-modal') : null;
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');

    // Forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Form Inputs (Signup) - Check if they exist before use
    const signupUsername = document.getElementById('signupUsername');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const signupPasswordRepeat = document.getElementById('signupPasswordRepeat');

    // Form Inputs (Login) - Check if they exist before use
    const loginIdentifier = document.getElementById('loginIdentifier');
    const loginPassword = document.getElementById('loginPassword');

    // Other Modal Elements
    const loginSwitchBtns = document.querySelectorAll('.login-switch-btn');
    const signupSwitchBtns = document.querySelectorAll('.signup-switch-btn');
    const passwordToggles = document.querySelectorAll('.toggle-password i');

    // Generic Error display - Optional: Add <span id="genericAuthError" class="error-message visible"></span> inside modal-content but outside forms
    const genericErrorElement = document.getElementById('genericAuthError');


    // --- Modal Visibility Functions ---
    function openModal() {
        if (signInModal) {
            signInModal.style.display = 'flex';
            switchToSignupTab(); // Default to signup
            clearAllErrors(); // Clear any previous errors when opening
            clearGenericError();
        }
    }

    function closeModal() {
        if (signInModal) {
            signInModal.style.display = 'none';
        }
    }

    // --- Tab Switching Functions ---
    function switchToLoginTab() {
        if (!loginTab || !signupTab || !loginForm || !signupForm) return;
        loginTab.classList.add('active-tab');
        signupTab.classList.remove('active-tab');
        loginForm.classList.remove('hidden-form');
        signupForm.classList.add('hidden-form');
        clearAllErrors(); // Clear errors when switching tabs
        clearGenericError();
    }

    function switchToSignupTab() {
        if (!loginTab || !signupTab || !loginForm || !signupForm) return;
        signupTab.classList.add('active-tab');
        loginTab.classList.remove('active-tab');
        signupForm.classList.remove('hidden-form');
        loginForm.classList.add('hidden-form');
        clearAllErrors(); // Clear errors when switching tabs
        clearGenericError();
    }

    // --- Password Visibility Toggle ---
    function togglePasswordVisibility(event) {
        const wrapper = event.target.closest('.input-wrapper');
        if (!wrapper) return;
        const passwordInput = wrapper.querySelector('input[type="password"], input[type="text"]');
        const icon = event.target;

        if (passwordInput && icon) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    }

    // --- Error Handling Helpers ---
    function displayGenericError(message) {
        if (genericErrorElement) {
            genericErrorElement.textContent = message;
            genericErrorElement.classList.add('visible');
        } else {
            alert(message); // Fallback
        }
    }

    function clearGenericError() {
        if (genericErrorElement) {
             genericErrorElement.classList.remove('visible');
             genericErrorElement.textContent = '';
        }
    }

    // Map Firebase error codes to user-friendly messages
    function mapFirebaseAuthError(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
                return 'Incorrect email or password.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/email-already-in-use':
                return 'This email address is already registered.';
            case 'auth/weak-password':
                return 'Password is too weak (must be at least 6 characters).';
            case 'auth/operation-not-allowed':
                return 'Email/Password sign-in is not enabled in Firebase.';
            case 'auth/missing-password':
                 return 'Password is required.';
            default:
                console.error("Firebase Auth Error Code:", errorCode);
                return 'An unexpected error occurred. Please try again.';
        }
    }

    // --- Validation Helper Functions ---
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    function displayError(inputId, message) {
        const inputElement = document.getElementById(inputId);
        const errorElement = document.getElementById(inputId + 'Error');
        if (inputElement && errorElement) {
            inputElement.classList.add('invalid');
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        } else {
            console.warn(`Could not find input or error element for ID: ${inputId}`);
        }
    }
    function clearError(inputId) {
        const inputElement = document.getElementById(inputId);
        const errorElement = document.getElementById(inputId + 'Error');
        if (inputElement && errorElement) {
            inputElement.classList.remove('invalid');
             errorElement.classList.remove('visible');
        }
    }
    function clearAllErrors() {
        const errorMessages = document.querySelectorAll('#signInModal .error-message');
        const invalidInputs = document.querySelectorAll('#signInModal input.invalid');
        errorMessages.forEach(span => {
             span.classList.remove('visible');
        });
        invalidInputs.forEach(input => input.classList.remove('invalid'));
    }
    function validateSignupForm() {
        if (!signupUsername || !signupEmail || !signupPassword || !signupPasswordRepeat) { console.error("Signup form elements not found!"); return false; }
        clearAllErrors(); clearGenericError(); let isValid = true;
        const minPasswordLength = 6; // Firebase default minimum

        if (!signupUsername.value.trim()) { displayError('signupUsername', 'Username is required.'); isValid = false; }
        if (!signupEmail.value.trim()) { displayError('signupEmail', 'Email is required.'); isValid = false; } else if (!isValidEmail(signupEmail.value.trim())) { displayError('signupEmail', 'Please enter a valid email address.'); isValid = false; }
        if (!signupPassword.value) { displayError('signupPassword', 'Password is required.'); isValid = false; } else if (signupPassword.value.length < minPasswordLength) { displayError('signupPassword', `Password must be at least ${minPasswordLength} characters long.`); isValid = false; }
        if (!signupPasswordRepeat.value) { displayError('signupPasswordRepeat', 'Please repeat your password.'); isValid = false; } else if (signupPassword.value && signupPassword.value !== signupPasswordRepeat.value) { displayError('signupPasswordRepeat', 'Passwords do not match.'); isValid = false; }
        return isValid;
    }
    function validateLoginForm() {
        if (!loginIdentifier || !loginPassword) { console.error("Login form elements not found!"); return false; }
        clearAllErrors(); clearGenericError(); let isValid = true;
        if (!loginIdentifier.value.trim()) { displayError('loginIdentifier', 'Username or Email is required.'); isValid = false; }
        if (!loginPassword.value) { displayError('loginPassword', 'Password is required.'); isValid = false; }
        return isValid;
    }

    // --- Event Listeners Setup ---
    if (signInBtn) signInBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (signInModal) signInModal.addEventListener('click', (event) => { if (event.target === signInModal) closeModal(); });
    if (loginTab) loginTab.addEventListener('click', switchToLoginTab);
    if (signupTab) signupTab.addEventListener('click', switchToSignupTab);
    loginSwitchBtns.forEach(btn => btn.addEventListener('click', switchToLoginTab));
    signupSwitchBtns.forEach(btn => btn.addEventListener('click', switchToSignupTab));
    passwordToggles.forEach(icon => {
        const parentSpan = icon.closest('.toggle-password');
        if (parentSpan) {
             parentSpan.style.cursor = 'pointer'; parentSpan.setAttribute('tabindex', '0');
             icon.addEventListener('click', togglePasswordVisibility);
             parentSpan.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); togglePasswordVisibility({ target: icon }); } });
        }
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && signInModal && signInModal.style.display === 'flex') closeModal(); });
    [signupUsername, signupEmail, signupPassword, signupPasswordRepeat, loginIdentifier, loginPassword].forEach(input => { if (input) { input.addEventListener('input', () => { if (document.getElementById(input.id + 'Error')) clearError(input.id); }); } });


    // --- MODIFIED Form Submit Event Listeners ---
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            clearGenericError();

            if (validateSignupForm()) {
                const email = signupEmail.value;
                const password = signupPassword.value;

                console.log('Attempting Firebase signup...');
                // Call Firebase Auth function
                createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        // Signed up successfully
                        const user = userCredential.user;
                        console.log('Signup successful:', user);
                        alert('Account created successfully! You can now log in.');
                        switchToLoginTab();
                        signupForm.reset();
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = mapFirebaseAuthError(errorCode);
                        console.error('Signup failed:', errorCode, error.message);
                        displayGenericError(`Signup failed: ${errorMessage}`);
                        if (errorCode === 'auth/email-already-in-use') {
                            displayError('signupEmail', errorMessage);
                        } else if (errorCode === 'auth/weak-password') {
                            displayError('signupPassword', errorMessage);
                        }
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
            clearGenericError();

            if (validateLoginForm()) {
                const email = loginIdentifier.value; // Assuming identifier is email
                const password = loginPassword.value;

                console.log('Attempting Firebase login...');
                // Call Firebase Auth function
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        // Signed in successfully
                        const user = userCredential.user;
                        console.log('Login successful:', user);
                        alert('Login successful!');
                        closeModal();
                        loginForm.reset();
                        // Add code here to update UI for logged-in state
                        // e.g., changeSignInButtonToSignOut();
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = mapFirebaseAuthError(errorCode);
                        console.error('Login failed:', errorCode, error.message);
                        displayGenericError(`Login failed: ${errorMessage}`);
                    });
            } else {
                console.log('Client-side login form validation failed.');
            }
        });
    } else {
        console.warn("Login form element not found.");
    }

     // --- Optional: Add Auth State Observer ---
    // import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    // onAuthStateChanged(auth, (user) => {
    //   if (user) {
    //     console.log("User is signed in:", user.email);
    //     if (signInBtn) {
    //          signInBtn.textContent = 'Sign Out';
    //          // IMPORTANT: Remove previous listener before adding new one
    //          signInBtn.removeEventListener('click', openModal); 
    //          signInBtn.onclick = () => { // Simple way to add/replace handler
    //             signOut(auth).then(() => {
    //                 console.log("Sign out successful");
    //                 // State change will trigger the 'else' block below
    //             }).catch((error) => {
    //                 console.error("Sign out error", error);
    //                 alert("Error signing out.");
    //             });
    //          }; 
    //     }
    //   } else {
    //     console.log("User is signed out");
    //     if (signInBtn) {
    //          signInBtn.textContent = 'Sign In';
    //          // IMPORTANT: Remove potential sign out listener before adding original one
    //          signInBtn.onclick = null; // Clear previous onclick if set
    //          signInBtn.removeEventListener('click', openModal); // Ensure no duplicates
    //          signInBtn.addEventListener('click', openModal); 
    //     }
    //   }
    // });


} catch (error) {
    console.error("Error initializing Firebase or setting up script:", error);
    // Display a user-friendly message if Firebase initialization fails
    // Maybe disable the Sign In button or show a general error on the page
}