import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AltarDashboard from '@/components/altar/AltarDashboard';
import PrayerForm from '@/components/altar/PrayerForm';
import PrayerJournal from '@/components/altar/PrayerJournal';
import StreakDisplay from '@/components/altar/StreakDisplay';
import BadgeGallery from '@/components/altar/BadgeGallery';
import ChallengeCard from '@/components/altar/ChallengeCard';
import IntentionTracker from '@/components/altar/IntentionTracker';
import BlessingCardCreator from '@/components/altar/BlessingCardCreator';

export const metadata: Metadata = {
  title: 'Family Altar | Kingdom Quest',
  description: 'Strengthen your family\'s spiritual foundation with daily prayer, scripture, and activities.',
};

export default function AltarPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">Family Altar</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Strengthen your family's spiritual foundation through prayer, scripture, and meaningful activities.
          </p>
        </div>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 w-full">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pray">Pray</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="blessings">Blessing Cards</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="dashboard" className="m-0">
              <AltarDashboard />
            </TabsContent>
            
            <TabsContent value="pray" className="m-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <PrayerForm />
                </div>
                <div className="lg:col-span-4">
                  <IntentionTracker />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="journal" className="m-0">
              <PrayerJournal />
            </TabsContent>
            
            <TabsContent value="streaks" className="m-0">
              <StreakDisplay />
            </TabsContent>
            
            <TabsContent value="badges" className="m-0">
              <BadgeGallery />
            </TabsContent>
            
            <TabsContent value="challenges" className="m-0">
              <ChallengeCard />
            </TabsContent>
            
            <TabsContent value="blessings" className="m-0">
              <BlessingCardCreator />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
