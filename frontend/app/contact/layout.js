import React from 'react';

export const metadata = {
  title: 'Contact TalentOS | Support, Sales & Inquiries',
  description: 'Get in touch with the TalentOS team. Have questions about our AI ATS, pricing, technical support, or partnerships? We are here to help.',
  keywords: ['Contact TalentOS', 'TalentOS Support', 'HR AI Sales', 'ATS Customer Service', 'Recruitment Platform Support'],
  openGraph: {
    title: 'Contact TalentOS | Support, Sales & Inquiries',
    description: 'We would love to hear from you. Reach out to our team for sales, support, or general inquiries.',
    url: 'https://talentos.ai/contact',
    siteName: 'TalentOS.AI',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact TalentOS | Support, Sales & Inquiries',
    description: 'We would love to hear from you. Reach out to our team for sales, support, or general inquiries.'
  }
};

export default function ContactLayout({ children }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact TalentOS.AI',
    url: 'https://talentos.ai/contact',
    description: 'Contact Support, Sales, and General Inquiries for TalentOS.AI.',
    mainEntity: {
      '@type': 'Organization',
      name: 'TalentOS.AI',
      email: 'talentosai.contact@gmail.com',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          email: 'talentosai.contact@gmail.com',
          contactType: 'customer support',
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00'
          }
        }
      ]
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
