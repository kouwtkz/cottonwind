import { parse, stringify } from 'npm:yaml'
import date_format from "./date_format.ts"

const imageGroups = [
    "art",
    "fanart",
    "given",
    "works"
];
const manageFilePath = "./updateGallery.json";
let manageData = <any>null;
try {
    manageData = JSON.parse(Deno.readTextFileSync(manageFilePath));
} catch (e) {
    manageData = new Object();
}
let manageFileUpdated = false;
const mysiteDir = "../mysite";
const mediaDir = `${mysiteDir}/_media`;
const imageDir = `/images`;
const imageYamlDir = `${mediaDir}/_data/gallery`;
await Deno.mkdir(imageYamlDir).catch(() => { });
const imageYamlData = new Map();
const imageYamlArchiveName = `.archive`;
const imageYamlArchiveDir = `${imageYamlDir}/${imageYamlArchiveName}`;
await Deno.mkdir(imageYamlArchiveDir).catch(() => { });
const imageYamlArchiveData = new Map();
imageGroups.forEach((group) => {
    let path = '';
    let readStr = '';
    let data = null;
    let mtime = 0;
    try {
        path = `${imageYamlDir}/${group}.yaml`;
        readStr = Deno.readTextFileSync(path);
        data = parse(readStr);
        mtime = Number(Deno.statSync(path).mtime?.getTime());
    } catch (e) {
        data = { title: group, path: `${imageDir}/${group}` };
    }
    if (!data.list) data.list = [];
    imageYamlData.set(group, { path, data, mtime });
    if (!manageData[group]) manageData[group] = {};
    try {
        path = `${imageYamlArchiveDir}/${group}.yaml`;
        readStr = Deno.readTextFileSync(path);
        data = parse(readStr);
        mtime = Number(Deno.statSync(path).mtime?.getTime());
    } catch (e) {
        data = { title: `${group}'s archive` };
        mtime = 0;
    }
    if (!manageData[group].archive) manageData[group].archive = {};
    if (!data.list) data.list = [];
    imageYamlArchiveData.set(group, { path, data, mtime });
});
// console.log(imageYamlArchiveData);

function outReadDirList(cur: string) {
    let list: any = [];
    try {
        const staticCur = `${mediaDir}/${cur}`
        Array.from(Deno.readDirSync(staticCur)).forEach((item: any) => {
            const curPath = `${cur}/${item.name}`;
            const staticCurPath = `${mediaDir}/${curPath}`
            if (item.isFile) {
                const stat = Deno.statSync(staticCurPath);
                list.push({ ...item, ...{ dir: cur, mtime: new Date(<string>(stat.mtime || '')) } })
            } else if (item.isDirectory) {
                if (!/^[._]/.test(item.name)) {
                    list = [...list, ...outReadDirList(curPath)];
                }
            }
        })
    } catch (e) { }
    return list;
}
imageGroups.forEach((group) => {
    const yamlData = imageYamlData.get(group);
    const data = yamlData.data;
    const preListLength = data.list.length;
    const newList: any = [];
    const archiveYamlData = imageYamlArchiveData.get(group);
    const archiveData = archiveYamlData.data;
    const preArchiveListLength = archiveData.list.length;
    const dirPath = data.path || `${imageDir}/${group}`;
    let updated = (yamlData.mtime || 0) !== manageData[group].mtime;
    let updatedArchive = (archiveYamlData.mtime || 0) !== manageData[group].archive.mtime;
    let readDirList = null;
    readDirList = outReadDirList(dirPath);
    readDirList.forEach((item) => {
        const listFindIndex = data.list.findIndex(e => e.src == item.name);
        const archiveListFindIndex = archiveData.list.findIndex(e => e.src == item.name);
        const dir = item.dir.replace(dirPath, '');
        if (listFindIndex < 0 && archiveListFindIndex < 0) {
            const insertData = {
                src: item.name,
                time: date_format('Y-m-d H:i:s', item.mtime),
                dir,
                mtime: item.mtime,
                title: item.name.replace(/.[^.]+$/, ""),
                description: '',
                tags: [group],
            };
            newList.push(insertData);
            updated = true;
        } else {
            if (listFindIndex >= 0) {
                const listFind = data.list.splice(listFindIndex, 1)[0];
                if (!updated) updated = ((listFind.dir || '') !== dir);
                newList.push({ ...listFind, ...{ dir } });
            } else {
                const listFind = archiveData.list.splice(archiveListFindIndex, 1)[0];
                newList.push({ ...listFind, ...{ dir } });
                updated = true;
                updatedArchive = true;
            }
        }
    });
    if (!updated && (data.list.length > 0)) updated = true;
    archiveData.list = [ ...archiveData.list, ...data.list ];
    if (!updatedArchive && (archiveData.list.length !== preArchiveListLength)) updatedArchive = true;
    if (updated) {
        data.list = newList
            .sort((a, b) => (a.time < b.time ? 1 : -1))
            .map((item) => { delete item.mtime; delete item.exist; if (item.dir === "") delete item.dir; return item; });
        Deno.writeTextFile(yamlData.path, stringify(data));
        manageData[group].mtime = Number(Deno.statSync(yamlData.path).mtime?.getTime());
    }
    if (updatedArchive) {
        archiveData.list = archiveData.list
            .sort((a, b) => (a.time < b.time ? 1 : -1))
            .map((item) => { delete item.mtime; delete item.exist; if (item.dir === "") delete item.dir; return item; });
        Deno.writeTextFile(archiveYamlData.path, stringify(archiveData));
        manageData[group].archive.mtime = Number(Deno.statSync(archiveYamlData.path).mtime?.getTime());
    }
    if (updated || updatedArchive) {
        manageFileUpdated = true;
        console.log(`${group} is updated!`)
    }
});
if (manageFileUpdated) {
    Deno.writeTextFileSync(manageFilePath, JSON.stringify(manageData));
} else {
    console.log('Yamlファイルの更新はありませんでした。')
}
