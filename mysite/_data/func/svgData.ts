const mapList = new Map();
const path = "_includes/svg";
function readSvg(path: string) {
    // deno-lint-ignore no-explicit-any
    Array.from(Deno.readDirSync(path)).forEach(async (item: any) => {
        const itemName = item.name;
        const itemPath = `${path}/${item.name}`;
        if (item.isFile && itemName.match(/svg$/)) {
            mapList.set(itemPath, await Deno.readTextFile(itemPath));
        } else if (item.isDirectory) {
            readSvg(itemPath);
        }
    })
}
readSvg(path);
export { mapList, path };