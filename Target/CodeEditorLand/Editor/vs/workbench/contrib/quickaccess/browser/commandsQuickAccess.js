var R=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var C=(f,a,t,i)=>{for(var o=i>1?void 0:i?T(a,t):a,r=f.length-1,e;r>=0;r--)(e=f[r])&&(o=(i?e(a,t,o):e(o))||o);return i&&o&&R(a,t,o),o},n=(f,a)=>(t,i)=>a(t,i,f);import{isFirefox as w}from"../../../../base/browser/browser.js";import{raceTimeout as x,timeout as D}from"../../../../base/common/async.js";import"../../../../base/common/cancellation.js";import{Codicon as O}from"../../../../base/common/codicons.js";import{stripIcons as _}from"../../../../base/common/iconLabels.js";import{KeyCode as v,KeyMod as S}from"../../../../base/common/keyCodes.js";import{Language as N}from"../../../../base/common/platform.js";import{ThemeIcon as L}from"../../../../base/common/themables.js";import"../../../../editor/common/editorCommon.js";import{AbstractEditorCommandsQuickAccessProvider as M}from"../../../../editor/contrib/quickAccess/browser/commandsQuickAccess.js";import{localize as u,localize2 as h}from"../../../../nls.js";import{isLocalizedString as K}from"../../../../platform/action/common/action.js";import{Action2 as y,IMenuService as Q,MenuId as H,MenuItemAction as F}from"../../../../platform/actions/common/actions.js";import{ICommandService as G}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as A}from"../../../../platform/configuration/common/configuration.js";import{IDialogService as k}from"../../../../platform/dialogs/common/dialogs.js";import{IInstantiationService as W}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as q}from"../../../../platform/keybinding/common/keybinding.js";import{KeybindingWeight as V}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{IProductService as z}from"../../../../platform/product/common/productService.js";import{CommandsHistory as P}from"../../../../platform/quickinput/browser/commandsQuickAccess.js";import{TriggerAction as B}from"../../../../platform/quickinput/browser/pickerQuickAccess.js";import{DefaultQuickAccessFilterValue as U}from"../../../../platform/quickinput/common/quickAccess.js";import{IQuickInputService as X}from"../../../../platform/quickinput/common/quickInput.js";import{IStorageService as $}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as j}from"../../../../platform/telemetry/common/telemetry.js";import"../../../browser/quickaccess.js";import{IAiRelatedInformationService as J,RelatedInformationType as Y}from"../../../services/aiRelatedInformation/common/aiRelatedInformation.js";import{IEditorGroupsService as Z}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as ee}from"../../../services/editor/common/editorService.js";import{IExtensionService as te}from"../../../services/extensions/common/extensions.js";import{createKeybindingCommandQuery as ie}from"../../../services/preferences/browser/keybindingsEditorModel.js";import{IPreferencesService as oe}from"../../../services/preferences/common/preferences.js";import{CHAT_OPEN_ACTION_ID as ne}from"../../chat/browser/actions/chatActions.js";import{ASK_QUICK_QUESTION_ACTION_ID as re}from"../../chat/browser/actions/chatQuickInputActions.js";import{ChatAgentLocation as ae,IChatAgentService as ce}from"../../chat/common/chatAgents.js";let l=class extends M{constructor(t,i,o,r,e,m,s,c,d,I,g,p,me,se){super({showAlias:!N.isDefaultVariant(),noResultsPick:()=>({label:u("noCommandResults","No matching commands"),commandId:""})},r,e,m,s,c);this.editorService=t;this.menuService=i;this.extensionService=o;this.configurationService=d;this.editorGroupService=I;this.preferencesService=g;this.productService=p;this.aiRelatedInformationService=me;this.chatAgentService=se;this._register(d.onDidChangeConfiguration(b=>this.updateOptions(b))),this.updateOptions()}static AI_RELATED_INFORMATION_MAX_PICKS=5;static AI_RELATED_INFORMATION_THRESHOLD=.8;static AI_RELATED_INFORMATION_DEBOUNCE=200;extensionRegistrationRace=x(this.extensionService.whenInstalledExtensionsRegistered(),800);useAiRelatedInfo=!1;get activeTextEditorControl(){return this.editorService.activeTextEditorControl}get defaultFilterValue(){if(this.configuration.preserveInput)return U.LAST}get configuration(){const t=this.configurationService.getValue().workbench.commandPalette;return{preserveInput:t.preserveInput,experimental:t.experimental}}updateOptions(t){if(t&&!t.affectsConfiguration("workbench.commandPalette.experimental"))return;const i=this.configuration,o=i.experimental.suggestCommands&&this.productService.commandPaletteSuggestedCommandIds?.length?new Set(this.productService.commandPaletteSuggestedCommandIds):void 0;this.options.suggestedCommandIds=o,this.useAiRelatedInfo=i.experimental.enableNaturalLanguageSearch}async getCommandPicks(t){return await this.extensionRegistrationRace,t.isCancellationRequested?[]:[...this.getCodeEditorCommandPicks(),...this.getGlobalCommandPicks()].map(i=>({...i,buttons:[{iconClass:L.asClassName(O.gear),tooltip:u("configure keybinding","Configure Keybinding")}],trigger:()=>(this.preferencesService.openGlobalKeybindingSettings(!1,{query:ie(i.commandId,i.commandWhen)}),B.CLOSE_PICKER)}))}hasAdditionalCommandPicks(t,i){return!(!this.useAiRelatedInfo||i.isCancellationRequested||t===""||!this.aiRelatedInformationService.isEnabled())}async getAdditionalCommandPicks(t,i,o,r){if(!this.hasAdditionalCommandPicks(o,r))return[];let e;try{await D(l.AI_RELATED_INFORMATION_DEBOUNCE,r),e=await this.getRelatedInformationPicks(t,i,o,r)}catch{return[]}(i.length||e.length)&&e.push({type:"separator"});const m=this.chatAgentService.getDefaultAgent(ae.Panel);return m&&e.push({label:u("askXInChat","Ask {0}: {1}",m.fullName,o),commandId:this.configuration.experimental.askChatLocation==="quickChat"?re:ne,args:[o]}),e}async getRelatedInformationPicks(t,i,o,r){const e=await this.aiRelatedInformationService.getRelatedInformation(o,[Y.CommandInformation],r);e.sort((c,d)=>d.weight-c.weight);const m=new Set(i.map(c=>c.commandId)),s=new Array;for(const c of e){if(c.weight<l.AI_RELATED_INFORMATION_THRESHOLD||s.length===l.AI_RELATED_INFORMATION_MAX_PICKS)break;const d=t.find(I=>I.commandId===c.command&&!m.has(I.commandId));d&&s.push(d)}return s}getGlobalCommandPicks(){const t=[],i=this.editorService.activeEditorPane?.scopedContextKeyService||this.editorGroupService.activeGroup.scopedContextKeyService,r=this.menuService.getMenuActions(H.CommandPalette,i).reduce((e,[,m])=>[...e,...m],[]).filter(e=>e instanceof F&&e.enabled);for(const e of r){let m=(typeof e.item.title=="string"?e.item.title:e.item.title.value)||e.item.id;const s=typeof e.item.category=="string"?e.item.category:e.item.category?.value;s&&(m=u("commandWithCategory","{0}: {1}",s,m));const c=typeof e.item.title!="string"?e.item.title.original:void 0,d=s&&e.item.category&&typeof e.item.category!="string"?e.item.category.original:void 0,I=c&&s?d?`${d}: ${c}`:`${s}: ${c}`:c,g=e.item.metadata?.description,p=g===void 0||K(g)?g:{value:g,original:g};t.push({commandId:e.item.id,commandWhen:e.item.precondition?.serialize(),commandAlias:I,label:_(m),commandDescription:p})}return t}};l=C([n(0,ee),n(1,Q),n(2,te),n(3,W),n(4,q),n(5,G),n(6,j),n(7,k),n(8,A),n(9,Z),n(10,oe),n(11,z),n(12,J),n(13,ce)],l);class E extends y{static ID="workbench.action.showCommands";constructor(){super({id:E.ID,title:h("showTriggerActions","Show All Commands"),keybinding:{weight:V.WorkbenchContrib,when:void 0,primary:w?void 0:S.CtrlCmd|S.Shift|v.KeyP,secondary:[v.F1]},f1:!0})}async run(a){a.get(X).quickAccess.show(l.PREFIX)}}class it extends y{constructor(){super({id:"workbench.action.clearCommandHistory",title:h("clearCommandHistory","Clear Command History"),f1:!0})}async run(a){const t=a.get(A),i=a.get($),o=a.get(k);if(P.getConfiguredCommandHistoryLength(t)>0){const{confirmed:e}=await o.confirm({type:"warning",message:u("confirmClearMessage","Do you want to clear the history of recently used commands?"),detail:u("confirmClearDetail","This action is irreversible!"),primaryButton:u({key:"clearButtonLabel",comment:["&& denotes a mnemonic"]},"&&Clear")});if(!e)return;P.clearHistory(t,i)}}}export{it as ClearCommandHistoryAction,l as CommandsQuickAccessProvider,E as ShowAllCommandsAction};
