cd ../script
deno run --allow-env --allow-read --allow-write ./updateGalleryYaml.ts
cd ../mysite
deno task lume -s
pause