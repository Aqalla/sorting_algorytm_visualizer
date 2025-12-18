export { bubbleSort, type SortStep } from './bubbleSort';
export { quickSort } from './quickSort';
export { insertionSort } from './insertionSort';
export { selectionSort } from './selectionSort';

export type AlgorithmType = 'bubble' | 'quick' | 'insertion' | 'selection';

export const algorithms = {
  bubble: {
    name: 'Bubble Sort',
    complexity: 'O(n\u00B2)',
    description: 'Simple comparison-based algorithm',
  },
  quick: {
    name: 'Quick Sort',
    complexity: 'O(n log n)',
    description: 'Divide and conquer algorithm',
  },
  insertion: {
    name: 'Insertion Sort',
    complexity: 'O(n\u00B2)',
    description: 'Builds sorted array one item at a time',
  },
  selection: {
    name: 'Selection Sort',
    complexity: 'O(n\u00B2)',
    description: 'Repeatedly selects the minimum element',
  },
} as const;
