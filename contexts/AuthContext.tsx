import { useLoader } from "@/hooks/useLoader"
import { auth } from "@/services/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

// Define the shape of our AuthContext
interface AuthContextType {
  user: User | null
  loading: boolean          
  initializing: boolean     
}

// Default context value (good practice)
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  initializing: true,
})


// AuthProvider component that wraps the app and provides auth state
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { showLoader, hideLoader, isLoading } = useLoader()
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    console.log("AuthProvider → Starting auth setup")

    showLoader()

    // Immediately check current user (critical for web/redirect/refresh)
    const currentUser = auth.currentUser
    if (currentUser) {
      console.log("Immediate currentUser found →", currentUser.email, currentUser.uid)
      setUser(currentUser)
      setInitializing(false)
      hideLoader()
    }

    // Set up listener for future changes
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      console.log(
        "onAuthStateChanged FIRED →",
        usr ? `${usr.email} (${usr.uid})` : "null"
      )

      setUser(usr)

      // Only set false + hide loader once (first real response)
      if (initializing) {
        setInitializing(false)
        hideLoader()
      }
    })

    // Clean up subscription on unmount
    return () => {
      console.log("AuthProvider → Cleaning up")
      unsubscribe()
    }
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const value: AuthContextType = {
    user,
    loading: isLoading,
    initializing,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}