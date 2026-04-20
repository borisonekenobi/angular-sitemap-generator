import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';
import { createFixture, runCli } from './fixtures.js';

const requireJson = createRequire(import.meta.url);
const repoRoot = path.resolve(__dirname, '..');
const cliPath = path.join(repoRoot, 'index.js');
const packageJson = requireJson(path.join(repoRoot, 'package.json'));

test('prints help text and exits successfully', () => {
  const result = runCli(cliPath, ['--help']);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: npx angular-sitemap-generator/);
  assert.match(result.stdout, /--create-mpa-dir/);
});

test('prints package version and exits successfully', () => {
  const result = runCli(cliPath, ['--version']);

  assert.equal(result.status, 0);
  // Escape all regex-significant characters to avoid false positives with pre-release/metadata.
  const escapedVersion = packageJson.version.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
  assert.match(
    result.stdout,
    new RegExp(`angular-sitemap-generator v${escapedVersion}`)
  );
});

test('fails when no URL is provided', () => {
  const result = runCli(cliPath, []);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /URL not provided/);
});

test('fails when more than one URL is provided', () => {
  const result = runCli(cliPath, [
    'https://example.com',
    'https://second.example.com'
  ]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /URL already provided/);
});

test('writes default generator options and runs generator', (t) => {
  const fixture = createFixture(t);
  const result = runCli(cliPath, ['https://example.com'], fixture);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Building project/);
  assert.match(result.stdout, /Running generator/);

  const optionsPath = path.join(
    fixture.cwd,
    'dist',
    'sitemap',
    'node_modules',
    'angular-sitemap-generator',
    'generator_options.json'
  );
  const generatorOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));

  assert.equal(generatorOptions.url, 'https://example.com');
  assert.equal(
    generatorOptions.sitemap_path,
    path.join(fixture.cwd, 'public', 'sitemap.xml')
  );
  assert.equal(
    generatorOptions.mpa_path,
    `${path.join(fixture.cwd, 'public')}${path.sep}`
  );
  assert.equal(generatorOptions.multipage_app, false);
  assert.equal(
    generatorOptions.robots_path,
    path.join(fixture.cwd, 'public', 'robots.txt')
  );
  assert.equal(generatorOptions.generate_robots, false);
  assert.equal(generatorOptions.update_robots, false);

  assert.ok(fs.existsSync(path.join(fixture.cwd, 'generator-ran.txt')));
});

test('applies all option flags to generator options', (t) => {
  const fixture = createFixture(t);
  const result = runCli(
    cliPath,
    [
      '--path',
      './output/sitemap.xml',
      '--mpa-path',
      './output/mpa',
      '--create-mpa-dir',
      '--robots-path',
      './output/robots.txt',
      '--gen-robots',
      '--update-robots',
      'https://example.com'
    ],
    fixture
  );

  assert.equal(result.status, 0);

  const optionsPath = path.join(
    fixture.cwd,
    'dist',
    'sitemap',
    'node_modules',
    'angular-sitemap-generator',
    'generator_options.json'
  );
  const generatorOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));

  assert.equal(
    generatorOptions.sitemap_path,
    path.resolve(fixture.cwd, 'output/sitemap.xml')
  );
  assert.equal(
    generatorOptions.mpa_path,
    path.resolve(fixture.cwd, 'output/mpa')
  );
  assert.equal(generatorOptions.multipage_app, true);
  assert.equal(
    generatorOptions.robots_path,
    path.resolve(fixture.cwd, 'output/robots.txt')
  );
  assert.equal(generatorOptions.generate_robots, true);
  assert.equal(generatorOptions.update_robots, true);
});

test('fails with a build error when TypeScript build fails', (t) => {
  const fixture = createFixture(t, { tscExitCode: 1 });
  const result = runCli(cliPath, ['https://example.com'], fixture);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Build failed:/);
  assert.equal(
    fs.existsSync(path.join(fixture.cwd, 'generator-ran.txt')),
    false
  );
});

test('fails when an option requiring a value is missing its argument', () => {
  const result = runCli(cliPath, ['--path']);

  assert.notEqual(result.status, 0);
  // Verify this failed for the expected reason: missing argument for --path.
  assert.match(
    result.stderr,
    /--path.*(?:argument|value|required)|(?:argument|value|required).*--path/i
  );
});




