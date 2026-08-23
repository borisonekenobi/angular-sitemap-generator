import {GeneratorOptions} from './generator_options';
import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'child_process';

require('@angular/compiler');

export function generate(
	url: URL, paths: string[], options: GeneratorOptions): void {
	generateSitemap(url, paths, options);

	const sitemap_filename = path.parse(options.sitemap_path).base;
	const sitemap_url = `${url.toString()}/${sitemap_filename}`;

	if (options.multipage_app) generateMPA(url, paths, options);
	if (options.generate_robots) generateRobots(sitemap_url, options);
	if (options.update_robots) updateRobots(sitemap_url, options);
}

function generateSitemap(
	url: URL, paths: string[], options: GeneratorOptions): void {
	const date = new Date();
	let xml: string = '';

	xml += `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
	for (const path of paths) {
		xml += `
  <url>
    <loc>${url}${path}</loc>
    <lastmod>${date.toISOString()}</lastmod>
  </url>`;
	}
	xml += '\n</urlset>\n';

	fs.writeFileSync(options.sitemap_path, xml);
	console.log(`Generated sitemap: ${options.sitemap_path}`);
}

function generateMPA(
	url: URL, paths: string[], options: GeneratorOptions): void {
	console.log('Building Angular project...');
	const base_href = `${url.pathname}/`;
	const build_output = execSync(`ng build --base-href ${base_href}`,
		{stdio: 'pipe'}).toString().split('\n');
	const output_path = build_output.find(
		(line: string) => line.startsWith('Output location: '))?.substring(17);
	if (output_path === undefined) throw new Error(
		'Unable to build Angular project');
	const index_path = path.resolve(output_path, 'browser/index.html');
	const index_code = fs.readFileSync(index_path, 'utf8');

	paths.forEach(route => {
		if (route === '' || route === '/') return;

		const p = path.resolve(options.mpa_path, route.substring(1));
		if (!fs.existsSync(p)) fs.mkdirSync(p);
		fs.writeFileSync(path.resolve(p, 'index.html'), index_code);
	});
	console.log(`Generated mpa directories in: ${options.mpa_path}`);
}

function generateRobots(sitemap_url: string, options: GeneratorOptions): void {
	const default_robots = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap_url}\n`;
	fs.writeFileSync(options.robots_path, default_robots);
	console.log(`Generated robots: ${options.robots_path}`);
}

function updateRobots(sitemap_url: string, options: GeneratorOptions): void {
	if (!fs.existsSync(options.robots_path)) {
		console.error(
			`${options.robots_path} does not exist. Use -g to generate a new one.`);
		process.exit(1);
	}

	let foundSitemap = false;
	const data = fs.readFileSync(options.robots_path, {encoding: 'utf-8'}).
		split(/\n/);
	for (let i = 0; i < data.length; i++) {
		if (data[i].startsWith('Sitemap:')) {
			data[i] = `Sitemap: ${sitemap_url}`;
			foundSitemap = true;
		}
	}

	if (!foundSitemap) {
		data.push(`\nSitemap: ${sitemap_url}\n`);
	}

	fs.writeFileSync(options.robots_path, data.join('\n'));
	console.log(`Updated robots: ${options.robots_path}`);
}
