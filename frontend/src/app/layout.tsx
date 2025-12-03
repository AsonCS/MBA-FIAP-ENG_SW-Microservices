import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Micro-Feed Platform',
  description: 'A micro-service based content platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}