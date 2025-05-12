'use client';

import React from 'react';

const TemplateSelector = ({ selectedTemplate, onSelectTemplate }) => {
  const templates = [
    {
      id: 'birthday',
      name: 'Birthday',
      description: 'Perfect for celebrating birthdays with confetti and festive design',
      image: '/images/templates/birthday/preview.jpg',
    },
    {
      id: 'anniversary',
      name: 'Anniversary',
      description: 'Celebrate your relationship with a beautiful time counter',
      image: '/images/templates/anniversary/preview.jpg',
    },
    {
      id: 'declaration',
      name: 'Declaration',
      description: 'Express your love with a romantic declaration',
      image: '/images/templates/declaration/preview.jpg',
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Choose a Template</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`
              rounded-lg overflow-hidden border-2 cursor-pointer transition-all
              ${selectedTemplate === template.id
                ? 'border-gray-400 shadow-lg transform scale-[1.02]' // Modificado aqui: substituiu a borda vermelha
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-800">
              <img
                src={template.image}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              
              {/* Selected overlay - modificado: ícone mais sutil */}
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;