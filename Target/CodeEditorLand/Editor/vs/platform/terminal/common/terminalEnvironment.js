import{OperatingSystem as o,OS as l}from"../../../../vs/base/common/platform.js";function a(n){let t=n;t.includes("\\")&&(t=t.replace(/\\/g,"\\\\"));const e=/[\`\$\|\&\>\~\#\!\^\*\;\<\"\']/g;return t=t.replace(e,""),`'${t}'`}function g(n,t,e){if(!n)return"";if(!t)return n;t.match(/[\/\\]$/)&&(t=t.slice(0,t.length-1));const r=n.replace(/\\/g,"/").toLowerCase(),i=t.replace(/\\/g,"/").toLowerCase();return r.includes(i)?`~${e}${n.slice(t.length+1)}`:n}function f(n){return n.match(/^['"].*['"]$/)&&(n=n.substring(1,n.length-1)),l===o.Windows&&n&&n[1]===":"?n[0].toUpperCase()+n.substring(1):n}function c(n){return!n.strictEnv}export{g as collapseTildePath,a as escapeNonWindowsPath,f as sanitizeCwd,c as shouldUseEnvironmentVariableCollection};
