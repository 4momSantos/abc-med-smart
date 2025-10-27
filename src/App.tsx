import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import ImportPage from "./pages/ImportPage";
import VisualizationsPage from "./pages/VisualizationsPage";
import SearchPage from "./pages/SearchPage";
import MLPage from "./pages/MLPage";
import StatisticsPage from "./pages/StatisticsPage";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";
import SavedDataPage from "./pages/SavedDataPage";
import HelpPage from "./pages/HelpPage";
import FieldsDocPage from "./pages/FieldsDocPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useSettingsStore } from "./store/settingsStore";
import { applyVisualPreferences } from "./lib/themeUtils";

const queryClient = new QueryClient();

const AppContent = () => {
  const visualPreferences = useSettingsStore((state) => state.visualPreferences);

  useEffect(() => {
    applyVisualPreferences(visualPreferences);
  }, [visualPreferences]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="import" element={<ProtectedRoute requiredRole="manager"><ImportPage /></ProtectedRoute>} />
            <Route path="visualizations" element={<VisualizationsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="ml" element={<MLPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="settings" element={<ProtectedRoute requiredRole="admin"><SettingsPage /></ProtectedRoute>} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="saved-data" element={<SavedDataPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="fields-doc" element={<FieldsDocPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
