export const staticPath = "_static";
const sitePath = "_site";
await Deno.mkdir(sitePath).catch(() => {});
function copyStatic(cur: string) {
  // deno-lint-ignore no-explicit-any
  Array.from(Deno.readDirSync(cur)).forEach(async (item: any) => {
    const itemPath = `${cur}/${item.name}`;
    const outputPath = itemPath.replace(staticPath, sitePath);
    if (item.isFile) {
      await Deno.copyFile(itemPath, outputPath);
    } else if (item.isDirectory) {
      if (!/^[._]/.test(item.name)) {
        await Deno.mkdir(outputPath).catch(() => {});
        copyStatic(itemPath);
      }
    }
  });
}
copyStatic(staticPath);
console.log(`Copy finished ${staticPath} files.`);
