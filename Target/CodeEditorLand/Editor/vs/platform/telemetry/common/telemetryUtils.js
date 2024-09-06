import{cloneAndChange as g,safeStringify as c}from"../../../base/common/objects.js";import{isObject as y}from"../../../base/common/types.js";import"../../../base/common/uri.js";import"../../configuration/common/configuration.js";import"../../environment/common/environment.js";import"../../product/common/productService.js";import{getRemoteName as T}from"../../remote/common/remoteHosts.js";import{verifyMicrosoftInternalDomain as I}from"./commonProperties.js";import{TELEMETRY_CRASH_REPORTER_SETTING_ID as x,TELEMETRY_OLD_SETTING_ID as E,TELEMETRY_SETTING_ID as b,TelemetryConfiguration as u,TelemetryLevel as a}from"./telemetry.js";class h{constructor(t){this.value=t}isTrustedTelemetryValue=!0}class v{telemetryLevel=a.NONE;sessionId="someValue.sessionId";machineId="someValue.machineId";sqmId="someValue.sqmId";devDeviceId="someValue.devDeviceId";firstSessionDate="someValue.firstSessionDate";sendErrorTelemetry=!1;publicLog(){}publicLog2(){}publicLogError(){}publicLogError2(){}setExperimentProperty(){}}const F=new v;class Y{_serviceBrand;async publicLog(t,r,o){}async publicLogError(t,r,o){}}const k="telemetry",q="extensionTelemetryLog",K={log:()=>null,flush:()=>Promise.resolve(null)};function j(e,t){return!t.isBuilt&&!t.disableTelemetry?!0:!(t.disableTelemetry||!e.enableTelemetry)}function W(e,t){return t.extensionTestsLocationURI?!0:!(t.isBuilt||t.disableTelemetry||e.enableTelemetry&&e.aiConfig?.ariaKey)}function J(e){const t=e.getValue(b),r=e.getValue(x);if(e.getValue(E)===!1||r===!1)return a.NONE;switch(t??u.ON){case u.ON:return a.USAGE;case u.ERROR:return a.ERROR;case u.CRASH:return a.CRASH;case u.OFF:return a.NONE}}function Q(e){const t={},r={},o={};d(e,o);for(let s in o){s=s.length>150?s.substr(s.length-149):s;const n=o[s];typeof n=="number"?r[s]=n:typeof n=="boolean"?r[s]=n?1:0:typeof n=="string"?(n.length>8192&&console.warn(`Telemetry property: ${s} has been trimmed to 8192, the original length is ${n.length}`),t[s]=n.substring(0,8191)):typeof n<"u"&&n!==null&&(t[s]=n)}return{properties:t,measurements:r}}const R=new Set(["ssh-remote","dev-container","attached-container","wsl","tunnel","codespaces","amlext"]);function X(e){if(!e)return"none";const t=T(e);return R.has(t)?t:"other"}function d(e,t,r=0,o){if(e)for(const s of Object.getOwnPropertyNames(e)){const n=e[s],i=o?o+s:s;Array.isArray(n)?t[i]=c(n):n instanceof Date?t[i]=n.toISOString():y(n)?r<2?d(n,t,r+1,i+"."):t[i]=c(n):t[i]=n}}function ee(e,t){const r=e.msftInternalDomains||[],o=t.getValue("telemetry.internalTesting");return I(r)||o}function te(e){return[e.appRoot,e.extensionsPath,e.userHome.fsPath,e.tmpDir.fsPath,e.userDataPath]}function P(e,t){if(!e||!e.includes("/")&&!e.includes("\\"))return e;let r=e;const o=[];for(const l of t)for(;;){const m=l.exec(e);if(!m)break;o.push([m.index,l.lastIndex])}const s=/^[\\\/]?(node_modules|node_modules\.asar)[\\\/]/,n=/(file:\/\/)?([a-zA-Z]:(\\\\|\\|\/)|(\\\\|\\|\/))?([\w-\._]+(\\\\|\\|\/))+[\w-\._]*/g;let i=0;for(r="";;){const l=n.exec(e);if(!l)break;const m=o.some(([f,p])=>l.index<p&&f<n.lastIndex);!s.test(l[0])&&!m&&(r+=e.substring(i,l.index)+"<REDACTED: user-file-path>",i=n.lastIndex)}return i<e.length&&(r+=e.substr(i)),r}function D(e){if(!e)return e;const t=[{label:"Google API Key",regex:/AIza[A-Za-z0-9_\\\-]{35}/},{label:"Slack Token",regex:/xox[pbar]\-[A-Za-z0-9]/},{label:"GitHub Token",regex:/(gh[psuro]_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})/},{label:"Generic Secret",regex:/(key|token|sig|secret|signature|password|passwd|pwd|android:value)[^a-zA-Z0-9]/i},{label:"CLI Credentials",regex:/((login|psexec|(certutil|psexec)\.exe).{1,50}(\s-u(ser(name)?)?\s+.{3,100})?\s-(admin|user|vm|root)?p(ass(word)?)?\s+["']?[^$\-\/\s]|(^|[\s\r\n\\])net(\.exe)?.{1,5}(user\s+|share\s+\/user:| user -? secrets ? set) \s + [^ $\s \/])/},{label:"Email",regex:/@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/}];for(const r of t)if(r.regex.test(e))return`<REDACTED: ${r.label}>`;return e}function re(e,t){return g(e,r=>{if(r instanceof h||Object.hasOwnProperty.call(r,"isTrustedTelemetryValue"))return r.value;if(typeof r=="string"){let o=r.replaceAll("%20"," ");o=P(o,t);for(const s of t)o=o.replace(s,"");return o=D(o),o}})}export{K as NullAppender,Y as NullEndpointTelemetryService,F as NullTelemetryService,v as NullTelemetryServiceShape,h as TelemetryTrustedValue,re as cleanData,X as cleanRemoteAuthority,q as extensionTelemetryLogChannelId,te as getPiiPathsFromEnvironment,J as getTelemetryLevel,ee as isInternalTelemetry,W as isLoggingOnly,j as supportsTelemetry,k as telemetryLogId,Q as validateTelemetryData};
