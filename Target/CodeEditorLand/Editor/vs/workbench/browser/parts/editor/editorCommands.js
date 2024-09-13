import{KeyChord as A,KeyCode as s,KeyMod as g}from"../../../../base/common/keyCodes.js";import{Schemas as K,matchesScheme as X}from"../../../../base/common/network.js";import{extname as ae}from"../../../../base/common/resources.js";import{isNumber as pe,isObject as me,isString as Q,isUndefined as Z}from"../../../../base/common/types.js";import{URI as _}from"../../../../base/common/uri.js";import{isDiffEditor as Ee}from"../../../../editor/browser/editorBrowser.js";import{EditorContextKeys as V}from"../../../../editor/common/editorContextKeys.js";import{localize as x,localize2 as O}from"../../../../nls.js";import{Categories as w}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as b,registerAction2 as D}from"../../../../platform/actions/common/actions.js";import{CommandsRegistry as C,ICommandService as P}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as k}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as U}from"../../../../platform/contextkey/common/contextkey.js";import{EditorResolution as ge}from"../../../../platform/editor/common/editor.js";import{IInstantiationService as le}from"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as v,KeybindingsRegistry as y}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{IListService as h}from"../../../../platform/list/browser/listService.js";import{IOpenerService as fe}from"../../../../platform/opener/common/opener.js";import{IQuickInputService as ve}from"../../../../platform/quickinput/common/quickInput.js";import{ITelemetryService as Ce}from"../../../../platform/telemetry/common/telemetry.js";import{ActiveEditorCanSplitInGroupContext as H,ActiveEditorGroupEmptyContext as he,ActiveEditorGroupLockedContext as $,ActiveEditorStickyContext as ee,MultipleEditorGroupsContext as Ie,SideBySideEditorActiveContext as T,TextCompareEditorActiveContext as B}from"../../../common/contextkeys.js";import{CloseDirection as ye,EditorInputCapabilities as Se,EditorsOrder as Y,isEditorInputWithOptionsAndGroup as _e}from"../../../common/editor.js";import{DiffEditorInput as Oe}from"../../../common/editor/diffEditorInput.js";import{SideBySideEditorInput as j}from"../../../common/editor/sideBySideEditorInput.js";import{columnToEditorGroup as z}from"../../../services/editor/common/editorGroupColumn.js";import{GroupDirection as S,GroupLocation as W,GroupsOrder as J,IEditorGroupsService as E,preferredSideBySideGroupDirection as te}from"../../../services/editor/common/editorGroupsService.js";import{IEditorResolverService as we}from"../../../services/editor/common/editorResolverService.js";import{IEditorService as m,SIDE_GROUP as be}from"../../../services/editor/common/editorService.js";import{IPathService as De}from"../../../services/path/common/pathService.js";import{IUntitledTextEditorService as Ge}from"../../../services/untitled/common/untitledTextEditorService.js";import{DIFF_FOCUS_OTHER_SIDE as Ae,DIFF_FOCUS_PRIMARY_SIDE as ke,DIFF_FOCUS_SECONDARY_SIDE as Te,DIFF_OPEN_SIDE as Re,registerDiffEditorCommands as xe}from"./diffEditorCommands.js";import{resolveCommandsContext as I}from"./editorCommandsContext.js";import{ActiveGroupEditorsByMostRecentlyUsedQuickAccess as Pe}from"./editorQuickAccess.js";import{SideBySideEditor as N}from"./sideBySideEditor.js";import{TextDiffEditor as q}from"./textDiffEditor.js";const Ne="workbench.action.closeUnmodifiedEditors",Me="workbench.action.closeEditorsInGroup",Ue="workbench.action.closeEditorsAndGroup",We="workbench.action.closeEditorsToTheRight",oe="workbench.action.closeActiveEditor",Le="workbench.action.closeActivePinnedEditor",Fe="workbench.action.closeGroup",Ke="workbench.action.closeOtherEditors",Ve="moveActiveEditor",He="copyActiveEditor",Be="layoutEditorGroups",Ye="workbench.action.keepEditor",je="workbench.action.toggleKeepEditors",ze="workbench.action.toggleEditorGroupLock",Je="workbench.action.lockEditorGroup",re="workbench.action.unlockEditorGroup",qe="workbench.action.showEditorsInGroup",Xe="workbench.action.reopenWithEditor",Qe="workbench.action.pinEditor",ie="workbench.action.unpinEditor",Ze="workbench.action.splitEditor",$e="workbench.action.splitEditorUp",et="workbench.action.splitEditorDown",tt="workbench.action.splitEditorLeft",ot="workbench.action.splitEditorRight",rt="workbench.action.toggleMaximizeEditorGroup",it="workbench.action.splitEditorInGroup",nt="workbench.action.toggleSplitEditorInGroup",dt="workbench.action.joinEditorInGroup",ct="workbench.action.toggleSplitEditorInGroupLayout",st="workbench.action.focusFirstSideEditor",ut="workbench.action.focusSecondSideEditor",at="workbench.action.focusOtherSideEditor",pt="workbench.action.focusLeftGroupWithoutWrap",mt="workbench.action.focusRightGroupWithoutWrap",Et="workbench.action.focusAboveGroupWithoutWrap",gt="workbench.action.focusBelowGroupWithoutWrap",ne="workbench.action.openEditorAtIndex",ao="workbench.action.moveEditorToNewWindow",po="workbench.action.copyEditorToNewWindow",mo="workbench.action.moveEditorGroupToNewWindow",Eo="workbench.action.copyEditorGroupToNewWindow",go="workbench.action.newEmptyEditorWindow",de="_workbench.open",ce="_workbench.diff",lt="_workbench.openWith",lo=[Ze,oe,ie,re,rt],se=c=>!(!me(c)||!Q(c.to)||!Z(c.by)&&!Q(c.by)||!Z(c.value)&&!pe(c.value));function ft(){const c={type:"object",required:["to"],properties:{to:{type:"string",enum:["left","right"]},by:{type:"string",enum:["tab","group"]},value:{type:"number"}}};y.registerCommandAndKeybindingRule({id:Ve,weight:v.WorkbenchContrib,when:V.editorTextFocus,primary:0,handler:(r,i)=>t(!0,i,r),metadata:{description:x("editorCommand.activeEditorMove.description","Move the active editor by tabs or groups"),args:[{name:x("editorCommand.activeEditorMove.arg.name","Active editor move argument"),description:x("editorCommand.activeEditorMove.arg.description",`Argument Properties:
	* 'to': String value providing where to move.
	* 'by': String value providing the unit for move (by tab or by group).
	* 'value': Number value providing how many positions or an absolute position to move.`),constraint:se,schema:c}]}}),y.registerCommandAndKeybindingRule({id:He,weight:v.WorkbenchContrib,when:V.editorTextFocus,primary:0,handler:(r,i)=>t(!1,i,r),metadata:{description:x("editorCommand.activeEditorCopy.description","Copy the active editor by groups"),args:[{name:x("editorCommand.activeEditorCopy.arg.name","Active editor copy argument"),description:x("editorCommand.activeEditorCopy.arg.description",`Argument Properties:
	* 'to': String value providing where to copy.
	* 'value': Number value providing how many positions or an absolute position to copy.`),constraint:se,schema:c}]}});function t(r,i=Object.create(null),n){i.to=i.to||"right",i.by=i.by||"tab",i.value=typeof i.value=="number"?i.value:1;const d=n.get(m).activeEditorPane;if(d)switch(i.by){case"tab":if(r)return e(i,d);break;case"group":return o(r,i,d,n)}}function e(r,i){const n=i.group;let d=n.getIndexOfEditor(i.input);switch(r.to){case"first":d=0;break;case"last":d=n.count-1;break;case"left":d=d-(r.value??1);break;case"right":d=d+(r.value??1);break;case"center":d=Math.round(n.count/2)-1;break;case"position":d=(r.value??1)-1;break}d=d<0?0:d>=n.count?n.count-1:d,n.moveEditor(i.input,n,{index:d})}function o(r,i,n,d){const u=d.get(E),l=d.get(k),p=n.group;let a;switch(i.to){case"left":a=u.findGroup({direction:S.LEFT},p),a||(a=u.addGroup(p,S.LEFT));break;case"right":a=u.findGroup({direction:S.RIGHT},p),a||(a=u.addGroup(p,S.RIGHT));break;case"up":a=u.findGroup({direction:S.UP},p),a||(a=u.addGroup(p,S.UP));break;case"down":a=u.findGroup({direction:S.DOWN},p),a||(a=u.addGroup(p,S.DOWN));break;case"first":a=u.findGroup({location:W.FIRST},p);break;case"last":a=u.findGroup({location:W.LAST},p);break;case"previous":a=u.findGroup({location:W.PREVIOUS},p);break;case"next":a=u.findGroup({location:W.NEXT},p),a||(a=u.addGroup(p,te(l)));break;case"center":a=u.getGroups(J.GRID_APPEARANCE)[u.count/2-1];break;case"position":a=u.getGroups(J.GRID_APPEARANCE)[(i.value??1)-1];break}a&&(r?p.moveEditor(n.input,a):p.id!==a.id&&p.copyEditor(n.input,a),a.focus())}}function vt(){function c(t,e){if(!e||typeof e!="object")return;t.get(E).applyLayout(e)}C.registerCommand(Be,(t,e)=>{c(t,e)}),C.registerCommand({id:"vscode.setEditorLayout",handler:(t,e)=>c(t,e),metadata:{description:"Set Editor Layout",args:[{name:"args",schema:{type:"object",required:["groups"],properties:{orientation:{type:"number",default:0,enum:[0,1]},groups:{$ref:"#/definitions/editorGroupsSchema",default:[{},{}]}}}}]}}),C.registerCommand({id:"vscode.getEditorLayout",handler:t=>t.get(E).getLayout(),metadata:{description:"Get Editor Layout",args:[],returns:"An editor layout object, in the same format as vscode.setEditorLayout"}})}function Ct(){function c(t,e,o){return t?[{...t.editorOptions,...e??Object.create(null)},t.sideBySide?be:o]:[e,o]}C.registerCommand({id:"vscode.open",handler:(t,e)=>{t.get(P).executeCommand(de,e)},metadata:{description:"Opens the provided resource in the editor.",args:[{name:"Uri"}]}}),C.registerCommand(de,async(t,e,o,r,i)=>{const n=t.get(m),d=t.get(E),u=t.get(fe),l=t.get(De),p=t.get(k),a=t.get(Ge),f=typeof e=="string"?e:_.from(e,!0),[G,R]=o??[];if(R||typeof G=="number"||X(f,K.untitled)){const[M,ue]=c(i,R,G),L=_.isUri(f)?f:_.parse(f);let F;a.isUntitledWithAssociatedResource(L)?F={resource:L.with({scheme:l.defaultUriScheme}),forceUntitled:!0,options:M,label:r}:F={resource:L,options:M,label:r},await n.openEditor(F,z(d,p,ue))}else{if(X(f,K.command))return;await u.open(f,{openToSide:i?.sideBySide,editorOptions:i?.editorOptions})}}),C.registerCommand({id:"vscode.diff",handler:(t,e,o,r)=>{t.get(P).executeCommand(ce,e,o,r)},metadata:{description:"Opens the provided resources in the diff editor to compare their contents.",args:[{name:"left",description:"Left-hand side resource of the diff editor"},{name:"right",description:"Right-hand side resource of the diff editor"},{name:"title",description:"Human readable title for the diff editor"}]}}),C.registerCommand(ce,async(t,e,o,r,i,n)=>{const d=t.get(m),u=t.get(E),l=t.get(k),[p,a]=i??[],[f,G]=c(n,a,p);let R,M;typeof r=="string"?R=r:r&&(R=r.label,M=r.description),await d.openEditor({original:{resource:_.from(e,!0)},modified:{resource:_.from(o,!0)},label:R,description:M,options:f},z(u,l,G))}),C.registerCommand(lt,async(t,e,o,r)=>{const i=t.get(m),n=t.get(E),d=t.get(k),[u,l]=r??[];await i.openEditor({resource:_.from(e,!0),options:{...l,pinned:!0,override:o}},z(n,d,u))}),C.registerCommand({id:"vscode.changes",handler:(t,e,o)=>{t.get(P).executeCommand("_workbench.changes",e,o)},metadata:{description:"Opens a list of resources in the changes editor to compare their contents.",args:[{name:"title",description:"Human readable title for the diff editor"},{name:"resources",description:"List of resources to open in the changes editor"}]}}),C.registerCommand("_workbench.changes",async(t,e,o)=>{const r=t.get(m),i=[];for(const[n,d,u]of o)i.push({resource:_.revive(n),original:{resource:_.revive(d)},modified:{resource:_.revive(u)}});await r.openEditor({resources:i,label:e})}),C.registerCommand("_workbench.openMultiDiffEditor",async(t,e)=>{await t.get(m).openEditor({multiDiffSource:e.multiDiffSourceUri?_.revive(e.multiDiffSourceUri):void 0,resources:e.resources?.map(r=>({original:{resource:_.revive(r.originalUri)},modified:{resource:_.revive(r.modifiedUri)}})),label:e.title})})}function ht(){const c=(e,o)=>{const r=e.get(m),i=r.activeEditorPane;if(i){const n=i.group.getEditorByIndex(o);n&&r.openEditor(n)}};C.registerCommand({id:ne,handler:c});for(let e=0;e<9;e++){const o=e,r=e+1;y.registerCommandAndKeybindingRule({id:ne+r,weight:v.WorkbenchContrib,when:void 0,primary:g.Alt|t(r),mac:{primary:g.WinCtrl|t(r)},handler:i=>c(i,o)})}function t(e){switch(e){case 0:return s.Digit0;case 1:return s.Digit1;case 2:return s.Digit2;case 3:return s.Digit3;case 4:return s.Digit4;case 5:return s.Digit5;case 6:return s.Digit6;case 7:return s.Digit7;case 8:return s.Digit8;case 9:return s.Digit9}throw new Error("invalid index")}}function It(){for(let e=1;e<8;e++)y.registerCommandAndKeybindingRule({id:c(e),weight:v.WorkbenchContrib,when:void 0,primary:g.CtrlCmd|t(e),handler:o=>{const r=o.get(E),i=o.get(k);if(e>r.count)return;const n=r.getGroups(J.GRID_APPEARANCE);if(n[e])return n[e].focus();const d=te(i),u=r.findGroup({location:W.LAST});if(!u)return;r.addGroup(u,d).focus()}});function c(e){switch(e){case 1:return"workbench.action.focusSecondEditorGroup";case 2:return"workbench.action.focusThirdEditorGroup";case 3:return"workbench.action.focusFourthEditorGroup";case 4:return"workbench.action.focusFifthEditorGroup";case 5:return"workbench.action.focusSixthEditorGroup";case 6:return"workbench.action.focusSeventhEditorGroup";case 7:return"workbench.action.focusEighthEditorGroup"}throw new Error("Invalid index")}function t(e){switch(e){case 1:return s.Digit2;case 2:return s.Digit3;case 3:return s.Digit4;case 4:return s.Digit5;case 5:return s.Digit6;case 6:return s.Digit7;case 7:return s.Digit8}throw new Error("Invalid index")}}function yt(c,t,e){if(!e.groupedEditors.length)return;const{group:o,editors:r}=e.groupedEditors[0],i=e.preserveFocus,n=c.addGroup(o,t);for(const d of r)d&&!d.hasCapability(Se.Singleton)&&o.copyEditor(d,n,{preserveFocus:i});n.focus()}function St(){[{id:$e,direction:S.UP},{id:et,direction:S.DOWN},{id:tt,direction:S.LEFT},{id:ot,direction:S.RIGHT}].forEach(({id:c,direction:t})=>{C.registerCommand(c,(e,...o)=>{const r=I(o,e.get(m),e.get(E),e.get(h));yt(e.get(E),t,r)})})}function _t(){function c(t,e,...o){const r=t.get(E),i=t.get(m);let n;if(e||o.length?n=!1:n=r.partOptions.preventPinnedEditorClose==="keyboard"||r.partOptions.preventPinnedEditorClose==="keyboardAndMouse",n){const l=r.activeGroup,p=l.activeEditor;if(p&&l.isSticky(p)){const a=l.getEditors(Y.MOST_RECENTLY_ACTIVE,{excludeSticky:!0})[0];if(a)return l.openEditor(a);const f=i.getEditors(Y.MOST_RECENTLY_ACTIVE,{excludeSticky:!0})[0];if(f)return Promise.resolve(r.getGroup(f.groupId)?.openEditor(f.editor))}}const d=I(o,t.get(m),t.get(E),t.get(h)),u=d.preserveFocus;return Promise.all(d.groupedEditors.map(async({group:l,editors:p})=>{const a=p.filter(f=>!n||!l.isSticky(f));await l.closeEditors(a,{preserveFocus:u})}))}y.registerCommandAndKeybindingRule({id:oe,weight:v.WorkbenchContrib,when:void 0,primary:g.CtrlCmd|s.KeyW,win:{primary:g.CtrlCmd|s.F4,secondary:[g.CtrlCmd|s.KeyW]},handler:(t,...e)=>c(t,!1,...e)}),C.registerCommand(Le,(t,...e)=>c(t,!0,...e)),y.registerCommandAndKeybindingRule({id:Me,weight:v.WorkbenchContrib,when:void 0,primary:A(g.CtrlCmd|s.KeyK,s.KeyW),handler:(t,...e)=>{const o=I(e,t.get(m),t.get(E),t.get(h));return Promise.all(o.groupedEditors.map(async({group:r})=>{await r.closeAllEditors({excludeSticky:!0})}))}}),y.registerCommandAndKeybindingRule({id:Fe,weight:v.WorkbenchContrib,when:U.and(he,Ie),primary:g.CtrlCmd|s.KeyW,win:{primary:g.CtrlCmd|s.F4,secondary:[g.CtrlCmd|s.KeyW]},handler:(t,...e)=>{const o=t.get(E),r=I(e,t.get(m),o,t.get(h));r.groupedEditors.length&&o.removeGroup(r.groupedEditors[0].group)}}),y.registerCommandAndKeybindingRule({id:Ne,weight:v.WorkbenchContrib,when:void 0,primary:A(g.CtrlCmd|s.KeyK,s.KeyU),handler:(t,...e)=>{const o=I(e,t.get(m),t.get(E),t.get(h));return Promise.all(o.groupedEditors.map(async({group:r})=>{await r.closeEditors({savedOnly:!0,excludeSticky:!0},{preserveFocus:o.preserveFocus})}))}}),y.registerCommandAndKeybindingRule({id:Ke,weight:v.WorkbenchContrib,when:void 0,primary:void 0,mac:{primary:g.CtrlCmd|g.Alt|s.KeyT},handler:(t,...e)=>{const o=I(e,t.get(m),t.get(E),t.get(h));return Promise.all(o.groupedEditors.map(async({group:r,editors:i})=>{const n=r.getEditors(Y.SEQUENTIAL,{excludeSticky:!0}).filter(d=>!i.includes(d));for(const d of i)d&&r.pinEditor(d);await r.closeEditors(n,{preserveFocus:o.preserveFocus})}))}}),y.registerCommandAndKeybindingRule({id:We,weight:v.WorkbenchContrib,when:void 0,primary:void 0,handler:async(t,...e)=>{const o=I(e,t.get(m),t.get(E),t.get(h));if(o.groupedEditors.length){const{group:r,editors:i}=o.groupedEditors[0];r.activeEditor&&r.pinEditor(r.activeEditor),await r.closeEditors({direction:ye.RIGHT,except:i[0],excludeSticky:!0},{preserveFocus:o.preserveFocus})}}}),y.registerCommandAndKeybindingRule({id:Xe,weight:v.WorkbenchContrib,when:void 0,primary:void 0,handler:async(t,...e)=>{const o=t.get(m),r=t.get(we),i=t.get(Ce),n=I(e,o,t.get(E),t.get(h)),d=new Map;for(const{group:u,editors:l}of n.groupedEditors)for(const p of l){const a=p.toUntyped();if(!a)return;a.options={...o.activeEditorPane?.options,override:ge.PICK};const f=await r.resolveEditor(a,u);if(!_e(f))return;let G=d.get(u);G||(G=[],d.set(u,G)),G.push({editor:p,replacement:f.editor,forceReplaceDirty:p.resource?.scheme===K.untitled,options:f.options}),i.publicLog2("workbenchEditorReopen",{scheme:p.resource?.scheme??"",ext:p.resource?ae(p.resource):"",from:p.editorId??"",to:f.editor.editorId??""})}for(const[u,l]of d)await u.replaceEditors(l),await u.openEditor(l[0].replacement)}}),C.registerCommand(Ue,async(t,...e)=>{const o=t.get(E),r=I(e,t.get(m),o,t.get(h));if(r.groupedEditors.length){const{group:i}=r.groupedEditors[0];await i.closeAllEditors(),i.count===0&&o.getGroup(i.id)&&o.removeGroup(i)}})}function Ot(){const c=[{id:pt,direction:S.LEFT},{id:mt,direction:S.RIGHT},{id:Et,direction:S.UP},{id:gt,direction:S.DOWN}];for(const t of c)C.registerCommand(t.id,async e=>{const o=e.get(E);o.findGroup({direction:t.direction},o.activeGroup,!1)?.focus()})}function wt(){async function c(e,o){const r=e.get(le);if(!o.groupedEditors.length)return;const{group:i,editors:n}=o.groupedEditors[0],d=n[0];d&&await i.replaceEditors([{editor:d,replacement:r.createInstance(j,void 0,void 0,d,d),forceReplaceDirty:!0}])}D(class extends b{constructor(){super({id:it,title:O("splitEditorInGroup","Split Editor in Group"),category:w.View,precondition:H,f1:!0,keybinding:{weight:v.WorkbenchContrib,when:H,primary:A(g.CtrlCmd|s.KeyK,g.CtrlCmd|g.Shift|s.Backslash)}})}run(e,...o){return c(e,I(o,e.get(m),e.get(E),e.get(h)))}});async function t(e){if(!e.groupedEditors.length)return;const{group:o,editors:r}=e.groupedEditors[0],i=r[0];if(!i||!(i instanceof j))return;let n;const d=o.activeEditorPane;if(d instanceof N&&o.activeEditor===i){for(const u of[d.getPrimaryEditorPane(),d.getSecondaryEditorPane()])if(u?.hasFocus()){n={viewState:u.getViewState()};break}}await o.replaceEditors([{editor:i,replacement:i.primary,options:n}])}D(class extends b{constructor(){super({id:dt,title:O("joinEditorInGroup","Join Editor in Group"),category:w.View,precondition:T,f1:!0,keybinding:{weight:v.WorkbenchContrib,when:T,primary:A(g.CtrlCmd|s.KeyK,g.CtrlCmd|g.Shift|s.Backslash)}})}run(e,...o){return t(I(o,e.get(m),e.get(E),e.get(h)))}}),D(class extends b{constructor(){super({id:nt,title:O("toggleJoinEditorInGroup","Toggle Split Editor in Group"),category:w.View,precondition:U.or(H,T),f1:!0})}async run(e,...o){const r=I(o,e.get(m),e.get(E),e.get(h));if(!r.groupedEditors.length)return;const{editors:i}=r.groupedEditors[0];i[0]instanceof j?await t(r):i[0]&&await c(e,r)}}),D(class extends b{constructor(){super({id:ct,title:O("toggleSplitEditorInGroupLayout","Toggle Layout of Split Editor in Group"),category:w.View,precondition:T,f1:!0})}async run(e){const o=e.get(k),r=o.getValue(N.SIDE_BY_SIDE_LAYOUT_SETTING);let i;return r!=="horizontal"?i="horizontal":i="vertical",o.updateValue(N.SIDE_BY_SIDE_LAYOUT_SETTING,i)}})}function bt(){D(class extends b{constructor(){super({id:st,title:O("focusLeftSideEditor","Focus First Side in Active Editor"),category:w.View,precondition:U.or(T,B),f1:!0})}async run(c){const t=c.get(m),e=c.get(P),o=t.activeEditorPane;o instanceof N?o.getSecondaryEditorPane()?.focus():o instanceof q&&await e.executeCommand(Te)}}),D(class extends b{constructor(){super({id:ut,title:O("focusRightSideEditor","Focus Second Side in Active Editor"),category:w.View,precondition:U.or(T,B),f1:!0})}async run(c){const t=c.get(m),e=c.get(P),o=t.activeEditorPane;o instanceof N?o.getPrimaryEditorPane()?.focus():o instanceof q&&await e.executeCommand(ke)}}),D(class extends b{constructor(){super({id:at,title:O("focusOtherSideEditor","Focus Other Side in Active Editor"),category:w.View,precondition:U.or(T,B),f1:!0})}async run(c){const t=c.get(m),e=c.get(P),o=t.activeEditorPane;o instanceof N?o.getPrimaryEditorPane()?.hasFocus()?o.getSecondaryEditorPane()?.focus():o.getPrimaryEditorPane()?.focus():o instanceof q&&await e.executeCommand(Ae)}})}function Dt(){y.registerCommandAndKeybindingRule({id:Ye,weight:v.WorkbenchContrib,when:void 0,primary:A(g.CtrlCmd|s.KeyK,s.Enter),handler:async(t,...e)=>{const o=I(e,t.get(m),t.get(E),t.get(h));for(const{group:r,editors:i}of o.groupedEditors)for(const n of i)r.pinEditor(n)}}),C.registerCommand({id:je,handler:t=>{const e=t.get(k),r=e.getValue("workbench.editor.enablePreview")!==!0;e.updateValue("workbench.editor.enablePreview",r)}});function c(t,e,...o){const i=I(o,t.get(m),t.get(E),t.get(h)).groupedEditors[0]?.group;i?.lock(e??!i.isLocked)}D(class extends b{constructor(){super({id:ze,title:O("toggleEditorGroupLock","Toggle Editor Group Lock"),category:w.View,f1:!0})}async run(t,...e){c(t,void 0,...e)}}),D(class extends b{constructor(){super({id:Je,title:O("lockEditorGroup","Lock Editor Group"),category:w.View,precondition:$.toNegated(),f1:!0})}async run(t,...e){c(t,!0,...e)}}),D(class extends b{constructor(){super({id:re,title:O("unlockEditorGroup","Unlock Editor Group"),precondition:$,category:w.View,f1:!0})}async run(t,...e){c(t,!1,...e)}}),y.registerCommandAndKeybindingRule({id:Qe,weight:v.WorkbenchContrib,when:ee.toNegated(),primary:A(g.CtrlCmd|s.KeyK,g.Shift|s.Enter),handler:async(t,...e)=>{const o=I(e,t.get(m),t.get(E),t.get(h));for(const{group:r,editors:i}of o.groupedEditors)for(const n of i)r.stickEditor(n)}}),y.registerCommandAndKeybindingRule({id:Re,weight:v.WorkbenchContrib,when:V.inDiffEditor,primary:A(g.CtrlCmd|s.KeyK,g.Shift|s.KeyO),handler:async t=>{const e=t.get(m),o=t.get(E),r=e.activeEditor,i=e.activeTextEditorControl;if(!Ee(i)||!(r instanceof Oe))return;let n;return i.getOriginalEditor().hasTextFocus()?n=r.original:n=r.modified,o.activeGroup.openEditor(n)}}),y.registerCommandAndKeybindingRule({id:ie,weight:v.WorkbenchContrib,when:ee,primary:A(g.CtrlCmd|s.KeyK,g.Shift|s.Enter),handler:async(t,...e)=>{const o=I(e,t.get(m),t.get(E),t.get(h));for(const{group:r,editors:i}of o.groupedEditors)for(const n of i)r.unstickEditor(n)}}),y.registerCommandAndKeybindingRule({id:qe,weight:v.WorkbenchContrib,when:void 0,primary:void 0,handler:(t,...e)=>{const o=t.get(E),r=t.get(ve),n=I(e,t.get(m),o,t.get(h)).groupedEditors[0]?.group;return n&&o.activateGroup(n),r.quickAccess.show(Pe.PREFIX)}})}function fo(){ft(),vt(),xe(),Ct(),ht(),_t(),Dt(),wt(),bt(),It(),St(),Ot()}export{ce as API_OPEN_DIFF_EDITOR_COMMAND_ID,de as API_OPEN_EDITOR_COMMAND_ID,lt as API_OPEN_WITH_EDITOR_COMMAND_ID,Ue as CLOSE_EDITORS_AND_GROUP_COMMAND_ID,Me as CLOSE_EDITORS_IN_GROUP_COMMAND_ID,We as CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID,oe as CLOSE_EDITOR_COMMAND_ID,Fe as CLOSE_EDITOR_GROUP_COMMAND_ID,Ke as CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,Le as CLOSE_PINNED_EDITOR_COMMAND_ID,Ne as CLOSE_SAVED_EDITORS_COMMAND_ID,He as COPY_ACTIVE_EDITOR_COMMAND_ID,Eo as COPY_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID,po as COPY_EDITOR_INTO_NEW_WINDOW_COMMAND_ID,lo as EDITOR_CORE_NAVIGATION_COMMANDS,Et as FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID,gt as FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID,st as FOCUS_FIRST_SIDE_EDITOR,pt as FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID,at as FOCUS_OTHER_SIDE_EDITOR,mt as FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID,ut as FOCUS_SECOND_SIDE_EDITOR,dt as JOIN_EDITOR_IN_GROUP,Ye as KEEP_EDITOR_COMMAND_ID,Be as LAYOUT_EDITOR_GROUPS_COMMAND_ID,Je as LOCK_GROUP_COMMAND_ID,Ve as MOVE_ACTIVE_EDITOR_COMMAND_ID,mo as MOVE_EDITOR_GROUP_INTO_NEW_WINDOW_COMMAND_ID,ao as MOVE_EDITOR_INTO_NEW_WINDOW_COMMAND_ID,go as NEW_EMPTY_EDITOR_WINDOW_COMMAND_ID,ne as OPEN_EDITOR_AT_INDEX_COMMAND_ID,Qe as PIN_EDITOR_COMMAND_ID,Xe as REOPEN_WITH_COMMAND_ID,qe as SHOW_EDITORS_IN_GROUP,Ze as SPLIT_EDITOR,et as SPLIT_EDITOR_DOWN,it as SPLIT_EDITOR_IN_GROUP,tt as SPLIT_EDITOR_LEFT,ot as SPLIT_EDITOR_RIGHT,$e as SPLIT_EDITOR_UP,je as TOGGLE_KEEP_EDITORS_COMMAND_ID,ze as TOGGLE_LOCK_GROUP_COMMAND_ID,rt as TOGGLE_MAXIMIZE_EDITOR_GROUP,nt as TOGGLE_SPLIT_EDITOR_IN_GROUP,ct as TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT,re as UNLOCK_GROUP_COMMAND_ID,ie as UNPIN_EDITOR_COMMAND_ID,fo as setup,yt as splitEditor};
