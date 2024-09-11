var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class DebugNameData {
  constructor(owner, debugNameSource, referenceFn) {
    this.owner = owner;
    this.debugNameSource = debugNameSource;
    this.referenceFn = referenceFn;
  }
  static {
    __name(this, "DebugNameData");
  }
  getDebugName(target) {
    return getDebugName(target, this);
  }
}
const countPerName = /* @__PURE__ */ new Map();
const cachedDebugName = /* @__PURE__ */ new WeakMap();
function getDebugName(target, data) {
  const cached = cachedDebugName.get(target);
  if (cached) {
    return cached;
  }
  const dbgName = computeDebugName(target, data);
  if (dbgName) {
    let count = countPerName.get(dbgName) ?? 0;
    count++;
    countPerName.set(dbgName, count);
    const result = count === 1 ? dbgName : `${dbgName}#${count}`;
    cachedDebugName.set(target, result);
    return result;
  }
  return void 0;
}
__name(getDebugName, "getDebugName");
function computeDebugName(self, data) {
  const cached = cachedDebugName.get(self);
  if (cached) {
    return cached;
  }
  const ownerStr = data.owner ? formatOwner(data.owner) + `.` : "";
  let result;
  const debugNameSource = data.debugNameSource;
  if (debugNameSource !== void 0) {
    if (typeof debugNameSource === "function") {
      result = debugNameSource();
      if (result !== void 0) {
        return ownerStr + result;
      }
    } else {
      return ownerStr + debugNameSource;
    }
  }
  const referenceFn = data.referenceFn;
  if (referenceFn !== void 0) {
    result = getFunctionName(referenceFn);
    if (result !== void 0) {
      return ownerStr + result;
    }
  }
  if (data.owner !== void 0) {
    const key = findKey(data.owner, self);
    if (key !== void 0) {
      return ownerStr + key;
    }
  }
  return void 0;
}
__name(computeDebugName, "computeDebugName");
function findKey(obj, value) {
  for (const key in obj) {
    if (obj[key] === value) {
      return key;
    }
  }
  return void 0;
}
__name(findKey, "findKey");
const countPerClassName = /* @__PURE__ */ new Map();
const ownerId = /* @__PURE__ */ new WeakMap();
function formatOwner(owner) {
  const id = ownerId.get(owner);
  if (id) {
    return id;
  }
  const className = getClassName(owner);
  let count = countPerClassName.get(className) ?? 0;
  count++;
  countPerClassName.set(className, count);
  const result = count === 1 ? className : `${className}#${count}`;
  ownerId.set(owner, result);
  return result;
}
__name(formatOwner, "formatOwner");
function getClassName(obj) {
  const ctor = obj.constructor;
  if (ctor) {
    return ctor.name;
  }
  return "Object";
}
__name(getClassName, "getClassName");
function getFunctionName(fn) {
  const fnSrc = fn.toString();
  const regexp = /\/\*\*\s*@description\s*([^*]*)\*\//;
  const match = regexp.exec(fnSrc);
  const result = match ? match[1] : void 0;
  return result?.trim();
}
__name(getFunctionName, "getFunctionName");
export {
  DebugNameData,
  getDebugName,
  getFunctionName
};
//# sourceMappingURL=debugName.js.map
