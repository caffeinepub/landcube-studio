import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Settings, X } from "lucide-react";
import { useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAboutContent, useIsAdmin } from "../hooks/useQueries";

interface NavbarProps {
  currentView: "home" | "admin";
  onNavigate: (view: "home" | "admin") => void;
}

export default function Navbar({ currentView, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsAdmin();
  const { data: about } = useAboutContent();

  // Secret login: click logo 5 times quickly to reveal login button
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [secretLoginVisible, setSecretLoginVisible] = useState(false);

  const handleLogoClick = () => {
    onNavigate("home");
    setMobileOpen(false);

    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setSecretLoginVisible(true);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1500);
    }
  };

  const architectName = about?.name || "Landcube Studio";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      setSecretLoginVisible(false);
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  // Login button only visible to: the admin (to logout) or after secret gesture
  const showLoginButton = isAdmin || secretLoginVisible;

  const navLinks = [
    { label: "Projects", href: "#projects" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          data-ocid="nav.link"
          onClick={handleLogoClick}
          className="font-display text-lg font-medium tracking-wide text-foreground hover:text-accent transition-colors"
        >
          {architectName}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {currentView === "home" &&
            navLinks.map((link) => (
              <a
                key={link.label}
                data-ocid="nav.link"
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAdmin && (
            <Button
              data-ocid="nav.secondary_button"
              variant="ghost"
              size="sm"
              onClick={() =>
                onNavigate(currentView === "admin" ? "home" : "admin")
              }
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              {currentView === "admin" ? "View Site" : "Admin"}
            </Button>
          )}
          {showLoginButton && (
            <Button
              data-ocid="nav.primary_button"
              variant={isAuthenticated ? "outline" : "default"}
              size="sm"
              onClick={handleAuth}
              disabled={loginStatus === "logging-in"}
              className="text-xs tracking-widest uppercase font-medium"
            >
              {loginStatus === "logging-in"
                ? "Logging in..."
                : isAuthenticated
                  ? "Logout"
                  : "Login"}
            </Button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 py-6 flex flex-col gap-6">
          {currentView === "home" &&
            navLinks.map((link) => (
              <a
                key={link.label}
                data-ocid="nav.link"
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}
          {isAdmin && (
            <button
              type="button"
              data-ocid="nav.secondary_button"
              onClick={() => {
                onNavigate(currentView === "admin" ? "home" : "admin");
                setMobileOpen(false);
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground tracking-wide uppercase text-left"
            >
              {currentView === "admin" ? "View Site" : "Admin"}
            </button>
          )}
          {showLoginButton && (
            <Button
              data-ocid="nav.primary_button"
              variant={isAuthenticated ? "outline" : "default"}
              size="sm"
              onClick={handleAuth}
              disabled={loginStatus === "logging-in"}
              className="w-fit text-xs tracking-widest uppercase font-medium"
            >
              {loginStatus === "logging-in"
                ? "Logging in..."
                : isAuthenticated
                  ? "Logout"
                  : "Login"}
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
