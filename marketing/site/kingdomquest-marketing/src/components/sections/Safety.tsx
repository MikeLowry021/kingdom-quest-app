import { Shield, Eye, Lock, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

const Safety = () => {
  const safetyFeatures = [
    {
      icon: Shield,
      title: 'COPPA Compliant',
      description: 'Fully compliant with Children\'s Online Privacy Protection Act requirements',
      details: [
        'No personal data collection from children under 13',
        'Parental consent required',
        'Secure data handling protocols',
        'Regular privacy audits'
      ],
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent-600',
      borderColor: 'border-accent-200'
    },
    {
      icon: Eye,
      title: 'Content Monitoring',
      description: 'All content reviewed by Christian educators and child development experts',
      details: [
        'Age-appropriate content filtering',
        'Biblical accuracy verification',
        'Educational value assessment',
        'Cultural sensitivity review'
      ],
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
      borderColor: 'border-primary-200'
    },
    {
      icon: Lock,
      title: 'Secure Environment',
      description: 'Closed ecosystem with no external links or social features',
      details: [
        'No chat or messaging features',
        'No external website links',
        'No social media integration',
        'Complete parental oversight'
      ],
      bgColor: 'bg-secondary-50',
      iconColor: 'text-secondary-600',
      borderColor: 'border-secondary-200'
    },
    {
      icon: UserCheck,
      title: 'Parental Controls',
      description: 'Comprehensive parental dashboard and control features',
      details: [
        'Usage time limits',
        'Content access controls',
        'Progress monitoring',
        'Device management'
      ],
      bgColor: 'bg-tertiary-50',
      iconColor: 'text-tertiary-600',
      borderColor: 'border-tertiary-200'
    }
  ];

  const certifications = [
    {
      icon: CheckCircle,
      title: 'Child Safety Certified',
      description: 'Certified by leading child safety organizations'
    },
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'COPPA and GDPR compliant data practices'
    },
    {
      icon: UserCheck,
      title: 'Educator Approved',
      description: 'Endorsed by Christian educators and pastors'
    }
  ];

  return (
    <section id="safety" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent-100 text-accent-800 px-4 py-2">
            Trusted & Secure
          </Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Your Child's Safety is Our Priority
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            KingdomQuest provides a completely safe, secure environment where children 
            can explore faith without any safety concerns for parents.
          </p>
        </div>

        {/* Safety Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {safetyFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className={`${feature.bgColor} ${feature.borderColor} border-2 hover:shadow-lg transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 bg-white rounded-full ${feature.iconColor} flex-shrink-0`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className={`h-4 w-4 ${feature.iconColor} mr-2 flex-shrink-0`} />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted by Parents Worldwide
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              KingdomQuest meets the highest standards for child safety and privacy protection.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certifications.map((cert, index) => {
              const IconComponent = cert.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-4">
                    <IconComponent className="h-8 w-8 text-accent-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{cert.title}</h4>
                  <p className="text-sm text-gray-600">{cert.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parent Testimonial */}
        <div className="mt-16 gradient-primary rounded-2xl p-8 text-white">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <blockquote className="text-lg text-gray-100 italic mb-4">
                "As a parent, I was initially hesitant about any digital content for my children. 
                KingdomQuest's comprehensive safety features and transparent approach gave me complete 
                peace of mind. Now it's an essential part of our family's spiritual growth."
              </blockquote>
              <cite className="text-gray-200 font-medium">- Sarah M., Mother of 3</cite>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Safety;