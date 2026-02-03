import { useLoader } from "@/hooks/useLoader"
import { auth } from "@/services/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

// Define the shape of the AuthContext
interface AuthContextType {
  user: User | null
  loading: boolean
}

// Create the AuthContext with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false
})

// AuthProvider component to wrap the app and provide auth state
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { showLoader, hideLoader, isLoading } = useLoader()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    showLoader()
    const unsucribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr)
      hideLoader()
    })

    return () => unsucribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  )

}