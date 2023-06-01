import { parse } from 'npm:yaml'

async function getParsedData(path: string) {
    const dic: any = {};
    const dicUpdate = (name: string, data: any) => {
        if (data !== null) {
            if (data.default) {
                const _default = data.default;
                delete data.default;
                data = { ...data, ..._default };
            }
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
        if (!/^[._]/.test(item.name)) {
            if (item.isDirectory) {
                baseName = item.name;
                runList.push(getParsedData(filePath).then((data) => {
                    dicUpdate(baseName, data);
                }));
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
                        case "yml":
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
        }
    });
    await Promise.all(runList);
    return dic;
}

export default getParsedData;