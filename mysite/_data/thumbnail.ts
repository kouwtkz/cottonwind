const staticPath = "_static";
const sitePath = "_site";
const cachePath = ".cache";

import { Image, decode } from "https://deno.land/x/imagescript/mod.ts";

const mapList = new Map();
const imageRoot = "/images";
const imagePath = staticPath + imageRoot;
const thumbnailRoot = "/thumbnail";
const thumbnailImageRoot = imageRoot + thumbnailRoot;

const cacheJsonName = "cache.json";
const cacheJsonPath = cachePath + thumbnailRoot + "/" + cacheJsonName;

await Deno.mkdir(sitePath + thumbnailImageRoot, { recursive: true }).catch(() => { });
await Deno.mkdir(cachePath + thumbnailRoot, { recursive: true }).catch(() => { });

// const mapCache = new Map();
const mapCache = await Deno.readTextFile(cacheJsonPath)
    .then((e) => { return new Map(Object.entries(JSON.parse(e))); })
    .catch(() => { return new Map(); });
const mapOutCache = new Map();

console.log(`Making thumbnail..`);
function getFileList(cur: string) {
    const list = Array();
    const _getFileList = (cur: string) => {
        Array.from(Deno.readDirSync(cur)).forEach((item: any) => {
            const itemPath = `${cur}/${item.name}`;
            const imageName = itemPath.replace(imagePath, "");
            const imageUrl = imageRoot + imageName;
            const thumbnailUrl = thumbnailRoot + imageName;
            // const thumbnailUrl = thumbnailRoot + (item.isFile ? imageName.replace(/[^.]+$/, "jpg") : imageName);
            const outputUrl = imageRoot + thumbnailUrl;
            const outputPath = sitePath + outputUrl;
            const cacheOutPath = cachePath + thumbnailUrl;
            if (item.isDirectory) {
                try { Deno.mkdirSync(outputPath) } catch (e) { };
                try { Deno.mkdirSync(cacheOutPath) } catch (e) { };
                _getFileList(itemPath);
            } else {
                if (/(png|jpg|jpeg)$/i.test(imageName)) {
                    list.push({ itemPath, imageName, imageUrl, thumbnailUrl, outputUrl, outputPath, cacheOutPath });
                }
            }
        });
    }
    _getFileList(cur);
    return list;
}
const list = getFileList(staticPath + imageRoot);
const max = list.length;
let i = 0;
list.forEach(async (item) => {
    const fileStat = await Deno.stat(item.itemPath);
    const mtime = fileStat.mtime?.getTime();
    const cacheFile = mapCache.get(item.imageUrl);
    mapList.set(item.imageUrl, item.outputUrl);
    mapOutCache.set(item.imageUrl, { mtime: mtime, path: item.cacheOutPath });
    if (cacheFile && cacheFile.mtime === mtime) {
        mapCache.delete(item.imageUrl);
        await Deno.copyFile(item.cacheOutPath, item.outputPath);
    } else {
        const imgFile = await Deno.readFile(item.itemPath);
        const img = <Image>await decode(imgFile);
        const size = { width: 320, height: 320 };
        if (img.width > img.height) { size.width = Image.RESIZE_AUTO; }
        else { size.height = Image.RESIZE_AUTO; }
        // 縮小手法がニアレストしかないので追加まではこれで我慢
        const thumbimg = img.resize(size.width, size.height);
        if (thumbimg !== undefined) {
            if ((++i % 10) === 0 || i === max) {
                console.log(`Made thumbnail: (${i}/${max})`)
            }
            await Deno.writeFile(item.cacheOutPath, await (item.thumbnailUrl.match(/\.png$/) ? thumbimg.encode() : thumbimg.encodeJPEG()));
            await Deno.copyFile(item.cacheOutPath, item.outputPath);
        }
    }
})
Deno.writeTextFile(cacheJsonPath, JSON.stringify(Object.fromEntries(mapOutCache)));
mapCache.forEach((item) => { Deno.remove(item.path).catch(() => { }) });

export { mapList };