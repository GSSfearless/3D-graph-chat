/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
  },
  experimental: {
    serverActions: true,
  },
  // 增加API超时时间
  serverRuntimeConfig: {
    api: {
      bodyParser: {
        sizeLimit: '1mb',
      },
      responseLimit: false,
    },
  },
  // 配置 Vercel 或其他部署平台的超时时间
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Connection',
            value: 'keep-alive',
          },
          {
            key: 'Keep-Alive',
            value: 'timeout=120',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;