import*as d from"child_process";import{rgPath as I}from"@vscode/ripgrep";import*as x from"../../../../base/common/extpath.js";import{normalizeNFD as u}from"../../../../base/common/normalization.js";import*as c from"../../../../base/common/path.js";import{isMacintosh as b}from"../../../../base/common/platform.js";import*as f from"../../../../base/common/strings.js";import{anchorGlob as p}from"./ripgrepSearchUtils.js";const m=I.replace(/\bnode_modules\.asar\b/,"node_modules.asar.unpacked");function v(r,o,l,t,i){const s=E(r,o,l,t,i),n=o.folder.fsPath;return{cmd:d.spawn(m,s.args,{cwd:n}),rgDiskPath:m,siblingClauses:s.siblingClauses,rgArgs:s,cwd:n}}function E(r,o,l,t,i){const s=["--files","--hidden","--case-sensitive","--no-require-git"];F([o],l,!1).forEach(g=>{const e=p(g);if(s.push("-g",e),b){const a=u(e);a!==e&&s.push("-g",a)}});const n=C([o],t,void 0,!1);return n.globArgs.forEach(g=>{const e=`!${p(g)}`;if(s.push("-g",e),b){const a=u(e);a!==e&&s.push("-g",a)}}),o.disregardIgnoreFiles!==!1?s.push("--no-ignore"):o.disregardParentIgnoreFiles!==!1&&s.push("--no-ignore-parent"),o.ignoreSymlinks||s.push("--follow"),r.exists&&s.push("--quiet"),i&&s.push("--threads",`${i}`),s.push("--no-config"),o.disregardGlobalIgnoreFiles&&s.push("--no-ignore-global"),{args:s,siblingClauses:n.siblingClauses}}function C(r,o,l,t=!0){const i=[];let s={};return r.forEach(n=>{const g=Object.assign({},n.excludePattern||{},o||{}),e=h(g,t?n.folder.fsPath:void 0,l);i.push(...e.globArgs),e.siblingClauses&&(s=Object.assign(s,e.siblingClauses))}),{globArgs:i,siblingClauses:s}}function F(r,o,l=!0){const t=[];return r.forEach(i=>{const s=Object.assign({},o||{},i.includePattern||{}),n=h(s,l?i.folder.fsPath:void 0);t.push(...n.globArgs)}),t}function h(r,o,l){const t=[],i={};return Object.keys(r).forEach(s=>{if(l&&l.has(s)||!s)return;const n=r[s];s=R(o?A(o,s):s),s.startsWith("\\\\")?s="\\\\"+s.substr(2).replace(/\\/g,"/"):s=s.replace(/\\/g,"/"),typeof n=="boolean"&&n?(s.startsWith("\\\\")&&(s+="**"),t.push(G(s))):n&&n.when&&(i[s]=n)}),{globArgs:t,siblingClauses:i}}function A(r,o){return c.isAbsolute(o)?o:c.join(r,o)}function R(r){return r=f.rtrim(r,"\\"),f.rtrim(r,"/")}function G(r){return x.getRoot(r).toLowerCase()==="c:/"?r.replace(/^c:[/\\]/i,"/"):r}export{G as fixDriveC,A as getAbsoluteGlob,v as spawnRipgrepCmd};
