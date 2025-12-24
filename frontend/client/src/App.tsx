import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Auth } from "@/components/auth";
import { SettingsPanel } from "@/components/settings-panel";
import { SortingVisualizer } from "@/components/sorting-visualizer";
import { ThemeToggle } from "@/components/theme-toggle";
import type { UserSettings } from "@/lib/api";
import type { AlgorithmType } from "@/algorithms";

function App() {
  const [userId, setUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem("user_id");
    return stored ? parseInt(stored, 10) : null;
  });
  const [settings, setSettings] = useState<UserSettings>({ array_size: 30, speed: 50 });
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("bubble");

  const handleLogin = (id: number) => {
    setUserId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    setUserId(null);
  };

  const handleSettingsChange = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
  }, []);

  if (!userId) {
    return (
      <>
        <TooltipProvider>
          <Auth onLogin={handleLogin} />
          <Toaster />
        </TooltipProvider>
      </>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen w-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-sm bg-primary" />
              <h1 className="text-lg font-semibold">Algorithm Visualizer</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto lg:overflow-hidden">
          <div className="grid gap-6 lg:h-full lg:grid-cols-[320px_1fr]">
            <aside className="lg:h-full lg:overflow-auto">
              <SettingsPanel
                userId={userId}
                selectedAlgorithm={selectedAlgorithm}
                onAlgorithmChange={setSelectedAlgorithm}
                onSettingsChange={handleSettingsChange}
                onLogout={handleLogout}
              />
            </aside>
            <div className="lg:h-full lg:min-h-0">
              <SortingVisualizer settings={settings} selectedAlgorithm={selectedAlgorithm} />
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
