"use client";

import React from 'react';

interface SubjectSelectorProps {
  activeSubject: string;
  onSelect: (subject: string) => void;
}

const subjects = ['sports', 'healthy', 'news', 'food', 'autos'];

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ activeSubject, onSelect }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 p-4 bg-gray-200 rounded-lg">
      {subjects.map((subject) => (
        <button
          key={subject}
          onClick={() => onSelect(subject)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
            ${activeSubject === subject
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-300 text-gray-800 hover:bg-blue-400 hover:text-white'
            }`}
        >
          {subject.charAt(0).toUpperCase() + subject.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default SubjectSelector;
