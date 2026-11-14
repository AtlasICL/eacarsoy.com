# [Website](https://eacarsoy.com)

## Deployment

The site is a static Cloudflare Worker that serves everything in `web/`.

The deploy job needs two GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`: an account API token with **Workers: Edit**
  permission.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID.

Because the token is intentionally narrow, renaming the worker or changing
`routes` in `wrangler.jsonc` requires a deploy by hand with `wrangler deploy`.
After a manual deploy, CI will start working again.

## Domains

`https://eacarsoy.com` is the canonical URL. The Worker is attached to it as a
custom domain through `routes` in `wrangler.jsonc`.

The following domains all permanently redirect (301) to the canonical URL,
keeping the path and query string:

- `www.eacarsoy.com`
- `acarsoy.co.uk`
- `www.acarsoy.co.uk`
- `emreacarsoy.com`
- `www.emreacarsoy.com`

Redirects are configured in the Cloudflare dashboard under Rules → Redirect
Rules, separately for each domain.

1. Under DNS → Records, create proxied (orange-cloud) `A` records for `@` and
   `www`, both pointing to 192.0.2.1.
2. Under Rules → Redirect Rules, create a rule matching All incoming requests,
   placed First.
3. Set the redirect type to Dynamic, with the following expression:
   `concat("https://eacarsoy.com", http.request.uri.path)`
4. Select 301 - Permanent Redirect, enable Preserve query string, and deploy.

All relevant DNS records must be Proxied for Cloudflare's redirect rules to
execute. Otherwise, requests may fail or bypass the redirects.

To check the redirects are working correctly, run
`./scripts/check_redirects.sh`.
