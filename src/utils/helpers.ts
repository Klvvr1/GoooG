export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getRandomItem<T>(array: T[]): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

export function generateId(): string {
  return 'id-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
