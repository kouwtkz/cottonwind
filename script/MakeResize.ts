// deno-lint-ignore-file
import jimp from "npm:jimp";

export const ResizeNameOption = {
  AfterFile: 0,
  BeforeFile: 1,
  AfterResizedDir: 2,
  AfterImageDir: 3
} as const;
type ResizeNameOption = typeof ResizeNameOption[keyof typeof ResizeNameOption];
export const ResizeMethod = {
  Outside: 0,
  Cover: 1,
  Contain: 2,
  ScaleToFit: 3
} as const;
type ResizeMethod = typeof ResizeMethod[keyof typeof ResizeMethod];

export interface Option {
  cwd: string
  root: string
  siteDir: string
  mediaDir: string
  imageDir: string
  imageMatch: string | RegExp
  resizedDirName: string
  resizedDirSame: boolean
  cacheDir: string
  cacheJsonName: string
  sizes: number[]
  logPer: boolean
  logRunText: string
  resizeNameOption: ResizeNameOption
  resizeNameAll: boolean
  resizeMethod: ResizeMethod
}

export const defaultOption: Option = {
  cwd: `${Deno.cwd()}`.replace(/\\/g, '/'),
  root: "./",
  siteDir: "_site",
  mediaDir: "_media",
  imageDir: "images",
  imageMatch: "",
  resizedDirName: "resized",
  resizedDirSame: false,
  cacheDir: ".cache",
  cacheJsonName: "cache.json",
  sizes: [128],
  logPer: false,
  logRunText: "Making Resize..",
  resizeNameOption: ResizeNameOption.AfterFile,
  resizeNameAll: false,
  resizeMethod: ResizeMethod.Outside
}

interface ResizedFileKeys {
  imageUrlKey: string;
  resizedUrl: string
  outputUrl: string
  outputPath: string
  cacheOutPath: string
  cacheOutFullPath: string
  size: number
}

interface ListFileResult {
  itemPath: string
  itemFullPath: string
  imageName: string
  imageUrl: string
  output: ResizedFileKeys[]
}
interface JsonCacheKeys {
  path: string
  mtime: number
  size: number
}

const recursive = { recursive: true };

async function readJSONMap(path: string): Promise<Map<string, any>> {
  try {
    const e = await Deno.readTextFile(path);
    return new Map(Object.entries(JSON.parse(e)));
  } catch {
    return new Map();
  }
}
// 余分な空きフォルダの削除
function removeBlankDir(cur: string) {
  const list = Array.from(Deno.readDirSync(cur));
  const l = list.length;
  let i = 0;
  if (l > 0) {
    list.forEach((item: any) => {
      const itemPath = `${cur}/${item.name}`;
      if (item.isDirectory) {
        i += removeBlankDir(itemPath) ? 1 : 0;
      }
    });
  } else {
    try {
      Deno.removeSync(cur);
    } catch { }
    return true;
  }
  if (i === l) {
    try {
      Deno.removeSync(cur);
      return true;
    } catch { }
  }
  return false;
}

