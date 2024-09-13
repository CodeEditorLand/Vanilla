var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { constants as FSConstants, promises as FSPromises } from "fs";
import { createInterface as readLines } from "readline";
import * as Platform from "../common/platform.js";
async function getOSReleaseInfo(errorLogger) {
  if (Platform.isMacintosh || Platform.isWindows) {
    return;
  }
  let handle;
  for (const filePath of ["/etc/os-release", "/usr/lib/os-release", "/etc/lsb-release"]) {
    try {
      handle = await FSPromises.open(filePath, FSConstants.R_OK);
      break;
    } catch (err) {
    }
  }
  if (!handle) {
    errorLogger("Unable to retrieve release information from known identifier paths.");
    return;
  }
  try {
    const osReleaseKeys = /* @__PURE__ */ new Set([
      "ID",
      "DISTRIB_ID",
      "ID_LIKE",
      "VERSION_ID",
      "DISTRIB_RELEASE"
    ]);
    const releaseInfo = {
      id: "unknown"
    };
    for await (const line of readLines({ input: handle.createReadStream(), crlfDelay: Infinity })) {
      if (!line.includes("=")) {
        continue;
      }
      const key = line.split("=")[0].toUpperCase().trim();
      if (osReleaseKeys.has(key)) {
        const value = line.split("=")[1].replace(/"/g, "").toLowerCase().trim();
        if (key === "ID" || key === "DISTRIB_ID") {
          releaseInfo.id = value;
        } else if (key === "ID_LIKE") {
          releaseInfo.id_like = value;
        } else if (key === "VERSION_ID" || key === "DISTRIB_RELEASE") {
          releaseInfo.version_id = value;
        }
      }
    }
    return releaseInfo;
  } catch (err) {
    errorLogger(err);
  }
  return;
}
__name(getOSReleaseInfo, "getOSReleaseInfo");
export {
  getOSReleaseInfo
};
//# sourceMappingURL=osReleaseInfo.js.map
