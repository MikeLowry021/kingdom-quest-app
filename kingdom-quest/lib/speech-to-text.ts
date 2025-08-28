// lib/speech-to-text.ts

export type SpeechRecognitionStatus = 'inactive' | 'listening' | 'processing' | 'error';

export class SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean;
  private status: SpeechRecognitionStatus = 'inactive';
  private onTextCallback: ((text: string) => void) | null = null;
  private onStatusChangeCallback: ((status: SpeechRecognitionStatus) => void) | null = null;
  private finalTranscript: string = '';
  private interimTranscript: string = '';

  constructor() {
    // Check if SpeechRecognition is supported
    this.isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    
    if (this.isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US'; // Default to English

    this.recognition.onstart = () => {
      this.updateStatus('listening');
    };

    this.recognition.onresult = (event) => {
      this.interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.finalTranscript += event.results[i][0].transcript;
        } else {
          this.interimTranscript += event.results[i][0].transcript;
        }
      }

      // Call the callback with the current text
      if (this.onTextCallback) {
        this.onTextCallback(this.finalTranscript + this.interimTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.updateStatus('error');
    };

    this.recognition.onend = () => {
      // If it was stopped manually, status would already be 'inactive'
      if (this.status === 'listening') {
        this.updateStatus('inactive');
      }
    };
  }

  private updateStatus(status: SpeechRecognitionStatus) {
    this.status = status;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  /**
   * Check if speech recognition is supported by the browser
   */
  public checkSupport(): boolean {
    return this.isSupported;
  }

  /**
   * Start speech recognition
   */
  public start(): boolean {
    if (!this.isSupported || !this.recognition) {
      this.updateStatus('error');
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.updateStatus('error');
      return false;
    }
  }

  /**
   * Stop speech recognition
   */
  public stop(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
        this.updateStatus('inactive');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  /**
   * Set the language for speech recognition
   */
  public setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /**
   * Set the callback for text updates
   */
  public onText(callback: (text: string) => void): void {
    this.onTextCallback = callback;
  }

  /**
   * Set the callback for status changes
   */
  public onStatusChange(callback: (status: SpeechRecognitionStatus) => void): void {
    this.onStatusChangeCallback = callback;
  }

  /**
   * Get the current recognition status
   */
  public getStatus(): SpeechRecognitionStatus {
    return this.status;
  }

  /**
   * Reset the transcript
   */
  public reset(): void {
    this.finalTranscript = '';
    this.interimTranscript = '';
  }
}

// Create a single instance for the app to use
let speechToTextInstance: SpeechToTextService | null = null;

export function getSpeechToTextService(): SpeechToTextService {
  if (!speechToTextInstance) {
    speechToTextInstance = new SpeechToTextService();
  }
  return speechToTextInstance;
}

// TypeScript declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
