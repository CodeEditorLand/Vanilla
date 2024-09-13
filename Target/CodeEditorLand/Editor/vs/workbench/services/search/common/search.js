import{mapArrayOrNot as P}from"../../../../base/common/arrays.js";import{isThenable as y}from"../../../../base/common/async.js";import{isCancellationError as E}from"../../../../base/common/errors.js";import*as C from"../../../../base/common/extpath.js";import*as c from"../../../../base/common/glob.js";import*as m from"../../../../base/common/objects.js";import*as T from"../../../../base/common/path.js";import{fuzzyContains as R,getNLines as F}from"../../../../base/common/strings.js";import{createDecorator as v}from"../../../../platform/instantiation/common/instantiation.js";import{TextSearchCompleteMessageType as M}from"./searchExtTypes.js";const B="workbench.view.search",K="workbench.panel.search",V="workbench.view.search",J="search-result",Y="search.exclude",Z=2e4,g="\u27EA ",S=" characters skipped \u27EB",U=(g.length+S.length+5)*2,$=v("searchService");var w=(n=>(n[n.file=0]="file",n[n.text=1]="text",n[n.aiText=2]="aiText",n))(w||{}),L=(n=>(n[n.File=1]="File",n[n.Text=2]="Text",n[n.aiText=3]="aiText",n))(L||{});function q(t){return!!t.rangeLocations&&!!t.previewText}function ee(t){return!!t.resource}function re(t){return!!t.message}var k=(r=>(r[r.Normal=0]="Normal",r[r.NewSearchStarted=1]="NewSearchStarted",r))(k||{});class te{constructor(e){this.resource=e}results=[]}class ne{rangeLocations=[];previewText;webviewIndex;constructor(e,r,n,s){this.webviewIndex=s;const l=Array.isArray(r)?r:[r];if(n&&n.matchLines===1&&_(l)){e=F(e,n.matchLines);let a="",o=0,i=0;const I=Math.floor(n.charsPerLine/5);for(const u of l){const p=Math.max(u.startColumn-I,0),h=u.startColumn+n.charsPerLine;if(p>i+I+U){const x=g+(p-i)+S;a+=x+e.slice(p,h),o+=p-(i+x.length)}else a+=e.slice(i,h);i=h,this.rangeLocations.push({source:u,preview:new Q(0,u.startColumn-o,u.endColumn-o)})}this.previewText=a}else{const a=Array.isArray(r)?r[0].startLineNumber:r.startLineNumber,o=P(r,i=>({preview:new b(i.startLineNumber-a,i.startColumn,i.endLineNumber-a,i.endColumn),source:i}));this.rangeLocations=Array.isArray(o)?o:[o],this.previewText=e}}}function _(t){const e=t[0].startLineNumber;for(const r of t)if(r.startLineNumber!==e||r.endLineNumber!==e)return!1;return!0}class b{startLineNumber;startColumn;endLineNumber;endColumn;constructor(e,r,n,s){this.startLineNumber=e,this.startColumn=r,this.endLineNumber=n,this.endColumn=s}}class Q extends b{constructor(e,r,n){super(e,r,e,n)}}var N=(r=>(r.List="list",r.Tree="tree",r))(N||{}),z=(a=>(a.Default="default",a.FileNames="fileNames",a.Type="type",a.Modified="modified",a.CountDescending="countDescending",a.CountAscending="countAscending",a))(z||{});function se(t,e=!0){const r=t&&t.files&&t.files.exclude,n=e&&t&&t.search&&t.search.exclude;if(!r&&!n)return;if(!r||!n)return r||n||void 0;let s=Object.create(null);return s=m.mixin(s,m.deepClone(r)),s=m.mixin(s,m.deepClone(n),!0),s}function oe(t,e){return t.excludePattern&&c.match(t.excludePattern,e)?!1:t.includePattern||t.usingSearchPaths?t.includePattern&&c.match(t.includePattern,e)?!0:t.usingSearchPaths?!!t.folderQueries&&t.folderQueries.some(r=>{const n=r.folder.fsPath;if(C.isEqualOrParent(e,n)){const s=T.relative(n,e);return!r.includePattern||!!c.match(r.includePattern,s)}else return!1}):!1:!0}var A=(o=>(o[o.unknownEncoding=1]="unknownEncoding",o[o.regexParseError=2]="regexParseError",o[o.globParseError=3]="globParseError",o[o.invalidLiteral=4]="invalidLiteral",o[o.rgProcessError=5]="rgProcessError",o[o.other=6]="other",o[o.canceled=7]="canceled",o))(A||{});class d extends Error{constructor(r,n){super(r);this.code=n}}function ae(t){const e=t.message;if(E(t))return new d(e,7);try{const r=JSON.parse(e);return new d(r.message,r.code)}catch{return new d(e,6)}}function ie(t){const e={message:t.message,code:t.code};return new Error(JSON.stringify(e))}function le(t){return t.type==="error"?!0:t.type==="success"}function ce(t){return t.type==="success"}function ue(t){return!!t.path}function pe(t,e,r=!0){const n=t.searchPath?t.searchPath:t.relativePath;return r?R(n,e):c.match(e,n)}class me{path;results;constructor(e){this.path=e,this.results=[]}addMatch(e){this.results.push(e)}serialize(){return{path:this.path,results:this.results,numMatches:this.results.length}}}function he(t,e){const r={...t||{},...e||{}};return Object.keys(r).filter(n=>{const s=r[n];return typeof s=="boolean"&&s})}class de{_excludeExpression;_parsedExcludeExpression;_parsedIncludeExpression=null;constructor(e,r){this._excludeExpression=r.excludePattern?.map(s=>({...e.excludePattern||{},...s.pattern||{}}))??[],this._excludeExpression.length===0&&(this._excludeExpression=[e.excludePattern||{}]),this._parsedExcludeExpression=this._excludeExpression.map(s=>c.parse(s));let n=e.includePattern;r.includePattern&&(n?n={...n,...r.includePattern}:n=r.includePattern),n&&(this._parsedIncludeExpression=c.parse(n))}_evalParsedExcludeExpression(e,r,n){let s=null;for(const l of this._parsedExcludeExpression){const a=l(e,r,n);if(typeof a=="string"){s=a;break}}return s}matchesExcludesSync(e,r,n){return!!(this._parsedExcludeExpression&&this._evalParsedExcludeExpression(e,r,n))}includedInQuerySync(e,r,n){return!(this._parsedExcludeExpression&&this._evalParsedExcludeExpression(e,r,n)||this._parsedIncludeExpression&&!this._parsedIncludeExpression(e,r,n))}includedInQuery(e,r,n){const s=()=>this._parsedIncludeExpression?!!this._parsedIncludeExpression(e,r,n):!0;return Promise.all(this._parsedExcludeExpression.map(l=>{const a=l(e,r,n);return y(a)?a.then(o=>o?!1:s()):s()})).then(l=>l.some(a=>!!a))}hasSiblingExcludeClauses(){return this._excludeExpression.reduce((e,r)=>D(r)||e,!1)}}function D(t){for(const e in t)if(typeof t[e]!="boolean")return!0;return!1}function Ie(t){if(!t)return;let e;return r=>(e||(e=(t()||Promise.resolve([])).then(n=>n?f(n):{})),e.then(n=>!!n[r]))}function xe(t){if(!t)return;let e;return r=>{if(!e){const n=t();e=n?f(n):{}}return!!e[r]}}function f(t){const e={};for(const r of t)e[r]=!0;return e}function ge(t){return t.flatMap(e=>e.patterns.map(r=>e.baseUri?{baseUri:e.baseUri,pattern:r}:r))}const Se={matchLines:100,charsPerLine:1e4};export{Z as DEFAULT_MAX_SEARCH_RESULTS,Se as DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS,te as FileMatch,$ as ISearchService,Q as OneLineRange,K as PANEL_ID,de as QueryGlobTester,L as QueryType,Y as SEARCH_EXCLUDE_CONFIG,J as SEARCH_RESULT_LANGUAGE_ID,k as SearchCompletionExitCode,d as SearchError,A as SearchErrorCode,w as SearchProviderType,b as SearchRange,z as SearchSortOrder,me as SerializableFileMatch,M as TextSearchCompleteMessageType,ne as TextSearchMatch,B as VIEWLET_ID,V as VIEW_ID,N as ViewMode,ae as deserializeSearchError,ge as excludeToGlobPattern,se as getExcludes,xe as hasSiblingFn,Ie as hasSiblingPromiseFn,ee as isFileMatch,pe as isFilePatternMatch,re as isProgressMessage,ue as isSerializedFileMatch,le as isSerializedSearchComplete,ce as isSerializedSearchSuccess,oe as pathIncludedInQuery,he as resolvePatternsForProvider,q as resultIsMatch,ie as serializeSearchError};
