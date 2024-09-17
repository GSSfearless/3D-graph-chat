// pages/we-are-hiring.js
import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function WeAreHiring() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/space-background.png')" }}>
      <div className="max-w-4xl mx-auto text-center text-white p-8">
        <div className="mb-12">
          <Link href="/">
            <a className="text-5xl font-extrabold mb-4 inline-block transition-all duration-300 hover:text-[#6CB6EF]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '800', letterSpacing: '-1px' }}>Think-Graph</a>
          </Link>
        </div>
        
        <h1 className="text-6xl font-bold mb-12 leading-tight">🚀 Seeking Cosmic Adventurers:<br />Shaping the Future Together 🌟</h1>
        
        <section className="mb-12 bg-black bg-opacity-50 rounded-lg shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-4xl font-semibold mb-6">🎯 Our Mission</h2>
          <p className="text-xl leading-relaxed">We&apos;re on the hunt for the most ambitious adventurers to explore and develop killer applications with the wildest imagination. Join us in pushing the boundaries of technology and creating products that change the world! 🌍💡</p>
        </section>

        <section className="mb-12 bg-black bg-opacity-50 rounded-lg shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-4xl font-semibold mb-6">🦸‍♀️ We&apos;re Looking For 🦸‍♂️</h2>
          <ul className="list-none text-xl space-y-4">
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">🔥</span> Fearless Innovators</li>
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">🧠</span> Cross-disciplinary Thinkers</li>
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">🖥️</span> Tech Enthusiasts</li>
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">✨</span> Dreamers and Doers</li>
          </ul>
        </section>

        <section className="mb-12 bg-black bg-opacity-50 rounded-lg shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-4xl font-semibold mb-6">🌈 Why Join Us</h2>
          <ul className="list-none text-xl space-y-4">
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">🎨</span> Unlimited Creative Freedom</li>
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">🔬</span> Opportunity to Work with Cutting-edge Technologies</li>
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">🌏</span> World-changing Projects</li>
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">🔥</span> A Team Fueled by Passion</li>
          </ul>
        </section>

        <section className="mb-12 bg-black bg-opacity-50 rounded-lg shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-4xl font-semibold mb-6">🚀 Open Positions</h2>
          <ul className="list-none text-xl space-y-4">
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">👨‍💻</span> Full Stack Developer</li>
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">🤖</span> AI Researcher</li>
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">🎨</span> Product Designer</li>
            <li className="flex items-center justify-center"><span className="text-3xl mr-4">🎬</span> Creative Director</li>
          </ul>
        </section>

        <div>
          <button 
            className="bg-[#105C93] text-white px-12 py-6 rounded-full text-2xl font-bold hover:bg-[#3A86C8] transition duration-300 shadow-lg hover:shadow-xl"
            onClick={() => setShowQuiz(true)}
          >
            🚀 Join the Adventure Now 🚀
          </button>
        </div>

        {showQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white text-black p-10 rounded-lg max-w-2xl w-full shadow-2xl">
              <h3 className="text-3xl font-bold mb-6">🤔 Are you ready to join our adventure?</h3>
              <input
                type="email"
                className="w-full border-2 border-gray-300 rounded-lg p-4 mb-6 text-xl focus:border-[#3A86C8] focus:ring focus:ring-[#3A86C8] focus:ring-opacity-50 transition duration-300"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex justify-between">
                <button 
                  className="bg-[#105C93] text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-[#3A86C8] transition duration-300 flex items-center shadow-lg hover:shadow-xl"
                  onClick={() => {
                    alert("Thank you for your interest! We'll be in touch soon. 🎉");
                    setShowQuiz(false);
                  }}
                >
                  Submit <FontAwesomeIcon icon={faArrowRight} className="ml-3" />
                </button>
                <button 
                  className="bg-gray-300 text-black px-8 py-4 rounded-full text-xl font-bold hover:bg-gray-400 transition duration-300 shadow-lg hover:shadow-xl"
                  onClick={() => setShowQuiz(false)}
                >
                  Close ❌
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}