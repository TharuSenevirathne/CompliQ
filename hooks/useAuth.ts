import { AuthContext } from "@/contexts/AuthContext"
import { useContext } from "react"

// Custom hook to access auth context easily
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}