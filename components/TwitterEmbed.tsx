'use client'
import React, { useEffect } from 'react';

interface TwitterEmbedProps {
  tweetId: string;
}

const TwitterEmbed: React.FC<TwitterEmbedProps> = ({ tweetId }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <blockquote className="twitter-tweet" data-media-max-width="560">
      <a href={`https://twitter.com/twitter/status/${tweetId}`}></a>
    </blockquote>
  );
};

export default TwitterEmbed;