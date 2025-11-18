export const booksMediaMappings = {
      // ==========================================
  // BOOKS, MUSIC & MEDIA
  // ==========================================
  
  // Main Books, Music & Media Category
  'books-music-media': ['author', 'language', 'format', 'genre', 'brand'],
  'media': ['format', 'genre', 'language', 'rating'],
  
  // Books
  'books': ['author', 'language', 'format', 'pages', 'publisher', 'genre', 'isbn'],
  'fiction': ['author', 'language', 'format', 'pages', 'genre', 'series'],
  'non-fiction': ['author', 'language', 'format', 'pages', 'topic', 'edition'],
  'biography': ['author', 'language', 'format', 'pages', 'subject'],
  'self-help': ['author', 'language', 'format', 'pages', 'topic'],
  'business-books': ['author', 'language', 'format', 'pages', 'topic'],
  'cookbooks': ['author', 'language', 'format', 'pages', 'cuisine', 'diet-type'],
  'travel-books': ['author', 'language', 'format', 'pages', 'destination'],
  'children-books': ['author', 'language', 'format', 'age-group', 'illustrated', 'pages'],
  'picture-books': ['author', 'language', 'age-group', 'illustrated', 'pages'],
  'young-adult': ['author', 'language', 'format', 'genre', 'pages'],
  'textbooks': ['author', 'language', 'format', 'subject', 'edition', 'level'],
  'reference-books': ['author', 'language', 'format', 'subject', 'edition'],
  'comics': ['author', 'language', 'format', 'genre', 'series', 'issue'],
  'graphic-novels': ['author', 'language', 'format', 'genre', 'pages'],
  'manga': ['author', 'language', 'format', 'genre', 'volume'],
  'poetry': ['author', 'language', 'format', 'pages', 'style'],
  'religious-books': ['author', 'language', 'format', 'religion', 'pages'],
  
  // E-Books & Audiobooks
  'ebooks': ['author', 'language', 'format', 'pages', 'genre', 'file-format'],
  'audiobooks': ['author', 'language', 'duration', 'narrator', 'format', 'genre'],
  
  // Music
  'music': ['artist', 'genre', 'format', 'duration', 'language'],
  'cds': ['artist', 'genre', 'tracks', 'year', 'label'],
  'vinyl': ['artist', 'genre', 'tracks', 'year', 'speed', 'condition'],
  'cassettes': ['artist', 'genre', 'tracks', 'year', 'condition'],
  'digital-music': ['artist', 'genre', 'tracks', 'format', 'bitrate'],
  'music-albums': ['artist', 'genre', 'tracks', 'year', 'format'],
  'singles': ['artist', 'genre', 'format', 'year'],
  'compilations': ['genre', 'tracks', 'year', 'format'],
  'soundtracks': ['genre', 'tracks', 'year', 'format', 'movie-tv'],
  
  // Movies & TV
  'movies': ['genre', 'format', 'language', 'rating', 'duration', 'year'],
  'dvds': ['genre', 'language', 'rating', 'duration', 'region', 'subtitles'],
  'blu-ray': ['genre', 'language', 'rating', 'duration', 'region', 'resolution'],
  '4k-blu-ray': ['genre', 'language', 'rating', 'duration', 'hdr', 'region'],
  'digital-movies': ['genre', 'language', 'rating', 'duration', 'quality', 'platform'],
  'tv-shows': ['genre', 'language', 'rating', 'seasons', 'format', 'episodes'],
  'tv-series-dvd': ['genre', 'language', 'rating', 'seasons', 'region'],
  'documentaries': ['topic', 'language', 'format', 'duration', 'year'],
  'anime': ['genre', 'language', 'format', 'episodes', 'subtitles'],
  
  // Video Games
  'video-games': ['platform', 'genre', 'rating', 'multiplayer', 'language'],
  'pc-games': ['genre', 'rating', 'multiplayer', 'language', 'system-requirements'],
  'playstation-games': ['platform', 'genre', 'rating', 'multiplayer', 'language'],
  'xbox-games': ['platform', 'genre', 'rating', 'multiplayer', 'language'],
  'nintendo-games': ['platform', 'genre', 'rating', 'multiplayer', 'language'],
  'mobile-games': ['platform', 'genre', 'rating', 'in-app-purchases'],
  'vr-games': ['platform', 'genre', 'rating', 'vr-headset'],
  'game-codes': ['platform', 'game-title', 'region', 'edition'],
  'game-subscriptions': ['platform', 'duration', 'games-included'],
  
  // Magazines & Newspapers
  'magazines': ['language', 'frequency', 'topic', 'issue'],
  'fashion-magazines': ['language', 'frequency', 'issue'],
  'tech-magazines': ['language', 'frequency', 'issue'],
  'sports-magazines': ['language', 'frequency', 'sport-type'],
  'news-magazines': ['language', 'frequency', 'topic'],
  'newspapers': ['language', 'frequency', 'region', 'date'],
  
  // Educational Media
  'educational-media': ['subject', 'language', 'format', 'level'],
  'language-learning': ['language', 'format', 'level', 'method'],
  'online-courses': ['subject', 'language', 'duration', 'level', 'platform'],
  'tutorial-videos': ['subject', 'language', 'duration', 'level'],
  
  // Add more categories as needed...
};
