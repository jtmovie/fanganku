'use client';

import { useState } from 'react';
import SystemStatus from '@/components/SystemStatus';
import MonitorData from '@/components/MonitorData';
import DownloadManagement from '@/components/DownloadManagement';
import CompressionManagement from '@/components/CompressionManagement';

type TabType = 'status' | 'monitor' | 'download' | 'compression';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('status');

  const tabs = [
    { id: 'status', name: '系统状态', icon: '📊' },
    { id: 'monitor', name: '监控数据', icon: '🔍' },
    { id: 'download', name: '下载管理', icon: '📥' },
    { id: 'compression', name: '图片压缩', icon: '🗜️' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* 选项卡导航 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 选项卡内容 */}
          {activeTab === 'status' && <SystemStatus />}
          {activeTab === 'monitor' && <MonitorData />}
          {activeTab === 'download' && <DownloadManagement />}
          {activeTab === 'compression' && <CompressionManagement />}
        </div>
      </div>

      {/* 快速操作面板 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">🔍</span>
            <span className="text-sm font-medium">执行检查</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">📥</span>
            <span className="text-sm font-medium">批量下载</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">🗜️</span>
            <span className="text-sm font-medium">压缩图片</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl mb-2">🧹</span>
            <span className="text-sm font-medium">清理文件</span>
          </button>
        </div>
      </div>

      {/* 系统信息 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">方案库监控系统</h3>
            <p className="text-blue-100">
              智能监控 fanganku.cn 网站更新，自动发现新方案并支持批量下载和图片压缩
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">v2.0.0</div>
            <div className="text-blue-100 text-sm">Node.js + Python</div>
          </div>
        </div>
      </div>
    </div>
  );
}