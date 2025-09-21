'use client';

import { useState, useEffect } from 'react';
import { SystemStatus as SystemStatusType } from '@/types';
import { systemApi } from '@/lib/api';

interface StatusCardProps {
  title: string;
  status: 'running' | 'stopped' | 'error';
  children: React.ReactNode;
}

function StatusCard({ title, status, children }: StatusCardProps) {
  const statusColors = {
    running: 'bg-green-50 border-green-200',
    stopped: 'bg-gray-50 border-gray-200',
    error: 'bg-red-50 border-red-200',
  };

  const statusIcons = {
    running: '🟢',
    stopped: '⚪',
    error: '🔴',
  };

  return (
    <div className={`card p-6 ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{statusIcons[status]}</span>
          <span className={`status-badge status-${status}`}>
            {status === 'running' ? '运行中' : status === 'stopped' ? '已停止' : '错误'}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await systemApi.getStatus();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取状态失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMonitor = async (action: 'start' | 'stop') => {
    try {
      setActionLoading(action);
      setError(null);

      console.log(`Attempting to ${action} monitor...`);
      await systemApi.toggleMonitor(action);
      console.log(`Monitor ${action} successful`);

      // 显示成功消息
      const message = action === 'start' ? '监控系统已启动' : '监控系统已停止';
      alert(message);

      // 刷新状态
      await fetchStatus();
    } catch (err) {
      console.error(`Monitor ${action} failed:`, err);
      const errorMessage = err instanceof Error ? err.message : '操作失败';
      setError(`${action === 'start' ? '启动' : '停止'}监控失败: ${errorMessage}`);
      alert(`操作失败: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOnce = async () => {
    try {
      setActionLoading('check');
      setError(null);

      console.log('Attempting to check monitor...');
      const result = await systemApi.checkOnce();
      console.log('Check result:', result);

      alert(`检查完成！发现 ${result.total} 个方案，其中 ${result.newCount} 个新方案`);
      await fetchStatus(); // 刷新状态
    } catch (err) {
      console.error('Check failed:', err);
      const errorMessage = err instanceof Error ? err.message : '检查失败';
      setError(`检查失败: ${errorMessage}`);
      alert(`检查失败: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    // 每30秒自动刷新状态
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 bg-red-50 border-red-200">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-red-600">⚠️</span>
          <h3 className="text-lg font-semibold text-red-800">系统状态获取失败</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={fetchStatus} className="btn-danger">
          重试
        </button>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="space-y-6">
      {/* 系统操作按钮 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">系统状态</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleCheckOnce}
            disabled={actionLoading !== null}
            className={`btn-primary ${actionLoading === 'check' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {actionLoading === 'check' ? '⏳ 检查中...' : '🔍 执行检查'}
          </button>
          <button
            onClick={() => handleToggleMonitor(status.monitor.status === 'running' ? 'stop' : 'start')}
            disabled={actionLoading !== null}
            className={`${status.monitor.status === 'running' ? 'btn-warning' : 'btn-success'} ${
              actionLoading === 'start' || actionLoading === 'stop' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {actionLoading === 'start' ? '⏳ 启动中...' :
             actionLoading === 'stop' ? '⏳ 停止中...' :
             status.monitor.status === 'running' ? '⏸️ 停止监控' : '▶️ 启动监控'}
          </button>
          <button
            onClick={fetchStatus}
            disabled={loading || actionLoading !== null}
            className={`btn-secondary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? '⏳ 刷新中...' : '🔄 刷新状态'}
          </button>
        </div>
      </div>

      {/* 状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 监控系统状态 */}
        <StatusCard title="监控系统" status={status.monitor.status}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">发现方案:</span>
              <span className="font-medium">{status.monitor.totalSchemes} 个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最后更新:</span>
              <span className="font-medium text-sm">
                {new Date(status.monitor.lastUpdate).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">监控状态:</span>
              <span className="font-medium">
                {status.monitor.enabled ? '已启用' : '已禁用'}
              </span>
            </div>
          </div>
        </StatusCard>

        {/* 下载系统状态 */}
        <StatusCard
          title="下载系统"
          status={status.downloader.isLoggedIn ? 'running' : 'stopped'}
        >
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">登录状态:</span>
              <span className={`font-medium ${status.downloader.isLoggedIn ? 'text-green-600' : 'text-yellow-600'}`}>
                {status.downloader.isLoggedIn ? '已登录' : '未登录'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已下载:</span>
              <span className="font-medium">{status.downloader.downloadedArticles} 篇</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">待下载:</span>
              <span className="font-medium">{status.downloader.pendingArticles} 篇</span>
            </div>
          </div>
        </StatusCard>

        {/* 压缩系统状态 */}
        <StatusCard title="图片压缩" status="running">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">原始图片:</span>
              <span className="font-medium">{status.compressor.totalImages} 张</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已压缩:</span>
              <span className="font-medium">{status.compressor.compressedImages} 张</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">压缩比例:</span>
              <span className="font-medium text-green-600">
                {status.compressor.compressionRatio.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">节省空间:</span>
              <span className="font-medium text-green-600">
                {((status.compressor.totalOriginalSize - status.compressor.totalCompressedSize) / 1024 / 1024).toFixed(1)}MB
              </span>
            </div>
          </div>
        </StatusCard>
      </div>
    </div>
  );
}