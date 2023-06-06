export function getFullURL(url: string, page: any) {
    if (!/^http:\/\//.test(url)) {
        url = (page.data.site.baseURL + (/^\//.test(url) ? url : (page.src.path, page.src.slug !== "index" && page.src.path.endsWith(page.src.slug) ? `${page.src.path}/` : page.src.path.replace(/[^/]+$/, '')) + url));
        url = url.replace(/\/\.\/|\/([^/]+)\/\.\.\//g, '/');
    }
    return url;
}
