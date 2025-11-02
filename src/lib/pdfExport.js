import jsPDF from 'jspdf';

export function exportToPDF(userData, fitnessPlan) {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);

  // Title
  pdf.setFontSize(22);
  pdf.setFont(undefined, 'bold');
  pdf.text('AI FITNESS COACH', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  
  pdf.setFontSize(18);
  pdf.text('Your Personalized Fitness Plan', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // User Info
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Name: ${userData.name}`, margin, yPosition);
  yPosition += 7;
  pdf.text(`Age: ${userData.age} | Gender: ${userData.gender} | Goal: ${userData.goal}`, margin, yPosition);
  yPosition += 7;
  pdf.text(`Height: ${userData.height}cm | Weight: ${userData.weight}kg`, margin, yPosition);
  yPosition += 15;

    // Workout Plan
  if (yPosition > 200) {
    pdf.addPage();
    yPosition = 20;
  }

  // Draw a separator line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('WORKOUT PLAN', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  const workoutOverview = pdf.splitTextToSize(fitnessPlan.workoutPlan.overview, maxWidth);
  pdf.text(workoutOverview, margin, yPosition);
  yPosition += workoutOverview.length * 5 + 8;

  // Weekly Schedule
  fitnessPlan.workoutPlan.weeklySchedule.slice(0, 3).forEach((day) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${day.day} - ${day.focus}`, margin, yPosition);
    yPosition += 6;
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'italic');
    pdf.text(`Duration: ${day.duration}`, margin + 5, yPosition);
    yPosition += 5;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    day.exercises.slice(0, 4).forEach((exercise) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      const exerciseText = `- ${exercise.name}: ${exercise.sets} sets x ${exercise.reps} reps (Rest: ${exercise.rest})`;
      pdf.text(exerciseText, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  });

  // Diet Plan
  if (yPosition > 200) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('DIET PLAN', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Daily Target: ${fitnessPlan.dietPlan.dailyCalories} calories`, margin, yPosition);
  yPosition += 7;
  
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Macros - Protein: ${fitnessPlan.dietPlan.macros.protein} | Carbs: ${fitnessPlan.dietPlan.macros.carbs} | Fats: ${fitnessPlan.dietPlan.macros.fats}`, margin, yPosition);
  yPosition += 10;

  // Meals
  Object.entries(fitnessPlan.dietPlan.meals).forEach(([mealName, meal]) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFont(undefined, 'bold');
    const mealTitle = mealName.replace(/([A-Z])/g, ' $1').trim();
    pdf.text(`${mealTitle.charAt(0).toUpperCase() + mealTitle.slice(1)} - ${meal.time}`, margin, yPosition);
    yPosition += 5;
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'italic');
    pdf.text(`Calories: ${meal.calories}`, margin + 5, yPosition);
    yPosition += 5;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    meal.items.slice(0, 4).forEach((item) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(`- ${item}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 3;
  });

  // Motivation
  if (yPosition > 230) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('MOTIVATION & TIPS', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Your Daily Motivation:', margin, yPosition);
  yPosition += 7;
  
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'italic');
  const quote = pdf.splitTextToSize(`"${fitnessPlan.motivation.quote}"`, maxWidth);
  pdf.text(quote, margin, yPosition);
  yPosition += quote.length * 6 + 8;

  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text('Expected Results:', margin, yPosition);
  yPosition += 7;
  
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  const results = pdf.splitTextToSize(fitnessPlan.motivation.expectedResults, maxWidth);
  pdf.text(results, margin, yPosition);

  // Footer
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.text(
      `Generated by AI Fitness Coach | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  pdf.save(`${userData.name}_Fitness_Plan.pdf`);
}
