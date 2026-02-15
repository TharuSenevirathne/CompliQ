import { LoaderContext } from "@/contexts/LoaderContext"
import { useContext } from "react"

// Custom hook to access loader context easily
export const useLoader = () => {
  const context = useContext(LoaderContext)
  if (!context) {
    throw new Error("UseLoader must be used withing a LoaderProvider...!")
  }
  return context
}