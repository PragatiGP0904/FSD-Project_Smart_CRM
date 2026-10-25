const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function run(args) {
  const result = spawnSync('npm', args, { cwd: root, stdio: 'inherit', shell: true });
  return result.status ?? 1;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function collect(report) {
  if (!report) return [];
  const files = report.testResults || report.testResults || [];
  const rows = [];
  files.forEach((file) => {
    (file.assertionResults || []).forEach((test) => {
      rows.push({
        name: test.title || test.fullName,
        status: String(test.status || '').toLowerCase() === 'passed' ? 'PASS' : 'FAIL',
      });
    });
  });
  return rows;
}

const backendCode = run(['test', '--prefix', 'backend']);
const frontendCode = run(['test', '--prefix', 'frontend']);
const backendRows = collect(readJson(path.join(root, 'docs', '.backend-jest.json')));
const frontendRows = collect(readJson(path.join(root, 'docs', '.frontend-vitest.json')));
const rows = [...backendRows, ...frontendRows];
const required = rows.filter((row) => /^\d+\./.test(row.name));
const extra = rows.filter((row) => !/^\d+\./.test(row.name));

const line = (row) => `| ${row.name.replace(/\|/g, '/')} | ${row.status} |`;
const missing = [];
for (let number = 1; number <= 16; number += 1) {
  if (!required.some((row) => row.name.startsWith(`${number}.`))) missing.push(number);
}

const markdown = `# Test results

Generated from the Jest and Vitest runs. A row is PASS only when that run reported the test as passed.

| Test | Result |
| --- | --- |
${required.map(line).join('\n') || '| No numbered tests were recorded | FAIL |'}

## Additional automated tests

| Test | Result |
| --- | --- |
${extra.map(line).join('\n') || '| None | — |'}

## Case 16 notes

The automated check renders the app shell and confirms the phone navigation control, primary links, and command menu are present.

Manual inspection of the running app on 25 Oct 2026:

| Check | Result |
| --- | --- |
| 390px width: navigation opens from the menu button and records render as cards | PASS |
| 768px width: sidebar is visible and the menu button is hidden | PASS |
| 1280px and wider: sidebar, tables, pipeline, and dashboard render | PASS |
| Pipeline drag with a pointer | Not verified in the browser. Stage rules are covered by API tests 8, 9, and 10. |

## Run status

- Backend exit code: ${backendCode}
- Frontend exit code: ${frontendCode}
- Numbered cases missing from the report: ${missing.length ? missing.join(', ') : 'none'}
`;

fs.writeFileSync(path.join(root, 'docs', 'TEST_RESULTS.md'), markdown);
process.exit(backendCode || frontendCode ? 1 : 0);
