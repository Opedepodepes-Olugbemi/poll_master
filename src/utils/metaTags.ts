export function updateMetaTags(poll?: {
  question: string;
  options: Array<{ text: string }>;
  previewImage?: string;
}) {
  // Update title
  document.title = poll ? `${poll.question} - PollMaster` : 'PollMaster';

  // Update meta tags
  const updateMetaTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  if (poll) {
    const description = `Options: ${poll.options.map(opt => opt.text).join(', ')}`;
    updateMetaTag('og:title', poll.question);
    updateMetaTag('og:description', description);
    updateMetaTag('twitter:title', poll.question);
    updateMetaTag('twitter:description', description);
    
    if (poll.previewImage) {
      updateMetaTag('og:image', poll.previewImage);
      updateMetaTag('twitter:image', poll.previewImage);
    }
  } else {
    updateMetaTag('og:title', 'PollMaster');
    updateMetaTag('og:description', 'Create and share polls with your friends');
    updateMetaTag('twitter:title', 'PollMaster');
    updateMetaTag('twitter:description', 'Create and share polls with your friends');
  }
} 