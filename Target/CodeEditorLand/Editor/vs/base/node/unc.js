var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const module = { exports: {} };
(() => {
  const isESM = true;
  function factory() {
    function processUNCHostAllowlist() {
      return process.uncHostAllowlist;
    }
    __name(processUNCHostAllowlist, "processUNCHostAllowlist");
    function toSafeStringArray(arg0) {
      const allowedUNCHosts = /* @__PURE__ */ new Set();
      if (Array.isArray(arg0)) {
        for (const host of arg0) {
          if (typeof host === "string") {
            allowedUNCHosts.add(host);
          }
        }
      }
      return Array.from(allowedUNCHosts);
    }
    __name(toSafeStringArray, "toSafeStringArray");
    function getUNCHostAllowlist2() {
      const allowlist = processUNCHostAllowlist();
      if (allowlist) {
        return Array.from(allowlist);
      }
      return [];
    }
    __name(getUNCHostAllowlist2, "getUNCHostAllowlist");
    function addUNCHostToAllowlist2(allowedHost) {
      if (process.platform !== "win32") {
        return;
      }
      const allowlist = processUNCHostAllowlist();
      if (allowlist) {
        if (typeof allowedHost === "string") {
          allowlist.add(allowedHost.toLowerCase());
        } else {
          for (const host of toSafeStringArray(allowedHost)) {
            addUNCHostToAllowlist2(host);
          }
        }
      }
    }
    __name(addUNCHostToAllowlist2, "addUNCHostToAllowlist");
    function getUNCHost2(maybeUNCPath) {
      if (typeof maybeUNCPath !== "string") {
        return void 0;
      }
      const uncRoots = [
        "\\\\.\\UNC\\",
        // DOS Device paths (https://learn.microsoft.com/en-us/dotnet/standard/io/file-path-formats)
        "\\\\?\\UNC\\",
        "\\\\"
        // standard UNC path
      ];
      let host;
      for (const uncRoot of uncRoots) {
        const indexOfUNCRoot = maybeUNCPath.indexOf(uncRoot);
        if (indexOfUNCRoot !== 0) {
          continue;
        }
        const indexOfUNCPath = maybeUNCPath.indexOf(
          "\\",
          uncRoot.length
        );
        if (indexOfUNCPath === -1) {
          continue;
        }
        const hostCandidate = maybeUNCPath.substring(
          uncRoot.length,
          indexOfUNCPath
        );
        if (hostCandidate) {
          host = hostCandidate;
          break;
        }
      }
      return host;
    }
    __name(getUNCHost2, "getUNCHost");
    function disableUNCAccessRestrictions2() {
      if (process.platform !== "win32") {
        return;
      }
      process.restrictUNCAccess = false;
    }
    __name(disableUNCAccessRestrictions2, "disableUNCAccessRestrictions");
    function isUNCAccessRestrictionsDisabled2() {
      if (process.platform !== "win32") {
        return true;
      }
      return process.restrictUNCAccess === false;
    }
    __name(isUNCAccessRestrictionsDisabled2, "isUNCAccessRestrictionsDisabled");
    return {
      getUNCHostAllowlist: getUNCHostAllowlist2,
      addUNCHostToAllowlist: addUNCHostToAllowlist2,
      getUNCHost: getUNCHost2,
      disableUNCAccessRestrictions: disableUNCAccessRestrictions2,
      isUNCAccessRestrictionsDisabled: isUNCAccessRestrictionsDisabled2
    };
  }
  __name(factory, "factory");
  if (!isESM && typeof define === "function") {
    define([], () => factory());
  } else if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    console.trace(
      "vs/base/node/unc defined in UNKNOWN context (neither requirejs or commonjs)"
    );
  }
})();
const getUNCHost = module.exports.getUNCHost;
const getUNCHostAllowlist = module.exports.getUNCHostAllowlist;
const addUNCHostToAllowlist = module.exports.addUNCHostToAllowlist;
const disableUNCAccessRestrictions = module.exports.disableUNCAccessRestrictions;
const isUNCAccessRestrictionsDisabled = module.exports.isUNCAccessRestrictionsDisabled;
export {
  addUNCHostToAllowlist,
  disableUNCAccessRestrictions,
  getUNCHost,
  getUNCHostAllowlist,
  isUNCAccessRestrictionsDisabled
};
//# sourceMappingURL=unc.js.map
