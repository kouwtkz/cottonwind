const title_left = "黒メモ";
const title_sp = " | ";
const title_elm = document.querySelector("title");
var fileHandle = null;
var idi = "fs",
  FileObject = null,
  cd = 0,
  cdl = ["UTF-8", "Shift-JIS"],
  cdl_s = ["UTF8", "SJIS"];
var elm = null,
  textareaMode = false;
var div_textarea = null;
var pdlrMode = 0;
var rewrite_flag = false;
var ssv = location.protocol === "data:",
  dsv = false,
  nsv = "保存はページ表示ごとに1度だけです";
var fileContain = false;
var FSAA_check = "showOpenFilePicker" in window;
if (
  "userAgentData" in navigator
    ? navigator.userAgentData.mobile
    : navigator.userAgent.match(/android|mobile/i)
) {
  document.documentElement.classList.add("mobile");
}
var getSetElmValue = (v, rwChange = true) => {
  if (typeof v !== "undefined") {
    if (textareaMode) {
      elm.value = v;
    } else {
      elm.innerText = v;
    }
    setTitleRewrite(rwChange);
  }
  if (textareaMode) {
    return elm.value;
  } else {
    return elm.innerText;
  }
};
const textFileOptions = {
  types: [
    {
      description: "Text Files",
      accept: {
        "text/plain": [".txt", ".text", ".md"],
      },
    },
  ],
};
function BeforeCloseEvent() {
  if (
    !rewrite_flag ||
    confirm(
      "行った変更が保存されない可能性があります。\nそれでも閉じますか？",
    )
  ) {
    switchTextareaDisabled(false);
    return true;
  }
  return false;
}
window.onbeforeunload = (e) => {
  if (rewrite_flag) return true;
};
function setFileObject(file) {
  rewrite_flag = false;
  if (file === null) {
    FileObject = file;
  } else if ("files" in file) {
    FileObject = file.files[0];
  } else {
    if (typeof file === "object") {
      FileObject = file;
    } else {
      FileObject = { str: file };
    }
  }
  if (FileObject === null) {
    fileHandle = null;
    delete document.body.dataset.filename;
    getSetElmValue("");
    fileContain = false;
  } else {
    document.body.dataset.filename = FileObject.name;
    fileContain = true;
  }
  return FileObject;
}
function LoadFile(file) {
  var file;
  if (file === null) {
    return;
  } else if ("str" in file) {
    getSetElmValue(file.str, false);
  } else {
    var rd = new FileReader(),
      ec = cdl[cd];
    rd.readAsText(file, ec);
    rd.onload = (e) => {
      fileContain = true;
      getSetElmValue(rd.result, false);
    };
  }
}
function getLogDateName() {
  const d = new Date();
  return (
    "log" +
    d.getFullYear() +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    ("0" + d.getDate()).slice(-2) +
    "_" +
    ("0" + d.getHours()).slice(-2) +
    ("0" + d.getMinutes()).slice(-2) +
    ".txt"
  );
}
async function saveTextarea() {
  var sn = "",
    sndfn = document.body.dataset.filename,
    u_sndfn = typeof sndfn === "undefined";
  if (!u_sndfn) sn = sndfn;
  if (sn === "") sn = getLogDateName();
  if (FSAA_check) {
    try {
      if (fileHandle === null) {
        var saveOptions = textFileOptions;
        saveOptions.suggestedName = sn;
        fileHandle = await window.showSaveFilePicker(saveOptions);
        setFileObject(await fileHandle.getFile());
      }
      const writable = await fileHandle.createWritable();
      await writable.write(getSetElmValue());
      await writable.close();
    } catch (e) {
      switch (e.name) {
        case "NotAllowedError":
        case "AbortError":
          break;
        default:
          console.error(e);
          break;
      }
      elm.focus();
      return;
    }
    if (cd !== 0) {
      cd = 0;
      cdButtonUpdate();
    }
    rewrite_flag = false;
    setTitleRewrite(false);
  } else {
    if (dsv) {
      alert(nsv);
    } else {
      if (
        confirm(
          "テキストの内容を保存しますか？\n保存名>> " +
            sn +
            (ssv ? "\n(" + nsv + ")" : ""),
        )
      ) {
        if (u_sndfn) {
          document.body.dataset.filename = sn;
          fileContain = true;
        }
        var text = getSetElmValue();
        var b = new Blob([text], { type: "text/plane" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = sn;
        a.click();
        if (ssv) dsv = true;
        rewrite_flag = false;
        setTitleRewrite(false);
      }
    }
  }
  elm.focus();
}
async function loadTextarea() {
  if (BeforeCloseEvent()) {
    if (FSAA_check) {
      try {
        var openOptions = textFileOptions;
        openOptions.directory = "note/";
        [fileHandle] = await window.showOpenFilePicker(openOptions);
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
        elm.focus();
        return;
      }
      LoadFile(setFileObject(await fileHandle.getFile()));
    } else {
      var f = document.getElementById(idi);
      if (f !== null) {
        f.remove();
      }
      f = document.createElement("input");
      f.id = idi;
      f.type = "file";
      f.accept = ".txt";
      f.addEventListener("change", (e) => {
        LoadFile(setFileObject(e.target));
      });
      document.head.appendChild(f);
      f.click();
    }
  }
  elm.focus();
}
function cdButtonUpdate() {
  var cdelm = document.getElementById("cdButton");
  if (cdelm !== null) {
    cdelm.value = cdl_s[cd];
  }
}
async function reloadTextarea() {
  var ncd = cd ^ 1;
  if (FileObject !== null && confirm(cdl[ncd] + "として開き直しますか？")) {
    cd = ncd;
    cdButtonUpdate();
    LoadFile(FileObject);
  }
  elm.focus();
}
function confirmReplacePeriodBreak() {
  if (confirm("句読点を自動的に改行しますか？")) {
    getSetElmValue(replacePeriodBreak(getSetElmValue()));
  }
}
function confirmDeleteBreak() {
  if (confirm("改行を削除しますか？")) {
    getSetElmValue(replaceDeleteBreak(getSetElmValue()));
  }
}
var replacePeriodBreak = (n) => {
  return n
    .replace(/([。]+|[.!?！？]\s+)(\n|)/g, function (m, p1, p2) {
      return p1 + (p2 === "" ? "\n" : p2);
    })
    .replace(/^\s+/, " ");
};
var replaceDeleteBreak = (n) => {
  return n.replace(/(\n|)[\-\d]+\n/g, "").replace(/\n([^\n])/g, "$1");
};
var getFontSize = (e) => {
  return Number(getComputedStyle(e).fontSize.match(/\d+/)[0]);
};
function imgDelete() {
  var img = document.querySelector("img");
  delete img.src;
  document.body.classList.remove("includeImage");
  elm.focus();
}
function closeTextarea() {
  if (BeforeCloseEvent()) {
    fileContain = false;
    cd = 0;
    cdButtonUpdate();
    setFileObject(null);
  }
  elm.focus();
}
function newWindowOpen() {
  open(location.href);
}
function titleUpdate(ast = true) {
  title_elm.innerText = title_left +
    (ast ? "*" : "") +
    (typeof document.body.dataset.filename === "undefined"
      ? ""
      : title_sp + document.body.dataset.filename);
}
function setTitleRewrite(rewrite_change = true) {
  if (rewrite_flag) {
    if (!fileContain && elm.value === "") {
      if (rewrite_change) {
        rewrite_flag = false;
      }
      titleUpdate(rewrite_flag);
    }
  } else {
    if (rewrite_change) {
      rewrite_flag = fileContain || elm.value !== "";
    }
    titleUpdate(rewrite_flag);
  }
}
const disableTextareaStr = ["E", "L"];
function switchTextareaDisabled(set) {
  elm.disabled = typeof set === "undefined" ? !elm.disabled : Boolean(set);
  textareaMode = !elm.disabled;
  elm.style.display = textareaMode ? "" : "none";
  div_textarea.style.display = textareaMode ? "" : "block";
  document.querySelector("div.textarea pre").innerText = textareaMode
    ? ""
    : elm.value;
  document.querySelectorAll("input.switchDisabled").forEach((e) => {
    e.value = disableTextareaStr[Number(elm.disabled)];
  });
  elm.focus();
}
function insertTextarea(
  str = "",
  shiftMode = false,
  multype = 0,
  textarea = null,
) {
  if (textarea === null) textarea = elm;
  if (str !== "") {
    const ss = textarea.selectionStart,
      se = textarea.selectionEnd;
    const sr = se - ss,
      v = textarea.value,
      sl = str.length;
    var ts = v.slice(0, ss),
      tr = v.slice(ss, se),
      te = v.slice(se);
    var as = ss,
      ae = se,
      ad = "";
    if (isNaN(multype)) {
      ad = String(multype);
    }
    if (ad !== "") {
      var al = ad.length;
      if (shiftMode) {
        if (ts.slice(-sl) === str && te.slice(0, al) === ad) {
          textarea.value = ts.slice(0, ss - sl) + tr + te.slice(al);
          as = ss - sl;
          ae = se - sl;
        }
      } else {
        textarea.value = ts + str + tr + ad + te;
        as = ss + sl;
        ae = se + sl;
      }
    } else {
      if (sr === 0 || multype) {
        if (shiftMode) {
          if (ts.slice(-sl) === str) {
            textarea.value = ts.slice(0, ss - sl) + tr + te;
            as = ss - sl;
            ae = se - sl;
          }
        } else {
          textarea.value = ts + str + tr + te;
          as = ss + sl;
          ae = se + sl;
        }
      } else {
        var tsn = ts.match(/[^\n]*$/)[0],
          ten = te.match(/^[^\n]*/)[0];
        var loopNum = 0;
        ts = ts.slice(0, ss - tsn.length);
        te = te.slice(ten.length);
        tr = tsn + tr + ten;
        tr = tr.replace(/(^|\n)([^\n]*)/g, function (m0, m1, m2) {
          if (shiftMode) {
            if (m2.slice(0, sl) === str) {
              loopNum--;
              m2 = m2.slice(sl);
            }
            return m1 + m2;
          } else {
            loopNum++;
            return m1 + str + m2;
          }
        });
        textarea.value = ts + tr + te;
        as = ss + sl * Math.sign(loopNum);
        ae = se + sl * loopNum;
      }
    }
    textarea.selectionStart = as;
    textarea.selectionEnd = ae;
    setTitleRewrite();
    return true;
  }
  return false;
}
cdButtonUpdate();
elm = document.querySelector("textarea");
div_textarea = document.querySelector("div.textarea");
textareaMode = elm.tagName === "TEXTAREA";
elm.focus();
elm.addEventListener("input", (e) => {
  setTitleRewrite();
});
elm.addEventListener("paste", (e) => {
  var rt = true,
    img = document.querySelector("img");
  var is = e.clipboardData.items;
  for (var i = 0; i < is.length; i++) {
    it = is[i];
    if (/^image/.test(it.type)) {
      var gf = it.getAsFile();
      var fr = new FileReader();
      fr.onload = (e) => {
        img.src = e.target.result;
      };
      fr.readAsDataURL(gf);
      img.title = "t" + new Date().getTime();
      rt = false;
      document.body.classList.add("includeImage");
    }
  }
  return rt;
});
document.body.ondrop = (e) => {
  if (e.dataTransfer.files.length > 0) {
    LoadFile(setFileObject(e.dataTransfer));
    return false;
  }
};
function styleChange(attr, value) {
  elm.style[attr] = value;
  div_textarea.style[attr] = value;
}
document.body.onkeydown = (e) => {
  if (e.code === "Tab" && !(e.ctrlKey || e.altKey)) {
    return !insertTextarea("\t", e.shiftKey);
  }
  if (!e.shiftKey) {
    if (e.ctrlKey) {
      switch (e.code) {
        case "Enter":
          if (e.altKey) {
            confirmReplacePeriodBreak();
            return false;
          }
        case "KeyS":
          saveTextarea();
          return false;
        case "KeyO":
          loadTextarea();
          return false;
      }
      if (e.altKey) {
        var keyNum = null;
        switch (e.code) {
          case "KeyD":
            switchTextareaDisabled();
            return false;
          case "KeyL":
          case "Comma":
            styleChange("textAlign", "left");
            return false;
          case "KeyR":
          case "Period":
            styleChange("textAlign", "right");
            return false;
          case "KeyC":
          case "Slash":
            styleChange("textAlign", "center");
            return false;
          case "KeyW":
            closeTextarea();
            return false;
          case "KeyN":
            newWindowOpen();
            return false;
          case "KeyG":
          case "KeyH":
          case "KeyJ":
          case "KeyK":
          case "KeyM":
            switch (e.code) {
              case "KeyG":
                keyNum = -1;
                break;
              case "KeyH":
                keyNum = 1;
                break;
              case "KeyJ":
                keyNum = 2;
                break;
              case "KeyK":
                keyNum = 3;
                break;
              case "KeyM":
                keyNum = 0;
                break;
            }
            if (pdlrMode === keyNum || keyNum === 0) {
              pdlrMode = 0;
              styleChange("paddingLeft", "");
              styleChange("paddingRight", "");
            } else {
              pdlrMode = keyNum;
              if (pdlrMode < 0) {
                var mpc = 0;
              } else {
                var mpc = pdlrMode + "0%";
              }
              styleChange("paddingLeft", mpc);
              styleChange("paddingRight", mpc);
            }
            return false;
          case "Quote":
          case "Digit0":
            styleChange("fontSize", "");
            return false;
          case "Digit1":
          case "Digit2":
          case "Digit3":
          case "Digit4":
          case "Digit5":
          case "Digit6":
          case "Digit7":
          case "Digit8":
            keyNum = Number(e.key);
            styleChange("fontSize", keyNum * 4 + 8);
            return false;
          case "Digit9":
            styleChange("fontSize", 48);
            return false;
          case "KeyP":
            styleChange("fontSize", 80);
            return false;
          case "Semicolon":
            styleChange("fontSize", getFontSize(elm) + 1);
            return false;
          case "Minus":
            styleChange("fontSize", getFontSize(elm) - 1);
            return false;
          case "BracketRight":
            styleChange("fontSize", getFontSize(elm) + 4);
            return false;
          case "Backslash":
            styleChange("fontSize", getFontSize(elm) - 4);
            return false;
          case "KeyI":
            reloadTextarea();
            return false;
          case "KeyB":
            document.body.classList.toggle("menuVisible");
            return false;
          case "Backspace":
            confirmDeleteBreak();
            return false;
        }
      }
      elm.focus();
    }
  }
  // console.log(e);
};
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("bnsw.js");
}
