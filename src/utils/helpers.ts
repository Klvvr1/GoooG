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

export function isAvatarMatch(imageUrl?: string, avatarUrl?: string): boolean {
  if (!imageUrl || !avatarUrl) return false;
  if (imageUrl === avatarUrl) return true;
  const getCleanFilename = (u: string) => {
    try {
      const parsed = new URL(u);
      return parsed.pathname.split('/').filter(Boolean).pop() || '';
    } catch {
      return u.split('?')[0].split('/').filter(Boolean).pop() || '';
    }
  };
  const f1 = getCleanFilename(imageUrl);
  const f2 = getCleanFilename(avatarUrl);
  return f1 !== '' && f1 === f2;
}
