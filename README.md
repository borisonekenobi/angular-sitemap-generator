# 🗺️ Angular Sitemap Generator

**Angular Sitemap Generator** is a CLI tool that automatically creates a `sitemap.xml` file for Angular projects.  
It compiles your Angular project, analyzes your routing configuration, and generates a proper sitemap that helps search
engines index your app’s pages.  
It can also optionally generate **MPA-like (Multi-Page Application)** directory structures for hosting platforms like 
**GitHub Pages**, which don’t natively support Angular’s SPA routing.

---

## 🚀 Usage

Run it directly with **npx** (no installation required):

```sh
npx angular-sitemap-generator [url-path] [options]
```

**Example:**

```sh
npx angular-sitemap-generator https://borisonekenobi.github.io/DynoC-Docs/
```

The `/` at the end of the URL is optional — the generator adds it automatically if missing.

---

## ⚙️ CLI Options

| Short       | Long Form              | Description                                                                                    |
|:------------|:-----------------------|:-----------------------------------------------------------------------------------------------|
| `-h`        | `--help`               | Shows the help menu                                                                            |
| `-v`        | `--version`            | Displays the current package version                                                           |
| `-p <path>` | `--path <path>`        | Sets the path where the generated `sitemap.xml` file will be saved                             |
| `-c`        | `--create-mpa-dir`     | Generates MPA-style directories in the public folder (for GitHub Pages and other static hosts) |
| `-m <path>` | `--mpa-path <path>`    | Sets a custom path for the generated MPA directories                                           |
| `-r <path>` | `--robots-path <path>` | Sets the path of the `robots.txt` file                                                         |
| `-g`        | `--gen-robots`         | Generates a new `robots.txt` file if one doesn’t exist                                         |
| `-u`        | `--update-robots`      | Updates the existing `robots.txt` file to include a link to the sitemap                        |

---

## 🧩 What It Does

1. Builds your Angular project the `dist/` folder.
2. Reads your routing configuration from `src/app/app.routes.ts`.
3. Traverses all routes (including nested `children`) to build a list of valid URLs.
4. Creates a `sitemap.xml` file and places it in your specified or default **`public/`** folder.
5. Optionally generates or updates a `robots.txt` file.
6. *(New!)* Optionally creates MPA directories for each route — this means each route like `/about` gets its own
   `/about/index.html` file, preventing 404 errors on GitHub Pages and similar platforms.

---

## 🧱 MPA Directory Generation

When you include the `-c` (or `--create-mpa-dir`) flag, the generator will create directories for each route found in
your Angular app.  
These directories mimic a traditional multipage site so that static hosts can serve your app correctly.

For example, if your routes are:

```ts
export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'about', component: AboutComponent},
    {path: 'contact', component: ContactComponent}
];
```

Running:

```sh
npx angular-sitemap-generator https://example.com -c
```

Will create this structure inside your **public folder**:

```
public/
├── about/
│   └── index.html
├── contact/
│   └── index.html
├── sitemap.xml
├── robots.txt
└── index.html
```

Each generated `index.html` file is a copy of your built Angular `index.html`, ensuring navigation works even when users
directly load a deep link such as `https://example.com/about`.

You can also control where these MPA directories are created using `-m` or `--mpa-path`:

```sh
npx angular-sitemap-generator https://example.com -c -m ./dist/mpa
```

---

## 📁 Project Requirements

This tool expects a **default Angular project structure**, specifically:

- The routing file is located at:
  ```
  src/app/app.routes.ts
  ```
- It must export a variable named `routes` of type `Routes` or `Route[]` from `@angular/router`:
  ```ts
  import { Routes } from '@angular/router';

  export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    {
      path: 'blog',
      children: [
        { path: '', component: BlogListComponent },
        { path: ':id', component: BlogPostComponent }
      ]
    }
  ];
  ```

The generator will automatically walk through all routes and their `children` recursively.

---

## 📦 Output

After running the command, your project may contain:

```
project-root/
├── dist/
│   ├── [your-built-angular-project]
│   └── sitemap/
│       └── [temporary files to build sitemap.xml]
├── public/
│   ├── about/
│   │   └── index.html
│   ├── contact/
│   │   └── index.html
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    └── app/
        └── app.routes.ts
```

---

## 🧠 Notes

- The tool adds a trailing slash to your base URL if missing.
- It automatically sets `<lastmod>` to the current UTC timestamp.
- You can specify custom paths for both the sitemap, robots, and MPA directories.
- Use `--gen-robots` to create a new `robots.txt`, or `--update-robots` to update an existing one.
- Use `--create-mpa-dir` to generate static directories for each route (fixing 404 errors on GitHub Pages).
- Compatible with **Angular 18+** projects using standalone route definitions.

---

## 💡 Example Output

Running:

```sh
npx angular-sitemap-generator https://example.com -g -c
```

Generates:

- A complete `sitemap.xml`
- A `robots.txt` file with the sitemap link
- An MPA-like directory structure to support static hosting

Your `robots.txt` will include:

```
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

---

## 🧰 Development

If you want to work on or modify this tool locally:

```sh
git clone https://github.com/borisonekenobi/angular-sitemap-generator
cd angular-sitemap-generator
npm install
npm run build
node ./dist/index.js https://example.com
```

---

## 📄 License

[MIT](LICENSE)

---

### Made with ❤️ by [Boris Vasilev](https://github.com/borisonekenobi)
