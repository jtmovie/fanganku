'use client';

import { useState, useEffect } from 'react';
import { MonitorSnapshot, Scheme } from '@/types';
import { monitorApi } from '@/lib/api';

interface SchemeCardProps {
  scheme: Scheme;
  onDownload: (url: string) => void;
}

function SchemeCard({ scheme, onDownload }: SchemeCardProps) {
  return (
    <div className={`card p-4 hover:shadow-lg transition-shadow duration-200 ${scheme.isHighlighted ? 'border-l-4 border-l-yellow-400' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {scheme.category}
            </span>
            {scheme.isHighlighted && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                ⭐ 推荐
              </span>
            )}
          </div>

          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
            {scheme.title}
          </h3>

          <div className="text-sm text-gray-500 mb-3">
            <span>ID: {scheme.id}</span>
            <span className="mx-2">•</span>
            <span>{new Date(scheme.extractedAt).toLocaleString('zh-CN')}</span>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={scheme.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              🔗 查看原文
            </a>
            <button
              onClick={() => onDownload(scheme.url)}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              📥 下载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MonitorData() {
  const [snapshot, setSnapshot] = useState<MonitorSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'highlighted'>('date');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await monitorApi.getLatestSnapshot();
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      // 这里调用下载API
      const { downloadApi } = await import('@/lib/api');
      await downloadApi.addTask(url);
      alert('下载任务已添加！');
    } catch (err) {
      alert('添加下载任务失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  useEffect(() => {
    fetchData();
    // 每5分钟自动刷新数据
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 过滤和排序方案
  const filteredAndSortedSchemes = snapshot?.schemes
    ? snapshot.schemes
        .filter((scheme) => {
          if (filter === 'all') return true;
          if (filter === 'highlighted') return scheme.isHighlighted;
          return scheme.category === filter;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case 'date':
              return new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime();
            case 'category':
              return a.category.localeCompare(b.category);
            case 'highlighted':
              return Number(b.isHighlighted) - Number(a.isHighlighted);
            default:
              return 0;
          }
        })
    : [];

  // 获取所有分类
  const categories = snapshot?.schemes
    ? Array.from(new Set(snapshot.schemes.map((s) => s.category)))
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 bg-red-50 border-red-200">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-red-600">⚠️</span>
          <h3 className="text-lg font-semibold text-red-800">加载监控数据失败</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={fetchData} className="btn-danger">
          重试
        </button>
      </div>
    );
  }

  if (!snapshot) return null;

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">监控数据</h2>
          <p className="text-gray-600">
            共发现 {snapshot.count} 个方案，最后更新：{new Date(snapshot.timestamp).toLocaleString('zh-CN')}
          </p>
        </div>
        <button onClick={fetchData} className="btn-secondary">
          🔄 刷新数据
        </button>
      </div>

      {/* 过滤和排序 */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">分类筛选:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">全部分类</option>
              <option value="highlighted">推荐方案</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">排序方式:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'category' | 'highlighted')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="date">按时间排序</option>
              <option value="category">按分类排序</option>
              <option value="highlighted">按推荐排序</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            显示 {filteredAndSortedSchemes.length} / {snapshot.count} 个方案
          </div>
        </div>
      </div>

      {/* 方案列表 */}
      {filteredAndSortedSchemes.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">暂无符合条件的方案</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}