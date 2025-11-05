import { createContext, useContext, useState, useEffect } from "react";
import { tokenService, authService } from "../services";

export const ScrollspyContext = createContext({ activeSection: "hero", setActiveSection: () => {} });
export const useScrollspy = () => useContext(ScrollspyContext);

export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  userProfile: null,
  login: () => {},
  logout: () => {},
  updateUserProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Kiểm tra authentication status từ tokenService
    const checkAuthStatus = () => {
      const isAuthenticated = authService.isAuthenticated();
      const userInfo = tokenService.getUserInfo();
      
      if (isAuthenticated && userInfo) {
        setUser(userInfo.fullName || userInfo.username || "");
        setIsLoggedIn(true);
        setUserProfile(userInfo);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserProfile(null);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData) => {
    setUser(userData.fullName || userData.username || "");
    setIsLoggedIn(true);
    setUserProfile(userData);
  };

  const logout = async () => {
    try {
      // Gọi API logout
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state
      setIsLoggedIn(false);
      setUser(null);
      setUserProfile(null);
    }
  };

  const updateUserProfile = (profile) => {
    setUserProfile(profile);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      userProfile,
      login,
      logout,
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 