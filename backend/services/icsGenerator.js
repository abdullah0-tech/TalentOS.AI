const crypto = require('crypto');

/**
 * Formats a Date object to the standard iCalendar UTC format (YYYYMMDDTHHmmSSZ).
 * 
 * @param {Date|string|number} date - The date to format
 * @returns {string} - Formatted iCalendar date string
 */
function formatICSDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid Date passed to formatICSDate');
  }
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates a standard iCalendar (.ics) string for interview invites.
 * 
 * @param {Object} params
 * @param {string} params.title - Event summary title
 * @param {string} params.description - Event details description
 * @param {Date|string} params.startDate - Event start date/time
 * @param {number} [params.durationMinutes=45] - Duration of the interview in minutes
 * @param {string} [params.location='Video Conference'] - Location or meeting link
 * @param {string} [params.organizerName='HireFlow AI Recruiter'] - Organizer name
 * @param {string} [params.organizerEmail='noreply@hireflow.ai'] - Organizer email
 * @returns {string} - Complete iCalendar file content
 */
function generateICS({ title, description, startDate, durationMinutes = 45, location = 'Video Conference', organizerName = 'HireFlow AI Recruiter', organizerEmail = 'noreply@hireflow.ai' }) {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  
  const uid = crypto.randomUUID();
  const dtstamp = formatICSDate(new Date());
  const dtstart = formatICSDate(start);
  const dtend = formatICSDate(end);

  const cleanDescription = (description || '').replace(/\n/g, '\\n');
  const cleanTitle = (title || '').replace(/\n/g, ' ');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HireFlow AI//Calendar Invite Generator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${location}`,
    `ORGANIZER;CN="${organizerName}":mailto:${organizerEmail}`,
    'SEQUENCE:0',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

module.exports = {
  generateICS,
  formatICSDate
};
