import"../../../../../vs/base/common/platform.js";import{StorageScope as n}from"../../../../../vs/platform/storage/common/storage.js";import{resolveCommonProperties as P}from"../../../../../vs/platform/telemetry/common/commonProperties.js";import{firstSessionDateStorageKey as p,lastSessionDateStorageKey as v}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{cleanRemoteAuthority as C}from"../../../../../vs/platform/telemetry/common/telemetryUtils.js";function O(r,s,i,m,c,a,S,g,l,e,f){const o=P(s,i,e.arch,m,c,a,S,g,l),I=r.get(p,n.APPLICATION),t=r.get(v,n.APPLICATION);return o["common.version.shell"]=e.versions?.electron,o["common.version.renderer"]=e.versions?.chrome,o["common.firstSessionDate"]=I,o["common.lastSessionDate"]=t||"",o["common.isNewSession"]=t?"0":"1",o["common.remoteAuthority"]=C(f),o["common.cli"]=!!e.env.VSCODE_CLI,o}export{O as resolveWorkbenchCommonProperties};
