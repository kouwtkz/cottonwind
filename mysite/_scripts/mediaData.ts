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
copyStatic(mediaPath);
console.log(`Copy finished ${mediaPath} files.`)

import getParsedData from "../../script/getParsedData.ts"

const dataPath = `${mediaPath}/_data`;
const imageDataPath = `${dataPath}/gallery`;

const imageData = await getParsedData(imageDataPath);

const soundDataPath = `${dataPath}/sound`;
const soundData = await getParsedData(soundDataPath);
const musicData = soundData.music;
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

export default { path: mediaPath, sound: soundData, gallery: imageData }
