import{Emitter as R,Event as E}from"../../../../../base/common/event.js";import{Disposable as v,DisposableStore as U}from"../../../../../base/common/lifecycle.js";import{UnchangedRegion as L}from"../../../../../editor/browser/widget/diffEditor/diffEditorViewModel.js";import{getEditorPadding as g}from"./diffCellEditorOptions.js";import{HeightOfHiddenLinesRegionInDiffEditor as x}from"./diffElementViewModel.js";class H extends v{constructor(i,n,o,d,r){super();this.editorWorkerService=n;this.textModelResolverService=o;this.textConfigurationService=d;this.lineHeight=r;this.options=this._register(I(i))}options;static Empty={options:{enabled:!1,contextLineCount:0,minimumLineCount:0,revealLineCount:0,onDidChangeEnablement:E.None},computeEditorHeight:(i,n)=>Promise.resolve(0)};async computeEditorHeight(i,n){const{numberOfUnchangedRegions:o,numberOfVisibleLines:d}=await y(i,n,this.options,this.editorWorkerService,this.textModelResolverService,this.textConfigurationService),r=d,a=o*x;return r*this.lineHeight+g(r).top+g(r).bottom+a}}function I(e){const t=new U,i=t.add(new R),n={enabled:e.getValue("diffEditor.hideUnchangedRegions.enabled"),minimumLineCount:e.getValue("diffEditor.hideUnchangedRegions.minimumLineCount"),contextLineCount:e.getValue("diffEditor.hideUnchangedRegions.contextLineCount"),revealLineCount:e.getValue("diffEditor.hideUnchangedRegions.revealLineCount"),onDidChangeEnablement:i.event.bind(i),dispose:()=>t.dispose()};return t.add(e.onDidChangeConfiguration(o=>{o.affectsConfiguration("diffEditor.hideUnchangedRegions.minimumLineCount")&&(n.minimumLineCount=e.getValue("diffEditor.hideUnchangedRegions.minimumLineCount")),o.affectsConfiguration("diffEditor.hideUnchangedRegions.contextLineCount")&&(n.contextLineCount=e.getValue("diffEditor.hideUnchangedRegions.contextLineCount")),o.affectsConfiguration("diffEditor.hideUnchangedRegions.revealLineCount")&&(n.revealLineCount=e.getValue("diffEditor.hideUnchangedRegions.revealLineCount")),o.affectsConfiguration("diffEditor.hideUnchangedRegions.enabled")&&(n.enabled=e.getValue("diffEditor.hideUnchangedRegions.enabled"),i.fire(n.enabled))})),n}async function y(e,t,i,n,o,d){const[r,a]=await Promise.all([o.createModelReference(e),o.createModelReference(t)]);try{const f=d.getValue(e,"diffEditor.ignoreTrimWhitespace"),s=await n.computeDiff(e,t,{ignoreTrimWhitespace:f,maxComputationTimeMs:0,computeMoves:!1},"advanced"),c=r.object.textEditorModel.getLineCount(),m=a.object.textEditorModel.getLineCount(),u=s?L.fromDiffs(s.changes,c,m,i.minimumLineCount??3,i.contextLineCount??3):[],l=Math.max(c,m),h=u.length,p=l-u.reduce((C,b)=>C+b.lineCount,0);return{numberOfUnchangedRegions:h,numberOfVisibleLines:p}}finally{r.dispose(),a.dispose()}}export{H as UnchangedEditorRegionsService};
