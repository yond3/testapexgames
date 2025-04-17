// Import Firebase modules directly
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js"; // Can remove if only used on dashboard
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail // <-- Step 1: Import added here
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
    const forgotPasswordLink = document.querySelector('.forgot-password'); // <-- Step 2: Reference added

    // Choose Username Modal
    const chooseUsernameModal = document.getElementById('chooseUsernameModal');
    const chooseUsernameInput = document.getElementById('chooseUsernameInput');
    const saveUsernameBtn = document.getElementById('saveUsernameBtn');
    const chooseUsernameErrorElement = document.getElementById('chooseUsernameError');
    const genericUsernameErrorElement = document.getElementById('genericUsernameError');


    // --- Modal Visibility Functions ---
    function openModal() { /* ... keep existing ... */ }
    function closeModal() { /* ... keep existing ... */ }
    function openChooseUsernameModal() { /* ... keep existing ... */ }
    function closeChooseUsernameModal() { /* ... keep existing ... */ }

    // --- Tab Switching Functions ---
    function switchToLoginTab() { /* ... keep existing ... */ }
    function switchToSignupTab() { /* ... keep existing ... */ }

    // --- Password Visibility Toggle ---
    function togglePasswordVisibility(event) { /* ... keep existing ... */ }

    // --- Error Handling Helpers ---
    function displayGenericError(message, errorElementId = 'genericAuthError') { /* ... keep existing ... */ }
    function clearGenericError(errorElementId = 'genericAuthError') { /* ... keep existing ... */ }
    function mapFirebaseAuthError(errorCode) { /* ... keep existing ... */ }

    // --- Validation Helper Functions ---
    function isValidEmail(email) { /* ... keep existing ... */ }
    function displayError(inputId, message) { /* ... keep existing ... */ }
    function clearError(inputId) { /* ... keep existing ... */ }
    function clearAllErrors() { /* ... keep existing ... */ }
    function validateSignupForm() { /* ... keep existing ... */ }
    function validateLoginForm() { /* ... keep existing ... */ }
    function validateUsernameForm() { /* ... keep existing ... */ }

    // --- Step 4: Add Forgot Password Function ---
    function handleForgotPassword() {
        const email = window.prompt("Please enter the email address for your account:");

        // Clear previous generic errors in the auth modal
        clearGenericError('genericAuthError');

        if (!email || !email.trim()) {
            // User cancelled or entered nothing
            console.log("Password reset cancelled or no email entered.");
            return; // Exit the function
        }

        const trimmedEmail = email.trim();

        if (!isValidEmail(trimmedEmail)) {
            // Use the generic error display inside the modal
            displayGenericError("Please enter a valid email address.", 'genericAuthError');
            return; // Exit if email is invalid
        }

        console.log(`Attempting to send password reset email to: ${trimmedEmail}`);
        displayGenericError('Sending reset email...', 'genericAuthError'); // Indicate processing

        // Call Firebase function
        sendPasswordResetEmail(auth, trimmedEmail)
            .then(() => {
                // Password reset email sent (or did not need to be sent)
                console.log("Password reset email processing initiated.");
                // Display success message using the generic display area
                displayGenericError(`If an account exists for ${trimmedEmail}, a password reset link has been sent. Please check your inbox (and spam folder).`, 'genericAuthError');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = mapFirebaseAuthError(errorCode); // Reuse existing error mapping
                console.error("Password reset failed:", errorCode, error.message);
                // Display error using the generic display area
                displayGenericError(`Error sending reset email: ${errorMessage}`, 'genericAuthError');
            });
    }
    // --- End Forgot Password Function ---


    // --- Event Listeners Setup ---
    if (signInBtn) signInBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (signInModal) signInModal.addEventListener('click', (event) => { if (event.target === signInModal) closeModal(); });
    if (loginTab) loginTab.addEventListener('click', switchToLoginTab);
    if (signupTab) signupTab.addEventListener('click', switchToSignupTab);
    loginSwitchBtns.forEach(btn => btn.addEventListener('click', switchToLoginTab));
    signupSwitchBtns.forEach(btn => btn.addEventListener('click', switchToSignupTab));
    passwordToggles.forEach(icon => { /* ... keep existing ... */ });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { if (signInModal && signInModal.style.display === 'flex') closeModal(); if (chooseUsernameModal && chooseUsernameModal.style.display === 'flex') closeChooseUsernameModal(); } });
    [signupUsername, signupEmail, signupPassword, signupPasswordRepeat, loginIdentifier, loginPassword, chooseUsernameInput].forEach(input => { if (input) { input.addEventListener('input', () => { if (document.getElementById(input.id + 'Error')) clearError(input.id); }); } });

    // --- Step 3: Add Forgot Password Listener ---
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault(); // Stop link from navigating to #
            handleForgotPassword();
        });
    }
    // --- End Add Forgot Password Listener ---


    // --- Form Submit Handlers (Auth & Firestore) ---
    if (signupForm) { /* ... keep existing signup logic ... */ } else { console.warn("Signup form element not found."); }
    if (loginForm) { /* ... keep existing login logic ... */ } else { console.warn("Login form element not found."); }

    // --- Save Username Button Listener ---
    if (saveUsernameBtn) { /* ... keep existing save username logic ... */ } else if (document.getElementById('chooseUsernameModal')) { console.warn("Save Username button not found, although choose username modal exists."); }


} catch (error) {
    console.error("Error initializing Firebase or setting up script:", error);
    alert("Error initializing application. Please try refreshing the page.");
    if(signInBtn) signInBtn.disabled = true;
}
