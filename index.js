const crypto = require('crypto');
const http = require('http');

// ********** 替换为你自己的Token（和企业微信后台一致）**********
const TOKEN = 'MyTestToken2024';
// ************************************************************

// 处理请求的逻辑
const server = http.createServer((req, res) => {
  // 设置跨域和响应头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain');

  // 解析URL和参数
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  if (method === 'GET') {
    // 处理企业微信URL验证（GET请求）
    const signature = url.searchParams.get('signature');
    const timestamp = url.searchParams.get('timestamp');
    const nonce = url.searchParams.get('nonce');
    const echostr = url.searchParams.get('echostr');

    if (verifySignature(signature, timestamp, nonce)) {
      res.end(echostr); // 验证通过，返回echostr
    } else {
      res.statusCode = 403;
      res.end('验证失败');
    }
  } else if (method === 'POST') {
    // 处理企业微信消息推送（POST请求）
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('收到消息：', body);
      res.end(''); // 必须返回空字符串
    });
  } else {
    res.statusCode = 405;
    res.end('仅支持GET和POST');
  }
});

// 签名验证函数（企业微信官方算法）
function verifySignature(signature, timestamp, nonce) {
  const arr = [TOKEN, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1 = crypto.createHash('sha1').update(str).digest('hex');
  return sha1 === signature;
}

// 启动服务（Vercel会自动处理端口）
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务运行在端口 ${PORT}`);
});
