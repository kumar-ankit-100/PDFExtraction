import React, { useEffect, useState } from 'react';

const ProcessingPage = ({ fileName, onProgressUpdate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  const steps = [
    { 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, 
      text: 'Reading financial document', 
      startProgress: 0, 
      endProgress: 20 
    },
    { 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, 
      text: 'Analyzing portfolio structure', 
      startProgress: 20, 
      endProgress: 35 
    },
    { 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, 
      text: 'AI extracting financial metrics', 
      startProgress: 35, 
      endProgress: 70 
    },
    { 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, 
      text: 'Structuring investment data', 
      startProgress: 70, 
      endProgress: 85 
    },
    { 
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>, 
      text: 'Generating Excel report', 
      startProgress: 85, 
      endProgress: 100 
    },
  ];

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Smooth progress animation
  useEffect(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      const duration = currentStep === 2 ? 3500 : 2000; // AI step takes longer
      const startProgress = step.startProgress;
      const endProgress = step.endProgress;
      const startTime = Date.now();

      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progressPercent = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuad = (t) => t * (2 - t);
        const easedProgress = easeOutQuad(progressPercent);
        
        const currentProgress = startProgress + (endProgress - startProgress) * easedProgress;
        setProgress(Math.round(currentProgress));

        if (progressPercent < 1) {
          requestAnimationFrame(animateProgress);
        } else if (currentStep < steps.length - 1) {
          // Move to next step
          setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        } else {
          // Notify parent that processing is complete
          if (onProgressUpdate) {
            onProgressUpdate(100);
          }
        }
      };

      requestAnimationFrame(animateProgress);
    }
  }, [currentStep]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl relative">
        {/* Gradient Background Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-3xl shadow-2xl p-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="relative z-10 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-4xl font-black text-white drop-shadow-lg">Processing Financial Data</h2>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg text-white font-semibold">{fileName}</p>
              </div>
            </div>

            {/* Animated Loader */}
            <div className="flex justify-center py-6">
              <div className="relative w-52 h-52">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e0f2fe" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 2.827}, 282.7`}
                    className="drop-shadow-lg"
                    style={{ transition: 'stroke-dasharray 0.3s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-black text-white drop-shadow-lg mb-2">{progress}%</div>
                    {progress === 100 && (
                      <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto animate-bounce">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 border-2
                    ${index === currentStep 
                      ? 'bg-white/20 border-white scale-[1.02] shadow-xl' 
                      : index < currentStep 
                        ? 'bg-white/10 border-white/50' 
                        : 'bg-white/5 border-white/20'
                    }
                  `}
                >
                  <div className={`
                    text-white transition-all duration-300
                    ${index === currentStep ? 'scale-110 animate-pulse' : ''}
                    ${index < currentStep ? 'opacity-70' : ''}
                  `}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`
                      text-lg font-semibold transition-colors duration-300 text-white
                      ${index < currentStep ? 'opacity-70' : ''}
                    `}>
                      {step.text}
                      {index === currentStep && <span className="ml-1 animate-pulse">{dots}</span>}
                    </p>
                  </div>
                  {index < currentStep && (
                    <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-white to-cyan-200 rounded-full transition-all duration-300 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-white font-semibold text-lg">
                Processing financial data... Please wait
              </p>
            </div>

            {/* Info Message */}
            <div className="flex items-start gap-4 p-5 bg-white/10 border-2 border-white/30 rounded-2xl backdrop-blur-sm">
              <div className="flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-base text-white leading-relaxed font-medium">
                AI is analyzing your financial document and extracting structured portfolio data. This process may take a minute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;
