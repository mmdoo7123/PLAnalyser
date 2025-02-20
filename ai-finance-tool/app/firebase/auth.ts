// auth.ts
import { FirebaseError } from "firebase/app";
import { signInWithPopup } from "firebase/auth";
import { NavigateFunction } from "react-router-dom";
import { generateFirebaseAuthErrorMessage } from "./ErrorHandler";
import { auth, googleAuthProvider } from "./firebase";
import { RoutesEnum } from "./routes";
import { toast } from "react-toastify";

export const signInUserWithGoogle = async (navigate: NavigateFunction) => {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    if (!result || !result.user) {
      throw new Error("No user found");
    }
    const user = result.user;
    console.log(user);
    navigate(RoutesEnum.Account);
    toast.success(`Welcome ${user.displayName}!`); // Use toast
  } catch (error) {
    if (error instanceof FirebaseError) {
      toast.error(generateFirebaseAuthErrorMessage(error)); // Use toast for errors
    }
    console.error(error);
  }
};