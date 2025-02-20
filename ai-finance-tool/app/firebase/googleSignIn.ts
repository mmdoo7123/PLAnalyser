import { FirebaseError } from "firebase/app";
import { NavigateFunction } from "react-router-dom";
import { signInWithPopup, signInWithRedirect } from "firebase/auth";
import { auth, googleAuthProvider, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { generateFirebaseAuthErrorMessage } from "./ErrorHandler";
import { RoutesEnum } from "./routes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export const signInUserWithGoogle = async (navigate: NavigateFunction) => {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);

    if (!result?.user) throw new Error("No user found");
    const user = result.user;

    // Save user data to Firestore (optional)
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    });

    navigate(RoutesEnum.Account);
    toast.success(`Welcome ${user.displayName}!`); // Replace with your UI feedback
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, googleAuthProvider);
        return;
      }
      toast.error(generateFirebaseAuthErrorMessage(error)); // Better error feedback
    }
    console.error("Sign-in error:", error);
  }
};