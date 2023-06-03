// deno-lint-ignore-file
import { parse } from "npm:yaml";

async function getParsedData(path: string) {
  const dic: any = {};
  const dicUpdate = (name: string, data: any, merge_default = false) => {
    if (data !== null) {
      if (merge_default && data.default) {
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
  };
  const runList: Promise<any>[] = [];
  const getFileObject = (filePath: string) => {
    const m = filePath.match(/\/([^/]+)\.([^.]+)$/);
    if (m) {
      const baseName = m[1];
      const ext = m[2];
      switch (ext) {
        case "json":
          runList.push(
            Deno.readTextFile(filePath).then((str) => {
              dicUpdate(baseName, JSON.parse(str));
            }),
          );
          break;
        case "yaml":
        case "yml":
          runList.push(
            Deno.readTextFile(filePath).then((str) => {
              dicUpdate(baseName, parse(str));
            }),
          );
          break;
        case "ts":
        case "js":
          runList.push(
            import(`file:///${Deno.cwd()}/${filePath}`).then((data) => {
              dicUpdate(baseName, { ...data }, true);
            }),
          );
          break;
      }
    }
  }
  const firstStat = Deno.statSync(path);
  if (firstStat) {
    if (firstStat.isDirectory) {
      Array.from(Deno.readDirSync(path)).forEach((item: Deno.DirEntry) => {
        const filePath = `${path}/${item.name}`;
        if (!/^[._]/.test(item.name)) {
          if (item.isDirectory) {
            const baseName = item.name;
            runList.push(
              getParsedData(filePath).then((data) => {
                dicUpdate(baseName, data);
              }),
            );
          } else {
            getFileObject(filePath);
          }
        }
      });
    } else if (firstStat.isFile) {
      getFileObject(path);
    }
  }
  await Promise.all(runList);
  return dic;
}

export default getParsedData;
