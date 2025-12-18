import type { SortStep } from './bubbleSort';

export function selectionSort(inputArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const array = [...inputArray];
  const n = array.length;
  const sortedSet = new Set<number>();

  steps.push({ array: [...array], active: [], sorted: [] });

  for (let i = 0; i < n; i++) {
    let minIndex = i;

    steps.push({ array: [...array], active: [i], sorted: Array.from(sortedSet) });

    for (let j = i + 1; j < n; j++) {
      steps.push({ array: [...array], active: [minIndex, j], sorted: Array.from(sortedSet) });

      if (array[j] < array[minIndex]) {
        minIndex = j;
        steps.push({ array: [...array], active: [minIndex], sorted: Array.from(sortedSet) });
      }
    }

    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      steps.push({ array: [...array], active: [i, minIndex], sorted: Array.from(sortedSet) });
    }

    sortedSet.add(i);
    steps.push({ array: [...array], active: [], sorted: Array.from(sortedSet) });
  }

  steps.push({
    array: [...array],
    active: [],
    sorted: Array.from({ length: n }, (_, i) => i),
  });

  return steps;
}
