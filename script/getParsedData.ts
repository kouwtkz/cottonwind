import { parse } from 'npm:yaml'

async function getParsedData(path: string) {
    const dic: any = {};
    const dicUpdate = (name, data) => {
        if (data !== null) {
            if (dic[name]) {
                dic[name] = { ...dic[name], ...data };
            } else {
                dic[name] = data;
            }
        }
    }
    const runList: Promise<any>[] = [];
    Array.from(Deno.readDirSync(path)).forEach((item) => {
        const filePath = `${path}/${item.name}`;
        let baseName = '';
        if (item.isDirectory) {
            if (!/^[._]/.test(item.name)) {
                baseName = item.name;
                runList.push(getParsedData(filePath).then((data) => {
                    dicUpdate(baseName, data);
                }));
            }
        } else {
            const m = item.name.match(/^(.+)\.([^.]+)$/);
            if (m) {
                baseName = m[1];
                const ext = m[2];
                switch (ext) {
                    case "json":
                        runList.push(Deno.readTextFile(filePath).then((str) => {
                            dicUpdate(baseName, JSON.parse(str));
                        }));
                        break;
                    case "yaml":
                        runList.push(Deno.readTextFile(filePath).then((str) => {
                            dicUpdate(baseName, parse(str));
                        }));
                        break;
                    case "ts":
                    case "js":
                        runList.push(import(`file:///${Deno.cwd()}/${filePath}`).then((data) => {
                            dicUpdate(baseName, { ...data });
                        }));
                        break;
                }
            }
        }
    })
    await Promise.all(runList);
    return dic;
}

export default getParsedData;