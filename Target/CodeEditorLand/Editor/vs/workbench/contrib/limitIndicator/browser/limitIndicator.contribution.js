var f=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var u=(o,e,t,r)=>{for(var i=r>1?void 0:r?h(e,t):e,a=o.length-1,d;a>=0;a--)(d=o[a])&&(i=(r?d(e,t,i):d(i))||i);return r&&i&&f(e,t,i),i},l=(o,e)=>(t,r)=>e(t,r,o);import"../../../../base/common/event.js";import{Disposable as p}from"../../../../base/common/lifecycle.js";import I from"../../../../base/common/severity.js";import{getCodeEditor as S}from"../../../../editor/browser/editorBrowser.js";import{ColorDetector as C}from"../../../../editor/contrib/colorPicker/browser/colorDetector.js";import{FoldingController as y}from"../../../../editor/contrib/folding/browser/folding.js";import*as s from"../../../../nls.js";import{Registry as L}from"../../../../platform/registry/common/platform.js";import{Extensions as b}from"../../../common/contributions.js";import{IEditorService as v}from"../../../services/editor/common/editorService.js";import{ILanguageStatusService as E}from"../../../services/languageStatus/common/languageStatusService.js";import{LifecyclePhase as _}from"../../../services/lifecycle/common/lifecycle.js";const D="workbench.action.openSettings",R=s.localize("status.button.configure","Configure");let c=class extends p{constructor(e,t){super();const i=[new A,new F].map(n=>new k(t,n));i.forEach(n=>this._register(n));let a;const d=()=>{const n=e.activeTextEditorControl;if(n===a)return;a=n;const m=S(n);i.forEach(g=>g.onActiveEditorChanged(m))};this._register(e.onDidActiveEditorChange(d)),d()}};c=u([l(0,v),l(1,E)],c);class A{id="decoratorsLimitInfo";name=s.localize("colorDecoratorsStatusItem.name","Color Decorator Status");label=s.localize("status.limitedColorDecorators.short","Color Decorators");source=s.localize("colorDecoratorsStatusItem.source","Color Decorators");settingsId="editor.colorDecoratorsLimit";getLimitReporter(e){return C.get(e)?.limitReporter}}class F{id="foldingLimitInfo";name=s.localize("foldingRangesStatusItem.name","Folding Status");label=s.localize("status.limitedFoldingRanges.short","Folding Ranges");source=s.localize("foldingRangesStatusItem.source","Folding");settingsId="editor.foldingMaximumRegions";getLimitReporter(e){return y.get(e)?.limitReporter}}class k{constructor(e,t){this.languageStatusService=e;this.accessor=t}_limitStatusItem;_indicatorChangeListener;onActiveEditorChanged(e){this._indicatorChangeListener&&(this._indicatorChangeListener.dispose(),this._indicatorChangeListener=void 0);let t;return e&&(t=this.accessor.getLimitReporter(e)),this.updateStatusItem(t),t?(this._indicatorChangeListener=t.onDidChange(r=>{this.updateStatusItem(t)}),!0):!1}updateStatusItem(e){if(this._limitStatusItem&&(this._limitStatusItem.dispose(),this._limitStatusItem=void 0),e&&e.limited!==!1){const t={id:this.accessor.id,selector:"*",name:this.accessor.name,severity:I.Warning,label:this.accessor.label,detail:s.localize("status.limited.details","only {0} shown for performance reasons",e.limited),command:{id:D,arguments:[this.accessor.settingsId],title:R},accessibilityInfo:void 0,source:this.accessor.source,busy:!1};this._limitStatusItem=this.languageStatusService.addStatus(t)}}dispose(){this._limitStatusItem?.dispose,this._limitStatusItem=void 0,this._indicatorChangeListener?.dispose,this._indicatorChangeListener=void 0}}L.as(b.Workbench).registerWorkbenchContribution(c,_.Restored);export{c as LimitIndicatorContribution};
