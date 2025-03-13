import { useUser } from "@/context/UserDataProvider";
import { useEffect, useState } from "react";

export default function useLogin(code: string) {
  const { login } = useUser();
  const [hasLoggedIn, setHasLoggedIn] = useState(false);

  useEffect(() => {
    if (!code || hasLoggedIn) return;

    setHasLoggedIn(true); // Set flag to prevent duplicate calls
    console.log("updated has logged in")
    login(code).catch(error => {
      console.error("Login failed:", error);
    });
  }, [code, login, hasLoggedIn]);

  return { hasLoggedIn };
}