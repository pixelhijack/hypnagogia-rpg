const CACHE_KEYS = {
    BOOK_DATA: (game) => `gameData:${game}`, // Cache key for book data
    CHAPTER_NUMBER: (game) => `chapterNo:${game}`, // Cache key for chapter number
  };
  
  const CacheUtils = {
    set: (key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
  
    get: (key) => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    },
  
    delete: (key) => {
      localStorage.removeItem(key);
    },
  
    clearByPrefix: (prefix) => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    },
  };
  
  export { CACHE_KEYS, CacheUtils };