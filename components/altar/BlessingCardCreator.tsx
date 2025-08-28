'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { generateBlessingCard } from '@/lib/blessing-card-generator';
import { blessingVerses } from '@/lib/altar-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

// Component for creating customizable blessing cards that can be downloaded as PNGs
export default function BlessingCardCreator() {
  // State for card customization
  const [template, setTemplate] = useState('light');
  const [verse, setVerse] = useState(blessingVerses[0]?.id || '');
  const [customMessage, setCustomMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  
  // Ref for the preview canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Update the preview when any customization option changes
  useEffect(() => {
    updatePreview();
  }, [template, verse, customMessage, recipientName, senderName]);
  
  // Generate the preview image on the canvas
  const updatePreview = () => {
    if (!canvasRef.current) return;
    
    const selectedVerse = blessingVerses.find(v => v.id === verse) || blessingVerses[0];
    
    generateBlessingCard({
      canvas: canvasRef.current,
      template,
      verse: selectedVerse?.text || '',
      reference: selectedVerse?.reference || '',
      message: customMessage,
      to: recipientName,
      from: senderName
    });
  };
  
  // Handle the download button click
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    // Convert canvas to data URL and trigger download
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'blessing-card.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Track when a blessing card is created for badge progress
  const trackBlessingCardCreation = async () => {
    try {
      // Call the API to increment the user's blessing card count
      // This would typically use a function from altar-api.ts
      // For now we'll just log it
      console.log('Blessing card created and downloaded');
      
      // In a real implementation, we would call something like:
      // await altarApi.trackBlessingCard(user.id);
    } catch (error) {
      console.error('Failed to track blessing card creation:', error);
    }
  };
  
  // Combined function for download and tracking
  const handleCreateAndDownload = () => {
    handleDownload();
    trackBlessingCardCreation();
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Customization Controls */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary">Create a Blessing Card</h2>
          <p className="text-muted-foreground">
            Design a personalized blessing card with scripture to share with friends and family.
          </p>
        </div>
        
        <div className="p-4 bg-muted rounded-lg space-y-4">
          {/* Template selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Card Design</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger id="template" className="w-full">
                <SelectValue placeholder="Select a design" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Theme</SelectItem>
                <SelectItem value="nature">Nature Theme</SelectItem>
                <SelectItem value="elegant">Elegant Theme</SelectItem>
                <SelectItem value="children">Children's Theme</SelectItem>
                <SelectItem value="celebration">Celebration Theme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Scripture verse selection */}
          <div className="space-y-2">
            <Label htmlFor="verse">Scripture Verse</Label>
            <Select value={verse} onValueChange={setVerse}>
              <SelectTrigger id="verse" className="w-full">
                <SelectValue placeholder="Select a verse" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-72">
                  {blessingVerses.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.reference}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          
          {/* Custom message */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Add your personal blessing or prayer..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          
          {/* Recipient name */}
          <div className="space-y-2">
            <Label htmlFor="recipient">To</Label>
            <Input
              id="recipient"
              placeholder="Recipient's name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
          
          {/* Sender name */}
          <div className="space-y-2">
            <Label htmlFor="sender">From</Label>
            <Input
              id="sender"
              placeholder="Your name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
        </div>
        
        {/* Create and download button */}
        <Button 
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-3"
          size="lg"
          onClick={handleCreateAndDownload}
        >
          Create & Download Blessing Card
        </Button>
        
        <p className="text-sm text-center text-muted-foreground">
          Creating cards counts toward the "Blessing Bearer" badge.
        </p>
      </div>
      
      {/* Card Preview */}
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-muted p-4 rounded-lg w-full">
          <h3 className="text-xl font-semibold mb-4 text-center">Preview</h3>
          <div className="flex justify-center">
            <Card className="w-full max-w-md overflow-hidden shadow-lg">
              <CardContent className="p-0">
                <canvas 
                  ref={canvasRef} 
                  className="w-full" 
                  width={800} 
                  height={600}
                />
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            This is how your blessing card will look when downloaded.
            The final image will be high-resolution and ready to share.
          </p>
        </div>
        
        <div className="w-full max-w-md space-y-4 p-4 border rounded-lg">
          <h4 className="text-lg font-medium">Ideas for Sharing</h4>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Send as a digital greeting for birthdays or special occasions</li>
            <li>Print and include in a handwritten card or letter</li>
            <li>Share in family chat groups to encourage someone</li>
            <li>Use as a bookmark with an encouraging message</li>
            <li>Post on social media to inspire others</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
