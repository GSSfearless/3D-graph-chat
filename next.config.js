/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-image-domains.com'], // 如果有外部图片，添加域名
  },
  webpack: (config) => {
    // 优化 echarts 和 mermaid 的打包
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  // 优化构建输出
  output: 'standalone',
  // 配置响应头
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;