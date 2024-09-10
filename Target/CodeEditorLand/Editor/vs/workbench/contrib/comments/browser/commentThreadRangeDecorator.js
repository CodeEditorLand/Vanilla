import{Disposable as u,dispose as c}from"../../../../base/common/lifecycle.js";import{CommentThreadCollapsibleState as a}from"../../../../editor/common/languages.js";import{ModelDecorationOptions as p}from"../../../../editor/common/model/textModel.js";class l{constructor(e,o){this.range=e;this.options=o}_decorationId;get id(){return this._decorationId}set id(e){this._decorationId=e}}class d extends u{static description="comment-thread-range-decorator";decorationOptions;activeDecorationOptions;decorationIds=[];activeDecorationIds=[];editor;threadCollapseStateListeners=[];currentThreadCollapseStateListener;constructor(e){super();const o={description:d.description,isWholeLine:!1,zIndex:20,className:"comment-thread-range",shouldFillLineOnLineBreak:!0};this.decorationOptions=p.createDynamic(o);const t={description:d.description,isWholeLine:!1,zIndex:20,className:"comment-thread-range-current",shouldFillLineOnLineBreak:!0};this.activeDecorationOptions=p.createDynamic(t),this._register(e.onDidChangeCurrentCommentThread(i=>{this.updateCurrent(i)})),this._register(e.onDidUpdateCommentThreads(()=>{this.updateCurrent(void 0)}))}updateCurrent(e){if(!this.editor||e?.resource&&e.resource?.toString()!==this.editor.getModel()?.uri.toString())return;this.currentThreadCollapseStateListener?.dispose();const o=[];if(e){const t=e.range;t&&!(t.startLineNumber===t.endLineNumber&&t.startColumn===t.endColumn)&&e.collapsibleState===a.Expanded&&(this.currentThreadCollapseStateListener=e.onDidChangeCollapsibleState(i=>{i===a.Collapsed&&this.updateCurrent(void 0)}),o.push(new l(t,this.activeDecorationOptions)))}this.editor.changeDecorations(t=>{this.activeDecorationIds=t.deltaDecorations(this.activeDecorationIds,o),o.forEach((i,s)=>i.id=this.decorationIds[s])})}update(e,o){const t=e?.getModel();if(!e||!t)return;c(this.threadCollapseStateListeners),this.editor=e;const i=[];for(const s of o)s.threads.forEach(r=>{if(r.isDisposed)return;const n=r.range;!n||n.startLineNumber===n.endLineNumber&&n.startColumn===n.endColumn||(this.threadCollapseStateListeners.push(r.onDidChangeCollapsibleState(()=>{this.update(e,o)})),r.collapsibleState!==a.Collapsed&&i.push(new l(n,this.decorationOptions)))});e.changeDecorations(s=>{this.decorationIds=s.deltaDecorations(this.decorationIds,i),i.forEach((r,n)=>r.id=this.decorationIds[n])})}dispose(){c(this.threadCollapseStateListeners),this.currentThreadCollapseStateListener?.dispose(),super.dispose()}}export{d as CommentThreadRangeDecorator};
