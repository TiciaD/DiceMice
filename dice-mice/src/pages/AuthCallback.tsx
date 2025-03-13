import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLogin from "@/hooks/useLogin";

const AuthCallback = () => {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const code = urlParams.get("code");
  const { hasLoggedIn } = useLogin(code ?? '');

  useEffect(() => {
    if (hasLoggedIn) {
      navigate("/dashboard");
    }
  }, [hasLoggedIn, navigate]);

  if (!code) {
    console.error("No authorization code found.");
    navigate("/"); // Redirect to home if no code is found
    return <div>Error: No code</div>;
  }

  return <div>Authenticating...</div>; // Show loading message
};

export default AuthCallback;
