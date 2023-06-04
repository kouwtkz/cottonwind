// staticファイルにあるmtimeを取得し、更新日時を返すMapを生成
const staticPath = ["./static", "./_static"];
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
const $ = get_mtime(staticPath);
export default $.mtimeList;