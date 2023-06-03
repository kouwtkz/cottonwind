import { MakeResize, Option, ResizeNameOption } from "../../../script/MakeResize.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";
const sizeList = [48, 180, 192, 256, 512];
const path = "/icons/icon.png";
const makeIcon = new MakeResize(
    <Option>{
        root: "./",
        resizedDirName: "resizedIcon",
        imageDir: "icons",
        imageMatch: "/icon.png",
        resizeNameAll: true,
        resizeNameOption: ResizeNameOption.AfterFile,
        resizedDirSame: true,
        sizes: sizeList,
        logRunText: "Making icon.."
    },
);
await makeIcon.run();
export default {
    path, 
    list: makeIcon.list[0].output.map(item => {
        return {
            sizes: `${item.size}x${item.size}`,
            src: item.outputUrl,
            type: mime.getType(item.outputUrl),
        };
    })
}
