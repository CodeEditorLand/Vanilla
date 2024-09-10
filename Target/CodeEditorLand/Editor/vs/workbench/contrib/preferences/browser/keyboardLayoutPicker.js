var P=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var S=(o,i,s,a)=>{for(var t=a>1?void 0:a?w(i,s):i,l=o.length-1,n;l>=0;l--)(n=o[l])&&(t=(a?n(i,s,t):n(t))||t);return a&&t&&P(i,s,t),t},I=(o,i)=>(s,a)=>i(s,a,o);import*as r from"../../../../nls.js";import{StatusbarAlignment as h,IStatusbarService as C}from"../../../services/statusbar/browser/statusbar.js";import{Disposable as D,MutableDisposable as A}from"../../../../base/common/lifecycle.js";import{parseKeyboardLayoutDescription as k,areKeyboardLayoutsEqual as E,getKeyboardLayoutId as z,IKeyboardLayoutService as K}from"../../../../platform/keyboardLayout/common/keyboardLayout.js";import{WorkbenchPhase as Q,registerWorkbenchContribution2 as x}from"../../../common/contributions.js";import{KEYBOARD_LAYOUT_OPEN_PICKER as f}from"../common/preferences.js";import{isMacintosh as U,isWindows as O}from"../../../../base/common/platform.js";import{IQuickInputService as T}from"../../../../platform/quickinput/common/quickInput.js";import{Action2 as V,registerAction2 as W}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as _}from"../../../../platform/configuration/common/configuration.js";import{IEnvironmentService as M}from"../../../../platform/environment/common/environment.js";import{IFileService as R}from"../../../../platform/files/common/files.js";import{IEditorService as N}from"../../../services/editor/common/editorService.js";import{VSBuffer as j}from"../../../../base/common/buffer.js";let d=class extends D{constructor(s,a){super();this.keyboardLayoutService=s;this.statusbarService=a;const t=r.localize("status.workbench.keyboardLayout","Keyboard Layout"),l=this.keyboardLayoutService.getCurrentKeyboardLayout();if(l){const n=k(l),y=r.localize("keyboardLayout","Layout: {0}",n.label);this.pickerElement.value=this.statusbarService.addEntry({name:t,text:y,ariaLabel:y,command:f},"status.workbench.keyboardLayout",h.RIGHT)}this._register(this.keyboardLayoutService.onDidChangeKeyboardLayout(()=>{const n=this.keyboardLayoutService.getCurrentKeyboardLayout(),y=k(n);if(this.pickerElement.value){const c=r.localize("keyboardLayout","Layout: {0}",y.label);this.pickerElement.value.update({name:t,text:c,ariaLabel:c,command:f})}else{const c=r.localize("keyboardLayout","Layout: {0}",y.label);this.pickerElement.value=this.statusbarService.addEntry({name:t,text:c,ariaLabel:c,command:f},"status.workbench.keyboardLayout",h.RIGHT)}}))}static ID="workbench.contrib.keyboardLayoutPicker";pickerElement=this._register(new A)};d=S([I(0,K),I(1,C)],d),x(d.ID,d,Q.BlockStartup);const B=[`// ${r.localize("displayLanguage","Defines the keyboard layout used in VS Code in the browser environment.")}`,`// ${r.localize("doc",'Open VS Code and run "Developer: Inspect Key Mappings (JSON)" from Command Palette.')}`,"","// Once you have the keyboard layout info, please paste it below.",`
`].join(`
`);W(class extends V{constructor(){super({id:f,title:r.localize2("keyboard.chooseLayout","Change Keyboard Layout"),f1:!0})}async run(o){const i=o.get(K),s=o.get(T),a=o.get(_),t=o.get(M),l=o.get(N),n=o.get(R),y=i.getAllKeyboardLayouts(),c=i.getCurrentKeyboardLayout(),m=a.getValue("keyboard.layout")==="autodetect",b=y.map(e=>{const u=!m&&E(c,e),v=k(e);return{layout:e,label:[v.label,e&&e.isUserKeyboardLayout?"(User configured layout)":""].join(" "),id:e.text||e.lang||e.layout,description:v.description+(u?" (Current layout)":""),picked:!m&&E(c,e)}}).sort((e,u)=>e.label<u.label?-1:e.label>u.label?1:0);if(b.length>0){const e=U?"Mac":O?"Win":"Linux";b.unshift({type:"separator",label:r.localize("layoutPicks","Keyboard Layouts ({0})",e)})}const L={label:r.localize("configureKeyboardLayout","Configure Keyboard Layout")};b.unshift(L);const g={label:r.localize("autoDetect","Auto Detect"),description:m?`Current: ${k(c).label}`:void 0,picked:m?!0:void 0};b.unshift(g);const p=await s.pick(b,{placeHolder:r.localize("pickKeyboardLayout","Select Keyboard Layout"),matchOnDescription:!0});if(p){if(p===g){a.updateValue("keyboard.layout","autodetect");return}if(p===L){const e=t.keyboardLayoutResource;return await n.stat(e).then(void 0,()=>n.createFile(e,j.fromString(B))).then(u=>{if(u)return l.openEditor({resource:u.resource,languageId:"jsonc",options:{pinned:!0}})},u=>{throw new Error(r.localize("fail.createSettings","Unable to create '{0}' ({1}).",e.toString(),u))}),Promise.resolve()}a.updateValue("keyboard.layout",z(p.layout))}}});export{d as KeyboardLayoutPickerContribution};
