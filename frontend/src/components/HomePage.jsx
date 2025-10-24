import React, { useEffect, useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

const HomePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div 
          className="absolute w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"
          style={{
            top: '5%',
            left: '5%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            top: '50%',
            right: '5%',
            animationDelay: '1s',
            transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-[550px] h-[550px] bg-gradient-to-r from-blue-500/25 to-indigo-500/25 rounded-full blur-3xl animate-pulse"
          style={{
            bottom: '5%',
            left: '40%',
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * 0.025}px, ${mousePosition.y * 0.025}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          {/* Logo */}
          <div className="inline-block mb-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl blur-2xl opacity-60 transition-opacity duration-500 animate-pulse" />
            <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-6 rounded-3xl transform transition-all duration-500 hover:rotate-6">
              <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="text-white animate-fade-in-up" style={{ animationDelay: '0.1s' }}>PDF </span>
            <span 
              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              Extractor
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl text-blue-200/80 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            AI-Powered Data Extraction Made Simple
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: '⚡', text: 'Lightning Fast' },
              { icon: '🔒', text: 'Secure & Private' },
              { icon: '🤖', text: 'AI-Powered' }
            ].map((pill, i) => (
              <div 
                key={i}
                className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 transition-all duration-300 cursor-pointer hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2 text-white font-semibold">
                  <span className="text-xl">{pill.icon}</span>
                  <span>{pill.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            Transform your PDF documents into structured Excel files with the power of AI. 
            Extract tables, financial data, and insights in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <SignUpButton mode="modal">
              <button className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/40 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-3">
                  Get Started
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:border-cyan-400/50 hover:-translate-y-1">
                <span className="relative">Sign In</span>
              </button>
            </SignInButton>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-slate-300 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No Credit Card Required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Free to Start
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          {[
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              ),
              title: 'Upload PDFs',
              desc: 'Drag and drop your PDF documents or click to browse',
              gradient: 'from-cyan-500 to-blue-500'
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              ),
              title: 'AI Processing',
              desc: 'Our AI analyzes and extracts data with precision',
              gradient: 'from-blue-500 to-indigo-500'
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              ),
              title: 'Download Excel',
              desc: 'Get clean, structured data ready to use',
              gradient: 'from-emerald-500 to-teal-500'
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 transition-all duration-500 hover:bg-white/10 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`inline-block bg-gradient-to-br ${feature.gradient} p-4 rounded-2xl mb-6 transition-transform duration-500 group-hover:rotate-6`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
          {[
            { number: '99%', label: 'Accuracy', color: 'from-emerald-400 to-teal-400' },
            { number: '<30s', label: 'Avg. Processing', color: 'from-cyan-400 to-blue-400' },
            { number: '100+', label: 'Happy Users', color: 'from-blue-400 to-indigo-400' }
          ].map((stat, i) => (
            <div 
              key={i}
              className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center transition-all duration-500 hover:bg-white/10 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`text-6xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3 transition-transform duration-500`}>
                  {stat.number}
                </div>
                <div className="text-slate-300 font-semibold text-lg">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default HomePage;