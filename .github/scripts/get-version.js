const exec = require('node:child_process').exec;

exec('npm pkg get version --json', getVersion);

/**
 * Checks the current package version
 * @param {ExecException | null} error
 * @param {string} stdout
 * @param {string} stderr
 * @returns {void}
 */
function getVersion(error, stdout, stderr) {
    if (error) {
        console.error(`Could not get package version:\n${error}\n${stderr}`);
        process.exit(1);
    }

    if (process.argv.length === 3) {
        console.log(`${JSON.parse(stdout)}-${process.argv[2]}`);
    } else if (process.argv.length === 2) {
        console.log(`${JSON.parse(stdout)}`);
    } else {
        const unexpectedArgs = process.argv.slice(2);
        throw new Error(`Expected 0 or 1 argument, but received ${unexpectedArgs.length}: ${unexpectedArgs.join(', ')}`);
    }
}
