import { faArrowRight, faBrain, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import 'tailwindcss/tailwind.css';

// 添加多语言文本
const i18n = {
  zh: {
    deepThink: '深思',
    deepThinkDesc: '深入探索知识的海洋',
    graphInsight: '图谱',
    graphInsightDesc: '可视化知识连接',
    mainTitle: '释放你的思维潜能',
    searchPlaceholder: '探索你的想法...',
    hiring: '我们在招聘',
    hiringDesc: '加入我们，共同塑造知识探索的未来',
    discord: '加入我们的Discord',
    discordDesc: '与社区连接并分享想法'
  },
  en: {
    deepThink: 'Deep Think',
    deepThinkDesc: 'Dive deep into knowledge exploration',
    graphInsight: 'Graph Insight',
    graphInsightDesc: 'Visualize knowledge connections',
    mainTitle: "Unleash Your Mind's Potential",
    searchPlaceholder: 'Explore your thoughts...',
    hiring: 'We are hiring',
    hiringDesc: 'Join our team and shape the future of knowledge exploration',
    discord: 'Join our Discord',
    discordDesc: 'Connect with our community and share ideas'
  }
};

// 获取服务器端属性
export async function getServerSideProps(context) {
  // 获取客户端IP地址
  const forwarded = context.req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(/, /)[0] : context.req.connection.remoteAddress;
  
  // 调用IP地理位置API
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    
    // 根据国家/地区代码确定语言
    const lang = data.countryCode === 'CN' ? 'zh' : 'en';
    
    return {
      props: {
        defaultLang: lang,
      },
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      props: {
        defaultLang: 'en', // 默认使用英语
      },
    };
  }
}

function Home({ defaultLang }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [currentLang] = useState(defaultLang);

  // 获取当前语言的文本
  const getText = (key) => {
    return i18n[currentLang]?.[key] || i18n.en[key];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (query.trim() !== '') {
      router.push(`/search?q=${query}&side=both`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa] relative">
      {/* Left side - Deep Think */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-50">
        <FontAwesomeIcon icon={faBrain} className="text-6xl text-blue-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">{getText('deepThink')}</h2>
        <p className="text-center text-blue-600 mb-8">{getText('deepThinkDesc')}</p>
      </div>

      {/* Right side - Graph Insight */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-yellow-50">
        <FontAwesomeIcon icon={faLightbulb} className="text-6xl text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-4 text-yellow-800">{getText('graphInsight')}</h2>
        <p className="text-center text-yellow-600 mb-8">{getText('graphInsightDesc')}</p>
      </div>

      {/* Centered search bar */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4">
        <h1 className="text-4xl font-semibold mb-8 text-center text-gray-800">
          {getText('mainTitle')}
        </h1>
        <div className="bg-white p-4 rounded-lg shadow-lg mb-4 flex items-center border border-gray-300 transition-all duration-300" style={{ minHeight: '5rem' }}>
          <div className="flex-grow pr-14">
            <textarea 
              placeholder={getText('searchPlaceholder')}
              className="w-full p-4 border-none outline-none text-xl whitespace-pre-wrap break-words overflow-hidden"
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                if (value.trim() !== '') {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                } else {
                  e.target.style.height = '3rem'; // 重置为默认高度
                }
                setQuery(value);
              }}
              onKeyPress={handleKeyPress}
              style={{ 
                wordWrap: 'break-word',
                resize: 'none',
                minHeight: '3rem',
                height: 'auto'
              }}
              rows="1"
            />
          </div>
          <button 
            className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full h-12 w-12 flex items-center justify-center absolute right-8 hover:from-blue-600 hover:to-yellow-600 transition duration-300" 
            onClick={handleSearch}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>

      {/* Bottom links */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center space-x-8">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-64">
          <Link href="/we-are-hiring">
            <a className="flex flex-col items-center space-y-2">
              <span className="text-4xl">🪐</span>
              <span className="text-lg font-medium text-gray-800">{getText('hiring')}</span>
              <p className="text-sm text-gray-600 text-center">{getText('hiringDesc')}</p>
            </a>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-64">
          <a 
            href="https://discord.gg/G66pESH3gm" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center space-y-2"
          >
            <span className="text-4xl">🍻</span>
            <span className="text-lg font-medium text-gray-800">{getText('discord')}</span>
            <p className="text-sm text-gray-600 text-center">{getText('discordDesc')}</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;

