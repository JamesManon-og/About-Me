# Deployment

How to put the site live on Vercel, check it, and keep it updated. Nothing here needs a
paid service: the site runs with no API key and no environment variables.

## What gets deployed

| Piece | Rendering | Notes |
|---|---|---|
| `/` (the chat) | Static | Answers come from `/api/chat` |
| `/api/chat` | Serverless function, region `sin1` (`vercel.json`) | Prebuilt answers from `data/james/faq.ts`. Claude only if `ANTHROPIC_API_KEY` is set |
| `/opengraph-image`, `/robots.txt`, `/sitemap.xml` | Static | Share image and SEO files |
| `/design` | Static, `noindex` | The design-token preview |

Security headers and the Content-Security-Policy come from `next.config.ts`
(`lib/security/headers.ts`). HTTPS-only headers switch on when Vercel builds the site.

## Before the first deploy

1. **Read every answer in `data/james/faq.ts`.** The site shows them word for word, so
   this is the review that matters most. Change anything that doesn't sound like you or
   overstates something, then rerun the checks below.
2. Run the checks. Each one runs locally and costs nothing.

```bash
bun run check
```

```bash
bun run test:e2e
```

```bash
bun run eval
```

All three must pass. `bun run eval` should end with `PASSED: every kind met its threshold.`

## First deploy (about 10 minutes)

1. Merge the stage branch into `main` on GitHub.
2. Sign in at [vercel.com](https://vercel.com) with your GitHub account.
3. **Add New → Project**, then import `JamesManon-og/About-Me`.
4. Leave the detected settings: framework **Next.js**. Vercel sees `bun.lock` and installs
   with bun. The build command stays `next build`.
5. **Environment variables: add none.** In particular:
   - Don't set `CHAT_MODEL_MOCK`. The build refuses it on production, on purpose.
   - Don't set `ANTHROPIC_API_KEY` yet. See [Turning on Claude](#turning-on-claude-optional-costs-money).
6. **Deploy.** The first build takes a minute or two and gives you a URL like
   `about-me-xxxx.vercel.app`.
7. In **Settings → General → Node.js Version**, choose **22.x** to match `.nvmrc`.

From then on, every push to `main` deploys to production, and every pull request gets
its own preview URL.

## Check the live site

Replace `YOUR-URL` with the deployment's address.

1. Open the site and click **What can James do?** The approved answer appears, with
   Related chips under it.
2. Ask something off-topic, such as "What's the weather?". You should get "I don't have
   that information…" and three closest questions.
3. Run the evals against the deployment (free):

   ```bash
   bun run eval --url https://YOUR-URL/api/chat
   ```

4. Check the security headers:

   ```bash
   curl -sI https://YOUR-URL
   ```

   Look for `content-security-policy`, `strict-transport-security` and
   `x-frame-options: DENY`.
5. Try a share link: `https://YOUR-URL/?ask=What%20is%20MoneyApp%3F` asks its question
   as soon as the page opens, then removes it from the address bar.
6. Paste the URL into LinkedIn's [Post Inspector](https://www.linkedin.com/post-inspector/)
   to see the share card and image.

## Custom domain (optional)

1. Vercel: **Settings → Domains → Add**, then follow the DNS instructions.
2. Add the environment variable `NEXT_PUBLIC_SITE_URL=https://your-domain` for
   Production, then redeploy. The canonical URL, sitemap and share image use it.
   Without it they use Vercel's production domain.
3. Optional: add the domain to [Google Search Console](https://search.google.com/search-console)
   and submit `https://your-domain/sitemap.xml`.

## Updating what the chat says

1. Change the facts in the private ledger first (`docs/private/FACTS_LEDGER.md`).
2. Edit `data/james/faq.ts` (answers) or `data/james/*.ts` / `content/james/*.md` (facts).
3. Run `bun run check` and `bun run eval`. The routing test fails if a new wording breaks
   matching.
4. Open a pull request. CI runs the checks and the browser tests, and Vercel builds a
   preview.
5. Merge. Production updates automatically.

## Rolling back

Vercel: **Deployments**, pick the last good one, then **⋯ → Promote to Production**.
Takes effect in seconds.

## Turning on Claude (optional, costs money)

Without a key, questions the answer set doesn't cover get the fixed unknown reply and
suggestions. A key lets Claude answer those instead. Do these first, in order:

1. **Rate limits.** Create a free Upstash Redis database, add `@upstash/ratelimit`, and
   limit `/api/chat` per IP plus a daily global cap before the model call (Stage 7, still
   open). Without this, anyone can spend your credit.
2. **A spend limit** in the Anthropic Console, under Billing.
3. **Test locally with the key** in `.env.local`:

   ```bash
   bun run eval --calibrate
   ```

   ```bash
   bun run eval --runs 3
   ```

   Calibration checks the judge. The eval run grades Claude's answers. Together they
   cost a few dollars, and each run prints its cost.
4. Add `ANTHROPIC_API_KEY` in Vercel for **Production** only, then redeploy.
