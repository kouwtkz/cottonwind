// 最初のページだけ実行する関数
// deno-lint-ignore no-explicit-any
export default (page: any) => {
    const siteData = page.data.site;
    const manifest = {
        background_color: siteData.manifest.background_color,
        display: siteData.manifest.display,
        icons: siteData.icon.list,
        name: `${siteData.title} - ${siteData.description}`,
        short_name: siteData.title,
        start_url: "/"
    }
    const _sitePath = "./_site/";
    const manifest_path = _sitePath + siteData.manifest.path;
    Deno.writeTextFileSync(manifest_path, JSON.stringify(manifest))
    return;
}