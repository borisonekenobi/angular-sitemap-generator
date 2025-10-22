#!/usr/in/env node

import "zone.js/node";
import "@angular/compiler";
import "@angular/platform-browser-dynamic";

import path from "path";
import fs from "fs";

import {routes} from "../../src/app/app.routes";
import {Route} from '@angular/router';

const options: {
    url: string,
    sitemap_path: string,
    robots_path: string,
    generate_robots: boolean,
    update_robots: boolean
} = require(path.join(__dirname, "generator_options.json"));

if (!options.url) throw new Error("'url' missing from generator options");
if (!options.sitemap_path) throw new Error("'sitemap_path' missing from generator options");
if (!options.robots_path) throw new Error("'robots_path' missing from generator options");
if (options.generate_robots == undefined) throw new Error("'generate_robots' missing from generator options");
if (options.update_robots == undefined) throw new Error("'update_robots' missing from generator options");

function getUrls(route: Route, prefix: string): string[] {
    if (route.path === '**') return [];
    if (route.path === '' && route.redirectTo) return [];

    if (!prefix.endsWith("/")) prefix += "/";
    let path: string = `${prefix}${route.path}`;
    if (!path.endsWith("/")) path += "/";
    let paths: string[] = [path];

    if (route.children) {
        for (const child of route.children) {
            paths = paths.concat(getUrls(child, path));
        }
    }

    return paths;
}

let paths: string[] = [];
for (const route of routes) {
    paths = paths.concat(getUrls(route, options.url));
}

if (paths.length <= 1) {
    console.error("Could not generate paths for sitemap");
    process.exit(1);
}

const date = new Date();
let xml: string = '';

xml += `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
for (const path of paths) {
    xml += `
  <url>
    <loc>${path}</loc>
    <lastmod>${date.toISOString()}</lastmod>
  </url>`
}
xml += '\n</urlset>\n';

fs.writeFileSync(options.sitemap_path, xml);
console.log(`Generated sitemap: ${options.sitemap_path}`);

const sitemap_filename = path.parse(options.sitemap_path).base;
const sitemap_url = `${options.url}${options.url.endsWith("/") ? "" : "/"}${sitemap_filename}`;

const default_robots = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap_url}\n`

if (options.generate_robots) {
    fs.writeFileSync(options.robots_path, default_robots);
    console.log(`Generated robots: ${options.robots_path}`);
}

if (options.update_robots) {
    if (!fs.existsSync(options.robots_path)) {
        console.error(`${options.robots_path} does not exist. Use -g to generate a new one.`);
        process.exit(1);
    }

    let foundSitemap = false;
    const data = fs.readFileSync(options.robots_path, {encoding: "utf-8"}).split(/\n/);
    for (let i = 0; i < data.length; i++) {
        if (data[i].startsWith("Sitemap:")) {
            data[i] = `Sitemap: ${sitemap_url}`;
            foundSitemap = true;
        }
    }

    if (!foundSitemap) {
        data.push(`\nSitemap: ${sitemap_url}\n`);
    }

    fs.writeFileSync(options.robots_path, data.join("\n"));
    console.log(`Updated robots: ${options.robots_path}`);
}
