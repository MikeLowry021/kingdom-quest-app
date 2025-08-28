import { Mail, MapPin, Phone, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/images/kingdomquest-logo-horizontal.png" 
                alt="KingdomQuest - Christian Family Bible App"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              Transforming children's spiritual journey through interactive Biblical stories, 
              engaging quizzes, and meaningful family devotions. Safe, educational, and designed 
              with Christian families in mind.
            </p>
            
            {/* App Store Buttons Placeholder */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2 h-12 px-6"
              >
                <div className="w-6 h-6 bg-gray-900 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2 h-12 px-6"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('for-families')}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  For Families
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('for-churches')}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  For Churches
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('safety')}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Safety Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>support@kingdomquest.app</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+27 (0) 123 456 789</span>
              </li>
              <li className="flex items-start space-x-2 text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Cape Town, South Africa</span>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
            <span>© {currentYear} KingdomQuest. All rights reserved.</span>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Made with love for Christian families worldwide
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
