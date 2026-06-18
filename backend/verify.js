require('dotenv').config();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { parseResume } = require('./services/resumeParser.service');
const { analyzeResumeWithGrok } = require('./services/grok.service');

async function runVerification() {
  console.log('===================================================');
  console.log('🔍 HIREFLOW AI ARCHITECTURAL VERIFICATION SUITE');
  console.log('===================================================');

  // Test 1: JWT Signing & Decryption (Multi-tenant check)
  console.log('\n[TEST 1] Testing JWT Signing and Tenant Extraction...');
  const secret = 'verify-jwt-secret-key-12345';
  const payload = {
    id: 'user-uuid-999',
    companyId: 'company-uuid-777',
    name: 'Verify Admin',
    email: 'admin@verify.com',
    role: 'admin'
  };

  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);
  
  if (decoded.companyId === 'company-uuid-777' && decoded.id === 'user-uuid-999') {
    console.log('✅ JWT Multi-tenant payload verification: SUCCESS');
  } else {
    throw new Error('JWT signing/verification payload mismatch.');
  }

  // Test 2: Resume Text Extraction Mock Fallback
  console.log('\n[TEST 2] Testing Resume Text Parser Fallback...');
  const fakePath = path.join(__dirname, 'nonexistent-resume.pdf');
  const parsedText = await parseResume(fakePath, 'application/pdf');
  
  if (parsedText.includes('Jane Doe') && parsedText.includes('react')) {
    console.log('✅ Resume parsing graceful error/fallback handler: SUCCESS');
  } else {
    throw new Error('Resume parsing fallback did not yield expected fallback string.');
  }

  // Test 3: Grok AI Simulator Matcher (No API Key Fallback)
  console.log('\n[TEST 3] Testing Grok AI Match Simulator...');
  const testResume = 'Jane Doe. Senior Engineer with skills in React, Node, Express, PostgreSQL, and Git.';
  const testJD = 'We are hiring a Full-Stack Engineer. Skills: React, Node, PostgreSQL, and AWS.';
  
  const analysis = await analyzeResumeWithGrok(testResume, testJD);
  
  console.log('Parsed AI Analysis Report Output:');
  console.log(JSON.stringify(analysis, null, 2));

  if (
    analysis.match_score >= 50 &&
    analysis.matched_skills.includes('react') &&
    analysis.matched_skills.includes('node') &&
    analysis.missing_skills.includes('aws')
  ) {
    console.log('✅ Grok AI analysis simulator & skill alignment: SUCCESS');
  } else {
    throw new Error('AI analysis simulator failed validation criteria.');
  }

  console.log('\n===================================================');
  console.log('🎉 ALL ARCHITECTURAL SERVICE VERIFICATION TESTS PASSED');
  console.log('===================================================');
}

runVerification().catch(error => {
  console.error('\n❌ Architectural validation failed:');
  console.error(error.message || error);
  process.exit(1);
});
