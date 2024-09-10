import{computeIndentLevel as p}from"../../../common/model/utils.js";import{FoldingRegions as m,MAX_LINE_NUMBER as _}from"./foldingRanges.js";const R=5e3,I="indent";class D{constructor(d,n,t){this.editorModel=d;this.languageConfigurationService=n;this.foldingRangesLimit=t}id=I;dispose(){}compute(d){const n=this.languageConfigurationService.getLanguageConfiguration(this.editorModel.getLanguageId()).foldingRules,t=n&&!!n.offSide,r=n&&n.markers;return Promise.resolve(b(this.editorModel,t,r,this.foldingRangesLimit))}}class v{_startIndexes;_endIndexes;_indentOccurrences;_length;_foldingRangesLimit;constructor(d){this._startIndexes=[],this._endIndexes=[],this._indentOccurrences=[],this._length=0,this._foldingRangesLimit=d}insertFirst(d,n,t){if(d>_||n>_)return;const r=this._length;this._startIndexes[r]=d,this._endIndexes[r]=n,this._length++,t<1e3&&(this._indentOccurrences[t]=(this._indentOccurrences[t]||0)+1)}toIndentRanges(d){const n=this._foldingRangesLimit.limit;if(this._length<=n){this._foldingRangesLimit.update(this._length,!1);const t=new Uint32Array(this._length),r=new Uint32Array(this._length);for(let l=this._length-1,g=0;l>=0;l--,g++)t[g]=this._startIndexes[l],r[g]=this._endIndexes[l];return new m(t,r)}else{this._foldingRangesLimit.update(this._length,n);let t=0,r=this._indentOccurrences.length;for(let s=0;s<this._indentOccurrences.length;s++){const e=this._indentOccurrences[s];if(e){if(e+t>n){r=s;break}t+=e}}const l=d.getOptions().tabSize,g=new Uint32Array(n),i=new Uint32Array(n);for(let s=this._length-1,e=0;s>=0;s--){const h=this._startIndexes[s],a=d.getLineContent(h),o=p(a,l);(o<r||o===r&&t++<n)&&(g[e]=h,i[e]=this._endIndexes[s],e++)}return new m(g,i)}}}const x={limit:R,update:()=>{}};function b(u,d,n,t=x){const r=u.getOptions().tabSize,l=new v(t);let g;n&&(g=new RegExp(`(${n.start.source})|(?:${n.end.source})`));const i=[],s=u.getLineCount()+1;i.push({indent:-1,endAbove:s,line:s});for(let e=u.getLineCount();e>0;e--){const h=u.getLineContent(e),a=p(h,r);let o=i[i.length-1];if(a===-1){d&&(o.endAbove=e);continue}let f;if(g&&(f=h.match(g)))if(f[1]){let c=i.length-1;for(;c>0&&i[c].indent!==-2;)c--;if(c>0){i.length=c+1,o=i[c],l.insertFirst(e,o.line,a),o.line=e,o.indent=a,o.endAbove=e;continue}}else{i.push({indent:-2,endAbove:e,line:e});continue}if(o.indent>a){do i.pop(),o=i[i.length-1];while(o.indent>a);const c=o.endAbove-1;c-e>=1&&l.insertFirst(e,c,a)}o.indent===a?o.endAbove=e:i.push({indent:a,endAbove:e,line:e})}return l.toIndentRanges(u)}export{D as IndentRangeProvider,v as RangesCollector,b as computeRanges};
