# Deploy to Vercel

[Back to Memento](../README.md)

## Import and publish

1. Push the latest commit to [al3xxli/memento-pack](https://github.com/al3xxli/memento-pack).
2. In Vercel, choose **Add New → Project** and import that GitHub repository.
3. Leave **Root Directory** at the repository root (`./`), not `public` or `dist`.
4. Keep the repository-provided build settings below and select **Deploy**. No environment variables are required.

| Setting | Configured value |
| --- | --- |
| Framework preset | Other (`framework: null`) |
| Node.js | 22.x |
| Install command | `npm ci --include=dev` |
| Build command | `npm run build` |
| Output directory | `dist` |

These settings are stored in `vercel.json` and `package.json`. If importing into an existing Vercel project, clear old framework/root-directory overrides and check that these values are in effect. See [Vercel's configuration reference](https://vercel.com/docs/project-configuration/vercel-json).

## What the build does

The build verifies the demo and approved artwork baseline, copies `public/` into a clean `dist/`, and includes the pinned p5.js 1.11.3 library and its license. It then checks that all HTML and interior-image references resolve inside the generated site.

Only `dist/` is published. Arduino sketches, documentation, design snapshots, environment files, and installed dependencies are not part of the deployed website. No server, database, API key, or serverless function is needed.

p5.js is served from the same deployment, not from a separate CDN. Its versioned filename is cached long-term; editable images and app files keep the platform's normal cache behavior so later artwork replacements are not locked behind immutable caching.

## Preview the production files locally

```sh
npm ci
npm run build
npm run preview
```

Open `http://localhost:8080/?present=1`. `npm run dev` also builds and serves `dist/`. After editing a source file, rebuild and refresh; this small static project does not include hot reloading. Node 22.x matches Vercel and GitHub Actions.

## After publishing

- Open the HTTPS deployment URL with `?present=1` for a clean presentation.
- Check Outer / Interior, city filters, hover stories, and keyboard states `0`–`3`.
- To connect USB, open the site as a top-level page in desktop Chrome or Edge, press **H**, select **connect**, and choose the Arduino. Avoid an embedded preview: the serial permission is intentionally scoped to the site's own origin.
- The Arduino remains attached to the presenter's computer; Vercel only serves the browser files. HTTPS supports Web Serial but does not automatically grant permission or supply a USB connection.
- For audience access, check your Vercel project's Deployment Protection setting. Preview URLs may require a Vercel login depending on the account configuration.

The automated workflow builds and checks each change; it does not create a Vercel project. Once imported through Vercel's Git integration, subsequent pushes are handled by that integration.
