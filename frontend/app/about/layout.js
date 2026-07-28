import React from 'react';

export const metadata = {
  title: 'About TalentOS | AI-Powered HR & Recruitment Platform',
  description: 'Learn about TalentOS, the AI-powered HR, Recruitment, and Employee Management operating system built to automate recruitment workflows and elevate workplace productivity.',
  keywords: ['TalentOS', 'AI HR Platform', 'AI ATS', 'Recruitment Software', 'Employee Portal', 'HR Automation', 'Grok AI'],
  openGraph: {
    title: 'About TalentOS | AI-Powered HR & Recruitment Platform',
    description: 'Transforming modern recruitment with artificial intelligence and workflow automation.',
    url: 'https://talentos.ai/about',
    siteName: 'TalentOS.AI',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About TalentOS | AI-Powered HR & Recruitment Platform',
    description: 'Transforming modern recruitment with artificial intelligence and workflow automation.'
  }
};

export default function AboutLayout({ children }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TalentOS.AI',
    url: 'https://talentos.ai',
    description: 'AI-Powered HR, Recruitment, and Employee Management operating system.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'talentosai.contact@gmail.com',
      contactType: 'customer support'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
