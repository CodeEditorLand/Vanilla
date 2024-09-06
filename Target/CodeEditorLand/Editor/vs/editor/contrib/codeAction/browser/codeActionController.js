var w=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var S=(h,a,i,e)=>{for(var t=e>1?void 0:e?T(a,i):a,o=h.length-1,r;o>=0;o--)(r=h[o])&&(t=(e?r(a,i,t):r(t))||t);return e&&t&&w(a,i,t),t},c=(h,a)=>(i,e)=>a(i,e,h);import{getDomNodePagePosition as M}from"../../../../../vs/base/browser/dom.js";import*as x from"../../../../../vs/base/browser/ui/aria/aria.js";import"../../../../../vs/base/browser/ui/contextview/contextview.js";import"../../../../../vs/base/common/actions.js";import"../../../../../vs/base/common/cancellation.js";import"../../../../../vs/base/common/color.js";import{onUnexpectedError as P}from"../../../../../vs/base/common/errors.js";import{HierarchicalKind as W}from"../../../../../vs/base/common/hierarchicalKind.js";import{Lazy as R}from"../../../../../vs/base/common/lazy.js";import{Disposable as B,MutableDisposable as F}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{Position as k}from"../../../../../vs/editor/common/core/position.js";import{ScrollType as E}from"../../../../../vs/editor/common/editorCommon.js";import{CodeActionTriggerType as b}from"../../../../../vs/editor/common/languages.js";import"../../../../../vs/editor/common/model.js";import{ModelDecorationOptions as N}from"../../../../../vs/editor/common/model/textModel.js";import{ILanguageFeaturesService as H}from"../../../../../vs/editor/common/services/languageFeatures.js";import{applyCodeAction as O,ApplyCodeActionReason as f}from"../../../../../vs/editor/contrib/codeAction/browser/codeAction.js";import{CodeActionKeybindingResolver as K}from"../../../../../vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver.js";import{toMenuItems as V}from"../../../../../vs/editor/contrib/codeAction/browser/codeActionMenu.js";import{CodeActionModel as q,CodeActionsState as z}from"../../../../../vs/editor/contrib/codeAction/browser/codeActionModel.js";import{LightBulbWidget as $}from"../../../../../vs/editor/contrib/codeAction/browser/lightBulbWidget.js";import{CodeActionAutoApply as v,CodeActionKind as p,CodeActionTriggerSource as G}from"../../../../../vs/editor/contrib/codeAction/common/types.js";import{MessageController as I}from"../../../../../vs/editor/contrib/message/browser/messageController.js";import{localize as _}from"../../../../../vs/nls.js";import"../../../../../vs/platform/actionWidget/browser/actionList.js";import{IActionWidgetService as Q}from"../../../../../vs/platform/actionWidget/browser/actionWidget.js";import{ICommandService as U}from"../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as j}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as J}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as D}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IMarkerService as X}from"../../../../../vs/platform/markers/common/markers.js";import{IEditorProgressService as Y}from"../../../../../vs/platform/progress/common/progress.js";import{ITelemetryService as Z}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{editorFindMatchHighlight as ii,editorFindMatchHighlightBorder as ei}from"../../../../../vs/platform/theme/common/colorRegistry.js";import{isHighContrast as ti}from"../../../../../vs/platform/theme/common/theme.js";import{registerThemingParticipant as oi}from"../../../../../vs/platform/theme/common/themeService.js";const ri="quickfix-edit-highlight";let g=class extends B{constructor(i,e,t,o,r,m,y,C,d,u,l){super();this._commandService=y;this._configurationService=C;this._actionWidgetService=d;this._instantiationService=u;this._telemetryService=l;this._editor=i,this._model=this._register(new q(this._editor,r.codeActionProvider,e,t,m,C,this._telemetryService)),this._register(this._model.onDidChangeState(s=>this.update(s))),this._lightBulbWidget=new R(()=>{const s=this._editor.getContribution($.ID);return s&&this._register(s.onClick(n=>this.showCodeActionsFromLightbulb(n.actions,n))),s}),this._resolver=o.createInstance(K),this._register(this._editor.onDidLayoutChange(()=>this._actionWidgetService.hide()))}static ID="editor.contrib.codeActionController";static get(i){return i.getContribution(g.ID)}_editor;_model;_lightBulbWidget;_activeCodeActions=this._register(new F);_showDisabled=!1;_resolver;_disposed=!1;dispose(){this._disposed=!0,super.dispose()}async showCodeActionsFromLightbulb(i,e){if(i.allAIFixes&&i.validActions.length===1){const t=i.validActions[0],o=t.action.command;o&&o.id==="inlineChat.start"&&o.arguments&&o.arguments.length>=1&&(o.arguments[0]={...o.arguments[0],autoSend:!1}),await this._applyCodeAction(t,!1,!1,f.FromAILightbulb);return}await this.showCodeActionList(i,e,{includeDisabledActions:!1,fromLightbulb:!0})}showCodeActions(i,e,t){return this.showCodeActionList(e,t,{includeDisabledActions:!1,fromLightbulb:!1})}hideCodeActions(){this._actionWidgetService.hide()}manualTriggerAtCurrentPosition(i,e,t,o){if(!this._editor.hasModel())return;I.get(this._editor)?.closeMessage();const r=this._editor.getPosition();this._trigger({type:b.Invoke,triggerAction:e,filter:t,autoApply:o,context:{notAvailableMessage:i,position:r}})}_trigger(i){return this._model.trigger(i)}async _applyCodeAction(i,e,t,o){try{await this._instantiationService.invokeFunction(O,i,o,{preview:t,editor:this._editor})}finally{e&&this._trigger({type:b.Auto,triggerAction:G.QuickFix,filter:{}})}}hideLightBulbWidget(){this._lightBulbWidget.rawValue?.hide(),this._lightBulbWidget.rawValue?.gutterHide()}async update(i){if(i.type!==z.Type.Triggered){this.hideLightBulbWidget();return}let e;try{e=await i.actions}catch(t){P(t);return}if(!this._disposed)if(this._lightBulbWidget.value?.update(e,i.trigger,i.position),i.trigger.type===b.Invoke){if(i.trigger.filter?.include){const o=this.tryGetValidActionToApply(i.trigger,e);if(o){try{this.hideLightBulbWidget(),await this._applyCodeAction(o,!1,!1,f.FromCodeActions)}finally{e.dispose()}return}if(i.trigger.context){const r=this.getInvalidActionThatWouldHaveBeenApplied(i.trigger,e);if(r&&r.action.disabled){I.get(this._editor)?.showMessage(r.action.disabled,i.trigger.context.position),e.dispose();return}}}const t=!!i.trigger.filter?.include;if(i.trigger.context&&(!e.allActions.length||!t&&!e.validActions.length)){I.get(this._editor)?.showMessage(i.trigger.context.notAvailableMessage,i.trigger.context.position),this._activeCodeActions.value=e,e.dispose();return}this._activeCodeActions.value=e,this.showCodeActionList(e,this.toCoords(i.position),{includeDisabledActions:t,fromLightbulb:!1})}else this._actionWidgetService.isVisible?e.dispose():this._activeCodeActions.value=e}getInvalidActionThatWouldHaveBeenApplied(i,e){if(e.allActions.length&&(i.autoApply===v.First&&e.validActions.length===0||i.autoApply===v.IfSingle&&e.allActions.length===1))return e.allActions.find(({action:t})=>t.disabled)}tryGetValidActionToApply(i,e){if(e.validActions.length&&(i.autoApply===v.First&&e.validActions.length>0||i.autoApply===v.IfSingle&&e.validActions.length===1))return e.validActions[0]}static DECORATION=N.register({description:"quickfix-highlight",className:ri});async showCodeActionList(i,e,t){const o=this._editor.createDecorationsCollection(),r=this._editor.getDomNode();if(!r)return;const m=t.includeDisabledActions&&(this._showDisabled||i.validActions.length===0)?i.allActions:i.validActions;if(!m.length)return;const y=k.isIPosition(e)?this.toCoords(e):e,C={onSelect:async(d,u)=>{this._applyCodeAction(d,!0,!!u,t.fromLightbulb?f.FromAILightbulb:f.FromCodeActions),this._actionWidgetService.hide(!1),o.clear()},onHide:d=>{this._editor?.focus(),o.clear()},onHover:async(d,u)=>{if(u.isCancellationRequested)return;let l=!1;const s=d.action.kind;if(s){const n=new W(s);l=[p.RefactorExtract,p.RefactorInline,p.RefactorRewrite,p.RefactorMove,p.Source].some(L=>L.contains(n))}return{canPreview:l||!!d.action.edit?.edits.length}},onFocus:d=>{if(d&&d.action){const u=d.action.ranges,l=d.action.diagnostics;if(o.clear(),u&&u.length>0){const s=l&&l?.length>1?l.map(n=>({range:n,options:g.DECORATION})):u.map(n=>({range:n,options:g.DECORATION}));o.set(s)}else if(l&&l.length>0){const s=l.map(A=>({range:A,options:g.DECORATION}));o.set(s);const n=l[0];if(n.startLineNumber&&n.startColumn){const A=this._editor.getModel()?.getWordAtPosition({lineNumber:n.startLineNumber,column:n.startColumn})?.word;x.status(_("editingNewSelection","Context: {0} at line {1} and column {2}.",A,n.startLineNumber,n.startColumn))}}}else o.clear()}};this._actionWidgetService.show("codeActionWidget",!0,V(m,this._shouldShowHeaders(),this._resolver.getResolver()),C,y,r,this._getActionBarActions(i,e,t))}toCoords(i){if(!this._editor.hasModel())return{x:0,y:0};this._editor.revealPosition(i,E.Immediate),this._editor.render();const e=this._editor.getScrolledVisiblePosition(i),t=M(this._editor.getDomNode()),o=t.left+e.left,r=t.top+e.top+e.height;return{x:o,y:r}}_shouldShowHeaders(){const i=this._editor?.getModel();return this._configurationService.getValue("editor.codeActionWidget.showHeaders",{resource:i?.uri})}_getActionBarActions(i,e,t){if(t.fromLightbulb)return[];const o=i.documentation.map(r=>({id:r.id,label:r.title,tooltip:r.tooltip??"",class:void 0,enabled:!0,run:()=>this._commandService.executeCommand(r.id,...r.arguments??[])}));return t.includeDisabledActions&&i.validActions.length>0&&i.allActions.length!==i.validActions.length&&o.push(this._showDisabled?{id:"hideMoreActions",label:_("hideMoreActions","Hide Disabled"),enabled:!0,tooltip:"",class:void 0,run:()=>(this._showDisabled=!1,this.showCodeActionList(i,e,t))}:{id:"showMoreActions",label:_("showMoreActions","Show Disabled"),enabled:!0,tooltip:"",class:void 0,run:()=>(this._showDisabled=!0,this.showCodeActionList(i,e,t))}),o}};g=S([c(1,X),c(2,J),c(3,D),c(4,H),c(5,Y),c(6,U),c(7,j),c(8,Q),c(9,D),c(10,Z)],g),oi((h,a)=>{((t,o)=>{o&&a.addRule(`.monaco-editor ${t} { background-color: ${o}; }`)})(".quickfix-edit-highlight",h.getColor(ii));const e=h.getColor(ei);e&&a.addRule(`.monaco-editor .quickfix-edit-highlight { border: 1px ${ti(h.type)?"dotted":"solid"} ${e}; box-sizing: border-box; }`)});export{g as CodeActionController};