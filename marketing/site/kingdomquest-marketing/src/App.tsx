import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './pages/HomePage';
import { Toaster } from 'sonner';
import './index.css';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <Router>
          <div className="min-h-screen bg-white">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </div>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
