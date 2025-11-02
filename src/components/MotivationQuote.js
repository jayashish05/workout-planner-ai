'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { generateMotivationalQuote } from '@/lib/gemini';

export default function MotivationQuote() {
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadQuote = async () => {
    setIsLoading(true);
    try {
      const newQuote = await generateMotivationalQuote();
      setQuote(newQuote);
    } catch (error) {
      setQuote('Your only limit is you. Push harder today!');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadQuote();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-600 p-6 rounded-lg shadow-md border border-blue-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-6 h-6" />
          <h3 className="font-bold text-lg">Daily Motivation</h3>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          onClick={loadQuote}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all"
          disabled={isLoading}
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={quote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-white text-xl md:text-2xl font-semibold italic"
        >
          "{quote}"
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
