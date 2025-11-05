import { Outlet, useLocation } from "react-router-dom";
import HeaderComponent from "../components/Header/Header";
import FooterComponent from "../components/Footer/Footer";
import "react-toastify/dist/ReactToastify.css";
import React, { createContext, useState, useEffect } from "react";
import { ScrollspyContext, AuthProvider } from "../context/ScrollspyContext";
import PageTransitionOverlay from '../components/PageTransition/PageTransitionOverlay';
import Preloader from '../components/PageTransition/Preloader';

export const LoginVersionContext = createContext();

function RootLayout() {
  const [loginVersion, setLoginVersion] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const [showPreloader, setShowPreloader] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!window.__hasLoadedOnce) {
      setShowPreloader(true);
      window.__hasLoadedOnce = true;
    }
  }, []);

  React.useEffect(() => {
    if (!['/', '/home', '/landing'].includes(location.pathname)) {
      setActiveSection("");
    }
  }, [location.pathname]);

  return (
    <AuthProvider>
      <LoginVersionContext.Provider value={{ loginVersion, setLoginVersion }}>
        <ScrollspyContext.Provider value={{ activeSection, setActiveSection }}>
          <>
            {showPreloader && <Preloader onFinish={() => setShowPreloader(false)} />}
            <div className="min-h-screen flex flex-col">
              {!showPreloader && <PageTransitionOverlay />}
              <HeaderComponent />
              <main className={`flex-1 ${location.pathname === '/chat', '/wishlist', '/aboutus' ? '' : 'pt-2'}`}>
                {/* {location.pathname !== '/chat' && <AppBreadcrumb />} */}
                {location.pathname !== '/chat'}
                <Outlet />
              </main>
              {location.pathname !== '/chat' &&
                location.pathname !== '/post-item' &&
                location.pathname !== '/plans' &&
                location.pathname !== '/profile' &&
                location.pathname !== '/my-ads' &&
                location.pathname !== '/wishlist' && (
                  <div className="relative w-full">
                    <FooterComponent />
                  </div>
                )}

            </div>
          </>
        </ScrollspyContext.Provider>
      </LoginVersionContext.Provider>
    </AuthProvider>
  );
}

export default RootLayout;
