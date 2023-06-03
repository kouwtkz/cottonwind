import { MakeResize, Option, ResizeNameOption } from "../../../script/MakeResize.ts";
const sizeList = [48, 180, 192, 256, 512];
export const path = "/icons/icon.png";
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
export const list = makeIcon.run();
