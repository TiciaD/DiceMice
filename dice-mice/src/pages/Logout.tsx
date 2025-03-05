import { useUser } from "@/context/UserDataProvider"
import { useEffect } from "react";

const Logout = () => {
  const { logout } = useUser();
  useEffect(() => {
    logout()
  }, [])

  return (
    <div>Logout</div>
  )
}

export default Logout