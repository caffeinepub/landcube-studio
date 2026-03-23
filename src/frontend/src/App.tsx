import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import WhatsAppButton from "./components/WhatsAppButton";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";

export default function App() {
  const [view, setView] = useState<"home" | "admin">("home");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        currentView={view}
        onNavigate={setView}
        showAdminLogin={true}
        onAdminLoginShown={() => {}}
      />
      <main className="flex-1">
        {view === "home" ? (
          <HomePage />
        ) : (
          <AdminPage onBack={() => setView("home")} />
        )}
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster />
    </div>
  );
}
