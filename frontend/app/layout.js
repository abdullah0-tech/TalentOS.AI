import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../providers/ThemeProvider';

export const metadata = {
  title: 'HireFlow AI - AI-Powered ATS & Recruitment SaaS',
  description: 'Streamline your hiring process, isolate company workspaces, and screen candidates automatically with advanced Grok AI resume analysis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen theme-transition">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
