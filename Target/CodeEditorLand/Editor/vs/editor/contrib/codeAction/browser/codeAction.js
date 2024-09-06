import{coalesce as T,equals as E,isNonEmptyArray as v}from"../../../../base/common/arrays.js";import{CancellationToken as h}from"../../../../base/common/cancellation.js";import{illegalArgument as x,isCancellationError as R,onUnexpectedExternalError as M}from"../../../../base/common/errors.js";import{HierarchicalKind as g}from"../../../../base/common/hierarchicalKind.js";import{Disposable as D,DisposableStore as K}from"../../../../base/common/lifecycle.js";import{URI as L}from"../../../../base/common/uri.js";import*as N from"../../../../nls.js";import{CommandsRegistry as q,ICommandService as z}from"../../../../platform/commands/common/commands.js";import"../../../../platform/instantiation/common/instantiation.js";import{INotificationService as H}from"../../../../platform/notification/common/notification.js";import{Progress as U}from"../../../../platform/progress/common/progress.js";import{ITelemetryService as B}from"../../../../platform/telemetry/common/telemetry.js";import"../../../browser/editorBrowser.js";import{IBulkEditService as V}from"../../../browser/services/bulkEditService.js";import{Range as j}from"../../../common/core/range.js";import{Selection as P}from"../../../common/core/selection.js";import"../../../common/languageFeatureRegistry.js";import*as w from"../../../common/languages.js";import"../../../common/model.js";import{ILanguageFeaturesService as O}from"../../../common/services/languageFeatures.js";import{IModelService as Q}from"../../../common/services/model.js";import{TextModelCancellationTokenSource as W}from"../../editorState/browser/editorState.js";import{CodeActionItem as _,CodeActionKind as b,CodeActionTriggerSource as G,filtersAction as J,mayIncludeActionsOfKind as X}from"../common/types.js";const Me="editor.action.codeAction",De="editor.action.quickFix",Ke="editor.action.autoFix",Le="editor.action.refactor",Ne="editor.action.refactor.preview",qe="editor.action.sourceAction",ze="editor.action.organizeImports",He="editor.action.fixAll";class A extends D{constructor(e,t,o){super();this.documentation=t;this._register(o),this.allActions=[...e].sort(A.codeActionsComparator),this.validActions=this.allActions.filter(({action:r})=>!r.disabled)}static codeActionsPreferredComparator(e,t){return e.isPreferred&&!t.isPreferred?-1:!e.isPreferred&&t.isPreferred?1:0}static codeActionsComparator({action:e},{action:t}){return e.isAI&&!t.isAI?1:!e.isAI&&t.isAI?-1:v(e.diagnostics)?v(t.diagnostics)?A.codeActionsPreferredComparator(e,t):-1:v(t.diagnostics)?1:A.codeActionsPreferredComparator(e,t)}validActions;allActions;get hasAutoFix(){return this.validActions.some(({action:e})=>!!e.kind&&b.QuickFix.contains(new g(e.kind))&&!!e.isPreferred)}get hasAIFix(){return this.validActions.some(({action:e})=>!!e.isAI)}get allAIFixes(){return this.validActions.every(({action:e})=>!!e.isAI)}}const k={actions:[],documentation:void 0};async function Y(i,n,e,t,o,r){const c=t.filter||{},u={...c,excludes:[...c.excludes||[],b.Notebook]},f={only:c.include?.value,trigger:t.type},a=new W(n,r),m=t.type===w.CodeActionTriggerType.Auto,C=Z(i,n,m?u:c),l=new K,S=C.map(async d=>{try{o.report(d);const s=await d.provideCodeActions(n,e,f,a.token);if(s&&l.add(s),a.token.isCancellationRequested)return k;const y=(s?.actions||[]).filter(I=>I&&J(c,I)),p=ee(d,y,c.include);return{actions:y.map(I=>new _(I,d)),documentation:p}}catch(s){if(R(s))throw s;return M(s),k}}),F=i.onDidChange(()=>{const d=i.all(n);E(d,C)||a.cancel()});try{const d=await Promise.all(S),s=d.map(p=>p.actions).flat(),y=[...T(d.map(p=>p.documentation)),...$(i,n,t,s)];return new A(s,y,l)}finally{F.dispose(),a.dispose()}}function Z(i,n,e){return i.all(n).filter(t=>t.providedCodeActionKinds?t.providedCodeActionKinds.some(o=>X(e,new g(o))):!0)}function*$(i,n,e,t){if(n&&t.length)for(const o of i.all(n))o._getAdditionalMenuItems&&(yield*o._getAdditionalMenuItems?.({trigger:e.type,only:e.filter?.include?.value},t.map(r=>r.action)))}function ee(i,n,e){if(!i.documentation)return;const t=i.documentation.map(o=>({kind:new g(o.kind),command:o.command}));if(e){let o;for(const r of t)r.kind.contains(e)&&(o?o.kind.contains(r.kind)&&(o=r):o=r);if(o)return o?.command}for(const o of n)if(o.kind){for(const r of t)if(r.kind.contains(new g(o.kind)))return r.command}}var oe=(o=>(o.OnSave="onSave",o.FromProblemsView="fromProblemsView",o.FromCodeActions="fromCodeActions",o.FromAILightbulb="fromAILightbulb",o))(oe||{});async function Ue(i,n,e,t,o=h.None){const r=i.get(V),c=i.get(z),u=i.get(B),f=i.get(H);if(u.publicLog2("codeAction.applyCodeAction",{codeActionTitle:n.action.title,codeActionKind:n.action.kind,codeActionIsPreferred:!!n.action.isPreferred,reason:e}),await n.resolve(o),!o.isCancellationRequested&&!(n.action.edit?.edits.length&&!(await r.apply(n.action.edit,{editor:t?.editor,label:n.action.title,quotableLabel:n.action.title,code:"undoredo.codeAction",respectAutoSaveConfig:e!=="onSave",showPreview:t?.preview})).isApplied)&&n.action.command)try{await c.executeCommand(n.action.command.id,...n.action.command.arguments||[])}catch(a){const m=te(a);f.error(typeof m=="string"?m:N.localize("applyCodeActionFailed","An unknown error occurred while applying the code action"))}}function te(i){return typeof i=="string"?i:i instanceof Error&&typeof i.message=="string"?i.message:void 0}q.registerCommand("_executeCodeActionProvider",async function(i,n,e,t,o){if(!(n instanceof L))throw x();const{codeActionProvider:r}=i.get(O),c=i.get(Q).getModel(n);if(!c)throw x();const u=P.isISelection(e)?P.liftSelection(e):j.isIRange(e)?c.validateRange(e):void 0;if(!u)throw x();const f=typeof t=="string"?new g(t):void 0,a=await Y(r,c,u,{type:w.CodeActionTriggerType.Invoke,triggerAction:G.Default,filter:{includeSourceActions:!0,include:f}},U.None,h.None),m=[],C=Math.min(a.validActions.length,typeof o=="number"?o:0);for(let l=0;l<C;l++)m.push(a.validActions[l].resolve(h.None));try{return await Promise.all(m),a.validActions.map(l=>l.action)}finally{setTimeout(()=>a.dispose(),100)}});export{oe as ApplyCodeActionReason,Ue as applyCodeAction,Ke as autoFixCommandId,Me as codeActionCommandId,He as fixAllCommandId,Y as getCodeActions,ze as organizeImportsCommandId,De as quickFixCommandId,Le as refactorCommandId,Ne as refactorPreviewCommandId,qe as sourceActionCommandId};
