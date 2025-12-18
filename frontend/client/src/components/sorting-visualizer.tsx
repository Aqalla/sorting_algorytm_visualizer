import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bubbleSort, quickSort, insertionSort, selectionSort, type SortStep, type AlgorithmType, algorithms } from "@/algorithms";
import type { UserSettings } from "@/lib/api";

interface SortingVisualizerProps {
  settings: UserSettings;
  selectedAlgorithm: AlgorithmType;
}

function generateArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);
}

export function SortingVisualizer({ settings, selectedAlgorithm }: SortingVisualizerProps) {
  const [baseArray, setBaseArray] = useState<number[]>(() => generateArray(settings.array_size));
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepsArraySize, setStepsArraySize] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDisplay = useMemo(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      return steps[currentStep];
    }
    return { array: baseArray, active: [] as number[], sorted: [] as number[] };
  }, [steps, currentStep, baseArray]);

  const maxValue = useMemo(() => Math.max(...currentDisplay.array, 100), [currentDisplay.array]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetVisualization = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    setStepsArraySize(0);
  }, [clearTimer]);

  useEffect(() => {
    const newArray = generateArray(settings.array_size);
    setBaseArray(newArray);
    resetVisualization();
  }, [settings.array_size, resetVisualization]);

  useEffect(() => {
    resetVisualization();
  }, [selectedAlgorithm, resetVisualization]);

  const handleGenerateArray = () => {
    const newArray = generateArray(settings.array_size);
    setBaseArray(newArray);
    resetVisualization();
  };

  const runAlgorithm = useCallback((arr: number[]): SortStep[] => {
    switch (selectedAlgorithm) {
      case "bubble":
        return bubbleSort(arr);
      case "quick":
        return quickSort(arr);
      case "insertion":
        return insertionSort(arr);
      case "selection":
        return selectionSort(arr);
      default:
        return bubbleSort(arr);
    }
  }, [selectedAlgorithm]);

  const handleStart = () => {
    const needsNewSteps = steps.length === 0 || stepsArraySize !== baseArray.length;
    
    if (needsNewSteps) {
      const sortSteps = runAlgorithm(baseArray);
      setSteps(sortSteps);
      setStepsArraySize(baseArray.length);
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    clearTimer();
  };

  const handleReset = () => {
    resetVisualization();
  };

  useEffect(() => {
    if (isPlaying && steps.length > 0 && currentStep < steps.length - 1) {
      timeoutRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, settings.speed);
    } else if (isPlaying && currentStep >= steps.length - 1 && steps.length > 0) {
      setIsPlaying(false);
    }

    return clearTimer;
  }, [isPlaying, currentStep, steps.length, settings.speed, clearTimer]);

  const isComplete = steps.length > 0 && currentStep >= steps.length - 1;
  const hasStarted = steps.length > 0;
  const progress = steps.length > 0 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0;

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <CardTitle className="text-lg font-medium">{algorithms[selectedAlgorithm].name}</CardTitle>
          {hasStarted && (
            <div 
              className="flex items-center gap-3 text-sm text-muted-foreground"
              aria-live="polite"
            >
              <span className="font-mono" data-testid="text-step-counter">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="font-mono" data-testid="text-progress">
                ({progress}%)
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Visualization controls">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateArray}
            disabled={isPlaying}
            data-testid="button-shuffle"
            aria-label="Generate new random array"
          >
            <Shuffle className="h-4 w-4 mr-1" />
            New Array
          </Button>
          {!isPlaying ? (
            <Button
              size="sm"
              onClick={handleStart}
              disabled={isComplete}
              data-testid="button-start"
              aria-label={hasStarted && currentStep > 0 ? "Resume sorting" : "Start sorting"}
            >
              <Play className="h-4 w-4 mr-1" />
              {hasStarted && currentStep > 0 && currentStep < steps.length - 1 ? "Resume" : "Start"}
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handlePause} 
              data-testid="button-pause"
              aria-label="Pause sorting"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!hasStarted}
            data-testid="button-reset"
            aria-label="Reset visualization"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div
          ref={containerRef}
          className="flex-1 flex items-end justify-center gap-[2px] p-4 bg-muted/30 rounded-lg min-h-[300px]"
          data-testid="container-visualizer"
          role="img"
          aria-label={`Sorting visualization showing ${currentDisplay.array.length} elements. ${isPlaying ? 'Currently sorting.' : isComplete ? 'Sorting complete.' : 'Ready to sort.'}`}
        >
          {currentDisplay.array.map((value, index) => {
            const isActive = currentDisplay.active.includes(index);
            const isSorted = currentDisplay.sorted.includes(index);
            const heightPercent = (value / maxValue) * 100;

            return (
              <div
                key={index}
                className={`flex-1 max-w-8 rounded-t-sm transition-all duration-75 ${
                  isActive
                    ? "bg-primary"
                    : isSorted
                      ? "bg-chart-2"
                      : "bg-foreground/20"
                }`}
                style={{
                  height: `${heightPercent}%`,
                  minWidth: currentDisplay.array.length > 50 ? "2px" : "4px",
                }}
                data-testid={`bar-${index}`}
                aria-label={`Bar ${index + 1}: value ${value}${isActive ? ', being compared' : ''}${isSorted ? ', sorted' : ''}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground" role="legend">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-foreground/20" aria-hidden="true" />
            <span>Unsorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary" aria-hidden="true" />
            <span>Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-chart-2" aria-hidden="true" />
            <span>Sorted</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
