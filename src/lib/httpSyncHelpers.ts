export const formatDuration = (ms: number): string => {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatInterval = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}min`;
  return `${minutes}min ${seconds}s`;
};

export const getNextSyncCountdown = (nextSync: Date | null): string => {
  if (!nextSync) return '-';
  
  const now = new Date();
  const next = new Date(nextSync);
  const diff = next.getTime() - now.getTime();
  
  if (diff < 0) return 'Em breve...';
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}min ${seconds}s`;
};

export const encryptPassword = (password: string): string => {
  // Simple base64 encoding (not secure, but better than plain text)
  return btoa(password);
};

export const decryptPassword = (encrypted: string): string => {
  try {
    return atob(encrypted);
  } catch {
    return encrypted;
  }
};

export const sanitizeConfig = (config: any): any => {
  // Remove password from config for logging
  const sanitized = { ...config };
  if (sanitized.auth && sanitized.auth.password) {
    sanitized.auth = { ...sanitized.auth, password: '***' };
  }
  return sanitized;
};
