import { useState } from 'react';
import { Button } from '../ui/button';
import { Menu, X, Download } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'For Families', id: 'for-families' },
    { name: 'For Churches', id: 'for-churches' },
    { name: 'Safety', id: 'safety' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'FAQ', id: 'faq' }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/images/kingdomquest-logo-horizontal.png" 
              alt="KingdomQuest - Christian Family Bible App"
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-600 hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => scrollToSection('pricing')}
              className="btn-secondary border-secondary text-primary hover:bg-secondary/10"
            >
              View Pricing
            </Button>
            <Button 
              onClick={() => scrollToSection('hero')}
              className="btn-primary bg-primary hover:bg-primary-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download App
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary transition-colors"
              >
                {item.name}
              </button>
            ))}
            <div className="pt-4 space-y-2">
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('pricing')}
                className="w-full btn-secondary border-secondary text-primary hover:bg-secondary/10"
              >
                View Pricing
              </Button>
              <Button 
                onClick={() => scrollToSection('hero')}
                className="w-full btn-primary bg-primary hover:bg-primary-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download App
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
