'use client';

import { useState, useEffect } from 'react';
import { CompressionStats } from '@/types';
import { compressionApi } from '@/lib/api';

interface CompressionTaskCardProps {
  title: string;
  subtitle: string;
  stats: {
    original: number;
    compressed: number;
    ratio: string;
  };
  icon: string;
  iconColor: string;
}

function CompressionTaskCard({ title, subtitle, stats, icon, iconColor }: CompressionTaskCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`text-2xl ${iconColor}`}>{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{stats.ratio}</div>
          <div className="text-xs text-gray-500">压缩率</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800">{stats.original}</div>
          <div className="text-xs text-gray-600">原始图片</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-green-600">{stats.compressed}</div>
          <div className="text-xs text-gray-600">已压缩</div>
        </div>
      </div>
    </div>
  );
}

interface CompressionSettingsProps {
  onStartCompression: (settings: CompressionSettings) => void;
  onCleanCompressed: () => void;
  loading: boolean;
}

interface CompressionSettings {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  outputFormat: 'webp' | 'jpg' | 'png';
  targetDir?: string;
}

function CompressionControls({ onStartCompression, onCleanCompressed, loading }: CompressionSettingsProps) {
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    outputFormat: 'webp',
    targetDir: ''
  });

  const handleStartCompression = () => {
    onStartCompression(settings);
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">压缩设置</h3>

      <div className="space-y-4">
        {/* 质量设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            压缩质量: {settings.quality}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.quality}
            onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>高压缩</span>
            <span>高质量</span>
          </div>
        </div>

        {/* 尺寸限制 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最大宽度</label>
            <input
              type="number"
              value={settings.maxWidth}
              onChange={(e) => setSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) || 1920 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1920"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最大高度</label>
            <input
              type="number"
              value={settings.maxHeight}
              onChange={(e) => setSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) || 1080 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1080"
            />
          </div>
        </div>

        {/* 输出格式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
          <div className="flex space-x-4">
            {[
              { value: 'webp', label: 'WebP (推荐)', desc: '最佳压缩率' },
              { value: 'jpg', label: 'JPEG', desc: '通用格式' },
              { value: 'png', label: 'PNG', desc: '支持透明' }
            ].map((format) => (
              <label key={format.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="outputFormat"
                  value={format.value}
                  checked={settings.outputFormat === format.value}
                  onChange={(e) => setSettings(prev => ({ ...prev, outputFormat: e.target.value as any }))}
                  className="text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{format.label}</div>
                  <div className="text-xs text-gray-500">{format.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 目标目录 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目标目录 (可选)</label>
          <input
            type="text"
            value={settings.targetDir}
            onChange={(e) => setSettings(prev => ({ ...prev, targetDir: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="留空表示压缩所有图片"
          />
          <p className="text-xs text-gray-500 mt-1">指定要压缩的文章目录名，留空则压缩所有未压缩的图片</p>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleStartCompression}
            disabled={loading}
            className={`flex-1 btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? '🔄 压缩中...' : '🗜️ 开始压缩'}
          </button>
          <button
            onClick={onCleanCompressed}
            disabled={loading}
            className={`btn-secondary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            🗑️ 清理
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompressionManagement() {
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取压缩统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await compressionApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取压缩统计失败');
    } finally {
      setLoading(false);
    }
  };

  // 开始压缩
  const handleStartCompression = async (settings: CompressionSettings) => {
    try {
      setActionLoading(true);
      setError(null);

      const result = await compressionApi.startCompression(settings.targetDir);
      alert(`压缩任务已启动: ${result.message}`);

      // 延迟刷新统计数据
      setTimeout(fetchStats, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '启动压缩失败';
      setError(errorMessage);
      alert(`压缩失败: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  // 清理压缩文件
  const handleCleanCompressed = async () => {
    try {
      if (!confirm('确定要删除所有压缩文件吗？此操作不可恢复。')) {
        return;
      }

      setActionLoading(true);
      setError(null);

      const result = await compressionApi.clean();
      alert(`清理完成: ${result.message}`);

      // 刷新统计数据
      await fetchStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '清理失败';
      setError(errorMessage);
      alert(`清理失败: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // 每分钟刷新统计数据
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const compressionRatio = stats ?
    (stats.totalCompressedImages > 0 ? `${stats.compressionRatio.toFixed(1)}%` : '0%') : '0%';

  const savedSize = stats ?
    (stats.totalOriginalSize - stats.totalCompressedSize) / 1024 / 1024 : 0;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">图片压缩</h2>
          <p className="text-gray-600 mt-1">优化图片大小，提升网站加载速度</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? '🔄 刷新中...' : '🔄 刷新'}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center space-x-2 text-red-800">
            <span>⚠️</span>
            <span className="font-medium">错误</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* 压缩统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompressionTaskCard
          title="总体统计"
          subtitle={`${stats?.totalArticles || 0} 个文章目录`}
          stats={{
            original: stats?.totalOriginalImages || 0,
            compressed: stats?.totalCompressedImages || 0,
            ratio: compressionRatio
          }}
          icon="📊"
          iconColor="text-blue-500"
        />

        <CompressionTaskCard
          title="空间节省"
          subtitle={`节省 ${savedSize.toFixed(1)} MB`}
          stats={{
            original: Math.round((stats?.totalOriginalSize || 0) / 1024 / 1024),
            compressed: Math.round((stats?.totalCompressedSize || 0) / 1024 / 1024),
            ratio: `${((savedSize / ((stats?.totalOriginalSize || 1) / 1024 / 1024)) * 100).toFixed(1)}%`
          }}
          icon="💾"
          iconColor="text-green-500"
        />

        <CompressionTaskCard
          title="压缩进度"
          subtitle="WebP格式优化"
          stats={{
            original: stats?.totalOriginalImages || 0,
            compressed: stats?.totalCompressedImages || 0,
            ratio: `${Math.round(((stats?.totalCompressedImages || 0) / Math.max(stats?.totalOriginalImages || 1, 1)) * 100)}%`
          }}
          icon="🗜️"
          iconColor="text-purple-500"
        />
      </div>

      {/* 压缩控制面板 */}
      <CompressionControls
        onStartCompression={handleStartCompression}
        onCleanCompressed={handleCleanCompressed}
        loading={actionLoading}
      />

      {/* 详细统计 */}
      {stats && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">详细统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.totalArticles}</div>
              <div className="text-sm text-gray-600">处理文章</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalOriginalImages}</div>
              <div className="text-sm text-gray-600">原始图片</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalCompressedImages}</div>
              <div className="text-sm text-gray-600">已压缩</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{compressionRatio}</div>
              <div className="text-sm text-gray-600">压缩率</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}