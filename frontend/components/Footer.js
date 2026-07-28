'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Mail, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface dark:bg-background border-t border-outline dark:border-outline py-16 text-xs text-muted font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-outline dark:border-outline">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0047FF] rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-on-surface dark:text-on-surface tracking-tight font-display">
                TalentOS<span className="text-[#0047FF]">.AI</span>
              </span>
            </Link>
            <p className="text-sm text-on-surface-variant dark:text-on-surface-variant leading-relaxed max-w-sm">
              The AI-powered HR, Recruitment, and Employee Management operating system built to help modern organizations hire faster and automate workforce operations.
            </p>
            <div className="flex items-center gap-2 pt-2 text-on-surface-variant">
              <Mail size={14} className="text-[#0047FF]" />
              <a href="mailto:talentosai.contact@gmail.com" className="hover:text-[#0047FF] transition-colors font-medium">
                talentosai.contact@gmail.com
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-on-surface dark:text-on-surface font-bold text-xs uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#features" className="hover:text-[#0047FF] transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#copilot" className="hover:text-[#0047FF] transition-colors">
                  HR Copilot
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-[#0047FF] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#0047FF] transition-colors">
                  Start Free Trial
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Tech */}
          <div className="space-y-3">
            <h4 className="text-on-surface dark:text-on-surface font-bold text-xs uppercase tracking-wider">
              Platform & Security
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Tenant Isolation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu size={14} className="text-blue-500" />
                <span>xAI Grok Intelligence</span>
              </li>
              <li>
                <span className="hover:text-on-surface transition-colors">Enterprise Encryption</span>
              </li>
              <li>
                <span className="hover:text-on-surface transition-colors">GDPR Compliant</span>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-on-surface dark:text-on-surface font-bold text-xs uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-[#0047FF] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0047FF] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#0047FF] transition-colors">
                  Customer Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#0047FF] transition-colors font-semibold text-[#0047FF]">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p className="font-medium">
            &copy; {currentYear} TalentOS Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-surface-high dark:bg-surface-high text-blue-500 rounded-full border border-outline/50 font-semibold text-[11px]">
              Enterprise Ready
            </span>
            <span className="px-3 py-1 bg-surface-high dark:bg-surface-high text-emerald-500 rounded-full border border-outline/50 font-semibold text-[11px]">
              99.99% Uptime
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
