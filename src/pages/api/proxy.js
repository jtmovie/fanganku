// API代理，解决HTTPS→HTTP混合内容问题
export default async function handler(req, res) {
  const { path, ...query } = req.query;
  const apiUrl = `http://62.234.23.62:9999/api/${Array.isArray(path) ? path.join('/') : path || ''}`;

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
    console.error('API代理错误:', error);
    res.status(500).json({
      success: false,
      error: '无法连接到后端API',
      message: error.message
    });
  }
}