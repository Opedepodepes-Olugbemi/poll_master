export async function generatePollPreview(poll: {
  question: string;
  options: Array<{ text: string; votes: number }>;
}): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#FF4500'; // Reddit orange
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial';
  ctx.textAlign = 'center';
  
  // Word wrap the question
  const words = poll.question.split(' ');
  let line = '';
  let lines = [];
  const maxWidth = 1000;
  const lineHeight = 60;

  for (let word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      lines.push(line);
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // Draw question
  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), canvas.width / 2, 150 + (i * lineHeight));
  });

  // Draw options
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  poll.options.forEach((option, i) => {
    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
    const y = 350 + (i * 70);
    
    // Option text
    ctx.font = '32px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${option.text} (${percentage}%)`, 100, y);
    
    // Progress bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(100, y + 10, 1000, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(100, y + 10, 1000 * (percentage / 100), 20);
  });

  return canvas.toDataURL('image/png');
} 