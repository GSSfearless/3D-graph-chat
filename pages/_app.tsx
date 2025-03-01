import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastManager } from '../components/ui/ToastManager';
import '../styles/globals.css';
import 'nprogress/nprogress.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <ToastManager />
    </AuthProvider>
  );
} 