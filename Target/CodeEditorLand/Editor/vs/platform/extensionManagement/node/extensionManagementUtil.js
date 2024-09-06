import{buffer as o,ExtractError as i}from"../../../base/node/zip.js";import{localize as a}from"../../../nls.js";import"../../extensions/common/extensions.js";import{toExtensionManagementError as f}from"../common/abstractExtensionManagementService.js";import{ExtensionManagementError as s,ExtensionManagementErrorCode as e}from"../common/extensionManagement.js";function p(r){let t=e.Extract;return r instanceof i&&(r.type==="CorruptZip"?t=e.CorruptZip:r.type==="Incomplete"&&(t=e.IncompleteZip)),f(r,t)}async function u(r){let t;try{t=await o(r,"extension/package.json")}catch(n){throw p(n)}try{return JSON.parse(t.toString("utf8"))}catch{throw new s(a("invalidManifest","VSIX invalid: package.json is not a JSON file."),e.Invalid)}}export{p as fromExtractError,u as getManifest};
