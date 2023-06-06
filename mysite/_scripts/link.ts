import { Page } from "lume/core.ts";

export function getFullURL(url: string, page: Page) {
    if (!/^http:\/\//.test(url)) {
        url = (page.data.site.baseURL + (/^\//.test(url) ? url : (page.src.path, page.src.slug !== "index" && page.src.path.endsWith(page.src.slug) ? `${page.src.path}/` : page.src.path.replace(/[^/]+$/, '')) + url));
        url = url.replace(/\/\.\/|\/([^/]+)\/\.\.\//g, '/');
    }
    return url;
}
// deno-lint-ignore no-explicit-any
function _objgt(o: any, s: string) {
    s.split(/[.\[]/).forEach(
        (item) => {
            const m = item.match(/^(\d+)\]$/);
            if (typeof (o) === 'object') o = o[m ? Number(m[1]) : item];
        });
    return o;
}
export function customFilter(md: string, page: Page) {
    const { autoLink = false, variable = false } = page.data;
    if (autoLink) md = md.replace(/(<[^a]\S[^>]*>[^<]*)(http\w+[^\s<]+)/g, `$1<a href="$2" target="_blank">$2</a>`);
    if (variable) md = md.replace(/(\(\s*\$.)([\w.\[\]]+)(\s*\))/g, (m, m1, m2) => { return _objgt(page.data, m2) })
    return md;
}