import"../../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/links.js";import{convertLinkRangeToBuffer as o,getXtermLineContent as s}from"../../../../../../vs/workbench/contrib/terminalContrib/links/browser/terminalLinkHelpers.js";class T{constructor(n,r,i){this.id=n;this.xterm=r;this._provideLinks=i}maxLinkLength=2e3;async detect(n,r,i){const t=s(this.xterm.buffer.active,r,i,this.xterm.cols);if(t===""||t.length>this.maxLinkLength)return[];const m=await this._provideLinks(t);return m?m.map(e=>{const a=o(n,this.xterm.cols,{startColumn:e.startIndex+1,startLineNumber:1,endColumn:e.startIndex+e.length+1,endLineNumber:1},r);return{text:t.substring(e.startIndex,e.startIndex+e.length)||"",label:e.label,bufferRange:a,type:{id:this.id},activate:e.activate}}):[]}}export{T as TerminalExternalLinkDetector};
