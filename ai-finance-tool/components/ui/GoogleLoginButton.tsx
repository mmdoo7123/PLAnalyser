import * as React from "react";
import { Button } from "@/components/ui/button"; 
import { Icons } from "@/components/icons";
import { authService } from "@/app/firebase/authService";

const GoogleLoginButton = () => {
    const [isLoading, setIsLoading] = React.useState(false);
  
    const handleGoogleSignIn = async () => {
      setIsLoading(true);
      try {
        await authService.signInWithGoogle(); // Use the new method
      } catch (error) {
        console.error("Error during sign-in:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <Button
        variant="outline"
        size="default"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Sign in with Google
      </Button>
    );
  };
  
  export default GoogleLoginButton;
  