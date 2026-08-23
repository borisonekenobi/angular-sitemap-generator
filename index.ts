#!/usr/bin/env node

import {program} from 'commander';
import path from 'node:path';
import {GeneratorOptions} from './generator_options';
import {extractRoutePaths} from './extractor';
import {generate} from './generator';

function main(): number {
    program.
        name('angular-sitemap-generator').
        description('Generates a sitemap.xml file for Angular projects').
        version('1.0.0', '-v, --version',
            'output the current version of the package');

    program.
        helpOption().
        argument('<url>', 'the base URL of the website').
        option('-i, --input <path>', 'sets the path of the routes file').
        option('-o, --output <path>', 'sets the path of the sitemap file').
        option('-m, --mpa-path <path>', 'sets the path of the mpa directories').
        option('-c, --create-mpa-dir',
            'sets the flag to generate MPA directories (used for ghpages)').
        option('-r, --robots-path <path>', 'sets the path of the robots file').
        option('-g, --gen-robots',
            'sets the flag to generate a new robots file').
        option('-u, --update-robots',
            'sets the flag to update the existing robots file');

    program.parse(process.argv);
    let [url] = program.args;
    const options = program.opts();

    let paths: string[] = [];
    let generator_options: GeneratorOptions = {
        routes_path: options['input'] ??
            path.join(process.cwd(), 'src/app/app.routes.ts'),
        sitemap_path: options['output'] ??
            path.join(process.cwd(), 'public/sitemap.xml'),
        mpa_path: options['mpaPath'] ?? path.join(process.cwd(), 'public/'),
        multipage_app: options['createMpaDir'] ?? false,
        robots_path: options['robotsPath'] ??
            path.join(process.cwd(), 'public/robots.txt'),
        generate_robots: options['genRobots'] ?? false,
        update_robots: options['updateRobots'] ?? false,
    };

    try {
        console.log('Reading project...');
        paths = extractRoutePaths(generator_options.routes_path);
        if (paths.length === 0) {
            console.log('No routes found.');
            process.exit(0);
        }

        console.log('Running generator...');
        if (url.endsWith('/')) url = url.substring(0, url.length - 1);
        generate(new URL(url), paths, generator_options);
    } catch (e) {
        console.error('Build failed:', e);
        return 1;
    }

    return 0;
}

process.exit(main());
