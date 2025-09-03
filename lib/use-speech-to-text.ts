import { useState, useEffect, useCallback } from 'react';

interface UseSpeechToTextProps {
  onTextChange?: (text: string) => void;
  language?: string;
  continuous?: boolean;
}

interface UseSpeechToTextReturn {
  text: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  clearText: () => void;
}

export function useSpeechToText({
  onTextChange,
  language = 'en-US',
  continuous = true,
}: UseSpeechToTextProps = {}): UseSpeechToTextReturn {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if the browser supports the Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setHasRecognitionSupport(true);
        const recognitionInstance = new SpeechRecognition();
        
        // Configure the recognition instance
        recognitionInstance.continuous = continuous;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = language;
        
        // Set up event handlers
        recognitionInstance.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setText(transcript);
          if (onTextChange) onTextChange(transcript);
        };
        
        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
      }
    }
    
    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [continuous, language, onTextChange]);

  const startListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const clearText = useCallback(() => {
    setText('');
    if (onTextChange) onTextChange('');
  }, [onTextChange]);

  return {
    text,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    clearText,
  };
}

// Types for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
