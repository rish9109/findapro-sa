// File: src/components/LoadingScreen.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isVisible?: boolean;
  messages?: string | string[];
  onComplete?: () => void;
  simulateProgress?: boolean;
  // New prop for showcase duration
  showcaseDuration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isVisible = false, 
  messages = [], 
  onComplete,
  simulateProgress = true,
  showcaseDuration = 800 // Time to show 100% completion before hiding
}) => {
  const [currentMessages, setCurrentMessages] = useState<string[]>([
    'Initializing Find A Pro...',
    'Loading assets...',
    'Fetching professionals...',
    'Preparing your dashboard...',
    'Ready to connect!'
  ]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [loadingStages, setLoadingStages] = useState([
    { label: 'Initializing...', progress: 15, duration: 600 },
    { label: 'Loading UI components...', progress: 35, duration: 800 },
    { label: 'Fetching professionals...', progress: 60, duration: 1200 },
    { label: 'Loading profiles...', progress: 80, duration: 1000 },
    { label: 'Finalizing setup...', progress: 95, duration: 700 },
    { label: 'Ready!', progress: 100, duration: 400 }
  ]);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    
    if (isVisible && messages.length > 0) {
      if (Array.isArray(messages)) {
        setCurrentMessages(messages);
      } else {
        setCurrentMessages([messages]);
      }
    }
    
    // Reset states when loading starts
    if (isVisible) {
      setProgress(0);
      setIsComplete(false);
      setShowSuccess(false);
      setCurrentStage(0);
      setCurrentMessageIndex(0);
    }
  }, [isVisible, messages]);

  // Real progress simulation based on stages
  useEffect(() => {
    if (!isVisible || !simulateProgress) return;

    let isCancelled = false;
    
    const progressTo = async (targetProgress: number, duration: number) => {
      return new Promise<void>((resolve) => {
        if (isCancelled) return;
        
        const startProgress = progress;
        const startTime = Date.now();
        
        const updateProgress = () => {
          if (isCancelled) return;
          
          const elapsed = Date.now() - startTime;
          const percentage = Math.min(elapsed / duration, 1);
          
          // Smooth ease-out function
          const easeOut = 1 - Math.pow(1 - percentage, 2);
          const newProgress = startProgress + (targetProgress - startProgress) * easeOut;
          
          setProgress(Math.min(newProgress, 100));
          
          if (elapsed < duration) {
            requestAnimationFrame(updateProgress);
          } else {
            setProgress(targetProgress);
            resolve();
          }
        };
        
        requestAnimationFrame(updateProgress);
      });
    };

    const runStages = async () => {
      for (let i = 0; i < loadingStages.length; i++) {
        if (isCancelled) break;
        
        setCurrentStage(i);
        
        // Update message based on stage
        if (i < currentMessages.length) {
          setCurrentMessageIndex(i);
        }
        
        await progressTo(loadingStages[i].progress, loadingStages[i].duration);
        
        // If this is the final stage (100%)
        if (i === loadingStages.length - 1) {
          setIsComplete(true);
          setShowSuccess(true);
          
          // Show 100% completion for showcase duration
          await new Promise(resolve => setTimeout(resolve, showcaseDuration));
          
          if (!isCancelled) {
            onComplete?.();
          }
        }
      }
    };

    runStages();

    return () => {
      isCancelled = true;
    };
  }, [isVisible, simulateProgress, onComplete, loadingStages, currentMessages, showcaseDuration]);

  // Auto-complete if not using simulated progress
  useEffect(() => {
    if (isVisible && !simulateProgress) {
      const timeout = setTimeout(() => {
        setProgress(100);
        setIsComplete(true);
        setShowSuccess(true);
        
        setTimeout(() => {
          onComplete?.();
        }, showcaseDuration);
      }, 2500);
      
      return () => clearTimeout(timeout);
    }
  }, [isVisible, simulateProgress, onComplete, showcaseDuration]);

  // Message cycling when not in progress simulation
  useEffect(() => {
    if (!isVisible || !isMounted || simulateProgress || currentMessages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % currentMessages.length);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isVisible, currentMessages.length, isMounted, simulateProgress]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0a0b10] z-[9999] flex flex-col items-center justify-center text-center p-4 sm:p-6"
          style={{ 
            backgroundColor: 'rgba(5, 6, 10, 0.98)',
            height: '100dvh',
            width: '100dvw',
            overflow: 'hidden'
          }}
        >
          {/* Main content container */}
          <div className="flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md md:max-w-lg px-4">
            
            {/* Logo with completion animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6 sm:mb-8 md:mb-10"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Find A Pro
              </div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400 font-light tracking-wider uppercase"
              >
                Connecting you with verified professionals
              </motion.div>
            </motion.div>

            {/* Geometric loader with completion effects */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: showSuccess ? [1, 1.02, 1] : 1,
                opacity: 1
              }}
              transition={{ 
                delay: 0.3,
                scale: showSuccess ? {
                  duration: 0.6,
                  repeat: 1,
                  repeatType: "reverse"
                } : undefined
              }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 mb-6 sm:mb-8 md:mb-10"
            >
              {/* Static background rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Outer ring */}
                <motion.div
                  animate={showSuccess ? {
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  } : {}}
                  transition={showSuccess ? {
                    duration: 0.8,
                    repeat: 2
                  } : {}}
                  className="absolute border-2 border-blue-500/30 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  style={{ width: '100%', height: '100%' }}
                />
                
                {/* Middle ring */}
                <motion.div
                  animate={showSuccess ? {
                    scale: [1, 1.08, 1],
                    opacity: [0.3, 0.5, 0.3]
                  } : {}}
                  transition={showSuccess ? {
                    duration: 0.8,
                    repeat: 2,
                    delay: 0.1
                  } : {}}
                  className="absolute border-2 border-purple-500/30 rounded-2xl shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                  style={{ width: '75%', height: '75%' }}
                />
                
                {/* Inner ring */}
                <motion.div
                  animate={showSuccess ? {
                    scale: [1, 1.06, 1],
                    opacity: [0.3, 0.4, 0.3]
                  } : {}}
                  transition={showSuccess ? {
                    duration: 0.8,
                    repeat: 2,
                    delay: 0.2
                  } : {}}
                  className="absolute border-2 border-cyan-500/30 rounded-2xl shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  style={{ width: '50%', height: '50%' }}
                />
              </div>
              
              {/* Progress-based animated ring */}
              <motion.div
                animate={{ 
                  rotate: isComplete ? 0 : 360,
                  opacity: isComplete ? 0.7 : 0.5
                }}
                transition={{ 
                  duration: isComplete ? 0.3 : 20, 
                  repeat: isComplete ? 0 : Infinity, 
                  ease: "linear" 
                }}
                className="absolute inset-0 rounded-2xl border-2 border-transparent"
                style={{
                  background: `linear-gradient(${progress * 3.6}deg, transparent 50%, rgba(59, 130, 246, ${isComplete ? 0.8 : 0.5}) 100%) border-box`,
                  mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
              
              {/* Center with completion celebration */}
              <div className="relative w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: isComplete ? [1, 1.1, 1] : [1, 1.03, 1],
                    borderColor: isComplete 
                      ? ['rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.3)', 'rgba(59, 130, 246, 0.1)'] 
                      : undefined
                  }}
                  transition={{ 
                    duration: isComplete ? 0.6 : 2, 
                    repeat: isComplete ? 1 : Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-white/5"
                >
                  {/* Success checkmark */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        key="success-check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="text-2xl sm:text-3xl text-emerald-400">
                          ✓
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Main F logo - hides when success shows */}
                  <motion.div
                    animate={{ opacity: showSuccess ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="font-black text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
                  >
                    F
                  </motion.div>
                </motion.div>
                
                {/* Completion particles */}
                <AnimatePresence>
                  {showSuccess && (
                    <>
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={`particle-${i}`}
                          initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            x: Math.cos((i * 45) * Math.PI / 180) * 40,
                            y: Math.sin((i * 45) * Math.PI / 180) * 40
                          }}
                          transition={{
                            duration: 0.8,
                            delay: i * 0.05,
                            ease: "easeOut"
                          }}
                          className={`absolute w-1.5 h-1.5 rounded-full ${
                            i % 3 === 0 ? 'bg-blue-400' :
                            i % 3 === 1 ? 'bg-purple-400' :
                            'bg-cyan-400'
                          }`}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Message container */}
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-4 sm:mb-6 h-12 sm:h-16 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMessageIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center px-2"
                >
                  <span className="text-sm sm:text-base md:text-lg font-medium">
                    {showSuccess ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                      >
                        Ready to connect!
                      </motion.span>
                    ) : simulateProgress ? (
                      <span className="text-gray-300">
                        {loadingStages[currentStage]?.label || currentMessages[currentMessageIndex]}
                      </span>
                    ) : (
                      <span className="text-gray-300">
                        {currentMessages[currentMessageIndex]}
                      </span>
                    )}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bouncing dots - become celebration dots on completion */}
            <div className="flex justify-center gap-2 sm:gap-3 mt-2 sm:mt-4 mb-4 sm:mb-6">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={showSuccess ? {
                    y: [0, -15, 0],
                    scale: [1, 1.5, 1],
                  } : {
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: showSuccess ? 0.6 : simulateProgress ? 1.2 - (progress * 0.005) : 1,
                    repeat: showSuccess ? 2 : Infinity,
                    delay: index * 0.15,
                    ease: showSuccess ? "easeOut" : "easeInOut"
                  }}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full ${
                    index === 0 ? (showSuccess ? 'bg-emerald-400' : 'bg-blue-500') :
                    index === 1 ? (showSuccess ? 'bg-cyan-400' : 'bg-purple-500') :
                    (showSuccess ? 'bg-blue-400' : 'bg-cyan-500')
                  }`}
                />
              ))}
            </div>

            {/* Enhanced progress bar with completion state */}
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
              {/* Background track */}
              <div className="relative w-full h-1.5 sm:h-2 bg-gray-800/30 rounded-full overflow-hidden backdrop-blur-sm">
                {/* Gradient fill */}
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    background: isComplete 
                      ? 'linear-gradient(to right, #10b981, #06b6d4)' 
                      : 'linear-gradient(to right, #3b82f6, #8b5cf6, #06b6d4)',
                    width: `${progress}%`
                  }}
                  transition={{ 
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                >
                  {/* Success shine effect */}
                  {isComplete && (
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ 
                        duration: 1.5,
                        repeat: 2,
                        ease: "linear"
                      }}
                      className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                  )}
                </motion.div>
                
                {/* Stage indicators */}
                {!isComplete && (
                  <div className="absolute inset-0 flex justify-between px-1">
                    {loadingStages.map((stage, index) => (
                      <div 
                        key={index}
                        className={`w-0.5 h-full rounded-full transition-all duration-300 ${
                          progress >= stage.progress 
                            ? 'bg-white/50' 
                            : 'bg-gray-700/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Progress info */}
              <div className="flex justify-between items-center mt-2 px-1">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-medium"
                >
                  <span className={isComplete 
                    ? "text-emerald-400" 
                    : "bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
                  }>
                    {showSuccess 
                      ? 'Complete!' 
                      : simulateProgress 
                        ? loadingStages[currentStage]?.label 
                        : 'Loading...'
                    }
                  </span>
                </motion.div>
                
                <motion.div
                  animate={isComplete ? {
                    scale: [1, 1.2, 1]
                  } : {}}
                  transition={isComplete ? {
                    duration: 0.3,
                    times: [0, 0.5, 1]
                  } : {}}
                  className={`text-xs font-semibold ${
                    isComplete 
                      ? 'text-emerald-400' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent'
                  }`}
                >
                  {Math.round(progress)}%
                </motion.div>
              </div>
            </div>
          </div>

          {/* Domain reference with success pulse */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center"
          >
            <span className={`text-xs sm:text-sm font-medium tracking-wider ${
              showSuccess 
                ? 'text-emerald-400/80' 
                : 'text-gray-500/60'
            }`}>
              Find A Pro Connect (PTY) LTD
            </span>
            
            {showSuccess && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-1 text-[10px] text-emerald-400/60"
              >
                ✓ Successfully loaded
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;