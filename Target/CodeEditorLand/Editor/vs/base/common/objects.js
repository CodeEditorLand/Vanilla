import { isObject, isTypedArray, isUndefinedOrNull } from "./types.js";
function deepClone(obj) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof RegExp) {
    return obj;
  }
  const result = Array.isArray(obj) ? [] : {};
  Object.entries(obj).forEach(([key, value]) => {
    result[key] = value && typeof value === "object" ? deepClone(value) : value;
  });
  return result;
}
function deepFreeze(obj) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  const stack = [obj];
  while (stack.length > 0) {
    const obj2 = stack.shift();
    Object.freeze(obj2);
    for (const key in obj2) {
      if (_hasOwnProperty.call(obj2, key)) {
        const prop = obj2[key];
        if (typeof prop === "object" && !Object.isFrozen(prop) && !isTypedArray(prop)) {
          stack.push(prop);
        }
      }
    }
  }
  return obj;
}
const _hasOwnProperty = Object.prototype.hasOwnProperty;
function cloneAndChange(obj, changer) {
  return _cloneAndChange(obj, changer, /* @__PURE__ */ new Set());
}
function _cloneAndChange(obj, changer, seen) {
  if (isUndefinedOrNull(obj)) {
    return obj;
  }
  const changed = changer(obj);
  if (typeof changed !== "undefined") {
    return changed;
  }
  if (Array.isArray(obj)) {
    const r1 = [];
    for (const e of obj) {
      r1.push(_cloneAndChange(e, changer, seen));
    }
    return r1;
  }
  if (isObject(obj)) {
    if (seen.has(obj)) {
      throw new Error("Cannot clone recursive data-structure");
    }
    seen.add(obj);
    const r2 = {};
    for (const i2 in obj) {
      if (_hasOwnProperty.call(obj, i2)) {
        r2[i2] = _cloneAndChange(obj[i2], changer, seen);
      }
    }
    seen.delete(obj);
    return r2;
  }
  return obj;
}
function mixin(destination, source, overwrite = true) {
  if (!isObject(destination)) {
    return source;
  }
  if (isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (key in destination) {
        if (overwrite) {
          if (isObject(destination[key]) && isObject(source[key])) {
            mixin(destination[key], source[key], overwrite);
          } else {
            destination[key] = source[key];
          }
        }
      } else {
        destination[key] = source[key];
      }
    });
  }
  return destination;
}
function equals(one, other) {
  if (one === other) {
    return true;
  }
  if (one === null || one === void 0 || other === null || other === void 0) {
    return false;
  }
  if (typeof one !== typeof other) {
    return false;
  }
  if (typeof one !== "object") {
    return false;
  }
  if (Array.isArray(one) !== Array.isArray(other)) {
    return false;
  }
  let i;
  let key;
  if (Array.isArray(one)) {
    if (one.length !== other.length) {
      return false;
    }
    for (i = 0; i < one.length; i++) {
      if (!equals(one[i], other[i])) {
        return false;
      }
    }
  } else {
    const oneKeys = [];
    for (key in one) {
      oneKeys.push(key);
    }
    oneKeys.sort();
    const otherKeys = [];
    for (key in other) {
      otherKeys.push(key);
    }
    otherKeys.sort();
    if (!equals(oneKeys, otherKeys)) {
      return false;
    }
    for (i = 0; i < oneKeys.length; i++) {
      if (!equals(one[oneKeys[i]], other[oneKeys[i]])) {
        return false;
      }
    }
  }
  return true;
}
function safeStringify(obj) {
  const seen = /* @__PURE__ */ new Set();
  return JSON.stringify(obj, (key, value) => {
    if (isObject(value) || Array.isArray(value)) {
      if (seen.has(value)) {
        return "[Circular]";
      } else {
        seen.add(value);
      }
    }
    if (typeof value === "bigint") {
      return `[BigInt ${value.toString()}]`;
    }
    return value;
  });
}
function distinct(base, target) {
  const result = /* @__PURE__ */ Object.create(null);
  if (!base || !target) {
    return result;
  }
  const targetKeys = Object.keys(target);
  targetKeys.forEach((k) => {
    const baseValue = base[k];
    const targetValue = target[k];
    if (!equals(baseValue, targetValue)) {
      result[k] = targetValue;
    }
  });
  return result;
}
function getCaseInsensitive(target, key) {
  const lowercaseKey = key.toLowerCase();
  const equivalentKey = Object.keys(target).find(
    (k) => k.toLowerCase() === lowercaseKey
  );
  return equivalentKey ? target[equivalentKey] : target[key];
}
function filter(obj, predicate) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(key, value)) {
      result[key] = value;
    }
  }
  return result;
}
function getAllPropertyNames(obj) {
  let res = [];
  while (Object.prototype !== obj) {
    res = res.concat(Object.getOwnPropertyNames(obj));
    obj = Object.getPrototypeOf(obj);
  }
  return res;
}
function getAllMethodNames(obj) {
  const methods = [];
  for (const prop of getAllPropertyNames(obj)) {
    if (typeof obj[prop] === "function") {
      methods.push(prop);
    }
  }
  return methods;
}
function createProxyObject(methodNames, invoke) {
  const createProxyMethod = (method) => {
    return () => {
      const args = Array.prototype.slice.call(arguments, 0);
      return invoke(method, args);
    };
  };
  const result = {};
  for (const methodName of methodNames) {
    result[methodName] = createProxyMethod(methodName);
  }
  return result;
}
function mapValues(obj, fn) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = fn(value, key);
  }
  return result;
}
export {
  cloneAndChange,
  createProxyObject,
  deepClone,
  deepFreeze,
  distinct,
  equals,
  filter,
  getAllMethodNames,
  getAllPropertyNames,
  getCaseInsensitive,
  mapValues,
  mixin,
  safeStringify
};
