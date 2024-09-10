import*as C from"child_process";import*as S from"fs";import*as p from"../../../../base/common/path.js";import{StringDecoder as y}from"string_decoder";import*as k from"../../../../base/common/arrays.js";import{toErrorMessage as D}from"../../../../base/common/errorMessage.js";import*as m from"../../../../base/common/glob.js";import*as R from"../../../../base/common/normalization.js";import{isEqualOrParent as M}from"../../../../base/common/extpath.js";import*as H from"../../../../base/common/platform.js";import{StopWatch as W}from"../../../../base/common/stopwatch.js";import*as A from"../../../../base/common/strings.js";import*as z from"../../../../base/common/types.js";import{Promises as B}from"../../../../base/node/pfs.js";import{isFilePatternMatch as T,hasSiblingFn as L}from"../common/search.js";import{spawnRipgrepCmd as j}from"./ripgrepFileSearch.js";import{prepareQuery as O}from"../../../../base/common/fuzzyScorer.js";const w=new Set;process.on("exit",()=>{w.forEach(b=>b())});class N{config;filePattern;normalizedFilePatternLowercase=null;includePattern;maxResults;exists;maxFilesize=null;isLimitHit;resultCount;isCanceled=!1;fileWalkSW=null;directoriesWalked;filesWalked;errors;cmdSW=null;cmdResultCount=0;folderExcludePatterns;globalExcludePattern;walkedPaths;constructor(e){this.config=e,this.filePattern=e.filePattern||"",this.includePattern=e.includePattern&&m.parse(e.includePattern),this.maxResults=e.maxResults||null,this.exists=!!e.exists,this.walkedPaths=Object.create(null),this.resultCount=0,this.isLimitHit=!1,this.directoriesWalked=0,this.filesWalked=0,this.errors=[],this.filePattern&&(this.normalizedFilePatternLowercase=e.shouldGlobMatchFilePattern?null:O(this.filePattern).normalizedLowercase),this.globalExcludePattern=e.excludePattern&&m.parse(e.excludePattern),this.folderExcludePatterns=new Map,e.folderQueries.forEach(t=>{const r={};t.excludePattern?.forEach(s=>{Object.assign(r,s.pattern||{},this.config.excludePattern||{})}),t.excludePattern?.length||Object.assign(r,this.config.excludePattern||{});const i=t.folder.fsPath;e.folderQueries.map(s=>s.folder.fsPath).filter(s=>s!==i).forEach(s=>{M(s,i)&&(r[p.relative(i,s)]=!0)}),this.folderExcludePatterns.set(i,new Q(r,i))})}cancel(){this.isCanceled=!0,w.forEach(e=>e())}walk(e,t,r,i,s,o){if(this.fileWalkSW=W.create(!1),this.isCanceled)return o(null,this.isLimitHit);t.forEach(l=>{const n=p.basename(l.fsPath);this.globalExcludePattern&&this.globalExcludePattern(l.fsPath,n)||this.matchFile(i,{relativePath:l.fsPath,searchPath:void 0})}),this.cmdSW=W.create(!1),this.parallel(e,(l,n)=>{this.call(this.cmdTraversal,this,l,r,i,s,a=>{if(a){const u=D(a);console.error(u),this.errors.push(u),n(a,void 0)}else n(null,void 0)})},(l,n)=>{this.fileWalkSW.stop();const a=l?k.coalesce(l)[0]:null;o(a,this.isLimitHit)})}parallel(e,t,r){const i=new Array(e.length),s=new Array(e.length);let o=!1,l=0;if(e.length===0)return r(null,[]);e.forEach((n,a)=>{t(n,(u,d)=>{if(u?(o=!0,i[a]=null,s[a]=u):(i[a]=d,s[a]=null),++l===e.length)return r(o?s:null,i)})})}call(e,t,...r){try{e.apply(t,r)}catch(i){r[r.length-1](i)}}cmdTraversal(e,t,r,i,s){const o=e.folder.fsPath,l=H.isMacintosh,n=()=>g&&g.kill();w.add(n);let a=h=>{w.delete(n),a=()=>{},s(h)},u="";const d=this.initDirectoryTree(),c=j(this.config,e,this.config.includePattern,this.folderExcludePatterns.get(e.folder.fsPath).expression,t),g=c.cmd,E=!Object.keys(c.siblingClauses).length,P=c.rgArgs.args.map(h=>h.match(/^-/)?h:`'${h}'`).join(" ");let v=`${c.rgDiskPath} ${P}
 - cwd: ${c.cwd}`;c.rgArgs.siblingClauses&&(v+=`
 - Sibling clauses: ${JSON.stringify(c.rgArgs.siblingClauses)}`),i({message:v}),this.cmdResultCount=0,this.collectStdout(g,"utf8",i,(h,I,F)=>{if(h){a(h);return}if(this.isLimitHit){a();return}const f=(u+(l?R.normalizeNFC(I||""):I)).split(`
`);if(F){const x=f.length;f[x-1]=f[x-1].trim(),f[x-1]||f.pop()}else u=f.pop()||"";if(f.length&&f[0].indexOf(`
`)!==-1){a(new Error("Splitting up files failed"));return}if(this.cmdResultCount+=f.length,E){for(const x of f)if(this.matchFile(r,{base:o,relativePath:x,searchPath:this.getSearchPath(e,x)}),this.isLimitHit){n();break}(F||this.isLimitHit)&&a();return}this.addDirectoryEntries(e,d,o,f,r),F&&(this.matchDirectoryTree(d,o,r),a())})}spawnFindCmd(e){const t=this.folderExcludePatterns.get(e.folder.fsPath),r=t.getBasenameTerms(),i=t.getPathTerms(),s=["-L","."];if(r.length||i.length){s.push("-not","(","(");for(const o of r)s.push("-name",o),s.push("-o");for(const o of i)s.push("-path",o),s.push("-o");s.pop(),s.push(")","-prune",")")}return s.push("-type","f"),C.spawn("find",s,{cwd:e.folder.fsPath})}readStdout(e,t,r){let i="";this.collectStdout(e,t,()=>{},(s,o,l)=>{if(s){r(s);return}i+=o,l&&r(null,i)})}collectStdout(e,t,r,i){let s=(n,a,u)=>{(n||u)&&(s=()=>{},this.cmdSW?.stop()),i(n,a,u)},o=!1;e.stdout?(this.forwardData(e.stdout,t,s),e.stdout.once("data",()=>o=!0)):r({message:"stdout is null"});let l;e.stderr?l=this.collectData(e.stderr):r({message:"stderr is null"}),e.on("error",n=>{s(n)}),e.on("close",n=>{let a;!o&&(a=this.decodeData(l,t))&&$(a)?s(new Error(`command failed with error code ${n}: ${this.decodeData(l,t)}`)):(this.exists&&n===0&&(this.isLimitHit=!0),s(null,"",!0))})}forwardData(e,t,r){const i=new y(t);return e.on("data",s=>{r(null,i.write(s))}),i}collectData(e){const t=[];return e.on("data",r=>{t.push(r)}),t}decodeData(e,t){const r=new y(t);return e.map(i=>r.write(i)).join("")}initDirectoryTree(){const e={rootEntries:[],pathToEntries:Object.create(null)};return e.pathToEntries["."]=e.rootEntries,e}addDirectoryEntries(e,{pathToEntries:t},r,i,s){i.indexOf(this.filePattern)!==-1&&this.matchFile(s,{base:r,relativePath:this.filePattern,searchPath:this.getSearchPath(e,this.filePattern)});const o=l=>{const n=p.basename(l),a=p.dirname(l);let u=t[a];u||(u=t[a]=[],o(a)),u.push({base:r,relativePath:l,basename:n,searchPath:this.getSearchPath(e,l)})};i.forEach(o)}matchDirectoryTree({rootEntries:e,pathToEntries:t},r,i){const s=this,o=this.folderExcludePatterns.get(r),l=this.filePattern;function n(a){s.directoriesWalked++;const u=L(()=>a.map(d=>d.basename));for(let d=0,c=a.length;d<c;d++){const g=a[d],{relativePath:E,basename:P}=g;if(o.test(E,P,l!==P?u:void 0))continue;const v=t[E];if(v)n(v);else{if(s.filesWalked++,E===l)continue;s.matchFile(i,g)}if(s.isLimitHit)break}}n(e)}getStats(){return{cmdTime:this.cmdSW.elapsed(),fileWalkTime:this.fileWalkSW.elapsed(),directoriesWalked:this.directoriesWalked,filesWalked:this.filesWalked,cmdResultCount:this.cmdResultCount}}doWalk(e,t,r,i,s){const o=e.folder,l=L(()=>r);this.parallel(r,(n,a)=>{if(this.isCanceled||this.isLimitHit)return a(null);const u=t?[t,n].join(p.sep):n;if(this.folderExcludePatterns.get(e.folder.fsPath).test(u,n,this.config.filePattern!==n?l:void 0))return a(null);const d=[o.fsPath,u].join(p.sep);S.lstat(d,(c,g)=>{if(c||this.isCanceled||this.isLimitHit)return a(null);this.statLinkIfNeeded(d,g,(E,P)=>E||this.isCanceled||this.isLimitHit?a(null):P.isDirectory()?(this.directoriesWalked++,this.realPathIfNeeded(d,g,(v,h)=>v||this.isCanceled||this.isLimitHit||(h=h||"",this.walkedPaths[h])?a(null):(this.walkedPaths[h]=!0,B.readdir(d).then(I=>{if(this.isCanceled||this.isLimitHit)return a(null);this.doWalk(e,u,I,i,F=>a(F||null))},I=>{a(null)})))):(this.filesWalked++,u===this.filePattern||this.maxFilesize&&z.isNumber(P.size)&&P.size>this.maxFilesize||this.matchFile(i,{base:o.fsPath,relativePath:u,searchPath:this.getSearchPath(e,u)}),a(null,void 0)))})},n=>{const a=n&&k.coalesce(n);return s(a&&a.length>0?a[0]:void 0)})}matchFile(e,t){this.isFileMatch(t)&&(!this.includePattern||this.includePattern(t.relativePath,p.basename(t.relativePath)))&&(this.resultCount++,(this.exists||this.maxResults&&this.resultCount>this.maxResults)&&(this.isLimitHit=!0),this.isLimitHit||e(t))}isFileMatch(e){if(this.filePattern){if(this.filePattern==="*")return!0;if(this.normalizedFilePatternLowercase)return T(e,this.normalizedFilePatternLowercase);if(this.filePattern)return T(e,this.filePattern,!1)}return!0}statLinkIfNeeded(e,t,r){return t.isSymbolicLink()?S.stat(e,r):r(null,t)}realPathIfNeeded(e,t,r){return t.isSymbolicLink()?S.realpath(e,(i,s)=>i?r(i):r(null,s)):r(null,e)}getSearchPath(e,t){return e.folderName?p.join(e.folderName,t):t}}class de{folderQueries;extraFiles;walker;numThreads;constructor(e,t){this.folderQueries=e.folderQueries,this.extraFiles=e.extraFileResources||[],this.numThreads=t,this.walker=new N(e)}search(e,t,r){this.walker.walk(this.folderQueries,this.extraFiles,this.numThreads,e,t,(i,s)=>{r(i,{limitHit:s,stats:this.walker.getStats(),messages:[]})})}cancel(){this.walker.cancel()}}class Q{constructor(e,t){this.expression=e;this.root=t;this.init(e)}absoluteParsedExpr;relativeParsedExpr;init(e){let t,r;Object.keys(e).filter(i=>e[i]).forEach(i=>{p.isAbsolute(i)?(t=t||m.getEmptyExpression(),t[i]=e[i]):(r=r||m.getEmptyExpression(),r[i]=e[i])}),this.absoluteParsedExpr=t&&m.parse(t,{trimForExclusions:!0}),this.relativeParsedExpr=r&&m.parse(r,{trimForExclusions:!0})}test(e,t,r){return this.relativeParsedExpr&&this.relativeParsedExpr(e,t,r)||this.absoluteParsedExpr&&this.absoluteParsedExpr(p.join(this.root,e),t,r)}getBasenameTerms(){const e=[];return this.absoluteParsedExpr&&e.push(...m.getBasenameTerms(this.absoluteParsedExpr)),this.relativeParsedExpr&&e.push(...m.getBasenameTerms(this.relativeParsedExpr)),e}getPathTerms(){const e=[];return this.absoluteParsedExpr&&e.push(...m.getPathTerms(this.absoluteParsedExpr)),this.relativeParsedExpr&&e.push(...m.getPathTerms(this.relativeParsedExpr)),e}}function $(b){const e=b.trim().split(`
`),t=e[0].trim();if(t.startsWith("Error parsing regex"))return t;if(t.startsWith("regex parse error"))return A.uppercaseFirstLetter(e[e.length-1].trim());if(t.startsWith("error parsing glob")||t.startsWith("unsupported encoding"))return t.charAt(0).toUpperCase()+t.substr(1);if(t==="Literal '\\n' not allowed.")return"Literal '\\n' currently not supported";if(t.startsWith("Literal "))return t}export{de as Engine,N as FileWalker};
