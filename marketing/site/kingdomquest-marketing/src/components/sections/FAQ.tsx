import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Shield, Smartphone, Users, CreditCard, BookOpen } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter(item => item !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

  const faqCategories = [
    {
      category: 'General Questions',
      icon: HelpCircle,
      questions: [
        {
          question: 'What age groups is KingdomQuest designed for?',
          answer: 'KingdomQuest is designed for children ages 3-12, with content that adapts to different developmental stages. Our stories and activities are carefully crafted to be age-appropriate, with simpler concepts for younger children and more complex discussions for older kids.'
        },
        {
          question: 'Do I need an internet connection to use the app?',
          answer: 'While you need an internet connection to download content and sync progress, many features work offline once downloaded. Premium users can download stories and activities for offline use, making it perfect for car trips or areas with limited connectivity.'
        },
        {
          question: 'How much time should my child spend with the app daily?',
          answer: 'We recommend 15-30 minutes of daily engagement, which aligns with child development research. The app includes built-in time management features to help parents set healthy usage limits and encourage balance with other activities.'
        },
        {
          question: 'Is KingdomQuest available in multiple languages?',
          answer: 'Currently, KingdomQuest is available in English with plans to expand to other languages in 2024. We\'re prioritizing Spanish, Portuguese, and French based on user demand.'
        }
      ]
    },
    {
      category: 'Safety & Privacy',
      icon: Shield,
      questions: [
        {
          question: 'How do you protect my child\'s privacy and data?',
          answer: 'We take child privacy extremely seriously. KingdomQuest is COPPA compliant, meaning we don\'t collect personal information from children under 13 without parental consent. All data is encrypted, stored securely, and never shared with third parties. Parents have complete control over their child\'s data and can delete it at any time.'
        },
        {
          question: 'Are there any social features or chat functions?',
          answer: 'No, KingdomQuest has no social features, chat functions, or ways for children to communicate with strangers. It\'s a completely closed environment focused on safe, educational content. Any sharing features require parental approval and only work within the family unit.'
        },
        {
          question: 'How do you ensure content is biblically accurate?',
          answer: 'All content is reviewed by a team of biblical scholars, pastors, and Christian educators before publication. We work with theological experts to ensure accuracy while maintaining age-appropriate presentation. Content goes through multiple review stages to maintain the highest standards.'
        },
        {
          question: 'Can I monitor my child\'s usage and progress?',
          answer: 'Yes! Parents have access to a comprehensive dashboard showing their child\'s progress, time spent, completed activities, and areas of strength. You can set usage limits, review completed stories, and see which concepts your child is learning.'
        }
      ]
    },
    {
      category: 'Technical Support',
      icon: Smartphone,
      questions: [
        {
          question: 'What devices and operating systems are supported?',
          answer: 'KingdomQuest works on iOS 12+ and Android 8+, as well as tablets and iPads. We also offer a web version that works on most modern browsers. The app is optimized for both phones and tablets, with a responsive design that adapts to different screen sizes.'
        },
        {
          question: 'What should I do if the app crashes or won\'t load?',
          answer: 'First, try closing and reopening the app. If that doesn\'t work, restart your device or check for app updates in your app store. For persistent issues, contact our support team at support@kingdomquest.app with your device details and we\'ll help troubleshoot.'
        },
        {
          question: 'How do I transfer my account to a new device?',
          answer: 'Simply log in with your account credentials on the new device and all your data will sync automatically. Progress, purchased content, and settings will transfer seamlessly. If you have trouble, our support team can help with account migration.'
        },
        {
          question: 'Do you offer customer support?',
          answer: 'Yes! We offer email support for all users, with priority support for Premium and Church subscribers. Our typical response time is within 24 hours. We also have an extensive help center with video tutorials and troubleshooting guides.'
        }
      ]
    },
    {
      category: 'For Families',
      icon: Users,
      questions: [
        {
          question: 'Can I create profiles for multiple children?',
          answer: 'Yes! Premium and Church plans support unlimited child profiles. Each child gets personalized content recommendations, individual progress tracking, and age-appropriate material. The free plan includes one child profile.'
        },
        {
          question: 'How do family devotions work?',
          answer: 'Family devotions are guided activities designed for the whole family to do together. They include discussion questions, prayer prompts, and activities that help families connect spiritually. New devotions are added weekly, with seasonal and holiday-themed options.'
        },
        {
          question: 'Can grandparents or other family members access the app?',
          answer: 'Yes! You can share access with extended family members through family sharing features. This allows grandparents, aunts, uncles, or other family members to engage with your children\'s spiritual education and see their progress.'
        },
        {
          question: 'What if my child has special learning needs?',
          answer: 'KingdomQuest includes accessibility features like text-to-speech, visual aids, and adjustable reading levels. We\'re committed to making biblical education accessible to all children and continuously work to improve our accessibility features.'
        }
      ]
    },
    {
      category: 'Billing & Subscriptions',
      icon: CreditCard,
      questions: [
        {
          question: 'How does the free trial work?',
          answer: 'The free version is permanently available with basic features. Premium plans include a 14-day free trial, and Church plans get 30 days. No credit card is required to start the free version, and you can upgrade anytime during or after the trial period.'
        },
        {
          question: 'Can I cancel my subscription anytime?',
          answer: 'Absolutely! There are no long-term contracts or cancellation fees. You can cancel through your account settings or app store subscription management. You\'ll retain access until the end of your current billing period.'
        },
        {
          question: 'What happens if I downgrade from Premium to Free?',
          answer: 'You\'ll keep access to any content you\'ve already downloaded, but new premium content won\'t be available. Your progress and data remain saved, so you can upgrade again anytime to regain full access.'
        },
        {
          question: 'Do you offer discounts for multiple children or large families?',
          answer: 'Our Premium and Church plans already include unlimited child profiles. For homeschool co-ops or groups with special needs, contact us at hello@kingdomquest.app to discuss custom pricing options.'
        }
      ]
    },
    {
      category: 'Content & Education',
      icon: BookOpen,
      questions: [
        {
          question: 'How often is new content added?',
          answer: 'We add new stories, quizzes, and devotions weekly. Premium subscribers get early access to new content, and we regularly update existing material based on user feedback and educational best practices.'
        },
        {
          question: 'Can the app align with our church\'s curriculum?',
          answer: 'Yes! The Church plan includes curriculum alignment tools that let you match content with your existing Sunday school or children\'s ministry programs. You can also create custom learning paths that follow your church\'s teaching schedule.'
        },
        {
          question: 'Are there activities beyond just stories?',
          answer: 'Definitely! KingdomQuest includes interactive quizzes, memory verse games, coloring activities, prayer journals, family discussion guides, and hands-on crafts or activities related to each story. It\'s a comprehensive learning experience.'
        },
        {
          question: 'How do you measure learning progress?',
          answer: 'We track comprehension through interactive quizzes, story completion rates, and engagement metrics. Parents can see which biblical concepts their child is mastering and which areas might need additional focus. Progress is presented in easy-to-understand reports.'
        }
      ]
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary-100 text-primary-800 px-4 py-2">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about KingdomQuest, our features, pricing, and how we keep your children safe.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqCategories.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <div key={categoryIndex} className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Category Header */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <IconComponent className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{category.category}</h3>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const globalIndex = categoryIndex * 100 + questionIndex;
                    const isOpen = openItems.includes(globalIndex);
                    
                    return (
                      <Card key={questionIndex} className="border border-gray-200 hover:border-primary-300 transition-colors">
                        <CardContent className="p-0">
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-semibold text-gray-900 pr-4">
                              {faq.question}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-6">
                              <div className="border-t border-gray-100 pt-4">
                                <p className="text-gray-600 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <div className="gradient-primary rounded-2xl p-8 text-white">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-accent-200" />
            <h3 className="text-2xl font-serif font-bold mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-100 mb-6 max-w-2xl mx-auto">
              Our friendly support team is here to help! Reach out to us and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="btn-accent bg-accent hover:bg-accent-700 text-white px-8 py-3">
                Contact Support
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-secondary border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3"
                onClick={() => scrollToSection('pricing')}
              >
                View Pricing
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-100">
              Email: support@kingdomquest.app | Phone: +27 (0)11 123-4567
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;