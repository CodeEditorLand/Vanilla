import{Codicon as C}from"../../../base/common/codicons.js";import{KeyCode as r,KeyMod as i}from"../../../base/common/keyCodes.js";import{localize as S,localize2 as k}from"../../../nls.js";import{Action2 as l,MenuId as w,registerAction2 as p}from"../../../platform/actions/common/actions.js";import{CommandsRegistry as f}from"../../../platform/commands/common/commands.js";import{IKeybindingService as I}from"../../../platform/keybinding/common/keybinding.js";import{KeybindingWeight as c,KeybindingsRegistry as a}from"../../../platform/keybinding/common/keybindingsRegistry.js";import{IQuickInputService as o,ItemActivation as N}from"../../../platform/quickinput/common/quickInput.js";import{defaultQuickAccessContext as v,getQuickNavigateHandler as b,inQuickPickContext as u}from"../quickaccess.js";const s={primary:i.CtrlCmd|r.KeyP,secondary:[i.CtrlCmd|r.KeyE],mac:{primary:i.CtrlCmd|r.KeyP,secondary:void 0}};a.registerCommandAndKeybindingRule({id:"workbench.action.closeQuickOpen",weight:c.WorkbenchContrib,when:u,primary:r.Escape,secondary:[i.Shift|r.Escape],handler:e=>e.get(o).cancel()}),a.registerCommandAndKeybindingRule({id:"workbench.action.acceptSelectedQuickOpenItem",weight:c.WorkbenchContrib,when:u,primary:0,handler:e=>e.get(o).accept()}),a.registerCommandAndKeybindingRule({id:"workbench.action.alternativeAcceptSelectedQuickOpenItem",weight:c.WorkbenchContrib,when:u,primary:0,handler:e=>e.get(o).accept({ctrlCmd:!0,alt:!1})}),a.registerCommandAndKeybindingRule({id:"workbench.action.focusQuickOpen",weight:c.WorkbenchContrib,when:u,primary:0,handler:e=>{e.get(o).focus()}});const A="workbench.action.quickOpenNavigateNextInFilePicker";a.registerCommandAndKeybindingRule({id:A,weight:c.WorkbenchContrib+50,handler:b(A,!0),when:v,primary:s.primary,secondary:s.secondary,mac:s.mac});const q="workbench.action.quickOpenNavigatePreviousInFilePicker";a.registerCommandAndKeybindingRule({id:q,weight:c.WorkbenchContrib+50,handler:b(q,!1),when:v,primary:s.primary|i.Shift,secondary:[s.secondary[0]|i.Shift],mac:{primary:s.mac.primary|i.Shift,secondary:void 0}}),a.registerCommandAndKeybindingRule({id:"workbench.action.quickPickManyToggle",weight:c.WorkbenchContrib,when:u,primary:0,handler:e=>{e.get(o).toggle()}}),a.registerCommandAndKeybindingRule({id:"workbench.action.quickInputBack",weight:c.WorkbenchContrib+50,when:u,primary:0,win:{primary:i.Alt|r.LeftArrow},mac:{primary:i.WinCtrl|r.Minus},linux:{primary:i.CtrlCmd|i.Alt|r.Minus},handler:e=>{e.get(o).back()}}),p(class extends l{constructor(){super({id:"workbench.action.quickOpen",title:k("quickOpen","Go to File..."),metadata:{description:"Quick access",args:[{name:"prefix",schema:{type:"string"}}]},keybinding:{weight:c.WorkbenchContrib,primary:s.primary,secondary:s.secondary,mac:s.mac},f1:!0})}run(n,t){n.get(o).quickAccess.show(typeof t=="string"?t:void 0,{preserveValue:typeof t=="string"})}}),p(class extends l{constructor(){super({id:"workbench.action.quickOpenWithModes",title:S("quickOpenWithModes","Quick Open"),icon:C.search,menu:{id:w.CommandCenterCenter,order:100}})}run(n){const t=n.get(o),d={includeHelp:!0,from:"commandCenter"};t.quickAccess.show(void 0,{preserveValue:!0,providerOptions:d})}}),f.registerCommand("workbench.action.quickOpenPreviousEditor",async e=>{e.get(o).quickAccess.show("",{itemActivation:N.SECOND})});class m extends l{constructor(t,d,y,h,g){super({id:t,title:d,f1:!0,keybinding:g});this.id=t;this.next=y;this.quickNavigate=h}async run(t){const d=t.get(I),y=t.get(o),h=d.lookupKeybindings(this.id),g=this.quickNavigate?{keybindings:h}:void 0;y.navigate(this.next,g)}}class O extends m{constructor(){super("workbench.action.quickOpenNavigateNext",k("quickNavigateNext","Navigate Next in Quick Open"),!0,!0)}}class Q extends m{constructor(){super("workbench.action.quickOpenNavigatePrevious",k("quickNavigatePrevious","Navigate Previous in Quick Open"),!1,!0)}}class P extends m{constructor(){super("workbench.action.quickOpenSelectNext",k("quickSelectNext","Select Next in Quick Open"),!0,!1,{weight:c.WorkbenchContrib+50,when:u,primary:0,mac:{primary:i.WinCtrl|r.KeyN}})}}class K extends m{constructor(){super("workbench.action.quickOpenSelectPrevious",k("quickSelectPrevious","Select Previous in Quick Open"),!1,!1,{weight:c.WorkbenchContrib+50,when:u,primary:0,mac:{primary:i.WinCtrl|r.KeyP}})}}p(P),p(K),p(O),p(Q);
