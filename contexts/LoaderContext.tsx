import React, { createContext, useState, ReactNode } from "react"
import { View, ActivityIndicator } from "react-native"

// Define the shape of the LoaderContext
interface LoaderContextProps {
  showLoader: () => void
  hideLoader: () => void
  isLoading: boolean
}

// Create the LoaderContext with default values
export const LoaderContext = createContext<LoaderContextProps>({
  showLoader: () => {},
  hideLoader: () => {},
  isLoading: false
})

// LoaderProvider component to wrap the app and provide loader state
export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false)

  const showLoader = () => setIsLoading(true)
  const hideLoader = () => setIsLoading(false)

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      {children}

      {isLoading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black/30">
          <View className="bg-white p-6 rounded-2xl shadow-lg">
            <ActivityIndicator size="large" color="#1e40af" />
          </View>
        </View>
      )}
    </LoaderContext.Provider>
  )
}
