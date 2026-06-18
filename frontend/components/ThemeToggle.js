'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-none bg-slate-100 border border-outline animate-pulse"></div>
    );
  }

  const themes = [
    { name: 'light', label: 'Light', icon: Sun },
    { name: 'dark', label: 'Dark', icon: Moon },
    { name: 'system', label: 'System', icon: Monitor }
  ];

  const CurrentIcon = 
    theme === 'light' ? Sun :
    theme === 'dark' ? Moon : Monitor;

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-none bg-slate-50 hover:bg-slate-100 border border-outline text-on-surface-variant hover:text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Toggle theme"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <CurrentIcon size={14} className="text-primary" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-surface border-2 border-primary rounded-none py-1 z-50 animate-slide-up">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.name;
            return (
              <button
                key={t.name}
                onClick={() => {
                  setTheme(t.name);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 transition-colors ${
                  isSelected 
                    ? 'bg-primary-light text-primary' 
                    : 'text-on-surface-variant hover:bg-slate-50 hover:text-on-surface'
                }`}
              >
                <Icon size={13} className={isSelected ? 'text-primary' : 'text-muted'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
