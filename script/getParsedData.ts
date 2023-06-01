import { parse } from 'npm:yaml'

function getParsedData(cur: string) {
    const dic: any = {};
    Array.from(Deno.readDirSync(cur)).forEach((item) => {
        const path = `${cur}/${item.name}`;
        if (item.isDirectory) {
            if (!/^[._]/.test(item.name)) {
                dic[item.name] = getParsedData(path);
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

export default getParsedData;