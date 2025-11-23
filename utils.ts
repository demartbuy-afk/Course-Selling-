
export const getYouTubeEmbedUrl = (url: string) => {
  if (!url || url.trim() === '') return null;
  
  // Robust Regex to handle:
  // - youtube.com/watch?v=ID
  // - youtube.com/embed/ID
  // - youtu.be/ID
  // - youtube.com/shorts/ID
  // - mobile links
  // - links with other query params
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);

  const id = (match && match[2].length === 11) ? match[2] : null;
  
  if (id) {
    // Adding origin is crucial to prevent "Video unavailable" or Error 153 in some environments
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&origin=${origin}`;
  }
  
  return null; 
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0, // Remove decimal points for cleaner look in INR unless needed
  }).format(amount);
};
