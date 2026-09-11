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
  if (!imageUrl) return false;
  
  // Any proxy avatar URL or models directory URL is strictly an avatar, never a gallery image
  if (imageUrl.startsWith('/api/avatar') || imageUrl.includes('/models/')) {
    return true;
  }

  if (!avatarUrl) return false;
  if (imageUrl === avatarUrl) return true;

  const extractFilename = (u: string) => {
    try {
      // If it's a proxy url like /api/avatar?url=https%3A... unwrap the inner url
      if (u.includes('url=')) {
        const match = u.match(/[?&]url=([^&]+)/);
        if (match) {
          u = decodeURIComponent(match[1]);
        }
      }
      const parsed = new URL(u, 'https://gooog-b19.pages.dev');
      return parsed.pathname.split('/').filter(Boolean).pop()?.toLowerCase() || '';
    } catch {
      return u.split('?')[0].split('/').filter(Boolean).pop()?.toLowerCase() || '';
    }
  };

  const f1 = extractFilename(imageUrl);
  const f2 = extractFilename(avatarUrl);
  return f1 !== '' && f1 === f2;
}
