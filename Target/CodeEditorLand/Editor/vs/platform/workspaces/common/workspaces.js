import"../../../base/common/event.js";import{isUNC as F,toSlashes as w}from"../../../base/common/extpath.js";import*as S from"../../../base/common/json.js";import*as u from"../../../base/common/jsonEdit.js";import"../../../base/common/jsonFormatter.js";import{normalizeDriveLetter as A}from"../../../base/common/labels.js";import{Schemas as U}from"../../../base/common/network.js";import{isAbsolute as b,posix as I}from"../../../base/common/path.js";import{isLinux as O,isMacintosh as x,isWindows as m}from"../../../base/common/platform.js";import{isEqualAuthority as v}from"../../../base/common/resources.js";import{URI as p}from"../../../base/common/uri.js";import"../../backup/common/backup.js";import{createDecorator as P}from"../../instantiation/common/instantiation.js";import"../../log/common/log.js";import{getRemoteAuthority as z}from"../../remote/common/remoteHosts.js";import{WorkspaceFolder as E}from"../../workspace/common/workspace.js";const de=P("workspacesService");function fe(e){return e.hasOwnProperty("workspace")}function D(e){return e.hasOwnProperty("folderUri")}function ue(e){return e.hasOwnProperty("fileUri")}function B(e){return k(e)||R(e)}function k(e){const t=e;return typeof t?.path=="string"&&(!t.name||typeof t.name=="string")}function R(e){const t=e;return typeof t?.uri=="string"&&(!t.name||typeof t.name=="string")}function j(e,t,r,s,a){if(e.scheme!==s.scheme)return{name:r,uri:e.toString(!0)};let o=t?void 0:a.relativePath(s,e);if(o!==void 0)o.length===0?o=".":m&&(o=h(o));else if(e.scheme===U.file)o=e.fsPath,m&&(o=h(o));else if(a.isEqualAuthority(e.authority,s.authority))o=e.path;else return{name:r,uri:e.toString(!0)};return{name:r,path:o}}function h(e){return e=A(e),F(e)||(e=w(e)),e}function ke(e,t,r){const s=[],a=new Set,o=r.dirname(t);for(const n of e){let i;if(k(n))n.path&&(i=r.resolvePath(o,n.path));else if(R(n))try{i=p.parse(n.uri),i.path[0]!==I.sep&&(i=i.with({path:I.sep+i.path}))}catch(c){console.warn(c)}if(i){const c=r.getComparisonKey(i);if(!a.has(c)){a.add(c);const d=n.name||r.basenameOrAuthority(i);s.push(new E({uri:i,name:d,index:s.length},n))}}}return s}function ye(e,t,r,s,a){const o=L(t,e),n=a.dirname(t),i=a.dirname(s),c=[];for(const l of o.folders){const W=k(l)?a.resolvePath(n,l.path):p.parse(l.uri);let y;r?y=!1:y=!k(l)||b(l.path),c.push(j(W,y,l.name,i,a))}const d={insertSpaces:!1,tabSize:4,eol:O||x?`
`:`\r
`},g=u.setProperty(e,["folders"],c,d);let f=u.applyEdits(e,g);return v(o.remoteAuthority,z(s))&&(f=u.applyEdits(f,u.removeProperty(f,["remoteAuthority"],d))),f}function L(e,t){const r=S.parse(t);if(r&&Array.isArray(r.folders))r.folders=r.folders.filter(s=>B(s));else throw new Error(`${e} looks like an invalid workspace file.`);return r}function T(e){return e.workspace&&typeof e.workspace=="object"&&typeof e.workspace.id=="string"&&typeof e.workspace.configPath=="string"}function C(e){return typeof e.folderUri=="string"}function $(e){return typeof e.fileUri=="string"}function Ie(e,t){const r={workspaces:[],files:[]};if(e){const s=function(o,n){for(let i=0;i<o.length;i++)try{n(o[i],i)}catch(c){t.warn(`Error restoring recent entry ${JSON.stringify(o[i])}: ${c.toString()}. Skip entry.`)}},a=e;Array.isArray(a.entries)&&s(a.entries,o=>{const n=o.label,i=o.remoteAuthority;T(o)?r.workspaces.push({label:n,remoteAuthority:i,workspace:{id:o.workspace.id,configPath:p.parse(o.workspace.configPath)}}):C(o)?r.workspaces.push({label:n,remoteAuthority:i,folderUri:p.parse(o.folderUri)}):$(o)&&r.files.push({label:n,remoteAuthority:i,fileUri:p.parse(o.fileUri)})})}return r}function me(e){const t={entries:[]};for(const r of e.workspaces)D(r)?t.entries.push({folderUri:r.folderUri.toString(),label:r.label,remoteAuthority:r.remoteAuthority}):t.entries.push({workspace:{id:r.workspace.id,configPath:r.workspace.configPath.toString()},label:r.label,remoteAuthority:r.remoteAuthority});for(const r of e.files)t.entries.push({fileUri:r.fileUri.toString(),label:r.label,remoteAuthority:r.remoteAuthority});return t}export{de as IWorkspacesService,j as getStoredWorkspaceFolder,ue as isRecentFile,D as isRecentFolder,fe as isRecentWorkspace,B as isStoredWorkspaceFolder,Ie as restoreRecentlyOpened,ye as rewriteWorkspaceFileForNewLocation,me as toStoreData,ke as toWorkspaceFolders};
