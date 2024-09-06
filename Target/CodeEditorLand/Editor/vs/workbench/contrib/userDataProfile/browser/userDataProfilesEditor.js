var De=Object.defineProperty;var xe=Object.getOwnPropertyDescriptor;var b=(T,n,t,e)=>{for(var i=e>1?void 0:e?xe(n,t):n,r=T.length-1,o;r>=0;r--)(o=T[r])&&(i=(e?o(n,t,i):o(i))||i);return e&&i&&De(n,t,i),i},I=(T,n)=>(t,e)=>n(t,e,T);import"vs/css!./media/userDataProfilesEditor";import{$ as c,addDisposableListener as U,append as a,clearNode as Le,Dimension as ce,EventHelper as ie,EventType as H,trackFocus as Ae}from"../../../../../vs/base/browser/dom.js";import{StandardKeyboardEvent as de}from"../../../../../vs/base/browser/keyboardEvent.js";import{renderMarkdown as ke}from"../../../../../vs/base/browser/markdownRenderer.js";import{Button as fe,ButtonWithDropdown as Fe}from"../../../../../vs/base/browser/ui/button/button.js";import"../../../../../vs/base/browser/ui/hover/hover.js";import"../../../../../vs/base/browser/ui/hover/hoverDelegate.js";import{createInstantHoverDelegate as Y}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import{HoverPosition as Ne}from"../../../../../vs/base/browser/ui/hover/hoverWidget.js";import{InputBox as Me,MessageType as pe}from"../../../../../vs/base/browser/ui/inputbox/inputBox.js";import{CachedListVirtualDelegate as Ue}from"../../../../../vs/base/browser/ui/list/list.js";import{Radio as me}from"../../../../../vs/base/browser/ui/radio/radio.js";import{SelectBox as He}from"../../../../../vs/base/browser/ui/selectBox/selectBox.js";import{Orientation as Re,Sizing as Be,SplitView as _e}from"../../../../../vs/base/browser/ui/splitview/splitview.js";import{Checkbox as Z}from"../../../../../vs/base/browser/ui/toggle/toggle.js";import{RenderIndentGuides as ue}from"../../../../../vs/base/browser/ui/tree/abstractTree.js";import"../../../../../vs/base/browser/ui/tree/tree.js";import{Action as j,Separator as he,SubmenuAction as Ie}from"../../../../../vs/base/common/actions.js";import"../../../../../vs/base/common/cancellation.js";import{Codicon as ge}from"../../../../../vs/base/common/codicons.js";import{Emitter as ye,Event as Te}from"../../../../../vs/base/common/event.js";import{MarkdownString as Oe}from"../../../../../vs/base/common/htmlContent.js";import{KeyCode as oe}from"../../../../../vs/base/common/keyCodes.js";import{Disposable as Pe,DisposableStore as y,MutableDisposable as We,toDisposable as Ve}from"../../../../../vs/base/common/lifecycle.js";import{basename as be}from"../../../../../vs/base/common/resources.js";import{ThemeIcon as S}from"../../../../../vs/base/common/themables.js";import{isString as re,isUndefined as J}from"../../../../../vs/base/common/types.js";import{URI as R}from"../../../../../vs/base/common/uri.js";import{localize as d}from"../../../../../vs/nls.js";import{WorkbenchToolBar as X}from"../../../../../vs/platform/actions/browser/toolbar.js";import{IContextMenuService as ze,IContextViewService as ve}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IFileDialogService as $e}from"../../../../../vs/platform/dialogs/common/dialogs.js";import"../../../../../vs/platform/editor/common/editor.js";import{IHoverService as qe,WorkbenchHoverDelegate as Ge}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as E}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{WorkbenchAsyncDataTree as Se,WorkbenchList as Ke}from"../../../../../vs/platform/list/browser/listService.js";import{IEditorProgressService as Ee}from"../../../../../vs/platform/progress/common/progress.js";import{IQuickInputService as Qe}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{IStorageService as Ye}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as Ze}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{defaultButtonStyles as ne,defaultCheckboxStyles as se,defaultInputBoxStyles as je,defaultSelectBoxStyles as Je,getInputBoxStyle as Xe,getListStyles as et}from"../../../../../vs/platform/theme/browser/defaultStyles.js";import{editorBackground as C,foreground as B,registerColor as tt}from"../../../../../vs/platform/theme/common/colorRegistry.js";import{IThemeService as it}from"../../../../../vs/platform/theme/common/themeService.js";import{IUriIdentityService as ot}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as ee,ProfileResourceType as k}from"../../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{DEFAULT_LABELS_CONTAINER as rt,ResourceLabels as nt}from"../../../../../vs/workbench/browser/labels.js";import{EditorPane as st}from"../../../../../vs/workbench/browser/parts/editor/editorPane.js";import"../../../../../vs/workbench/common/editor.js";import{EditorInput as lt}from"../../../../../vs/workbench/common/editor/editorInput.js";import{PANEL_BORDER as at}from"../../../../../vs/workbench/common/theme.js";import{settingsTextInputBorder as ct}from"../../../../../vs/workbench/contrib/preferences/common/settingsEditorColorRegistry.js";import{AbstractUserDataProfileElement as F,isProfileResourceChildElement as dt,isProfileResourceTypeElement as Ce,NewProfileElement as v,UserDataProfileElement as P,UserDataProfilesEditorModel as ft}from"../../../../../vs/workbench/contrib/userDataProfile/browser/userDataProfilesEditorModel.js";import"../../../../../vs/workbench/contrib/userDataProfile/common/userDataProfile.js";import"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{WorkbenchIconSelectBox as pt}from"../../../../../vs/workbench/services/userDataProfile/browser/iconSelectBox.js";import{defaultUserDataProfileIcon as mt,IUserDataProfileService as ut,PROFILE_FILTER as ht}from"../../../../../vs/workbench/services/userDataProfile/common/userDataProfile.js";import{DEFAULT_ICON as le,ICONS as It}from"../../../../../vs/workbench/services/userDataProfile/common/userDataProfileIcons.js";const gt=tt("profiles.sashBorder",at,d("profilesSashBorder","The color of the Profiles editor splitview sash border.")),we=et({listActiveSelectionBackground:C,listActiveSelectionForeground:B,listFocusAndSelectionBackground:C,listFocusAndSelectionForeground:B,listFocusBackground:C,listFocusForeground:B,listHoverForeground:B,listHoverBackground:C,listHoverOutline:C,listFocusOutline:C,listInactiveSelectionBackground:C,listInactiveSelectionForeground:B,listInactiveFocusBackground:C,listInactiveFocusOutline:C,treeIndentGuidesStroke:void 0,treeInactiveIndentGuidesStroke:void 0});let M=class extends st{constructor(t,e,i,r,o,s,f,p){super(M.ID,t,e,i,r);this.quickInputService=o;this.fileDialogService=s;this.contextMenuService=f;this.instantiationService=p}static ID="workbench.editor.userDataProfiles";container;splitView;profilesList;profileWidget;model;layout(t,e){if(this.container&&this.splitView){const i=t.height-20;this.splitView.layout(this.container?.clientWidth,i),this.splitView.el.style.height=`${i}px`}}createEditor(t){this.container=a(t,c(".profiles-editor"));const e=a(this.container,c(".sidebar-view")),i=a(e,c(".sidebar-container")),r=a(this.container,c(".contents-view")),o=a(r,c(".contents-container"));this.profileWidget=this._register(this.instantiationService.createInstance(O,o)),this.splitView=new _e(this.container,{orientation:Re.HORIZONTAL,proportionalLayout:!0}),this.renderSidebar(i),this.splitView.addView({onDidChange:Te.None,element:e,minimumSize:200,maximumSize:350,layout:(s,f,p)=>{if(e.style.width=`${s}px`,p&&this.profilesList){const l=p-40-15;this.profilesList.getHTMLElement().style.height=`${l}px`,this.profilesList.layout(l,s)}}},300,void 0,!0),this.splitView.addView({onDidChange:Te.None,element:r,minimumSize:550,maximumSize:Number.POSITIVE_INFINITY,layout:(s,f,p)=>{r.style.width=`${s}px`,p&&this.profileWidget?.layout(new ce(s,p))}},Be.Distribute,void 0,!0),this.registerListeners(),this.updateStyles()}updateStyles(){const t=this.theme.getColor(gt);this.splitView?.style({separatorBorder:t})}renderSidebar(t){this.renderNewProfileButton(a(t,c(".new-profile-button")));const e=this.instantiationService.createInstance(_),i=new yt;this.profilesList=this._register(this.instantiationService.createInstance(Ke,"ProfilesList",a(t,c(".profiles-list")),i,[e],{multipleSelectionSupport:!1,setRowLineHeight:!1,horizontalScrolling:!1,accessibilityProvider:{getAriaLabel(r){return r?.name??""},getWidgetAriaLabel(){return d("profiles","Profiles")}},openOnSingleClick:!0,identityProvider:{getId(r){return r instanceof P?r.profile.id:r.name}},alwaysConsumeMouseWheel:!1}))}renderNewProfileButton(t){const e=this._register(new Fe(t,{actions:{getActions:()=>{const i=[];return this.model?.templates.length&&(i.push(new Ie("from.template",d("from template","From Template"),this.getCreateFromTemplateActions())),i.push(new he)),i.push(new j("importProfile",d("importProfile","Import Profile..."),void 0,!0,()=>this.importProfile())),i}},addPrimaryActionToDropdown:!1,contextMenuProvider:this.contextMenuService,supportIcons:!0,...ne}));e.label=d("newProfile","New Profile"),this._register(e.onDidClick(i=>this.createNewProfile()))}getCreateFromTemplateActions(){return this.model?this.model.templates.map(t=>new j(`template:${t.url}`,t.name,void 0,!0,()=>this.createNewProfile(R.parse(t.url)))):[]}registerListeners(){this.profilesList&&(this._register(this.profilesList.onDidChangeSelection(t=>{const[e]=t.elements;e instanceof F&&this.profileWidget?.render(e)})),this._register(this.profilesList.onContextMenu(t=>{const e=[];t.element||e.push(...this.getTreeContextMenuActions()),t.element instanceof F&&e.push(...t.element.actions[1]),e.length&&this.contextMenuService.showContextMenu({getAnchor:()=>t.anchor,getActions:()=>e,getActionsContext:()=>t.element})})),this._register(this.profilesList.onMouseDblClick(t=>{t.element||this.createNewProfile()})))}getTreeContextMenuActions(){const t=[];t.push(new j("newProfile",d("newProfile","New Profile"),void 0,!0,()=>this.createNewProfile()));const e=this.getCreateFromTemplateActions();return e.length&&t.push(new Ie("from.template",d("new from template","New Profile From Template"),e)),t.push(new he),t.push(new j("importProfile",d("importProfile","Import Profile..."),void 0,!0,()=>this.importProfile())),t}async importProfile(){const t=new y,e=t.add(this.quickInputService.createQuickPick()),i=r=>{const o=[];r&&o.push({label:e.value,description:d("import from url","Import from URL")}),o.push({label:d("import from file","Select File...")}),e.items=o};e.title=d("import profile quick pick title","Import from Profile Template..."),e.placeholder=d("import profile placeholder","Provide Profile Template URL"),e.ignoreFocusOut=!0,t.add(e.onDidChangeValue(i)),i(),e.matchOnLabel=!1,e.matchOnDescription=!1,t.add(e.onDidAccept(async()=>{e.hide();const r=e.selectedItems[0];if(!r)return;const o=r.label===e.value?R.parse(e.value):await this.getProfileUriFromFileSystem();o&&this.createNewProfile(o)})),t.add(e.onDidHide(()=>t.dispose())),e.show()}async createNewProfile(t){await this.model?.createNewProfile(t)}selectProfile(t){const e=this.model?.profiles.findIndex(i=>i instanceof P&&i.profile.id===t.id);e!==void 0&&e>=0&&this.profilesList?.setSelection([e])}async getProfileUriFromFileSystem(){const t=await this.fileDialogService.showOpenDialog({canSelectFolders:!1,canSelectFiles:!0,canSelectMany:!1,filters:ht,title:d("import profile dialog","Select Profile Template File")});return t?t[0]:null}async setInput(t,e,i,r){await super.setInput(t,e,i,r),this.model=await t.resolve(),this.profileWidget&&(this.profileWidget.templates=this.model.templates),this.updateProfilesList(),this._register(this.model.onDidChange(o=>this.updateProfilesList(o)))}focus(){super.focus(),this.profilesList?.domFocus()}updateProfilesList(t){if(!this.model)return;const e=this.profilesList?.getSelection()?.[0],i=e!==void 0?this.profilesList?.element(e):void 0;if(this.profilesList?.splice(0,this.profilesList.length,this.model.profiles),t)this.profilesList?.setSelection([this.model.profiles.indexOf(t)]);else if(i){if(!this.model.profiles.includes(i)){const r=this.model.profiles.find(o=>o.name===i.name)??this.model.profiles[0];r&&this.profilesList?.setSelection([this.model.profiles.indexOf(r)])}}else{const r=this.model.profiles.find(o=>o.active)??this.model.profiles[0];r&&this.profilesList?.setSelection([this.model.profiles.indexOf(r)])}}};M=b([I(1,Ze),I(2,it),I(3,Ye),I(4,Qe),I(5,$e),I(6,ze),I(7,E)],M);class yt{getHeight(n){return 22}getTemplateId(){return"profileListElement"}}let _=class{constructor(n){this.instantiationService=n}templateId="profileListElement";renderTemplate(n){const t=new y,e=new y;n.classList.add("profile-list-item");const i=a(n,c(".profile-list-item-icon")),r=a(n,c(".profile-list-item-label")),o=a(n,c(`span${S.asCSSSelector(ge.circleFilled)}`)),s=a(n,c(".profile-list-item-description"));a(s,c(`span${S.asCSSSelector(ge.check)}`),c("span",void 0,d("activeProfile","In use")));const f=a(n,c(".profile-tree-item-actions-container")),p=t.add(this.instantiationService.createInstance(X,f,{hoverDelegate:t.add(Y()),highlightToggledItems:!0}));return{label:r,icon:i,dirty:o,description:s,actionBar:p,disposables:t,elementDisposables:e}}renderElement(n,t,e,i){e.elementDisposables.clear(),e.label.textContent=n.name,e.label.classList.toggle("new-profile",n instanceof v),e.icon.className=S.asClassName(n.icon?S.fromId(n.icon):le),e.dirty.classList.toggle("hide",!(n instanceof v)),e.description.classList.toggle("hide",!n.active),n.onDidChange&&e.elementDisposables.add(n.onDidChange(r=>{r.name&&(e.label.textContent=n.name),r.icon&&(n.icon?e.icon.className=S.asClassName(S.fromId(n.icon)):e.icon.className="hide"),r.active&&e.description.classList.toggle("hide",!n.active)})),e.actionBar.setActions([...n.actions[0]],[...n.actions[1]])}disposeElement(n,t,e,i){e.elementDisposables.clear()}disposeTemplate(n){n.disposables.dispose(),n.elementDisposables.dispose()}};_=b([I(0,E)],_);let O=class extends Pe{constructor(t,e,i){super();this.editorProgressService=e;this.instantiationService=i;const r=a(t,c(".profile-header")),o=a(r,c(".profile-title-container"));this.profileTitle=a(o,c(""));const s=a(t,c(".profile-body")),f=new Tt,p=this._register(this.instantiationService.createInstance(G));this.copyFromProfileRenderer=this._register(this.instantiationService.createInstance(q)),this.profileTreeContainer=a(s,c(".profile-tree")),this.profileTree=this._register(this.instantiationService.createInstance(Se,"ProfileEditor-Tree",this.profileTreeContainer,f,[this._register(this.instantiationService.createInstance(V)),this._register(this.instantiationService.createInstance(z)),this._register(this.instantiationService.createInstance($)),this._register(this.instantiationService.createInstance(vt)),this.copyFromProfileRenderer,p],this.instantiationService.createInstance(Pt),{multipleSelectionSupport:!1,horizontalScrolling:!1,accessibilityProvider:{getAriaLabel(l){return l?.element??""},getWidgetAriaLabel(){return""}},identityProvider:{getId(l){return l.element}},expandOnlyOnTwistieClick:!0,renderIndentGuides:ue.None,enableStickyScroll:!1,openOnSingleClick:!1,setRowLineHeight:!1,supportDynamicHeights:!0,alwaysConsumeMouseWheel:!1})),this.profileTree.style(we),this._register(p.onDidChangeContentHeight(l=>this.profileTree.updateElementHeight(l,void 0))),this._register(p.onDidChangeSelection(l=>{l.selected&&(this.profileTree.setFocus([]),this.profileTree.setSelection([]))})),this._register(this.profileTree.onDidChangeContentHeight(l=>{this.dimension&&this.layout(this.dimension)})),this._register(this.profileTree.onDidChangeSelection(l=>{l.elements.length&&p.clearSelection()})),this.buttonContainer=a(s,c(".profile-row-container.profile-button-container"))}profileTitle;profileTreeContainer;buttonContainer;profileTree;copyFromProfileRenderer;_profileElement=this._register(new We);set templates(t){this.copyFromProfileRenderer.setTemplates(t),this.profileTree.rerender()}dimension;layout(t){this.dimension=t;const e=this.profileTree.contentHeight,i=Math.min(e,t.height-(this._profileElement.value?.element instanceof v?116:54));this.profileTreeContainer.style.height=`${i}px`,this.profileTree.layout(i,t.width)}render(t){this.profileTree.setInput(t);const e=new y;this._profileElement.value={element:t,dispose:()=>e.dispose()},this.profileTitle.textContent=t.name,e.add(t.onDidChange(o=>{o.name&&(this.profileTitle.textContent=t.name)}));const[i,r]=t.titleButtons;if(i?.length||r?.length){if(this.buttonContainer.classList.remove("hide"),r?.length)for(const o of r){const s=e.add(new fe(this.buttonContainer,{...ne,secondary:!0}));s.label=o.label,s.enabled=o.enabled,e.add(s.onDidClick(()=>this.editorProgressService.showWhile(o.run()))),e.add(o.onDidChange(f=>{J(f.enabled)||(s.enabled=o.enabled),J(f.label)||(s.label=o.label)}))}if(i?.length)for(const o of i){const s=e.add(new fe(this.buttonContainer,{...ne}));s.label=o.label,s.enabled=o.enabled,e.add(s.onDidClick(()=>this.editorProgressService.showWhile(o.run()))),e.add(o.onDidChange(f=>{J(f.enabled)||(s.enabled=o.enabled),J(f.label)||(s.label=o.label)})),e.add(t.onDidChange(f=>{f.message&&(s.setTitle(t.message??o.label),s.element.classList.toggle("error",!!t.message))}))}}else this.buttonContainer.classList.add("hide");t instanceof v&&this.profileTree.focusFirst(),this.dimension&&this.layout(this.dimension)}};O=b([I(1,Ee),I(2,E)],O);class Tt extends Ue{getTemplateId({element:n}){return n}hasDynamicHeight({element:n}){return n==="contents"}estimateHeight({element:n}){switch(n){case"name":return 72;case"icon":return 68;case"copyFrom":return 90;case"useForCurrent":case"useAsDefault":return 68;case"contents":return 250}}}class Pt{hasChildren(n){return n instanceof F}async getChildren(n){if(n instanceof F){const t=[];return n instanceof v?(t.push({element:"name",root:n}),t.push({element:"icon",root:n}),t.push({element:"copyFrom",root:n}),t.push({element:"contents",root:n})):n instanceof P&&(n.profile.isDefault||(t.push({element:"name",root:n}),t.push({element:"icon",root:n})),t.push({element:"useForCurrent",root:n}),t.push({element:"useAsDefault",root:n}),t.push({element:"contents",root:n})),t}return[]}}class bt{getTemplateId(n){return n.element.resourceType?n.root instanceof v?D.TEMPLATE_ID:w.TEMPLATE_ID:x.TEMPLATE_ID}getHeight(n){return 24}}let W=class{constructor(n){this.editorProgressService=n}hasChildren(n){if(n instanceof F)return!0;if(n.element.resourceType){if(n.element.resourceType!==k.Extensions&&n.element.resourceType!==k.Snippets)return!1;if(n.root instanceof v){const t=n.element.resourceType;if(n.root.getFlag(t))return!0;if(!n.root.hasResource(t)||n.root.copyFrom===void 0||!n.root.getCopyFlag(t))return!1}return!0}return!1}async getChildren(n){if(n instanceof F)return(await n.getChildren()).map(e=>({element:e,root:n}));if(n.element.resourceType){const t=this.editorProgressService.show(!0,500);try{return(await n.root.getChildren(n.element.resourceType)).map(i=>({element:i,root:n.root}))}finally{t.done()}}return[]}};W=b([I(0,Ee)],W);class te extends Pe{getResourceTypeTitle(n){switch(n){case k.Settings:return d("settings","Settings");case k.Keybindings:return d("keybindings","Keyboard Shortcuts");case k.Snippets:return d("snippets","Snippets");case k.Tasks:return d("tasks","Tasks");case k.Extensions:return d("extensions","Extensions")}return""}disposeElement(n,t,e,i){e.elementDisposables.clear()}disposeTemplate(n){n.disposables.dispose()}}class N extends te{renderElement({element:n},t,e,i){e.elementDisposables.clear(),e.element=n}}let V=class extends N{constructor(t,e){super();this.userDataProfilesService=t;this.contextViewService=e}templateId="name";renderTemplate(t){const e=new y,i=e.add(new y);let r;const o=a(t,c(".profile-row-container"));a(o,c(".profile-label-element",void 0,d("name","Name")));const s=e.add(new Me(o,this.contextViewService,{inputBoxStyles:Xe({inputBorder:ct}),ariaLabel:d("profileName","Profile Name"),placeholder:d("profileName","Profile Name"),validationOptions:{validation:l=>{if(!l)return{content:d("name required","Profile name is required and must be a non-empty value."),type:pe.WARNING};if(r?.root.disabled||!r?.root.shouldValidateName())return null;const u=r?.root.getInitialName();return l=l.trim(),u!==l&&this.userDataProfilesService.profiles.some(g=>!g.isTransient&&g.name===l)?{content:d("profileExists","Profile with name {0} already exists.",l),type:pe.WARNING}:null}}}));e.add(this.userDataProfilesService.onDidChangeProfiles(()=>s.validate())),s.onDidChange(l=>{r&&l&&(r.root.name=l)});const f=e.add(Ae(s.inputElement));e.add(f.onDidBlur(()=>{r&&!s.value&&(s.value=r.root.name)}));const p=l=>{s.value=l.root.name,s.validate(),l.root.disabled?s.disable():s.enable()};return{set element(l){r=l,p(r),i.add(r.root.onDidChange(u=>{(u.name||u.disabled)&&p(l)}))},disposables:e,elementDisposables:i}}};V=b([I(0,ee),I(1,ve)],V);let z=class extends N{constructor(t,e){super();this.instantiationService=t;this.hoverService=e}templateId="icon";renderTemplate(t){const e=new y,i=e.add(new y);let r;const o=a(t,c(".profile-row-container"));a(o,c(".profile-label-element",void 0,d("icon-label","Icon")));const s=a(o,c(".profile-icon-container")),f=a(s,c(`${S.asCSSSelector(le)}`,{tabindex:"0",role:"button","aria-label":d("icon","Profile Icon")})),p=e.add(this.instantiationService.createInstance(pt,{icons:It,inputBoxStyles:je}));let l;const u=()=>{r?.root instanceof P&&r.root.profile.isDefault||r?.root.disabled||(p.clearInput(),l=this.hoverService.showHover({content:p.domNode,target:f,position:{hoverPosition:Ne.BELOW},persistence:{sticky:!0},appearance:{showPointer:!0}},!0),l&&(p.layout(new ce(486,260)),p.focus()))};e.add(U(f,H.CLICK,h=>{ie.stop(h,!0),u()})),e.add(U(f,H.KEY_DOWN,h=>{const m=new de(h);(m.equals(oe.Enter)||m.equals(oe.Space))&&(ie.stop(m,!0),u())})),e.add(U(p.domNode,H.KEY_DOWN,h=>{const m=new de(h);m.equals(oe.Escape)&&(ie.stop(m,!0),l?.dispose(),f.focus())})),e.add(p.onDidSelect(h=>{l?.dispose(),f.focus(),r&&(r.root.icon=h.id)})),a(s,c(".profile-description-element",void 0,d("icon-description","Profile icon to be shown in the activity bar")));const g=h=>{h.root.icon?f.className=S.asClassName(S.fromId(h.root.icon)):f.className=S.asClassName(S.fromId(le.id))};return{set element(h){r=h,g(r),i.add(r.root.onDidChange(m=>{m.icon&&g(h)}))},disposables:e,elementDisposables:i}}};z=b([I(0,E),I(1,qe)],z);let $=class extends N{constructor(t){super();this.userDataProfileService=t}templateId="useForCurrent";renderTemplate(t){const e=new y,i=e.add(new y);let r;const o=a(t,c(".profile-row-container"));a(o,c(".profile-label-element",void 0,d("use for curren window","Use for Current Window")));const s=a(o,c(".profile-use-for-current-container")),f=d("enable for current window","Use this profile for the current window"),p=e.add(new Z(f,!1,se));a(s,p.domNode);const l=a(s,c(".profile-description-element",void 0,f));e.add(p.onChange(()=>{r?.root instanceof P&&r.root.toggleCurrentWindowProfile()})),e.add(U(l,H.CLICK,()=>{r?.root instanceof P&&r.root.toggleCurrentWindowProfile()}));const u=h=>{p.checked=h.root instanceof P&&this.userDataProfileService.currentProfile.id===h.root.profile.id,p.checked&&this.userDataProfileService.currentProfile.isDefault?p.disable():p.enable()},g=this;return{set element(h){r=h,u(r),i.add(g.userDataProfileService.onDidChangeCurrentProfile(m=>{u(h)}))},disposables:e,elementDisposables:i}}};$=b([I(0,ut)],$);class vt extends N{templateId="useAsDefault";renderTemplate(n){const t=new y,e=t.add(new y);let i;const r=a(n,c(".profile-row-container"));a(r,c(".profile-label-element",void 0,d("use for new windows","Use for New Windows")));const o=a(r,c(".profile-use-as-default-container")),s=d("enable for new windows","Use this profile as the default for new windows"),f=t.add(new Z(s,!1,se));a(o,f.domNode);const p=a(o,c(".profile-description-element",void 0,s));t.add(f.onChange(()=>{i?.root instanceof P&&i.root.toggleNewWindowProfile()})),t.add(U(p,H.CLICK,()=>{i?.root instanceof P&&i.root.toggleNewWindowProfile()}));const l=u=>{f.checked=u.root instanceof P&&u.root.isNewWindowProfile};return{set element(u){i=u,l(i),e.add(i.root.onDidChange(g=>{g.newWindowProfile&&l(u)}))},disposables:t,elementDisposables:e}}}let q=class extends N{constructor(t,e,i,r){super();this.userDataProfilesService=t;this.instantiationService=e;this.uriIdentityService=i;this.contextViewService=r}templateId="copyFrom";templates=[];renderTemplate(t){const e=new y,i=e.add(new y);let r;const o=a(t,c(".profile-row-container.profile-copy-from-container"));a(o,c(".profile-label-element",void 0,d("create from","Copy from"))),a(o,c(".profile-description-element",void 0,d("copy from description","Select the profile source from which you want to copy contents")));const s=e.add(this.instantiationService.createInstance(He,[],0,this.contextViewService,Je,{useCustomDrawn:!0,ariaLabel:d("copy profile from","Copy profile from")}));s.render(a(o,c(".profile-select-container")));const f=(l,u)=>{s.setOptions(u);const g=l.copyFrom instanceof R?l.copyFrom.toString():l.copyFrom?.id,h=g?u.findIndex(m=>m.id===g):0;s.select(h)},p=this;return{set element(l){if(r=l,r.root instanceof v){const u=r.root;let g=p.getCopyFromOptions(u);f(u,g),s.setEnabled(!u.previewProfile&&!u.disabled),i.add(r.root.onDidChange(h=>{(h.copyFrom||h.copyFromInfo)&&(g=p.getCopyFromOptions(u),f(u,g)),(h.preview||h.disabled)&&s.setEnabled(!u.previewProfile&&!u.disabled)})),i.add(s.onDidSelect(h=>{u.copyFrom=g[h.index].source}))}},disposables:e,elementDisposables:i}}setTemplates(t){this.templates=t}getCopyFromOptions(t){const e={text:"\u2500\u2500\u2500\u2500\u2500\u2500",isDisabled:!0},i=[];i.push({text:d("empty profile","None")});for(const[r,o]of t.copyFromTemplates)this.templates.some(s=>this.uriIdentityService.extUri.isEqual(R.parse(s.url),r))||i.push({text:`${o} (${be(r)})`,id:r.toString(),source:r});if(this.templates.length){i.push({...e,decoratorRight:d("from templates","Profile Templates")});for(const r of this.templates)i.push({text:r.name,id:r.url,source:R.parse(r.url)})}i.push({...e,decoratorRight:d("from existing profiles","Existing Profiles")});for(const r of this.userDataProfilesService.profiles)i.push({text:r.name,id:r.id,source:r});return i}};q=b([I(0,ee),I(1,E),I(2,ot),I(3,ve)],q);let G=class extends N{constructor(t,e){super();this.userDataProfilesService=t;this.instantiationService=e}templateId="contents";_onDidChangeContentHeight=this._register(new ye);onDidChangeContentHeight=this._onDidChangeContentHeight.event;_onDidChangeSelection=this._register(new ye);onDidChangeSelection=this._onDidChangeSelection.event;profilesContentTree;renderTemplate(t){const e=new y,i=e.add(new y);let r;const o=a(t,c(".profile-row-container"));a(o,c(".profile-label-element",void 0,d("contents","Contents")));const s=a(o,c(".profile-description-element")),f=a(o,c(".profile-content-tree-header")),p=c(".options-header",void 0,c("span",void 0,d("options","Source")));a(f,c(""),c("",void 0,d("contents","Contents")),p,c(".actions-header",void 0,d("actions","Actions")));const l=new bt,u=this.profilesContentTree=e.add(this.instantiationService.createInstance(Se,"ProfileEditor-ContentsTree",a(o,c(".profile-content-tree.file-icon-themable-tree.show-file-icons")),l,[this.instantiationService.createInstance(w),this.instantiationService.createInstance(D),this.instantiationService.createInstance(x)],this.instantiationService.createInstance(W),{multipleSelectionSupport:!1,horizontalScrolling:!1,accessibilityProvider:{getAriaLabel(m){return(m?.element).resourceType?(m?.element).resourceType:(m?.element).label?(m?.element).label:""},getWidgetAriaLabel(){return""}},identityProvider:{getId(m){return m?.element.handle?m.element.handle:""}},expandOnlyOnTwistieClick:!0,renderIndentGuides:ue.None,enableStickyScroll:!1,openOnSingleClick:!1,alwaysConsumeMouseWheel:!1}));this.profilesContentTree.style(we),e.add(Ve(()=>this.profilesContentTree=void 0)),e.add(this.profilesContentTree.onDidChangeContentHeight(m=>{this.profilesContentTree?.layout(m),r&&this._onDidChangeContentHeight.fire(r)})),e.add(this.profilesContentTree.onDidChangeSelection(m=>{r&&this._onDidChangeSelection.fire({element:r,selected:!!m.elements.length})})),e.add(this.profilesContentTree.onDidOpen(async m=>{m.browserEvent&&(m.browserEvent.target&&m.browserEvent.target.classList.contains(Z.CLASS_NAME)||m.element?.element.action&&await m.element.element.action.run())}));const g=m=>{const A=d("default info",`- *Default:* Use contents from the Default profile
`),K=new Oe().appendMarkdown(d("contents source description",`Configure source of contents for this profile
`));if(Le(s),!(m.root instanceof P&&m.root.profile.isDefault)){if(m.root instanceof v){const Q=m.root.getCopyFromName(),ae=Q===this.userDataProfilesService.defaultProfile.name?d("copy from default","{0} (Copy)",Q):Q;ae&&K.appendMarkdown(d("copy info",`- *{0}:* Copy contents from the {1} profile
`,ae,Q)),K.appendMarkdown(A).appendMarkdown(d("none info",`- *None:* Create empty contents
`))}else m.root instanceof P&&K.appendMarkdown(A).appendMarkdown(d("current info",`- *{1}:* Use contents from the {0} profile
`,m.root.profile.name,m.root.profile.name));a(s,i.add(ke(K)).element)}},h=this;return{set element(m){r=m,g(m),m.root instanceof v?f.classList.remove("default-profile"):m.root instanceof P&&f.classList.toggle("default-profile",m.root.profile.isDefault),u.setInput(r.root),i.add(r.root.onDidChange(A=>{(A.copyFrom||A.copyFlags||A.flags)&&u.updateChildren(m.root),A.copyFromInfo&&(g(m),h._onDidChangeContentHeight.fire(m))}))},disposables:e,elementDisposables:new y}}clearSelection(){this.profilesContentTree&&(this.profilesContentTree.setSelection([]),this.profilesContentTree.setFocus([]))}};G=b([I(0,ee),I(1,E)],G);let w=class extends te{constructor(t){super();this.instantiationService=t}static TEMPLATE_ID="ExistingProfileResourceTemplate";templateId=w.TEMPLATE_ID;renderTemplate(t){const e=new y,i=a(t,c(".profile-tree-item-container.existing-profile-resource-type-container")),r=a(i,c(".profile-resource-type-label")),o=e.add(new me({items:[]}));a(a(i,c(".profile-resource-options-container")),o.domNode);const s=a(i,c(".profile-resource-actions-container")),f=e.add(this.instantiationService.createInstance(X,s,{hoverDelegate:e.add(Y()),highlightToggledItems:!0}));return{label:r,radio:o,actionBar:f,disposables:e,elementDisposables:e.add(new y)}}renderElement({element:t},e,i,r){i.elementDisposables.clear();const{element:o,root:s}=t;if(!(s instanceof P))throw new Error("ExistingProfileResourceTreeRenderer can only render existing profile element");if(re(o)||!Ce(o))throw new Error("Invalid profile resource element");const f=()=>{i.radio.setItems([{text:d("default","Default"),tooltip:d("default description","Use {0} from the Default profile",p),isActive:s.getFlag(o.resourceType)},{text:s.name,tooltip:d("current description","Use {0} from the {1} profile",p,s.name),isActive:!s.getFlag(o.resourceType)}])},p=this.getResourceTypeTitle(o.resourceType);i.label.textContent=p,s instanceof P&&s.profile.isDefault?i.radio.domNode.classList.add("hide"):(i.radio.domNode.classList.remove("hide"),f(),i.elementDisposables.add(s.onDidChange(l=>{l.name&&f()})),i.elementDisposables.add(i.radio.onDidSelect(l=>s.setFlag(o.resourceType,l===0)))),i.actionBar.setActions(o.action?[o.action]:[])}};w=b([I(0,E)],w);let D=class extends te{constructor(t,e){super();this.userDataProfilesService=t;this.instantiationService=e}static TEMPLATE_ID="NewProfileResourceTemplate";templateId=D.TEMPLATE_ID;renderTemplate(t){const e=new y,i=a(t,c(".profile-tree-item-container.new-profile-resource-type-container")),r=a(i,c(".profile-resource-type-label-container")),o=a(r,c("span.profile-resource-type-label")),s=e.add(new me({items:[]}));a(a(i,c(".profile-resource-options-container")),s.domNode);const f=a(i,c(".profile-resource-actions-container")),p=e.add(this.instantiationService.createInstance(X,f,{hoverDelegate:e.add(Y()),highlightToggledItems:!0}));return{label:o,radio:s,actionBar:p,disposables:e,elementDisposables:e.add(new y)}}renderElement({element:t},e,i,r){i.elementDisposables.clear();const{element:o,root:s}=t;if(!(s instanceof v))throw new Error("NewProfileResourceTreeRenderer can only render new profile element");if(re(o)||!Ce(o))throw new Error("Invalid profile resource element");const f=this.getResourceTypeTitle(o.resourceType);i.label.textContent=f;const p=()=>{const l=[{text:d("default","Default"),tooltip:d("default description","Use {0} from the Default profile",f)},{text:d("none","None"),tooltip:d("none description","Create empty {0}",f)}],u=s.getCopyFromName(),g=u===this.userDataProfilesService.defaultProfile.name?d("copy from default","{0} (Copy)",u):u;s.copyFrom&&g?(i.radio.setItems([{text:g,tooltip:g?d("copy from profile description","Copy {0} from the {1} profile",f,g):d("copy description","Copy")},...l]),i.radio.setActiveItem(s.getCopyFlag(o.resourceType)?0:s.getFlag(o.resourceType)?1:2)):(i.radio.setItems(l),i.radio.setActiveItem(s.getFlag(o.resourceType)?0:1))};s.copyFrom?i.elementDisposables.add(i.radio.onDidSelect(l=>{s.setFlag(o.resourceType,l===1),s.setCopyFlag(o.resourceType,l===0)})):i.elementDisposables.add(i.radio.onDidSelect(l=>{s.setFlag(o.resourceType,l===0)})),p(),i.radio.setEnabled(!s.disabled),i.elementDisposables.add(s.onDidChange(l=>{l.disabled&&i.radio.setEnabled(!s.disabled),(l.copyFrom||l.copyFromInfo)&&p()})),i.actionBar.setActions(o.action?[o.action]:[])}};D=b([I(0,ee),I(1,E)],D);let x=class extends te{constructor(t){super();this.instantiationService=t;this.labels=t.createInstance(nt,rt),this.hoverDelegate=this._register(t.createInstance(Ge,"mouse",!1,{}))}static TEMPLATE_ID="ProfileResourceChildTreeItemTemplate";templateId=x.TEMPLATE_ID;labels;hoverDelegate;renderTemplate(t){const e=new y,i=a(t,c(".profile-tree-item-container.profile-resource-child-container")),r=e.add(new Z("",!1,se));a(i,r.domNode);const o=e.add(this.labels.create(i,{hoverDelegate:this.hoverDelegate})),s=a(i,c(".profile-resource-actions-container")),f=e.add(this.instantiationService.createInstance(X,s,{hoverDelegate:e.add(Y()),highlightToggledItems:!0}));return{checkbox:r,resourceLabel:o,actionBar:f,disposables:e,elementDisposables:e.add(new y)}}renderElement({element:t},e,i,r){i.elementDisposables.clear();const{element:o}=t;if(re(o)||!dt(o))throw new Error("Invalid profile resource element");o.checkbox?(i.checkbox.domNode.setAttribute("tabindex","0"),i.checkbox.domNode.classList.remove("hide"),i.checkbox.checked=o.checkbox.isChecked,i.checkbox.domNode.ariaLabel=o.checkbox.accessibilityInformation?.label??"",o.checkbox.accessibilityInformation?.role&&(i.checkbox.domNode.role=o.checkbox.accessibilityInformation.role)):(i.checkbox.domNode.removeAttribute("tabindex"),i.checkbox.domNode.classList.add("hide")),i.resourceLabel.setResource({name:o.resource?be(o.resource):o.label,resource:o.resource},{forceLabel:!0,icon:o.icon,hideIcon:!o.resource&&!o.icon}),i.actionBar.setActions(o.action?[o.action]:[])}};x=b([I(0,E)],x);let L=class extends lt{constructor(t){super();this.instantiationService=t;this.model=ft.getInstance(this.instantiationService),this._register(this.model.onDidChange(e=>this.dirty=this.model.profiles.some(i=>i instanceof v)))}static ID="workbench.input.userDataProfiles";resource=void 0;model;_dirty=!1;get dirty(){return this._dirty}set dirty(t){this._dirty!==t&&(this._dirty=t,this._onDidChangeDirty.fire())}get typeId(){return L.ID}getName(){return d("userDataProfiles","Profiles")}getIcon(){return mt}async resolve(){return await this.model.resolve(),this.model}isDirty(){return this.dirty}async save(){return await this.model.saveNewProfile(),this}async revert(){this.model.revert()}matches(t){return t instanceof L}};L=b([I(0,E)],L);class Ji{canSerialize(n){return!0}serialize(n){return""}deserialize(n){return n.createInstance(L)}}export{M as UserDataProfilesEditor,L as UserDataProfilesEditorInput,Ji as UserDataProfilesEditorInputSerializer,gt as profilesSashBorder};
