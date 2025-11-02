'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, History, Github, Linkedin, Mail } from 'lucide-react';

import useStore from '@/store/useStore';
import { generateFitnessPlan } from '@/lib/gemini';
import UserForm from '@/components/UserForm';
import FitnessPlan from '@/components/FitnessPlan';
import Hero from '@/components/Hero';
import MotivationQuote from '@/components/MotivationQuote';
import ThemeToggle from '@/components/ThemeToggle';
import SavedPlansModal from '@/components/SavedPlansModal';

export default function Home() {
  const { userData, fitnessPlan, darkMode, savedPlans, setUserData, setFitnessPlan, clearPlan, savePlan, deleteSavedPlan } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSavedPlans, setShowSavedPlans] = useState(false);

  // Apply dark mode class to document immediately
  useEffect(() => {
    console.log('Dark mode changed:', darkMode);
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      console.log('Added dark class');
    } else {
      html.classList.remove('dark');
      console.log('Removed dark class');
    }
  }, [darkMode]);

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setUserData(formData);

    try {
      const plan = await generateFitnessPlan(formData);
      setFitnessPlan(plan);
      toast.success('Your personalized plan is ready!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to generate plan. Please try again.');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!userData) return;
    
    setIsLoading(true);
    try {
      const plan = await generateFitnessPlan(userData);
      setFitnessPlan(plan);
      toast.success('Plan regenerated successfully!');
    } catch (error) {
      toast.error('Failed to regenerate plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (planData) => {
    savePlan(planData);
  };

  const handleLoadPlan = (plan) => {
    setUserData(plan.userData);
    setFitnessPlan(plan.fitnessPlan);
    toast.success('Plan loaded successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to start over? Current plan will be lost if not saved.')) {
      clearPlan();
      toast.success('Ready for a new plan!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Toaster position="top-center" />
      <ThemeToggle />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <AnimatePresence mode="wait">
          {!fitnessPlan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero />
              <div className="mb-8">
                <MotivationQuote />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!fitnessPlan ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 border border-gray-200 dark:border-gray-700">
                <UserForm onSubmit={handleFormSubmit} isLoading={isLoading} />
              </div>

              {/* Saved Plans Button */}
              {savedPlans.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowSavedPlans(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all shadow-lg"
                  >
                    <History className="w-5 h-5" />
                    View Saved Plans ({savedPlans.length})
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Start Over
                </button>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData.name}'s Fitness Plan
                </h2>

                <button
                  onClick={() => setShowSavedPlans(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <History className="w-5 h-5" />
                  History
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <FitnessPlan
                  userData={userData}
                  fitnessPlan={fitnessPlan}
                  onRegenerate={handleRegenerate}
                  onSave={handleSave}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center space-y-4"
        >
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/jayashish05"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-gray-800 rounded-full hover:scale-110 transition-all shadow-lg"
            >
              <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </a>
            <a
              href="https://www.linkedin.com/in/jayashish-muppur/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-gray-800 rounded-full hover:scale-110 transition-all shadow-lg"
            >
              <Linkedin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </a>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            Built with ❤️ using Next.js, Tailwind CSS & Google Gemini AI
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © 2025 AI Fitness Coach. Empowering your fitness journey with AI.
          </p>
        </motion.footer>
      </div>

      {/* Saved Plans Modal */}
      {showSavedPlans && (
        <SavedPlansModal
          plans={savedPlans}
          onClose={() => setShowSavedPlans(false)}
          onLoad={handleLoadPlan}
          onDelete={deleteSavedPlan}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center"
          >
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Creating your personalized plan...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              This may take 10-30 seconds
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
