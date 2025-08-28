import { Download, User, Play, Heart, Trophy, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      icon: Download,
      title: 'Download & Create Account',
      description: 'Get KingdomQuest from your app store and create a free family account in minutes.',
      details: [
        'Quick 2-minute setup',
        'Add multiple children',
        'Set age-appropriate content',
        'Choose your language'
      ],
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
      borderColor: 'border-primary-200'
    },
    {
      step: 2,
      icon: User,
      title: 'Customize for Your Child',
      description: 'Set up personalized profiles with age-appropriate content and learning preferences.',
      details: [
        'Age-based content filtering',
        'Learning difficulty settings',
        'Favorite Bible characters',
        'Progress tracking setup'
      ],
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent-600',
      borderColor: 'border-accent-200'
    },
    {
      step: 3,
      icon: Play,
      title: 'Explore Interactive Stories',
      description: 'Dive into beautifully crafted Bible stories with interactive elements and engaging visuals.',
      details: [
        '500+ Bible stories',
        'Interactive animations',
        'Character voice-overs',
        'Discussion questions'
      ],
      bgColor: 'bg-secondary-50',
      iconColor: 'text-secondary-600',
      borderColor: 'border-secondary-200'
    },
    {
      step: 4,
      icon: Trophy,
      title: 'Take Fun Quizzes',
      description: 'Test knowledge with age-appropriate quizzes that adapt to your child\'s learning pace.',
      details: [
        'Adaptive difficulty',
        'Instant feedback',
        'Achievement badges',
        'Progress certificates'
      ],
      bgColor: 'bg-tertiary-50',
      iconColor: 'text-tertiary-600',
      borderColor: 'border-tertiary-200'
    },
    {
      step: 5,
      icon: Heart,
      title: 'Family Devotions',
      description: 'Strengthen family bonds with guided devotions, prayers, and meaningful discussions.',
      details: [
        'Daily family devotions',
        'Prayer journal',
        'Discussion guides',
        'Memory verse challenges'
      ],
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent-600',
      borderColor: 'border-accent-200'
    },
    {
      step: 6,
      icon: Users,
      title: 'Track & Celebrate Growth',
      description: 'Monitor spiritual growth and celebrate milestones together as a family.',
      details: [
        'Progress dashboard',
        'Achievement system',
        'Growth milestones',
        'Family reports'
      ],
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
      borderColor: 'border-primary-200'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary-100 text-primary-800 px-4 py-2">
            Simple & Effective
          </Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            How KingdomQuest Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes and begin transforming your family's spiritual journey 
            with our easy-to-follow process designed for busy Christian families.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card key={index} className={`relative ${step.bgColor} ${step.borderColor} border-2 hover:shadow-lg transition-all duration-300 group`}>
                <CardContent className="p-6">
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={`${step.iconColor} bg-white text-lg font-bold px-3 py-1`}>
                      {step.step}
                    </Badge>
                    <div className={`p-3 bg-white rounded-full ${step.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Feature List */}
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-gray-700">
                        <div className={`w-1.5 h-1.5 ${step.iconColor.replace('text-', 'bg-')} rounded-full mr-2`}></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="gradient-primary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-serif font-bold mb-4">
              Ready to Begin Your Family's Spiritual Journey?
            </h3>
            <p className="text-gray-100 mb-6 max-w-2xl mx-auto">
              Join thousands of Christian families who are already using KingdomQuest 
              to strengthen their faith and create lasting spiritual memories.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button className="btn-accent bg-accent hover:bg-accent-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center">
                <Download className="h-5 w-5 mr-2" />
                Start Free Trial
              </button>
              <button className="btn-secondary border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-all duration-300">
                View Demo Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
