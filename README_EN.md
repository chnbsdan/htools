# HTools

HTools is an open-source tool directory built on Cloudflare Pages Functions and D1. It can be used as a personal or public tool library with articles, RSS / Atom content flows, GitHub issue submissions, GitHub repository metadata, category management, site settings, backup and restore, and public subscription feeds.

[中文文档](README.md)

## Features

- Public site: home, tool categories, articles, tool submission, and about page.
- Admin dashboard: tools, articles, content flows, categories, and system settings.
- Content flows: sync RSS / Atom feeds, preview items, and convert entries into site articles.
- Markdown: article content and the about page support Markdown.
- GitHub integration: users can sign in with GitHub and submit tools as repository issues; admins can fetch GitHub repository metadata when adding tools.
- Categories: pre-create, filter, delete, and batch-handle tool, article, and content-flow categories.
- Data tools: full backup / restore, default tool subscription source, and public site source at `/api/htools.json`.
- SEO feeds: `/sitemap.xml`, `/rss.xml`, and `/rss.json`.
- UI languages: Simplified Chinese and English.

## Deployment

1. Fork or import this repository into your GitHub account.
2. Create a Cloudflare Pages project and connect it to your repository.
3. Use these Pages build settings:

```txt
Build command: npm run build
Build output directory: dist
```

4. Create a Cloudflare D1 database, for example `htools`.
5. Go back to the Pages project settings and add a D1 binding for Functions:

```txt
Variable name: DB
D1 database: select the database you just created
```

6. Add the admin password as a Pages environment variable:

```txt
ADMIN_PASSWORD=your-admin-password
```

The admin password only has to be non-empty. Letters, numbers, symbols, and Unicode characters are accepted, and the project does not enforce a minimum or maximum length; use a unique password of at least 12 characters.

7. Redeploy the Pages project.
8. Open `/admin` and sign in.

The app initializes the D1 schema automatically on first API access. The database starts empty; HTools does not write default tools during deployment. Import `/htools.json` from the admin dashboard or add tools manually.

## Local Development

```bash
npm install
npm run dev
```

For local Pages Functions and D1 testing:

```bash
copy .dev.vars.example .dev.vars
copy wrangler.local.example.toml wrangler.local.toml
```

Fill `account_id`, `database_name`, and `database_id` in `wrangler.local.toml`, then start local Pages Functions:

```bash
npm run pages:dev
```

For manual D1 initialization or troubleshooting:

```bash
npm run db:init:local
npm run db:init:remote
```

## Admin Settings

- `/admin`: admin dashboard entry.
- System Settings: site name, site icon, about page Markdown, footer, GitHub submissions, proxy fallback, backup / restore, and admin password.
- GitHub submissions: configure a GitHub OAuth App and target repository so public submissions at `/submit` create GitHub issues.
- GitHub repository info: when adding or editing a tool, enter a GitHub repository URL to fetch metadata.

GitHub OAuth App Authorization callback URL:

```txt
https://your-domain.com/api/github/callback
```

## Data Sources

- Default source file: `public/htools.json`
- Default source URL: `/htools.json`
- Current site public source: `/api/htools.json`

`/htools.json` is only the default subscription source. It is not written to D1 automatically. Administrators can import it from the dashboard or import another site's `/api/htools.json`.

## SEO And Feeds

- `/sitemap.xml`: sitemap for public pages and published articles.
- `/rss.xml`: RSS feed for published articles.
- `/rss.json`: JSON Feed for published articles.

## Security Recommendations

- Configure the admin password and GitHub OAuth Client Secret as Cloudflare Pages environment variables. Do not put secrets in public code.
- Use a long, unique admin password and update it periodically.
- Before enabling GitHub submissions, make sure the target repository allows issue creation.
- Export a full backup in the admin dashboard before major updates, site migrations, or bulk imports.

## Version

Current version: `HTools v1.0.1`
