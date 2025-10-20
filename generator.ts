#!/usr/in/env node

import "zone.js/node";
import "@angular/compiler";
import "@angular/platform-browser-dynamic";

import path from "path";
import fs from "fs";

import {routes} from "../../src/app/app.routes";
import {Route} from '@angular/router';

if (process.argv.length !== 3) {
  console.error("Invalid number of arguments.");
  console.error("Usage: npx angular-sitemap-generator [url-prefix]");
  process.exit(1);
}

const INITIAL_PATH: string = process.argv[2] + (process.argv[2].endsWith("/") ? "" : "/");

function getUrls(route: Route, prefix: string): string[] {
  if (route.path === '**') return [];
  if (route.path === '' && route.redirectTo) return [];

  let path: string = `${prefix}${route.path}`;
  if (!path.endsWith("/")) path = path + "/";
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
  paths = paths.concat(getUrls(route, INITIAL_PATH));
}

if (paths.length <= 1) throw new Error('Could not generate paths for sitemap');


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

const sitemap_path = path.resolve(process.cwd(), './public/sitemap.xml');
fs.writeFileSync(sitemap_path, xml);
console.log(`Generated sitemap: ${sitemap_path}`);
