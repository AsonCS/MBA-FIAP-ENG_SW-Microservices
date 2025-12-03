"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import SubjectSelector from '../components/SubjectSelector';
import FeedFrame from '../components/FeedFrame';
import { postMessage } from '../services/api';

export default function HomePage() {
  const [selectedSubject, setSelectedSubject] = useState('sports');
  const [messageContent, setMessageContent] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handlePostMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      await postMessage(selectedSubject, messageContent);
      toast.success('Message sent!');
      setMessageContent('');
    } catch (err) {
      toast.error('Failed to post message.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Micro-Feed Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </header>

      <main className="flex-grow p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <SubjectSelector activeSubject={selectedSubject} onSelect={setSelectedSubject} />
        </div>

        <div className="md:col-span-2 h-96">
          <FeedFrame subject={selectedSubject} />
        </div>

        <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Compose Message</h3>
          <textarea
            className="flex-grow border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Write a message for the ${selectedSubject} feed...`}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            rows={4}
          ></textarea>
          <button
            onClick={handlePostMessage}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Post Message
          </button>
        </div>
      </main>
    </div>
  );
}