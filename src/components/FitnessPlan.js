'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Utensils, 
  Download, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Save,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  TrendingUp
} from 'lucide-react';
import { exportToPDF } from '@/lib/pdfExport';
import { speakText, stopSpeaking, formatPlanForSpeech } from '@/lib/tts';
import { calculateBMI, generateExerciseImage } from '@/lib/gemini';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function FitnessPlan({ userData, fitnessPlan, onRegenerate, onSave }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedDay, setExpandedDay] = useState(0);
  const [activeTab, setActiveTab] = useState('workout');

  const bmi = calculateBMI(userData.height, userData.weight);
  const bmiCategory = getBMICategory(bmi);

  const handleSpeak = async (section) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      const text = formatPlanForSpeech(fitnessPlan, section);
      await speakText(text);
      setIsSpeaking(false);
    } catch (error) {
      console.error('Speech error:', error);
      toast.error('Speech not supported in this browser');
      setIsSpeaking(false);
    }
  };

  const handleExport = () => {
    try {
      exportToPDF(userData, fitnessPlan);
      toast.success('Plan exported successfully!');
    } catch (error) {
      toast.error('Failed to export plan');
    }
  };

  const handleSave = () => {
    onSave({ userData, fitnessPlan });
    toast.success('Plan saved successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header Stats */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="BMI"
          value={bmi.toFixed(1)}
          subtitle={bmiCategory}
          color="blue"
        />
        <StatCard
          icon={<Flame className="w-6 h-6" />}
          label="Daily Calories"
          value={fitnessPlan.dietPlan.dailyCalories}
          color="orange"
        />
        <StatCard
          icon={<Dumbbell className="w-6 h-6" />}
          label="Goal"
          value={userData.goal.replace('-', ' ')}
          color="purple"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Level"
          value={userData.fitnessLevel}
          color="green"
        />
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <ActionButton
          icon={<Download className="w-4 h-4" />}
          label="Export PDF"
          onClick={handleExport}
          color="blue"
        />
        <ActionButton
          icon={<Save className="w-4 h-4" />}
          label="Save Plan"
          onClick={handleSave}
          color="green"
        />
        <ActionButton
          icon={<RefreshCw className="w-4 h-4" />}
          label="Regenerate"
          onClick={onRegenerate}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <TabButton
          active={activeTab === 'workout'}
          onClick={() => setActiveTab('workout')}
          icon={<Dumbbell className="w-5 h-5" />}
          label="Workout Plan"
        />
        <TabButton
          active={activeTab === 'diet'}
          onClick={() => setActiveTab('diet')}
          icon={<Utensils className="w-5 h-5" />}
          label="Diet Plan"
        />
        <TabButton
          active={activeTab === 'motivation'}
          onClick={() => setActiveTab('motivation')}
          icon={<Sparkles className="w-5 h-5" />}
          label="Motivation"
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'workout' && (
          <WorkoutTab
            plan={fitnessPlan.workoutPlan}
            expandedDay={expandedDay}
            setExpandedDay={setExpandedDay}
            isSpeaking={isSpeaking}
            onSpeak={() => handleSpeak('workout')}
          />
        )}
        {activeTab === 'diet' && (
          <DietTab
            plan={fitnessPlan.dietPlan}
            isSpeaking={isSpeaking}
            onSpeak={() => handleSpeak('diet')}
          />
        )}
        {activeTab === 'motivation' && (
          <MotivationTab motivation={fitnessPlan.motivation} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ icon, label, value, subtitle, color }) {
  const colors = {
    blue: 'bg-blue-600 border-blue-700',
    orange: 'bg-orange-600 border-orange-700',
    purple: 'bg-purple-600 border-purple-700',
    green: 'bg-green-600 border-green-700',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${colors[color]} border p-6 rounded-lg text-white shadow-md`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm opacity-90">{label}</p>
          <p className="text-2xl font-bold capitalize">{value}</p>
          {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({ icon, label, onClick, color }) {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${colors[color]} text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg transition-all`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
        active
          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function WorkoutTab({ plan, expandedDay, setExpandedDay, isSpeaking, onSpeak }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Workout Overview
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{plan.overview}</p>
          </div>
          <button
            onClick={onSpeak}
            className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {plan.weeklySchedule.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={() => setExpandedDay(expandedDay === index ? -1 : index)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <div className="text-left">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{day.day}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{day.focus}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {day.duration}
                </p>
              </div>
              {expandedDay === index ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedDay === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6 space-y-4">
                    {day.exercises.map((exercise, i) => (
                      <ExerciseCard key={i} exercise={exercise} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {plan.tips && (
        <div className="bg-blue-600 border border-blue-700 p-6 rounded-lg text-white shadow-md">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Workout Tips
          </h4>
          <ul className="space-y-2">
            {plan.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-xl">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function DietTab({ plan, isSpeaking, onSpeak }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Nutrition Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MacroCard label="Calories" value={plan.dailyCalories} />
              <MacroCard label="Protein" value={plan.macros.protein} color="red" />
              <MacroCard label="Carbs" value={plan.macros.carbs} color="yellow" />
              <MacroCard label="Fats" value={plan.macros.fats} color="green" />
            </div>
          </div>
          <button
            onClick={onSpeak}
            className="p-3 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-800 transition-all"
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(plan.meals).map(([mealName, meal], index) => (
          <MealCard key={mealName} mealName={mealName} meal={meal} index={index} />
        ))}
      </div>

      <div className="bg-blue-600 border border-blue-700 p-6 rounded-lg text-white shadow-md">
        <h4 className="font-bold mb-2">💧 {plan.hydration}</h4>
        {plan.tips && (
          <div className="mt-4 space-y-2">
            {plan.tips.map((tip, i) => (
              <p key={i} className="flex items-start gap-2">
                <span>•</span>
                <span>{tip}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MacroCard({ label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
  };

  return (
    <div className={`p-4 rounded-xl ${colors[color]}`}>
      <p className="text-sm opacity-75">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function MotivationTab({ motivation }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-blue-600 border border-blue-700 p-8 rounded-lg text-white shadow-md"
      >
        <Sparkles className="w-12 h-12 mb-4" />
        <p className="text-2xl md:text-3xl font-bold italic mb-4">"{motivation.quote}"</p>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Expected Results
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {motivation.expectedResults}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Daily Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {motivation.dailyTips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <p className="text-gray-800 dark:text-gray-200">{tip}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ExerciseCard({ exercise }) {
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageClick = async () => {
    if (!showImage) {
      setIsGenerating(true);
      setShowImage(true);
      try {
        const url = await generateExerciseImage(exercise.name);
        setImageUrl(url);
      } catch (error) {
        console.error('Failed to generate image:', error);
        setShowImage(false);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setShowImage(false);
      setImageUrl('');
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-semibold text-gray-900 dark:text-white flex-1">
          {exercise.name}
        </h5>
        <button
          onClick={handleImageClick}
          className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-all text-xs"
          title="View exercise image"
        >
          {showImage ? '📷 Hide' : '🖼️ Show'}
        </button>
      </div>
      
      {showImage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 400 }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center h-[400px]"
        >
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Generating image...</p>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={exercise.name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.src = `https://source.unsplash.com/800x600/?fitness,exercise`;
              }}
            />
          ) : null}
        </motion.div>
      )}
      
      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span>Sets: {exercise.sets}</span>
        <span>Reps: {exercise.reps}</span>
        <span>Rest: {exercise.rest}</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {exercise.description}
      </p>
    </div>
  );
}

function MealCard({ mealName, meal, index }) {
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageClick = async () => {
    if (!showImage) {
      setIsGenerating(true);
      setShowImage(true);
      try {
        const mealDescription = meal.items.join(', ');
        const url = await generateExerciseImage(mealDescription);
        setImageUrl(url);
      } catch (error) {
        console.error('Failed to generate image:', error);
        setShowImage(false);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setShowImage(false);
      setImageUrl('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-lg text-gray-900 dark:text-white capitalize">
          {mealName.replace(/([A-Z])/g, ' $1').trim()}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">{meal.time}</span>
          <button
            onClick={handleImageClick}
            className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-all text-xs"
            title="View meal image"
          >
            {showImage ? '📷' : '🖼️'}
          </button>
        </div>
      </div>
      
      {showImage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 400 }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center h-[400px]"
        >
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Generating image...</p>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={mealName}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.src = `https://source.unsplash.com/800x600/?food,meal`;
              }}
            />
          ) : null}
        </motion.div>
      )}
      
      <div className="mb-3">
        <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full text-sm font-medium">
          {meal.calories}
        </span>
      </div>
      <ul className="space-y-2">
        {meal.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <span className="text-green-500 mt-1">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
