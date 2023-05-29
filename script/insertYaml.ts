import { ArrayObject } from "https://deno.land/std@0.177.1/encoding/_yaml/utils.ts";
import { parse, stringify } from 'npm:yaml'
import { date_format } from "./date_format.ts"

const imageGroups = ["art", "fanart", "given"];
const mysiteDir = "../mysite";
const imageDir = `${mysiteDir}/images`;
const imageYamlDir = `${mysiteDir}/_data/mediaData/image`;
const imageYamlData = new Map();
imageGroups.forEach((group) => {
    const path = `${imageYamlDir}/${group}.yaml`;
    const readStr = Deno.readTextFileSync(`${imageYamlDir}/${group}.yaml`);
    const data = readStr ? parse(readStr) : {};
    imageYamlData.set(group, { path, data });
});
imageGroups.forEach((group) => {
    const yamlData = imageYamlData.get(group);
    const data = yamlData.data;
    const dirPath = data.path ? `${mysiteDir}/_static${data.path}` : `${imageDir}/${group}`;
    const dataList = (<ArrayObject>data.list) || [];
    let update = true;
    const readDirList = Array.from(Deno.readDirSync(dirPath))
        .map((item) => {
            const stat = Deno.statSync(`${dirPath}/${item.name}`);
            return { ...item, ...{ mtime: new Date(<string>(stat.mtime || '')) } }
        });
    readDirList.forEach((item) => {
        if (item.isFile) {
            const listFindIndex = dataList.findIndex(e => e.src == item.name);
            if (listFindIndex < 0) {
                const insertData = {
                    src: item.name,
                    time: date_format('Y-m-d H:i:s', item.mtime),
                    mtime: item.mtime,
                    title: item.name.replace(/.[^.]+$/, ""),
                    description: '',
                    tags: [group]
                };
                dataList.push(insertData);
                update = true;
            } else {
                const listFind = dataList[listFindIndex];
                const mtime = listFind.time ? new Date(listFind.time) : item.mtime;
                dataList[listFindIndex] = { ...listFind, ...{ mtime } };
            }
        }
    });
    if (update) {
        data.list = dataList
            .sort((a, b) => (a.mtime < b.mtime ? 1 : -1))
            .map((item) => { delete item.mtime; return item; });
        console.log(`${group} is updated!`)
        Deno.writeTextFile(yamlData.path, stringify(data));
    }
});
