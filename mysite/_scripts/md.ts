const mapList = new Map();
const path = "_md";
function readMarkdown(_path = "") {
  Array.from(Deno.readDirSync(`${path}/${_path}`)).forEach(async (item: Deno.DirEntry) => {
    const itemName = item.name;
    const itemPath = `${_path}${item.name}`;
    if (item.isFile && itemName.match(/md$/)) {
      mapList.set(itemPath.replace(/\.[^.]+$/, ""), await Deno.readTextFile(`${path}/${itemPath}`));
    } else if (item.isDirectory) {
      readMarkdown(itemPath + "/");
    }
  });
}
readMarkdown();
export { mapList, path };
