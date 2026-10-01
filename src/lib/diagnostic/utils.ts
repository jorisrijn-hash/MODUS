export function toggleInArray(arr: string[], value: string, max?: number): string[] {
  if (arr.includes(value)) return arr.filter((v) => v !== value);
  if (max && arr.length >= max) return arr;
  return [...arr, value];
}
