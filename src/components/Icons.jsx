import React from 'react';

// Small inline icon set (no icon dependency). Decorative by default.
const paths = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5"/>,
  undo: <><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></>,
  x: <path d="M6 6l12 12M18 6 6 18"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  tag: <><path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="8.5" r="1.5"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></>,
  reset: <><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></>,
  alert: <><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/></>,
  arrowDown: <path d="M12 5v14m-6-6 6 6 6-6"/>,
};

export default function Icon({name, size = 18, label, className = ''}){
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={label ? undefined : 'true'} role={label ? 'img' : undefined} aria-label={label}>
      {paths[name]}
    </svg>
  );
}
