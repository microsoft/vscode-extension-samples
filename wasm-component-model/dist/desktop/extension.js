"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/@vscode/wasm-component-model/lib/common/ral.js
var require_ral = __commonJS({
  "node_modules/@vscode/wasm-component-model/lib/common/ral.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var _ral;
    function RAL() {
      if (_ral === void 0) {
        throw new Error(`No runtime abstraction layer installed`);
      }
      return _ral;
    }
    (function(RAL2) {
      function install(ral) {
        if (ral === void 0) {
          throw new Error(`No runtime abstraction layer provided`);
        }
        _ral = ral;
      }
      RAL2.install = install;
      function isInstalled() {
        return _ral !== void 0;
      }
      RAL2.isInstalled = isInstalled;
    })(RAL || (RAL = {}));
    exports2.default = RAL;
  }
});

// node_modules/@vscode/wasm-component-model/lib/node/ril.js
var require_ril = __commonJS({
  "node_modules/@vscode/wasm-component-model/lib/node/ril.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require("util");
    var ral_1 = __importDefault(require_ral());
    var _ril = Object.freeze({
      TextEncoder: Object.freeze({
        create(encoding = "utf-8") {
          return {
            encode(input) {
              return Buffer.from(input ?? "", encoding);
            }
          };
        }
      }),
      TextDecoder: Object.freeze({
        create(encoding = "utf-8") {
          return new util_1.TextDecoder(encoding);
        }
      }),
      console,
      timer: Object.freeze({
        setTimeout(callback, ms, ...args) {
          const handle = setTimeout(callback, ms, ...args);
          return { dispose: () => clearTimeout(handle) };
        },
        setImmediate(callback, ...args) {
          const handle = setImmediate(callback, ...args);
          return { dispose: () => clearImmediate(handle) };
        },
        setInterval(callback, ms, ...args) {
          const handle = setInterval(callback, ms, ...args);
          return { dispose: () => clearInterval(handle) };
        }
      })
    });
    function RIL() {
      return _ril;
    }
    (function(RIL2) {
      function install() {
        if (!ral_1.default.isInstalled()) {
          ral_1.default.install(_ril);
        }
      }
      RIL2.install = install;
    })(RIL || (RIL = {}));
    if (!ral_1.default.isInstalled()) {
      ral_1.default.install(_ril);
    }
    exports2.default = RIL;
  }
});

// node_modules/uuid/dist/esm-node/rng.js
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    import_crypto.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var import_crypto, rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/uuid/dist/esm-node/rng.js"() {
    import_crypto = __toESM(require("crypto"));
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// node_modules/uuid/dist/esm-node/stringify.js
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "node_modules/uuid/dist/esm-node/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
    stringify_default = stringify;
  }
});

// node_modules/uuid/dist/esm-node/v1.js
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || unsafeStringify(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "node_modules/uuid/dist/esm-node/v1.js"() {
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    v1_default = v1;
  }
});

// node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate();
    parse_default = parse;
  }
});

// node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35(name, version2, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version2;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return unsafeStringify(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}
var DNS, URL;
var init_v35 = __esm({
  "node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify();
    init_parse();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// node_modules/uuid/dist/esm-node/md5.js
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_crypto2.default.createHash("md5").update(bytes).digest();
}
var import_crypto2, md5_default;
var init_md5 = __esm({
  "node_modules/uuid/dist/esm-node/md5.js"() {
    import_crypto2 = __toESM(require("crypto"));
    md5_default = md5;
  }
});

// node_modules/uuid/dist/esm-node/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "node_modules/uuid/dist/esm-node/v3.js"() {
    init_v35();
    init_md5();
    v3 = v35("v3", 48, md5_default);
    v3_default = v3;
  }
});

// node_modules/uuid/dist/esm-node/native.js
var import_crypto3, native_default;
var init_native = __esm({
  "node_modules/uuid/dist/esm-node/native.js"() {
    import_crypto3 = __toESM(require("crypto"));
    native_default = {
      randomUUID: import_crypto3.default.randomUUID
    };
  }
});

// node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/uuid/dist/esm-node/v4.js"() {
    init_native();
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/uuid/dist/esm-node/sha1.js
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_crypto4.default.createHash("sha1").update(bytes).digest();
}
var import_crypto4, sha1_default;
var init_sha1 = __esm({
  "node_modules/uuid/dist/esm-node/sha1.js"() {
    import_crypto4 = __toESM(require("crypto"));
    sha1_default = sha1;
  }
});

