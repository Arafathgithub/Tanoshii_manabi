import React from 'react';

export const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M19.5 12h-15m0 0h15m0 0v-2.25a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v2.25m15 0v2.25a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-2.25m15 0h-15m15 0v2.25a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V9.75M9 7.5V3.75A1.5 1.5 0 0110.5 2.25h3A1.5 1.5 0 0115 3.75v3.75" 
    />
  </svg>
);
