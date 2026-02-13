const exec = require('node:child_process').exec;
const semver = require('semver');

exec('npm pkg get version', checkCurrentVersion);

/**
 * Checks the current package version
 * @param {ExecException | null} error
 * @param {string} stdout
 * @param {string} stderr
 * @returns {Promise<void>}
 */
async function checkCurrentVersion(error, stdout, stderr) {
    if (error) {
        console.error(`Could not perform version check:\n${error}\n${stderr}`);
        process.exit(1);
    }

    const version = JSON.parse(stdout);
    if (semver.prerelease(version)) {
        throw new Error('Version should not be prerelease!');
    }

    const info = await getPackageInfo();
    const versions = Object.keys(info['versions']);
    if (versions.includes(version)) {
        throw new Error('Version bump required!')
    }

    const latest = info['dist-tags']['latest'];
    if (version < latest) {
        throw new Error('Version should not be smaller than latest!')
    }

    console.log(`Version check passed: ${version}`);
}

/**
 * Gets all package info
 * @returns {Promise<object>}
 */
async function getPackageInfo() {
    const res = await fetch('https://registry.npmjs.org/angular-sitemap-generator');
    return await res.json();
}
