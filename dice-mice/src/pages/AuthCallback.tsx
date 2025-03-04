import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserDataProvider";

const AuthCallback = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleDiscordAuth = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get("code");

      if (!code) {
        console.error("No authorization code found.");
        navigate("/"); // Redirect to home if no code is found
        return;
      }

      try {
        // Exchange the Discord code for a Firebase token
        login(code)

        // Redirect to home page or dashboard
        navigate("/");
      } catch (error) {
        console.error("Error during authentication:", error);
        navigate("/"); // Redirect to home if error occurs
      }
    };

    handleDiscordAuth();
  }, [location, navigate]);

  return <div>Authenticating...</div>; // Show loading message
};

export default AuthCallback;
