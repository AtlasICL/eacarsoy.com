oxfmt_file_types := "'**/*.{js,mjs,cjs,json,jsonc,yaml,yml,md,css,html}'"

default:
    @just --list

# Fix linting and formatting
fix:
    -npx oxlint --fix --no-error-on-unmatched-pattern
    npx oxfmt --no-error-on-unmatched-pattern {{oxfmt_file_types}}
    npx oxlint --deny-warnings --no-error-on-unmatched-pattern

# Check linting and formatting (read-only)
check:
    npx oxlint --deny-warnings --no-error-on-unmatched-pattern
    npx oxfmt --check --no-error-on-unmatched-pattern {{oxfmt_file_types}}

# Serve the site locally the way Cloudflare will
dev:
    npx wrangler dev

# Deploy to Cloudflare
deploy:
    npx wrangler deploy
