// backend/src/config/validateEnv.js
// Abort start‑up if mandatory environment variables are missing.
// PORT has a safe default (5000) so it is not required here.

const required = [
  'JWT_SECRET',
  'CLIENT_URL',
];

if (process.env.NODE_ENV === 'production') {
  required.push('MONGODB_URI');
}

const missing = required.filter((key) => !process.env[key] || String(process.env[key]).trim() === '');

if (missing.length) {
  const list = missing.map((k) => `  • ${k}`).join('\n');
  throw new Error(
    `🚨 Missing required environment variable(s):\n${list}\n` +
    'Please create a .env file (or set the variables in your environment) before starting the server.'
  );
}
