import lume from "lume/mod.ts";
import pug from "lume/plugins/pug.ts";
import sitemap from "lume/plugins/sitemap.ts";

const site = lume();

site.use(pug());
site.use(sitemap({query: "sitemap"}));

export default site;
