import { Building2, Users, BarChart, Settings, Calendar, BookOpen, Trophy, Shield } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const ForChurches = () => {
  const churchFeatures = [
    {
      icon: Users,
      title: 'Congregation Management',
      description: 'Manage multiple families and track spiritual growth across your entire congregation.',
      benefits: [
        'Unlimited family accounts',
        'Bulk user management',
        'Group progress tracking',
        'Custom family groupings'
      ],
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600'
    },
    {
      icon: BarChart,
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into engagement, progress, and spiritual development.',
      benefits: [
        'Congregation-wide analytics',
        'Individual family reports',
        'Engagement metrics',
        'Growth milestone tracking'
      ],
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent-600'
    },
    {
      icon: Settings,
      title: 'Custom Branding',
      description: 'Personalize the app experience with your church\'s branding and messaging.',
      benefits: [
        'Custom church logo',
        'Branded color themes',
        'Church-specific messages',
        'Custom welcome screens'
      ],
      bgColor: 'bg-secondary-50',
      iconColor: 'text-secondary-600'
    },
    {
      icon: Calendar,
      title: 'Event Integration',
      description: 'Sync with church events, Sunday school schedules, and special programs.',
      benefits: [
        'Event calendar sync',
        'Sunday school integration',
        'Special program content',
        'Seasonal campaigns'
      ],
      bgColor: 'bg-tertiary-50',
      iconColor: 'text-tertiary-600'
    },
    {
      icon: BookOpen,
      title: 'Curriculum Support',
      description: 'Align with your existing Sunday school and children\'s ministry curriculum.',
      benefits: [
        'Curriculum alignment tools',
        'Lesson plan integration',
        'Custom content creation',
        'Teaching resource library'
      ],
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent-600'
    },
    {
      icon: Shield,
      title: 'Data Privacy & Security',
      description: 'Enterprise-grade security with complete data ownership and privacy controls.',
      benefits: [
        'COPPA compliance',
        'Data ownership rights',
        'Privacy control dashboard',
        'Secure family data handling'
      ],
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600'
    }
  ];

  const churchTestimonials = [
    {
      name: 'Pastor David Johnson',
      church: 'Grace Community Church',
      size: '350 families',
      quote: 'KingdomQuest has transformed our children\'s ministry. Parents are more engaged in their children\'s spiritual education than ever before.',
      rating: 5
    },
    {
      name: 'Sarah Martinez',
      role: 'Children\'s Ministry Director',
      church: 'First Baptist Church',
      size: '200 families',
      quote: 'The analytics help us understand which families need additional support. It\'s been invaluable for our ministry planning.',
      rating: 5
    },
    {
      name: 'Rev. Michael Thompson',
      church: 'New Life Fellowship',
      size: '500+ families',
      quote: 'The custom branding makes families feel like this is truly part of our church community. Engagement has increased by 300%.',
      rating: 5
    }
  ];

  const useCases = [
    {
      icon: Users,
      title: 'Sunday School Enhancement',
      description: 'Extend Sunday school lessons into the home with interactive follow-up activities and family discussions.'
    },
    {
      icon: Calendar,
      title: 'VBS & Special Events',
      description: 'Create custom content for Vacation Bible School, Christmas programs, and other special church events.'
    },
    {
      icon: BookOpen,
      title: 'Small Group Ministry',
      description: 'Support small group leaders with family-friendly content and discussion guides for group meetings.'
    },
    {
      icon: Trophy,
      title: 'Youth Discipleship',
      description: 'Track spiritual milestones and celebrate achievements as children grow in their faith journey.'
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="for-churches" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-secondary-100 text-secondary-800 px-4 py-2">
            For Churches & Ministry Leaders
          </Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Empower Your Children's Ministry
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extend your children's ministry beyond Sunday morning with powerful tools 
            for tracking spiritual growth, managing families, and building stronger 
            church-home connections.
          </p>
        </div>

        {/* Church Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {churchFeatures.map((feature, index) => {
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

        {/* Use Cases */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              Ministry Applications
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how churches are using KingdomQuest to enhance various ministry programs and strengthen family engagement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className="bg-white hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary-100 text-secondary-600 rounded-full mb-4">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {useCase.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {useCase.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Church Testimonials */}
        <div className="bg-white rounded-2xl p-8 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
              Trusted by Ministry Leaders
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how churches of all sizes are using KingdomQuest to strengthen their children's ministry and family engagement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {churchTestimonials.map((testimonial, index) => (
              <Card key={index} className="bg-secondary-50">
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
                  <div className="border-t border-secondary-200 pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    {testimonial.role && <div className="text-sm text-secondary-600">{testimonial.role}</div>}
                    <div className="text-sm text-gray-600">{testimonial.church}</div>
                    <div className="text-sm text-gray-500">{testimonial.size}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Church CTA */}
        <div className="text-center">
          <div className="gradient-secondary text-white rounded-2xl p-8">
            <div className="max-w-3xl mx-auto">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-white/60" />
              <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                Transform Your Children's Ministry
              </h3>
              <p className="text-gray-100 mb-6 text-lg">
                Ready to see stronger family engagement and spiritual growth in your congregation? 
                Let's discuss how KingdomQuest can support your ministry goals.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg"
                  className="btn-primary bg-primary hover:bg-primary-700 text-white px-8 py-3"
                  onClick={() => scrollToSection('pricing')}
                >
                  View Church Plans
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="btn-secondary border-white text-white hover:bg-white hover:text-primary px-8 py-3"
                >
                  Schedule Demo
                </Button>
              </div>
              <p className="text-gray-200 text-sm mt-4">
                Special pricing available for churches and ministries
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForChurches;