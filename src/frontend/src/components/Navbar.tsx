import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAboutContent, useIsAdmin } from "../hooks/useQueries";

interface NavbarProps {
  currentView: "home" | "admin";
  onNavigate: (view: "home" | "admin") => void;
  showAdminLogin: boolean;
  onAdminLoginShown: () => void;
}

export default function Navbar({ currentView, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsAdmin();
  const { data: about } = useAboutContent();

  const architectName = about?.name || "Landcube Studio";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      sessionStorage.removeItem("adminAccess");
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
          onClick={() => {
            onNavigate("home");
            setMobileOpen(false);
          }}
          className="font-display text-lg font-medium tracking-wide transition-colors text-foreground hover:text-accent"
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

        {/* Desktop Actions */}
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
        </div>

        {/* Mobile: Login button always visible + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {isAdmin && (
            <Button
              data-ocid="nav.secondary_button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onNavigate(currentView === "admin" ? "home" : "admin");
                setMobileOpen(false);
              }}
              className="gap-1 text-muted-foreground hover:text-foreground px-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button
            data-ocid="nav.primary_button"
            variant={isAuthenticated ? "outline" : "default"}
            size="sm"
            onClick={handleAuth}
            disabled={loginStatus === "logging-in"}
            className="text-xs tracking-widest uppercase font-medium"
          >
            {loginStatus === "logging-in"
              ? "..."
              : isAuthenticated
                ? "Logout"
                : "Login"}
          </Button>
          <button
            type="button"
            className="p-2 text-foreground"
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
        </div>
      )}
    </header>
  );
}
