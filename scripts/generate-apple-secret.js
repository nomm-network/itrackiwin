const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Your Apple credentials
const teamId = 'P57CS74KT4';
const clientId = 'com.itrackiwin.web';
const keyId = '45Y8P8ASJG';

// Read the private key file
const privateKeyPath = path.join(__dirname, '../docs/AuthKey_45Y8P8ASJG.p8');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

// Generate JWT payload
const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: teamId,
  iat: now,
  exp: now + 60 * 60 * 24 * 30, // 30 days expiration
  aud: 'https://appleid.apple.com',
  sub: clientId,
};

// Generate the client secret JWT
const clientSecret = jwt.sign(payload, privateKey, {
  algorithm: 'ES256',
  header: { kid: keyId },
});

console.log('🍎 Apple Client Secret JWT:');
console.log(clientSecret);
console.log('');
console.log('📋 Copy this token and paste it into Supabase → Auth → Providers → Apple → Secret Key');
console.log('⏰ This token expires in 30 days. Run this script again to regenerate.');