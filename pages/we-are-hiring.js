// pages/we-are-hiring.js
import Link from 'next/link';
import { useState } from 'react';

export default function WeAreHiring() {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center">Seeking Cosmic Adventurers: Shaping the Future Together</h1>
        
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
          <p className="text-xl">We're on the hunt for the most ambitious adventurers to explore and develop killer applications with the wildest imagination. Join us in pushing the boundaries of technology and creating products that change the world!</p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">We're Looking For</h2>
          <ul className="list-disc list-inside text-xl">
            <li>Fearless Innovators</li>
            <li>Cross-disciplinary Thinkers</li>
            <li>Tech Enthusiasts</li>
            <li>Dreamers and Doers</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Why Join Us</h2>
          <ul className="list-disc list-inside text-xl">
            <li>Unlimited Creative Freedom</li>
            <li>Opportunity to Work with Cutting-edge Technologies</li>
            <li>World-changing Projects</li>
            <li>A Team Fueled by Passion</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Open Positions</h2>
          <ul className="list-disc list-inside text-xl">
            <li>Full Stack Developer</li>
            <li>AI Researcher</li>
            <li>Product Designer</li>
            <li>Creative Director</li>
          </ul>
        </section>

        <div className="text-center">
          <button 
            className="bg-white text-purple-600 px-8 py-4 rounded-full text-xl font-bold hover:bg-purple-100 transition duration-300"
            onClick={() => setShowQuiz(true)}
          >
            Join the Adventure Now
          </button>
        </div>

        {showQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white text-black p-8 rounded-lg max-w-md">
              <h3 className="text-2xl font-bold mb-4">Are you ready to join our adventure?</h3>
              <p className="mb-4">Answer the following question to test your creative potential:</p>
              <p className="mb-4">If you could develop any application, and it was guaranteed to succeed, what would you create?</p>
              <textarea className="w-full h-32 border border-gray-300 rounded p-2 mb-4" placeholder="Enter your idea here..."></textarea>
              <div className="flex justify-between">
                <button 
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300"
                  onClick={() => alert("Thank you for your response! We'll be in touch soon.")}
                >
                  Submit
                </button>
                <button 
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
                  onClick={() => setShowQuiz(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}