// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
    getAuth,
    onAuthStateChanged, // Monitors login status
    signOut          // Function for logging out
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc       // Function to retrieve a document
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Firebase Configuration ---
// (Should be the same config as in script.js)
const firebaseConfig = {
  apiKey: "AIzaSyB4shH6owP4rwuYTwEIcRjaZRJh5p6b_6s",
  authDomain: "apexgames-a5903.firebaseapp.com",
  projectId: "apexgames-a5903",
  storageBucket: "apexgames-a5903.appspot.com",
  messagingSenderId: "927388647652",
  appId: "1:927388647652:web:f065997c4969510b056cf1",
  measurementId: "G-B5GKRLC8X7"
};

// --- Initialize Firebase ---
try {
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app); // Initialize Analytics if needed on dashboard
    const auth = getAuth(app);
    const db = getFirestore(app);

    // --- Get Dashboard Elements ---
    // Header elements
    const headerUsername = document.getElementById('headerUsername');
    const headerUserValue = document.getElementById('headerUserValue'); // Assuming this shows Coins?
    const logoutBtn = document.getElementById('logoutBtn'); // The 'X' icon in dashboard header

    // User card elements
    const cardUsername = document.getElementById('cardUsername');
    const accIdElement = document.getElementById('accId');
    const matchInfoElement = document.getElementById('matchInfo');
    const coinInfoElement = document.getElementById('coinInfo');
    const lostInfoElement = document.getElementById('lostInfo');
    const coinstreakInfoElement = document.getElementById('coinstreakInfo');
    const userAvatarImage = document.querySelector('.user-avatar img'); // To potentially update avatar

    // Leaderboard elements
    const leaderboardTabsContainer = document.querySelector('.leaderboard-tabs');


    // --- Function to Fetch and Display User Profile ---
    async function loadUserProfile(uid) {
        if (!uid) { console.error("No UID provided to loadUserProfile"); return; }
        console.log(`Loading profile for UID: ${uid}`);
        const userDocRef = doc(db, "users", uid);

        try {
            const docSnap = await getDoc(userDocRef);
            let username = 'User'; // Default
            let coins = 0; // Default

            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log("User data from Firestore:", userData);
                username = userData.username || username;
                coins = userData.coins || coins;

                // Update User Card
                if (cardUsername) cardUsername.textContent = username;
                if (accIdElement) accIdElement.textContent = uid.substring(0, 8).toUpperCase() || 'N/A';
                if (matchInfoElement) matchInfoElement.textContent = userData.matchesPlayed || 'N/A';
                if (coinInfoElement) coinInfoElement.textContent = coins;
                if (lostInfoElement) lostInfoElement.textContent = userData.matchesLost || 'N/A';
                if (coinstreakInfoElement) coinstreakInfoElement.textContent = userData.coinStreak || 'N/A';
                if (userAvatarImage && userData.avatarUrl) userAvatarImage.src = userData.avatarUrl; // Update avatar if URL exists

            } else {
                console.warn(`No profile document found for UID: ${uid}. Displaying defaults.`);
                 if (cardUsername) cardUsername.textContent = username;
                 if (accIdElement) accIdElement.textContent = uid.substring(0, 8).toUpperCase() || 'N/A';
                 if (coinInfoElement) coinInfoElement.textContent = coins;
            }

             // Update Header (common to dashboard)
            if (headerUsername) headerUsername.textContent = username;
            if (headerUserValue) headerUserValue.textContent = coins;

        } catch (error) {
            console.error("Error fetching user profile from Firestore:", error);
            if (headerUsername) headerUsername.textContent = 'Error';
            if (cardUsername) cardUsername.textContent = 'Error';
            if (accIdElement) accIdElement.textContent = 'Error';
        }
    }

    // --- Logout Function ---
    function handleLogout() {
        signOut(auth).then(() => {
            console.log("User signed out successfully.");
            // Redirect happens via onAuthStateChanged below
        }).catch((error) => {
            console.error("Sign out error:", error);
            alert("Error signing out. Please try again.");
        });
    }

    // --- Authentication State Observer (for Dashboard Page) ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, load their profile
            console.log("Dashboard: User is logged in:", user.uid);
            loadUserProfile(user.uid);

            // Setup logout button listener
            if (logoutBtn) {
                 logoutBtn.removeEventListener('click', handleLogout); // Prevent duplicates
                 logoutBtn.addEventListener('click', handleLogout);
            } else {
                console.warn("Logout button not found on dashboard.");
            }

        } else {
            // User is signed out, redirect away from dashboard
            console.log("Dashboard: No user logged in, redirecting to index.html");
            window.location.replace('/index.html');
        }
    });

    // --- Optional: Leaderboard Tab Logic ---
    if (leaderboardTabsContainer) { // Only add if tabs exist
        const leaderboardTabs = leaderboardTabsContainer.querySelectorAll('.tab-btn');
        leaderboardTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                leaderboardTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                console.log(`Switched to leaderboard tab: ${tab.textContent}`);
                // TODO: Add logic here to load corresponding leaderboard data
                // loadLeaderboardData(tab.textContent);
            });
        });
    }

} catch (error) {
    console.error("Error initializing Firebase or dashboard script:", error);
    alert("Error loading dashboard. Please try refreshing.");
    // Redirect if Firebase fails?
    // window.location.replace('/index.html');
}