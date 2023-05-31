import { parse } from 'npm:yaml'
const path = "./_data/mediaData/sound/.music.yaml";
const readStr = Deno.readTextFileSync(path);
const data = parse(readStr);
let setupSound = '';
if (data.list) {
    const setupSearch = data.list.filter((e) => e.setup);
    if (setupSearch.length > 0) {
        setupSound = setupSearch[0].src;
    } else if (data.list.length > 0) {
        setupSound = data.list[0].src;
    }
}
export default { ...data, ...{ setupSound } };