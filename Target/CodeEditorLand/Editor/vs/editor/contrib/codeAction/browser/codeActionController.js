var L=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var S=(h,a,i,e)=>{for(var o=e>1?void 0:e?T(a,i):a,t=h.length-1,r;t>=0;t--)(r=h[t])&&(o=(e?r(a,i,o):r(o))||o);return e&&o&&L(a,i,o),o},l=(h,a)=>(i,e)=>a(i,e,h);import{getDomNodePagePosition as x}from"../../../../base/browser/dom.js";import*as M from"../../../../base/browser/ui/aria/aria.js";import{onUnexpectedError as P}from"../../../../base/common/errors.js";import{HierarchicalKind as W}from"../../../../base/common/hierarchicalKind.js";import{Lazy as B}from"../../../../base/common/lazy.js";import{Disposable as R,MutableDisposable as F}from"../../../../base/common/lifecycle.js";import{localize as b}from"../../../../nls.js";import{IActionWidgetService as k}from"../../../../platform/actionWidget/browser/actionWidget.js";import{ICommandService as N}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as E}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as H}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as D}from"../../../../platform/instantiation/common/instantiation.js";import{IMarkerService as O}from"../../../../platform/markers/common/markers.js";import{IEditorProgressService as K}from"../../../../platform/progress/common/progress.js";import{ITelemetryService as j}from"../../../../platform/telemetry/common/telemetry.js";import{editorFindMatchHighlight as V,editorFindMatchHighlightBorder as q}from"../../../../platform/theme/common/colorRegistry.js";import{isHighContrast as z}from"../../../../platform/theme/common/theme.js";import{registerThemingParticipant as $}from"../../../../platform/theme/common/themeService.js";import{Position as G}from"../../../common/core/position.js";import{ScrollType as Q}from"../../../common/editorCommon.js";import{CodeActionTriggerType as I}from"../../../common/languages.js";import{ModelDecorationOptions as U}from"../../../common/model/textModel.js";import{ILanguageFeaturesService as J}from"../../../common/services/languageFeatures.js";import{MessageController as y}from"../../message/browser/messageController.js";import{CodeActionAutoApply as f,CodeActionKind as m,CodeActionTriggerSource as X}from"../common/types.js";import{ApplyCodeActionReason as v,applyCodeAction as Y}from"./codeAction.js";import{CodeActionKeybindingResolver as Z}from"./codeActionKeybindingResolver.js";import{toMenuItems as ii}from"./codeActionMenu.js";import{CodeActionModel as ei,CodeActionsState as ti}from"./codeActionModel.js";import{LightBulbWidget as oi}from"./lightBulbWidget.js";const ri="quickfix-edit-highlight";let g=class extends R{constructor(i,e,o,t,r,u,_,C,d,p,c){super();this._commandService=_;this._configurationService=C;this._actionWidgetService=d;this._instantiationService=p;this._telemetryService=c;this._editor=i,this._model=this._register(new ei(this._editor,r.codeActionProvider,e,o,u,C,this._telemetryService)),this._register(this._model.onDidChangeState(s=>this.update(s))),this._lightBulbWidget=new B(()=>{const s=this._editor.getContribution(oi.ID);return s&&this._register(s.onClick(n=>this.showCodeActionsFromLightbulb(n.actions,n))),s}),this._resolver=t.createInstance(Z),this._register(this._editor.onDidLayoutChange(()=>this._actionWidgetService.hide()))}static ID="editor.contrib.codeActionController";static get(i){return i.getContribution(g.ID)}_editor;_model;_lightBulbWidget;_activeCodeActions=this._register(new F);_showDisabled=!1;_resolver;_disposed=!1;dispose(){this._disposed=!0,super.dispose()}async showCodeActionsFromLightbulb(i,e){if(i.allAIFixes&&i.validActions.length===1){const o=i.validActions[0],t=o.action.command;t&&t.id==="inlineChat.start"&&t.arguments&&t.arguments.length>=1&&(t.arguments[0]={...t.arguments[0],autoSend:!1}),await this._applyCodeAction(o,!1,!1,v.FromAILightbulb);return}await this.showCodeActionList(i,e,{includeDisabledActions:!1,fromLightbulb:!0})}showCodeActions(i,e,o){return this.showCodeActionList(e,o,{includeDisabledActions:!1,fromLightbulb:!1})}hideCodeActions(){this._actionWidgetService.hide()}manualTriggerAtCurrentPosition(i,e,o,t){if(!this._editor.hasModel())return;y.get(this._editor)?.closeMessage();const r=this._editor.getPosition();this._trigger({type:I.Invoke,triggerAction:e,filter:o,autoApply:t,context:{notAvailableMessage:i,position:r}})}_trigger(i){return this._model.trigger(i)}async _applyCodeAction(i,e,o,t){try{await this._instantiationService.invokeFunction(Y,i,t,{preview:o,editor:this._editor})}finally{e&&this._trigger({type:I.Auto,triggerAction:X.QuickFix,filter:{}})}}hideLightBulbWidget(){this._lightBulbWidget.rawValue?.hide(),this._lightBulbWidget.rawValue?.gutterHide()}async update(i){if(i.type!==ti.Type.Triggered){this.hideLightBulbWidget();return}let e;try{e=await i.actions}catch(t){P(t);return}if(!(this._disposed||this._editor.getSelection()?.startLineNumber!==i.position.lineNumber))if(this._lightBulbWidget.value?.update(e,i.trigger,i.position),i.trigger.type===I.Invoke){if(i.trigger.filter?.include){const r=this.tryGetValidActionToApply(i.trigger,e);if(r){try{this.hideLightBulbWidget(),await this._applyCodeAction(r,!1,!1,v.FromCodeActions)}finally{e.dispose()}return}if(i.trigger.context){const u=this.getInvalidActionThatWouldHaveBeenApplied(i.trigger,e);if(u&&u.action.disabled){y.get(this._editor)?.showMessage(u.action.disabled,i.trigger.context.position),e.dispose();return}}}const t=!!i.trigger.filter?.include;if(i.trigger.context&&(!e.allActions.length||!t&&!e.validActions.length)){y.get(this._editor)?.showMessage(i.trigger.context.notAvailableMessage,i.trigger.context.position),this._activeCodeActions.value=e,e.dispose();return}this._activeCodeActions.value=e,this.showCodeActionList(e,this.toCoords(i.position),{includeDisabledActions:t,fromLightbulb:!1})}else this._actionWidgetService.isVisible?e.dispose():this._activeCodeActions.value=e}getInvalidActionThatWouldHaveBeenApplied(i,e){if(e.allActions.length&&(i.autoApply===f.First&&e.validActions.length===0||i.autoApply===f.IfSingle&&e.allActions.length===1))return e.allActions.find(({action:o})=>o.disabled)}tryGetValidActionToApply(i,e){if(e.validActions.length&&(i.autoApply===f.First&&e.validActions.length>0||i.autoApply===f.IfSingle&&e.validActions.length===1))return e.validActions[0]}static DECORATION=U.register({description:"quickfix-highlight",className:ri});async showCodeActionList(i,e,o){const t=this._editor.createDecorationsCollection(),r=this._editor.getDomNode();if(!r)return;const u=o.includeDisabledActions&&(this._showDisabled||i.validActions.length===0)?i.allActions:i.validActions;if(!u.length)return;const _=G.isIPosition(e)?this.toCoords(e):e,C={onSelect:async(d,p)=>{this._applyCodeAction(d,!0,!!p,o.fromLightbulb?v.FromAILightbulb:v.FromCodeActions),this._actionWidgetService.hide(!1),t.clear()},onHide:d=>{this._editor?.focus(),t.clear()},onHover:async(d,p)=>{if(p.isCancellationRequested)return;let c=!1;const s=d.action.kind;if(s){const n=new W(s);c=[m.RefactorExtract,m.RefactorInline,m.RefactorRewrite,m.RefactorMove,m.Source].some(w=>w.contains(n))}return{canPreview:c||!!d.action.edit?.edits.length}},onFocus:d=>{if(d&&d.action){const p=d.action.ranges,c=d.action.diagnostics;if(t.clear(),p&&p.length>0){const s=c&&c?.length>1?c.map(n=>({range:n,options:g.DECORATION})):p.map(n=>({range:n,options:g.DECORATION}));t.set(s)}else if(c&&c.length>0){const s=c.map(A=>({range:A,options:g.DECORATION}));t.set(s);const n=c[0];if(n.startLineNumber&&n.startColumn){const A=this._editor.getModel()?.getWordAtPosition({lineNumber:n.startLineNumber,column:n.startColumn})?.word;M.status(b("editingNewSelection","Context: {0} at line {1} and column {2}.",A,n.startLineNumber,n.startColumn))}}}else t.clear()}};this._actionWidgetService.show("codeActionWidget",!0,ii(u,this._shouldShowHeaders(),this._resolver.getResolver()),C,_,r,this._getActionBarActions(i,e,o))}toCoords(i){if(!this._editor.hasModel())return{x:0,y:0};this._editor.revealPosition(i,Q.Immediate),this._editor.render();const e=this._editor.getScrolledVisiblePosition(i),o=x(this._editor.getDomNode()),t=o.left+e.left,r=o.top+e.top+e.height;return{x:t,y:r}}_shouldShowHeaders(){const i=this._editor?.getModel();return this._configurationService.getValue("editor.codeActionWidget.showHeaders",{resource:i?.uri})}_getActionBarActions(i,e,o){if(o.fromLightbulb)return[];const t=i.documentation.map(r=>({id:r.id,label:r.title,tooltip:r.tooltip??"",class:void 0,enabled:!0,run:()=>this._commandService.executeCommand(r.id,...r.arguments??[])}));return o.includeDisabledActions&&i.validActions.length>0&&i.allActions.length!==i.validActions.length&&t.push(this._showDisabled?{id:"hideMoreActions",label:b("hideMoreActions","Hide Disabled"),enabled:!0,tooltip:"",class:void 0,run:()=>(this._showDisabled=!1,this.showCodeActionList(i,e,o))}:{id:"showMoreActions",label:b("showMoreActions","Show Disabled"),enabled:!0,tooltip:"",class:void 0,run:()=>(this._showDisabled=!0,this.showCodeActionList(i,e,o))}),t}};g=S([l(1,O),l(2,H),l(3,D),l(4,J),l(5,K),l(6,N),l(7,E),l(8,k),l(9,D),l(10,j)],g),$((h,a)=>{((o,t)=>{t&&a.addRule(`.monaco-editor ${o} { background-color: ${t}; }`)})(".quickfix-edit-highlight",h.getColor(V));const e=h.getColor(q);e&&a.addRule(`.monaco-editor .quickfix-edit-highlight { border: 1px ${z(h.type)?"dotted":"solid"} ${e}; box-sizing: border-box; }`)});export{g as CodeActionController};
