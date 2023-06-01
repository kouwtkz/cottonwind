export const mediaPath = "_media";
const sitePath = "_site";
await Deno.mkdir(sitePath).catch(()=>{});
function copyStatic(cur: string) {
    // deno-lint-ignore no-explicit-any
    Array.from(Deno.readDirSync(cur)).forEach(async (item: any) => {
        const itemPath = `${cur}/${item.name}`;
        const outputPath = itemPath.replace(mediaPath, sitePath);
        if (item.isFile) {
            await Deno.copyFile(itemPath, outputPath);
        } else if (item.isDirectory) {
            if (!/^[._]/.test(item.name)) {
                await Deno.mkdir(outputPath).catch(()=>{});
                copyStatic(itemPath);
            }
        }
    })
}
await copyStatic(mediaPath);
console.log(`Copy finished ${mediaPath} files.`)

import { parse } from 'npm:yaml'
function getData(cur: string) {
    const dic: any = {};
    Array.from(Deno.readDirSync(cur)).forEach((item) => {
        const path = `${cur}/${item.name}`;
        if (item.isDirectory) {
            if (!/^[._]/.test(item.name)) {
                dic[item.name] = getData(path);
            }
        } else {
            const m = item.name.match(/^(.+)\.([^.]+)$/);
            if (m) {
                const baseName = m[1];
                const ext = m[2];
                const readStr = Deno.readTextFileSync(path);
                switch (ext) {
                    case "json":
                        dic[baseName] = JSON.parse(readStr);
                        break;
                    case "yaml":
                        dic[baseName] = parse(readStr);
                        break;
                }
            }
        }
    })
    return dic;
}

const dataPath = `${mediaPath}/_data`;"./_data/musicData/sound/.music.yaml";
const imageDataPath = `${dataPath}/gallery`;

let imageData = getData(imageDataPath);
// console.log(imageData);

const soundDataPath = `${dataPath}/sound`;
let soundData = getData(soundDataPath);
let musicData = soundData.music;
let setupSound = '';
if (musicData.list) {
    const setupSearch = musicData.list.filter((e) => e.setup);
    if (setupSearch.length > 0) {
        setupSound = setupSearch[0].src;
    } else if (musicData.list.length > 0) {
        setupSound = musicData.list[0].src;
    }
}
musicData.setupSound = setupSound;

export default { sound: soundData, gallery: imageData }
