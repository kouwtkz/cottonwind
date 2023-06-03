function checkVar(_check, _def, _nullignore) {
  _nullignore = typeof _nullignore !== "undefined" ? _nullignore : false;
  if (typeof _check === "undefined") {
    _check = _def;
  } else {
    if (!_nullignore && _check === null) {
      _check = _def;
    }
  }
  return _check;
}
function toBoolean(value, emptyTrue) {
  emptyTrue = checkVar(emptyTrue, true);
  if (typeof value === "undefined") {
    return false;
  } else if (value === "" && emptyTrue) {
    return true;
  } else {
    return Boolean(
      (isNaN(value) ? value : Boolean(Number(value)))
        .toString()
        .match(/true/i),
    );
  }
}

function strtotime(time) {
  time = checkVar(time, "").toString();
  var second = 0,
    minute = 0,
    hour = 0;
  var day = 0,
    week = 0,
    month = 0,
    year = 0;
  var re, m;
  re = /([\+\-]?[\d]+)\s*seconds?/;
  m = time.match(re);
  if (m) {
    time = time.replace(re, "");
    second = Number(m[1]);
  }
  re = /([\+\-]?[\d]+)\s*minutes?/;
  m = time.match(re);
  if (m) {
    time = time.replace(re, "");
    minute = Number(m[1]);
  }
  re = /([\+\-]?[\d]+)\s*hours?/;
  m = time.match(re);
  if (m) {
    time = time.replace(re, "");
    hour = Number(m[1]);
  }
  re = /([\+\-]?[\d]+)\s*days?/;
  m = time.match(re);
  if (m) {
    time = time.replace(re, "");
    day = Number(m[1]);
  }
  re = /([\+\-]?[\d]+)\s*weeks?/;
  m = time.match(re);
  if (m) {
    time = time.replace(re, "");
    week = Number(m[1]);
  }
  re = /([\+\-]?[\d]+)\s*months?/;
  m = time.match(re);
  if (m) {
    time = time.replace(re, "");
    month = Number(m[1]);
  }
  re = /([\+\-]?[\d]+)\s*years?/;
  m = time.match(re);
  if (m) {
    time = time.replace(re, "");
    year = Number(m[1]);
  }
  time = new Date(time);
  if (time.toString() === "Invalid Date") {
    time = new Date();
  }
  time.setFullYear(
    time.getFullYear() + year,
    time.getMonth() + month,
    time.getDate() + day + 7 * week,
  );
  time.setHours(
    time.getHours() + hour,
    time.getMinutes() + minute,
    time.getSeconds() + second,
  );
  return time;
}
var $GET = (function () {
  var obj;
  var base = {
    update: function (path, decode_flag, auto_type) {
      var self = obj;
      Object.keys(self).forEach(function (key) {
        delete self[key];
      });
      return this.getObject(path, decode_flag, auto_type, true);
    },
    getObject: function (path, decode_flag, auto_type, rewrite) {
      path = checkVar(path, location.href);
      decode_flag = checkVar(decode_flag, true);
      auto_type = checkVar(auto_type, false);
      rewrite = checkVar(rewrite, false);
      var _obj = rewrite ? obj : new Object();
      var query_str = decodeURI(
        (path.replace(/^([^#]*)#.*$/, "$1") + "?").replace(
          /^.*?\?|.$/g,
          "",
        ),
      )
        .replace(/\+/g, " ")
        .replace(/&/g, "\\\n\r\\");
      if (decode_flag) {
        query_str = query_str.replace(/%(\w\w)/g, function (m, m1) {
          return String.fromCharCode(parseInt(m1, 16));
        });
      }
      var spl = query_str.split("\\\n\r\\");
      var keys = Object.keys(spl);
      for (var i = 0; i < keys.length; i++) {
        var spl2 = (spl[i] + "=").split("=");
        if (spl2[0] !== "") {
          var value = spl2[1];
          if (typeof value === "string" && auto_type) {
            if (value === "") {
            } else if (value.match(/\d+[\-\/\:]\d+/)) {
              var newDate = new Date(value);
              if (newDate.toString() !== "Invalid Date") {
                value = newDate;
              }
            } else if (!isNaN(value)) {
              value = Number(value);
            } else {
              try {
                var e = eval(value);
                switch (typeof e) {
                  case "number":
                  case "string":
                  case "undefined":
                    break;
                  default:
                    value = e;
                    break;
                }
              } catch (e) {}
            }
          }
          _obj[spl2[0]] = value;
        }
      }
      return _obj;
    },
    onpopstate: null,
  };
  obj = Object.create(base);
  var proto = Object.getPrototypeOf(obj);
  proto.update.call(obj);
  window.addEventListener("popstate", function () {
    proto.update.call(obj);
    if (typeof proto.onpopstate === "function") proto.onpopstate();
  });
  return obj;
})();
$COOKIE = (function () {
  var obj;
  var getkey = function (args) {
    switch (typeof args) {
      case "object":
        return args.key;
      default:
        return args;
    }
  };
  var getObjectMode = false;
  var base = {
    outEnableKey: "outEnable",
    _outEnable: false,
    get outEnable() {
      return proto._outEnable;
    },
    set outEnable(value) {
      value = toBoolean(value);
      if (!getObjectMode) {
        if (value) {
          proto.out.call(obj, { key: proto.outEnableKey }, true);
        } else {
          proto.remove.call(obj, proto.outEnableKey);
        }
      }
      proto._outEnable = value;
      return this.outEnable;
    },
    update: function (cookie) {
      var self = obj;
      Object.keys(self).forEach(function (key) {
        delete self[key];
      });
      return this.getObject(cookie, true);
    },
    getObject: function (cookie, rewrite) {
      getObjectMode = true;
      cookie = checkVar(cookie, document.cookie);
      rewrite = checkVar(rewrite, false);
      var _obj = rewrite ? obj : new Object();
      cookie.replace(
        /(^|\s*)([^=;]+)=?([^;]*)(;|$)/g,
        function (m, m1, m2, m3) {
          _obj[m2] = m3;
        },
      );
      getObjectMode = false;
      return _obj;
    },
    out: function (args, force) {
      args = checkVar(args, {});
      force = checkVar(force, this.outEnable);
      var key = getkey(args);
      if (force && typeof key !== "undefined") {
        var value = checkVar(args.value, "1", true);
        var time = checkVar(args.time, null);
        var path = checkVar(args.path, "/");
        var _update = checkVar(args.update, true);
        var setDate = "";
        if (value === null) {
          value = 0;
          setDate = ";max-age=0";
        } else if (time === "") {
        } else if (time === null) {
          setDate = ";max-age=999999999";
        } else if (time.toString().match(/^[\+\-]?[\d]+$/)) {
          setDate = ";max-age=" + time;
        } else {
          setDate = ";expires=" + strtotime(time).toGMTString();
        }
        if (path === null || path === "") {
          setPath = "";
        } else {
          setPath = ";path=" + path;
        }
        document.cookie = `${key}=${value}${setDate}${setPath}`;
        if (_update) {
          return this.update();
        } else {
          return document.cookie;
        }
      } else {
        return null;
      }
    },
    toggle: function (args) {
      var key = getkey(args);
      if (Object.hasOwnProperty.call(obj, key)) {
        return this.remove(key);
      } else {
        return this.out(args);
      }
    },
    remove: function (key) {
      this.out({ key: key, time: 0, update: false }, true);
      delete obj[key];
      return obj;
    },
    removeAll: function (really) {
      if (checkVar(really, false)) {
        var self = obj;
        Object.keys(self).forEach(function (key) {
          self.remove(key);
        });
      }
      return obj;
    },
  };
  obj = Object.create(base);
  var proto = Object.getPrototypeOf(obj);
  proto.update.call(obj);
  return obj;
})();
