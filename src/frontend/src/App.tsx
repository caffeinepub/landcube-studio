import { Toaster } from "@/components/ui/sonner";
import { Loader2, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useClaimAdmin,
  useGetCallerUserProfile,
  useIsAdmin,
} from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";

interface AdminAccessGuideProps {
  onSetupProfile?: () => void;
}

function AdminAccessGuide({ onSetupProfile }: AdminAccessGuideProps) {
  const { login, loginStatus, identity } = useInternetIdentity();
  const claimAdmin = useClaimAdmin();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsAdmin();
  const callerProfileQuery = useGetCallerUserProfile();
  const { data: userProfile, isFetched } = callerProfileQuery;
  const hasProfile =
    isAuthenticated &&
    isFetched &&
    userProfile !== null &&
    !callerProfileQuery.isError;

  const handleClaim = async () => {
    try {
      await claimAdmin.mutateAsync();
      toast.success(
        "Admin access granted! Click the Admin button in the navbar.",
      );
    } catch {
      toast.error("Could not claim admin access — an admin already exists.");
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch {}
  };

  if (isAdmin) {
    return (
      <div
        data-ocid="admin.panel"
        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-900 text-sm text-green-700 dark:text-green-400"
      >
        <ShieldCheck className="h-4 w-4" />
        <span>
          You have admin access. Use the <strong>Admin</strong> button in the
          top-right corner of the navbar to open the dashboard.
        </span>
      </div>
    );
  }

  return (
    <div
      data-ocid="admin.panel"
      className="border-b border-border bg-muted/40 px-4 py-4"
    >
      <div className="max-w-2xl mx-auto">
        <p className="text-sm font-semibold text-foreground mb-3">
          How to access the Admin Dashboard:
        </p>
        <ol className="flex flex-col sm:flex-row gap-3">
          {/* Step 1 */}
          <li
            className={`flex-1 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
              isAuthenticated
                ? "border-green-300 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300"
                : "border-border bg-background"
            }`}
          >
            <span
              className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                isAuthenticated
                  ? "bg-green-500 text-white"
                  : "bg-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {isAuthenticated ? "✓" : "1"}
            </span>
            <div>
              <p className="font-medium">
                {isAuthenticated ? "Logged in" : "Log in"}
              </p>
              {!isAuthenticated && (
                <button
                  type="button"
                  data-ocid="admin.primary_button"
                  onClick={handleLogin}
                  disabled={loginStatus === "logging-in"}
                  className="mt-1 flex items-center gap-1 text-xs text-primary underline underline-offset-2 hover:no-underline"
                >
                  {loginStatus === "logging-in" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <LogIn className="h-3 w-3" />
                  )}
                  Click here to login
                </button>
              )}
            </div>
          </li>

          {/* Step 2 */}
          <li
            className={`flex-1 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
              hasProfile
                ? "border-green-300 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300"
                : "border-border bg-background"
            }`}
          >
            <span
              className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                hasProfile
                  ? "bg-green-500 text-white"
                  : "bg-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {hasProfile ? "✓" : "2"}
            </span>
            <div>
              <p className="font-medium">
                {hasProfile ? "Profile set up" : "Complete profile setup"}
              </p>
              {isAuthenticated && !hasProfile && (
                <button
                  type="button"
                  data-ocid="admin.secondary_button"
                  onClick={onSetupProfile}
                  className="mt-1 flex items-center gap-1 text-xs text-primary underline underline-offset-2 hover:no-underline"
                >
                  <UserPlus className="h-3 w-3" />
                  Set up your profile
                </button>
              )}
              {isAuthenticated && hasProfile && (
                <button
                  type="button"
                  data-ocid="admin.secondary_button"
                  onClick={onSetupProfile}
                  className="mt-1 flex items-center gap-1 text-xs text-primary underline underline-offset-2 hover:no-underline"
                >
                  <UserPlus className="h-3 w-3" />
                  Update profile
                </button>
              )}
              {!isAuthenticated && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Login first, then set up your profile.
                </p>
              )}
            </div>
          </li>

          {/* Step 3 */}
          <li className="flex-1 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm border-border bg-background">
            <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-muted-foreground/30 text-muted-foreground">
              3
            </span>
            <div>
              <p className="font-medium">Claim Admin Access</p>
              {hasProfile && (
                <button
                  type="button"
                  data-ocid="admin.confirm_button"
                  onClick={handleClaim}
                  disabled={claimAdmin.isPending}
                  className="mt-1 flex items-center gap-1 text-xs bg-primary text-primary-foreground rounded px-2 py-0.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {claimAdmin.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-3 w-3" />
                  )}
                  Claim Admin Access
                </button>
              )}
              {!hasProfile && (
                <p className="mt-1 text-xs text-muted-foreground">
                  After step 2, click the Claim Admin button that appears here.
                </p>
              )}
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<"home" | "admin">("home");
  const [showAdminGuide, setShowAdminGuide] = useState(false);
  const [forceProfileSetup, setForceProfileSetup] = useState(false);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const callerProfileQuery = useGetCallerUserProfile();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = callerProfileQuery;

  // Show profile setup if forced (via Step 2 button) OR if authenticated and no profile exists
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
      <Navbar
        currentView={view}
        onNavigate={setView}
        onShowAdminGuide={() => setShowAdminGuide((v) => !v)}
      />
      {showAdminGuide && (
        <AdminAccessGuide onSetupProfile={() => setForceProfileSetup(true)} />
      )}
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
