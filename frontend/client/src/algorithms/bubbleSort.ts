export interface SortStep {
  array: number[];
  active: number[];
  sorted: number[];
}

export function bubbleSort(inputArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const array = [...inputArray];
  const n = array.length;
  const sortedSet = new Set<number>();

  steps.push({ array: [...array], active: [], sorted: [] });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...array], active: [j, j + 1], sorted: Array.from(sortedSet) });

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swapped = true;
        steps.push({ array: [...array], active: [j, j + 1], sorted: Array.from(sortedSet) });
      }
    }
    
    sortedSet.add(n - 1 - i);
    steps.push({ array: [...array], active: [], sorted: Array.from(sortedSet) });
    
    if (!swapped) {
      for (let k = n - 2 - i; k >= 0; k--) {
        sortedSet.add(k);
        steps.push({ array: [...array], active: [], sorted: Array.from(sortedSet) });
      }
      break;
    }
  }

  if (sortedSet.size < n) {
    sortedSet.add(0);
  }
  
  const allSorted = Array.from({ length: n }, (_, i) => i);
  steps.push({ array: [...array], active: [], sorted: allSorted });

  return steps;
}
