import { HCCard } from '@hellfall/shared/types';

type CachedCard = HCCard.Any & {
  cachedAt: number;
};

class CardCacheService {
  private static CACHE_KEY = 'hellfall_card_cache';
  private static MAX_CACHE_SIZE = 200; // Increased for better coverage
  private static CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

  static saveCard(card: HCCard.Any): void {
    try {
      const cache = this.getCache();

      // Don't cache if already exists with recent data
      if (cache[card.id] && cache[card.id].cachedAt > Date.now() - this.CACHE_TTL) {
        // Update timestamp but keep data
        cache[card.id].cachedAt = Date.now();
      } else {
        cache[card.id] = {
          ...card,
          cachedAt: Date.now(),
        };
      }

      // Limit cache size - remove oldest entries
      const entries = Object.entries(cache);
      if (entries.length > this.MAX_CACHE_SIZE) {
        const sortedEntries = entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);
        const toRemove = sortedEntries.slice(0, entries.length - this.MAX_CACHE_SIZE);
        toRemove.forEach(([id]) => {
          delete cache[id];
        });
      }

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save card to cache:', error);
    }
  }

  static getCard(id: string): HCCard.Any | null {
    try {
      const cache = this.getCache();
      const cached = cache[id];

      // Check if cache entry exists and hasn't expired
      if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
        // Remove the cachedAt property before returning
        const { cachedAt, ...card } = cached;
        return card as HCCard.Any;
      }

      // Remove expired entry
      if (cached) {
        delete cache[id];
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      }

      return null;
    } catch (error) {
      console.warn('Failed to get card from cache:', error);
      return null;
    }
  }

  static getMultipleCards(ids: string[]): Record<string, HCCard.Any> {
    const result: Record<string, HCCard.Any> = {};
    ids.forEach(id => {
      const card = this.getCard(id);
      if (card) {
        result[id] = card;
      }
    });
    return result;
  }

  static clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }

  private static getCache(): Record<string, CachedCard> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }
}

export default CardCacheService;
