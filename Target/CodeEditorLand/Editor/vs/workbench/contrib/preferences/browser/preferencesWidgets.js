var w=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var g=(h,l,e,t)=>{for(var i=t>1?void 0:t?L(l,e):l,o=h.length-1,s;o>=0;o--)(s=h[o])&&(i=(t?s(l,e,i):s(i))||i);return t&&i&&w(l,e,i),i},r=(h,l)=>(e,t)=>l(e,t,h);import*as n from"../../../../base/browser/dom.js";import{StandardKeyboardEvent as A}from"../../../../base/browser/keyboardEvent.js";import{ActionBar as W,ActionsOrientation as M}from"../../../../base/browser/ui/actionbar/actionbar.js";import{BaseActionViewItem as R}from"../../../../base/browser/ui/actionbar/actionViewItems.js";import{getDefaultHoverDelegate as D}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import"../../../../base/browser/ui/inputbox/inputBox.js";import{Widget as k}from"../../../../base/browser/ui/widget.js";import{Action as u}from"../../../../base/common/actions.js";import{Emitter as v}from"../../../../base/common/event.js";import{MarkdownString as H}from"../../../../base/common/htmlContent.js";import{KeyCode as _}from"../../../../base/common/keyCodes.js";import{Disposable as B}from"../../../../base/common/lifecycle.js";import{Schemas as x}from"../../../../base/common/network.js";import{isEqual as E}from"../../../../base/common/resources.js";import{ThemeIcon as y}from"../../../../base/common/themables.js";import{URI as m}from"../../../../base/common/uri.js";import{MouseTargetType as O}from"../../../../editor/browser/editorBrowser.js";import{ILanguageService as K}from"../../../../editor/common/languages/language.js";import{TrackedRangeStickiness as F}from"../../../../editor/common/model.js";import{localize as c}from"../../../../nls.js";import{ConfigurationTarget as a}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as P}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as U,IContextViewService as $}from"../../../../platform/contextview/browser/contextView.js";import{ContextScopedHistoryInputBox as N}from"../../../../platform/history/browser/contextScopedHistoryWidget.js";import{showHistoryKeybindingHint as V}from"../../../../platform/history/browser/historyWidgetKeybindingHint.js";import{IHoverService as G}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as I}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as Y}from"../../../../platform/keybinding/common/keybinding.js";import{ILabelService as j}from"../../../../platform/label/common/label.js";import{asCssVariable as b,badgeBackground as q,badgeForeground as z,contrastBorder as Z}from"../../../../platform/theme/common/colorRegistry.js";import{isWorkspaceFolder as J,IWorkspaceContextService as T,WorkbenchState as d}from"../../../../platform/workspace/common/workspace.js";import{IWorkbenchEnvironmentService as Q}from"../../../services/environment/common/environmentService.js";import{settingsEditIcon as X,settingsScopeDropDownIcon as ee}from"./preferencesIcons.js";let p=class extends R{constructor(e,t,i,o){super(null,e);this.contextService=t;this.contextMenuService=i;this.hoverService=o;const s=this.contextService.getWorkspace();this._folder=s.folders.length===1?s.folders[0]:null,this._register(this.contextService.onDidChangeWorkspaceFolders(()=>this.onWorkspaceFoldersChanged()))}_folder;_folderSettingCounts=new Map;container;anchorElement;anchorElementHover;labelElement;detailsElement;dropDownElement;get folder(){return this._folder}set folder(e){this._folder=e,this.update()}setCount(e,t){const i=this.contextService.getWorkspaceFolder(e);if(!i)throw new Error("unknown folder");const o=i.uri;this._folderSettingCounts.set(o.toString(),t),this.update()}render(e){this.element=e,this.container=e,this.labelElement=n.$(".action-title"),this.detailsElement=n.$(".action-details"),this.dropDownElement=n.$(".dropdown-icon.hide"+y.asCSSSelector(ee)),this.anchorElement=n.$("a.action-label.folder-settings",{role:"button","aria-haspopup":"true",tabindex:"0"},this.labelElement,this.detailsElement,this.dropDownElement),this.anchorElementHover=this._register(this.hoverService.setupManagedHover(D("mouse"),this.anchorElement,"")),this._register(n.addDisposableListener(this.anchorElement,n.EventType.MOUSE_DOWN,t=>n.EventHelper.stop(t))),this._register(n.addDisposableListener(this.anchorElement,n.EventType.CLICK,t=>this.onClick(t))),this._register(n.addDisposableListener(this.container,n.EventType.KEY_UP,t=>this.onKeyUp(t))),n.append(this.container,this.anchorElement),this.update()}onKeyUp(e){switch(new A(e).keyCode){case _.Enter:case _.Space:this.onClick(e);return}}onClick(e){n.EventHelper.stop(e,!0),!this.folder||this._action.checked?this.showMenu():this._action.run(this._folder)}updateEnabled(){this.update()}updateChecked(){this.update()}onWorkspaceFoldersChanged(){const e=this._folder,t=this.contextService.getWorkspace();e&&(this._folder=t.folders.filter(i=>E(i.uri,e.uri))[0]||t.folders[0]),this._folder=this._folder?this._folder:t.folders.length===1?t.folders[0]:null,this.update(),this._action.checked&&this._action.run(this._folder)}update(){let e=0;this._folderSettingCounts.forEach(i=>e+=i);const t=this.contextService.getWorkspace();if(this._folder){this.labelElement.textContent=this._folder.name,this.anchorElementHover.update(this._folder.name);const i=this.labelWithCount(this._action.label,e);this.detailsElement.textContent=i,this.dropDownElement.classList.toggle("hide",t.folders.length===1||!this._action.checked)}else{const i=this.labelWithCount(this._action.label,e);this.labelElement.textContent=i,this.detailsElement.textContent="",this.anchorElementHover.update(this._action.label),this.dropDownElement.classList.remove("hide")}this.anchorElement.classList.toggle("checked",this._action.checked),this.container.classList.toggle("disabled",!this._action.enabled)}showMenu(){this.contextMenuService.showContextMenu({getAnchor:()=>this.container,getActions:()=>this.getDropdownMenuActions(),getActionViewItem:()=>{},onHide:()=>{this.anchorElement.blur()}})}getDropdownMenuActions(){const e=[],t=this.contextService.getWorkspace().folders;return this.contextService.getWorkbenchState()===d.WORKSPACE&&t.length>0&&e.push(...t.map((i,o)=>{const s=this._folderSettingCounts.get(i.uri.toString());return{id:"folderSettingsTarget"+o,label:this.labelWithCount(i.name,s),tooltip:this.labelWithCount(i.name,s),checked:!!this.folder&&E(this.folder.uri,i.uri),enabled:!0,class:void 0,run:()=>this._action.run(i)}})),e}labelWithCount(e,t){return t&&(e+=` (${t})`),e}};p=g([r(1,T),r(2,U),r(3,G)],p);let S=class extends k{constructor(e,t,i,o,s,C,te){super();this.contextService=i;this.instantiationService=o;this.environmentService=s;this.labelService=C;this.languageService=te;this.options=t??{},this.create(e),this._register(this.contextService.onDidChangeWorkbenchState(()=>this.onWorkbenchStateChanged())),this._register(this.contextService.onDidChangeWorkspaceFolders(()=>this.update()))}settingsSwitcherBar;userLocalSettings;userRemoteSettings;workspaceSettings;folderSettingsAction;folderSettings;options;_settingsTarget=null;_onDidTargetChange=this._register(new v);onDidTargetChange=this._onDidTargetChange.event;resetLabels(){const e=this.environmentService.remoteAuthority,t=e&&this.labelService.getHostLabel(x.vscodeRemote,e);this.userLocalSettings.label=c("userSettings","User"),this.userRemoteSettings.label=c("userSettingsRemote","Remote")+(t?` [${t}]`:""),this.workspaceSettings.label=c("workspaceSettings","Workspace"),this.folderSettingsAction.label=c("folderSettings","Folder")}create(e){const t=n.append(e,n.$(".settings-tabs-widget"));this.settingsSwitcherBar=this._register(new W(t,{orientation:M.HORIZONTAL,focusOnlyEnabledItems:!0,ariaLabel:c("settingsSwitcherBarAriaLabel","Settings Switcher"),ariaRole:"tablist",actionViewItemProvider:(s,C)=>s.id==="folderSettings"?this.folderSettings:void 0})),this.userLocalSettings=new u("userSettings","",".settings-tab",!0,()=>this.updateTarget(a.USER_LOCAL)),this.userLocalSettings.tooltip=c("userSettings","User"),this.userRemoteSettings=new u("userSettingsRemote","",".settings-tab",!0,()=>this.updateTarget(a.USER_REMOTE));const i=this.environmentService.remoteAuthority,o=i&&this.labelService.getHostLabel(x.vscodeRemote,i);this.userRemoteSettings.tooltip=c("userSettingsRemote","Remote")+(o?` [${o}]`:""),this.workspaceSettings=new u("workspaceSettings","",".settings-tab",!1,()=>this.updateTarget(a.WORKSPACE)),this.folderSettingsAction=new u("folderSettings","",".settings-tab",!1,async s=>{this.updateTarget(J(s)?s.uri:a.USER_LOCAL)}),this.folderSettings=this.instantiationService.createInstance(p,this.folderSettingsAction),this.resetLabels(),this.update(),this.settingsSwitcherBar.push([this.userLocalSettings,this.userRemoteSettings,this.workspaceSettings,this.folderSettingsAction])}get settingsTarget(){return this._settingsTarget}set settingsTarget(e){this._settingsTarget=e,this.userLocalSettings.checked=a.USER_LOCAL===this.settingsTarget,this.userRemoteSettings.checked=a.USER_REMOTE===this.settingsTarget,this.workspaceSettings.checked=a.WORKSPACE===this.settingsTarget,this.settingsTarget instanceof m?(this.folderSettings.action.checked=!0,this.folderSettings.folder=this.contextService.getWorkspaceFolder(this.settingsTarget)):this.folderSettings.action.checked=!1}setResultCount(e,t){if(e===a.WORKSPACE){let i=c("workspaceSettings","Workspace");t&&(i+=` (${t})`),this.workspaceSettings.label=i}else if(e===a.USER_LOCAL){let i=c("userSettings","User");t&&(i+=` (${t})`),this.userLocalSettings.label=i}else e instanceof m&&this.folderSettings.setCount(e,t)}updateLanguageFilterIndicators(e){if(this.resetLabels(),e){const t=this.languageService.getLanguageName(e);if(t){const i=` [${t}]`;this.userLocalSettings.label+=i,this.userRemoteSettings.label+=i,this.workspaceSettings.label+=i,this.folderSettingsAction.label+=i}}}onWorkbenchStateChanged(){this.folderSettings.folder=null,this.update(),this.settingsTarget===a.WORKSPACE&&this.contextService.getWorkbenchState()===d.WORKSPACE&&this.updateTarget(a.USER_LOCAL)}updateTarget(e){return this.settingsTarget===e||e instanceof m&&this.settingsTarget instanceof m&&E(this.settingsTarget,e)||(this.settingsTarget=e,this._onDidTargetChange.fire(this.settingsTarget)),Promise.resolve(void 0)}async update(){this.settingsSwitcherBar.domNode.classList.toggle("empty-workbench",this.contextService.getWorkbenchState()===d.EMPTY),this.userRemoteSettings.enabled=!!(this.options.enableRemoteSettings&&this.environmentService.remoteAuthority),this.workspaceSettings.enabled=this.contextService.getWorkbenchState()!==d.EMPTY,this.folderSettings.action.enabled=this.contextService.getWorkbenchState()===d.WORKSPACE&&this.contextService.getWorkspace().folders.length>0,this.workspaceSettings.tooltip=c("workspaceSettings","Workspace")}};S=g([r(2,T),r(3,I),r(4,Q),r(5,j),r(6,K)],S);let f=class extends k{constructor(e,t,i,o,s,C){super();this.options=t;this.contextViewService=i;this.instantiationService=o;this.contextKeyService=s;this.keybindingService=C;this.create(e)}domNode;countElement;searchContainer;inputBox;controlsDiv;_onDidChange=this._register(new v);onDidChange=this._onDidChange.event;_onFocus=this._register(new v);onFocus=this._onFocus.event;create(e){this.domNode=n.append(e,n.$("div.settings-header-widget")),this.createSearchContainer(n.append(this.domNode,n.$("div.settings-search-container"))),this.controlsDiv=n.append(this.domNode,n.$("div.settings-search-controls")),this.options.showResultCount&&(this.countElement=n.append(this.controlsDiv,n.$(".settings-count-widget")),this.countElement.style.backgroundColor=b(q),this.countElement.style.color=b(z),this.countElement.style.border=`1px solid ${b(Z)}`),this.inputBox.inputElement.setAttribute("aria-live",this.options.ariaLive||"off"),this.options.ariaLabelledBy&&this.inputBox.inputElement.setAttribute("aria-labelledBy",this.options.ariaLabelledBy);const t=this._register(n.trackFocus(this.inputBox.inputElement));this._register(t.onDidFocus(()=>this._onFocus.fire()));const i=this.options.focusKey;i&&(this._register(t.onDidFocus(()=>i.set(!0))),this._register(t.onDidBlur(()=>i.set(!1))))}createSearchContainer(e){this.searchContainer=e;const t=n.append(this.searchContainer,n.$("div.settings-search-input"));this.inputBox=this._register(this.createInputBox(t)),this._register(this.inputBox.onDidChange(i=>this._onDidChange.fire(i)))}createInputBox(e){const t=()=>V(this.keybindingService);return new N(e,this.contextViewService,{...this.options,showHistoryHint:t},this.contextKeyService)}showMessage(e){this.countElement&&e!==this.countElement.textContent&&(this.countElement.textContent=e,this.inputBox.inputElement.setAttribute("aria-label",e),this.inputBox.inputElement.style.paddingRight=this.getControlsWidth()+"px")}layout(e){e.width<400?(this.countElement?.classList.add("hide"),this.inputBox.inputElement.style.paddingRight="0px"):(this.countElement?.classList.remove("hide"),this.inputBox.inputElement.style.paddingRight=this.getControlsWidth()+"px")}getControlsWidth(){return(this.countElement?n.getTotalWidth(this.countElement):0)+20}focus(){this.inputBox.focus(),this.getValue()&&this.inputBox.select()}hasFocus(){return this.inputBox.hasFocus()}clear(){this.inputBox.value=""}getValue(){return this.inputBox.value}setValue(e){return this.inputBox.value=e}dispose(){this.options.focusKey?.set(!1),super.dispose()}};f=g([r(2,$),r(3,I),r(4,P),r(5,Y)],f);class Ge extends B{constructor(e){super();this.editor=e;this._register(this.editor.onMouseDown(t=>{t.target.type!==O.GUTTER_GLYPH_MARGIN||t.target.detail.isAfterLines||!this.isVisible()||this._onClick.fire(t)}))}_line=-1;_preferences=[];_editPreferenceDecoration=this.editor.createDecorationsCollection();_onClick=this._register(new v);onClick=this._onClick.event;get preferences(){return this._preferences}getLine(){return this._line}show(e,t,i){this._preferences=i;const o=[];this._line=e,o.push({options:{description:"edit-preference-widget-decoration",glyphMarginClassName:y.asClassName(X),glyphMarginHoverMessage:new H().appendText(t),stickiness:F.NeverGrowsWhenTypingAtEdges},range:{startLineNumber:e,startColumn:1,endLineNumber:e,endColumn:1}}),this._editPreferenceDecoration.set(o)}hide(){this._editPreferenceDecoration.clear()}isVisible(){return this._editPreferenceDecoration.length>0}dispose(){this.hide(),super.dispose()}}export{Ge as EditPreferenceWidget,p as FolderSettingsActionViewItem,f as SearchWidget,S as SettingsTargetsWidget};
