import { useState, useEffect, useCallback, useRef } from "react";
import { Settings, Check, Loader2, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserSettings, updateUserSettings, type UserSettings } from "@/lib/api";
import { algorithms, type AlgorithmType } from "@/algorithms";
import { useToast } from "@/hooks/use-toast";

interface SettingsPanelProps {
  userId: number;
  selectedAlgorithm: AlgorithmType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  onSettingsChange: (settings: UserSettings) => void;
  onLogout: () => void;
}

export function SettingsPanel({
  userId,
  selectedAlgorithm,
  onAlgorithmChange,
  onSettingsChange,
  onLogout,
}: SettingsPanelProps) {
  const [settings, setSettings] = useState<UserSettings>({ array_size: 30, speed: 50 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "saved" | "error">("idle");
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getUserSettings(userId);
        const validSettings = {
          array_size: data.array_size || 30,
          speed: data.speed || 50,
        };
        setSettings(validSettings);
        onSettingsChange(validSettings);
      } catch {
        setLoadError("Failed to load settings. Using defaults.");
        const defaults = { array_size: 30, speed: 50 };
        setSettings(defaults);
        onSettingsChange(defaults);
        toast({
          title: "Connection Error",
          description: "Could not load your settings. Using default values.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [userId, onSettingsChange, toast]);

  const syncSettings = useCallback(
    (newSettings: UserSettings) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      setSyncStatus("syncing");
      
      debounceTimeoutRef.current = setTimeout(async () => {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }

        try {
          await updateUserSettings(userId, newSettings);
          setSyncStatus("saved");
          syncTimeoutRef.current = setTimeout(() => setSyncStatus("idle"), 1500);
        } catch {
          setSyncStatus("error");
          toast({
            title: "Sync Failed",
            description: "Your settings changes could not be saved.",
            variant: "destructive",
          });
          syncTimeoutRef.current = setTimeout(() => setSyncStatus("idle"), 3000);
        }
      }, 500);
    },
    [userId, toast]
  );

  const handleArraySizeChange = (value: number[]) => {
    const newSettings = { ...settings, array_size: value[0] };
    setSettings(newSettings);
    onSettingsChange(newSettings);
    syncSettings(newSettings);
  };

  const handleSpeedChange = (value: number[]) => {
    const newSettings = { ...settings, speed: value[0] };
    setSettings(newSettings);
    onSettingsChange(newSettings);
    syncSettings(newSettings);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-lg font-medium">Settings</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus !== "idle" && (
            <div
              className="flex items-center gap-1 text-xs text-muted-foreground"
              data-testid="status-sync"
              aria-live="polite"
            >
              {syncStatus === "syncing" && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Syncing...</span>
                </>
              )}
              {syncStatus === "saved" && (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Saved</span>
                </>
              )}
              {syncStatus === "error" && (
                <>
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  <span>Failed</span>
                </>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground"
            data-testid="button-logout"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loadError && (
          <div className="flex items-center gap-2 text-sm text-destructive" data-testid="text-load-error">
            <AlertCircle className="h-4 w-4" />
            <span>{loadError}</span>
          </div>
        )}

        <div className="space-y-3">
          <label htmlFor="algorithm-select" className="text-sm font-medium">Algorithm</label>
          <Select value={selectedAlgorithm} onValueChange={(v) => onAlgorithmChange(v as AlgorithmType)}>
            <SelectTrigger id="algorithm-select" data-testid="select-algorithm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(algorithms) as AlgorithmType[]).map((key) => (
                <SelectItem key={key} value={key} data-testid={`option-algorithm-${key}`}>
                  <div className="flex flex-col items-start">
                    <span>{algorithms[key].name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {algorithms[selectedAlgorithm].description} - {algorithms[selectedAlgorithm].complexity}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="array-size-slider" className="text-sm font-medium">Array Size</label>
            <span className="text-sm font-mono text-muted-foreground" data-testid="text-array-size">
              {settings.array_size}
            </span>
          </div>
          <Slider
            id="array-size-slider"
            value={[settings.array_size]}
            onValueChange={handleArraySizeChange}
            min={5}
            max={100}
            step={1}
            data-testid="slider-array-size"
            aria-label="Array size"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="speed-slider" className="text-sm font-medium">Animation Speed</label>
            <span className="text-sm font-mono text-muted-foreground" data-testid="text-speed">
              {settings.speed}ms/step
            </span>
          </div>
          <Slider
            id="speed-slider"
            value={[settings.speed]}
            onValueChange={handleSpeedChange}
            min={1}
            max={200}
            step={1}
            data-testid="slider-speed"
            aria-label="Animation speed in milliseconds per step"
          />
        </div>
      </CardContent>
    </Card>
  );
}
