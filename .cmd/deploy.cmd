cd ../script
deno run --allow-env --allow-read --allow-write ./updateGalleryYaml.ts
cd ../mysite
deno task lume --location https://cottonwind.com
wrangler pages deploy _site --project-name cottonwind --commit-dirty true
pause