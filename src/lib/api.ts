import axios from 'axios';
import { SystemStatus, MonitorSnapshot, DownloadTask, CompressionStats, ApiResponse } from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 300000,  // 5分钟超时，匹配后端设置
});

// 系统状态相关API
export const systemApi = {
  // 获取系统状态
  getStatus: async (): Promise<SystemStatus> => {
    const response = await api.get<ApiResponse<SystemStatus>>('/system/status');
    if (!response.data.success) {
      throw new Error(response.data.error || '获取系统状态失败');
    }
    return response.data.data!;
  },

  // 启动/停止监控
  toggleMonitor: async (action: 'start' | 'stop'): Promise<void> => {
    const response = await api.post<ApiResponse<void>>(`/system/monitor/${action}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '操作失败');
    }
  },

  // 执行单次检查
  checkOnce: async (): Promise<{ newCount: number; total: number }> => {
    const response = await api.post<ApiResponse<{ newCount: number; total: number }>>('/system/check');
    if (!response.data.success) {
      throw new Error(response.data.error || '检查失败');
    }
    return response.data.data!;
  },
};

// 监控数据相关API
export const monitorApi = {
  // 获取最新监控数据
  getLatestSnapshot: async (): Promise<MonitorSnapshot> => {
    const response = await api.get<ApiResponse<MonitorSnapshot>>('/monitor/latest');
    if (!response.data.success) {
      throw new Error(response.data.error || '获取监控数据失败');
    }
    return response.data.data!;
  },

  // 获取历史监控数据
  getHistory: async (days: number = 7): Promise<MonitorSnapshot[]> => {
    const response = await api.get<ApiResponse<MonitorSnapshot[]>>(`/monitor/history?days=${days}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '获取历史数据失败');
    }
    return response.data.data!;
  },
};

// 下载管理相关API
export const downloadApi = {
  // 获取下载任务列表
  getTasks: async (): Promise<DownloadTask[]> => {
    const response = await api.get<ApiResponse<DownloadTask[]>>('/download/tasks');
    if (!response.data.success) {
      throw new Error(response.data.error || '获取下载任务失败');
    }
    return response.data.data!;
  },

  // 添加下载任务
  addTask: async (url: string): Promise<DownloadTask> => {
    const response = await api.post<ApiResponse<DownloadTask>>('/download/add', { url });
    if (!response.data.success) {
      throw new Error(response.data.error || '添加下载任务失败');
    }
    return response.data.data!;
  },

  // 批量处理新文章
  processNew: async (maxCount: number = 5): Promise<{ processed: number; total: number }> => {
    // 批量处理可能需要很长时间，创建专门的axios实例
    const batchApi = axios.create({
      baseURL: '/api',
      timeout: 1200000,  // 20分钟超时，匹配后端设置
    });

    const response = await batchApi.post<ApiResponse<{ processed: number; total: number }>>('/download/process', { maxCount });
    if (!response.data.success) {
      throw new Error(response.data.error || '处理失败');
    }
    return response.data.data!;
  },

  // 检查登录状态
  checkLogin: async (): Promise<{ isLoggedIn: boolean; message: string }> => {
    const response = await api.get<ApiResponse<{ isLoggedIn: boolean; message: string }>>('/download/login-status');
    if (!response.data.success) {
      throw new Error(response.data.error || '检查登录状态失败');
    }
    return response.data.data!;
  },

  // 启动登录流程
  startLogin: async (): Promise<{ message: string; qrUrl?: string; output?: string }> => {
    const response = await api.post<ApiResponse<{ message: string; qrUrl?: string; output?: string }>>('/download/login');
    if (!response.data.success) {
      throw new Error(response.data.error || '启动登录失败');
    }
    return response.data.data!;
  },
};

// 图片压缩相关API
export const compressionApi = {
  // 获取压缩统计
  getStats: async (): Promise<CompressionStats> => {
    const response = await api.get<ApiResponse<CompressionStats>>('/compression/stats');
    if (!response.data.success) {
      throw new Error(response.data.error || '获取压缩统计失败');
    }
    return response.data.data!;
  },

  // 开始压缩
  startCompression: async (targetDir?: string): Promise<{ message: string }> => {
    const response = await api.post<ApiResponse<{ message: string }>>('/compression/start', { targetDir });
    if (!response.data.success) {
      throw new Error(response.data.error || '开始压缩失败');
    }
    return response.data.data!;
  },

  // 清理压缩文件
  clean: async (): Promise<{ message: string }> => {
    const response = await api.post<ApiResponse<{ message: string }>>('/compression/clean');
    if (!response.data.success) {
      throw new Error(response.data.error || '清理失败');
    }
    return response.data.data!;
  },
};

export default api;