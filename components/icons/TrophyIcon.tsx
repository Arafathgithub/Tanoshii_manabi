
import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M16.5 18.75h-9a9.75 9.75 0 1011.31-8.25 9.75 9.75 0 00-2.31 8.25zM16.5 18.75h-9"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15.75l.375-3.375m-1.5.375l-1.5-6.375m12.375 6.375l-1.5-6.375M12 15.75l-1.5-6.375m6.375 6.375l-1.5-6.375M3.375 6.375h17.25c.621 0 1.125-.504 1.125-1.125V3.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.875c0 .621.504 1.125 1.125 1.125z"
    />
  </svg>
);
