import{coalesce as F}from"../../../../base/common/arrays.js";import"./media/searchEditor.css";import{Range as x}from"../../../../editor/common/core/range.js";import{localize as m}from"../../../../nls.js";import{searchMatchComparer as S}from"../../search/browser/searchModel.js";import{ITextFileService as M}from"../../../services/textfile/common/textfiles.js";const b=`
`,I=e=>n=>new x(n.startLineNumber+e,n.startColumn,n.endLineNumber+e,n.endColumn),y=(e,n)=>{const i=o=>`${e.range().startLineNumber+o}`,s=e.fullPreviewLines(),t=[];return s.forEach((o,l)=>{const a=i(l),c=`  ${" ".repeat(n-a.length)}${a}: `,d=c.length,h=c+(o.split(/\r?\n?$/,1)[0]||""),u=({start:C,end:N})=>new x(1,(C??1)+d,1,(N??o.length+1)+d),r=e.rangeInPreview(),f=r.startLineNumber===r.endLineNumber;let g;f?g=u({start:r.startColumn,end:r.endColumn}):l===0?g=u({start:r.startColumn}):l===s.length-1?g=u({end:r.endColumn}):g=u({}),t.push({lineNumber:a,line:h,ranges:[g]})}),t};function T(e,n){const i=e.textMatches().length>0?R(e.resource,e.textMatches().sort(S),e.context,n):void 0,s=e.cellMatches().sort((t,o)=>t.cellIndex-o.cellIndex).sort().filter(t=>t.contentMatches.length>0).map((t,o)=>w(t,n,o===0));return[i,...s].filter(t=>!!t)}function R(e,n,i,s,t=!0){const o=n[n.length-1].range().endLineNumber.toString().length,l=t?[`${s(e)}:`]:[],a=[],p={},c=[];i.forEach((u,r)=>c.push({line:u,lineNumber:r})),c.sort((u,r)=>u.lineNumber-r.lineNumber);let d;const h=new Set;for(n.forEach(u=>{y(u,o).forEach(r=>{if(!h.has(r.lineNumber)){for(;c.length&&c[0].lineNumber<+r.lineNumber;){const{line:f,lineNumber:g}=c.shift();d!==void 0&&g!==d+1&&l.push(""),l.push(`  ${" ".repeat(o-`${g}`.length)}${g}  ${f}`),d=g}p[r.lineNumber]=l.length,h.add(r.lineNumber),l.push(r.line),d=+r.lineNumber}a.push(...r.ranges.map(I(p[r.lineNumber])))})});c.length;){const{line:u,lineNumber:r}=c.shift();l.push(`  ${r}  ${u}`)}return{text:l,matchRanges:a}}function w(e,n,i){return R(e.cell?.uri??e.parent.resource,e.contentMatches.sort(S),e.context,n,i)}const v=(e,n,i,s)=>({query:e.contentPattern.pattern,isRegexp:!!e.contentPattern.isRegExp,isCaseSensitive:!!e.contentPattern.isCaseSensitive,matchWholeWord:!!e.contentPattern.isWordMatch,filesToExclude:i,filesToInclude:n,showIncludesExcludes:!!(n||i||e?.userDisabledExcludesAndIgnoreFiles),useExcludeSettingsAndIgnoreFiles:e?.userDisabledExcludesAndIgnoreFiles===void 0?!0:!e.userDisabledExcludesAndIgnoreFiles,contextLines:s,onlyOpenEditors:!!e.onlyOpenEditors,notebookSearchConfig:{includeMarkupInput:!!e.contentPattern.notebookInfo?.isInNotebookMarkdownInput,includeMarkupPreview:!!e.contentPattern.notebookInfo?.isInNotebookMarkdownPreview,includeCodeInput:!!e.contentPattern.notebookInfo?.isInNotebookCellInput,includeOutput:!!e.contentPattern.notebookInfo?.isInNotebookCellOutput}}),Z=e=>(s=>s.filter(t=>t!==!1&&t!==null&&t!==void 0))([`# Query: ${(s=>s.replace(/\\/g,"\\\\").replace(/\n/g,"\\n"))(e.query??"")}`,(e.isCaseSensitive||e.matchWholeWord||e.isRegexp||e.useExcludeSettingsAndIgnoreFiles===!1)&&`# Flags: ${F([e.isCaseSensitive&&"CaseSensitive",e.matchWholeWord&&"WordMatch",e.isRegexp&&"RegExp",e.onlyOpenEditors&&"OpenEditors",e.useExcludeSettingsAndIgnoreFiles===!1&&"IgnoreExcludeSettings"]).join(" ")}`,e.filesToInclude?`# Including: ${e.filesToInclude}`:void 0,e.filesToExclude?`# Excluding: ${e.filesToExclude}`:void 0,e.contextLines?`# ContextLines: ${e.contextLines}`:void 0,""]).join(b),_=e=>E(e.getValueInRange(new x(1,1,6,1)).split(b)),L=()=>({query:"",filesToInclude:"",filesToExclude:"",isRegexp:!1,isCaseSensitive:!1,useExcludeSettingsAndIgnoreFiles:!0,matchWholeWord:!1,contextLines:0,showIncludesExcludes:!1,onlyOpenEditors:!1,notebookSearchConfig:{includeMarkupInput:!0,includeMarkupPreview:!1,includeCodeInput:!0,includeOutput:!0}}),E=e=>{const n=L(),i=t=>{let o="";for(let l=0;l<t.length;l++)if(t[l]==="\\"){l++;const a=t[l];if(a==="n")o+=`
`;else if(a==="\\")o+="\\";else throw Error(m("invalidQueryStringError","All backslashes in Query string must be escaped (\\\\)"))}else o+=t[l];return o},s=/^# ([^:]*): (.*)$/;for(const t of e){const o=s.exec(t);if(!o)continue;const[,l,a]=o;switch(l){case"Query":n.query=i(a);break;case"Including":n.filesToInclude=a;break;case"Excluding":n.filesToExclude=a;break;case"ContextLines":n.contextLines=+a;break;case"Flags":n.isRegexp=a.indexOf("RegExp")!==-1,n.isCaseSensitive=a.indexOf("CaseSensitive")!==-1,n.useExcludeSettingsAndIgnoreFiles=a.indexOf("IgnoreExcludeSettings")===-1,n.matchWholeWord=a.indexOf("WordMatch")!==-1,n.onlyOpenEditors=a.indexOf("OpenEditors")!==-1}}return n.showIncludesExcludes=!!(n.filesToInclude||n.filesToExclude||!n.useExcludeSettingsAndIgnoreFiles),n},ee=(e,n,i,s,t,o,l)=>{if(!e.query)throw Error("Internal Error: Expected query, got null");const a=v(e.query,n,i,s),p=e.fileCount()>1?m("numFiles","{0} files",e.fileCount()):m("oneFile","1 file"),c=e.count()>1?m("numResults","{0} results",e.count()):m("oneResult","1 result"),d=[e.count()?`${c} - ${p}`:m("noResults","No Results")];l&&d.push(m("searchMaxResultsWarning","The result set only contains a subset of all matches. Be more specific in your search to narrow down the results.")),d.push("");const h=(r,f)=>S(r,f,o),u=k(e.folderMatches().sort(h).map(r=>r.allDownstreamFileMatches().sort(h).flatMap(f=>T(f,t))).flat());return{matchRanges:u.matchRanges.map(I(d.length)),text:d.concat(u.text).join(b),config:a}},k=e=>{const n=[],i=[];return e.forEach(s=>{s.matchRanges.map(I(n.length)).forEach(t=>i.push(t)),s.text.forEach(t=>n.push(t)),n.push("")}),{text:n,matchRanges:i}},ne=async(e,n)=>{const s=(await e.get(M).read(n)).value;return O(s)},O=e=>{const n=[],i=[];let s=!0;for(const t of e.split(/\r?\n/g))s?(n.push(t),t===""&&(s=!1)):i.push(t);return{config:E(n),text:i.join(`
`)}};export{L as defaultSearchConfig,E as extractSearchQueryFromLines,_ as extractSearchQueryFromModel,ne as parseSavedSearchEditor,O as parseSerializedSearchEditor,Z as serializeSearchConfiguration,ee as serializeSearchResultForEditor};
