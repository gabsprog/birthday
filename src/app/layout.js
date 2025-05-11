import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
});

export const metadata = {
  title: 'BirthdayLove.site - Create Special Digital Gifts',
  description: 'Create beautiful digital gifts for birthdays, anniversaries, or express your love with personalized sites.',
  keywords: 'digital gifts, birthday gift, anniversary gift, love declaration, online gift, surprise gift',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-light dark:bg-dark text-gray-900 dark:text-white font-sans">
        {children}
      </body>
    </html>
  );
}