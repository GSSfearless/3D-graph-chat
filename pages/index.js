import { faArrowRight, faBrain, faLightbulb, faSearch, faChartNetwork, faLock, faRocket, faMagicWandSparkles, faAtom, faBomb, faVirus, faBiohazard, faSatellite, faRadiation, faSkull, faMeteor, faRainbow, faSpaghettiMonsterFlying, faFire } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';

function Home() {
  const router = useRouter();
  const [chaos, setChaos] = useState('');
  const [isExploding, setIsExploding] = useState(false);
  const [chaosLevel, setChaosLevel] = useState(0);
  const canvasRef = useRef(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const [colorExplosion, setColorExplosion] = useState(false);
  const audioRef = useRef(null);
  const [glitchText, setGlitchText] = useState("思维触手");
  const textRef = useRef(null);
  const [floatingElements, setFloatingElements] = useState([]);
  
  // 随机颜色生成器
  const randomColor = () => {
    return `hsl(${Math.random() * 360}, ${Math.random() * 50 + 50}%, ${Math.random() * 50 + 50}%)`;
  };
  
  // 随机生成混乱文本
  const generateChaosText = () => {
    const chars = "思考破碎重构混沌宇宙爆炸艺术无限时空幻象梦境迷失找寻";
    let result = "";
    for (let i = 0; i < 20; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  // 创建悬浮元素
  useEffect(() => {
    const elements = [];
    for (let i = 0; i < 50; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 150 + 20,
        rotation: Math.random() * 360,
        speed: Math.random() * 5 + 1,
        color: randomColor(),
        shape: Math.floor(Math.random() * 5), // 0: 圆形, 1: 正方形, 2: 三角形, 3: 星形, 4: 波浪
        opacity: Math.random() * 0.5 + 0.1,
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }
    setFloatingElements(elements);
    
    // 每隔一段时间更新混沌文本
    const interval = setInterval(() => {
      setGlitchText(generateChaosText());
      setChaosLevel(prev => (prev + 1) % 10);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // 粒子爆炸效果
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
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
    
    // 创建粒子
    const createParticle = (x, y) => {
      const size = Math.random() * 12 + 1;
      const speedX = (Math.random() - 0.5) * 20;
      const speedY = (Math.random() - 0.5) * 20;
      const hue = Math.random() * 360;
      const color = `hsl(${hue}, 100%, 50%)`;
      
      return {
        x,
        y,
        size,
        speedX,
        speedY,
        color,
        life: 100 + Math.random() * 100,
        hue,
        shape: Math.floor(Math.random() * 5)
      };
    };
    
    // 跟踪鼠标位置并产生爆炸效果
    const handleMouseMove = (e) => {
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
      
      // 创建爆炸效果
      if (Math.random() > 0.7) {
        for (let i = 0; i < 20; i++) {
          particles.push(createParticle(e.clientX, e.clientY));
        }
      }
    };
    
    const handleClick = () => {
      setIsExploding(true);
      setColorExplosion(true);
      
      // 大爆炸效果
      for (let i = 0; i < 200; i++) {
        particles.push(createParticle(mousePosition.current.x, mousePosition.current.y));
      }
      
      setTimeout(() => setColorExplosion(false), 500);
      setTimeout(() => setIsExploding(false), 1000);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    // 初始化一些粒子
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push(createParticle(x, y));
    }
    
    // 粒子动画
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles = particles.filter(p => p.life > 0);
      
      // 随机添加新粒子
      if (particles.length < 500 && Math.random() > 0.9) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(createParticle(x, y));
      }
      
      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 1;
        particle.hue += 2; // 颜色变化
        particle.color = `hsl(${particle.hue}, 100%, 50%)`;
        
        // 给粒子施加混沌效果
        if (Math.random() > 0.95) {
          particle.speedX += (Math.random() - 0.5) * 2;
          particle.speedY += (Math.random() - 0.5) * 2;
        }
        
        // 限制速度
        const maxSpeed = 15;
        const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
        if (speed > maxSpeed) {
          particle.speedX = (particle.speedX / speed) * maxSpeed;
          particle.speedY = (particle.speedY / speed) * maxSpeed;
        }
        
        // 绘制不同形状的粒子
        ctx.globalAlpha = particle.life / 200;
        ctx.fillStyle = particle.color;
        
        switch(particle.shape) {
          case 0: // 圆形
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 1: // 正方形
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.life * 0.05);
            ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            ctx.restore();
            break;
          case 2: // 三角形
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.life * 0.05);
            ctx.beginPath();
            ctx.moveTo(0, -particle.size);
            ctx.lineTo(particle.size, particle.size);
            ctx.lineTo(-particle.size, particle.size);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            break;
          case 3: // 星形
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.life * 0.05);
            for (let i = 0; i < 5; i++) {
              ctx.rotate(Math.PI * 2 / 5);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(0, -particle.size);
              ctx.arc(0, 0, particle.size/2, -Math.PI/2, -Math.PI/2 + Math.PI/5);
              ctx.closePath();
              ctx.fill();
            }
            ctx.restore();
            break;
          case 4: // 随机线段
            ctx.save();
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = particle.size / 3;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(
              particle.x + Math.cos(particle.life * 0.1) * particle.size * 2,
              particle.y + Math.sin(particle.life * 0.1) * particle.size * 2
            );
            ctx.stroke();
            ctx.restore();
            break;
        }
      });
      
      // 绘制混沌连线
      for (let i = 0; i < particles.length; i += 10) {
        const p1 = particles[i];
        if (!p1) continue;
        
        for (let j = i + 1; j < i + 10 && j < particles.length; j++) {
          const p2 = particles[j];
          if (!p2) continue;
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.globalAlpha = (1 - distance / 100) * 0.2 * (p1.life / 200);
            ctx.strokeStyle = `hsl(${(p1.hue + p2.hue) / 2}, 100%, 60%)`;
            ctx.lineWidth = Math.random() * 3;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            
            // 曲线连接
            const cp1x = p1.x + (p2.x - p1.x) * 0.3 + (Math.random() - 0.5) * 50;
            const cp1y = p1.y + (p2.y - p1.y) * 0.3 + (Math.random() - 0.5) * 50;
            const cp2x = p1.x + (p2.x - p1.x) * 0.7 + (Math.random() - 0.5) * 50;
            const cp2y = p1.y + (p2.y - p1.y) * 0.7 + (Math.random() - 0.5) * 50;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 文字扭曲效果
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!textRef.current) return;
      
      const rect = textRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distX = (e.clientX - centerX) / 50;
      const distY = (e.clientY - centerY) / 50;
      
      textRef.current.style.transform = `translate(${distX}px, ${distY}px) skew(${distX}deg, ${distY}deg)`;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const increaseChoas = () => {
    setIsExploding(true);
    setChaos(generateChaosText());
    setTimeout(() => setIsExploding(false), 1000);
  };

  // 渲染浮动形状
  const renderFloatingElements = () => {
    return floatingElements.map(element => {
      let shape;
      switch(element.shape) {
        case 0: // 圆形
          shape = <div className="rounded-full" style={{width: element.size, height: element.size}}></div>;
          break;
        case 1: // 正方形
          shape = <div className="transform rotate-45" style={{width: element.size, height: element.size}}></div>;
          break;
        case 2: // 三角形
          shape = (
            <div style={{
              width: 0,
              height: 0,
              borderLeft: `${element.size/2}px solid transparent`,
              borderRight: `${element.size/2}px solid transparent`,
              borderBottom: `${element.size}px solid ${element.color}`
            }}></div>
          );
          break;
        case 3: // 不规则形状
          shape = (
            <div className="blob" style={{
              width: element.size,
              height: element.size,
              borderRadius: `${Math.random() * 50}% ${Math.random() * 50}% ${Math.random() * 50}% ${Math.random() * 50}% / ${Math.random() * 50}% ${Math.random() * 50}% ${Math.random() * 50}% ${Math.random() * 50}%`
            }}></div>
          );
          break;
        case 4: // 波浪
          shape = (
            <svg width={element.size} height={element.size} viewBox="0 0 100 100">
              <path 
                d="M 0,50 C 20,30 40,70 60,50 S 80,30 100,50 S 120,70 140,50"
                fill="none"
                stroke={element.color}
                strokeWidth="5"
              />
            </svg>
          );
          break;
      }
      
      return (
        <div 
          key={element.id}
          className="absolute pointer-events-none mix-blend-screen"
          style={{
            left: `${element.x}vw`,
            top: `${element.y}vh`,
            transform: `rotate(${element.rotation + element.speed * element.direction * chaosLevel}deg)`,
            opacity: element.opacity,
            zIndex: Math.floor(Math.random() * 10),
            transition: "transform 1s ease-out"
          }}
        >
          {shape}
        </div>
      );
    });
  };

  return (
    <div 
      className={`min-h-screen overflow-hidden relative cursor-none bg-black
        ${isExploding ? 'animate-[pulse_0.2s_ease-in-out_5]' : ''}
        ${colorExplosion ? 'bg-gradient-to-r from-purple-500 via-red-500 to-yellow-500' : ''}
      `}
      onClick={increaseChoas}
    >
      {/* 自定义光标 */}
      <div 
        className="fixed w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mix-blend-exclusion pointer-events-none z-50"
        style={{
          left: mousePosition.current.x - 16,
          top: mousePosition.current.y - 16,
          boxShadow: '0 0 20px 10px rgba(255, 0, 255, 0.5)',
          transition: 'transform 0.05s ease-out'
        }}
      />
      
      {/* 粒子背景 */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 mix-blend-lighten"
      />
      
      {/* 浮动元素 */}
      {renderFloatingElements()}
      
      {/* 主要内容区，完全混乱无序 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-purple-900 to-black opacity-50 z-0"></div>
        
        {/* 疯狂标题 */}
        <h1 
          ref={textRef}
          className={`text-[10vw] font-bold mb-4 text-center 
            bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 to-blue-500 to-purple-500
            text-transparent bg-clip-text
            animate-[textShadow_5s_ease-in-out_infinite]
            mix-blend-difference
            tracking-wider
            ${isExploding ? 'scale-150' : 'scale-100'}
            transition-all duration-300
          `}
        >
          {glitchText}
        </h1>
        
        {/* 随机图标爆炸 */}
        <div className="flex flex-wrap gap-4 justify-center items-center max-w-4xl mx-auto mb-12 relative">
          {[faAtom, faBomb, faVirus, faBiohazard, faSatellite, faRadiation, faSkull, faMeteor, faRainbow, faFire].map((icon, i) => (
            <div 
              key={i}
              className={`
                text-6xl transform transition-all duration-300 hover:scale-150 hover:rotate-[${Math.random() * 360}deg]
                ${Math.random() > 0.5 ? 'animate-spin' : 'animate-pulse'}
              `}
              style={{
                color: randomColor(),
                animationDuration: `${Math.random() * 5 + 2}s`,
                filter: `hue-rotate(${chaosLevel * 36}deg) drop-shadow(0 0 5px currentColor)`
              }}
            >
              <FontAwesomeIcon icon={icon} />
            </div>
          ))}
        </div>
        
        {/* 混沌搜索框 */}
        <div 
          className="relative w-full max-w-3xl mx-auto mb-20 group"
          onMouseEnter={() => setGlitchText(generateChaosText())}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-70 
            blur-[20px] group-hover:blur-[40px] group-hover:opacity-100 transition-all duration-500 
            rounded-full animate-[spin_10s_linear_infinite]`}>
          </div>
          
          <div className="relative flex items-center bg-black/30 backdrop-blur-xl rounded-full overflow-hidden border border-white/10 group-hover:border-white/30">
            <input
              type="text"
              value={chaos}
              onChange={(e) => setChaos(e.target.value)}
              placeholder={generateChaosText()}
              className="w-full px-8 py-7 text-3xl rounded-full bg-transparent text-white border-0 
              focus:outline-none placeholder-white/50 font-glitch tracking-widest"
              style={{
                textShadow: `0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff0080, 0 0 30px #ff0080, 
                0 0 40px #ff0080, 0 0 55px #ff0080, 0 0 75px #ff0080`
              }}
            />
            
            <button
              onClick={increaseChoas}
              className="absolute right-2 bg-gradient-to-r from-red-500 to-purple-600 text-white px-8 py-4 rounded-full 
              flex items-center gap-2 group-hover:scale-110 group-hover:rotate-3 transition-all"
            >
              <span className="font-bold tracking-wider">虚空</span>
              <FontAwesomeIcon icon={faRadiation} className="text-2xl animate-spin" />
            </button>
          </div>
        </div>
        
        {/* 随机数据块 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {Array.from({length: 3}).map((_, i) => (
            <div 
              key={i}
              className="p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden relative group"
              style={{
                transform: `rotate(${Math.random() * 6 - 3}deg)`,
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6
                animate-[bounce_${2 + i}s_ease-in-out_infinite]
                ${Math.random() > 0.5 ? 'bg-gradient-to-br from-red-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-green-700'}
              `}>
                <FontAwesomeIcon 
                  icon={[faAtom, faBomb, faVirus][i]} 
                  className="text-4xl text-white animate-spin" 
                  style={{animationDuration: `${3 + i * 2}s`}}
                />
              </div>
              
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-300 to-blue-300 text-transparent bg-clip-text">
                {["混沌碎片", "虚无灌注", "意识融解"][i]}
              </h3>
              
              <p className="text-blue-200 leading-relaxed font-glitch tracking-wide">
                {generateChaosText().split('').join(' ')}
              </p>
            </div>
          ))}
        </div>
        
        {/* 疯狂Call-to-Action */}
        <div className="relative mt-32 w-full max-w-4xl mx-auto overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 animate-[gradient_5s_ease_infinite]"></div>
          
          <div className="relative p-12 text-center">
            <h2 className="text-6xl font-bold mb-8 text-white animate-pulse">
              跳入思维
              <span className="inline-block animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]">虚空</span>
            </h2>
            
            <p className="text-2xl mb-12 text-white/80 font-glitch max-w-2xl mx-auto tracking-wide leading-relaxed">
              混沌&nbsp;&nbsp;无序&nbsp;&nbsp;碎裂&nbsp;&nbsp;重组&nbsp;&nbsp;爆炸&nbsp;&nbsp;创造&nbsp;&nbsp;毁灭
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <button
                onClick={() => {
                  setIsExploding(true);
                  setTimeout(() => setIsExploding(false), 1000);
                }}
                className="px-10 py-6 bg-white/10 backdrop-blur-lg text-white rounded-full text-2xl font-bold hover:bg-white/20
                border-2 border-white/30 hover:border-white/50 transition-all overflow-hidden relative group
                animate-[float_3s_ease-in-out_infinite]"
              >
                <span className="relative z-10 mix-blend-difference">瓦解现实</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 opacity-0 
                group-hover:opacity-100 transition-opacity duration-300 animate-[spin_5s_linear_infinite]"></div>
                <FontAwesomeIcon icon={faBomb} className="ml-2 animate-bounce" />
              </button>
              
              <button
                onClick={() => {
                  setColorExplosion(true);
                  setTimeout(() => setColorExplosion(false), 1000);
                }}
                className="px-10 py-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-2xl font-bold
                hover:from-blue-500 hover:to-green-600 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/50
                animate-[float_4s_ease-in-out_infinite_reverse]"
              >
                融解思维
                <FontAwesomeIcon icon={faFire} className="ml-2 animate-pulse" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 添加CSS动画 */}
      <style jsx global>{`
        @keyframes textShadow {
          0% {
            text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff0080, 0 0 20px #ff0080, 0 0 25px #ff0080;
          }
          50% {
            text-shadow: 0 0 5px #fff, 0 0 15px #0ff, 0 0 25px #0ff, 0 0 35px #0ff, 0 0 45px #0ff;
          }
          100% {
            text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff0080, 0 0 20px #ff0080, 0 0 25px #ff0080;
          }
        }
        
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .blob {
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          background: ${randomColor()};
          animation: blobAnimation 10s infinite;
        }
        
        @keyframes blobAnimation {
          0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          25% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
          50% { border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; }
          75% { border-radius: 60% 40% 40% 60% / 30% 60% 40% 70%; }
          100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        }
        
        .font-glitch {
          font-family: monospace;
          mix-blend-mode: difference;
        }
        
        body {
          cursor: none;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

export default Home;

