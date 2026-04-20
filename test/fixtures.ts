import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { TestContext } from 'node:test';

export interface FixtureOptions {
  tscExitCode?: number;
}

export interface Fixture {
  cwd: string;
  binPath: string;
}

export interface CliResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Creates an isolated test fixture with a temporary directory, stub tsc command,
 * and mock generator. Automatically cleans up after the test completes.
 */
export function createFixture(t: TestContext, options: FixtureOptions = {}): Fixture {
  const { tscExitCode = 0 } = options;

  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'asg-cli-test-'));
  const binPath = path.join(cwd, 'bin');
  fs.mkdirSync(binPath, { recursive: true });

  // Provide a local "tsc" command so tests do not depend on the host toolchain.
  // Platform-specific: batch script on Windows, shell script on Unix-like systems.
  if (process.platform === 'win32') {
    const tscCmdPath = path.join(binPath, 'tsc.cmd');
    fs.writeFileSync(tscCmdPath, `@echo off\r\nexit /b ${tscExitCode}\r\n`);
  } else {
    const tscPath = path.join(binPath, 'tsc');
    fs.writeFileSync(tscPath, `#!/usr/bin/env sh\nexit ${tscExitCode}\n`);
    fs.chmodSync(tscPath, 0o755);
  }

  // Create mock generator that signals successful execution.
  const generatorDir = path.join(
    cwd,
    'dist',
    'sitemap',
    'node_modules',
    'angular-sitemap-generator'
  );
  fs.mkdirSync(generatorDir, { recursive: true });

  const generatorPath = path.join(generatorDir, 'generator.js');
  fs.writeFileSync(
    generatorPath,
    [
      "const fs = require('node:fs');",
      "const path = require('node:path');",
      "fs.writeFileSync(path.join(process.cwd(), 'generator-ran.txt'), 'ok');"
    ].join('\n')
  );

  t.after(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  return { cwd, binPath };
}

/**
 * Runs the CLI with the given arguments in an isolated environment.
 * Returns the process exit code, stdout, and stderr.
 */
export function runCli(
  cliPath: string,
  args: string[],
  options: { cwd?: string; binPath?: string } = {}
): CliResult {
  const { cwd = process.cwd(), binPath } = options;
  const env = { ...process.env };

  if (binPath) {
    // Normalize PATH for cross-platform consistency.
    // Windows can expose PATH as either env.PATH or env.Path.
    const currentPath = env.PATH ?? env.Path ?? '';
    const updatedPath = `${binPath}${path.delimiter}${currentPath}`;
    env.PATH = updatedPath;
    env.Path = updatedPath;
  }

  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    env,
    encoding: 'utf8'
  });

  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

