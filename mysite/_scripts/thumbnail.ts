import { MakeResize, Option } from "../../script/MakeResize.ts";
const makeThumbnail = new MakeResize(
  <Option>{ root: "./", resizedDirName: "thumbnail", sizes: [320], logRunText: "Making thumbnail.." },
);
const mapList = await makeThumbnail.run();
export { mapList };