export class MakeResize {
  option: Option
  list: ListFileResult[]
  resizedList: Map<string, string>
  private mapCache: Map<string, JsonCacheKeys>
  private mapOutCache: Map<string, JsonCacheKeys>
  constructor(o: Option | undefined = defaultOption) {
    this.option = { ...defaultOption, ...o };
    this.resizedList = new Map();
    this.mapCache = new Map();
    this.mapOutCache = new Map();
    this.list = [];
  }
  private getCacheJsonPath = () => `${this.option.root}${this.option.cacheDir}/${this.option.resizedDirName}/${this.option.cacheJsonName}`;
  async run() {
    if (this.option.logRunText) console.log(this.option.logRunText);
    Deno.mkdirSync(`${this.option.root}${this.option.cacheDir}/${this.option.resizedDirName}`, recursive)
    this.list = this.getFileList(`${this.option.root}${this.option.mediaDir}/${this.option.imageDir}`);
    this.resizedList.clear();
    this.mapCache = await readJSONMap(this.getCacheJsonPath());
    this.mapOutCache.clear();
    this.doResize();
    Deno.writeTextFile(
      this.getCacheJsonPath(),
      JSON.stringify(Object.fromEntries(this.mapOutCache)),
    );
    this.mapCache.forEach((item) => {
      Deno.remove(item.path).catch(() => { });
    });
    removeBlankDir(`${this.option.root}${this.option.cacheDir}/${this.option.resizedDirName}`);
    return this.list;
  }
  // 指定したパスの画像リストを取得する
  getFileList(cur: string) {
    const list: ListFileResult[] = [];
    const mediaImageDir = `${this.option.root}${this.option.mediaDir}/${this.option.imageDir}`;
    const cwdRoot = `${this.option.cwd}/${this.option.root}`.replace(/\/\.\/|\/([^/]+)\/\.\.\//g, '/');
    const _getOneFileList = (itemPath: string) => {
      const itemFullPath = `${this.option.cwd}/${itemPath}`.replace(/\/\.\/|\/([^/]+)\/\.\.\//g, '/');
      const imageName = itemPath.replace(mediaImageDir, "");
      const imageUrl = `/${this.option.imageDir}${imageName}`;
      const imageNameParse = imageName.match(/^(.*)\/([^/]+)\.([^.]+)$/);
      if (/(png|jpg|jpeg)$/i.test(imageName) && imageName.match(this.option.imageMatch)) {
        const v: ListFileResult = {
          itemPath,
          itemFullPath,
          imageName,
          imageUrl,
          output: this.option.sizes.map(size => {
            const resizeSizeName = `x${size}`;
            const resizable = this.option.resizeNameAll || this.option.sizes.length > 1;
            const imageUrlKey = this.getImageUrlKey(imageUrl, size);
            this.option.resizeNameOption === ResizeNameOption.AfterFile
            const remakeImageName = (() => {
              if (resizable && imageNameParse !== null) {
                switch (this.option.resizeNameOption) {
                  case ResizeNameOption.AfterFile:
                    return `${imageNameParse[1]}/${imageNameParse[2]}_${resizeSizeName}.${imageNameParse[3]}`;
                  case ResizeNameOption.BeforeFile:
                    return `${imageNameParse[1]}/${resizeSizeName}/${imageNameParse[2]}.${imageNameParse[3]}`;
                  default:
                    return imageName;
                }
              } else {
                return imageName;
              }
            })();
            const imageDirAfter = (resizable && this.option.resizeNameOption === ResizeNameOption.AfterImageDir) ? `/${resizeSizeName}` : "";
            const resizedDirAfter = (resizable && this.option.resizeNameOption === ResizeNameOption.AfterResizedDir) ? `/${resizeSizeName}` : "";
            const resizedUrl = (this.option.resizedDirSame ? "" : `/${this.option.resizedDirName}`) + resizedDirAfter + remakeImageName;
            const cacheResizedUrl = `/${this.option.resizedDirName}` + resizedDirAfter + remakeImageName
            const outputUrl = `/${this.option.imageDir + imageDirAfter}${resizedUrl}`;
            const outputPath = `${this.option.root}${this.option.siteDir}${outputUrl}`;
            const cacheOutPath = `${this.option.root}${this.option.cacheDir}${cacheResizedUrl}`;
            const cacheOutFullPath = `${cwdRoot}${this.option.cacheDir}${cacheResizedUrl}`;
            Deno.mkdirSync(outputPath.replace(/[^/]+$/, ''), recursive);
            Deno.mkdirSync(cacheOutPath.replace(/[^/]+$/, ''), recursive);
            return <ResizedFileKeys>{ imageUrlKey, resizedUrl, outputUrl, outputPath, cacheOutPath, cacheOutFullPath, size };
          })
        }
        list.push(v);
      }
    };
    const _getFileList = (cur: string) => {
      Array.from(Deno.readDirSync(cur)).forEach((item: Deno.DirEntry) => {
        const itemPath = `${cur}/${item.name}`;
        if (!/^[._]/.test(item.name)) {
          if (item.isDirectory) {
            _getFileList(itemPath);
          } else {
            _getOneFileList(itemPath);
          }
        }
      });
    };
    _getFileList(cur);
    return list;
  }
  getImageUrlKey(imageUrl: string, size: number) {
    return `${imageUrl},x${size},${Object.keys(ResizeMethod)[this.option.resizeMethod]}`;
  }
  private doResize(list: ListFileResult[] = this.list) {
    const max = list.length * this.option.sizes.length;
    if (this.option.logPer) console.log(`0/${max}`);
    const _doResize = (item: ListFileResult, index: number) => {
      const count = index + 1;
      const fileStat = Deno.statSync(item.itemPath);
      const mtime = <number>fileStat.mtime?.getTime();
      item.output.forEach(async (output) => {
        const size = output.size;
        this.resizedList.set(output.imageUrlKey, output.outputUrl);
        this.mapOutCache.set(output.imageUrlKey, { mtime: mtime, path: output.cacheOutPath, size });
        const cacheFile = this.mapCache.get(output.imageUrlKey);
        if (cacheFile && cacheFile.mtime === mtime) {
          if (cacheFile.path !== output.cacheOutPath) {
            try { Deno.renameSync(cacheFile.path, output.cacheOutPath) } catch { }
          }
          this.mapCache.delete(output.imageUrlKey);
          await Deno.copyFile(output.cacheOutPath, output.outputPath)
            .then(() => {
              if (this.option.logPer && (count % 50 === 0 || count === max)) console.log(`${count}/${max}`);
            })
            .catch(() => {
              this.mapCache.delete(output.imageUrlKey);
              _doResize(item, index);
            })
        } else {
          await jimp.read(item.itemFullPath).then(async (img) => {
            const w = img.bitmap.width;
            const h = img.bitmap.height;
            switch (this.option.resizeMethod) {
              case ResizeMethod.Outside:
                if (w === h) {
                  img.contain(size, size);
                } else if (w > h) {
                  img.contain(size * w / h, size);
                } else {
                  img.contain(size, size * h / w);
                }
                break;
              case ResizeMethod.Contain:
                img.contain(size, size);
                break;
              case ResizeMethod.Cover:
                img.cover(size, size);
                break;
              case ResizeMethod.ScaleToFit:
                img.scaleToFit(size, size);
                break;
            }
            await img.writeAsync(output.cacheOutFullPath).catch(() => {
              this.mapOutCache.delete(output.imageUrlKey);
            }).then(
              () => Deno.copyFileSync(output.cacheOutPath, output.outputPath)
            );
          })
            .finally(() => {
              if (this.option.logPer && (count % 50 === 0 || count === max)) console.log(`${count}/${max}`);
            })
        }
      })
    };
    list.forEach(_doResize);
  }
}
