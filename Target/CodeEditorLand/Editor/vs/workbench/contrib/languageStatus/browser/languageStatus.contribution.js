var B=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var C=(u,e,t,r)=>{for(var i=r>1?void 0:r?N(e,t):e,s=u.length-1,a;s>=0;s--)(a=u[s])&&(i=(r?a(e,t,i):a(i))||i);return r&&i&&B(e,t,i),i},m=(u,e)=>(t,r)=>e(t,r,u);import"./media/languageStatus.css";import*as b from"../../../../base/browser/dom.js";import{ActionBar as F}from"../../../../base/browser/ui/actionbar/actionbar.js";import{renderLabelWithIcons as A}from"../../../../base/browser/ui/iconLabel/iconLabels.js";import{Action as R}from"../../../../base/common/actions.js";import{equals as M}from"../../../../base/common/arrays.js";import{Codicon as x}from"../../../../base/common/codicons.js";import{Event as q}from"../../../../base/common/event.js";import{MarkdownString as G}from"../../../../base/common/htmlContent.js";import{Disposable as j,DisposableStore as k,dispose as V,toDisposable as z}from"../../../../base/common/lifecycle.js";import{parseLinkedText as J}from"../../../../base/common/linkedText.js";import y from"../../../../base/common/severity.js";import{ThemeIcon as W}from"../../../../base/common/themables.js";import{URI as K}from"../../../../base/common/uri.js";import{getCodeEditor as U}from"../../../../editor/browser/editorBrowser.js";import{localize as S,localize2 as Q}from"../../../../nls.js";import{Categories as X}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as Y,registerAction2 as Z}from"../../../../platform/actions/common/actions.js";import{IHoverService as ee,nativeHoverDelegate as O}from"../../../../platform/hover/browser/hover.js";import{Link as P}from"../../../../platform/opener/browser/link.js";import{IOpenerService as te}from"../../../../platform/opener/common/opener.js";import{Registry as ie}from"../../../../platform/registry/common/platform.js";import{IStorageService as T,StorageScope as _,StorageTarget as H}from"../../../../platform/storage/common/storage.js";import{Extensions as re}from"../../../common/contributions.js";import{IEditorGroupsService as se}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as ae}from"../../../services/editor/common/editorService.js";import{ILanguageStatusService as oe}from"../../../services/languageStatus/common/languageStatusService.js";import{LifecyclePhase as ne}from"../../../services/lifecycle/common/lifecycle.js";import{IStatusbarService as de,ShowTooltipCommand as ce,StatusbarAlignment as D}from"../../../services/statusbar/browser/statusbar.js";class ${constructor(e,t){this.combined=e;this.dedicated=t}isEqual(e){return M(this.combined,e.combined)&&M(this.dedicated,e.dedicated)}}let L=class{constructor(e,t){this._storageService=e;this._key=t}get value(){return this._storageService.getNumber(this._key,_.PROFILE,0)}increment(){const e=this.value+1;return this._storageService.store(this._key,e,_.PROFILE,H.MACHINE),e}};L=C([m(0,T)],L);let w=class extends j{constructor(t){super();this.editorGroupService=t;for(const r of t.parts)this.createLanguageStatus(r);this._register(t.onDidCreateAuxiliaryEditorPart(r=>this.createLanguageStatus(r)))}createLanguageStatus(t){const r=new k;q.once(t.onWillDispose)(()=>r.dispose());const i=this.editorGroupService.getScopedInstantiationService(t);r.add(i.createInstance(o))}};w=C([m(0,se)],w);let o=class{constructor(e,t,r,i,s,a){this._languageStatusService=e;this._statusBarService=t;this._editorService=r;this._hoverService=i;this._openerService=s;this._storageService=a;a.onDidChangeValue(_.PROFILE,o._keyDedicatedItems,this._disposables)(this._handleStorageChange,this,this._disposables),this._restoreState(),this._interactionCounter=new L(a,"languageStatus.interactCount"),e.onDidChange(this._update,this,this._disposables),r.onDidActiveEditorChange(this._update,this,this._disposables),this._update(),t.onDidChangeEntryVisibility(l=>{!l.visible&&this._dedicated.has(l.id)&&(this._dedicated.delete(l.id),this._update(),this._storeState())},void 0,this._disposables)}static _id="status.languageStatus";static _keyDedicatedItems="languageStatus.dedicated";_disposables=new k;_interactionCounter;_dedicated=new Set;_model;_combinedEntry;_dedicatedEntries=new Map;_renderDisposables=new k;dispose(){this._disposables.dispose(),this._combinedEntry?.dispose(),V(this._dedicatedEntries.values()),this._renderDisposables.dispose()}_handleStorageChange(){this._restoreState(),this._update()}_restoreState(){const e=this._storageService.get(o._keyDedicatedItems,_.PROFILE,"[]");try{const t=JSON.parse(e);this._dedicated=new Set(t)}catch{this._dedicated.clear()}}_storeState(){if(this._dedicated.size===0)this._storageService.remove(o._keyDedicatedItems,_.PROFILE);else{const e=JSON.stringify(Array.from(this._dedicated.keys()));this._storageService.store(o._keyDedicatedItems,e,_.PROFILE,H.USER)}}_createViewModel(e){if(!e?.hasModel())return new $([],[]);const t=this._languageStatusService.getLanguageStatus(e.getModel()),r=[],i=[];for(const s of t)this._dedicated.has(s.id)&&i.push(s),r.push(s);return new $(r,i)}_update(){const e=U(this._editorService.activeTextEditorControl),t=this._createViewModel(e);if(this._model?.isEqual(t))return;if(this._renderDisposables.clear(),this._model=t,e?.onDidChangeModelLanguage(this._update,this,this._renderDisposables),t.combined.length===0)this._combinedEntry?.dispose(),this._combinedEntry=void 0;else{const[i]=t.combined,s=i.severity>=y.Warning,a=o._severityToComboCodicon(i.severity);let l=!1;const g=[],h=document.createElement("div");for(const n of t.combined){const d=t.dedicated.includes(n);h.appendChild(this._renderStatus(n,s,d,this._renderDisposables)),g.push(o._accessibilityInformation(n).label),l=l||!d&&n.busy}const f={name:S("langStatus.name","Editor Language Status"),ariaLabel:S("langStatus.aria","Editor Language Status: {0}",g.join(", next: ")),tooltip:h,command:ce,text:l?`${a}\xA0\xA0$(sync~spin)`:a};this._combinedEntry?this._combinedEntry.update(f):this._combinedEntry=this._statusBarService.addEntry(f,o._id,D.RIGHT,{id:"status.editor.mode",alignment:D.LEFT,compact:!0});const E=this._interactionCounter.value>=3,v=b.getWindow(e?.getContainerDomNode()),p=v.document.querySelector(".monaco-workbench .statusbar DIV#status\\.languageStatus A>SPAN.codicon"),c=v.document.querySelector(".monaco-workbench .statusbar DIV#status\\.languageStatus");if(b.isHTMLElement(p)&&c){const n="wiggle",d="flash";l?(p.classList.remove(n),c.classList.remove(d)):(p.classList.toggle(n,s||!E),this._renderDisposables.add(b.addDisposableListener(p,"animationend",I=>p.classList.remove(n))),c.classList.toggle(d,s),this._renderDisposables.add(b.addDisposableListener(c,"animationend",I=>c.classList.remove(d))))}if(!E){const n=v.document.querySelector(".monaco-workbench .context-view");if(b.isHTMLElement(n)){const d=new MutationObserver(()=>{v.document.contains(h)&&(this._interactionCounter.increment(),d.disconnect())});d.observe(n,{childList:!0,subtree:!0}),this._renderDisposables.add(z(()=>d.disconnect()))}}}const r=new Map;for(const i of t.dedicated){const s=o._asStatusbarEntry(i);let a=this._dedicatedEntries.get(i.id);a?(a.update(s),this._dedicatedEntries.delete(i.id)):a=this._statusBarService.addEntry(s,i.id,D.RIGHT,{id:"status.editor.mode",alignment:D.RIGHT}),r.set(i.id,a)}V(this._dedicatedEntries.values()),this._dedicatedEntries=r}_renderStatus(e,t,r,i){const s=document.createElement("div");s.classList.add("hover-language-status");const a=document.createElement("div");a.classList.add("severity",`sev${e.severity}`),a.classList.toggle("show",t);const l=o._severityToSingleCodicon(e.severity);b.append(a,...A(l)),s.appendChild(a);const g=document.createElement("div");g.classList.add("element"),s.appendChild(g);const h=document.createElement("div");h.classList.add("left"),g.appendChild(h);const f=document.createElement("span");f.classList.add("label");const E=typeof e.label=="string"?e.label:e.label.value;b.append(f,...A(e.busy?`$(sync~spin)\xA0\xA0${E}`:E)),h.appendChild(f);const v=document.createElement("span");v.classList.add("detail"),this._renderTextPlus(v,e.detail,i),h.appendChild(v);const p=document.createElement("div");p.classList.add("right"),g.appendChild(p);const{command:c}=e;c&&i.add(new P(p,{label:c.title,title:c.tooltip,href:K.from({scheme:"command",path:c.id,query:c.arguments&&JSON.stringify(c.arguments)}).toString()},{hoverDelegate:O},this._hoverService,this._openerService));const n=new F(p,{hoverDelegate:O}),d=r?S("unpin","Remove from Status Bar"):S("pin","Add to Status Bar");n.setAriaLabel(d),i.add(n);let I;return r?I=new R("unpin",d,W.asClassName(x.pinned),!0,()=>{this._dedicated.delete(e.id),this._statusBarService.updateEntryVisibility(e.id,!1),this._update(),this._storeState()}):I=new R("pin",d,W.asClassName(x.pin),!0,()=>{this._dedicated.add(e.id),this._statusBarService.updateEntryVisibility(e.id,!0),this._update(),this._storeState()}),n.push(I,{icon:!0,label:!1}),i.add(I),s}static _severityToComboCodicon(e){switch(e){case y.Error:return"$(bracket-error)";case y.Warning:return"$(bracket-dot)";default:return"$(bracket)"}}static _severityToSingleCodicon(e){switch(e){case y.Error:return"$(error)";case y.Warning:return"$(info)";default:return"$(check)"}}_renderTextPlus(e,t,r){for(const i of J(t).nodes)if(typeof i=="string"){const s=A(i);b.append(e,...s)}else r.add(new P(e,i,void 0,this._hoverService,this._openerService))}static _accessibilityInformation(e){if(e.accessibilityInfo)return e.accessibilityInfo;const t=typeof e.label=="string"?e.label:e.label.value;return e.detail?{label:S("aria.1","{0}, {1}",t,e.detail)}:{label:S("aria.2","{0}",t)}}static _asStatusbarEntry(e){let t;e.severity===y.Warning?t="warning":e.severity===y.Error&&(t="error");const r=typeof e.label=="string"?e.label:e.label.shortValue;return{name:S("name.pattern","{0} (Language Status)",e.name),text:e.busy?`${r}\xA0\xA0$(sync~spin)`:r,ariaLabel:o._accessibilityInformation(e).label,role:e.accessibilityInfo?.role,tooltip:e.command?.tooltip||new G(e.detail,{isTrusted:!0,supportThemeIcons:!0}),kind:t,command:e.command}}};o=C([m(0,oe),m(1,de),m(2,ae),m(3,ee),m(4,te),m(5,T)],o),ie.as(re.Workbench).registerWorkbenchContribution(w,ne.Restored),Z(class extends Y{constructor(){super({id:"editor.inlayHints.Reset",title:Q("reset","Reset Language Status Interaction Counter"),category:X.View,f1:!0})}run(u){u.get(T).remove("languageStatus.interactCount",_.PROFILE)}});
