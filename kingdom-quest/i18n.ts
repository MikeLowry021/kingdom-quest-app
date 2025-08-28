import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales } from './middleware';

// Configuration for next-intl
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Import and return the translation messages
  return {
    messages: (await import(`./i18n/${locale}.json`)).default,
    
    // Configure date and number formatting
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        },
        time: {
          hour: 'numeric',
          minute: '2-digit'
        }
      },
      number: {
        precise: {
          maximumFractionDigits: 5
        }
      }
    },
    
    // Configure time zones
    timeZone: 'UTC'
  };
});