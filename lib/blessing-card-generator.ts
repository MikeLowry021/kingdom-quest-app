// Define the interface for blessing card generation options
export interface BlessingCardOptions {
  canvas: HTMLCanvasElement;
  template: string;
  verse: string;
  reference: string;
  message: string;
  to: string;
  from: string;
}

// Template designs - background images and color schemes
const templates = {
  light: {
    background: '#ffffff',
    textColor: '#333333',
    accentColor: '#9f7aea',
    fontFamily: 'Georgia, serif',
  },
  nature: {
    background: '#f0f9e8',
    textColor: '#2c5f2d',
    accentColor: '#97b498',
    fontFamily: 'Verdana, sans-serif',
  },
  elegant: {
    background: '#f9f7f7',
    textColor: '#112d4e',
    accentColor: '#3f72af',
    fontFamily: 'Cambria, serif',
  },
  children: {
    background: '#ffebee',
    textColor: '#ff5252',
    accentColor: '#ffcdd2',
    fontFamily: 'Comic Sans MS, cursive',
  },
  celebration: {
    background: '#fff8e1',
    textColor: '#ff6f00',
    accentColor: '#ffca28',
    fontFamily: 'Arial, sans-serif',
  },
};

// Patterns for background texture (can be expanded with actual pattern images)
const patterns = {
  dots: (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    const size = 10;
    const spacing = 20;
    
    ctx.fillStyle = color;
    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  lines: (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    const spacing = 20;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  },
};

// Function to draw a decorative border on the card
function drawBorder(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  const borderWidth = 15;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth);
  
  // Add corner decorations
  const cornerSize = 30;
  ctx.lineWidth = 2;
  
  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(borderWidth * 2, borderWidth);
  ctx.lineTo(borderWidth * 2 + cornerSize, borderWidth);
  ctx.moveTo(borderWidth, borderWidth * 2);
  ctx.lineTo(borderWidth, borderWidth * 2 + cornerSize);
  ctx.stroke();
  
  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(width - borderWidth * 2, borderWidth);
  ctx.lineTo(width - borderWidth * 2 - cornerSize, borderWidth);
  ctx.moveTo(width - borderWidth, borderWidth * 2);
  ctx.lineTo(width - borderWidth, borderWidth * 2 + cornerSize);
  ctx.stroke();
  
  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(borderWidth * 2, height - borderWidth);
  ctx.lineTo(borderWidth * 2 + cornerSize, height - borderWidth);
  ctx.moveTo(borderWidth, height - borderWidth * 2);
  ctx.lineTo(borderWidth, height - borderWidth * 2 - cornerSize);
  ctx.stroke();
  
  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(width - borderWidth * 2, height - borderWidth);
  ctx.lineTo(width - borderWidth * 2 - cornerSize, height - borderWidth);
  ctx.moveTo(width - borderWidth, height - borderWidth * 2);
  ctx.lineTo(width - borderWidth, height - borderWidth * 2 - cornerSize);
  ctx.stroke();
}

// Function to wrap text to fit within a specified width
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let testLine = '';
  let lineArray = [];

  for (let n = 0; n < words.length; n++) {
    testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      lineArray.push({text: line, x, y});
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  
  lineArray.push({text: line, x, y});
  return lineArray;
}

// Main function to generate the blessing card
export function generateBlessingCard(options: BlessingCardOptions) {
  const { canvas, template, verse, reference, message, to, from } = options;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;
  
  const width = canvas.width;
  const height = canvas.height;
  
  // Get template settings
  const templateSettings = templates[template as keyof typeof templates] || templates.light;
  
  // Clear canvas and set background
  ctx.fillStyle = templateSettings.background;
  ctx.fillRect(0, 0, width, height);
  
  // Add a subtle pattern to the background for texture
  const patternColor = `${templateSettings.accentColor}20`; // 20% opacity
  if (template === 'nature' || template === 'celebration') {
    patterns.dots(ctx, width, height, patternColor);
  } else {
    patterns.lines(ctx, width, height, patternColor);
  }
  
  // Draw decorative border
  drawBorder(ctx, width, height, templateSettings.accentColor);
  
  // Set font for the card
  ctx.font = `20px ${templateSettings.fontFamily}`;
  ctx.fillStyle = templateSettings.textColor;
  ctx.textAlign = 'center';
  
  // Add title
  ctx.font = `bold 28px ${templateSettings.fontFamily}`;
  ctx.fillText('Blessing Card', width / 2, 70);
  
  // Add decorative divider
  ctx.strokeStyle = templateSettings.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 4, 90);
  ctx.lineTo(width * 3 / 4, 90);
  ctx.stroke();
  
  // Add scripture verse (wrapped to fit)
  ctx.font = `italic 22px ${templateSettings.fontFamily}`;
  const verseLines = wrapText(ctx, `"${verse}"`, width / 2, 140, width - 100, 30);
  verseLines.forEach(line => {
    ctx.fillText(line.text, line.x, line.y);
  });
  
  // Add verse reference
  ctx.font = `bold 18px ${templateSettings.fontFamily}`;
  ctx.fillText(`\u2014 ${reference}`, width / 2, verseLines[verseLines.length - 1].y + 40);
  
  // Add personal message
  if (message) {
    ctx.font = `20px ${templateSettings.fontFamily}`;
    const messageLines = wrapText(ctx, message, width / 2, verseLines[verseLines.length - 1].y + 100, width - 120, 30);
    messageLines.forEach(line => {
      ctx.fillText(line.text, line.x, line.y);
    });
  }
  
  // Add to/from info
  const yPos = height - 100;
  
  if (to) {
    ctx.font = `16px ${templateSettings.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(`To: ${to}`, 80, yPos);
  }
  
  if (from) {
    ctx.font = `16px ${templateSettings.fontFamily}`;
    ctx.textAlign = 'right';
    ctx.fillText(`From: ${from}`, width - 80, yPos);
  }
  
  // Add a small decorative element at the bottom
  ctx.textAlign = 'center';
  ctx.font = `12px ${templateSettings.fontFamily}`;
  ctx.fillStyle = templateSettings.accentColor;
  ctx.fillText('\u2022\u2022\u2022', width / 2, height - 60);
  
  // Add a Kingdom Quest branding
  ctx.font = `italic 12px ${templateSettings.fontFamily}`;
  ctx.fillStyle = `${templateSettings.textColor}80`; // 50% opacity
  ctx.fillText('Created with Kingdom Quest Family Altar', width / 2, height - 30);
}