// node_modules/uuid/dist/esm-node/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "node_modules/uuid/dist/esm-node/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// node_modules/uuid/dist/esm-node/nil.js
var nil_default;
var init_nil = __esm({
  "node_modules/uuid/dist/esm-node/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// node_modules/uuid/dist/esm-node/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.slice(14, 15), 16);
}
var version_default;
var init_version = __esm({
  "node_modules/uuid/dist/esm-node/version.js"() {
    init_validate();
    version_default = version;
  }
});

// node_modules/uuid/dist/esm-node/index.js
var esm_node_exports = {};
__export(esm_node_exports, {
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_node = __esm({
  "node_modules/uuid/dist/esm-node/index.js"() {
    init_v1();
    init_v3();
    init_v4();
    init_v5();
    init_nil();
    init_version();
    init_validate();
    init_stringify();
    init_parse();
  }
});

// node_modules/@vscode/wasm-component-model/lib/common/componentModel.js
var require_componentModel = __commonJS({
  "node_modules/@vscode/wasm-component-model/lib/common/componentModel.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result2 = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result2, mod, k);
      }
      __setModuleDefault(result2, mod);
      return result2;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OptionType = exports2.option = exports2.EnumType = exports2.VariantType = exports2.FlagsType = exports2.TupleType = exports2.RecordType = exports2.Float64ArrayType = exports2.Float32ArrayType = exports2.BigUint64ArrayType = exports2.Uint32ArrayType = exports2.Uint16ArrayType = exports2.Uint8ArrayType = exports2.BigInt64ArrayType = exports2.Int32ArrayType = exports2.Int16ArrayType = exports2.Int8ArrayType = exports2.ListType = exports2.wstring = exports2.wchar = exports2.ptr = exports2.size = exports2.byte = exports2.float64 = exports2.float32 = exports2.s64 = exports2.s32 = exports2.s16 = exports2.s8 = exports2.u64 = exports2.u32 = exports2.u16 = exports2.u8 = exports2.bool = exports2.ComponentModelTypeKind = exports2.FlatTuple = exports2.f64 = exports2.f32 = exports2.i64 = exports2.i32 = exports2.FlatTypeKind = exports2.Memory = exports2.MemoryRange = exports2.ReadonlyMemoryRange = exports2.BaseMemoryRange = exports2.MemoryError = exports2.Alignment = exports2.ResourceManagers = exports2.ResourceManager = exports2.ComponentModelTrap = void 0;
    exports2.Exports = exports2.Module = exports2.Imports = exports2.Resource = exports2.WasmContext = exports2.PackageType = exports2.InterfaceType = exports2.ComponentModelTypeVisitor = exports2.OwnType = exports2.BorrowType = exports2.ResourceType = exports2.ResourceHandleType = exports2.MethodType = exports2.StaticMethodType = exports2.DestructorType = exports2.ConstructorType = exports2.FunctionType = exports2.ResultType = exports2.result = void 0;
    var ral_1 = __importDefault(require_ral());
    var uuid = __importStar((init_esm_node(), __toCommonJS(esm_node_exports)));
    var isLittleEndian = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
    if (!isLittleEndian) {
      throw new Error("Big endian platforms are currently not supported.");
    }
    var ComponentModelTrap = class extends Error {
      constructor(message) {
        super(message);
      }
    };
    exports2.ComponentModelTrap = ComponentModelTrap;
    var ResourceManager;
    (function(ResourceManager2) {
      function from(obj) {
        while (obj !== void 0) {
          const self = obj;
          if (typeof self.$drop === "function" && typeof self.$handle === "function" && typeof self.$resource === "function") {
            return self;
          }
          obj = obj.$manager;
        }
        return void 0;
      }
      ResourceManager2.from = from;
      class Default {
        constructor() {
          __publicField(this, "h2r");
          __publicField(this, "handleCounter");
          this.h2r = /* @__PURE__ */ new Map();
          this.handleCounter = 1;
        }
        $handle(value) {
          if (value.$handle !== void 0) {
            return value.$handle;
          }
          const handle = this.handleCounter++;
          this.h2r.set(handle, value);
          value.$handle = handle;
          return handle;
        }
        $resource(resource) {
          const value = this.h2r.get(resource);
          if (value === void 0) {
            throw new ComponentModelTrap(`Unknown resource handle ${resource}`);
          }
          return value;
        }
        $drop(resource) {
          this.h2r.delete(resource);
        }
      }
      ResourceManager2.Default = Default;
    })(ResourceManager || (exports2.ResourceManager = ResourceManager = {}));
    var ResourceManagers;
    (function(ResourceManagers2) {
      class Default {
        constructor() {
          __publicField(this, "managers");
          this.managers = /* @__PURE__ */ new Map();
        }
        has(id) {
          return this.managers.has(id);
        }
        set(id, manager) {
          if (this.managers.has(id)) {
            throw new ComponentModelTrap(`Resource manager ${id} already registered.`);
          }
          this.managers.set(id, manager);
        }
        get(id) {
          const manager = this.managers.get(id);
          if (manager === void 0) {
            throw new ComponentModelTrap(`Resource manager ${id} not found.`);
          }
          return manager;
        }
      }
      ResourceManagers2.Default = Default;
    })(ResourceManagers || (exports2.ResourceManagers = ResourceManagers = {}));
    var BigInts;
    (function(BigInts2) {
      const MAX_VALUE_AS_BIGINT = BigInt(Number.MAX_VALUE);
      function asNumber(value) {
        if (value > MAX_VALUE_AS_BIGINT) {
          throw new ComponentModelTrap("Value too big for number");
        }
        return Number(value);
      }
      BigInts2.asNumber = asNumber;
      function max(...args) {
        return args.reduce((m, e) => e > m ? e : m);
      }
      BigInts2.max = max;
      function min(...args) {
        return args.reduce((m, e) => e < m ? e : m);
      }
      BigInts2.min = min;
    })(BigInts || (BigInts = {}));
    var utf8Decoder = (0, ral_1.default)().TextDecoder.create("utf-8");
    var utf8Encoder = (0, ral_1.default)().TextEncoder.create("utf-8");
    var Alignment;
    (function(Alignment2) {
      Alignment2[Alignment2["byte"] = 1] = "byte";
      Alignment2[Alignment2["halfWord"] = 2] = "halfWord";
      Alignment2[Alignment2["word"] = 4] = "word";
      Alignment2[Alignment2["doubleWord"] = 8] = "doubleWord";
    })(Alignment || (exports2.Alignment = Alignment = {}));
    (function(Alignment2) {
      function align2(ptr, alignment) {
        return Math.ceil(ptr / alignment) * alignment;
      }
      Alignment2.align = align2;
      function getAlignment(ptr) {
        if (ptr % Alignment2.doubleWord === 0) {
          return Alignment2.doubleWord;
        }
        if (ptr % Alignment2.word === 0) {
          return Alignment2.word;
        }
        if (ptr % Alignment2.halfWord === 0) {
          return Alignment2.halfWord;
        }
        return Alignment2.byte;
      }
      Alignment2.getAlignment = getAlignment;
    })(Alignment || (exports2.Alignment = Alignment = {}));
    var align = Alignment.align;
    var MemoryError = class extends Error {
      constructor(message) {
        super(message);
      }
    };
    exports2.MemoryError = MemoryError;
    var BaseMemoryRange = class {
      constructor(memory, ptr, size) {
        __publicField(this, "_memory");
        __publicField(this, "_ptr");
        __publicField(this, "_size");
        __publicField(this, "_alignment");
        __publicField(this, "_view");
        this._memory = memory;
        this._ptr = ptr;
        this._size = size;
        this._alignment = Alignment.getAlignment(ptr);
      }
      get memory() {
        return this._memory;
      }
      get ptr() {
        return this._ptr;
      }
      get size() {
        return this._size;
      }
      get alignment() {
        return this._alignment;
      }
      get view() {
        if (this._view === void 0 || this._view.buffer !== this._memory.buffer) {
          this._view = new DataView(this._memory.buffer, this._ptr, this._size);
        }
        return this._view;
      }
      getUint8(offset) {
        return this.view.getUint8(offset);
      }
      getInt8(offset) {
        return this.view.getInt8(offset);
      }
      getUint16(offset) {
        this.assertAlignment(offset, Alignment.halfWord);
        return this.view.getUint16(offset, true);
      }
      getInt16(offset) {
        this.assertAlignment(offset, Alignment.halfWord);
        return this.view.getInt16(offset, true);
      }
      getUint32(offset) {
        this.assertAlignment(offset, Alignment.word);
        return this.view.getUint32(offset, true);
      }
      getInt32(offset) {
        this.assertAlignment(offset, Alignment.word);
        return this.view.getInt32(offset, true);
      }
      getUint64(offset) {
        this.assertAlignment(offset, Alignment.doubleWord);
        return this.view.getBigUint64(offset, true);
      }
      getInt64(offset) {
        this.assertAlignment(offset, Alignment.doubleWord);
        return this.view.getBigInt64(offset, true);
      }
      getFloat32(offset) {
        this.assertAlignment(offset, Alignment.word);
        return this.view.getFloat32(offset, true);
      }
      getFloat64(offset) {
        this.assertAlignment(offset, Alignment.doubleWord);
        return this.view.getFloat64(offset, true);
      }
      getPtr(offset) {
        this.assertAlignment(offset, Alignment.word);
        return this.view.getUint32(offset, true);
      }
      getUint8Array(offset, length) {
        return this.getArray(offset, length, Uint8Array);
      }
      getInt8Array(offset, length) {
        return this.getArray(offset, length, Int8Array);
      }
      getUint16Array(byteOffset, length) {
        return this.getArray(byteOffset, length, Uint16Array);
      }
      getInt16Array(byteOffset, length) {
        return this.getArray(byteOffset, length, Int16Array);
      }
      getUint32Array(byteOffset, length) {
        return this.getArray(byteOffset, length, Uint32Array);
      }
      getInt32Array(byteOffset, length) {
        return this.getArray(byteOffset, length, Int32Array);
      }
      getUint64Array(byteOffset, length) {
        return this.getBigArray(byteOffset, length, BigUint64Array);
      }
      getInt64Array(byteOffset, length) {
        return this.getBigArray(byteOffset, length, BigInt64Array);
      }
      getFloat32Array(byteOffset, length) {
        return this.getArray(byteOffset, length, Float32Array);
      }
      getFloat64Array(byteOffset, length) {
        return this.getArray(byteOffset, length, Float64Array);
      }
      copyBytes(offset, length, into, into_offset) {
        if (offset + length > this.size) {
          throw new MemoryError(`Memory access is out of bounds. Accessing [${offset}, ${length}], allocated[${this.ptr}, ${this.size}]`);
        }
        const target = into.getUint8View(into_offset, length);
        target.set(new Uint8Array(this._memory.buffer, this.ptr + offset, length));
      }
      assertAlignment(offset, alignment) {
        if (alignment > this.alignment || offset % alignment !== 0) {
          throw new MemoryError(`Memory location is not aligned to ${alignment}. Allocated[${this.ptr},${this.size}]`);
        }
      }
      getArray(byteOffset, length, clazz) {
        length = length ?? (this.size - byteOffset) / clazz.BYTES_PER_ELEMENT;
        if (!Number.isInteger(length)) {
          throw new MemoryError(`Length must be an integer value. Got ${length}.`);
        }
        const result2 = new clazz(length);
        result2.set(new clazz(this._memory.buffer, this.ptr + byteOffset, length));
        return result2;
      }
      getBigArray(byteOffset, length, clazz) {
        length = length ?? (this.size - byteOffset) / clazz.BYTES_PER_ELEMENT;
        if (!Number.isInteger(length)) {
          throw new MemoryError(`Length must be an integer value. Got ${length}.`);
        }
        const result2 = new clazz(length);
        result2.set(new clazz(this._memory.buffer, this.ptr + byteOffset, length));
        return result2;
      }
    };
    exports2.BaseMemoryRange = BaseMemoryRange;
    var ReadonlyMemoryRange = class _ReadonlyMemoryRange extends BaseMemoryRange {
      constructor(memory, ptr, size) {
        super(memory, ptr, size);
      }
      range(offset, size) {
        if (offset + size > this.size) {
          throw new MemoryError(`Memory access is out of bounds. Accessing [${offset}, ${size}], allocated[${this.ptr}, ${this.size}]`);
        }
        return new _ReadonlyMemoryRange(this._memory, this.ptr + offset, size);
      }
    };
    exports2.ReadonlyMemoryRange = ReadonlyMemoryRange;
    var MemoryRange = class _MemoryRange extends BaseMemoryRange {
      constructor(memory, ptr, size, isPreallocated = false) {
        super(memory, ptr, size);
        __publicField(this, "isAllocated");
        this.isAllocated = isPreallocated;
      }
      free() {
        if (typeof this._memory.free !== "function") {
          throw new MemoryError(`Memory doesn't support free`);
        }
        this._memory.free(this);
      }
      range(offset, size) {
        if (offset + size > this.size) {
          throw new MemoryError(`Memory access is out of bounds. Accessing [${offset}, ${size}], allocated[${this.ptr}, ${this.size}]`);
        }
        return new _MemoryRange(this._memory, this.ptr + offset, size);
      }
      setUint8(offset, value) {
        this.view.setUint8(offset, value);
      }
      setInt8(offset, value) {
        this.view.setInt8(offset, value);
      }
      setUint16(offset, value) {
        this.assertAlignment(offset, Alignment.halfWord);
        this.view.setUint16(offset, value, true);
      }
      setInt16(offset, value) {
        this.assertAlignment(offset, Alignment.halfWord);
        this.view.setInt16(offset, value, true);
      }
      setUint32(offset, value) {
        this.assertAlignment(offset, Alignment.word);
        this.view.setUint32(offset, value, true);
      }
      setInt32(offset, value) {
        this.assertAlignment(offset, Alignment.word);
        this.view.setInt32(offset, value, true);
      }
      setUint64(offset, value) {
        this.assertAlignment(offset, Alignment.doubleWord);
        this.view.setBigUint64(offset, value, true);
      }
      setInt64(offset, value) {
        this.assertAlignment(offset, Alignment.doubleWord);
        this.view.setBigInt64(offset, value, true);
      }
      setFloat32(offset, value) {
        this.assertAlignment(offset, Alignment.word);
        this.view.setFloat32(offset, value, true);
      }
      setFloat64(offset, value) {
        this.assertAlignment(offset, Alignment.doubleWord);
        this.view.setFloat64(offset, value, true);
      }
      setPtr(offset, value) {
        this.assertAlignment(offset, Alignment.word);
        this.view.setUint32(offset, value, true);
      }
      getUint8View(offset, length) {
        return this.getArrayView(offset, length, Uint8Array);
      }
      getInt8View(offset, length) {
        return this.getArrayView(offset, length, Int8Array);
      }
      getUint16View(offset, length) {
        return this.getArrayView(offset, length, Uint16Array);
      }
      getInt16View(offset, length) {
        return this.getArrayView(offset, length, Int16Array);
      }
      getUint32View(offset, length) {
        return this.getArrayView(offset, length, Uint32Array);
      }
      getInt32View(offset, length) {
        return this.getArrayView(offset, length, Int32Array);
      }
      getUint64View(offset, length) {
        return this.getBigArrayView(offset, length, BigUint64Array);
      }
      getInt64View(offset, length) {
        return this.getBigArrayView(offset, length, BigInt64Array);
      }
      getFloat32View(offset, length) {
        return this.getArrayView(offset, length, Float32Array);
      }
      getFloat64View(offset, length) {
        return this.getArrayView(offset, length, Float64Array);
      }
      setUint8Array(offset, bytes) {
        this.setArray(offset, bytes, Uint8Array);
      }
      setInt8Array(offset, bytes) {
        this.setArray(offset, bytes, Int8Array);
      }
      setUint16Array(offset, bytes) {
        this.setArray(offset, bytes, Uint16Array);
      }
      setInt16Array(offset, bytes) {
        this.setArray(offset, bytes, Int16Array);
      }
      setUint32Array(offset, bytes) {
        this.setArray(offset, bytes, Uint32Array);
      }
      setInt32Array(offset, bytes) {
        this.setArray(offset, bytes, Int32Array);
      }
      setUint64Array(offset, bytes) {
        this.setBigArray(offset, bytes, BigUint64Array);
      }
      setInt64Array(offset, bytes) {
        this.setBigArray(offset, bytes, BigInt64Array);
      }
      setFloat32Array(offset, bytes) {
        this.setArray(offset, bytes, Float32Array);
      }
      setFloat64Array(offset, bytes) {
        this.setArray(offset, bytes, Float64Array);
      }
      getArrayView(byteOffset, length, clazz) {
        length = length ?? (this.size - byteOffset) / clazz.BYTES_PER_ELEMENT;
        if (!Number.isInteger(length)) {
          throw new MemoryError(`Length must be an integer value. Got ${length}.`);
        }
        return new clazz(this._memory.buffer, this.ptr + byteOffset, length);
      }
      getBigArrayView(byteOffset, length, clazz) {
        length = length ?? (this.size - byteOffset) / clazz.BYTES_PER_ELEMENT;
        if (!Number.isInteger(length)) {
          throw new MemoryError(`Length must be an integer value. Got ${length}.`);
        }
        return new clazz(this._memory.buffer, this.ptr + byteOffset, length);
      }
      setArray(byteOffset, bytes, clazz) {
        new clazz(this._memory.buffer, this.ptr + byteOffset, bytes.length).set(bytes);
      }
      setBigArray(byteOffset, bytes, clazz) {
        new clazz(this._memory.buffer, this.ptr + byteOffset, bytes.length).set(bytes);
      }
    };
    exports2.MemoryRange = MemoryRange;
    var NullMemory = class {
      constructor() {
        __publicField(this, "id", "b60336d2-c856-4767-af3b-f66e1ab6c507");
        __publicField(this, "buffer", new ArrayBuffer(0));
      }
      alloc() {
        throw new MemoryError("Cannot allocate memory on a null memory.");
      }
      realloc() {
        throw new MemoryError("Cannot re-allocate memory on a null memory.");
      }
      preAllocated() {
        throw new MemoryError("Cannot point to pre-allocate memory on a null memory.");
      }
      readonly() {
        throw new MemoryError("Cannot point to readonly memory on a null memory.");
      }
      free() {
        throw new MemoryError("Cannot free memory on a null memory.");
      }
    };
    var Memory2;
    (function(Memory3) {
      Memory3.Null = new NullMemory();
      class Default {
        constructor(exports3, id) {
          __publicField(this, "id");
          __publicField(this, "memory");
          __publicField(this, "cabi_realloc");
          if (exports3.memory === void 0 || exports3.cabi_realloc === void 0) {
            throw new MemoryError("The exports object must contain a memory object and a cabi_realloc function.");
          }
          this.id = id ?? uuid.v4();
          this.memory = exports3.memory;
          this.cabi_realloc = exports3.cabi_realloc;
        }
        get buffer() {
          return this.memory.buffer;
        }
        alloc(align2, size) {
          const ptr = this.cabi_realloc(0, 0, align2, size);
          return new MemoryRange(this, ptr, size);
        }
        realloc(range, newSize) {
          const ptr = this.cabi_realloc(range.ptr, range.size, range.alignment, newSize);
          return new MemoryRange(this, ptr, newSize);
        }
        preAllocated(ptr, size) {
          return new MemoryRange(this, ptr, size);
        }
        readonly(ptr, size) {
          return new ReadonlyMemoryRange(this, ptr, size);
        }
      }
      Memory3.Default = Default;
    })(Memory2 || (exports2.Memory = Memory2 = {}));
    var FlatTypeKind;
    (function(FlatTypeKind2) {
      FlatTypeKind2["i32"] = "i32";
      FlatTypeKind2["i64"] = "i64";
      FlatTypeKind2["f32"] = "f32";
      FlatTypeKind2["f64"] = "f64";
    })(FlatTypeKind || (exports2.FlatTypeKind = FlatTypeKind = {}));
    var $i32;
    (function($i322) {
      $i322.kind = FlatTypeKind.i32;
      $i322.size = 4;
      $i322.alignment = Alignment.word;
      function load(memory, offset) {
        return memory.getUint32(offset);
      }
      $i322.load = load;
      function store(memory, offset, value) {
        memory.setUint32(offset, value);
      }
      $i322.store = store;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $i322.alignment);
        src.assertAlignment(src_offset, $i322.alignment);
        src.copyBytes(src_offset, $i322.size, dest, dest_offset);
      }
      $i322.copy = copy;
    })($i32 || ($i32 = {}));
    exports2.i32 = $i32;
    var $i64;
    (function($i642) {
      $i642.kind = FlatTypeKind.i64;
      $i642.size = 8;
      $i642.alignment = Alignment.doubleWord;
      function load(memory, offset) {
        return memory.getUint64(offset);
      }
      $i642.load = load;
      function store(memory, offset, value) {
        memory.setUint64(offset, value);
      }
      $i642.store = store;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $i642.alignment);
        src.assertAlignment(src_offset, $i642.alignment);
        src.copyBytes(src_offset, $i642.size, dest, dest_offset);
      }
      $i642.copy = copy;
    })($i64 || ($i64 = {}));
    exports2.i64 = $i64;
    var $f32;
    (function($f322) {
      $f322.kind = FlatTypeKind.f32;
      $f322.size = 4;
      $f322.alignment = Alignment.word;
      function load(memory, offset) {
        return memory.getFloat32(offset);
      }
      $f322.load = load;
      function store(memory, offset, value) {
        memory.setFloat32(offset, value);
      }
      $f322.store = store;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $f322.alignment);
        src.assertAlignment(src_offset, $f322.alignment);
        src.copyBytes(src_offset, $f322.size, dest, dest_offset);
      }
      $f322.copy = copy;
    })($f32 || ($f32 = {}));
    exports2.f32 = $f32;
    var $f64;
    (function($f642) {
      $f642.kind = FlatTypeKind.f64;
      $f642.size = 8;
      $f642.alignment = Alignment.doubleWord;
      function load(memory, offset) {
        return memory.getFloat64(offset);
      }
      $f642.load = load;
      function store(memory, offset, value) {
        memory.setFloat64(offset, value);
      }
      $f642.store = store;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $f642.alignment);
        src.assertAlignment(src_offset, $f642.alignment);
        src.copyBytes(src_offset, $f642.size, dest, dest_offset);
      }
      $f642.copy = copy;
    })($f64 || ($f64 = {}));
    exports2.f64 = $f64;
    var FlatTuple = class _FlatTuple {
      constructor(types) {
        __publicField(this, "types");
        __publicField(this, "alignment");
        __publicField(this, "size");
        this.types = types;
        this.alignment = _FlatTuple.alignment(types);
        this.size = _FlatTuple.size(types, this.alignment);
      }
      load(memory, offset) {
        memory.assertAlignment(offset, this.alignment);
        const result2 = [];
        for (const type of this.types) {
          offset = align(offset, type.alignment);
          result2.push(type.load(memory, offset));
          offset += type.size;
        }
        return result2;
      }
      alloc(memory) {
        return memory.alloc(this.alignment, this.size);
      }
      store(memory, offset, values) {
        memory.assertAlignment(offset, this.alignment);
        for (const [index, type] of this.types.entries()) {
          const value = values[index];
          offset = align(offset, type.alignment);
          type.store(memory, offset, value);
          offset += type.size;
        }
      }
      copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, this.alignment);
        src.assertAlignment(src_offset, this.alignment);
        src.copyBytes(src_offset, this.size, dest, dest_offset);
      }
      static alignment(types) {
        let result2 = Alignment.byte;
        for (const type of types) {
          result2 = Math.max(result2, type.alignment);
        }
        return result2;
      }
      static size(types, tupleAlignment) {
        let result2 = 0;
        for (const type of types) {
          result2 = align(result2, type.alignment);
          result2 += type.size;
        }
        return align(result2, tupleAlignment);
      }
    };
    exports2.FlatTuple = FlatTuple;
    var WasmTypes;
    (function(WasmTypes2) {
      const $32 = new DataView(new ArrayBuffer(4));
      const $64 = new DataView(new ArrayBuffer(8));
      function reinterpret_i32_as_f32(i32) {
        $32.setInt32(0, i32, true);
        return $32.getFloat32(0, true);
      }
      WasmTypes2.reinterpret_i32_as_f32 = reinterpret_i32_as_f32;
      function reinterpret_f32_as_i32(f32) {
        $32.setFloat32(0, f32, true);
        return $32.getInt32(0, true);
      }
      WasmTypes2.reinterpret_f32_as_i32 = reinterpret_f32_as_i32;
      function convert_i64_to_i32(i64) {
        return BigInts.asNumber(i64);
      }
      WasmTypes2.convert_i64_to_i32 = convert_i64_to_i32;
      function convert_i32_to_i64(i32) {
        return BigInt(i32);
      }
      WasmTypes2.convert_i32_to_i64 = convert_i32_to_i64;
      function reinterpret_i64_as_f32(i64) {
        const i32 = convert_i64_to_i32(i64);
        return reinterpret_i32_as_f32(i32);
      }
      WasmTypes2.reinterpret_i64_as_f32 = reinterpret_i64_as_f32;
      function reinterpret_f32_as_i64(f32) {
        const i32 = reinterpret_f32_as_i32(f32);
        return convert_i32_to_i64(i32);
      }
      WasmTypes2.reinterpret_f32_as_i64 = reinterpret_f32_as_i64;
      function reinterpret_i64_as_f64(i64) {
        $64.setBigInt64(0, i64, true);
        return $64.getFloat64(0, true);
      }
      WasmTypes2.reinterpret_i64_as_f64 = reinterpret_i64_as_f64;
      function reinterpret_f64_as_i64(f64) {
        $64.setFloat64(0, f64, true);
        return $64.getBigInt64(0, true);
      }
      WasmTypes2.reinterpret_f64_as_i64 = reinterpret_f64_as_i64;
    })(WasmTypes || (WasmTypes = {}));
    var CoerceValueIter = class {
      constructor(values, haveFlatTypes, wantFlatTypes) {
        __publicField(this, "values");
        __publicField(this, "haveFlatTypes");
        __publicField(this, "wantFlatTypes");
        __publicField(this, "index");
        this.values = values;
        this.haveFlatTypes = haveFlatTypes;
        this.wantFlatTypes = wantFlatTypes;
        if (haveFlatTypes.length < wantFlatTypes.length) {
          throw new ComponentModelTrap(`Invalid coercion: have ${haveFlatTypes.length} values, want ${wantFlatTypes.length} values`);
        }
        this.index = 0;
      }
      next() {
        const value = this.values.next();
        if (value.done) {
          return value;
        }
        const haveType = this.haveFlatTypes[this.index];
        const wantType = this.wantFlatTypes[this.index++];
        if (haveType === $i32 && wantType === $f32) {
          return { done: false, value: WasmTypes.reinterpret_i32_as_f32(value.value) };
        } else if (haveType === $i64 && wantType === $i32) {
          return { done: false, value: WasmTypes.convert_i64_to_i32(value.value) };
        } else if (haveType === $i64 && wantType === $f32) {
          return { done: false, value: WasmTypes.reinterpret_i64_as_f32(value.value) };
        } else if (haveType === $i64 && wantType === $f64) {
          return { done: false, value: WasmTypes.reinterpret_i64_as_f64(value.value) };
        } else {
          return value;
        }
      }
    };
    var ComponentModelTypeKind;
    (function(ComponentModelTypeKind2) {
      ComponentModelTypeKind2["bool"] = "bool";
      ComponentModelTypeKind2["u8"] = "u8";
      ComponentModelTypeKind2["u16"] = "u16";
      ComponentModelTypeKind2["u32"] = "u32";
      ComponentModelTypeKind2["u64"] = "u64";
      ComponentModelTypeKind2["s8"] = "s8";
      ComponentModelTypeKind2["s16"] = "s16";
      ComponentModelTypeKind2["s32"] = "s32";
      ComponentModelTypeKind2["s64"] = "s64";
      ComponentModelTypeKind2["float32"] = "float32";
      ComponentModelTypeKind2["float64"] = "float64";
      ComponentModelTypeKind2["char"] = "char";
      ComponentModelTypeKind2["string"] = "string";
      ComponentModelTypeKind2["list"] = "list";
      ComponentModelTypeKind2["record"] = "record";
      ComponentModelTypeKind2["tuple"] = "tuple";
      ComponentModelTypeKind2["variant"] = "variant";
      ComponentModelTypeKind2["enum"] = "enum";
      ComponentModelTypeKind2["flags"] = "flags";
      ComponentModelTypeKind2["option"] = "option";
      ComponentModelTypeKind2["result"] = "result";
      ComponentModelTypeKind2["resource"] = "resource";
      ComponentModelTypeKind2["resourceHandle"] = "resourceHandle";
      ComponentModelTypeKind2["borrow"] = "borrow";
      ComponentModelTypeKind2["own"] = "own";
    })(ComponentModelTypeKind || (exports2.ComponentModelTypeKind = ComponentModelTypeKind = {}));
    exports2.bool = {
      kind: ComponentModelTypeKind.bool,
      size: 1,
      alignment: 1,
      flatTypes: [$i32],
      load(memory, offset) {
        return memory.getUint8(offset) !== 0;
      },
      liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < 0) {
          throw new Error(`Invalid bool value ${value}`);
        }
        return value !== 0;
      },
      alloc(memory) {
        return memory.alloc(exports2.bool.alignment, exports2.bool.size);
      },
      store(memory, offset, value) {
        memory.setUint8(offset, value ? 1 : 0);
      },
      lowerFlat(result2, _memory, value) {
        result2.push(value ? 1 : 0);
      },
      copy(dest, dest_offset, src, src_offset) {
        src.copyBytes(src_offset, exports2.bool.size, dest, dest_offset);
      }
    };
    var $u8;
    (function($u82) {
      $u82.kind = ComponentModelTypeKind.u8;
      $u82.size = 1;
      $u82.alignment = Alignment.byte;
      $u82.flatTypes = [$i32];
      $u82.LOW_VALUE = 0;
      $u82.HIGH_VALUE = 255;
      function load(memory, offset) {
        return memory.getUint8(offset);
      }
      $u82.load = load;
      function liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < $u82.LOW_VALUE || value > $u82.HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid u8 value ${value}`);
        }
        return value;
      }
      $u82.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($u82.alignment, $u82.size);
      }
      $u82.alloc = alloc;
      function store(memory, offset, value) {
        memory.setUint8(offset, value);
      }
      $u82.store = store;
      function lowerFlat(result2, _memory, value) {
        if (value < $u82.LOW_VALUE || value > $u82.HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid u8 value ${value}`);
        }
        result2.push(value);
      }
      $u82.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        src.copyBytes(src_offset, $u82.size, dest, dest_offset);
      }
      $u82.copy = copy;
    })($u8 || ($u8 = {}));
    exports2.u8 = $u8;
    var $u16;
    (function($u162) {
      $u162.kind = ComponentModelTypeKind.u16;
      $u162.size = 2;
      $u162.alignment = Alignment.halfWord;
      $u162.flatTypes = [$i32];
      $u162.LOW_VALUE = 0;
      $u162.HIGH_VALUE = 65535;
      function load(memory, offset) {
        return memory.getUint16(offset);
      }
      $u162.load = load;
      function liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < $u162.LOW_VALUE || value > $u162.HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid u16 value ${value}`);
        }
        return value;
      }
      $u162.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($u162.alignment, $u162.size);
      }
      $u162.alloc = alloc;
      function store(memory, offset, value) {
        memory.setUint16(offset, value);
      }
      $u162.store = store;
      function lowerFlat(result2, _memory, value) {
        if (value < $u162.LOW_VALUE || value > $u162.HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid u16 value ${value}`);
        }
        result2.push(value);
      }
      $u162.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $u162.alignment);
        src.assertAlignment(src_offset, $u162.alignment);
        src.copyBytes(src_offset, $u162.size, dest, dest_offset);
      }
      $u162.copy = copy;
    })($u16 || ($u16 = {}));
    exports2.u16 = $u16;
    var $u32;
    (function($u322) {
      $u322.kind = ComponentModelTypeKind.u32;
      $u322.size = 4;
      $u322.alignment = Alignment.word;
      $u322.flatTypes = [$i32];
      $u322.LOW_VALUE = 0;
      $u322.HIGH_VALUE = 4294967295;
      function valid(value) {
        return value >= $u322.LOW_VALUE && value <= $u322.HIGH_VALUE && Number.isInteger(value);
      }
      $u322.valid = valid;
      function load(memory, offset) {
        return memory.getUint32(offset);
      }
      $u322.load = load;
      function liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < $u322.LOW_VALUE || value > $u322.HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid u32 value ${value}`);
        }
        return value;
      }
      $u322.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($u322.alignment, $u322.size);
      }
      $u322.alloc = alloc;
      function store(memory, offset, value) {
        memory.setUint32(offset, value);
      }
      $u322.store = store;
      function lowerFlat(result2, _memory, value) {
        if (value < $u322.LOW_VALUE || value > $u322.HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid u32 value ${value}`);
        }
        result2.push(value);
      }
      $u322.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $u322.alignment);
        src.assertAlignment(src_offset, $u322.alignment);
        src.copyBytes(src_offset, $u322.size, dest, dest_offset);
      }
      $u322.copy = copy;
    })($u32 || ($u32 = {}));
    exports2.u32 = $u32;
    var $u64;
    (function($u642) {
      $u642.kind = ComponentModelTypeKind.u64;
      $u642.size = 8;
      $u642.alignment = Alignment.doubleWord;
      $u642.flatTypes = [$i64];
      $u642.LOW_VALUE = 0n;
      $u642.HIGH_VALUE = 18446744073709551615n;
      function load(memory, offset) {
        return memory.getUint64(offset);
      }
      $u642.load = load;
      function liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < $u642.LOW_VALUE) {
          throw new Error(`Invalid u64 value ${value}`);
        }
        return value;
      }
      $u642.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($u642.alignment, $u642.size);
      }
      $u642.alloc = alloc;
      function store(memory, offset, value) {
        memory.setUint64(offset, value);
      }
      $u642.store = store;
      function lowerFlat(result2, _memory, value) {
        if (value < $u642.LOW_VALUE) {
          throw new Error(`Invalid u64 value ${value}`);
        }
        result2.push(value);
      }
      $u642.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $u642.alignment);
        src.assertAlignment(src_offset, $u642.alignment);
        src.copyBytes(src_offset, $u642.size, dest, dest_offset);
      }
      $u642.copy = copy;
    })($u64 || ($u64 = {}));
    exports2.u64 = $u64;
    var $s8;
    (function($s82) {
      $s82.kind = ComponentModelTypeKind.s8;
      $s82.size = 1;
      $s82.alignment = Alignment.byte;
      $s82.flatTypes = [$i32];
      const LOW_VALUE = -128;
      const HIGH_VALUE = 127;
      function load(memory, offset) {
        return memory.getInt8(offset);
      }
      $s82.load = load;
      function liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < $u8.LOW_VALUE || value > $u8.HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid u8 value ${value}`);
        }
        if (value <= HIGH_VALUE) {
          return value;
        } else {
          return value - 256;
        }
      }
      $s82.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($s82.alignment, $s82.size);
      }
      $s82.alloc = alloc;
      function store(memory, offset, value) {
        memory.setInt8(offset, value);
      }
      $s82.store = store;
      function lowerFlat(result2, _memory, value) {
        if (value < LOW_VALUE || value > HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid s8 value ${value}`);
        }
        result2.push(value < 0 ? value + 256 : value);
      }
      $s82.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $s82.alignment);
        src.assertAlignment(src_offset, $s82.alignment);
        src.copyBytes(src_offset, $s82.size, dest, dest_offset);
      }
      $s82.copy = copy;
    })($s8 || ($s8 = {}));
    exports2.s8 = $s8;
    var $s16;
    (function($s162) {
      $s162.kind = ComponentModelTypeKind.s16;
      $s162.size = 2;
      $s162.alignment = Alignment.halfWord;
      $s162.flatTypes = [$i32];
      const LOW_VALUE = -32768;
      const HIGH_VALUE = 32767;
      function load(memory, offset) {
        return memory.getInt16(offset);
      }
      $s162.load = load;
      function liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < $u16.LOW_VALUE || value > $u16.HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid s16 value ${value}`);
        }
        return value <= HIGH_VALUE ? value : value - 65536;
      }
      $s162.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($s162.alignment, $s162.size);
      }
      $s162.alloc = alloc;
      function store(memory, offset, value) {
        memory.setInt16(offset, value);
      }
      $s162.store = store;
      function lowerFlat(result2, _memory, value) {
        if (value < LOW_VALUE || value > HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid s16 value ${value}`);
        }
        result2.push(value < 0 ? value + 65536 : value);
      }
      $s162.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $s162.alignment);
        src.assertAlignment(src_offset, $s162.alignment);
        src.copyBytes(src_offset, $s162.size, dest, dest_offset);
      }
      $s162.copy = copy;
    })($s16 || ($s16 = {}));
    exports2.s16 = $s16;
    var $s32;
    (function($s322) {
      $s322.kind = ComponentModelTypeKind.s32;
      $s322.size = 4;
      $s322.alignment = Alignment.word;
      $s322.flatTypes = [$i32];
      const LOW_VALUE = -2147483648;
      const HIGH_VALUE = 2147483647;
      function load(memory, offset) {
        return memory.getInt32(offset);
      }
      $s322.load = load;
      function liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < $u32.LOW_VALUE || value > $u32.HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid s32 value ${value}`);
        }
        return value <= HIGH_VALUE ? value : value - 4294967296;
      }
      $s322.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($s322.alignment, $s322.size);
      }
      $s322.alloc = alloc;
      function store(memory, offset, value) {
        memory.setInt32(offset, value);
      }
      $s322.store = store;
      function lowerFlat(result2, _memory, value) {
        if (value < LOW_VALUE || value > HIGH_VALUE || !Number.isInteger(value)) {
          throw new Error(`Invalid s32 value ${value}`);
        }
        result2.push(value < 0 ? value + 4294967296 : value);
      }
      $s322.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $s322.alignment);
        src.assertAlignment(src_offset, $s322.alignment);
        src.copyBytes(src_offset, $s322.size, dest, dest_offset);
      }
      $s322.copy = copy;
    })($s32 || ($s32 = {}));
    exports2.s32 = $s32;
    var $s64;
    (function($s642) {
      $s642.kind = ComponentModelTypeKind.s64;
      $s642.size = 8;
      $s642.alignment = Alignment.doubleWord;
      $s642.flatTypes = [$i64];
      const LOW_VALUE = -9223372036854775808n;
      const HIGH_VALUE = 9223372036854775807n;
      function load(memory, offset) {
        return memory.getInt64(offset);
      }
      $s642.load = load;
      function liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < $u64.LOW_VALUE) {
          throw new Error(`Invalid s64 value ${value}`);
        }
        return value <= HIGH_VALUE ? value : value - 18446744073709551616n;
      }
      $s642.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($s642.alignment, $s642.size);
      }
      $s642.alloc = alloc;
      function store(memory, offset, value) {
        memory.setInt64(offset, value);
      }
      $s642.store = store;
      function lowerFlat(result2, _memory, value) {
        if (value < LOW_VALUE || value > HIGH_VALUE) {
          throw new Error(`Invalid s64 value ${value}`);
        }
        result2.push(value < 0 ? value + 18446744073709551616n : value);
      }
      $s642.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $s642.alignment);
        src.assertAlignment(src_offset, $s642.alignment);
        src.copyBytes(src_offset, $s642.size, dest, dest_offset);
      }
      $s642.copy = copy;
    })($s64 || ($s64 = {}));
    exports2.s64 = $s64;
    var $float32;
    (function($float322) {
      $float322.kind = ComponentModelTypeKind.float32;
      $float322.size = 4;
      $float322.alignment = Alignment.word;
      $float322.flatTypes = [$f32];
      const LOW_VALUE = -34028234663852886e22;
      const HIGH_VALUE = 34028234663852886e22;
      const NAN = 2143289344;
      function load(memory, offset) {
        return memory.getFloat32(offset);
      }
      $float322.load = load;
      function liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < LOW_VALUE || value > HIGH_VALUE) {
          throw new Error(`Invalid float32 value ${value}`);
        }
        return value === NAN ? Number.NaN : value;
      }
      $float322.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($float322.alignment, $float322.size);
      }
      $float322.alloc = alloc;
      function store(memory, offset, value) {
        memory.setFloat32(offset, value);
      }
      $float322.store = store;
      function lowerFlat(result2, _memory, value) {
        if (value < LOW_VALUE || value > HIGH_VALUE) {
          throw new Error(`Invalid float32 value ${value}`);
        }
        result2.push(Number.isNaN(value) ? NAN : value);
      }
      $float322.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $float322.alignment);
        src.assertAlignment(src_offset, $float322.alignment);
        src.copyBytes(src_offset, $float322.size, dest, dest_offset);
      }
      $float322.copy = copy;
    })($float32 || ($float32 = {}));
    exports2.float32 = $float32;
    var $float64;
    (function($float642) {
      $float642.kind = ComponentModelTypeKind.float64;
      $float642.size = 8;
      $float642.alignment = Alignment.doubleWord;
      $float642.flatTypes = [$f64];
      const LOW_VALUE = -1 * Number.MAX_VALUE;
      const HIGH_VALUE = Number.MAX_VALUE;
      const NAN = 9221120237041091e3;
      function load(memory, offset) {
        return memory.getFloat64(offset);
      }
      $float642.load = load;
      function liftFlat(_memory, values) {
        const value = values.next().value;
        if (value < LOW_VALUE || value > HIGH_VALUE) {
          throw new Error(`Invalid float64 value ${value}`);
        }
        return value === NAN ? Number.NaN : value;
      }
      $float642.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($float642.alignment, $float642.size);
      }
      $float642.alloc = alloc;
      function store(memory, offset, value) {
        memory.setFloat64(offset, value);
      }
      $float642.store = store;
      function lowerFlat(result2, _memory, value) {
        if (value < LOW_VALUE || value > HIGH_VALUE) {
          throw new Error(`Invalid float64 value ${value}`);
        }
        result2.push(Number.isNaN(value) ? NAN : value);
      }
      $float642.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $float642.alignment);
        src.assertAlignment(src_offset, $float642.alignment);
        src.copyBytes(src_offset, $float642.size, dest, dest_offset);
      }
      $float642.copy = copy;
    })($float64 || ($float64 = {}));
    exports2.float64 = $float64;
    exports2.byte = {
      kind: exports2.u8.kind,
      size: exports2.u8.size,
      alignment: exports2.u8.alignment,
      flatTypes: exports2.u8.flatTypes,
      load: exports2.u8.load,
      liftFlat: exports2.u8.liftFlat,
      alloc: exports2.u8.alloc,
      store: exports2.u8.store,
      lowerFlat: exports2.u8.lowerFlat,
      copy: exports2.u8.copy
    };
    exports2.size = {
      kind: exports2.u32.kind,
      size: exports2.u32.size,
      alignment: exports2.u32.alignment,
      flatTypes: exports2.u32.flatTypes,
      load: exports2.u32.load,
      liftFlat: exports2.u32.liftFlat,
      alloc: exports2.u32.alloc,
      store: exports2.u32.store,
      lowerFlat: exports2.u32.lowerFlat,
      copy: exports2.u32.copy
    };
    exports2.ptr = {
      kind: exports2.u32.kind,
      size: exports2.u32.size,
      alignment: exports2.u32.alignment,
      flatTypes: exports2.u32.flatTypes,
      load: exports2.u32.load,
      liftFlat: exports2.u32.liftFlat,
      alloc: exports2.u32.alloc,
      store: exports2.u32.store,
      lowerFlat: exports2.u32.lowerFlat,
      copy: exports2.u32.copy
    };
    var $wchar;
    (function($wchar2) {
      $wchar2.kind = ComponentModelTypeKind.char;
      $wchar2.size = 4;
      $wchar2.alignment = Alignment.word;
      $wchar2.flatTypes = [$i32];
      function load(memory, offset, context) {
        return fromCodePoint(exports2.u32.load(memory, offset, context));
      }
      $wchar2.load = load;
      function liftFlat(memory, values, context) {
        return fromCodePoint(exports2.u32.liftFlat(memory, values, context));
      }
      $wchar2.liftFlat = liftFlat;
      function alloc(memory) {
        return exports2.u32.alloc(memory);
      }
      $wchar2.alloc = alloc;
      function store(memory, offset, value, context) {
        exports2.u32.store(memory, offset, asCodePoint(value), context);
      }
      $wchar2.store = store;
      function lowerFlat(result2, memory, value, context) {
        exports2.u32.lowerFlat(result2, memory, asCodePoint(value), context);
      }
      $wchar2.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, $wchar2.alignment);
        src.assertAlignment(src_offset, $wchar2.alignment);
        src.copyBytes(src_offset, $wchar2.size, dest, dest_offset);
      }
      $wchar2.copy = copy;
      function fromCodePoint(code) {
        if (code >= 1114112 || 55296 <= code && code <= 57343) {
          throw new ComponentModelTrap("Invalid code point");
        }
        return String.fromCodePoint(code);
      }
      function asCodePoint(str) {
        if (str.length !== 1) {
          throw new ComponentModelTrap("String length must be 1");
        }
        const code = str.codePointAt(0);
        if (!(code <= 55295 || 55296 <= code && code <= 1114111)) {
          throw new ComponentModelTrap("Invalid code point");
        }
        return code;
      }
    })($wchar || ($wchar = {}));
    exports2.wchar = $wchar;
    var $wstring;
    (function($wstring2) {
      const offsets = {
        data: 0,
        codeUnits: 4
      };
      $wstring2.kind = ComponentModelTypeKind.string;
      $wstring2.size = 8;
      $wstring2.alignment = Alignment.word;
      $wstring2.flatTypes = [$i32, $i32];
      function load(memRange, offset, context) {
        const dataPtr = memRange.getUint32(offset + offsets.data);
        const codeUnits = memRange.getUint32(offset + offsets.codeUnits);
        return loadFromRange(memRange.memory, dataPtr, codeUnits, context.options);
      }
      $wstring2.load = load;
      function liftFlat(memory, values, context) {
        const dataPtr = values.next().value;
        const codeUnits = values.next().value;
        return loadFromRange(memory, dataPtr, codeUnits, context.options);
      }
      $wstring2.liftFlat = liftFlat;
      function alloc(memory) {
        return memory.alloc($wstring2.alignment, $wstring2.size);
      }
      $wstring2.alloc = alloc;
      function store(memory, offset, str, context) {
        const [ptr, codeUnits] = storeIntoRange(memory.memory, str, context.options);
        memory.setUint32(offset + offsets.data, ptr);
        memory.setUint32(offset + offsets.codeUnits, codeUnits);
      }
      $wstring2.store = store;
      function lowerFlat(result2, memory, str, context) {
        result2.push(...storeIntoRange(memory, str, context.options));
      }
      $wstring2.lowerFlat = lowerFlat;
      function copy(dest, dest_offset, src, src_offset, context) {
        dest.assertAlignment(dest_offset, $wstring2.alignment);
        src.assertAlignment(src_offset, $wstring2.alignment);
        src.copyBytes(src_offset, $wstring2.size, dest, dest_offset);
        const data = src.getUint32(src_offset + offsets.data);
        const codeUnits = src.getUint32(src_offset + offsets.codeUnits);
        const [alignment, byteLength] = getAlignmentAndByteLength(codeUnits, context.options);
        const srcReader = src.memory.readonly(data, byteLength);
        const destWriter = dest.memory.alloc(alignment, byteLength);
        srcReader.copyBytes(0, byteLength, destWriter, 0);
      }
      $wstring2.copy = copy;
      function getAlignmentAndByteLength(codeUnits, options) {
        const encoding = options.encoding;
        if (encoding === "latin1+utf-16") {
          throw new Error("latin1+utf-16 encoding not yet supported");
        }
        if (encoding === "utf-8") {
          return [exports2.u8.alignment, codeUnits];
        } else if (encoding === "utf-16") {
          return [exports2.u16.alignment, codeUnits * 2];
        } else {
          throw new Error("Unsupported encoding");
        }
      }
      $wstring2.getAlignmentAndByteLength = getAlignmentAndByteLength;
      function loadFromRange(memory, data, codeUnits, options) {
        const encoding = options.encoding;
        if (encoding === "latin1+utf-16") {
          throw new Error("latin1+utf-16 encoding not yet supported");
        }
        if (encoding === "utf-8") {
          const byteLength = codeUnits;
          const reader = memory.readonly(data, byteLength);
          return utf8Decoder.decode(reader.getUint8Array(0, byteLength));
        } else if (encoding === "utf-16") {
          const reader = memory.readonly(data, codeUnits * 2);
          return String.fromCharCode(...reader.getUint16Array(data, codeUnits));
        } else {
          throw new Error("Unsupported encoding");
        }
      }
      function storeIntoRange(memory, str, options) {
        const { encoding } = options;
        if (encoding === "latin1+utf-16") {
          throw new Error("latin1+utf-16 encoding not yet supported");
        }
        if (encoding === "utf-8") {
          const data = utf8Encoder.encode(str);
          const writer = memory.alloc(exports2.u8.alignment, data.length);
          writer.setUint8Array(0, data);
          return [writer.ptr, data.length];
        } else if (encoding === "utf-16") {
          const writer = memory.alloc(exports2.u16.alignment, str.length * 2);
          const data = writer.getUint16View(0);
          for (let i = 0; i < str.length; i++) {
            data[i] = str.charCodeAt(i);
          }
          return [writer.ptr, data.length];
        } else {
          throw new Error("Unsupported encoding");
        }
      }
    })($wstring || ($wstring = {}));
    exports2.wstring = $wstring;
    var _ListType = class _ListType {
      constructor(elementType) {
        __publicField(this, "elementType");
        __publicField(this, "kind");
        __publicField(this, "size");
        __publicField(this, "alignment");
        __publicField(this, "flatTypes");
        this.elementType = elementType;
        this.kind = ComponentModelTypeKind.list;
        this.size = 8;
        this.alignment = Alignment.word;
        this.flatTypes = [$i32, $i32];
      }
      load(memRange, offset, context) {
        const offsets = _ListType.offsets;
        const dataPtr = memRange.getUint32(offset + offsets.data);
        const length = memRange.getUint32(offset + offsets.length);
        return this.loadFromRange(memRange.memory.readonly(dataPtr, length * this.elementType.size), length, context);
      }
      liftFlat(memory, values, context) {
        const dataPtr = values.next().value;
        const length = values.next().value;
        return this.loadFromRange(memory.readonly(dataPtr, length * this.elementType.size), length, context);
      }
      alloc(memory) {
        return memory.alloc(this.alignment, this.size);
      }
      store(memRange, offset, values, context) {
        const elementMemory = memRange.memory.alloc(this.elementType.alignment, this.elementType.size * values.length);
        this.storeIntoRange(elementMemory, values, context);
        const offsets = _ListType.offsets;
        memRange.setUint32(offset + offsets.data, elementMemory.ptr);
        memRange.setUint32(offset + offsets.length, values.length);
      }
      lowerFlat(result2, memory, values, context) {
        const elementMemory = memory.alloc(this.elementType.alignment, this.elementType.size * values.length);
        this.storeIntoRange(elementMemory, values, context);
        result2.push(elementMemory.ptr, values.length);
      }
      copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, this.alignment);
        src.assertAlignment(src_offset, this.alignment);
        const offsets = _ListType.offsets;
        src.copyBytes(src_offset, this.size, dest, dest_offset);
        const data = src.getUint32(src_offset + offsets.data);
        const byteLength = src.getUint32(src_offset + offsets.length) * this.elementType.size;
        const srcReader = src.memory.readonly(data, byteLength);
        const destWriter = dest.memory.alloc(this.elementType.alignment, byteLength);
        srcReader.copyBytes(0, byteLength, destWriter, 0);
      }
      loadFromRange(memory, length, context) {
        const result2 = [];
        let offset = 0;
        for (let i = 0; i < length; i++) {
          result2.push(this.elementType.load(memory, offset, context));
          offset += this.elementType.size;
        }
        return result2;
      }
      storeIntoRange(memory, values, context) {
        let offset = 0;
        for (const item of values) {
          this.elementType.store(memory, offset, item, context);
          offset += this.elementType.size;
        }
      }
    };
    __publicField(_ListType, "offsets", {
      data: 0,
      length: 4
    });
    var ListType = _ListType;
    exports2.ListType = ListType;
    var _TypeArrayType = class _TypeArrayType {
      constructor(elementType) {
        __publicField(this, "kind");
        __publicField(this, "size");
        __publicField(this, "alignment");
        __publicField(this, "flatTypes");
        __publicField(this, "elementType");
        this.kind = ComponentModelTypeKind.list;
        this.size = 8;
        this.alignment = 4;
        this.flatTypes = [$i32, $i32];
        this.elementType = elementType;
      }
      load(memRange, offset) {
        const offsets = _TypeArrayType.offsets;
        const dataPtr = memRange.getUint32(offset + offsets.data);
        const length = memRange.getUint32(offset + offsets.length);
        return this.loadFromRange(memRange.memory.readonly(dataPtr, length * this.elementType.size), length);
      }
      liftFlat(memory, values) {
        const dataPtr = values.next().value;
        const length = values.next().value;
        return this.loadFromRange(memory.readonly(dataPtr, length * this.elementType.size), length);
      }
      alloc(memory) {
        return memory.alloc(this.alignment, this.size);
      }
      store(memRange, offset, value) {
        const writer = memRange.memory.alloc(this.elementType.alignment, value.byteLength);
        this.storeIntoRange(writer, value);
        const offsets = _TypeArrayType.offsets;
        memRange.setUint32(offset + offsets.data, writer.ptr);
        memRange.setUint32(offset + offsets.length, value.length);
      }
      lowerFlat(result2, memory, value) {
        const writer = memory.alloc(this.elementType.alignment, value.byteLength);
        this.storeIntoRange(writer, value);
        result2.push(writer.ptr, value.length);
      }
      copy(dest, dest_offset, src, src_offset) {
        dest.assertAlignment(dest_offset, this.alignment);
        src.assertAlignment(src_offset, this.alignment);
        const offsets = _TypeArrayType.offsets;
        src.copyBytes(src_offset, this.size, dest, dest_offset);
        const data = src.getUint32(src_offset + offsets.data);
        const byteLength = src.getUint32(src_offset + offsets.length) * this.elementType.size;
        const srcReader = src.memory.readonly(data, byteLength);
        const destWriter = dest.memory.alloc(this.elementType.alignment, byteLength);
        srcReader.copyBytes(0, byteLength, destWriter, 0);
      }
    };
    __publicField(_TypeArrayType, "offsets", {
      data: 0,
      length: 4
    });
    var TypeArrayType = _TypeArrayType;
    var Int8ArrayType = class extends TypeArrayType {
      constructor() {
        super($s8);
      }
      loadFromRange(memory, length) {
        return memory.getInt8Array(0, length);
      }
      storeIntoRange(memory, value) {
        memory.setInt8Array(0, value);
      }
    };
    exports2.Int8ArrayType = Int8ArrayType;
    var Int16ArrayType = class extends TypeArrayType {
      constructor() {
        super($s16);
      }
      loadFromRange(memory, length) {
        return memory.getInt16Array(0, length);
      }
      storeIntoRange(memory, value) {
        memory.setInt16Array(0, value);
      }
    };
    exports2.Int16ArrayType = Int16ArrayType;
    var Int32ArrayType = class extends TypeArrayType {
      constructor() {
        super($s32);
      }
      loadFromRange(memory, length) {
        return memory.getInt32Array(0, length);
      }
      storeIntoRange(memory, value) {
        memory.setInt32Array(0, value);
      }
    };
    exports2.Int32ArrayType = Int32ArrayType;
    var BigInt64ArrayType = class extends TypeArrayType {
      constructor() {
        super($s64);
      }
      loadFromRange(memory, length) {
        return memory.getInt64Array(0, length);
      }
      storeIntoRange(memory, value) {
        memory.setInt64Array(0, value);
      }
    };
    exports2.BigInt64ArrayType = BigInt64ArrayType;
    var Uint8ArrayType = class extends TypeArrayType {
      constructor() {
        super($u8);
      }
      loadFromRange(memory, length) {
        return memory.getUint8Array(0, length);
      }
      storeIntoRange(memory, value) {
        memory.setUint8Array(0, value);
      }
    };
    exports2.Uint8ArrayType = Uint8ArrayType;
    var Uint16ArrayType = class extends TypeArrayType {
      constructor() {
        super($u16);
      }
      loadFromRange(memory, length) {
        return memory.getUint16Array(0, length);
      }
      storeIntoRange(memory, value) {
        memory.setUint16Array(0, value);
      }
    };
    exports2.Uint16ArrayType = Uint16ArrayType;
    var Uint32ArrayType = class extends TypeArrayType {
      constructor() {
        super($u32);
      }
      loadFromRange(memory, length) {
        return memory.getUint32Array(0, length);
      }
      storeIntoRange(memory, value) {
        memory.setUint32Array(0, value);
      }
    };
    exports2.Uint32ArrayType = Uint32ArrayType;
    var BigUint64ArrayType = class extends TypeArrayType {
      constructor() {
        super($u64);
      }
      loadFromRange(memory, length) {
        return memory.getUint64Array(0, length);
      }
      storeIntoRange(memory, value) {
        memory.setUint64Array(0, value);
      }
    };
    exports2.BigUint64ArrayType = BigUint64ArrayType;
    var Float32ArrayType = class extends TypeArrayType {
      constructor() {
        super($float32);
      }
      loadFromRange(memory, length) {
        return memory.getFloat32Array(0, length);
      }
      storeIntoRange(memory, value) {
        memory.setFloat32Array(0, value);
      }
    };
    exports2.Float32ArrayType = Float32ArrayType;
    var Float64ArrayType = class extends TypeArrayType {
      constructor() {
        super($float64);
      }
      loadFromRange(memory, length) {
        return memory.getFloat64Array(0, length);
      }
      storeIntoRange(memory, value) {
        memory.setFloat64Array(0, value);
      }
    };
    exports2.Float64ArrayType = Float64ArrayType;
    var BaseRecordType = class _BaseRecordType {
      constructor(fields, kind) {
        __publicField(this, "fields");
        __publicField(this, "kind");
        __publicField(this, "size");
        __publicField(this, "alignment");
        __publicField(this, "flatTypes");
        this.fields = fields;
        this.kind = kind;
        this.alignment = _BaseRecordType.alignment(fields);
        this.size = _BaseRecordType.size(fields, this.alignment);
        this.flatTypes = _BaseRecordType.flatTypes(fields);
      }
      load(memory, offset, context) {
        memory.assertAlignment(offset, this.alignment);
        const result2 = [];
        for (const field of this.fields) {
          offset = align(offset, field.type.alignment);
          result2.push(field.type.load(memory, offset, context));
          offset += field.type.size;
        }
        return this.create(this.fields, result2);
      }
      liftFlat(memory, values, context) {
        const result2 = [];
        for (const field of this.fields) {
          result2.push(field.type.liftFlat(memory, values, context));
        }
        return this.create(this.fields, result2);
      }
      alloc(memory) {
        return memory.alloc(this.alignment, this.size);
      }
      store(memory, offset, record, context) {
        memory.assertAlignment(offset, this.alignment);
        const values = this.elements(record, this.fields);
        for (let i = 0; i < this.fields.length; i++) {
          const field = this.fields[i];
          const value = values[i];
          offset = align(offset, field.type.alignment);
          field.type.store(memory, offset, value, context);
          offset += field.type.size;
        }
      }
      lowerFlat(result2, memory, record, context) {
        const values = this.elements(record, this.fields);
        for (let i = 0; i < this.fields.length; i++) {
          const field = this.fields[i];
          const value = values[i];
          field.type.lowerFlat(result2, memory, value, context);
        }
      }
      copy(dest, dest_offset, src, src_offset, context) {
        for (const field of this.fields) {
          dest_offset = align(dest_offset, field.type.alignment);
          src_offset = align(src_offset, field.type.alignment);
          field.type.copy(dest, dest_offset, src, src_offset, context);
          dest_offset += field.type.size;
          src_offset += field.type.size;
        }
      }
      static size(fields, recordAlignment) {
        let result2 = 0;
        for (const field of fields) {
          result2 = align(result2, field.type.alignment);
          result2 += field.type.size;
        }
        return align(result2, recordAlignment);
      }
      static alignment(fields) {
        let result2 = 1;
        for (const field of fields) {
          result2 = Math.max(result2, field.type.alignment);
        }
        return result2;
      }
      static flatTypes(fields) {
        const result2 = [];
        for (const field of fields) {
          result2.push(...field.type.flatTypes);
        }
        return result2;
      }
    };
    var RecordField;
    (function(RecordField2) {
      function create(name, type) {
        return { name, type };
      }
      RecordField2.create = create;
    })(RecordField || (RecordField = {}));
    var RecordType2 = class extends BaseRecordType {
      constructor(fields) {
        const recordFields = [];
        for (const [name, type] of fields) {
          recordFields.push(RecordField.create(name, type));
        }
        super(recordFields, ComponentModelTypeKind.record);
      }
      create(fields, values) {
        const result2 = {};
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          const value = values[i];
          result2[field.name] = value;
        }
        return result2;
      }
      elements(record, fields) {
        const result2 = [];
        for (const field of fields) {
          const value = record[field.name];
          result2.push(value);
        }
        return result2;
      }
    };
    exports2.RecordType = RecordType2;
    var TupleField;
    (function(TupleField2) {
      function create(type) {
        return { type };
      }
      TupleField2.create = create;
    })(TupleField || (TupleField = {}));
    var TupleType = class extends BaseRecordType {
      constructor(fields) {
        const tupleFields = [];
        for (const type of fields) {
          tupleFields.push(TupleField.create(type));
        }
        super(tupleFields, ComponentModelTypeKind.tuple);
      }
      create(_fields, values) {
        return values;
      }
      elements(record, _fields) {
        return record;
      }
    };
    exports2.TupleType = TupleType;
    var FlagsType = class _FlagsType {
      constructor(numberOfFlags) {
        __publicField(this, "type");
        __publicField(this, "arraySize");
        __publicField(this, "kind");
        __publicField(this, "size");
        __publicField(this, "alignment");
        __publicField(this, "flatTypes");
        this.kind = ComponentModelTypeKind.flags;
        this.size = _FlagsType.size(numberOfFlags);
        this.alignment = _FlagsType.alignment(numberOfFlags);
        this.flatTypes = _FlagsType.flatTypes(numberOfFlags);
        this.type = _FlagsType.getType(numberOfFlags);
        this.arraySize = _FlagsType.num32Flags(numberOfFlags);
      }
      load(memory, offset, context) {
        return this.type === void 0 ? 0 : this.loadFrom(this.type.load(memory, offset, context));
      }
      liftFlat(memory, values, context) {
        return this.type === void 0 ? 0 : this.loadFrom(this.type.liftFlat(memory, values, context));
      }
      loadFrom(value) {
        if (typeof value === "number") {
          return value;
        } else {
          let result2 = 0n;
          for (let f = 0, i = value.length - 1; f < value.length; f++, i--) {
            const bits = value[i];
            result2 = result2 | BigInt(bits) << BigInt(f * 32);
          }
          return result2;
        }
      }
      alloc(memory) {
        return memory.alloc(this.alignment, this.size);
      }
      store(memory, offset, flags, context) {
        if (this.type !== void 0) {
          this.type.store(memory, offset, this.storeInto(flags), context);
        }
      }
      lowerFlat(result2, _memory, flags, context) {
        if (this.type !== void 0) {
          this.type.lowerFlat(result2, _memory, this.storeInto(flags), context);
        }
      }
      copy(dest, dest_offset, src, src_offset, context) {
        if (this.type !== void 0) {
          this.type.copy(dest, dest_offset, src, src_offset, context);
        }
      }
      storeInto(value) {
        if (typeof value === "number") {
          return value;
        } else {
          const result2 = new Array(this.arraySize).fill(0);
          for (let f = 0, i = result2.length - 1; f < result2.length; f++, i--) {
            const bits = Number(value >> BigInt(f * 32) & BigInt(4294967295));
            result2[i] = bits;
          }
          return result2;
        }
      }
      static size(numberOfFlags) {
        if (numberOfFlags === 0) {
          return 0;
        } else if (numberOfFlags <= 8) {
          return 1;
        } else if (numberOfFlags <= 16) {
          return 2;
        } else {
          return 4 * this.num32Flags(numberOfFlags);
        }
      }
      static alignment(numberOfFlags) {
        if (numberOfFlags <= 8) {
          return 1;
        } else if (numberOfFlags <= 16) {
          return 2;
        } else {
          return 4;
        }
      }
      static getType(numberOfFlags) {
        if (numberOfFlags === 0) {
          return void 0;
        } else if (numberOfFlags <= 8) {
          return exports2.u8;
        } else if (numberOfFlags <= 16) {
          return exports2.u16;
        } else if (numberOfFlags <= 32) {
          return exports2.u32;
        } else {
          return new TupleType(new Array(this.num32Flags(numberOfFlags)).fill(exports2.u32));
        }
      }
      static flatTypes(numberOfFlags) {
        return new Array(this.num32Flags(numberOfFlags)).fill($i32);
      }
      static num32Flags(numberOfFlags) {
        return Math.ceil(numberOfFlags / 32);
      }
    };
    exports2.FlagsType = FlagsType;
    var VariantCase;
    (function(VariantCase2) {
      function create(index, tag, type) {
        return { index, tag, type, wantFlatTypes: type !== void 0 ? [] : void 0 };
      }
      VariantCase2.create = create;
    })(VariantCase || (VariantCase = {}));
    var VariantType2 = class _VariantType {
      constructor(variants, ctor, kind = ComponentModelTypeKind.variant) {
        __publicField(this, "cases");
        __publicField(this, "case2Index");
        __publicField(this, "ctor");
        __publicField(this, "discriminantType");
        __publicField(this, "maxCaseAlignment");
        __publicField(this, "kind");
        __publicField(this, "size");
        __publicField(this, "alignment");
        __publicField(this, "flatTypes");
        const cases = [];
        this.case2Index = /* @__PURE__ */ new Map();
        for (let i = 0; i < variants.length; i++) {
          const type = variants[i][1];
          const name = variants[i][0];
          this.case2Index.set(name, i);
          cases.push(VariantCase.create(i, name, type));
        }
        this.cases = cases;
        this.ctor = ctor;
        this.discriminantType = _VariantType.discriminantType(cases.length);
        this.maxCaseAlignment = _VariantType.maxCaseAlignment(cases);
        this.kind = kind;
        this.size = _VariantType.size(this.discriminantType, cases);
        this.alignment = _VariantType.alignment(this.discriminantType, cases);
        this.flatTypes = _VariantType.flatTypes(this.discriminantType, cases);
      }
      load(memory, offset, context) {
        const caseIndex = this.discriminantType.load(memory, offset, context);
        const caseVariant = this.cases[caseIndex];
        if (caseVariant.type === void 0) {
          return this.ctor(caseVariant.tag, void 0);
        } else {
          offset += this.discriminantType.size;
          offset = align(offset, this.maxCaseAlignment);
          const value = caseVariant.type.load(memory, offset, context);
          return this.ctor(caseVariant.tag, value);
        }
      }
      liftFlat(memory, values, context) {
        let valuesToReadOver = this.flatTypes.length - 1;
        const caseIndex = this.discriminantType.liftFlat(memory, values, context);
        const caseVariant = this.cases[caseIndex];
        let result2;
        if (caseVariant.type === void 0) {
          result2 = this.ctor(caseVariant.tag, void 0);
        } else {
          const wantFlatTypes = caseVariant.wantFlatTypes;
          const iter = new CoerceValueIter(values, this.flatTypes.slice(1), wantFlatTypes);
          const value = caseVariant.type.liftFlat(memory, iter, context);
          result2 = this.ctor(caseVariant.tag, value);
          valuesToReadOver = valuesToReadOver - wantFlatTypes.length;
        }
        for (let i = 0; i < valuesToReadOver; i++) {
          values.next();
        }
        return result2;
      }
      alloc(memory) {
        return memory.alloc(this.alignment, this.size);
      }
      store(memory, offset, variantValue, context) {
        const index = this.case2Index.get(variantValue.tag);
        if (index === void 0) {
          throw new ComponentModelTrap(`Variant case ${variantValue.tag} not found`);
        }
        this.discriminantType.store(memory, offset, index, context);
        offset += this.discriminantType.size;
        const c = this.cases[index];
        if (c.type !== void 0 && variantValue.value !== void 0) {
          offset = align(offset, this.maxCaseAlignment);
          c.type.store(memory, offset, variantValue.value, context);
        }
      }
      lowerFlat(result2, memory, variantValue, context) {
        const flatTypes = this.flatTypes;
        const index = this.case2Index.get(variantValue.tag);
        if (index === void 0) {
          throw new ComponentModelTrap(`Variant case ${variantValue.tag} not found`);
        }
        this.discriminantType.lowerFlat(result2, memory, index, context);
        const c = this.cases[index];
        let valuesToFill = this.flatTypes.length - 1;
        if (c.type !== void 0 && variantValue.value !== void 0) {
          const payload = [];
          c.type.lowerFlat(payload, memory, variantValue.value, context);
          const wantTypes = flatTypes.slice(1);
          const haveTypes = c.wantFlatTypes;
          if (payload.length !== haveTypes.length) {
            throw new ComponentModelTrap("Mismatched flat types");
          }
          for (let i = 0; i < wantTypes.length; i++) {
            const have = haveTypes[i];
            const want = wantTypes[i];
            if (have === $f32 && want === $i32) {
              payload[i] = WasmTypes.reinterpret_f32_as_i32(payload[i]);
            } else if (have === $i32 && want === $i64) {
              payload[i] = WasmTypes.convert_i32_to_i64(payload[i]);
            } else if (have === $f32 && want === $i64) {
              payload[i] = WasmTypes.reinterpret_f32_as_i64(payload[i]);
            } else if (have === $f64 && want === $i64) {
              payload[i] = WasmTypes.reinterpret_f64_as_i64(payload[i]);
            }
          }
          valuesToFill = valuesToFill - payload.length;
          result2.push(...payload);
        }
        for (let i = flatTypes.length - valuesToFill; i < flatTypes.length; i++) {
          const type = flatTypes[i];
          if (type === $i64) {
            result2.push(0n);
          } else {
            result2.push(0);
          }
        }
      }
      copy(dest, dest_offset, src, src_offset, context) {
        this.discriminantType.copy(dest, dest_offset, src, src_offset, context);
        const caseIndex = this.discriminantType.load(src, src_offset, context);
        const caseVariant = this.cases[caseIndex];
        if (caseVariant.type === void 0) {
          return;
        }
        src_offset += this.discriminantType.size;
        src_offset = align(src_offset, this.maxCaseAlignment);
        dest_offset += this.discriminantType.size;
        dest_offset = align(dest_offset, this.maxCaseAlignment);
        caseVariant.type.copy(dest, dest_offset, src, src_offset, context);
      }
      static size(discriminantType, cases) {
        let result2 = discriminantType.size;
        result2 = align(result2, this.maxCaseAlignment(cases));
        return result2 + this.maxCaseSize(cases);
      }
      static alignment(discriminantType, cases) {
        return Math.max(discriminantType.alignment, this.maxCaseAlignment(cases));
      }
      static flatTypes(discriminantType, cases) {
        const flat = [];
        for (const c of cases) {
          if (c.type === void 0) {
            continue;
          }
          const flatTypes = c.type.flatTypes;
          for (let i = 0; i < flatTypes.length; i++) {
            const want = flatTypes[i];
            if (i < flat.length) {
              const use = this.joinFlatType(flat[i], want);
              flat[i] = use;
              c.wantFlatTypes.push(want);
            } else {
              flat.push(want);
              c.wantFlatTypes.push(want);
            }
          }
        }
        return [...discriminantType.flatTypes, ...flat];
      }
      static discriminantType(cases) {
        switch (Math.ceil(Math.log2(cases) / 8)) {
          case 0:
            return exports2.u8;
          case 1:
            return exports2.u8;
          case 2:
            return exports2.u16;
          case 3:
            return exports2.u32;
        }
        throw new ComponentModelTrap(`Too many cases: ${cases}`);
      }
      static maxCaseAlignment(cases) {
        let result2 = 1;
        for (const c of cases) {
          if (c.type !== void 0) {
            result2 = Math.max(result2, c.type.alignment);
          }
        }
        return result2;
      }
      static maxCaseSize(cases) {
        let result2 = 0;
        for (const c of cases) {
          if (c.type !== void 0) {
            result2 = Math.max(result2, c.type.size);
          }
        }
        return result2;
      }
      static joinFlatType(a, b) {
        if (a === b) {
          return a;
        }
        if (a === $i32 && b === $f32 || a === $f32 && b === $i32) {
          return $i32;
        }
        return $i64;
      }
    };
    exports2.VariantType = VariantType2;
    var EnumType = class _EnumType {
      constructor(cases) {
        __publicField(this, "discriminantType");
        __publicField(this, "cases");
        __publicField(this, "case2index");
        __publicField(this, "kind");
        __publicField(this, "size");
        __publicField(this, "alignment");
        __publicField(this, "flatTypes");
        this.discriminantType = _EnumType.discriminantType(cases.length);
        this.cases = cases;
        this.case2index = /* @__PURE__ */ new Map();
        for (let i = 0; i < cases.length; i++) {
          const c = cases[i];
          this.case2index.set(c, i);
        }
        this.kind = ComponentModelTypeKind.enum;
        this.size = this.discriminantType.size;
        this.alignment = this.discriminantType.alignment;
        this.flatTypes = this.discriminantType.flatTypes;
      }
      load(memory, offset, context) {
        const index = this.assertRange(this.discriminantType.load(memory, offset, context));
        return this.cases[index];
      }
      liftFlat(memory, values, context) {
        const index = this.assertRange(this.discriminantType.liftFlat(memory, values, context));
        return this.cases[index];
      }
      alloc(memory) {
        return memory.alloc(this.alignment, this.size);
      }
      store(memory, offset, value, context) {
        const index = this.case2index.get(value);
        if (index === void 0) {
          throw new ComponentModelTrap("Enumeration value not found");
        }
        this.discriminantType.store(memory, offset, index, context);
      }
      lowerFlat(result2, memory, value, context) {
        const index = this.case2index.get(value);
        if (index === void 0) {
          throw new ComponentModelTrap("Enumeration value not found");
        }
        this.discriminantType.lowerFlat(result2, memory, index, context);
      }
      copy(dest, dest_offset, src, src_offset, context) {
        this.discriminantType.copy(dest, dest_offset, src, src_offset, context);
      }
      assertRange(value) {
        if (value < 0 || value > this.cases.length) {
          throw new ComponentModelTrap("Enumeration value out of range");
        }
        return value;
      }
      static discriminantType(cases) {
        switch (Math.ceil(Math.log2(cases) / 8)) {
          case 0:
            return exports2.u8;
          case 1:
            return exports2.u8;
          case 2:
            return exports2.u16;
          case 3:
            return exports2.u32;
        }
        throw new ComponentModelTrap(`Too many cases: ${cases}`);
      }
    };
    exports2.EnumType = EnumType;
    var option;
    (function(option2) {
      option2.none = "none";
      function None() {
        return new OptionImpl(option2.none, void 0);
      }
      option2.None = None;
      option2.some = "some";
      function Some(value) {
        return new OptionImpl(option2.some, value);
      }
      option2.Some = Some;
      function _ctor(c, v) {
        return new OptionImpl(c, v);
      }
      option2._ctor = _ctor;
      function isOption(value) {
        return value instanceof OptionImpl;
      }
      option2.isOption = isOption;
      class OptionImpl {
        constructor(tag, value) {
          __publicField(this, "_tag");
          __publicField(this, "_value");
          this._tag = tag;
          this._value = value;
        }
        get tag() {
          return this._tag;
        }
        get value() {
          return this._value;
        }
        isNone() {
          return this._tag === option2.none;
        }
        isSome() {
          return this._tag === option2.some;
        }
      }
    })(option || (exports2.option = option = {}));
    var OptionType = class {
      constructor(valueType) {
        __publicField(this, "valueType");
        __publicField(this, "kind");
        __publicField(this, "size");
        __publicField(this, "alignment");
        __publicField(this, "flatTypes");
        this.valueType = valueType;
        this.kind = ComponentModelTypeKind.option;
        this.size = this.computeSize();
        this.alignment = this.computeAlignment();
        this.flatTypes = this.computeFlatTypes();
      }
      load(memory, offset, context) {
        const caseIndex = exports2.u8.load(memory, offset, context);
        if (caseIndex === 0) {
          return context.options.keepOption ? option._ctor(option.none, void 0) : void 0;
        } else {
          offset += exports2.u8.size;
          offset = align(offset, this.alignment);
          const value = this.valueType.load(memory, offset, context);
          return context.options.keepOption ? option._ctor(option.some, value) : value;
        }
      }
      liftFlat(memory, values, context) {
        const caseIndex = exports2.u8.liftFlat(memory, values, context);
        if (caseIndex === 0) {
          for (let i = 0; i < this.valueType.flatTypes.length; i++) {
            values.next();
          }
          return context.options.keepOption ? option._ctor(option.none, void 0) : void 0;
        } else {
          const value = this.valueType.liftFlat(memory, values, context);
          return context.options.keepOption ? option._ctor(option.some, value) : value;
        }
      }
      alloc(memory) {
        return memory.alloc(this.alignment, this.size);
      }
      store(memory, offset, value, context) {
        const optValue = this.asOptionValue(value, context.options);
        const index = optValue.tag === option.none ? 0 : 1;
        exports2.u8.store(memory, offset, index, context);
        offset += exports2.u8.size;
        if (optValue.tag === option.some) {
          offset = align(offset, this.valueType.alignment);
          this.valueType.store(memory, offset, optValue.value, context);
        }
      }
      lowerFlat(result2, memory, value, context) {
        const optValue = this.asOptionValue(value, context.options);
        const index = optValue.tag === option.none ? 0 : 1;
        exports2.u8.lowerFlat(result2, memory, index, context);
        if (optValue.tag === option.none) {
          for (const type of this.valueType.flatTypes) {
            if (type === $i64) {
              result2.push(0n);
            } else {
              result2.push(0);
            }
          }
        } else {
          this.valueType.lowerFlat(result2, memory, optValue.value, context);
        }
      }
      copy(dest, dest_offset, src, src_offset, context) {
        exports2.u8.copy(dest, dest_offset, src, src_offset, context);
        const caseIndex = exports2.u8.load(src, src_offset, context);
        if (caseIndex === 0) {
          return;
        } else {
          src_offset += exports2.u8.size;
          src_offset = align(src_offset, this.alignment);
          dest_offset += exports2.u8.size;
          dest_offset = align(dest_offset, this.alignment);
          this.valueType.copy(dest, dest_offset, src, src_offset, context);
        }
      }
      asOptionValue(value, options) {
        if (option.isOption(value)) {
          if (!options.keepOption) {
            throw new ComponentModelTrap("Received an option value although options should be unpacked.");
          }
          return value;
        } else {
          if (options.keepOption) {
            throw new ComponentModelTrap("Received a unpacked option value although options should NOT be unpacked.");
          }
          return value === void 0 ? option._ctor(option.none, void 0) : option._ctor(option.some, value);
        }
      }
      computeSize() {
        let result2 = exports2.u8.size;
        result2 = align(result2, this.valueType.alignment);
        return result2 + this.valueType.size;
      }
      computeAlignment() {
        return Math.max(exports2.u8.alignment, this.valueType.alignment);
      }
      computeFlatTypes() {
        return [...exports2.u8.flatTypes, ...this.valueType.flatTypes];
      }
    };
    exports2.OptionType = OptionType;
    var result;
    (function(result2) {
      result2.ok = "ok";
      function Ok(value) {
        return new ResultImpl(result2.ok, value);
      }
      result2.Ok = Ok;
      result2.error = "error";
      function Error2(value) {
        return new ResultImpl(result2.error, value);
      }
      result2.Error = Error2;
      function _ctor(c, v) {
        return new ResultImpl(c, v);
      }
      result2._ctor = _ctor;
      class ResultImpl {
        constructor(tag, value) {
          __publicField(this, "_tag");
          __publicField(this, "_value");
          this._tag = tag;
          this._value = value;
        }
        get tag() {
          return this._tag;
        }
        get value() {
          return this._value;
        }
        isOk() {
          return this._tag === result2.ok;
        }
        isError() {
          return this._tag === result2.error;
        }
      }
      result2.ResultImpl = ResultImpl;
    })(result || (exports2.result = result = {}));
    var ResultType = class extends VariantType2 {
      constructor(okType, errorType) {
        super([["ok", okType], ["error", errorType]], result._ctor, ComponentModelTypeKind.result);
      }
    };
    exports2.ResultType = ResultType;
    var _Callable = class _Callable {
      constructor(witName, params, returnType) {
        __publicField(this, "witName");
        __publicField(this, "params");
        __publicField(this, "returnType");
        __publicField(this, "paramType");
        __publicField(this, "isSingleParam");
        __publicField(this, "mode");
        this.witName = witName;
        this.params = params;
        this.returnType = returnType;
        switch (params.length) {
          case 0:
            this.paramType = void 0;
            this.isSingleParam = false;
            break;
          case 1:
            this.paramType = params[0][1];
            this.isSingleParam = true;
            break;
          default:
            this.paramType = new TupleType(params.map((p) => p[1]));
            this.isSingleParam = false;
        }
        this.mode = "lower";
      }
      liftParamValues(wasmValues, memory, context) {
        if (this.paramType === void 0) {
          return _Callable.EMPTY_JTYPE;
        }
        let result2;
        if (this.paramType.flatTypes.length > _Callable.MAX_FLAT_PARAMS) {
          const p0 = wasmValues[0];
          if (!Number.isInteger(p0)) {
            throw new ComponentModelTrap("Invalid pointer");
          }
          result2 = this.paramType.load(memory.readonly(p0, this.paramType.size), 0, context);
        } else {
          result2 = this.paramType.liftFlat(memory, wasmValues.values(), context);
        }
        return this.isSingleParam ? [result2] : result2;
      }
      lowerParamValues(values, memory, context, out) {
        if (this.paramType === void 0) {
          return _Callable.EMPTY_WASM_TYPE;
        }
        if (this.isSingleParam && values.length !== 1) {
          throw new ComponentModelTrap(`Expected a single parameter, but got ${values.length}`);
        }
        const toLower = this.isSingleParam ? values[0] : values;
        if (this.paramType.flatTypes.length > _Callable.MAX_FLAT_PARAMS) {
          const writer = out !== void 0 ? memory.preAllocated(out, this.paramType.size) : this.paramType.alloc(memory);
          this.paramType.store(writer, 0, toLower, context);
          return [writer.ptr];
        } else {
          const result2 = [];
          this.paramType.lowerFlat(result2, memory, toLower, context);
          return result2;
        }
      }
      lowerReturnValue(value, memory, context, out) {
        if (this.returnType === void 0) {
          return;
        } else if (this.returnType.flatTypes.length <= _Callable.MAX_FLAT_RESULTS) {
          const result2 = [];
          this.returnType.lowerFlat(result2, memory, value, context);
          if (result2.length !== this.returnType.flatTypes.length) {
            throw new ComponentModelTrap(`Expected flat result of length ${this.returnType.flatTypes.length}, but got ${JSON.stringify(result2, void 0, void 0)}`);
          }
          return result2[0];
        } else {
          const writer = out !== void 0 ? memory.preAllocated(out, this.returnType.size) : this.returnType.alloc(memory);
          this.returnType.store(writer, 0, value, context);
          return;
        }
      }
      callWasm(params, wasmFunction, context) {
        const memory = context.getMemory();
        const wasmValues = this.lowerParamValues(params, memory, context, void 0);
        let resultRange = void 0;
        let result2;
        if (this.returnType !== void 0 && this.returnType.flatTypes.length > FunctionType2.MAX_FLAT_RESULTS) {
          resultRange = this.returnType.alloc(memory);
          result2 = wasmFunction(...wasmValues, resultRange.ptr);
        } else {
          result2 = wasmFunction(...wasmValues);
        }
        return this.liftReturnValue(result2, resultRange?.ptr, memory, context);
      }
      getParamValuesForHostCall(params, context) {
        const memory = context.getMemory();
        const returnFlatTypes = this.returnType === void 0 ? 0 : this.returnType.flatTypes.length;
        let out;
        if (returnFlatTypes > FunctionType2.MAX_FLAT_RESULTS) {
          const paramFlatTypes = this.paramType !== void 0 ? this.paramType.flatTypes.length : 0;
          if (params.length === paramFlatTypes + 1) {
            const last = params[paramFlatTypes];
            if (typeof last !== "number") {
              throw new ComponentModelTrap(`Result pointer must be a number (u32), but got ${out}.`);
            }
            out = last;
          }
        }
        return [this.liftParamValues(params, memory, context), out];
      }
      liftReturnValue(value, out, memory, context) {
        if (this.returnType === void 0) {
          return;
        } else if (this.returnType.flatTypes.length <= _Callable.MAX_FLAT_RESULTS) {
          return this.returnType.liftFlat(memory, [value].values(), context);
        } else {
          return this.returnType.load(memory.readonly(out, this.returnType.size), 0, context);
        }
      }
    };
    __publicField(_Callable, "EMPTY_JTYPE", Object.freeze([]));
    __publicField(_Callable, "EMPTY_WASM_TYPE", Object.freeze([]));
    __publicField(_Callable, "MAX_FLAT_PARAMS", 16);
    __publicField(_Callable, "MAX_FLAT_RESULTS", 1);
    var Callable = _Callable;
    var FunctionType2 = class extends Callable {
      constructor(witName, params, returnType) {
        super(witName, params, returnType);
      }
      callHost(func, params, context) {
        const [jParams, out] = this.getParamValuesForHostCall(params, context);
        const result2 = func(...jParams);
        return this.lowerReturnValue(result2, context.getMemory(), context, out);
      }
    };
    exports2.FunctionType = FunctionType2;
    var ConstructorType = class extends Callable {
      constructor(witName, params, returnType) {
        super(witName, params, returnType);
      }
      callHost(clazz, params, resourceManager, context) {
        const returnFlatTypes = this.returnType === void 0 ? 0 : this.returnType.flatTypes.length;
        if (returnFlatTypes !== 1) {
          throw new ComponentModelTrap(`Expected exactly one return type, but got ${returnFlatTypes}.`);
        }
        const memory = context.getMemory();
        const jParams = this.liftParamValues(params, memory, context);
        const obj = new clazz(...jParams);
        const handle = resourceManager.$handle(obj);
        return handle;
      }
    };
    exports2.ConstructorType = ConstructorType;
    var DestructorType = class extends Callable {
      constructor(witName, params) {
        super(witName, params);
      }
      callHost(params, resourceManager) {
        const handle = params[0];
        if (typeof handle === "bigint" || !$u32.valid(handle)) {
          throw new ComponentModelTrap(`Object handle must be a number (u32), but got ${handle}.`);
        }
        const resource = resourceManager.$resource(handle);
        resource["$drop"] !== void 0 && resource["$drop"]();
        resourceManager.$drop(handle);
      }
    };
    exports2.DestructorType = DestructorType;
    var StaticMethodType = class extends Callable {
      constructor(witName, params, returnType) {
        super(witName, params, returnType);
      }
      callHost(func, params, context) {
        const [jParams, out] = this.getParamValuesForHostCall(params, context);
        const result2 = func(...jParams);
        return this.lowerReturnValue(result2, context.getMemory(), context, out);
      }
    };
    exports2.StaticMethodType = StaticMethodType;
    var MethodType = class extends Callable {
      constructor(witName, params, returnType) {
        super(witName, params, returnType);
      }
      callHost(methodName, params, resourceManager, context) {
        if (params.length === 0) {
          throw new ComponentModelTrap(`Method calls must have at least one parameter (the object pointer).`);
        }
        const handle = params.shift();
        if (typeof handle !== "number") {
          throw new ComponentModelTrap(`Object handle must be a number (u32), but got ${handle}.`);
        }
        const [jParams, out] = this.getParamValuesForHostCall(params, context);
        const resource = resourceManager.$resource(handle);
        const memory = context.getMemory();
        const result2 = resource[methodName](...jParams);
        return this.lowerReturnValue(result2, memory, context, out);
      }
      callWasmMethod(params, wasmFunction, resourceManager, context) {
        const memory = context.getMemory();
        const obj = params.shift();
        const handle = obj.$handle ?? resourceManager.$handle(obj);
        const wasmValues = this.lowerParamValues(params, memory, context, void 0);
        let resultRange = void 0;
        let result2;
        if (this.returnType !== void 0 && this.returnType.flatTypes.length > FunctionType2.MAX_FLAT_RESULTS) {
          resultRange = this.returnType.alloc(memory);
          result2 = wasmFunction(handle, ...wasmValues, resultRange.ptr);
        } else {
          result2 = wasmFunction(handle, ...wasmValues);
        }
        return this.liftReturnValue(result2, resultRange?.ptr, memory, context);
      }
    };
    exports2.MethodType = MethodType;
    var ResourceHandleType = class {
      constructor(witName) {
        __publicField(this, "kind");
        __publicField(this, "size");
        __publicField(this, "alignment");
        __publicField(this, "flatTypes");
        __publicField(this, "witName");
        this.witName = witName;
        this.kind = ComponentModelTypeKind.resourceHandle;
        this.size = exports2.u32.size;
        this.alignment = exports2.u32.alignment;
        this.flatTypes = exports2.u32.flatTypes;
      }
      load(memory, offset, context) {
        return exports2.u32.load(memory, offset, context);
      }
      liftFlat(memory, values, context) {
        return exports2.u32.liftFlat(memory, values, context);
      }
      alloc(memory) {
        return exports2.u32.alloc(memory);
      }
      store(memory, offset, value, context) {
        exports2.u32.store(memory, offset, value, context);
      }
      lowerFlat(result2, memory, value, context) {
        exports2.u32.lowerFlat(result2, memory, value, context);
      }
      copy(dest, dest_offset, src, src_offset, context) {
        exports2.u32.copy(dest, dest_offset, src, src_offset, context);
      }
    };
    exports2.ResourceHandleType = ResourceHandleType;
    var ResourceType = class {
      constructor(witName, id) {
        __publicField(this, "kind");
        __publicField(this, "size");
        __publicField(this, "alignment");
        __publicField(this, "flatTypes");
        __publicField(this, "witName");
        __publicField(this, "id");
        __publicField(this, "callables");
        this.kind = ComponentModelTypeKind.resource;
        this.size = exports2.u32.size;
        this.alignment = exports2.u32.alignment;
        this.flatTypes = exports2.u32.flatTypes;
        this.witName = witName;
        this.id = id;
        this.callables = /* @__PURE__ */ new Map();
      }
      addConstructor(jsName, func) {
        this.callables.set(jsName, func);
      }
      addDestructor(jsName, func) {
        this.callables.set(jsName, func);
      }
      addStaticMethod(jsName, func) {
        this.callables.set(jsName, func);
      }
      addMethod(jsName, func) {
        this.callables.set(jsName, func);
      }
      getCallable(jsName) {
        const result2 = this.callables.get(jsName);
        if (result2 === void 0) {
          throw new ComponentModelTrap(`Method '${jsName}' not found on resource '${this.witName}'.`);
        }
        return result2;
      }
      load(memory, offset, context) {
        const handle = exports2.u32.load(memory, offset, context);
        return context.resources.get(this.id).$resource(handle);
      }
      liftFlat(memory, values, context) {
        const handle = exports2.u32.liftFlat(memory, values, context);
        return context.resources.get(this.id).$resource(handle);
      }
      alloc(memory) {
        return exports2.u32.alloc(memory);
      }
      store(memory, offset, value, context) {
        const handle = context.resources.get(this.id).$handle(value);
        exports2.u32.store(memory, offset, handle, context);
      }
      lowerFlat(result2, memory, value, context) {
        const handle = context.resources.get(this.id).$handle(value);
        exports2.u32.lowerFlat(result2, memory, handle, context);
      }
      copy(dest, dest_offset, src, src_offset, context) {
        exports2.u32.copy(dest, dest_offset, src, src_offset, context);
      }
    };
    exports2.ResourceType = ResourceType;
    var AbstractWrapperType = class {
      constructor(kind, wrapped) {
        __publicField(this, "kind");
        __publicField(this, "size");
        __publicField(this, "alignment");
        __publicField(this, "flatTypes");
        __publicField(this, "wrapped");
        this.kind = kind;
        this.wrapped = wrapped;
        this.size = exports2.u32.size;
        this.alignment = exports2.u32.alignment;
        this.flatTypes = exports2.u32.flatTypes;
      }
      load(memory, offset, context) {
        return this.wrapped.load(memory, offset, context);
      }
      liftFlat(memory, values, context) {
        return this.wrapped.liftFlat(memory, values, context);
      }
      alloc(memory) {
        return exports2.u32.alloc(memory);
      }
      store(memory, offset, value, context) {
        return this.wrapped.store(memory, offset, value, context);
      }
      lowerFlat(result2, memory, value, context) {
        return this.wrapped.lowerFlat(result2, memory, value, context);
      }
      copy(dest, dest_offset, src, src_offset, context) {
        return this.wrapped.copy(dest, dest_offset, src, src_offset, context);
      }
    };
    var BorrowType = class extends AbstractWrapperType {
      constructor(type) {
        super(ComponentModelTypeKind.borrow, type);
      }
    };
    exports2.BorrowType = BorrowType;
    var OwnType = class extends AbstractWrapperType {
      constructor(type) {
        super(ComponentModelTypeKind.own, type);
      }
    };
    exports2.OwnType = OwnType;
    var ComponentModelTypeVisitor;
    (function(ComponentModelTypeVisitor2) {
      function visit(type, visitor) {
        switch (type.kind) {
          case ComponentModelTypeKind.u8:
            visitor.visitU8 !== void 0 && visitor.visitU8(type);
            break;
          case ComponentModelTypeKind.u16:
            visitor.visitU16 !== void 0 && visitor.visitU16(type);
            break;
          case ComponentModelTypeKind.u32:
            visitor.visitU32 !== void 0 && visitor.visitU32(type);
            break;
          case ComponentModelTypeKind.u64:
            visitor.visitU64 !== void 0 && visitor.visitU64(type);
            break;
          case ComponentModelTypeKind.s8:
            visitor.visitS8 !== void 0 && visitor.visitS8(type);
            break;
          case ComponentModelTypeKind.s16:
            visitor.visitS16 !== void 0 && visitor.visitS16(type);
            break;
          case ComponentModelTypeKind.s32:
            visitor.visitS32 !== void 0 && visitor.visitS32(type);
            break;
          case ComponentModelTypeKind.s64:
            visitor.visitS64 !== void 0 && visitor.visitS64(type);
            break;
          case ComponentModelTypeKind.float32:
            visitor.visitFloat32 !== void 0 && visitor.visitFloat32(type);
            break;
          case ComponentModelTypeKind.float64:
            visitor.visitFloat64 !== void 0 && visitor.visitFloat64(type);
            break;
          case ComponentModelTypeKind.bool:
            visitor.visitBool !== void 0 && visitor.visitBool(type);
            break;
          case ComponentModelTypeKind.string:
            visitor.visitString !== void 0 && visitor.visitString(type);
            break;
          case ComponentModelTypeKind.enum:
            visitor.visitEnum !== void 0 && visitor.visitEnum(type);
            break;
          case ComponentModelTypeKind.flags:
            visitor.visitFlags !== void 0 && visitor.visitFlags(type);
            break;
          case ComponentModelTypeKind.borrow:
            visitor.visitBorrow !== void 0 && visitor.visitBorrow(type);
            break;
          case ComponentModelTypeKind.own:
            visitor.visitOwn !== void 0 && visitor.visitOwn(type);
            break;
          case ComponentModelTypeKind.resource:
            visitor.visitResource !== void 0 && visitor.visitResource(type);
            break;
          case ComponentModelTypeKind.resourceHandle:
            visitor.visitResourceHandle !== void 0 && visitor.visitResourceHandle(type);
            break;
          case ComponentModelTypeKind.list:
            if (visitor.visitList !== void 0 && visitor.visitList(type)) {
              visit(type.elementType, visitor);
            }
            visitor.endVisitList !== void 0 && visitor.endVisitList(type);
            break;
          case ComponentModelTypeKind.record:
            if (visitor.visitRecord !== void 0 && visitor.visitRecord(type) || visitor.visitRecord === void 0) {
              for (const field of type.fields) {
                visit(field.type, visitor);
              }
            }
            visitor.endVisitRecord !== void 0 && visitor.endVisitRecord(type);
            break;
          case ComponentModelTypeKind.tuple:
            if (visitor.visitTuple !== void 0 && visitor.visitTuple(type) || visitor.visitTuple === void 0) {
              for (const field of type.fields) {
                visit(field.type, visitor);
              }
            }
            visitor.endVisitTuple !== void 0 && visitor.endVisitTuple(type);
            break;
          case ComponentModelTypeKind.variant:
            if (visitor.visitVariant !== void 0 && visitor.visitVariant(type) || visitor.visitVariant === void 0) {
              for (const field of type.cases) {
                field.type !== void 0 && visit(field.type, visitor);
              }
            }
            visitor.endVisitVariant !== void 0 && visitor.endVisitVariant(type);
            break;
          case ComponentModelTypeKind.option:
            if (visitor.visitOption !== void 0 && visitor.visitOption(type) || visitor.visitOption === void 0) {
              visit(type.valueType, visitor);
            }
            visitor.endVisitOption !== void 0 && visitor.endVisitOption(type);
            break;
          case ComponentModelTypeKind.result:
            if (visitor.visitResult !== void 0 && visitor.visitResult(type) || visitor.visitResult === void 0) {
              for (const field of type.cases) {
                field.type !== void 0 && visit(field.type, visitor);
              }
            }
            visitor.endVisitResult !== void 0 && visitor.endVisitResult(type);
            break;
          default:
            throw new Error(`Unknown type kind ${type.kind}`);
        }
      }
      ComponentModelTypeVisitor2.visit = visit;
    })(ComponentModelTypeVisitor || (exports2.ComponentModelTypeVisitor = ComponentModelTypeVisitor = {}));
    var InterfaceType;
    (function(InterfaceType2) {
      function is(value) {
        return typeof value === "object" && typeof value.id === "string" && typeof value.witName === "string" && value.types instanceof Map && value.functions instanceof Map && value.resources instanceof Map;
      }
      InterfaceType2.is = is;
    })(InterfaceType || (exports2.InterfaceType = InterfaceType = {}));
    var PackageType;
    (function(PackageType2) {
      function is(value) {
        return typeof value === "object" && typeof value.id === "string" && typeof value.witName === "string" && value.interfaces instanceof Map;
      }
      PackageType2.is = is;
    })(PackageType || (exports2.PackageType = PackageType = {}));
    var WasmContext2;
    (function(WasmContext3) {
      class Default {
        constructor() {
          __publicField(this, "memory");
          __publicField(this, "options");
          __publicField(this, "resources");
          this.options = { encoding: "utf-8" };
          this.resources = new ResourceManagers.Default();
        }
        initialize(memory) {
          if (this.memory !== void 0) {
            throw new MemoryError(`Memory is already initialized.`);
          }
          this.memory = memory;
        }
        getMemory() {
          if (this.memory === void 0) {
            throw new MemoryError(`Memory not yet initialized.`);
          }
          return this.memory;
        }
      }
      WasmContext3.Default = Default;
    })(WasmContext2 || (exports2.WasmContext = WasmContext2 = {}));
    var Resource = class {
      constructor() {
        __publicField(this, "_handle");
        this._handle = void 0;
      }
      get $handle() {
        return this._handle;
      }
      set $handle(value) {
        if (value === void 0) {
          throw new ComponentModelTrap("Cannot set undefined handle");
        }
        if (this._handle !== void 0) {
          throw new ComponentModelTrap(`Cannot set handle twice. Current handle is ${this._handle} new handle is ${value}.`);
        }
        this._handle = value;
      }
    };
    exports2.Resource = Resource;
    var Imports2;
    (function(Imports3) {
      function create(functions, resources, service, context) {
        const result2 = /* @__PURE__ */ Object.create(null);
        if (functions !== void 0) {
          for (const [funcName, func] of functions) {
            result2[func.witName] = createFunction(func, service[funcName], context);
          }
        }
        if (resources !== void 0) {
          for (const [resourceName, resource] of resources) {
            const clazz = service[resourceName];
            let resourceManager;
            if (context.resources.has(resource.id)) {
              resourceManager = context.resources.get(resource.id);
            } else {
              resourceManager = ResourceManager.from(clazz) ?? new ResourceManager.Default();
              context.resources.set(resource.id, resourceManager);
            }
            for (const [callableName, callable] of resource.callables) {
              if (callable instanceof ConstructorType) {
                result2[callable.witName] = createConstructorFunction(callable, clazz, resourceManager, context);
              } else if (callable instanceof StaticMethodType) {
                result2[callable.witName] = createStaticMethodFunction(callable, service[resourceName][callableName], context);
              } else if (callable instanceof MethodType) {
                result2[callable.witName] = createMethodFunction(callableName, callable, resourceManager, context);
              } else if (callable instanceof DestructorType) {
                result2[callable.witName] = createDestructorFunction(callable, resourceManager);
              }
            }
          }
        }
        return result2;
      }
      Imports3.create = create;
      function createFunction(callable, serviceFunction, context) {
        return function(...params) {
          return callable.callHost(serviceFunction, params, context);
        };
      }
      function createConstructorFunction(callable, clazz, manager, context) {
        return function(...params) {
          return callable.callHost(clazz, params, manager, context);
        };
      }
      function createDestructorFunction(callable, manager) {
        return function(...params) {
          return callable.callHost(params, manager);
        };
      }
      function createStaticMethodFunction(callable, func, context) {
        return function(...params) {
          return callable.callHost(func, params, context);
        };
      }
      function createMethodFunction(name, callable, manager, context) {
        return function(...params) {
          return callable.callHost(name, params, manager, context);
        };
      }
    })(Imports2 || (exports2.Imports = Imports2 = {}));
    var Module;
    (function(Module2) {
      function createObjectModule(resource, wasm, context) {
        let resourceManager;
        if (context.resources.has(resource.id)) {
          resourceManager = context.resources.get(resource.id);
        } else {
          resourceManager = new ResourceManager.Default();
          context.resources.set(resource.id, resourceManager);
        }
        const result2 = /* @__PURE__ */ Object.create(null);
        for (const [name, callable] of resource.callables) {
          if (callable instanceof ConstructorType) {
            result2[name] = createConstructorFunction(callable, wasm[callable.witName], context);
          } else if (callable instanceof MethodType) {
            result2[name] = createMethodFunction(callable, wasm[callable.witName], resourceManager, context);
          } else if (callable instanceof DestructorType) {
            result2[name] = createDestructorFunction(callable, wasm[callable.witName], context);
          }
        }
        return result2;
      }
      Module2.createObjectModule = createObjectModule;
      function createClassModule(resource, wasm, context) {
        if (!context.resources.has(resource.id)) {
          context.resources.set(resource.id, new ResourceManager.Default());
        }
        const result2 = /* @__PURE__ */ Object.create(null);
        for (const [name, callable] of resource.callables) {
          if (callable instanceof StaticMethodType) {
            result2[name] = createStaticMethodFunction(callable, wasm[callable.witName], context);
          }
        }
        return result2;
      }
      Module2.createClassModule = createClassModule;
      function createConstructorFunction(callable, wasmFunction, context) {
        return (...params) => {
          return callable.callWasm(params, wasmFunction, context);
        };
      }
      function createDestructorFunction(callable, wasmFunction, context) {
        return (...params) => {
          return callable.callWasm(params, wasmFunction, context);
        };
      }
      function createStaticMethodFunction(callable, wasmFunction, context) {
        return (...params) => {
          return callable.callWasm(params, wasmFunction, context);
        };
      }
      function createMethodFunction(callable, wasmFunction, manager, context) {
        return (...params) => {
          return callable.callWasmMethod(params, wasmFunction, manager, context);
        };
      }
    })(Module || (exports2.Module = Module = {}));
    var Exports2;
    (function(Exports3) {
      function filter(exports3, functions, resources, id, version2, _context) {
        const key = version2 !== void 0 ? `${id}@${version2}` : id;
        let result2 = exports3[key];
        if (result2 !== null && typeof result2 === "object") {
          return result2;
        }
        result2 = /* @__PURE__ */ Object.create(null);
        if (functions !== void 0) {
          for (const func of functions.values()) {
            const funcKey = `${key}#${func.witName}`;
            const candidate = exports3[funcKey];
            if (candidate !== null && candidate !== void 0) {
              result2[func.witName] = candidate;
            }
          }
        }
        if (resources !== void 0) {
          for (const resource of resources.values()) {
            for (const callable of resource.callables.values()) {
              const callableKey = `${key}#${callable.witName}`;
              const candidate = exports3[callableKey];
              if (candidate !== null && candidate !== void 0) {
                result2[callable.witName] = candidate;
              }
            }
          }
        }
        return result2;
      }
      Exports3.filter = filter;
      function bind(functions, resources, wasm, context) {
        const result2 = /* @__PURE__ */ Object.create(null);
        if (functions !== void 0) {
          for (const [name, func] of functions) {
            result2[name] = createFunction(func, wasm[func.witName], context);
          }
        }
        if (resources !== void 0) {
          for (const [name, , factory] of resources) {
            result2[name] = factory(wasm, context);
          }
        }
        return result2;
      }
      Exports3.bind = bind;
      function createFunction(func, wasmFunction, context) {
        return (...params) => {
          return func.callWasm(params, wasmFunction, context);
        };
      }
    })(Exports2 || (exports2.Exports = Exports2 = {}));
  }
});

