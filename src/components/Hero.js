'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Sparkles, Target, TrendingUp } from 'lucide-react';

export default function Hero() {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    { icon: <Dumbbell className="w-6 h-6" />, text: 'AI-Powered Workouts' },
    { icon: <Sparkles className="w-6 h-6" />, text: 'Personalized Diet Plans' },
    { icon: <Target className="w-6 h-6" />, text: 'Goal-Based Training' },
    { icon: <TrendingUp className="w-6 h-6" />, text: 'Track Your Progress' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center space-y-6 mb-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="inline-block p-4 bg-blue-600 rounded-2xl shadow-lg"
      >
        <Dumbbell className="w-16 h-16 text-white" />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white"
      >
        AI Fitness Coach
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
      >
        Get your personalized workout and diet plan powered by advanced AI technology
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-4"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            animate={{
              scale: currentFeature === index ? 1.05 : 1,
              opacity: currentFeature === index ? 1 : 0.7,
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              currentFeature === index
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {feature.icon}
            <span className="font-medium">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
