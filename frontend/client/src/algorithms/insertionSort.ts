import type { SortStep } from './bubbleSort';

export function insertionSort(inputArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const array = [...inputArray];
  const n = array.length;

  if (n === 0) {
    return [{ array: [], active: [], sorted: [] }];
  }

  steps.push({ array: [...array], active: [], sorted: [0] });

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;

    steps.push({ array: [...array], active: [i], sorted: Array.from({ length: i }, (_, k) => k) });

    while (j >= 0 && array[j] > key) {
      steps.push({ 
        array: [...array], 
        active: [j, j + 1], 
        sorted: Array.from({ length: i }, (_, k) => k) 
      });
      
      array[j + 1] = array[j];
      
      steps.push({ 
        array: [...array], 
        active: [j, j + 1], 
        sorted: Array.from({ length: i }, (_, k) => k) 
      });
      
      j--;
    }

    array[j + 1] = key;
    
    steps.push({ 
      array: [...array], 
      active: [j + 1], 
      sorted: Array.from({ length: i + 1 }, (_, k) => k) 
    });
  }

  steps.push({ 
    array: [...array], 
    active: [], 
    sorted: Array.from({ length: n }, (_, i) => i) 
  });

  return steps;
}
