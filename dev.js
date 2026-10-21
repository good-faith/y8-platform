// Y8 Dev Launcher — runs all four apps via concurrently
// Usage: node dev.js  (from scratch/ directory)

const { concurrently } = require('concurrently');
const { execSync } = require('child_process');
const path = require('path');

const root = __dirname;
const node20 = path.join(process.env.APPDATA, 'nvm', 'v20.17.0');

// Prepend Node 20 to PATH for y8-premier
process.env.PATH = node20 + path.delimiter + process.env.PATH;

// Kill any stale processes on dev ports before starting
const PORTS = [3000, 3001, 3002, 3003];
for (const port of PORTS) {
  try {
    const result = execSync(
      `netstat -ano | findstr ":${port} "`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const pids = [...new Set(
      result.trim().split('\n')
        .map(line => line.trim().split(/\s+/).pop())
        .filter(p => p && /^\d+$/.test(p) && p !== '0')
    )];
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`  Cleared port ${port} (PID ${pid})`);
      } catch {}
    }
  } catch {}
}

console.log(`
  Y8 Dev Stack
  :3000  y8-app      http://localhost:3000
  :3001  y8-server   http://localhost:3001/api/v1
  :3002  y8-premier  http://localhost:3002
  :3003  the-beach   http://localhost:3003

  Ctrl+C stops everything.
`);

const { result } = concurrently(
  [
    {
      command: 'npm run start',
      name: 'y8-app',
      cwd: path.join(root, 'y8-app'),
      prefixColor: 'cyan',
    },
    {
      command: 'npx nest start',
      name: 'y8-svr',
      cwd: path.join(root, 'y8-server'),
      prefixColor: 'yellow',
    },
    {
      command: 'npm run dev',
      name: 'premier',
      cwd: path.join(root, 'y8-premier'),
      prefixColor: 'magenta',
      env: { ...process.env, PORT: '3002', NODE_ENV: 'production' },
    },
    {
      command: 'npx nest start',
      name: 'beach',
      cwd: path.join(root, 'the-beach'),
      prefixColor: 'blue',
      env: { ...process.env, PORT: '3003' },
    },
  ],
  {
    prefix: '[{name}]',
    restartTries: 0,
  }
);

result.then(
  () => console.log('All apps stopped.'),
  (err) => {
    console.error('A process exited with error:', err.message ?? err);
    process.exit(1);
  }
);
