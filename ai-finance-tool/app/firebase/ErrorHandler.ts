// ErrorHandler.ts
import { FirebaseError } from "firebase/app";

export const generateFirebaseAuthErrorMessage = (error: FirebaseError): string => {
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
    case "auth/popup-blocked":
      errorMessage = "Popup blocked by the browser. Please allow popups and try again.";
      break;
    case "auth/popup-closed-by-user":
      errorMessage = "Popup closed by the user. Please try again.";
      break;
    // Add more error cases as needed
  }
  return errorMessage;
};