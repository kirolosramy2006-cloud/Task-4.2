import React, { useEffect, useRef } from 'react';
import Icon from './Icons.jsx';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Accessible dialog: Escape closes, focus moves in and is trapped, focus returns on close.
export default function Modal({label, onClose, className = '', closeOnBackdrop = true, children}){
  const panel = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement;
    const node = panel.current;
    const first = node.querySelector('[data-autofocus]') || node.querySelector(FOCUSABLE);
    first?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e){
      if(e.key === 'Escape'){ e.stopPropagation(); closeRef.current(); return; }
      if(e.key !== 'Tab') return;
      const list = [...node.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
      if(!list.length) return;
      const [start, end] = [list[0], list[list.length - 1]];
      if(e.shiftKey && document.activeElement === start){ e.preventDefault(); end.focus(); }
      else if(!e.shiftKey && document.activeElement === end){ e.preventDefault(); start.focus(); }
    }
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if(opener && document.contains(opener)) opener.focus();
    };
  }, []);

  return (
    <div className="overlay" onMouseDown={e => closeOnBackdrop && e.target === e.currentTarget && onClose()}>
      <section ref={panel} className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label}>
        <button type="button" className="icon-button modal-close" aria-label="Close" onClick={onClose}><Icon name="x" /></button>
        {children}
      </section>
    </div>
  );
}
