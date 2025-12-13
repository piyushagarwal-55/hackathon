'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';

export function OnboardingTooltip() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      // Show after a short delay
      setTimeout(() => setShowTooltip(true), 1000);
    }
  }, []);

  const steps = [
    {
      title: '🎉 Welcome to RepVote!',
      description: 'The first reputation-weighted prediction market with quadratic voting.',
      highlight: 'Get started by exploring active markets below',
    },
    {
      title: '🔍 Search & Filter Markets',
      description: 'Use the search bar and filters to find markets that interest you.',
      highlight: 'Try filtering by status or sorting by trending',
    },
    {
      title: '📊 Interactive Charts',
      description: 'View real-time market data with our advanced charting system.',
      highlight: 'Zoom, hover, and explore market trends',
    },
    {
      title: '⚡ Vote & Earn Reputation',
      description: 'Cast votes to earn reputation points and increase your voting power.',
      highlight: 'Your influence grows with participation',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setShowTooltip(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  if (!showTooltip) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-fade-in" onClick={handleClose} />
      
      {/* Tooltip */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] max-w-md w-full mx-4 animate-scale-in">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl shadow-emerald-500/20">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-white text-center mb-3">
            {step.title}
          </h3>
          <p className="text-slate-300 text-center mb-2">
            {step.description}
          </p>
          <p className="text-emerald-400 text-sm text-center font-medium mb-6">
            {step.highlight}
          </p>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-emerald-400'
                    : index < currentStep
                    ? 'w-2 bg-emerald-600'
                    : 'w-2 bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-medium"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/30 text-sm flex items-center justify-center gap-2"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                "Get Started"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

