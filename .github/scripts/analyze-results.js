const fs = require('node:fs');
const {XMLParser, XMLValidator} = require('fast-xml-parser');
const path = require("node:path");
const {URL} = require("node:url");

const ngVersion = process.argv[2];

function validateSitemap() {
    const xmlData = fs.readFileSync(path.join(process.cwd(), `./sitemap.xml`), 'utf8').toString();

    const error = XMLValidator.validate(xmlData);
    if (error !== true) {
        throw error;
    }

    const parser = new XMLParser();
    let json = parser.parse(xmlData);

    if (!json['urlset']) {
        throw new Error('Missing URL set');
    }

    const urlSet = json['urlset'];
    if (!urlSet['url']) {
        throw new Error('Empty URL set');
    }

    const urls = urlSet['url'];
    if (!(urls instanceof Array) || !urls.length) {
        throw new Error('Missing URL set');
    }

    for (const url of urls) {
        if (!url['loc']) {
            throw new Error('Missing loc');
        }

        const loc = url['loc'];
        const parsedUrl = new URL(loc);
        if (!loc.startsWith(`https://v${ngVersion}.angular.dev/`)) {
            throw new Error('Unexpected start to url');
        }

        if (parsedUrl.protocol !== 'https:') {
            throw new Error('Invalid protocol');
        }
    }
}

function validateRobots() {
    const robotsData = fs.readFileSync(path.join(process.cwd(), `./robots.txt`), 'utf8').toString();
    const lines = robotsData.split('\n');
    const userAgentLines = lines.filter(line => line.toLowerCase().startsWith('user-agent:'));
    if (userAgentLines.length === 0) {
        throw new Error('No User-agent found in robots.txt');
    }
}

console.log('Validating Sitemap...');
validateSitemap();
console.log('Validating Robots.txt...');
validateRobots();
console.log('Checks passed!')
