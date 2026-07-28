'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname() || '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Contact', href: '/contact' }
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname.startsWith(href);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-surface/90 dark:bg-background/90 backdrop-blur-md border-b border-outline dark:border-outline/80 shadow-sm'
        : 'bg-surface/60 dark:bg-background/60 backdrop-blur-sm border-b border-outline/40 dark:border-outline/40'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-[#0047FF] group-hover:bg-[#0036C7] rounded-xl flex items-center justify-center text-white transition-all shadow-md shadow-blue-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-on-surface dark:text-on-surface font-display">
            TalentOS<span className="text-[#0047FF]">.AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors relative py-1 ${
                  active 
                    ? 'text-[#0047FF] dark:text-[#0047FF] font-semibold' 
                    : 'text-on-surface-variant dark:text-on-surface-variant hover:text-[#0047FF] dark:hover:text-[#0047FF]'
                }`}
              >
                {link.name}
                {active && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0047FF] rounded-full animate-fade-in" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Side CTA & Theme */}
        <div className="hidden sm:flex items-center gap-4">
          <ThemeToggle />
          
          <Link 
            href="/login" 
            className="text-sm font-semibold text-on-surface-variant dark:text-on-surface-variant hover:text-[#0047FF] dark:hover:text-[#0047FF] transition-colors px-3 py-2"
          >
            Login
          </Link>
          
          <Link 
            href="/register" 
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0047FF] hover:bg-[#0036C7] text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-on-surface dark:text-on-surface hover:text-[#0047FF] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-surface dark:bg-background border-b border-outline dark:border-outline px-4 pt-2 pb-6 space-y-3 animate-slide-down">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    active 
                      ? 'bg-[#0047FF]/10 text-[#0047FF] font-semibold' 
                      : 'text-on-surface dark:text-on-surface hover:bg-surface-high dark:hover:bg-surface-high'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-outline dark:border-outline flex flex-col gap-2.5">
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-outline dark:border-outline text-sm font-semibold text-on-surface dark:text-on-surface hover:bg-surface-high dark:hover:bg-surface-high transition-colors"
            >
              Login
            </Link>
            
            <Link 
              href="/register" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#0047FF] hover:bg-[#0036C7] text-white text-sm font-semibold transition-all shadow-sm shadow-blue-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
