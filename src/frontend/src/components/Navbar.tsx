import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Settings, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAboutContent } from "../hooks/useQueries";

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
  const { data: about } = useAboutContent();

  const architectName = about?.name || "Landcube Studio";

  const navLinks = [
    { label: "Projects", href: "#projects" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  // Sliding pill state
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Update pill position when active changes
  useEffect(() => {
    if (activeIndex === null) return;
    const el = linkRefs.current[activeIndex];
    const nav = navRef.current;
    if (!el || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setPillStyle({
      left: elRect.left - navRect.left - 12,
      width: elRect.width + 24,
      opacity: 1,
    });
  }, [activeIndex]);

  // Detect which section is in view
  useEffect(() => {
    if (currentView !== "home") return;
    const sectionIds = ["projects", "services", "about", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = sectionIds.indexOf(entry.target.id);
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { threshold: 0.3 },
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [currentView]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      sessionStorage.removeItem("adminAccess");
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message === "User is already authenticated"
        ) {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          data-ocid="nav.link"
          onClick={() => {
            onNavigate("home");
            setMobileOpen(false);
          }}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <img
            src="/assets/uploads/IMG_4763-1.jpeg"
            alt="Landcube Studio"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="font-display text-lg font-medium tracking-wide text-foreground">
            {architectName}
          </span>
        </button>

        {/* Desktop nav with sliding pill */}
        <nav
          ref={navRef}
          className="hidden md:flex items-center gap-1 relative"
        >
          {/* Sliding pill indicator */}
          {currentView === "home" && (
            <span
              className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full bg-foreground/10 pointer-events-none"
              style={{
                left: pillStyle.left,
                width: pillStyle.width,
                opacity: pillStyle.opacity,
                transition:
                  "left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s",
              }}
            />
          )}

          {currentView === "home" &&
            navLinks.map((link, i) => (
              <a
                key={link.label}
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                data-ocid="nav.link"
                href={link.href}
                onClick={() => setActiveIndex(i)}
                className={`relative z-10 px-4 py-1.5 text-sm font-medium tracking-wide uppercase transition-colors ${
                  activeIndex === i
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </a>
            ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated && (
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
              {currentView === "admin" ? "Portfolio" : "Admin"}
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

        {/* Mobile: login button + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && (
            <Button
              data-ocid="nav.secondary_button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onNavigate(currentView === "admin" ? "home" : "admin");
                setMobileOpen(false);
              }}
              className="gap-1 text-muted-foreground hover:text-foreground px-2 text-xs font-medium tracking-wide uppercase"
            >
              <Settings className="h-4 w-4" />
              {currentView === "admin" ? "Portfolio" : "Admin"}
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-background border-t border-border px-6 py-6 flex flex-col gap-6"
          >
            {currentView === "home" &&
              navLinks.map((link, i) => (
                <a
                  key={link.label}
                  data-ocid="nav.link"
                  href={link.href}
                  onClick={() => {
                    setActiveIndex(i);
                    setMobileOpen(false);
                  }}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors ${
                    activeIndex === i
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </a>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
