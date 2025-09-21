export interface Scheme {
  id: number;
  title: string;
  url: string;
  category: string;
  categoryUrl: string;
  image: string;
  isHighlighted: boolean;
  extractedAt: string;
}

export interface MonitorSnapshot {
  timestamp: string;
  count: number;
  schemes: Scheme[];
}

export interface SystemStatus {
  monitor: {
    enabled: boolean;
    totalSchemes: number;
    lastUpdate: string;
    status: 'running' | 'stopped' | 'error';
  };
  downloader: {
    enabled: boolean;
    totalArticles: number;
    downloadedArticles: number;
    pendingArticles: number;
    isLoggedIn: boolean;
  };
  compressor: {
    totalImages: number;
    compressedImages: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    compressionRatio: number;
  };
}

export interface DownloadTask {
  id: string;
  url: string;
  title: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
  imageCount?: number;
  documentCount?: number;
}

export interface CompressionStats {
  totalArticles: number;
  totalOriginalImages: number;
  totalCompressedImages: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  compressionRatio: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}