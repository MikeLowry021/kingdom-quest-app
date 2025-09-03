// lib/generators/blessing-cards.ts

type CardOptions = {
  title: string;
  scripture: string;
  personalMessage?: string;
  font?: string;
  fontColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  layoutType: 'centered' | 'top' | 'bottom' | 'split';
};

/**
 * Generate a blessing card as a PNG image using Canvas API
 */
export async function generateBlessingCard(options: CardOptions): Promise<Blob> {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set default font and styles
  const font = options.font || 'serif';
  const fontColor = options.fontColor || '#333333';
  const backgroundColor = options.backgroundColor || '#ffffff';

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // If background image is provided, load and draw it
  if (options.backgroundImage) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = options.backgroundImage;
      });

      // Draw image and add overlay for better text readability
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error('Error loading background image:', error);
    }
  }

  // Add decorative border
  ctx.strokeStyle = fontColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Set text styles
  ctx.fillStyle = fontColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate positions based on layout type
  let titleY, scriptureY, messageY;

  switch (options.layoutType) {
    case 'top':
      titleY = canvas.height * 0.2;
      scriptureY = canvas.height * 0.5;
      messageY = canvas.height * 0.8;
      break;
    case 'bottom':
      titleY = canvas.height * 0.2;
      scriptureY = canvas.height * 0.4;
      messageY = canvas.height * 0.75;
      break;
    case 'split':
      titleY = canvas.height * 0.15;
      scriptureY = canvas.height * 0.4;
      messageY = canvas.height * 0.75;
      break;
    case 'centered':
    default:
      titleY = canvas.height * 0.3;
      scriptureY = canvas.height * 0.5;
      messageY = canvas.height * 0.7;
      break;
  }

  // Draw title
  ctx.font = `bold 48px ${font}`;
  ctx.fillText(options.title, canvas.width / 2, titleY, canvas.width - 100);

  // Draw scripture text
  ctx.font = `italic 36px ${font}`;
  
  // Handle multi-line text for scripture
  const scriptureLines = wrapText(ctx, options.scripture, canvas.width - 200, 36);
  const scriptureLineHeight = 48;
  
  scriptureLines.forEach((line, index) => {
    const offset = (index - (scriptureLines.length - 1) / 2) * scriptureLineHeight;
    ctx.fillText(line, canvas.width / 2, scriptureY + offset, canvas.width - 200);
  });

  // Draw personal message if provided
  if (options.personalMessage) {
    ctx.font = `28px ${font}`;
    
    // Handle multi-line text for personal message
    const messageLines = wrapText(ctx, options.personalMessage, canvas.width - 200, 28);
    const messageLineHeight = 36;
    
    messageLines.forEach((line, index) => {
      const offset = (index - (messageLines.length - 1) / 2) * messageLineHeight;
      ctx.fillText(line, canvas.width / 2, messageY + offset, canvas.width - 200);
    });
  }

  // Convert canvas to PNG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Helper function to wrap text to fit within a specific width
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  lines.push(currentLine);
  return lines;
}

/**
 * Download the blessing card as a PNG image
 */
export function downloadBlessingCard(blob: Blob, filename: string = 'blessing-card.png'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
