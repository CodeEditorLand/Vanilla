var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  requestFilterToString
} from "../../common/watcher.js";
const useParcelWatcher2 = process.env.VSCODE_USE_WATCHER2 === "true";
function computeStats(requests, recursiveWatcher, nonRecursiveWatcher) {
  const lines = [];
  const allRecursiveRequests = sortByPathPrefix(
    requests.filter((request) => request.recursive)
  );
  const nonSuspendedRecursiveRequests = allRecursiveRequests.filter(
    (request) => recursiveWatcher.isSuspended(request) === false
  );
  const suspendedPollingRecursiveRequests = allRecursiveRequests.filter(
    (request) => recursiveWatcher.isSuspended(request) === "polling"
  );
  const suspendedNonPollingRecursiveRequests = allRecursiveRequests.filter(
    (request) => recursiveWatcher.isSuspended(request) === true
  );
  const recursiveRequestsStatus = computeRequestStatus(
    allRecursiveRequests,
    recursiveWatcher
  );
  const recursiveWatcherStatus = computeRecursiveWatchStatus(recursiveWatcher);
  const allNonRecursiveRequests = sortByPathPrefix(
    requests.filter((request) => !request.recursive)
  );
  const nonSuspendedNonRecursiveRequests = allNonRecursiveRequests.filter(
    (request) => nonRecursiveWatcher.isSuspended(request) === false
  );
  const suspendedPollingNonRecursiveRequests = allNonRecursiveRequests.filter(
    (request) => nonRecursiveWatcher.isSuspended(request) === "polling"
  );
  const suspendedNonPollingNonRecursiveRequests = allNonRecursiveRequests.filter(
    (request) => nonRecursiveWatcher.isSuspended(request) === true
  );
  const nonRecursiveRequestsStatus = computeRequestStatus(
    allNonRecursiveRequests,
    nonRecursiveWatcher
  );
  const nonRecursiveWatcherStatus = computeNonRecursiveWatchStatus(nonRecursiveWatcher);
  lines.push("[Summary]");
  lines.push(
    `- Recursive Requests:     total: ${allRecursiveRequests.length}, suspended: ${recursiveRequestsStatus.suspended}, polling: ${recursiveRequestsStatus.polling}`
  );
  lines.push(
    `- Non-Recursive Requests: total: ${allNonRecursiveRequests.length}, suspended: ${nonRecursiveRequestsStatus.suspended}, polling: ${nonRecursiveRequestsStatus.polling}`
  );
  lines.push(
    `- Recursive Watchers:     total: ${recursiveWatcher.watchers.size}, active: ${recursiveWatcherStatus.active}, failed: ${recursiveWatcherStatus.failed}, stopped: ${recursiveWatcherStatus.stopped}`
  );
  lines.push(
    `- Non-Recursive Watchers: total: ${nonRecursiveWatcher.watchers.size}, active: ${nonRecursiveWatcherStatus.active}, failed: ${nonRecursiveWatcherStatus.failed}, reusing: ${nonRecursiveWatcherStatus.reusing}`
  );
  lines.push(
    `- I/O Handles Impact:     total: ${recursiveRequestsStatus.polling + nonRecursiveRequestsStatus.polling + recursiveWatcherStatus.active + nonRecursiveWatcherStatus.active}`
  );
  lines.push(
    `
[Recursive Requests (${allRecursiveRequests.length}, suspended: ${recursiveRequestsStatus.suspended}, polling: ${recursiveRequestsStatus.polling})]:`
  );
  const recursiveRequestLines = [];
  for (const request of [
    nonSuspendedRecursiveRequests,
    suspendedPollingRecursiveRequests,
    suspendedNonPollingRecursiveRequests
  ].flat()) {
    fillRequestStats(recursiveRequestLines, request, recursiveWatcher);
  }
  lines.push(...alignTextColumns(recursiveRequestLines));
  const recursiveWatcheLines = [];
  fillRecursiveWatcherStats(recursiveWatcheLines, recursiveWatcher);
  lines.push(...alignTextColumns(recursiveWatcheLines));
  lines.push(
    `
[Non-Recursive Requests (${allNonRecursiveRequests.length}, suspended: ${nonRecursiveRequestsStatus.suspended}, polling: ${nonRecursiveRequestsStatus.polling})]:`
  );
  const nonRecursiveRequestLines = [];
  for (const request of [
    nonSuspendedNonRecursiveRequests,
    suspendedPollingNonRecursiveRequests,
    suspendedNonPollingNonRecursiveRequests
  ].flat()) {
    fillRequestStats(
      nonRecursiveRequestLines,
      request,
      nonRecursiveWatcher
    );
  }
  lines.push(...alignTextColumns(nonRecursiveRequestLines));
  const nonRecursiveWatcheLines = [];
  fillNonRecursiveWatcherStats(nonRecursiveWatcheLines, nonRecursiveWatcher);
  lines.push(...alignTextColumns(nonRecursiveWatcheLines));
  return useParcelWatcher2 ? `

[File Watcher NEXT] request stats:

${lines.join("\n")}

` : `

[File Watcher CLASSIC] request stats:

${lines.join("\n")}

`;
}
__name(computeStats, "computeStats");
function alignTextColumns(lines) {
  let maxLength = 0;
  for (const line of lines) {
    maxLength = Math.max(maxLength, line.split("	")[0].length);
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split("	");
    if (parts.length === 2) {
      const padding = " ".repeat(maxLength - parts[0].length);
      lines[i] = `${parts[0]}${padding}	${parts[1]}`;
    }
  }
  return lines;
}
__name(alignTextColumns, "alignTextColumns");
function computeRequestStatus(requests, watcher) {
  let polling = 0;
  let suspended = 0;
  for (const request of requests) {
    const isSuspended = watcher.isSuspended(request);
    if (isSuspended === false) {
      continue;
    }
    suspended++;
    if (isSuspended === "polling") {
      polling++;
    }
  }
  return { suspended, polling };
}
__name(computeRequestStatus, "computeRequestStatus");
function computeRecursiveWatchStatus(recursiveWatcher) {
  let active = 0;
  let failed = 0;
  let stopped = 0;
  for (const watcher of recursiveWatcher.watchers.values()) {
    if (!watcher.failed && !watcher.stopped) {
      active++;
    }
    if (watcher.failed) {
      failed++;
    }
    if (watcher.stopped) {
      stopped++;
    }
  }
  return { active, failed, stopped };
}
__name(computeRecursiveWatchStatus, "computeRecursiveWatchStatus");
function computeNonRecursiveWatchStatus(nonRecursiveWatcher) {
  let active = 0;
  let failed = 0;
  let reusing = 0;
  for (const watcher of nonRecursiveWatcher.watchers) {
    if (!watcher.instance.failed && !watcher.instance.isReusingRecursiveWatcher) {
      active++;
    }
    if (watcher.instance.failed) {
      failed++;
    }
    if (watcher.instance.isReusingRecursiveWatcher) {
      reusing++;
    }
  }
  return { active, failed, reusing };
}
__name(computeNonRecursiveWatchStatus, "computeNonRecursiveWatchStatus");
function sortByPathPrefix(requests) {
  requests.sort((r1, r2) => {
    const p1 = isUniversalWatchRequest(r1) ? r1.path : r1.request.path;
    const p2 = isUniversalWatchRequest(r2) ? r2.path : r2.request.path;
    const minLength = Math.min(p1.length, p2.length);
    for (let i = 0; i < minLength; i++) {
      if (p1[i] !== p2[i]) {
        return p1[i] < p2[i] ? -1 : 1;
      }
    }
    return p1.length - p2.length;
  });
  return requests;
}
__name(sortByPathPrefix, "sortByPathPrefix");
function isUniversalWatchRequest(obj) {
  const candidate = obj;
  return typeof candidate?.path === "string";
}
__name(isUniversalWatchRequest, "isUniversalWatchRequest");
function fillRequestStats(lines, request, watcher) {
  const decorations = [];
  const suspended = watcher.isSuspended(request);
  if (suspended !== false) {
    if (suspended === "polling") {
      decorations.push("[SUSPENDED <polling>]");
    } else {
      decorations.push("[SUSPENDED <non-polling>]");
    }
  }
  lines.push(
    ` ${request.path}	${decorations.length > 0 ? decorations.join(" ") + " " : ""}(${requestDetailsToString(request)})`
  );
}
__name(fillRequestStats, "fillRequestStats");
function requestDetailsToString(request) {
  return `excludes: ${request.excludes.length > 0 ? request.excludes : "<none>"}, includes: ${request.includes && request.includes.length > 0 ? JSON.stringify(request.includes) : "<all>"}, filter: ${requestFilterToString(request.filter)}, correlationId: ${typeof request.correlationId === "number" ? request.correlationId : "<none>"}`;
}
__name(requestDetailsToString, "requestDetailsToString");
function fillRecursiveWatcherStats(lines, recursiveWatcher) {
  const watchers = sortByPathPrefix(
    Array.from(recursiveWatcher.watchers.values())
  );
  const { active, failed, stopped } = computeRecursiveWatchStatus(recursiveWatcher);
  lines.push(
    `
[Recursive Watchers (${watchers.length}, active: ${active}, failed: ${failed}, stopped: ${stopped})]:`
  );
  for (const watcher of watchers) {
    const decorations = [];
    if (watcher.failed) {
      decorations.push("[FAILED]");
    }
    if (watcher.stopped) {
      decorations.push("[STOPPED]");
    }
    if (watcher.subscriptionsCount > 0) {
      decorations.push(`[SUBSCRIBED:${watcher.subscriptionsCount}]`);
    }
    if (watcher.restarts > 0) {
      decorations.push(`[RESTARTED:${watcher.restarts}]`);
    }
    lines.push(
      ` ${watcher.request.path}	${decorations.length > 0 ? decorations.join(" ") + " " : ""}(${requestDetailsToString(watcher.request)})`
    );
  }
}
__name(fillRecursiveWatcherStats, "fillRecursiveWatcherStats");
function fillNonRecursiveWatcherStats(lines, nonRecursiveWatcher) {
  const allWatchers = sortByPathPrefix(
    Array.from(nonRecursiveWatcher.watchers.values())
  );
  const activeWatchers = allWatchers.filter(
    (watcher) => !watcher.instance.failed && !watcher.instance.isReusingRecursiveWatcher
  );
  const failedWatchers = allWatchers.filter(
    (watcher) => watcher.instance.failed
  );
  const reusingWatchers = allWatchers.filter(
    (watcher) => watcher.instance.isReusingRecursiveWatcher
  );
  const { active, failed, reusing } = computeNonRecursiveWatchStatus(nonRecursiveWatcher);
  lines.push(
    `
[Non-Recursive Watchers (${allWatchers.length}, active: ${active}, failed: ${failed}, reusing: ${reusing})]:`
  );
  for (const watcher of [
    activeWatchers,
    failedWatchers,
    reusingWatchers
  ].flat()) {
    const decorations = [];
    if (watcher.instance.failed) {
      decorations.push("[FAILED]");
    }
    if (watcher.instance.isReusingRecursiveWatcher) {
      decorations.push("[REUSING]");
    }
    lines.push(
      ` ${watcher.request.path}	${decorations.length > 0 ? decorations.join(" ") + " " : ""}(${requestDetailsToString(watcher.request)})`
    );
  }
}
__name(fillNonRecursiveWatcherStats, "fillNonRecursiveWatcherStats");
export {
  computeStats
};
//# sourceMappingURL=watcherStats.js.map
