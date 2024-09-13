import{$ as y,createStyleSheet as b,h as A,isInShadowDOM as S,reset as w}from"../../../../../base/browser/dom.js";import{renderLabelWithIcons as R}from"../../../../../base/browser/ui/iconLabel/iconLabels.js";import{hash as F}from"../../../../../base/common/hash.js";import{Disposable as M}from"../../../../../base/common/lifecycle.js";import{autorun as T,derived as I,transaction as h}from"../../../../../base/common/observable.js";import{EDITOR_FONT_DEFAULTS as B,EditorOption as c}from"../../../../../editor/common/config/editorOptions.js";import{localize as a}from"../../../../../nls.js";import{ModifiedBaseRangeState as C,ModifiedBaseRangeStateKind as f}from"../model/modifiedBaseRange.js";import{FixedZoneWidget as x}from"./fixedZoneWidget.js";class N extends M{constructor(i){super();this._editor=i;this._register(this._editor.onDidChangeConfiguration(e=>{(e.hasChanged(c.fontInfo)||e.hasChanged(c.codeLensFontSize)||e.hasChanged(c.codeLensFontFamily))&&this._updateLensStyle()})),this._styleClassName="_conflictActionsFactory_"+F(this._editor.getId()).toString(16),this._styleElement=b(S(this._editor.getContainerDomNode())?this._editor.getContainerDomNode():void 0,void 0,this._store),this._updateLensStyle()}_styleClassName;_styleElement;_updateLensStyle(){const{codeLensHeight:i,fontSize:e}=this._getLayoutInfo(),t=this._editor.getOption(c.codeLensFontFamily),o=this._editor.getOption(c.fontInfo),d=`--codelens-font-family${this._styleClassName}`,r=`--codelens-font-features${this._styleClassName}`;let s=`
		.${this._styleClassName} { line-height: ${i}px; font-size: ${e}px; padding-right: ${Math.round(e*.5)}px; font-feature-settings: var(${r}) }
		.monaco-workbench .${this._styleClassName} span.codicon { line-height: ${i}px; font-size: ${e}px; }
		`;t&&(s+=`${this._styleClassName} { font-family: var(${d}), ${B.fontFamily}}`),this._styleElement.textContent=s,this._editor.getContainerDomNode().style?.setProperty(d,t??"inherit"),this._editor.getContainerDomNode().style?.setProperty(r,o.fontFeatureSettings)}_getLayoutInfo(){const i=Math.max(1.3,this._editor.getOption(c.lineHeight)/this._editor.getOption(c.fontSize));let e=this._editor.getOption(c.codeLensFontSize);return(!e||e<5)&&(e=this._editor.getOption(c.fontSize)*.9|0),{fontSize:e,codeLensHeight:e*i|0}}createWidget(i,e,t,o){const d=this._getLayoutInfo();return new L(this._editor,i,e,d.codeLensHeight+2,this._styleClassName,t,o)}}class P{constructor(n,i){this.viewModel=n;this.modifiedBaseRange=i}getItemsInput(n){return I(i=>{const e=this.viewModel,t=this.modifiedBaseRange;if(!e.model.hasBaseRange(t))return[];const o=e.model.getState(t).read(i),d=e.model.isHandled(t).read(i),r=e.model,s=[],p=n===1?e.model.input1:e.model.input2,v=e.showNonConflictingChanges.read(i);if(!t.isConflicting&&d&&!v)return[];const m=n===1?2:1;if(o.kind!==f.unrecognized&&!o.isInputIncluded(n)){if(!o.isInputIncluded(m)||!this.viewModel.shouldUseAppendInsteadOfAccept.read(i)){if(s.push(u(a("accept","Accept {0}",p.title),async()=>{h(l=>{r.setState(t,o.withInputValue(n,!0,!1),n,l),r.telemetry.reportAcceptInvoked(n,o.includesInput(m))})},a("acceptTooltip","Accept {0} in the result document.",p.title))),t.canBeCombined){const l=t.isOrderRelevant?a("acceptBoth0First","Accept Combination ({0} First)",p.title):a("acceptBoth","Accept Combination");s.push(u(l,async()=>{h(_=>{r.setState(t,C.base.withInputValue(n,!0).withInputValue(m,!0,!0),!0,_),r.telemetry.reportSmartCombinationInvoked(o.includesInput(m))})},a("acceptBothTooltip","Accept an automatic combination of both sides in the result document.")))}}else s.push(u(a("append","Append {0}",p.title),async()=>{h(l=>{r.setState(t,o.withInputValue(n,!0,!1),n,l),r.telemetry.reportAcceptInvoked(n,o.includesInput(m))})},a("appendTooltip","Append {0} to the result document.",p.title))),t.canBeCombined&&s.push(u(a("combine","Accept Combination",p.title),async()=>{h(l=>{r.setState(t,o.withInputValue(n,!0,!0),n,l),r.telemetry.reportSmartCombinationInvoked(o.includesInput(m))})},a("acceptBothTooltip","Accept an automatic combination of both sides in the result document.")));r.isInputHandled(t,n).read(i)||s.push(u(a("ignore","Ignore"),async()=>{h(l=>{r.setInputHandled(t,n,!0,l)})},a("markAsHandledTooltip","Don't take this side of the conflict.")))}return s})}itemsInput1=this.getItemsInput(1);itemsInput2=this.getItemsInput(2);resultItems=I(this,n=>{const i=this.viewModel,e=this.modifiedBaseRange,t=i.model.getState(e).read(n),o=i.model,d=[];if(t.kind===f.unrecognized)d.push({text:a("manualResolution","Manual Resolution"),tooltip:a("manualResolutionTooltip","This conflict has been resolved manually.")});else if(t.kind===f.base)d.push({text:a("noChangesAccepted","No Changes Accepted"),tooltip:a("noChangesAcceptedTooltip","The current resolution of this conflict equals the common ancestor of both the right and left changes.")});else{const s=[];t.includesInput1&&s.push(o.input1.title),t.includesInput2&&s.push(o.input2.title),t.kind===f.both&&t.firstInput===2&&s.reverse(),d.push({text:`${s.join(" + ")}`})}const r=[];return t.includesInput1&&r.push(u(a("remove","Remove {0}",o.input1.title),async()=>{h(s=>{o.setState(e,t.withInputValue(1,!1),!0,s),o.telemetry.reportRemoveInvoked(1,t.includesInput(2))})},a("removeTooltip","Remove {0} from the result document.",o.input1.title))),t.includesInput2&&r.push(u(a("remove","Remove {0}",o.input2.title),async()=>{h(s=>{o.setState(e,t.withInputValue(2,!1),!0,s),o.telemetry.reportRemoveInvoked(2,t.includesInput(1))})},a("removeTooltip","Remove {0} from the result document.",o.input2.title))),t.kind===f.both&&t.firstInput===2&&r.reverse(),d.push(...r),t.kind===f.unrecognized&&d.push(u(a("resetToBase","Reset to base"),async()=>{h(s=>{o.setState(e,C.base,!0,s),o.telemetry.reportResetToBaseInvoked()})},a("resetToBaseTooltip","Reset this conflict to the common ancestor of both the right and left changes."))),d});isEmpty=I(this,n=>this.itemsInput1.read(n).length+this.itemsInput2.read(n).length+this.resultItems.read(n).length===0);inputIsEmpty=I(this,n=>this.itemsInput1.read(n).length+this.itemsInput2.read(n).length===0)}function u(g,n,i){return{text:g,action:n,tooltip:i}}class L extends x{_domNode=A("div.merge-editor-conflict-actions").root;constructor(n,i,e,t,o,d,r){super(n,i,e,t,r),this.widgetDomNode.appendChild(this._domNode),this._domNode.classList.add(o),this._register(T(s=>{const p=d.read(s);this.setState(p)}))}setState(n){const i=[];let e=!0;for(const t of n){e?e=!1:i.push(y("span",void 0,"\xA0|\xA0"));const o=R(t.text);t.action?i.push(y("a",{title:t.tooltip,role:"button",onclick:()=>t.action()},...o)):i.push(y("span",{title:t.tooltip},...o))}w(this._domNode,...i)}}export{P as ActionsSource,N as ConflictActionsFactory};
