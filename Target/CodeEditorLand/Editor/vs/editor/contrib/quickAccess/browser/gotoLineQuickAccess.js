import{Disposable as d,DisposableStore as p,toDisposable as b}from"../../../../base/common/lifecycle.js";import{localize as a}from"../../../../nls.js";import{getCodeEditor as I}from"../../../browser/editorBrowser.js";import{EditorOption as f,RenderLineNumbersType as g}from"../../../common/config/editorOptions.js";import{ScrollType as L}from"../../../common/editorCommon.js";import{AbstractEditorNavigationQuickAccessProvider as h}from"./editorNavigationQuickAccess.js";class m extends h{static PREFIX=":";constructor(){super({canAcceptInBackground:!0})}provideWithoutTextEditor(t){const e=a("cannotRunGotoLine","Open a text editor first to go to a line.");return t.items=[{label:e}],t.ariaLabel=e,d.None}provideWithTextEditor(t,e,n){const i=t.editor,o=new p;o.add(e.onDidAccept(r=>{const[s]=e.selectedItems;if(s){if(!this.isValidLineNumber(i,s.lineNumber))return;this.gotoLocation(t,{range:this.toRange(s.lineNumber,s.column),keyMods:e.keyMods,preserveFocus:r.inBackground}),r.inBackground||e.hide()}}));const l=()=>{const r=this.parsePosition(i,e.value.trim().substr(m.PREFIX.length)),s=this.getPickLabel(i,r.lineNumber,r.column);if(e.items=[{lineNumber:r.lineNumber,column:r.column,label:s}],e.ariaLabel=s,!this.isValidLineNumber(i,r.lineNumber)){this.clearDecorations(i);return}const c=this.toRange(r.lineNumber,r.column);i.revealRangeInCenter(c,L.Smooth),this.addDecorations(i,c)};l(),o.add(e.onDidChangeValue(()=>l()));const u=I(i);return u&&u.getOptions().get(f.lineNumbers).renderType===g.Relative&&(u.updateOptions({lineNumbers:"on"}),o.add(b(()=>u.updateOptions({lineNumbers:"relative"})))),o}toRange(t=1,e=1){return{startLineNumber:t,startColumn:e,endLineNumber:t,endColumn:e}}parsePosition(t,e){const n=e.split(/,|:|#/).map(o=>Number.parseInt(o,10)).filter(o=>!isNaN(o)),i=this.lineCount(t)+1;return{lineNumber:n[0]>0?n[0]:i+n[0],column:n[1]}}getPickLabel(t,e,n){if(this.isValidLineNumber(t,e))return this.isValidColumn(t,e,n)?a("gotoLineColumnLabel","Go to line {0} and character {1}.",e,n):a("gotoLineLabel","Go to line {0}.",e);const i=t.getPosition()||{lineNumber:1,column:1},o=this.lineCount(t);return o>1?a("gotoLineLabelEmptyWithLimit","Current Line: {0}, Character: {1}. Type a line number between 1 and {2} to navigate to.",i.lineNumber,i.column,o):a("gotoLineLabelEmpty","Current Line: {0}, Character: {1}. Type a line number to navigate to.",i.lineNumber,i.column)}isValidLineNumber(t,e){return!e||typeof e!="number"?!1:e>0&&e<=this.lineCount(t)}isValidColumn(t,e,n){if(!n||typeof n!="number")return!1;const i=this.getModel(t);if(!i)return!1;const o={lineNumber:e,column:n};return i.validatePosition(o).equals(o)}lineCount(t){return this.getModel(t)?.getLineCount()??0}}export{m as AbstractGotoLineQuickAccessProvider};
