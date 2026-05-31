import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { I18nProvider } from '@/lib/i18n';
import ServerAwakeCheck from '@/components/ServerAwakeCheck';

export const metadata = {
  title: 'Student Loan Atelier',
  description: 'A personal student loan dossier — checklist, documents, and volunteer hours.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <I18nProvider>
          <ServerAwakeCheck>
            <AuthProvider>{children}</AuthProvider>
          </ServerAwakeCheck>
        </I18nProvider>
      </body>
    </html>
  );
}
