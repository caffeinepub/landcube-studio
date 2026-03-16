import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";

export default function App() {
  const [view, setView] = useState<"home" | "admin">("home");
  const [forceProfileSetup, setForceProfileSetup] = useState(false);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const callerProfileQuery = useGetCallerUserProfile();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = callerProfileQuery;

  // Show profile setup if forced OR if authenticated and no profile exists
  const showProfileSetup =
    forceProfileSetup ||
    (isAuthenticated &&
      !profileLoading &&
      isFetched &&
      (userProfile === null || callerProfileQuery.isError));

  const handleProfileComplete = () => {
    setForceProfileSetup(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar currentView={view} onNavigate={setView} />
      <main className="flex-1">
        {view === "home" ? (
          <HomePage />
        ) : (
          <AdminPage onBack={() => setView("home")} />
        )}
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetup onComplete={handleProfileComplete} />}
      <Toaster />
    </div>
  );
}
