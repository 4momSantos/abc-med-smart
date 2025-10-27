/**
 * Utilitários para monitoramento e gerenciamento de armazenamento local
 */

export interface StorageQuota {
  usage: number;
  quota: number;
  percentUsed: number;
  available: number;
  usageMB: number;
  quotaMB: number;
  availableMB: number;
}

/**
 * Verifica a quota de armazenamento disponível no navegador
 * Retorna null se a API não estiver disponível
 */
export async function checkStorageQuota(): Promise<StorageQuota | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
      
      return {
        usage,
        quota,
        percentUsed,
        available: quota - usage,
        usageMB: usage / (1024 * 1024),
        quotaMB: quota / (1024 * 1024),
        availableMB: (quota - usage) / (1024 * 1024),
      };
    } catch (error) {
      console.error('Erro ao verificar quota de armazenamento:', error);
      return null;
    }
  }
  return null;
}

/**
 * Calcula o tamanho do LocalStorage em bytes
 */
export function getLocalStorageSize(): number {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * Calcula o tamanho do LocalStorage em MB
 */
export function getLocalStorageSizeMB(): number {
  return getLocalStorageSize() / (1024 * 1024);
}

/**
 * Retorna o tamanho de uma chave específica do LocalStorage
 */
export function getItemSize(key: string): number {
  const item = localStorage.getItem(key);
  if (!item) return 0;
  return item.length + key.length;
}

/**
 * Retorna o tamanho de uma chave específica em MB
 */
export function getItemSizeMB(key: string): number {
  return getItemSize(key) / (1024 * 1024);
}

/**
 * Lista todos os itens do LocalStorage com seus tamanhos
 */
export function listStorageItems(): Array<{ key: string; size: number; sizeMB: number }> {
  const items: Array<{ key: string; size: number; sizeMB: number }> = [];
  
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const size = getItemSize(key);
      items.push({
        key,
        size,
        sizeMB: size / (1024 * 1024),
      });
    }
  }
  
  return items.sort((a, b) => b.size - a.size);
}

/**
 * Verifica se há espaço suficiente no LocalStorage
 * @param requiredBytes Bytes necessários
 * @returns true se houver espaço suficiente
 */
export async function hasEnoughSpace(requiredBytes: number): Promise<boolean> {
  const quota = await checkStorageQuota();
  if (!quota) {
    // Se não conseguir verificar, assume que há espaço
    return true;
  }
  return quota.available >= requiredBytes;
}

/**
 * Verifica se o armazenamento está próximo do limite (>80%)
 */
export async function isStorageNearLimit(): Promise<boolean> {
  const quota = await checkStorageQuota();
  if (!quota) return false;
  return quota.percentUsed > 80;
}

/**
 * Limpa itens específicos do LocalStorage por prefixo
 */
export function clearStorageByPrefix(prefix: string): number {
  let clearedCount = 0;
  const keysToRemove: string[] = [];
  
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    clearedCount++;
  });
  
  return clearedCount;
}

/**
 * Retorna estatísticas completas do armazenamento
 */
export async function getStorageStats() {
  const quota = await checkStorageQuota();
  const localStorageSize = getLocalStorageSizeMB();
  const items = listStorageItems();
  
  return {
    quota,
    localStorageSize,
    items,
    totalItems: items.length,
    largestItem: items[0] || null,
  };
}
