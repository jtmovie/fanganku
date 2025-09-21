export default async function handler(req, res) {
  const apiUrl = 'http://62.234.23.62:9999/api/compression/stats';

  try {
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('压缩管理API代理错误:', error);
    res.status(500).json({
      success: false,
      error: '无法获取压缩数据',
      message: error.message
    });
  }
}