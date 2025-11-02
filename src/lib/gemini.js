import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function generateFitnessPlan(userData) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `You are an expert fitness coach and nutritionist. Generate a comprehensive, personalized fitness and diet plan based on the following user information:

Name: ${userData.name}
Age: ${userData.age}
Gender: ${userData.gender}
Height: ${userData.height} cm
Weight: ${userData.weight} kg
BMI: ${calculateBMI(userData.height, userData.weight).toFixed(1)}
Fitness Goal: ${userData.goal}
Current Fitness Level: ${userData.fitnessLevel}
Workout Location: ${userData.location}
Dietary Preference: ${userData.diet}
${userData.medicalHistory ? `Medical History: ${userData.medicalHistory}` : ''}
${userData.stressLevel ? `Stress Level: ${userData.stressLevel}` : ''}

Please provide a detailed response in the following JSON format (respond ONLY with valid JSON, no markdown formatting):

{
  "workoutPlan": {
    "overview": "Brief overview of the workout strategy",
    "weeklySchedule": [
      {
        "day": "Monday",
        "focus": "e.g., Upper Body Strength",
        "exercises": [
          {
            "name": "Exercise name",
            "sets": "3-4",
            "reps": "8-12",
            "rest": "60-90 seconds",
            "description": "Brief form tips"
          }
        ],
        "duration": "45-60 minutes"
      }
    ],
    "tips": ["Important workout tips"]
  },
  "dietPlan": {
    "dailyCalories": "e.g., 2000-2200",
    "macros": {
      "protein": "e.g., 150g",
      "carbs": "e.g., 200g",
      "fats": "e.g., 60g"
    },
    "meals": {
      "breakfast": {
        "time": "7:00-8:00 AM",
        "items": ["meal items"],
        "calories": "~500"
      },
      "midMorningSnack": {
        "time": "10:00-10:30 AM",
        "items": ["snack items"],
        "calories": "~200"
      },
      "lunch": {
        "time": "12:30-1:30 PM",
        "items": ["meal items"],
        "calories": "~600"
      },
      "eveningSnack": {
        "time": "4:00-4:30 PM",
        "items": ["snack items"],
        "calories": "~200"
      },
      "dinner": {
        "time": "7:00-8:00 PM",
        "items": ["meal items"],
        "calories": "~500"
      }
    },
    "hydration": "Daily water intake recommendation",
    "tips": ["Important diet tips"]
  },
  "motivation": {
    "quote": "An inspiring fitness quote",
    "dailyTips": ["Lifestyle and posture tips"],
    "expectedResults": "What to expect in 4-8 weeks"
  }
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to extract JSON
    let cleanedText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsedPlan = JSON.parse(cleanedText);
    return parsedPlan;
  } catch (error) {
    console.error("Error generating fitness plan:", error);
    throw new Error("Failed to generate fitness plan. Please try again.");
  }
}

export async function generateMotivationalQuote() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  const prompt = "Generate a short, powerful, and unique motivational fitness quote (max 15 words). Return ONLY the quote text, no quotation marks or extra formatting.";
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating quote:", error);
    return "Your only limit is you. Push harder today!";
  }
}

export async function generateExerciseImage(exerciseName) {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: exerciseName
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error || 'Failed to generate image');
    }
    
    const data = await response.json();
    return data.imageUrl;
    
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Image generation handled via server-side API route at /api/generate-image
// Uses Replicate API (Stable Diffusion) for high-quality AI images

function calculateBMI(height, weight) {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export { calculateBMI };
