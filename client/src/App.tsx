import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import NotesPage from "@/pages/notes-page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <PwaInstallPrompt />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
