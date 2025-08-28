import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, Play, Star, Users, Heart, Shield } from 'lucide-react';

const Hero = () => {
  const stats = [
    { icon: Users, label: 'Happy Families', value: '10,000+' },
    { icon: Heart, label: 'Bible Stories', value: '500+' },
    { icon: Star, label: 'App Store Rating', value: '4.9' },
    { icon: Shield, label: 'Child Safe', value: '100%' }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative gradient-primary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 px-4 py-2 text-sm font-medium">
              Trusted by Christian Families Worldwide
            </Badge>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Transform Your Child's
              <span className="block text-gradient-brand">
                Spiritual Journey
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Interactive Bible stories, engaging quizzes, and meaningful family devotions 
              that grow with your child. Safe, educational, and designed specifically for 
              Christian families.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Button 
                size="lg" 
                className="btn-accent bg-accent hover:bg-accent-700 text-white text-lg px-8 py-4 h-14"
                onClick={() => scrollToSection('pricing')}
              >
                <Download className="h-5 w-5 mr-2" />
                Download Free App
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="btn-secondary border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4 h-14"
                onClick={() => scrollToSection('how-it-works')}
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-2">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-bold text-lg text-white">{stat.value}</div>
                    <div className="text-sm text-gray-200">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Hero Image/Visual */}
          <div className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-lg">
              {/* Phone Mockup */}
              <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="bg-gray-100 px-6 py-2 flex justify-between items-center">
                    <div className="text-xs font-medium">9:41</div>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* App Content Mockup */}
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center space-x-3">
                      <img 
                        src="/images/kingdomquest-icon-only.png" 
                        alt="KingdomQuest App Icon"
                        className="w-8 h-8 rounded-lg"
                      />
                      <span className="font-bold text-gray-900">KingdomQuest</span>
                    </div>
                    
                    {/* Story Card */}
                    <div className="gradient-secondary rounded-xl p-4 text-white">
                      <div className="w-full h-24 bg-white/20 rounded-lg mb-3 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold font-serif mb-1">Noah's Ark</h3>
                      <p className="text-sm text-white/90">An amazing story of faith and obedience</p>
                      <div className="flex justify-between items-center mt-3">
                        <Badge className="bg-accent text-white text-xs">Age 5-8</Badge>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex justify-around pt-4 border-t">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-1">
                          <Heart className="w-4 h-4 text-primary-600" />
                        </div>
                        <span className="text-xs text-gray-600">Stories</span>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-1">
                          <Star className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-400">Quiz</span>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-1">
                          <Users className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-400">Family</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-gold animate-bounce">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
