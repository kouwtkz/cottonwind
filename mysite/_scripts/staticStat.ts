// deno-lint-ignore-file
// staticファイルにあるmtimeを取得し、更新日時を返すMapを生成
export const staticPathes = ["./static", "./_static"];
function get_mtime(path: string | string[]) {
    const fileInfoList: Map<string, Deno.FileInfo> = new Map();
    let cur_static = '';
    const _get_stat = (cur: string) => {
        Array.from(Deno.readDirSync(cur_static + cur)).forEach((item: Deno.DirEntry) => {
            if (!/^[._]/.test(item.name)) {
                const itemPath = `${cur}/${item.name}`;
                if (item.isFile) {
                    fileInfoList.set(itemPath, Deno.statSync(`${cur_static}${cur}/${item.name}`));
                } else if (item.isDirectory) {
                    _get_stat(itemPath);
                }
            }
        });
    }
    if (Array.isArray(path)) {
        path.forEach(cur => {
            cur_static = cur;
            _get_stat('')
        })
    } else {
        cur_static = path;
        _get_stat('');
    }
    const mtimeList: Map<string, string> = new Map();
    fileInfoList.forEach((item, key) => mtimeList.set(key, ((<Date>item.mtime).getTime() / 1000 | 0).toString(32)))
    return { fileInfoList, mtimeList };
}

export const mtimeList = get_mtime(staticPathes).mtimeList;

export function link(page: any, path: string, add_mtime = true) {
    if (!/^\//.test(path)) path = (page.src.path.replace(/[^/]+$/, '') + path).replace(/\/\.\/|\/([^/]+)\/\.\.\//g, '/');
    const m = path.match(/\/([^/]+)\.([^.]+)$/);
    const ext = m ? m[2] : "";
    if (!page.data.site.isLocal && add_mtime) {
        const mtime = mtimeList.get(path);
        if (mtime) path = path + `?v=${mtime}`
    }
    switch (ext) {
        case "css":
            return `<link href="${path}" type="text/css" rel="stylesheet">`
        case "js":
            return `<script src="${path}"></script>`
    }
}
