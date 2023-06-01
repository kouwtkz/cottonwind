const mediaPath = "_media";
const sitePath = "_site";
const cachePath = ".cache";

const thumbSize = 320;

import jimp from "npm:jimp";

const mapList = new Map();
const imageRoot = "/images";
const imagePath = mediaPath + imageRoot;
const thumbnailRoot = "/thumbnail";
const thumbnailImageRoot = imageRoot + thumbnailRoot;
const lumeRoot = Deno.cwd();

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
    const list: any = [];
    const _getFileList = (cur: string) => {
        Array.from(Deno.readDirSync(cur)).forEach((item: any) => {
            const itemPath = `${cur}/${item.name}`;
            const itemFullPath = `${lumeRoot}/${itemPath}`;
            const imageName = itemPath.replace(imagePath, "");
            const imageUrl = imageRoot + imageName;
            const thumbnailUrl = thumbnailRoot + imageName;
            // const thumbnailUrl = thumbnailRoot + (item.isFile ? imageName.replace(/[^.]+$/, "jpg") : imageName);
            const outputUrl = imageRoot + thumbnailUrl;
            const outputPath = sitePath + outputUrl;
            const cacheOutPath = cachePath + thumbnailUrl;
            if (item.isDirectory) {
                if (!/^[._]/.test(item.name)) {
                    try { Deno.mkdirSync(outputPath) } catch (e) { };
                    try { Deno.mkdirSync(cacheOutPath) } catch (e) { };
                    _getFileList(itemPath);
                }
            } else {
                if (/(png|jpg|jpeg)$/i.test(imageName)) {
                    list.push({ itemPath, itemFullPath, imageName, imageUrl, thumbnailUrl, outputUrl, outputPath, cacheOutPath });
                }
            }
        });
    }
    _getFileList(cur);
    return list;
}
const list = getFileList(mediaPath + imageRoot);
// const max = list.length;
// let i = 0;
list.forEach(async (item) => {
    const fileStat = Deno.statSync(item.itemPath);
    const mtime = fileStat.mtime?.getTime();
    const cacheFile = mapCache.get(item.imageUrl);
    mapList.set(item.imageUrl, item.outputUrl);
    mapOutCache.set(item.imageUrl, { mtime: mtime, path: item.cacheOutPath });
    if (cacheFile && cacheFile.mtime === mtime) {
        mapCache.delete(item.imageUrl);
        await Deno.copyFile(item.cacheOutPath, item.outputPath);
    } else {
        await jimp.read(item.itemFullPath).then(async (img) => {
            const w = img.bitmap.width;
            const h = img.bitmap.height;
            if (w === h) {
                img.contain(thumbSize, thumbSize);
            } else if (w > h) {
                img.contain(thumbSize * w / h, thumbSize);
            } else {
                img.contain(thumbSize, thumbSize * h / w);
            }
            const output = (`${lumeRoot}/${item.cacheOutPath}`);
            await img.writeAsync(output).then(
                async () => {
                    await Deno.copyFile(item.cacheOutPath, item.outputPath);
                }
            );
        });
    }
})
Deno.writeTextFile(cacheJsonPath, JSON.stringify(Object.fromEntries(mapOutCache)));
mapCache.forEach((item) => { Deno.remove(item.path).catch(() => { }) });

// 余分な空きフォルダの削除
function removeBlankDir(cur: string) {
    const list = Array.from(Deno.readDirSync(cur));
    const l = list.length;
    let i = 0;
    if (l > 0) {
        list.forEach((item: any) => {
            const itemPath = `${cur}/${item.name}`;
            if (item.isDirectory) {
                i += removeBlankDir(itemPath) ? 1 : 0;
            }
        })
    } else {
        try { Deno.removeSync(cur) } catch (e) { };
        return true;
    }
    if (i === l) try { Deno.removeSync(cur); return true; } catch (e) { };
    return false;
}
removeBlankDir(cachePath + thumbnailRoot);

export { mapList };