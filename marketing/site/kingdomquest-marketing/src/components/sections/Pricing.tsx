import { Check, X, Star, Heart, Crown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      icon: Heart,
      price: 'R0',
      period: 'Forever',
      description: 'Perfect for getting started with basic Bible stories and family devotions',
      features: [
        '50 Bible stories',
        'Basic family devotions',
        'Simple progress tracking',
        '1 child profile',
        'Basic quizzes',
        'Community support'
      ],
      limitations: [
        'Limited story library',
        'No advanced analytics',
        'No custom content',
        'No church integration'
      ],
      cta: 'Get Started Free',
      ctaVariant: 'outline' as const,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-600',
      popular: false
    },
    {
      name: 'Premium',
      icon: Star,
      price: 'R49.99',
      period: 'per month',
      description: 'Complete family experience with unlimited access and advanced features',
      features: [
        'All 500+ Bible stories',
        'Unlimited family devotions',
        'Advanced progress analytics',
        'Unlimited child profiles',
        'Adaptive learning quizzes',
        'Offline content access',
        'Priority customer support',
        'Weekly new content updates',
        'Achievement certificates',
        'Prayer journal features'
      ],
      limitations: [],
      cta: 'Start Premium Trial',
      ctaVariant: 'default' as const,
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200',
      iconColor: 'text-primary-600',
      popular: true
    },
    {
      name: 'Church',
      icon: Crown,
      price: 'R199.99',
      period: 'per month',
      description: 'Complete ministry solution with congregation management and custom branding',
      features: [
        'Everything in Premium',
        'Unlimited church families',
        'Congregation-wide analytics',
        'Custom church branding',
        'Ministry admin dashboard',
        'Event calendar integration',
        'Bulk family management',
        'Custom content creation',
        'Curriculum alignment tools',
        'Dedicated ministry support',
        'Training and onboarding',
        'Data export capabilities'
      ],
      limitations: [],
      cta: 'Schedule Church Demo',
      ctaVariant: 'default' as const,
      bgColor: 'bg-secondary-50',
      borderColor: 'border-secondary-200',
      iconColor: 'text-secondary-600',
      popular: false
    }
  ];

  const faqItems = [
    {
      question: 'Can I switch plans at any time?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and you\'ll be billed pro-rata for any upgrades.'
    },
    {
      question: 'Is there a free trial for Premium and Church plans?',
      answer: 'Yes! We offer a 14-day free trial for Premium plans and a 30-day free trial for Church plans. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our encrypted payment system.'
    },
    {
      question: 'Can I cancel at any time?',
      answer: 'Absolutely! There are no long-term contracts. You can cancel your subscription at any time, and you\'ll continue to have access until the end of your billing period.'
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent-100 text-accent-800 px-4 py-2">
            Simple, Transparent Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Choose the Perfect Plan for Your Family
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and upgrade as your family grows. All plans include our core features 
            with no hidden fees or surprise charges.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card key={index} className={`${plan.bgColor} ${plan.borderColor} border-2 relative hover:shadow-xl transition-all duration-300 ${plan.popular ? 'scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="gradient-primary text-white px-4 py-2">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 ${plan.iconColor}`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-2">/{plan.period}</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.limitations.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-500 mb-3">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitIndex) => (
                            <li key={limitIndex} className="flex items-start">
                              <X className="h-4 w-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                              <span className="text-gray-500 text-sm">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Button 
                    className={`w-full ${plan.popular ? 'btn-primary bg-primary hover:bg-primary-700 text-white' : ''}`}
                    variant={plan.ctaVariant}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mb-16">
          <div className="gradient-secondary rounded-2xl p-8 text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-4">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-gray-100 max-w-2xl mx-auto">
              Try KingdomQuest risk-free! If you're not completely satisfied within the first 30 days, 
              we'll refund your money, no questions asked.
            </p>
          </div>
        </div>

        {/* Pricing FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              Pricing Questions
            </h3>
            <p className="text-gray-600">
              Everything you need to know about our pricing and plans.
            </p>
          </div>
          
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <Card key={index} className="bg-gray-50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {item.question}
                  </h4>
                  <p className="text-gray-600">
                    {item.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <div className="gradient-primary text-white rounded-2xl p-8">
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Ready to Transform Your Family's Faith Journey?
            </h3>
            <p className="text-gray-100 mb-6 max-w-2xl mx-auto text-lg">
              Join thousands of families who are already growing closer to God with KingdomQuest.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg"
                className="btn-accent bg-accent hover:bg-accent-700 text-white px-8 py-3"
                onClick={() => scrollToSection('hero')}
              >
                Start Free Today
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="btn-secondary border-white text-white hover:bg-white hover:text-primary px-8 py-3"
                onClick={() => scrollToSection('faq')}
              >
                Have Questions?
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;