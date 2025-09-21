'use client';

import { useState, useEffect } from 'react';
import { DownloadTask } from '@/types';
import { downloadApi } from '@/lib/api';

interface TaskCardProps {
  task: DownloadTask;
}

function TaskCard({ task }: TaskCardProps) {
  const statusColors = {
    pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    downloading: 'bg-blue-50 border-blue-200 text-blue-800',
    completed: 'bg-green-50 border-green-200 text-green-800',
    failed: 'bg-red-50 border-red-200 text-red-800',
  };

  const statusIcons = {
    pending: '⏳',
    downloading: '⬇️',
    completed: '✅',
    failed: '❌',
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {task.title || '下载任务'}
          </h3>
          <p className="text-xs text-gray-500 truncate mt-1">
            {task.url}
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusColors[task.status]}`}>
          <span>{statusIcons[task.status]}</span>
          <span>
            {task.status === 'pending' ? '等待中' :
             task.status === 'downloading' ? '下载中' :
             task.status === 'completed' ? '已完成' : '失败'}
          </span>
        </div>
      </div>

      {/* 进度条 */}
      {task.status === 'downloading' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>下载进度</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 下载统计信息 */}
      {(task.imageCount !== undefined || task.documentCount !== undefined) && (
        <div className="mb-2 flex space-x-4 text-xs text-gray-600">
          {task.imageCount !== undefined && (
            <span>🖼️ 图片: {task.imageCount}</span>
          )}
          {task.documentCount !== undefined && (
            <span>📄 文档: {task.documentCount}</span>
          )}
        </div>
      )}

      {/* 时间信息 */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>创建时间: {new Date(task.createdAt).toLocaleString('zh-CN')}</span>
        {task.completedAt && (
          <span>完成时间: {new Date(task.completedAt).toLocaleString('zh-CN')}</span>
        )}
      </div>

      {/* 错误信息 */}
      {task.error && (
        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600">
          错误: {task.error}
        </div>
      )}
    </div>
  );
}

interface AddTaskFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

function AddTaskForm({ onSubmit, loading }: AddTaskFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-3">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="输入方案URL，例如: https://www.fanganku.cn/fangan/xxx"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
        required
      />
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '添加中...' : '添加任务'}
      </button>
    </form>
  );
}

export default function DownloadManagement() {
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [loginStatus, setLoginStatus] = useState<{ isLoggedIn: boolean; message: string } | null>(null);

  // 获取下载任务列表
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await downloadApi.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      const status = await downloadApi.checkLogin();
      setLoginStatus(status);
    } catch (err) {
      console.error('检查登录状态失败:', err);
    }
  };

  // 添加下载任务
  const handleAddTask = async (url: string) => {
    try {
      setActionLoading('add');
      setError(null);

      // 检查URL格式
      if (!url.includes('fanganku.cn')) {
        alert('请输入有效的方案库URL');
        return;
      }

      // 检查是否重复
      const existingTask = tasks.find(task => task.url === url);
      if (existingTask) {
        alert('该URL的任务已存在');
        return;
      }

      const newTask = await downloadApi.addTask(url);
      setTasks(prev => [newTask, ...prev]);
      alert('下载任务已添加！');

      // 3秒后刷新一次任务状态
      setTimeout(fetchTasks, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '添加任务失败';
      setError(errorMessage);

      // 显示更友好的错误信息
      if (errorMessage.includes('400')) {
        alert('添加失败: URL重复或格式不正确');
      } else {
        alert(`添加失败: ${errorMessage}`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  // 批量处理新文章
  const handleProcessNew = async () => {
    try {
      setActionLoading('process');
      setError(null);

      // 获取当前任务统计
      const pendingTasks = tasks.filter(task => task.status === 'pending');
      const completedTasks = tasks.filter(task => task.status === 'completed');

      // 显示详细的确认对话框
      const confirmMessage = [
        `📊 当前任务状态:`,
        `✅ 已完成: ${completedTasks.length} 个`,
        `⏳ 待下载: ${pendingTasks.length} 个`,
        ``,
        `⚠️ 批量处理说明:`,
        `• 只会下载待处理的文章(跳过已完成的)`,
        `• 预计需要时间: ${Math.ceil(pendingTasks.length * 2)}分钟`,
        `• 将下载高分辨率图片`,
        ``,
        `确定要开始批量处理吗？`
      ].join('\n');

      const userConfirm = confirm(confirmMessage);
      if (!userConfirm) {
        setActionLoading(null);
        return;
      }

      // 如果没有待处理任务，给出提示
      if (pendingTasks.length === 0) {
        alert('🎉 所有任务都已完成，无需批量处理！');
        setActionLoading(null);
        return;
      }

      const result = await downloadApi.processNew(Math.min(pendingTasks.length, 5));
      alert(`批量处理完成！处理了 ${result.processed} 篇文章`);
      await fetchTasks(); // 刷新任务列表
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '批量处理失败';
      setError(errorMessage);
      alert(`处理失败: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  // 启动登录流程
  const handleLogin = async () => {
    try {
      setActionLoading('login');
      setError(null);
      const result = await downloadApi.startLogin();

      // 创建一个更详细的提示框
      let message = result.message;
      if (result.qrUrl) {
        message += `\n\n二维码链接: ${result.qrUrl}`;
      }
      if (result.output) {
        message += `\n\n登录信息:\n${result.output}`;
      }

      // 显示详细信息
      if (result.qrUrl) {
        const userConfirm = confirm(`${message}\n\n是否在新窗口打开二维码?`);
        if (userConfirm) {
          window.open(result.qrUrl, '_blank');
        }
      } else {
        alert(message);
      }

      // 刷新登录状态
      await checkLoginStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '启动登录失败';
      setError(errorMessage);
      alert(`登录失败: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchTasks();
    checkLoginStatus();
    // 每30秒自动刷新任务状态
    const interval = setInterval(() => {
      fetchTasks();
      checkLoginStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和状态 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">下载管理</h2>
          <p className="text-gray-600 mt-1">管理文章下载任务和登录状态</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* 登录状态 */}
          {loginStatus && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${
              loginStatus.isLoggedIn ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <span>{loginStatus.isLoggedIn ? '🟢' : '🟡'}</span>
              <span>{loginStatus.message}</span>
            </div>
          )}
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? '🔄 刷新中...' : '🔄 刷新'}
          </button>
        </div>
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

      {/* 任务统计 */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">任务统计</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(task => task.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700">已完成</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter(task => task.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-700">待下载</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(task => task.status === 'downloading').length}
            </div>
            <div className="text-sm text-blue-700">下载中</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(task => task.status === 'failed').length}
            </div>
            <div className="text-sm text-red-700">失败</div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleLogin}
            disabled={actionLoading !== null}
            className={`btn-primary ${actionLoading === 'login' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {actionLoading === 'login' ? '⏳ 启动中...' : '🔐 扫码登录'}
          </button>
          <button
            onClick={handleProcessNew}
            disabled={actionLoading !== null || !loginStatus?.isLoggedIn}
            className={`btn-success ${
              actionLoading === 'process' || !loginStatus?.isLoggedIn
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {actionLoading === 'process' ? '⏳ 处理中...' : `📥 批量下载 (${tasks.filter(task => task.status === 'pending').length}个待处理)`}
          </button>
          <button
            onClick={() => window.open('/api/download/tasks', '_blank')}
            className="btn-secondary"
          >
            📊 查看详情
          </button>
        </div>

        {/* 添加任务表单 */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">添加下载任务</h4>
          <AddTaskForm onSubmit={handleAddTask} loading={actionLoading === 'add'} />
        </div>
      </div>

      {/* 任务列表 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">下载任务列表</h3>
          <span className="text-sm text-gray-500">共 {tasks.length} 个任务</span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无下载任务</h3>
            <p className="text-gray-500">添加一个URL开始下载吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '等待中', count: tasks.filter(t => t.status === 'pending').length, color: 'text-yellow-600' },
          { label: '下载中', count: tasks.filter(t => t.status === 'downloading').length, color: 'text-blue-600' },
          { label: '已完成', count: tasks.filter(t => t.status === 'completed').length, color: 'text-green-600' },
          { label: '失败', count: tasks.filter(t => t.status === 'failed').length, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}