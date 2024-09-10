var R=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var v=(a,e,r,n)=>{for(var t=n>1?void 0:n?w(e,r):e,o=a.length-1,i;o>=0;o--)(i=a[o])&&(t=(n?i(e,r,t):i(t))||t);return n&&t&&R(e,r,t),t},g=(a,e)=>(r,n)=>e(r,n,a);import*as C from"../../../../base/common/arrays.js";import*as B from"../../../../base/common/collections.js";import*as M from"../../../../base/common/glob.js";import{untildify as G}from"../../../../base/common/labels.js";import{ResourceMap as W}from"../../../../base/common/map.js";import{Schemas as x}from"../../../../base/common/network.js";import*as I from"../../../../base/common/path.js";import{isEqual as T,basename as A,relativePath as k,isAbsolutePath as N}from"../../../../base/common/resources.js";import*as m from"../../../../base/common/strings.js";import{assertIsDefined as $,isDefined as D}from"../../../../base/common/types.js";import{URI as y,URI as z}from"../../../../base/common/uri.js";import{isMultilineRegexSource as L}from"../../../../editor/common/model/textModelSearch.js";import*as q from"../../../../nls.js";import{IConfigurationService as V}from"../../../../platform/configuration/common/configuration.js";import{ILogService as K}from"../../../../platform/log/common/log.js";import{IUriIdentityService as _}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IWorkspaceContextService as j,toWorkspaceFolder as E,WorkbenchState as Q}from"../../../../platform/workspace/common/workspace.js";import{IEditorGroupsService as H}from"../../editor/common/editorGroupsService.js";import{IPathService as J}from"../../path/common/pathService.js";import{getExcludes as X,pathIncludedInQuery as U,QueryType as O}from"./search.js";function Y(a){return typeof a=="object"&&"uri"in a&&"pattern"in a}function Re(a){return typeof a=="string"?{pattern:a}:{pattern:a.pattern,uri:a.baseUri}}let P=class{constructor(e,r,n,t,o,i){this.configurationService=e;this.workspaceContextService=r;this.editorGroupsService=n;this.logService=t;this.pathService=o;this.uriIdentityService=i}text(e,r,n={}){e=this.getContentPattern(e,n);const t=this.configurationService.getValue(),o=r&&r.some(u=>!this.configurationService.getValue({resource:u}).search.useRipgrep);return{...this.commonQuery(r?.map(E),n),type:O.Text,contentPattern:e,previewOptions:n.previewOptions,maxFileSize:n.maxFileSize,usePCRE2:t.search.usePCRE2||o||!1,surroundingContext:n.surroundingContext,userDisabledExcludesAndIgnoreFiles:n.disregardExcludeSettings&&n.disregardIgnoreFiles}}getContentPattern(e,r){const n=this.configurationService.getValue();e.isRegExp&&(e.pattern=e.pattern.replace(/\r?\n/g,"\\n"));const t={...e,wordSeparators:n.editor.wordSeparators};return this.isCaseSensitive(e,r)&&(t.isCaseSensitive=!0),this.isMultiline(e)&&(t.isMultiline=!0),r.notebookSearchConfig?.includeMarkupInput&&(t.notebookInfo||(t.notebookInfo={}),t.notebookInfo.isInNotebookMarkdownInput=r.notebookSearchConfig.includeMarkupInput),r.notebookSearchConfig?.includeMarkupPreview&&(t.notebookInfo||(t.notebookInfo={}),t.notebookInfo.isInNotebookMarkdownPreview=r.notebookSearchConfig.includeMarkupPreview),r.notebookSearchConfig?.includeCodeInput&&(t.notebookInfo||(t.notebookInfo={}),t.notebookInfo.isInNotebookCellInput=r.notebookSearchConfig.includeCodeInput),r.notebookSearchConfig?.includeOutput&&(t.notebookInfo||(t.notebookInfo={}),t.notebookInfo.isInNotebookCellOutput=r.notebookSearchConfig.includeOutput),t}file(e,r={}){return{...this.commonQuery(e,r),type:O.File,filePattern:r.filePattern?r.filePattern.trim():r.filePattern,exists:r.exists,sortByScore:r.sortByScore,cacheKey:r.cacheKey,shouldGlobMatchFilePattern:r.shouldGlobSearch}}handleIncludeExclude(e,r){if(!e)return{};if(Array.isArray(e)){if(e=e.filter(n=>n.length>0).map(S),!e.length)return{}}else e=S(e);return r?this.parseSearchPaths(e):{pattern:b(...Array.isArray(e)?e:[e])}}commonQuery(e=[],r={}){let n=Array.isArray(r.excludePattern)?r.excludePattern.map(l=>l.pattern).flat():r.excludePattern;n=n?.length===1?n[0]:n;const t=this.handleIncludeExclude(r.includePattern,r.expandPatterns),o=this.handleIncludeExclude(n,r.expandPatterns),i=e.length>1,u=(t.searchPaths&&t.searchPaths.length?t.searchPaths.map(l=>this.getFolderQueryForSearchPath(l,r,o)):e.map(l=>this.getFolderQueryForRoot(l,r,o,i))).filter(l=>!!l),s={_reason:r._reason,folderQueries:u,usingSearchPaths:!!(t.searchPaths&&t.searchPaths.length),extraFileResources:r.extraFileResources,excludePattern:o.pattern,includePattern:t.pattern,onlyOpenEditors:r.onlyOpenEditors,maxResults:r.maxResults,onlyFileScheme:r.onlyFileScheme};if(r.onlyOpenEditors){const l=C.coalesce(this.editorGroupsService.groups.flatMap(h=>h.editors.map(p=>p.resource)));this.logService.trace("QueryBuilder#commonQuery - openEditor URIs",JSON.stringify(l));const c=l.filter(h=>U(s,h.fsPath)),f=this.commonQueryFromFileList(c);return this.logService.trace("QueryBuilder#commonQuery - openEditor Query",JSON.stringify(f)),{...s,...f}}const d=r.extraFileResources&&r.extraFileResources.filter(l=>U(s,l.fsPath));return s.extraFileResources=d&&d.length?d:void 0,s}commonQueryFromFileList(e){const r=[],n=new W,t={};let o=!1;return e.forEach(i=>{if(i.scheme===x.walkThrough)return;if(N(i)){const s=this.workspaceContextService.getWorkspaceFolder(i)?.uri??this.uriIdentityService.extUri.dirname(i);let d=n.get(s);d||(o=!0,d={folder:s,includePattern:{}},r.push(d),n.set(s,d));const l=I.relative(s.fsPath,i.fsPath);$(d.includePattern)[l.replace(/\\/g,"/")]=!0}else i.fsPath&&(o=!0,t[i.fsPath]=!0)}),{folderQueries:r,includePattern:t,usingSearchPaths:!0,excludePattern:o?void 0:{"**/*":!0}}}isCaseSensitive(e,r){if(r.isSmartCase){if(e.isRegExp){if(m.containsUppercaseCharacter(e.pattern,!0))return!0}else if(m.containsUppercaseCharacter(e.pattern))return!0}return!!e.isCaseSensitive}isMultiline(e){return e.isMultiline||e.isRegExp&&L(e.pattern)||e.pattern.indexOf(`
`)>=0?!0:!!e.isMultiline}parseSearchPaths(e){const r=c=>I.isAbsolute(c)||/^\.\.?([\/\\]|$)/.test(c),t=(Array.isArray(e)?e:ee(e)).map(c=>{const f=this.pathService.resolvedUserHome;return f?G(c,f.scheme===x.file?f.fsPath:f.path):c}),o=B.groupBy(t,c=>r(c)?"searchPaths":"exprSegments"),i=(o.exprSegments||[]).map(c=>m.rtrim(c,"/")).map(c=>m.rtrim(c,"\\")).map(c=>(c[0]==="."&&(c="*"+c),re(c))),u={},s=this.expandSearchPathPatterns(o.searchPaths||[]);s&&s.length&&(u.searchPaths=s);const d=i.flat(),l=b(...d);return l&&(u.pattern=l),u}getExcludesForFolder(e,r){return r.disregardExcludeSettings?void 0:X(e,!r.disregardSearchExcludeSettings)}expandSearchPathPatterns(e){if(!e||!e.length)return[];const r=e.flatMap(t=>{let{pathPortion:o,globPortion:i}=Z(t);return i&&(i=F(i)),this.expandOneSearchPath(o).flatMap(s=>this.resolveOneSearchPathPattern(s,i))}),n=new Map;return r.forEach(t=>{const o=t.searchPath.toString(),i=n.get(o);i?t.pattern&&(i.pattern=i.pattern||{},i.pattern[t.pattern]=!0):n.set(o,{searchPath:t.searchPath,pattern:t.pattern?b(t.pattern):void 0})}),Array.from(n.values())}expandOneSearchPath(e){if(I.isAbsolute(e)){const r=this.workspaceContextService.getWorkspace().folders;return r[0]&&r[0].uri.scheme!==x.file?[{searchPath:r[0].uri.with({path:e})}]:[{searchPath:z.file(I.normalize(e))}]}if(this.workspaceContextService.getWorkbenchState()===Q.FOLDER){const r=this.workspaceContextService.getWorkspace().folders[0].uri;if(e=S(e),e.startsWith("../")||e===".."){const t=I.posix.resolve(r.path,e);return[{searchPath:r.with({path:t})}]}const n=F(e);return[{searchPath:r,pattern:n}]}else{if(e==="./"||e===".\\")return[];{const r=e.replace(/^\.[\/\\]/,""),t=this.workspaceContextService.getWorkspace().folders.map(o=>{const i=r.match(new RegExp(`^${m.escapeRegExpCharacters(o.name)}(?:/(.*)|$)`));return i?{match:i,folder:o}:null}).filter(D);if(t.length)return t.map(o=>{const i=o.match[1];return{searchPath:o.folder.uri,pattern:i&&F(i)}});{const o=e.match(/\.[\/\\](.+)[\/\\]?/),i=o?o[1]:e,u=q.localize("search.noWorkspaceWithName","Workspace folder does not exist: {0}",i);throw new Error(u)}}}}resolveOneSearchPathPattern(e,r){const n=e.pattern&&r?`${e.pattern}/${r}`:e.pattern||r,t=[{searchPath:e.searchPath,pattern:n}];return n&&!n.endsWith("**")&&t.push({searchPath:e.searchPath,pattern:n+"/**"}),t}getFolderQueryForSearchPath(e,r,n){const t=this.getFolderQueryForRoot(E(e.searchPath),r,n,!1);return t?{...t,includePattern:e.pattern}:null}getFolderQueryForRoot(e,r,n,t){let o;const i=y.isUri(e)?e:e.uri;let u=r.excludePattern?.map(h=>{const p=r.excludePattern&&Y(h)?h.uri:void 0;return!p||!(y.isUri(e)&&this.uriIdentityService.extUri.isEqual(e,p))?p:void 0});if(u?.length||(u=[void 0]),n.searchPaths){const h=n.searchPaths.filter(p=>T(p.searchPath,i))[0];if(h&&!h.pattern)return null;h&&(o=h.pattern)}const s=this.configurationService.getValue({resource:i}),l={...this.getExcludesForFolder(s,r)||{},...o||{}},c=y.isUri(e)?A(e):e.name,f=u.map(h=>Object.keys(l).length>0?{folder:h,pattern:l}:void 0).filter(h=>h);return{folder:i,folderName:t?c:void 0,excludePattern:f,fileEncoding:s.files&&s.files.encoding,disregardIgnoreFiles:typeof r.disregardIgnoreFiles=="boolean"?r.disregardIgnoreFiles:!s.search.useIgnoreFiles,disregardGlobalIgnoreFiles:typeof r.disregardGlobalIgnoreFiles=="boolean"?r.disregardGlobalIgnoreFiles:!s.search.useGlobalIgnoreFiles,disregardParentIgnoreFiles:typeof r.disregardParentIgnoreFiles=="boolean"?r.disregardParentIgnoreFiles:!s.search.useParentIgnoreFiles,ignoreSymlinks:typeof r.ignoreSymlinks=="boolean"?r.ignoreSymlinks:!s.search.followSymlinks}}};P=v([g(0,V),g(1,j),g(2,H),g(3,K),g(4,J),g(5,_)],P);function Z(a){const e=a.match(/[\*\{\}\(\)\[\]\?]/);if(e){const r=e.index,n=a.substr(0,r).match(/[/|\\][^/\\]*$/);if(n){let t=a.substr(0,n.index);return t.match(/[/\\]/)||(t+="/"),{pathPortion:t,globPortion:a.substr((n.index||0)+1)}}}return{pathPortion:a}}function b(...a){return a.length?a.reduce((e,r)=>(e[r]=!0,e),Object.create(null)):void 0}function ee(a){return M.splitGlobAware(a,",").map(e=>e.trim()).filter(e=>!!e.length)}function re(a){return[`**/${a}/**`,`**/${a}`].map(r=>r.replace(/\*\*\/\*\*/g,"**"))}function S(a){return a.replace(/\\/g,"/")}function F(a){return S(a).replace(/^\.\//,"").replace(/\/+$/g,"")}function te(a){return a.replace(/([?*[\]])/g,"[$1]")}function we(a,e){a=C.distinct(a,t=>t.toString());const r=[],n=e.getWorkspace();return a&&a.forEach(t=>{let o;if(e.getWorkbenchState()===Q.FOLDER)o=k(n.folders[0].uri,t),o&&o!=="."&&(o="./"+o);else{const i=e.getWorkspaceFolder(t);if(i){const u=i.name;if(n.folders.filter(d=>d.name===u).length===1){const d=k(i.uri,t);d===""?o=`./${i.name}`:o=`./${i.name}/${d}`}else o=t.fsPath}}o&&r.push(te(o))}),r}export{P as QueryBuilder,Re as globPatternToISearchPatternBuilder,Y as isISearchPatternBuilder,we as resolveResourcesForSearchIncludes};
