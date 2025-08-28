'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { PlusIcon, SearchIcon, FilterIcon, BookOpenIcon, CalendarIcon } from 'lucide-react';

// Mock types (these should come from altar-types.ts in a real implementation)
interface Prayer {
  id: string;
  user_id: string;
  content: string;
  category: string;
  created_at: string;
  answered: boolean;
  tags: string[];
}

export default function PrayerJournal() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  
  // Fetch prayers from the database (mock implementation)
  useEffect(() => {
    const fetchPrayers = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would use altar-api.ts
        // For now, we'll use mock data
        const mockPrayers: Prayer[] = [
          {
            id: '1',
            user_id: 'user1',
            content: 'For wisdom in making an important decision about my career path.',
            category: 'personal',
            created_at: '2025-08-20T14:32:00Z',
            answered: false,
            tags: ['wisdom', 'career']
          },
          {
            id: '2',
            user_id: 'user1',
            content: "For my mother\'s health concerns to be resolved.",
            category: 'family',
            created_at: '2025-08-19T09:15:00Z',
            answered: true,
            tags: ['health', 'family']
          },
          {
            id: '3',
            user_id: 'user1',
            content: "For our church\'s upcoming mission trip to Mexico.",
            category: 'community',
            created_at: '2025-08-18T18:45:00Z',
            answered: false,
            tags: ['church', 'missions']
          },
          {
            id: '4',
            user_id: 'user1',
            content: 'Thankful for the time spent with family during our vacation.',
            category: 'thanksgiving',
            created_at: '2025-08-15T20:30:00Z',
            answered: true,
            tags: ['gratitude', 'family']
          },
          {
            id: '5',
            user_id: 'user1',
            content: 'For our neighbors who are struggling financially.',
            category: 'intercession',
            created_at: '2025-08-10T12:20:00Z',
            answered: false,
            tags: ['neighbors', 'finances']
          }
        ];
        
        setPrayers(mockPrayers);
      } catch (error) {
        console.error('Failed to fetch prayers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrayers();
  }, []);
  
  // Filter and search prayers
  const filteredPrayers = prayers.filter(prayer => {
    // Apply category filter
    if (filter !== 'all' && prayer.category !== filter) return false;
    
    // Apply search query
    if (searchQuery && !prayer.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Group prayers by date for calendar view
  const prayersByDate = filteredPrayers.reduce((acc, prayer) => {
    const date = format(new Date(prayer.created_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(prayer);
    return acc;
  }, {} as Record<string, Prayer[]>);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Prayer Journal</h2>
          <p className="text-muted-foreground">Record and track your prayer journey</p>
        </div>
        
        <Button 
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
          size="sm"
          onClick={() => console.log('Add prayer - redirect to prayer form')}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Prayer
        </Button>
      </div>
      
      {/* Filters and search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Category filter */}
        <div className="sm:col-span-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <FilterIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="thanksgiving">Thanksgiving</SelectItem>
              <SelectItem value="intercession">Intercession</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Search box */}
        <div className="sm:col-span-7 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prayers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* View toggle */}
        <div className="sm:col-span-2">
          <Tabs value={view} onValueChange={setView} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="text-xs">
                <BookOpenIcon className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs">
                <CalendarIcon className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Prayer content */}
      <div>
        <Tabs value={view} className="w-full">
          {/* List View */}
          <TabsContent value="list" className="mt-0">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredPrayers.length === 0 ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">No prayers found. Try adjusting your filters or add a new prayer.</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredPrayers.map((prayer) => (
                    <Card key={prayer.id} className={`overflow-hidden ${prayer.answered ? 'border-green-200 bg-green-50' : ''}`}>
                      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mr-2 bg-primary/10 text-primary">
                            {prayer.category}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(prayer.created_at)} at {formatTime(prayer.created_at)}
                          </span>
                        </div>
                        {prayer.answered && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Answered
                          </span>
                        )}
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-base">{prayer.content}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {prayer.tags.map(tag => (
                            <span key={tag} className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-0">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : Object.keys(prayersByDate).length === 0 ? (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">No prayers found for the selected filters.</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-6">
                  {Object.entries(prayersByDate)
                    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                    .map(([date, prayersOnDate]) => (
                      <div key={date} className="space-y-2">
                        <h3 className="text-lg font-medium sticky top-0 bg-background py-2">
                          {formatDate(date)}
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({prayersOnDate.length} {prayersOnDate.length === 1 ? 'prayer' : 'prayers'})
                          </span>
                        </h3>
                        <div className="pl-4 border-l-2 border-muted space-y-3">
                          {prayersOnDate.map(prayer => (
                            <div key={prayer.id} className="relative pl-4">
                              <div className="absolute left-[-10px] top-2 w-4 h-4 rounded-full bg-primary"></div>
                              <Card className={`${prayer.answered ? 'border-green-200 bg-green-50' : ''}`}>
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground">{formatTime(prayer.created_at)}</span>
                                    {prayer.answered && (
                                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                        Answered
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-2">{prayer.content}</p>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                      {prayer.category}
                                    </span>
                                    {prayer.tags.map(tag => (
                                      <span key={tag} className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Stats and insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-medium">Total Prayers</h3>
            <p className="text-3xl font-bold text-primary">{prayers.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-medium">Answered Prayers</h3>
            <p className="text-3xl font-bold text-green-600">
              {prayers.filter(p => p.answered).length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-medium">Most Frequent Category</h3>
            <p className="text-3xl font-bold text-primary">
              {prayers.length > 0 ? (
                Object.entries(prayers.reduce((acc, prayer) => {
                  acc[prayer.category] = (acc[prayer.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>))
                  .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
              ) : 'None'}
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
