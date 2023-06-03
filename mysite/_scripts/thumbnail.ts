import { MakeResize, Option } from "../../script/MakeResize.ts";
const makeThumbnail = new MakeResize(
  <Option>{ root: "./", resizedDirName: "thumbnail", sizes: [320], logRunText: "Making thumbnail.." },
);
const list = await makeThumbnail.run();
const mapList = new Map();
list.forEach(item => {
  mapList.set(item.imageUrl, item.output[0].outputUrl)
});
export { mapList };
