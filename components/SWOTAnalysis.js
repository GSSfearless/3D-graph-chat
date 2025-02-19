import React from 'react';

const SWOTAnalysis = ({ data }) => {
  const { strengths, weaknesses, opportunities, threats } = data;

  const QuadrantBox = ({ title, items, bgColor, borderColor }) => (
    <div className={`p-4 rounded-lg ${bgColor} border-2 ${borderColor}`}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4 p-4 max-w-4xl mx-auto">
      <QuadrantBox
        title="优势 (Strengths)"
        items={strengths}
        bgColor="bg-blue-50"
        borderColor="border-blue-200"
      />
      <QuadrantBox
        title="劣势 (Weaknesses)"
        items={weaknesses}
        bgColor="bg-red-50"
        borderColor="border-red-200"
      />
      <QuadrantBox
        title="机会 (Opportunities)"
        items={opportunities}
        bgColor="bg-green-50"
        borderColor="border-green-200"
      />
      <QuadrantBox
        title="威胁 (Threats)"
        items={threats}
        bgColor="bg-yellow-50"
        borderColor="border-yellow-200"
      />
    </div>
  );
};

export default SWOTAnalysis; 