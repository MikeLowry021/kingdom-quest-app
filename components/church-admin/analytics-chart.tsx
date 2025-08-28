'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Heart, DollarSign, Flame } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  overview: {
    totalMembers: number;
    activePrayers: number;
    totalDonations: number;
    activeStreaks: number;
  };
  engagement: {
    dailyActiveUsers: Record<string, number>;
    prayersByDay: Record<string, number>;
    quizzesByDay: Record<string, number>;
  };
  donations: {
    total: number;
    byDay: Record<string, number>;
    byType: Record<string, number>;
  };
  spiritual: {
    averageStreak: number;
    totalPrayers: number;
    completedQuizzes: number;
  };
}

export default function AnalyticsChart() {
  const t = useTranslations('churchAdmin');
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  useEffect(() => {
    async function loadAnalytics() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No authenticated session');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/church-admin-analytics`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Failed to load analytics');
        }

        setAnalyticsData(result.data);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [supabase]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">{t('loadingAnalytics')}</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-500">{t('analyticsLoadFailed')}</p>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const dates = Object.keys(analyticsData.engagement.dailyActiveUsers).sort();
  const last7Days = dates.slice(-7);

  const engagementChartData = {
    labels: last7Days.map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: t('activeUsers'),
        data: last7Days.map(date => analyticsData.engagement.dailyActiveUsers[date] || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: t('prayers'),
        data: last7Days.map(date => analyticsData.engagement.prayersByDay[date] || 0),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const donationChartData = {
    labels: Object.keys(analyticsData.donations.byType),
    datasets: [
      {
        data: Object.values(analyticsData.donations.byType),
        backgroundColor: [
          '#3B82F6',
          '#EF4444',
          '#10B981',
          '#F59E0B',
          '#8B5CF6'
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalMembers')}</p>
              <p className="text-2xl font-bold">{analyticsData.overview.totalMembers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('activePrayers')}</p>
              <p className="text-2xl font-bold">{analyticsData.overview.activePrayers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalDonations')}</p>
              <p className="text-2xl font-bold">R{analyticsData.donations.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Flame className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('activeStreaks')}</p>
              <p className="text-2xl font-bold">{analyticsData.overview.activeStreaks}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('weeklyEngagement')}</CardTitle>
            <CardDescription>{t('engagementDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Line data={engagementChartData} options={chartOptions} />
          </CardContent>
        </Card>

        {/* Donation Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t('donationBreakdown')}</CardTitle>
            <CardDescription>{t('donationDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <Doughnut 
                data={donationChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spiritual Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>{t('spiritualMetrics')}</CardTitle>
          <CardDescription>{t('spiritualDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {analyticsData.spiritual.averageStreak.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">{t('averageStreak')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {analyticsData.spiritual.totalPrayers}
              </p>
              <p className="text-sm text-gray-600">{t('totalPrayers')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {analyticsData.spiritual.completedQuizzes}
              </p>
              <p className="text-sm text-gray-600">{t('completedQuizzes')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
