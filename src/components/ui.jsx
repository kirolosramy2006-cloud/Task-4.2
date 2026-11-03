import React, { useEffect, useRef, useState } from 'react';

// Small shared building blocks: icons, badges, images with fallback, modal shell and toast.

const paths = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5"/>,
  close: <path d="M6 6l12 12M18 6 6 18"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  undo: <><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/></>,
  tag: <><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z"/><circle cx="7.5" cy="7.5" r="1.5"/></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
};

export function Icon({name, size = 18}) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}

export function Badge({tone = 'neutral', children}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function StatusBadge({status}) {
  return status === 'sold'
    ? <Badge tone="sold">Sold</Badge>
    : <Badge tone="active"><span className="dot" aria-hidden="true" />Available</Badge>;
}

export function ListingImage({src, alt, emoji, className = '', compact = false}) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  if (src && !broken) return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />;
  return <span className={`img-fallback ${className}`} role="img" aria-label={alt ? `${alt} (photo unavailable)` : 'Photo unavailable'}>
    <span className="img-fallback-emoji" aria-hidden="true">{emoji || '📦'}</span>
    {!compact && <span className="img-fallback-text" aria-hidden="true">{src ? 'Photo unavailable' : 'No photo'}</span>}
  </span>;
}

const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Accessible dialog: Escape closes, focus moves inside, Tab is trapped, focus returns on close.
export function Modal({labelledBy, onClose, className = '', initialFocus, children}) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const node = ref.current;
    const first = (initialFocus && node.querySelector(initialFocus)) || node.querySelector(focusable);
    first?.focus();
    document.body.classList.add('no-scroll');
    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const list = [...node.querySelectorAll(focusable)].filter(el => el.offsetParent !== null);
      if (!list.length) return;
      const [start, end] = [list[0], list[list.length - 1]];
      if (e.shiftKey && document.activeElement === start) { e.preventDefault(); end.focus(); }
      else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); start.focus(); }
    }
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      if (previous && document.contains(previous)) previous.focus();
    };
  }, []);
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section ref={ref} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <button type="button" className="icon-btn modal-close" aria-label="Close" onClick={onClose}><Icon name="close" /></button>
      {children}
    </section>
  </div>;
}

export function Toast({toast, onDismiss}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, toast.action ? 6000 : 4000);
    return () => clearTimeout(t);
  }, [toast]);
  return <div className="toast-region" role="status" aria-live="polite">
    {toast && <div className={`toast toast-${toast.tone || 'success'}`} key={toast.id}>
      <Icon name={toast.tone === 'info' ? 'refresh' : 'check'} />
      <span>{toast.message}</span>
      {toast.action && <button type="button" className="toast-action" onClick={() => { toast.action.run(); onDismiss(); }}>{toast.action.label}</button>}
      <button type="button" className="icon-btn toast-close" aria-label="Dismiss notification" onClick={onDismiss}><Icon name="close" size={16} /></button>
    </div>}
  </div>;
}
