import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCookies } from "react-cookie";
import api from "../api";

// Create a context for user state
const UserContext = createContext<any>(null);

interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [cookies] = useCookies(["access_token"]);

  // UseEffect to check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/check-auth", { withCredentials: true });  
        if (response.data && response.data.authenticated) {
          setUser({
            authenticated: true,
            username: response.data.username,
          });
        } else {
          console.log("User is not authenticated.");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null); // Set user to null in case of error
      }
    };
  
    checkAuth();
  }, [cookies]); // Dependencies to re-run the effect when cookies change
  

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access user context
export const useUser = () => useContext(UserContext);
