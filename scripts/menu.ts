import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import * as clack from '@clack/prompts';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

// Short, human-readable descriptions for each npm script — script names alone (e.g.
// "dev:test-data:reset") don't self-explain, so this menu pairs each one with a one-line hint.
const SCRIPT_DESCRIPTIONS: Record<string, string> = {
  start: 'Run the built server (node dist/app.js)',
  dev: 'Run the dev server with pretty-printed logs',
  watch: 'Run the dev server, auto-restarting on file changes',
  build: 'Type-check and compile to dist/',
  typecheck: 'Type-check the whole project without emitting output',
  test: 'Run the unit test suite',
  'test:unit': 'Run the unit test suite',
  'test:integration': 'Run the integration test suite (hits real external services)',
  'dev:test-data:reset': 'Reset and rebuild local dev test data',
  generate: 'Regenerate the OpenAPI/swagger docs from the schema files',
  'oauth:refresh': 'Get a new Google OAuth refresh token',
  menu: 'Open this menu',
};

const runScript = (scriptName: string): void => {
  const child = spawn('npm', ['run', scriptName], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 0));
};

const main = async (): Promise<void> => {
  clack.intro('Blackwell Time Backend');

  const scriptNames = Object.keys(packageJson.scripts);
  const selectedScript = await clack.select({
    message: 'Which command do you want to run?',
    options: scriptNames.map((scriptName) => ({
      value: scriptName,
      label: scriptName,
      hint: SCRIPT_DESCRIPTIONS[scriptName],
    })),
  });

  if (clack.isCancel(selectedScript)) {
    clack.cancel('Cancelled.');
    process.exit(0);
  }

  clack.outro(`Running "npm run ${selectedScript}"...`);
  runScript(selectedScript);
};

main();
