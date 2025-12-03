"use client";

import React, { useRef, useState, useEffect } from 'react';
import { getFeedUrl } from '../services/api';

interface FeedFrameProps {
  subject: string;
}

const FeedFrame: React.FC<FeedFrameProps> = ({ subject }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentSrc, setCurrentSrc] = useState('');

  const generateSrc = (sub: string) => {
    const timestamp = new Date().getTime();
    return `${getFeedUrl(sub)}?t=${timestamp}`;
  };

  useEffect(() => {
    setCurrentSrc(generateSrc(subject));
  }, [subject]);

  const handleRefresh = () => {
    setCurrentSrc(generateSrc(subject));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{subject.charAt(0).toUpperCase() + subject.slice(1)} Feed</h3>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
        >
          Refresh Feed
        </button>
      </div>
      <iframe
        ref={iframeRef}
        src={currentSrc}
        title={`${subject} feed`}
        className="flex-grow border rounded-lg w-full h-full"
      ></iframe>
    </div>
  );
};

export default FeedFrame;
