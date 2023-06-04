export const mediaPath = "_media";
const sitePath = "_site";
Deno.mkdir(sitePath).catch(() => {});
function copyStatic(cur: string) {
  Array.from(Deno.readDirSync(cur)).forEach(async (item: Deno.DirEntry) => {
    const itemPath = `${cur}/${item.name}`;
    const outputPath = itemPath.replace(mediaPath, sitePath);
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
copyStatic(mediaPath);
console.log(`Copy finished ${mediaPath} files.`);

import getParsedData from "../../script/getParsedData.ts";

const dataPath = `${mediaPath}/_data`;

const imageDataPath = `${dataPath}/gallery`;
const imageData = await getParsedData(imageDataPath);

interface listItem{
  src: string
  setup: boolean
}
const soundDataPath = `${dataPath}/sound`;
const soundData = await getParsedData(soundDataPath);
const musicData = soundData.music;
let setupSound = "";
if (musicData.list) {
  const setupSearch = musicData.list.filter((e: listItem) => e.setup);
  if (setupSearch.length > 0) {
    setupSound = setupSearch[0].src;
  } else if (musicData.list.length > 0) {
    setupSound = musicData.list[0].src;
  }
}
musicData.setupSound = setupSound;

export default { path: mediaPath, sound: soundData, gallery: imageData };
