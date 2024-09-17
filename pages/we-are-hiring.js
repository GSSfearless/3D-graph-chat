// pages/we-are-hiring.js
import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function WeAreHiring() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#ECF5FD] to-[#B6DBF7] text-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Link href="/">
            <a className="text-4xl font-extrabold mb-4 inline-block transition-all duration-300 hover:text-[#6CB6EF]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '800', letterSpacing: '-1px' }}>Think-Graph</a>
          </Link>
        </div>
        
        <h1 className="text-5xl font-bold mb-8 text-center">🚀 Seeking Cosmic Adventurers: Shaping the Future Together 🌟</h1>
        
        <section className="mb-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-semibold mb-4">🎯 Our Mission</h2>
          <p className="text-xl">We're on the hunt for the most ambitious adventurers to explore and develop killer applications with the wildest imagination. Join us in pushing the boundaries of technology and creating products that change the world! 🌍💡</p>
        </section>

        <section className="mb-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-semibold mb-4">🦸‍♀️ We're Looking For 🦸‍♂️</h2>
          <ul className="list-disc list-inside text-xl">
            <li>🔥 Fearless Innovators</li>
            <li>🧠 Cross-disciplinary Thinkers</li>
            <li>🖥️ Tech Enthusiasts</li>
            <li>✨ Dreamers and Doers</li>
          </ul>
        </section>

        <section className="mb-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-semibold mb-4">🌈 Why Join Us</h2>
          <ul className="list-disc list-inside text-xl">
            <li>🎨 Unlimited Creative Freedom</li>
            <li>🔬 Opportunity to Work with Cutting-edge Technologies</li>
            <li>🌏 World-changing Projects</li>
            <li>🔥 A Team Fueled by Passion</li>
          </ul>
        </section>

        <section className="mb-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-semibold mb-4">🚀 Open Positions</h2>
          <ul className="list-disc list-inside text-xl">
            <li>👨‍💻 Full Stack Developer</li>
            <li>🤖 AI Researcher</li>
            <li>🎨 Product Designer</li>
            <li>🎬 Creative Director</li>
          </ul>
        </section>

        <div className="text-center">
          <button 
            className="bg-[#105C93] text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-[#3A86C8] transition duration-300"
            onClick={() => setShowQuiz(true)}
          >
            🚀 Join the Adventure Now 🚀
          </button>
        </div>

        {showQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white text-black p-8 rounded-lg max-w-2xl w-full">
              <h3 className="text-2xl font-bold mb-4">🤔 Are you ready to join our adventure?</h3>
              <p className="mb-4">Answer the following question to test your creative potential:</p>
              <p className="mb-4 text-xl font-semibold">🌟 If you could develop any application, and it was guaranteed to succeed, what would you create?</p>
              <textarea 
                className="w-full h-32 border border-gray-300 rounded p-2 mb-4 text-lg"
                placeholder="Enter your idea here..."
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
              ></textarea>
              <input
                type="email"
                className="w-full border border-gray-300 rounded p-2 mb-4 text-lg"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex justify-between">
                <button 
                  className="bg-[#105C93] text-white px-6 py-3 rounded-full hover:bg-[#3A86C8] transition duration-300 flex items-center"
                  onClick={() => {
                    alert("Thank you for your response! We'll be in touch soon. 🎉");
                    setShowQuiz(false);
                  }}
                >
                  Submit <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </button>
                <button 
                  className="bg-gray-300 text-black px-6 py-3 rounded-full hover:bg-gray-400 transition duration-300"
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