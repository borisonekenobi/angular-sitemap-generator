const exec = require('node:child_process').exec;

exec('npm pkg get version --json', getNextPrerelease);

/**
 * Checks the current package version
 * @param {ExecException | null} error
 * @param {string} stdout
 * @param {string} stderr
 * @returns {Promise<void>}
 */
async function getNextPrerelease(error, stdout, stderr) {
    if (error) {
        console.error(`Could not get next prerelease version:\n${error}\n${stderr}`);
        process.exit(1);
    }

    console.log(`${JSON.parse(stdout)}-borisonekenobi`);
}
