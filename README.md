# 🗺️ Angular Sitemap Generator

**Angular Sitemap Generator** is a CLI tool that automatically creates a `sitemap.xml` file for Angular projects.  
It compiles your Angular project, analyzes your routing configuration, and generates a proper sitemap that helps search
engines index your app’s pages.

---

## 🚀 Usage

Run it directly with `npx`:

```sh
npx angular-sitemap-generator [url-path]
```

**Example:**

```sh
npx angular-sitemap-generator https://borisonekenobi.github.io/DynoC-Docs/
```

The `/` at the end of the URL is optional, and the generator adds it automatically if missing.

---

## 🧩 What It Does

1. Builds your Angular project into its own `dist/` folder.
2. Reads your routing configuration from `src/app/app.routes.ts`.
3. Traverses all routes (including nested `children`) to build a list of valid URLs.
4. Creates a `sitemap.xml` file and places it in your project’s `public/` folder.

The resulting `sitemap.xml` looks like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://example.com/</loc>
        <lastmod>2025-10-20T20:30:00.000Z</lastmod>
    </url>
    <url>
        <loc>https://example.com/path1</loc>
        <lastmod>2025-10-20T20:30:00.000Z</lastmod>
    </url>
    <url>
        <loc>https://example.com/path2</loc>
        <lastmod>2025-10-20T20:30:00.000Z</lastmod>
    </url>
</urlset>
```

Each route in your Angular project becomes a `<url>` entry.

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

After running the command, your project will contain:

```
project-root/
├── ⋮
├── public/
│   └── sitemap.xml
├── ⋮
```

---

## 🧠 Notes

- The tool adds a trailing slash to your base URL if missing.
- It automatically sets `<lastmod>` to the current UTC timestamp.
- Currently, supports **Angular 15+** projects that use standalone route definitions (`app.routes.ts`).
- If your project uses a nonstandard structure, you may need to adjust your paths manually.

---

## 💡 Example Output

For the route configuration:

```ts
export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'about', component: AboutComponent},
    {path: 'contact', component: ContactComponent}
];
```

Running:

```sh
npx angular-sitemap-generator https://example.com
```

Produces:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://example.com/</loc>
        <lastmod>2025-10-20T20:30:00.000Z</lastmod>
    </url>
    <url>
        <loc>https://example.com/about</loc>
        <lastmod>2025-10-20T20:30:00.000Z</lastmod>
    </url>
    <url>
        <loc>https://example.com/contact</loc>
        <lastmod>2025-10-20T20:30:00.000Z</lastmod>
    </url>
</urlset>
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
