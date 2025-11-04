
import React from 'react';

export const RocketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a6 6 0 01-2.56 5.84m-2.56-5.84a6 6 0 01-5.84-2.56m11.24 0a6 6 0 01-5.84 2.56m5.84-2.56L21 4.97M15.59 14.37L9.63 8.41m5.96 5.96L21 12m-5.41 2.37L12 21M9.63 8.41L3.67 2.45m5.96 5.96L3.67 12m5.96-3.59L12 3.67" 
    />
  </svg>
);
