import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';

function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const [hoverEffect, setHoverEffect] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // 初始化粒子背景
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    
    // 设置canvas尺寸为窗口大小
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // 跟踪鼠标位置
    const handleMouseMove = (e) => {
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
      
      // 创建新粒子
      for (let i = 0; i < 3; i++) {
        particles.push(createParticle(e.clientX, e.clientY));
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // 创建粒子对象
    const createParticle = (x, y) => {
      const size = Math.random() * 5 + 1;
      const speedX = Math.random() * 2 - 1;
      const speedY = Math.random() * 2 - 1;
      const color = `hsl(${Math.random() * 60 + 200}, 100%, 50%)`;
      
      return {
        x,
        y,
        size,
        speedX,
        speedY,
        color,
        life: 100,
      };
    };
    
    // 初始化一些粒子
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push(createParticle(x, y));
    }
    
    // 粒子动画
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles = particles.filter(p => p.life > 0);
      
      // 添加新粒子
      if (particles.length < 200 && Math.random() > 0.9) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(createParticle(x, y));
      }
      
      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 0.5;
        
        // 吸引粒子朝鼠标方向移动
        const dx = mousePosition.current.x - particle.x;
        const dy = mousePosition.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          const forceX = dx / 500;
          const forceY = dy / 500;
          particle.speedX += forceX;
          particle.speedY += forceY;
        }
        
        // 限制速度
        const maxSpeed = 3;
        const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
        if (speed > maxSpeed) {
          particle.speedX = (particle.speedX / speed) * maxSpeed;
          particle.speedY = (particle.speedY / speed) * maxSpeed;
        }
        
        // 绘制粒子
        ctx.globalAlpha = particle.life / 100;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 连接附近的粒子
        for (let i = index + 1; i < particles.length; i++) {
          const p2 = particles[i];
          const dx = particle.x - p2.x;
          const dy = particle.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.globalAlpha = (1 - distance / 100) * 0.2 * (particle.life / 100);
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative">
      {/* 交互式粒子背景 */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
        style={{ opacity: 0.7 }}
      />
      
      {/* 渐变光晕元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-2/3 h-2/3 bg-blue-500/20 rounded-full blur-[100px] transform animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-[100px] transform animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-1/3 h-1/3 bg-indigo-500/20 rounded-full blur-[100px] transform animate-pulse delay-700"></div>
      </div>

      {/* 浮动几何图形 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] left-[10%] w-20 h-20 border-2 border-blue-400/30 rounded-full transform rotate-45 animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute top-[60%] right-[10%] w-32 h-32 border-2 border-purple-400/30 rotate-12 transform animate-[spin_25s_linear_infinite_reverse]"></div>
        <div className="absolute bottom-[20%] left-[20%] w-24 h-24 border-2 border-indigo-400/30 rotate-45 transform animate-[spin_15s_linear_infinite]"></div>
        <div className="absolute top-[40%] right-[30%] w-16 h-16 border-2 border-blue-400/30 rounded-lg rotate-45 transform animate-[spin_30s_linear_infinite_reverse]"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 lg:pt-28 pb-32 relative z-10">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full backdrop-blur-lg shadow-lg">
            <span className="text-white font-medium">🎉 欢迎使用 Think Graph</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 text-transparent bg-clip-text leading-tight drop-shadow-lg">
            用AI重新定义<br />知识管理方式
          </h1>
          <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            将零散的知识点连接成完整的知识网络<br />
            让思维可视化，让学习更高效
          </p>
        </div>
        
        {/* Search Bar */}
        <div 
          className={`max-w-2xl mx-auto relative group transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          onMouseEnter={() => setHoverEffect(true)}
          onMouseLeave={() => setHoverEffect(false)}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-70 blur-2xl group-hover:opacity-90 transition-all duration-500 rounded-full ${hoverEffect ? 'scale-110' : 'scale-100'}`}></div>
          <div className="relative flex items-center bg-white/10 backdrop-blur-xl rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-500 border border-white/20">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入任何主题，开始你的知识探索..."
              className="w-full px-8 py-5 text-lg rounded-full bg-transparent text-white border-2 border-transparent focus:border-blue-300/30 focus:ring-2 focus:ring-blue-300/20 transition-all outline-none placeholder-blue-200/70"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all transform hover:translate-x-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-105 duration-300"
            >
              <span className="hidden md:inline font-medium">开始探索</span>
              <FontAwesomeIcon icon={faSearch} className="text-lg transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`flex justify-center gap-12 mt-20 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center backdrop-blur-lg bg-white/5 px-8 py-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <div className="text-3xl font-bold text-blue-300">100,000+</div>
            <div className="text-blue-100">知识节点</div>
          </div>
          <div className="text-center backdrop-blur-lg bg-white/5 px-8 py-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <div className="text-3xl font-bold text-indigo-300">50,000+</div>
            <div className="text-blue-100">活跃用户</div>
          </div>
          <div className="text-center backdrop-blur-lg bg-white/5 px-8 py-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <div className="text-3xl font-bold text-purple-300">1,000,000+</div>
            <div className="text-blue-100">知识连接</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <h2 className="text-3xl lg:text-5xl font-bold text-center mb-20 bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text drop-shadow-lg">
          为什么选择 Think Graph
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] border border-white/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
              <FontAwesomeIcon icon={faBrain} className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-blue-100">AI智能分析</h3>
            <p className="text-blue-200 leading-relaxed">
              强大的AI引擎自动分析文本内容，提取关键概念，构建知识连接，让知识管理更智能
            </p>
          </div>
          <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] border border-white/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
              <FontAwesomeIcon icon={faChartNetwork} className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-blue-100">实时可视化</h3>
            <p className="text-blue-200 leading-relaxed">
              直观的知识图谱展示，实时互动，帮助你快速理解和记忆复杂的知识体系
            </p>
          </div>
          <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] border border-white/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
              <FontAwesomeIcon icon={faMagicWandSparkles} className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-blue-100">智能推荐</h3>
            <p className="text-blue-200 leading-relaxed">
              基于你的学习历史和兴趣，智能推荐相关知识点，帮助你拓展知识边界
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-8 drop-shadow-lg">
              开启你的知识探索之旅
            </h2>
            <p className="text-xl mb-12 opacity-90">
              加入thousands of learners已经开始使用 Think Graph 重新定义他们的学习方式
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/search')}
                className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-white/30 transform hover:scale-105 transition-all flex items-center justify-center gap-2 group"
              >
                <FontAwesomeIcon icon={faRocket} className="group-hover:animate-bounce" />
                立即开始
              </button>
              <button
                onClick={() => router.push('/demo')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2 group"
              >
                观看演示
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

