/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // 处理 echarts-wordcloud 模块
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      module: false,
    };

    // 添加模块别名
    config.resolve.alias = {
      ...config.resolve.alias,
      'echarts-wordcloud': 'echarts-wordcloud/dist/echarts-wordcloud.min.js',
    };

    // 在服务器端排除特定模块
    if (isServer) {
      config.externals = [...(config.externals || []), 
        'echarts',
        'echarts-gl',
        'echarts-wordcloud',
        'zrender',
        'three'
      ];
    }

    return config;
  },
  transpilePackages: ['echarts', 'echarts-gl', 'echarts-wordcloud', 'zrender'],
};

module.exports = nextConfig;