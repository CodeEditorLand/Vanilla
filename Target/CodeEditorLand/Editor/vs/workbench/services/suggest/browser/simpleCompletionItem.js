import{FuzzyScore as o}from"../../../../../vs/base/common/filters.js";import{isWindows as i}from"../../../../../vs/base/common/platform.js";import"../../../../../vs/base/common/themables.js";class b{constructor(l){this.completion=l;if(this.labelLow=this.completion.label.toLowerCase(),this.labelLowExcludeFileExt=this.labelLow,l.isFile){i&&(this.labelLow=this.labelLow.replaceAll("/","\\"));const e=this.labelLow.lastIndexOf(".");e!==-1&&(this.labelLowExcludeFileExt=this.labelLow.substring(0,e),this.fileExtLow=this.labelLow.substring(e+1))}}labelLow;labelLowExcludeFileExt;fileExtLow="";score=o.Default;idx;word}export{b as SimpleCompletionItem};
