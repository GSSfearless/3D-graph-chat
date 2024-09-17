import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function WeAreHiring() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your interest! We'll be in touch soon. 🎉");
    setEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <a className="text-4xl font-bold text-center block mb-8">Think-Graph</a>
        </Link>
        
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-8">
          🚀 Seeking Cosmic Adventurers: Shaping the Future Together 🌟
        </h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🎯 Our Mission</h2>
          <p className="text-lg mb-4">
            We're on the hunt for the most ambitious adventurers to explore and develop killer applications with the wildest imagination. Join us in pushing the boundaries of technology and creating products that change the world!
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🦸‍♀️ We're Looking For 🦸‍♂️</h2>
          <ul className="list-disc list-inside text-lg">
            <li>Fearless Innovators</li>
            <li>Cross-disciplinary Thinkers</li>
            <li>Tech Enthusiasts</li>
            <li>Dreamers and Doers</li>
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🚀 Open Positions</h2>
          <ul className="list-disc list-inside text-lg">
            <li>Full Stack Developer</li>
            <li>AI Researcher</li>
            <li>Product Designer</li>
            <li>Creative Director</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Join Our Adventure</h2>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-md mb-4"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Submit <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}