import "./globals.css";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "AI Fitness Coach - Personalized Workout & Diet Plans",
  description: "Get AI-powered personalized fitness and nutrition plans tailored to your goals, fitness level, and preferences.",
  keywords: "fitness, workout, diet plan, AI coach, personalized training, nutrition",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const store = localStorage.getItem('fitness-coach-storage');
                if (store) {
                  const { state } = JSON.parse(store);
                  if (state?.darkMode) {
                    document.documentElement.classList.add('dark');
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
