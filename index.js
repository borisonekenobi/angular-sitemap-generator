#!/usr/bin/env node

const {execSync} = require("child_process");
const fs = require("fs");
const path = require("path");

const HELP = 'HELP';
const VERSION = 'VERSION';
const SITEMAP_PATH = 'SITEMAP_PATH';
const MULTIPAGE_APP = 'MULTIPAGE_APP';
const MPA_PATH = 'MPA_PATH';
const ROBOTS_PATH = 'ROBOTS_PATH';
const GEN_ROBOTS = 'GEN_ROBOTS';
const UPDATE_ROBOTS = 'UPDATE_ROBOTS';

const options = {
    "-h": HELP,
    "--help": HELP,
    "-v": VERSION,
    "--version": VERSION,
    "-p": SITEMAP_PATH,
    "--path": SITEMAP_PATH,
    "-m": MPA_PATH,
    "--mpa-path": MPA_PATH,
    "-c": MULTIPAGE_APP,
    "--create-mpa-dir": MULTIPAGE_APP,
    "-r": ROBOTS_PATH,
    "--robots-path": ROBOTS_PATH,
    "-g": GEN_ROBOTS,
    "--gen-robots": GEN_ROBOTS,
    "-u": UPDATE_ROBOTS,
    "--update-robots": UPDATE_ROBOTS,
}

let generator_options = {
    url: null,
    sitemap_path: path.join(process.cwd(), "public/sitemap.xml"),
    mpa_path: path.join(process.cwd(), "public/"),
    multipage_app: false,
    robots_path: path.join(process.cwd(), "public/robots.txt"),
    generate_robots: false,
    update_robots: false,
}

let url_provided = false;
for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    const option_flag = options[arg];

    switch (option_flag) {
        case HELP:
            console.log("Usage: npx angular-sitemap-generator [options] <url>");
            console.log();
            console.log("Options: ");
            console.log("  -h, --help            shows help menu");
            console.log("  -v, --version         shows package version");
            console.log("  -p, --path            sets the path of the sitemap file");
            console.log("  -m, --mpa-path        sets the path of the mpa directories")
            console.log("  -c, --create-mpa-dir  sets the flag to generate MPA directories (used for ghpages)")
            console.log("  -r, --robots-path     sets the path of the robots file");
            console.log("  -g, --gen-robots      sets the flag to generate a new robots file");
            console.log("  -u, --update-robots   sets the flag to update the existing robots file");
            process.exit(0);
            break;
        case VERSION:
            const packageJson = require(path.join(__dirname, "package.json"));
            console.log(`angular-sitemap-generator v${packageJson.version}`);
            process.exit(0);
            break;
        case SITEMAP_PATH:
            generator_options.sitemap_path = path.resolve(process.argv[++i]);
            break;
        case MPA_PATH:
            generator_options.mpa_path = path.resolve(process.argv[++i]);
            break;
        case MULTIPAGE_APP:
            generator_options.multipage_app = true;
            break;
        case ROBOTS_PATH:
            generator_options.robots_path = path.resolve(process.argv[++i]);
            break;
        case GEN_ROBOTS:
            generator_options.generate_robots = true;
            break;
        case UPDATE_ROBOTS:
            generator_options.update_robots = true;
            break;
        default:
            if (url_provided) throw new Error("URL already provided");

            url_provided = true;
            generator_options.url = arg;
            break;
    }
}
if (!url_provided) throw new Error("URL not provided");

try {
    console.log("Building project...");
    execSync(`tsc -P ${path.resolve(__dirname, "tsconfig.json")}`, {stdio: "inherit"});
    fs.writeFileSync(path.join(process.cwd(), "./dist/sitemap/node_modules/angular-sitemap-generator/generator_options.json"), JSON.stringify(generator_options));
    console.log("Running generator...");
    require(path.resolve(process.cwd(), "./dist/sitemap/node_modules/angular-sitemap-generator/generator.js"));
} catch (e) {
    console.error("Build failed:", e);
    process.exit(1);
}
