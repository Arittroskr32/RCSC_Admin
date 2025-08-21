#!/usr/bin/env node
// ESM wrapper to run `serve -s dist -l <port>` in a cross-shell-friendly way.
// Usage:
//  - `npm start` -> uses process.env.PORT or falls back to 5173
//  - `npm start -- 8080` -> uses provided arg 8080

import { spawn } from 'child_process';

const cliPort = process.argv[2];
const port = cliPort || process.env.PORT || '5173';

const command = `npx serve -s dist -l ${port}`;
console.log(`Starting static server: ${command}`);

const child = spawn(command, { stdio: 'inherit', shell: true });
child.on('exit', (code) => process.exit(code));
