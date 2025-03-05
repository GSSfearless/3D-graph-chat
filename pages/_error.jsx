import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const CustomErrorComponent = (props) => {
  const router = useRouter();
  
  // 添加自动恢复机制
  useEffect(() => {
    // 只在客户端浏览器中执行
    if (typeof window !== 'undefined') {
      // 如果是因为返回按钮导致的错误，自动恢复
      const handleBack = () => {
        // 清除本地存储中可能导致问题的状态
        try {
          localStorage.removeItem('lastSearch');
        } catch (e) {
          console.warn('无法清除localStorage');
        }
        
        // 检查是否在搜索页面且没有查询参数
        if (window.location.pathname === '/search' && !window.location.search.includes('q=')) {
          // 重定向到首页
          window.location.href = '/';
        }
      };
      
      // 自动触发恢复
      const timer = setTimeout(handleBack, 300);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // 使用useEffect确保组件只在客户端渲染
  useEffect(() => {
    // 如果是客户端且有错误，向Sentry报告
    if (typeof window !== 'undefined' && props.error) {
      Sentry.captureException(props.error);
    }
  }, [props.error]);

  // 简化的渲染，避免复杂的DOM操作
  return <Error statusCode={props.statusCode || 400} title={props.title || "发生了错误"} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  try {
    // 在服务器端捕获错误
    await Sentry.captureUnderscoreErrorException(contextData);
    
    // 获取原始错误信息
    const errorProps = await Error.getInitialProps(contextData);
    
    // 添加自定义属性
    return { 
      ...errorProps,
      // 确保在服务端和客户端使用一致的DOM结构
      isServer: contextData?.res ? true : false
    };
  } catch (captureError) {
    // 如果在错误处理过程中出错，捕获这个元错误
    console.error("Error in error page:", captureError);
    Sentry.captureException(captureError);
    
    // 返回基本错误信息，避免复杂处理
    return { 
      statusCode: 500,
      title: "内部错误"
    };
  }
};

export default CustomErrorComponent;
