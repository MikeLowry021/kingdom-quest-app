import { Heart, Users, BookOpen, Trophy, Calendar, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const ForFamilies = () => {
  const familyFeatures = [
    {
      icon: Heart,
      title: 'Family Devotions',
      description: 'Meaningful devotions designed to bring your family closer to God and each other.',
      benefits: [
        'Daily family devotion plans',
        'Age-appropriate discussion guides',
        'Prayer prompts and activities',
        'Memory verse challenges'
      ],
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent-600'
    },
    {
      icon: Users,
      title: 'Multiple Child Profiles',
      description: 'Create individual profiles for each child with personalized learning paths.',
      benefits: [
        'Unlimited child profiles',
        'Individual progress tracking',
        'Age-appropriate content filtering',
        'Personalized recommendations'
      ],
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600'
    },
    {
      icon: BookOpen,
      title: 'Interactive Learning',
      description: 'Engaging Bible stories and lessons that make learning fun and memorable.',
      benefits: [
        '500+ interactive Bible stories',
        'Engaging animations and sounds',
        'Comprehension quizzes',
        'Character-building lessons'
      ],
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent-600'
    },
    {
      icon: Trophy,
      title: 'Achievement System',
      description: 'Motivate learning with badges, certificates, and milestone celebrations.',
      benefits: [
        'Progress badges and rewards',
        'Completion certificates',
        'Milestone celebrations',
        'Family achievement sharing'
      ],
      bgColor: 'bg-secondary-50',
      iconColor: 'text-secondary-600'
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Learn at your own pace with flexible scheduling that fits your family routine.',
      benefits: [
        'Self-paced learning',
        'Offline content access',
        'Scheduled reminders',
        'Weekend family activities'
      ],
      bgColor: 'bg-tertiary-50',
      iconColor: 'text-tertiary-600'
    },
    {
      icon: MessageCircle,
      title: 'Discussion Starters',
      description: 'Thoughtful questions and activities to spark meaningful family conversations.',
      benefits: [
        'Age-appropriate discussion questions',
        'Family activity suggestions',
        'Real-life application ideas',
        'Conversation guides for parents'
      ],
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600'
    }
  ];

  const testimonials = [
    {
      name: 'Jennifer S.',
      role: 'Homeschooling Mom',
      children: '3 children (ages 5, 8, 11)',
      quote: 'KingdomQuest has revolutionized our family devotion time. My kids actually ask when we can do our Bible stories together!',
      rating: 5
    },
    {
      name: 'Michael & Lisa R.',
      role: 'Busy Working Parents',
      children: '2 children (ages 6, 9)',
      quote: 'As working parents, finding quality Christian content was challenging. KingdomQuest makes it easy and engaging for our whole family.',
      rating: 5
    },
    {
      name: 'David P.',
      role: 'Single Dad',
      children: '1 child (age 7)',
      quote: 'The discussion guides help me have meaningful conversations with my daughter about faith. It\'s been a blessing for both of us.',
      rating: 5
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="for-families" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent-100 text-accent-800 px-4 py-2">
            For Christian Families
          </Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Strengthen Your Family's Faith Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bring your family closer together through interactive Bible stories, meaningful discussions, 
            and shared spiritual growth experiences designed for busy Christian families.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {familyFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className={`${feature.bgColor} border-2 hover:shadow-lg transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-4 ${feature.iconColor}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                  </div>
                  
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start text-sm text-gray-700">
                        <div className={`w-1.5 h-1.5 ${feature.iconColor.replace('text-', 'bg-')} rounded-full mr-2 mt-2 flex-shrink-0`}></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Family Testimonials */}
        <div className="gradient-secondary rounded-2xl p-8 mb-16 text-white">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-serif font-bold mb-4">
              What Families Are Saying
            </h3>
            <p className="text-gray-100 max-w-2xl mx-auto">
              See how KingdomQuest is transforming family devotion time and strengthening faith in Christian homes worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.children}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="gradient-primary text-white rounded-2xl p-8">
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Start Your Family's Faith Adventure Today
            </h3>
            <p className="text-gray-100 mb-6 max-w-2xl mx-auto text-lg">
              Join thousands of families who are already using KingdomQuest to grow closer to God and each other.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg"
                className="btn-accent bg-accent hover:bg-accent-700 text-white px-8 py-3"
                onClick={() => scrollToSection('pricing')}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="btn-secondary border-white text-white hover:bg-white hover:text-primary px-8 py-3"
                onClick={() => scrollToSection('how-it-works')}
              >
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForFamilies;