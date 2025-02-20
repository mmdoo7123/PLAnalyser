import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  UserCredential,
  AuthError,
  Auth,
} from "firebase/auth";
import { auth } from "./firebase";

class AuthService {
  private auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  // Register a new user
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<void> {
    try {
      // 1. Create user in Firebase Authentication (client-side)
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // 2. Send email verification
      await sendEmailVerification(userCredential.user);
      alert(
        `A verification email has been sent to ${email}. Please verify your email to log in.`
      );

      // 3. Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 4. Save user data to backend (FastAPI)
      await this.saveUserToBackend(idToken, displayName);
    } catch (error) {
      this.handleError(error as AuthError);
    }
  }

  // Login an existing user
  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        alert("Please verify your email to log in.");
        return;
      }

      // Optionally, fetch user data from backend
      await this.fetchUserData();
    } catch (error) {
      this.handleError(error as AuthError);
    }
  }

  // Save user data to backend (FastAPI)
  private async saveUserToBackend(
    idToken: string,
    displayName: string
  ): Promise<void> {
    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_token: idToken, // Send the Firebase ID token
          display_name: displayName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save user data to backend.");
      }
    } catch (error) {
      console.error("Backend save error:", error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  }

  // Fetch user data from backend (FastAPI)
  private async fetchUserData(): Promise<void> {
    try {
      const idToken = await this.auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("User is not authenticated.");
      }

      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data from backend.");
      }

      const userData = await response.json();
      console.log("User data:", userData);
    } catch (error) {
      console.error("Backend fetch error:", error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  }

  // Handle Firebase authentication errors
  private handleError(error: AuthError): void {
    let errorMessage = "An error occurred. Please try again.";
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email is already in use.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/weak-password":
        errorMessage = "Password is too weak.";
        break;
      case "auth/user-not-found":
        errorMessage = "User not found.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password.";
        break;
    }
    alert(errorMessage);
    console.error(error);
  }
}

// Export an instance of the AuthService
export const authService = new AuthService(auth);