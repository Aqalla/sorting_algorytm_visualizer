import type { SortStep } from './bubbleSort';

export function quickSort(inputArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const array = [...inputArray];
  const n = array.length;
  const sorted: boolean[] = new Array(n).fill(false);

  const getSortedIndices = () => {
    const indices: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i]) indices.push(i);
    }
    return indices;
  };

  steps.push({ array: [...array], active: [], sorted: [] });

  function partition(low: number, high: number): number {
    const pivot = array[high];
    let i = low - 1;

    steps.push({ array: [...array], active: [high], sorted: getSortedIndices() });

    for (let j = low; j < high; j++) {
      steps.push({ array: [...array], active: [j, high], sorted: getSortedIndices() });

      if (array[j] <= pivot) {
        i++;
        if (i !== j) {
          [array[i], array[j]] = [array[j], array[i]];
          steps.push({ array: [...array], active: [i, j], sorted: getSortedIndices() });
        }
      }
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    sorted[i + 1] = true;
    steps.push({ array: [...array], active: [i + 1], sorted: getSortedIndices() });

    return i + 1;
  }

  function sort(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    } else if (low === high && low >= 0 && low < n) {
      sorted[low] = true;
      steps.push({ array: [...array], active: [], sorted: getSortedIndices() });
    }
  }

  if (n > 0) {
    sort(0, n - 1);
  }

  for (let i = 0; i < n; i++) {
    sorted[i] = true;
  }
  steps.push({ array: [...array], active: [], sorted: getSortedIndices() });

  return steps;
}
