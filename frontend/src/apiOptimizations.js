// Frontend API Optimization Utilities
// Implements caching, request debouncing, and lazy loading

class APICache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes by default
    this.cache = new Map();
    this.ttl = ttl;
  }

  getCacheKey(endpoint, params = {}) {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  get(endpoint, params = {}) {
    const key = this.getCacheKey(endpoint, params);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(endpoint, params = {}, data) {
    const key = this.getCacheKey(endpoint, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(endpoint = null) {
    if (!endpoint) {
      this.cache.clear();
    } else {
      for (const [key] of this.cache.entries()) {
        if (key.startsWith(endpoint + ':')) {
          this.cache.delete(key);
        }
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
const apiCache = new APICache(5 * 60 * 1000);

// Request debouncer - prevents multiple identical requests
class RequestDebouncer {
  constructor(delay = 300) {
    this.timers = new Map();
    this.delay = delay;
  }

  debounce(key, fn) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        this.timers.delete(key);
        const result = await fn();
        resolve(result);
      }, this.delay);

      this.timers.set(key, timer);
    });
  }

  cancel(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  cancelAll() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}

const debouncer = new RequestDebouncer(300);

// Optimized fetch wrapper with retry logic
async function fetchWithRetry(url, options = {}, maxRetries = 2) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeout);
    
    if (maxRetries > 0) {
      console.warn(`Retrying request (${maxRetries} attempts left)...`);
      await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
      return fetchWithRetry(url, options, maxRetries - 1);
    }

    throw error;
  }
}

// Optimized API functions with caching
export const optimizedApi = {
  // Cached data loading
  async getDashboardData(includeCache = true) {
    const cacheKey = 'dashboard:main';
    
    if (includeCache) {
      const cached = apiCache.get('/api/overview');
      if (cached) return cached;
    }

    try {
      const response = await fetchWithRetry('/api/overview');
      const data = await response.json();
      
      if (includeCache) {
        apiCache.set('/api/overview', {}, data);
      }

      return data;
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      throw error;
    }
  },

  // Debounced module data loading
  async getModuleData(module, offset = 0, useCache = true) {
    const params = { module, offset };

    if (useCache) {
      const cached = apiCache.get(`/api/module`, params);
      if (cached) return cached;
    }

    const url = `/api?action=module&module=${encodeURIComponent(module)}&offset=${offset}`;
    
    try {
      const response = await fetchWithRetry(url);
      const data = await response.json();
      
      if (useCache) {
        apiCache.set(`/api/module`, params, data);
      }

      return data;
    } catch (error) {
      console.error(`Failed to load ${module} data:`, error);
      throw error;
    }
  },

  // Debounced search
  async searchModule(module, query) {
    const key = `search:${module}:${query}`;
    
    return debouncer.debounce(key, async () => {
      const cached = apiCache.get(`/api/search`, { module, query });
      if (cached) return cached;

      const url = `/api?action=module&module=${encodeURIComponent(module)}&search=${encodeURIComponent(query)}`;
      
      try {
        const response = await fetchWithRetry(url);
        const data = await response.json();
        apiCache.set(`/api/search`, { module, query }, data);
        return data;
      } catch (error) {
        console.error('Search failed:', error);
        throw error;
      }
    });
  },

  // Batch load multiple endpoints
  async batchLoad(endpoints) {
    const promises = endpoints.map(({ action, params = {} }) => {
      const cached = apiCache.get(action, params);
      if (cached) return Promise.resolve(cached);

      const queryString = new URLSearchParams({ action, ...params }).toString();
      return fetchWithRetry(`/api?${queryString}`)
        .then(r => r.json())
        .then(data => {
          apiCache.set(action, params, data);
          return data;
        });
    });

    return Promise.allSettled(promises);
  },

  // Clear cache for specific module
  clearModuleCache(module) {
    apiCache.clear(`module:${module}`);
  },

  // Get cache stats
  getCacheStats() {
    return apiCache.getStats();
  },
};

// Pagination helper
export class Pagination {
  constructor(totalItems, pageSize = 50) {
    this.totalItems = totalItems;
    this.pageSize = pageSize;
    this.currentPage = 0;
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get offset() {
    return this.currentPage * this.pageSize;
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  goToPage(page) {
    const p = Math.max(0, Math.min(page, this.totalPages - 1));
    this.currentPage = p;
  }
}

// Lazy loading observer for tables
export function setupLazyLoading(container, callback) {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry); 
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const rows = container.querySelectorAll('[data-lazy="true"]');
  rows.forEach(row => observer.observe(row));

  return observer;
}
