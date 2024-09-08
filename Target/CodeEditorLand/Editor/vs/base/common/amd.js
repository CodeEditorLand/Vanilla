const isESM = true;
const canASAR = false;
var LoaderEventType = /* @__PURE__ */ ((LoaderEventType2) => {
  LoaderEventType2[LoaderEventType2["LoaderAvailable"] = 1] = "LoaderAvailable";
  LoaderEventType2[LoaderEventType2["BeginLoadingScript"] = 10] = "BeginLoadingScript";
  LoaderEventType2[LoaderEventType2["EndLoadingScriptOK"] = 11] = "EndLoadingScriptOK";
  LoaderEventType2[LoaderEventType2["EndLoadingScriptError"] = 12] = "EndLoadingScriptError";
  LoaderEventType2[LoaderEventType2["BeginInvokeFactory"] = 21] = "BeginInvokeFactory";
  LoaderEventType2[LoaderEventType2["EndInvokeFactory"] = 22] = "EndInvokeFactory";
  LoaderEventType2[LoaderEventType2["NodeBeginEvaluatingScript"] = 31] = "NodeBeginEvaluatingScript";
  LoaderEventType2[LoaderEventType2["NodeEndEvaluatingScript"] = 32] = "NodeEndEvaluatingScript";
  LoaderEventType2[LoaderEventType2["NodeBeginNativeRequire"] = 33] = "NodeBeginNativeRequire";
  LoaderEventType2[LoaderEventType2["NodeEndNativeRequire"] = 34] = "NodeEndNativeRequire";
  LoaderEventType2[LoaderEventType2["CachedDataFound"] = 60] = "CachedDataFound";
  LoaderEventType2[LoaderEventType2["CachedDataMissed"] = 61] = "CachedDataMissed";
  LoaderEventType2[LoaderEventType2["CachedDataRejected"] = 62] = "CachedDataRejected";
  LoaderEventType2[LoaderEventType2["CachedDataCreated"] = 63] = "CachedDataCreated";
  return LoaderEventType2;
})(LoaderEventType || {});
class LoaderStats {
  static get() {
    const amdLoadScript = /* @__PURE__ */ new Map();
    const amdInvokeFactory = /* @__PURE__ */ new Map();
    const nodeRequire = /* @__PURE__ */ new Map();
    const nodeEval = /* @__PURE__ */ new Map();
    function mark(map, stat) {
      if (map.has(stat.detail)) {
        return;
      }
      map.set(stat.detail, -stat.timestamp);
    }
    function diff(map, stat) {
      const duration = map.get(stat.detail);
      if (!duration) {
        return;
      }
      if (duration >= 0) {
        return;
      }
      map.set(stat.detail, duration + stat.timestamp);
    }
    let stats = [];
    if (typeof require === "function" && typeof require.getStats === "function") {
      stats = require.getStats().slice(0).sort((a, b) => a.timestamp - b.timestamp);
    }
    for (const stat of stats) {
      switch (stat.type) {
        case 10 /* BeginLoadingScript */:
          mark(amdLoadScript, stat);
          break;
        case 11 /* EndLoadingScriptOK */:
        case 12 /* EndLoadingScriptError */:
          diff(amdLoadScript, stat);
          break;
        case 21 /* BeginInvokeFactory */:
          mark(amdInvokeFactory, stat);
          break;
        case 22 /* EndInvokeFactory */:
          diff(amdInvokeFactory, stat);
          break;
        case 33 /* NodeBeginNativeRequire */:
          mark(nodeRequire, stat);
          break;
        case 34 /* NodeEndNativeRequire */:
          diff(nodeRequire, stat);
          break;
        case 31 /* NodeBeginEvaluatingScript */:
          mark(nodeEval, stat);
          break;
        case 32 /* NodeEndEvaluatingScript */:
          diff(nodeEval, stat);
          break;
      }
    }
    let nodeRequireTotal = 0;
    nodeRequire.forEach((value) => nodeRequireTotal += value);
    function to2dArray(map) {
      const res = [];
      map.forEach((value, index) => res.push([index, value]));
      return res;
    }
    return {
      amdLoad: to2dArray(amdLoadScript),
      amdInvoke: to2dArray(amdInvokeFactory),
      nodeRequire: to2dArray(nodeRequire),
      nodeEval: to2dArray(nodeEval),
      nodeRequireTotal
    };
  }
  static toMarkdownTable(header, rows) {
    let result = "";
    const lengths = [];
    header.forEach((cell, ci) => {
      lengths[ci] = cell.length;
    });
    rows.forEach((row) => {
      row.forEach((cell, ci) => {
        if (typeof cell === "undefined") {
          cell = row[ci] = "-";
        }
        const len = cell.toString().length;
        lengths[ci] = Math.max(len, lengths[ci]);
      });
    });
    header.forEach((cell, ci) => {
      result += `| ${cell + " ".repeat(lengths[ci] - cell.toString().length)} `;
    });
    result += "|\n";
    header.forEach((_cell, ci) => {
      result += `| ${"-".repeat(lengths[ci])} `;
    });
    result += "|\n";
    rows.forEach((row) => {
      row.forEach((cell, ci) => {
        if (typeof cell !== "undefined") {
          result += `| ${cell + " ".repeat(lengths[ci] - cell.toString().length)} `;
        }
      });
      result += "|\n";
    });
    return result;
  }
}
export {
  LoaderEventType,
  LoaderStats,
  canASAR,
  isESM
};
