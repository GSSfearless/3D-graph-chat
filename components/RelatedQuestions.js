import React from 'react';

const RelatedQuestions = ({ questions }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md pointer-events-auto">
        <h3 className="text-2xl font-bold mb-4">Related Questions</h3>
        <ul className="space-y-2">
          {questions.map((question, index) => (
            <li key={index} className="text-lg">{question}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RelatedQuestions;
