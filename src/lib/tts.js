// Text-to-Speech using Web Speech API (built-in browser feature)
export function speakText(text, options = {}) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Try to use a better voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Enhanced'))
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    return new Promise((resolve, reject) => {
      utterance.onend = resolve;
      utterance.onerror = reject;
      window.speechSynthesis.speak(utterance);
    });
  } else {
    throw new Error('Text-to-speech not supported in this browser');
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function formatPlanForSpeech(plan, section) {
  if (section === 'workout') {
    let text = `Here is your workout plan. ${plan.workoutPlan.overview}. `;
    
    plan.workoutPlan.weeklySchedule.slice(0, 3).forEach((day) => {
      text += `${day.day}, ${day.focus}. `;
      day.exercises.slice(0, 3).forEach((exercise) => {
        text += `${exercise.name}, ${exercise.sets} sets of ${exercise.reps} reps. `;
      });
    });
    
    return text;
  } else if (section === 'diet') {
    let text = `Here is your diet plan. Daily calories: ${plan.dietPlan.dailyCalories}. `;
    
    Object.entries(plan.dietPlan.meals).forEach(([mealName, meal]) => {
      const mealTitle = mealName.replace(/([A-Z])/g, ' $1').trim();
      text += `${mealTitle}, at ${meal.time}. `;
      meal.items.slice(0, 2).forEach((item) => {
        text += `${item}. `;
      });
    });
    
    return text;
  }
  
  return '';
}

// Alternative: ElevenLabs API integration (premium option)
export async function speakWithElevenLabs(text) {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const audio = new Audio(audioUrl);
    audio.play();
    
    return audio;
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    throw error;
  }
}
