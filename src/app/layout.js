import './globals.css';
import { Inter, Nunito } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });

export const metadata = {
  title: 'TimeBox',
  description: 'Visualize your time',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${nunito.variable}`}>{children}</body>
    </html>
  );
}
