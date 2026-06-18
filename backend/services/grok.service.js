const axios = require('axios');

/**
 * Fallback local mockup matcher for sandbox/development testing without an API key.
 */
const mockAIAnalysis = (resumeText, jobDescription) => {
  const resumeLower = (resumeText || '').toLowerCase();
  const jdLower = (jobDescription || '').toLowerCase();

  const possibleSkills = [
    'javascript', 'react', 'node', 'express', 'postgresql', 'prisma',
    'typescript', 'python', 'next.js', 'css', 'html', 'git', 'docker',
    'aws', 'graphql', 'rest api', 'tailwind', 'mongodb', 'redux'
  ];

  const matched = [];
  const missing = [];

  possibleSkills.forEach(skill => {
    const inJD = jdLower.includes(skill);
    const inResume = resumeLower.includes(skill);
    if (inJD && inResume) {
      matched.push(skill);
    } else if (inJD && !inResume) {
      missing.push(skill);
    }
  });

  const totalKeywords = matched.length + missing.length;
  const matchScore = totalKeywords > 0 
    ? Math.min(Math.round((matched.length / totalKeywords) * 100), 100)
    : 65;

  let level = 'Mid-level';
  if (resumeLower.includes('senior') || resumeLower.includes('lead') || resumeLower.includes('principal') || resumeLower.includes('5+ years') || resumeLower.includes('8+ years')) {
    level = 'Senior';
  } else if (resumeLower.includes('junior') || resumeLower.includes('intern') || resumeLower.includes('0-1 years') || resumeLower.includes('student')) {
    level = 'Junior';
  }

  // Phase 2 Rich Fallback Insights
  const strengths = [];
  const weaknesses = [];

  if (matched.length > 2) {
    strengths.push(`Proven technical alignment with core stack including: ${matched.slice(0, 3).join(', ')}.`);
  } else {
    strengths.push('Demonstrated basic web application engineering fundamentals.');
  }

  if (resumeLower.includes('led') || resumeLower.includes('managed') || resumeLower.includes('team')) {
    strengths.push('Shows strong ownership, collaboration, and potential project leadership qualities.');
  } else {
    strengths.push('Highly capable individual contributor aligned to team goals.');
  }

  strengths.push('Displays clear professional career path progression with structured coding experiences.');

  if (missing.length > 0) {
    weaknesses.push(`Requires ramp-up on target stack tools: ${missing.slice(0, 2).join(', ')}.`);
  } else {
    weaknesses.push('Could further expand domain-specific automation testing suites.');
  }

  weaknesses.push('Limited explicit mention of public cloud CI/CD deployment optimization.');

  return {
    match_score: matchScore,
    matched_skills: matched.length > 0 ? matched : ['javascript', 'react'],
    missing_skills: missing.length > 0 ? missing : ['postgresql', 'docker'],
    experience_level: level,
    summary: 'Candidate shows matching experience based on localized heuristic fallback parser. The resume contains details supporting web engineering stack.',
    recommendation: matchScore >= 75 ? 'Strongly Recommended' : 'Schedule Screening Call',
    strengths,
    weaknesses,
    personality_summary: 'Displays details-oriented engineering behavior. Methodical communicator with a collaborative focus and a clear drive for continuous skill growth.',
    communication_assessment: 'Very Good. Technical explanations are concise, professional, and well-structured throughout the experience history.',
    technical_strength: 'Proficient full stack foundations. Demonstrates solid javascript comprehension and familiarity with typical library stacks.',
    leadership_potential: level === 'Senior' ? 'High. Ready for mentoring responsibilities and managing feature lifecycle ownership.' : 'Moderate. Shows strong capability as a team-player with potential for initiative-taking.'
  };
};

/**
 * Analyzes resume content against a job description using the Grok API (x.ai).
 */
const analyzeResumeWithGrok = async (resumeText, jobDescription) => {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey || apiKey === 'your-grok-api-key' || apiKey.trim() === '') {
    console.warn('XAI_API_KEY is not configured. Falling back to local AI analysis simulator.');
    return mockAIAnalysis(resumeText, jobDescription);
  }

  try {
    const prompt = `
You are an AI HR recruitment assistant.

Analyze this candidate resume against the provided job description.

=== JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE RESUME ===
${resumeText}

Return JSON format only. Do not include markdown code block syntax (like \`\`\`json). The response must be a single, valid JSON object matching this schema:
{
  "match_score": number (0 to 100),
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skillA", "skillB"],
  "experience_level": "Junior | Mid-level | Senior",
  "summary": "Brief executive summary paragraph",
  "recommendation": "Hiring recommendation call to action",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "personality_summary": "Summary of the candidate's personality and work style",
  "communication_assessment": "Assessment of written communication skills",
  "technical_strength": "Technical capabilities evaluation",
  "leadership_potential": "Evaluation of leadership and mentorship capabilities"
}
`;

    // Try using grok-beta which is generally available
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-beta',
        messages: [
          { role: 'system', content: 'You are a professional HR Screening assistant that extracts candidate match analytics in raw JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000 // 25s timeout limit
      }
    );

    let content = response.data.choices[0].message.content.trim();
    
    // Cleanup markdown backticks if returned
    if (content.startsWith('```json')) {
      content = content.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (content.startsWith('```')) {
      content = content.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const result = JSON.parse(content);
    return {
      match_score: result.match_score ?? 70,
      matched_skills: result.matched_skills ?? [],
      missing_skills: result.missing_skills ?? [],
      experience_level: result.experience_level ?? 'Mid-level',
      summary: result.summary ?? '',
      recommendation: result.recommendation ?? 'Review manually',
      strengths: result.strengths ?? [],
      weaknesses: result.weaknesses ?? [],
      personality_summary: result.personality_summary ?? '',
      communication_assessment: result.communication_assessment ?? '',
      technical_strength: result.technical_strength ?? '',
      leadership_potential: result.leadership_potential ?? ''
    };
  } catch (error) {
    console.error('Grok API call failed:', error.response?.data || error.message);
    console.log('Using local fallback simulation for this applicant.');
    return mockAIAnalysis(resumeText, jobDescription);
  }
};

module.exports = { analyzeResumeWithGrok };