// node_modules/@vscode/wasm-component-model/lib/common/api.js
var require_api = __commonJS({
  "node_modules/@vscode/wasm-component-model/lib/common/api.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RAL = void 0;
    var ral_1 = __importDefault(require_ral());
    exports2.RAL = ral_1.default;
    __exportStar(require_componentModel(), exports2);
  }
});

// node_modules/@vscode/wasm-component-model/lib/node/main.js
var require_main = __commonJS({
  "node_modules/@vscode/wasm-component-model/lib/node/main.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var ril_1 = __importDefault(require_ril());
    ril_1.default.install();
    __exportStar(require_api(), exports2);
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var import_wasm_component_model = __toESM(require_main());

// src/example.ts
var $wcm = __toESM(require_main());
var example;
((example2) => {
  let Types2;
  ((Types3) => {
    let Operation;
    ((Operation2) => {
      Operation2.add = "add";
      function Add(value) {
        return new VariantImpl(Operation2.add, value);
      }
      Operation2.Add = Add;
      Operation2.sub = "sub";
      function Sub(value) {
        return new VariantImpl(Operation2.sub, value);
      }
      Operation2.Sub = Sub;
      Operation2.mul = "mul";
      function Mul(value) {
        return new VariantImpl(Operation2.mul, value);
      }
      Operation2.Mul = Mul;
      Operation2.div = "div";
      function Div(value) {
        return new VariantImpl(Operation2.div, value);
      }
      Operation2.Div = Div;
      function _ctor(t, v) {
        return new VariantImpl(t, v);
      }
      Operation2._ctor = _ctor;
      class VariantImpl {
        constructor(t, value) {
          __publicField(this, "_tag");
          __publicField(this, "_value");
          this._tag = t;
          this._value = value;
        }
        get tag() {
          return this._tag;
        }
        get value() {
          return this._value;
        }
        isAdd() {
          return this._tag === Operation2.add;
        }
        isSub() {
          return this._tag === Operation2.sub;
        }
        isMul() {
          return this._tag === Operation2.mul;
        }
        isDiv() {
          return this._tag === Operation2.div;
        }
      }
    })(Operation = Types3.Operation || (Types3.Operation = {}));
  })(Types2 = example2.Types || (example2.Types = {}));
})(example || (example = {}));
((example2) => {
  let Types2;
  ((Types3) => {
    let $;
    (($2) => {
      $2.Operands = new $wcm.RecordType([
        ["left", $wcm.u32],
        ["right", $wcm.u32]
      ]);
      $2.Operation = new $wcm.VariantType([["add", $2.Operands], ["sub", $2.Operands], ["mul", $2.Operands], ["div", $2.Operands]], example2.Types.Operation._ctor);
    })($ = Types3.$ || (Types3.$ = {}));
  })(Types2 = example2.Types || (example2.Types = {}));
  ((Types3) => {
    let _;
    ((_2) => {
      _2.id = "vscode:example/types";
      _2.witName = "types";
      _2.types = /* @__PURE__ */ new Map([
        ["Operands", Types3.$.Operands],
        ["Operation", Types3.$.Operation]
      ]);
    })(_ = Types3._ || (Types3._ = {}));
  })(Types2 = example2.Types || (example2.Types = {}));
  let calculator2;
  ((calculator3) => {
    let $;
    (($2) => {
      $2.Operation = Types2.$.Operation;
      let Imports2;
      ((Imports3) => {
        Imports3.log = new $wcm.FunctionType("log", [
          ["msg", $wcm.wstring]
        ], void 0);
      })(Imports2 = $2.Imports || ($2.Imports = {}));
      let Exports2;
      ((Exports3) => {
        Exports3.calc = new $wcm.FunctionType("calc", [
          ["o", $2.Operation]
        ], $wcm.u32);
      })(Exports2 = $2.Exports || ($2.Exports = {}));
    })($ = calculator3.$ || (calculator3.$ = {}));
  })(calculator2 = example2.calculator || (example2.calculator = {}));
  ((calculator3) => {
    let _;
    ((_2) => {
      _2.id = "vscode:example/calculator";
      _2.witName = "calculator";
      let Imports2;
      ((Imports3) => {
        Imports3.functions = /* @__PURE__ */ new Map([
          ["log", calculator3.$.Imports.log]
        ]);
        Imports3.interfaces = /* @__PURE__ */ new Map([
          ["Types", Types2._]
        ]);
      })(Imports2 = _2.Imports || (_2.Imports = {}));
      let Exports2;
      ((Exports3) => {
        Exports3.functions = /* @__PURE__ */ new Map([
          ["calc", calculator3.$.Exports.calc]
        ]);
      })(Exports2 = _2.Exports || (_2.Exports = {}));
      function createImports(service, context) {
        const result = /* @__PURE__ */ Object.create(null);
        result["$root"] = $wcm.Imports.create(Imports2.functions, void 0, service, context);
        return result;
      }
      _2.createImports = createImports;
      function bindExports(exports2, context) {
        const result = /* @__PURE__ */ Object.create(null);
        Object.assign(result, $wcm.Exports.bind(Exports2.functions, void 0, exports2, context));
        return result;
      }
      _2.bindExports = bindExports;
    })(_ = calculator3._ || (calculator3._ = {}));
  })(calculator2 = example2.calculator || (example2.calculator = {}));
})(example || (example = {}));
((example2) => {
  let _;
  ((_2) => {
    _2.id = "vscode:example";
    _2.witName = "example";
    _2.interfaces = /* @__PURE__ */ new Map([
      ["Types", example2.Types._]
    ]);
    _2.worlds = /* @__PURE__ */ new Map([
      ["calculator", example2.calculator._]
    ]);
  })(_ = example2._ || (example2._ = {}));
})(example || (example = {}));

// src/extension.ts
var calculator = example.calculator;
var Types = example.Types;
async function activate(context) {
  const channel = vscode.window.createOutputChannel("Calculator");
  context.subscriptions.push(channel);
  const log = vscode.window.createOutputChannel("Calculator - Log", { log: true });
  context.subscriptions.push(log);
  const filename = vscode.Uri.joinPath(context.extensionUri, "target", "wasm32-unknown-unknown", "debug", "calculator.wasm");
  const bits = await vscode.workspace.fs.readFile(filename);
  const module2 = await WebAssembly.compile(bits);
  const service = {
    log: (msg) => {
      log.info(msg);
    }
  };
  const wasmContext = new import_wasm_component_model.WasmContext.Default();
  const instance = await WebAssembly.instantiate(module2, calculator._.createImports(service, wasmContext));
  wasmContext.initialize(new import_wasm_component_model.Memory.Default(instance.exports));
  const api = calculator._.bindExports(instance.exports, wasmContext);
  context.subscriptions.push(vscode.commands.registerCommand("vscode-samples.wasm-component-model.run", () => {
    channel.show();
    channel.appendLine("Running calculator example");
    channel.appendLine(`Add ${api.calc(Types.Operation.Add({ left: 1, right: 2 }))}`);
    channel.appendLine(`Sub ${api.calc(Types.Operation.Sub({ left: 10, right: 8 }))}`);
    channel.appendLine(`Mul ${api.calc(Types.Operation.Mul({ left: 3, right: 7 }))}`);
    channel.appendLine(`Div ${api.calc(Types.Operation.Div({ left: 10, right: 2 }))}`);
  }));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate
});
//# sourceMappingURL=extension.js.map
