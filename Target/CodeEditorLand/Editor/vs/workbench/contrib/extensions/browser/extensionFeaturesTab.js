var q=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var b=(f,d,t,e)=>{for(var n=e>1?void 0:e?B(d,t):d,i=f.length-1,r;i>=0;i--)(r=f[i])&&(n=(e?r(d,t,n):r(n))||n);return e&&n&&q(d,t,n),n},p=(f,d)=>(t,e)=>d(t,e,f);import{$ as a,append as m,clearNode as S}from"../../../../../vs/base/browser/dom.js";import{renderMarkdown as W}from"../../../../../vs/base/browser/markdownRenderer.js";import{Button as z}from"../../../../../vs/base/browser/ui/button/button.js";import{KeybindingLabel as K}from"../../../../../vs/base/browser/ui/keybindingLabel/keybindingLabel.js";import"../../../../../vs/base/browser/ui/list/list.js";import{DomScrollableElement as U}from"../../../../../vs/base/browser/ui/scrollbar/scrollableElement.js";import{Orientation as Y,Sizing as Z,SplitView as j}from"../../../../../vs/base/browser/ui/splitview/splitview.js";import{Codicon as w}from"../../../../../vs/base/common/codicons.js";import{Color as F}from"../../../../../vs/base/common/color.js";import{fromNow as G}from"../../../../../vs/base/common/date.js";import{getErrorMessage as J,onUnexpectedError as Q}from"../../../../../vs/base/common/errors.js";import{Emitter as X,Event as R}from"../../../../../vs/base/common/event.js";import{isMarkdownString as A,MarkdownString as ee}from"../../../../../vs/base/common/htmlContent.js";import{ResolvedKeybinding as te}from"../../../../../vs/base/common/keybindings.js";import{Disposable as N,DisposableStore as T,MutableDisposable as $,toDisposable as ne}from"../../../../../vs/base/common/lifecycle.js";import{OS as ie}from"../../../../../vs/base/common/platform.js";import g from"../../../../../vs/base/common/severity.js";import{ThemeIcon as re}from"../../../../../vs/base/common/themables.js";import{localize as c}from"../../../../../vs/nls.js";import{IDialogService as se}from"../../../../../vs/platform/dialogs/common/dialogs.js";import{getExtensionId as M}from"../../../../../vs/platform/extensionManagement/common/extensionManagementUtil.js";import{ExtensionIdentifier as h}from"../../../../../vs/platform/extensions/common/extensions.js";import{SyncDescriptor as ae}from"../../../../../vs/platform/instantiation/common/descriptors.js";import{IInstantiationService as _}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{WorkbenchList as oe}from"../../../../../vs/platform/list/browser/listService.js";import{IOpenerService as de}from"../../../../../vs/platform/opener/common/opener.js";import{Registry as V}from"../../../../../vs/platform/registry/common/platform.js";import{SeverityIcon as le}from"../../../../../vs/platform/severityIcon/browser/severityIcon.js";import{defaultButtonStyles as ue,defaultKeybindingLabelStyles as ce}from"../../../../../vs/platform/theme/browser/defaultStyles.js";import{IThemeService as me,Themable as pe}from"../../../../../vs/platform/theme/common/themeService.js";import{PANEL_SECTION_BORDER as he}from"../../../../../vs/workbench/common/theme.js";import{errorIcon as H,infoIcon as fe,warningIcon as O}from"../../../../../vs/workbench/contrib/extensions/browser/extensionsIcons.js";import{Extensions as P,IExtensionFeaturesManagementService as k}from"../../../../../vs/workbench/services/extensionManagement/common/extensionFeatures.js";import{IExtensionService as ge}from"../../../../../vs/workbench/services/extensions/common/extensions.js";let v=class extends N{constructor(t,e){super();this.extensionService=t;this.extensionFeaturesManagementService=e}static ID="runtimeStatus";type="markdown";shouldRender(t){const e=new h(M(t.publisher,t.name));return this.extensionService.extensions.some(n=>h.equals(n.identifier,e))?!!t.main||!!t.browser:!1}render(t){const e=new T,n=new h(M(t.publisher,t.name)),i=e.add(new X);return e.add(this.extensionService.onDidChangeExtensionsStatus(r=>{r.some(o=>h.equals(o,n))&&i.fire(this.getRuntimeStatusData(t))})),e.add(this.extensionFeaturesManagementService.onDidChangeAccessData(r=>i.fire(this.getRuntimeStatusData(t)))),{onDidChange:i.event,data:this.getRuntimeStatusData(t),dispose:()=>e.dispose()}}getRuntimeStatusData(t){const e=new ee,n=new h(M(t.publisher,t.name)),i=this.extensionService.getExtensionsStatus()[n.value];if(this.extensionService.extensions.some(o=>h.equals(o.identifier,n))){if(e.appendMarkdown(`### ${c("activation","Activation")}

`),i.activationTimes?i.activationTimes.activationReason.startup?e.appendMarkdown(`Activated on Startup: \`${i.activationTimes.activateCallTime}ms\``):e.appendMarkdown(`Activated by \`${i.activationTimes.activationReason.activationEvent}\` event: \`${i.activationTimes.activateCallTime}ms\``):e.appendMarkdown("Not yet activated"),i.runtimeErrors.length){e.appendMarkdown(`
 ### ${c("uncaught errors","Uncaught Errors ({0})",i.runtimeErrors.length)}
`);for(const o of i.runtimeErrors)e.appendMarkdown(`$(${w.error.id})&nbsp;${J(o)}

`)}if(i.messages.length){e.appendMarkdown(`
 ### ${c("messaages","Messages ({0})",i.messages.length)}
`);for(const o of i.messages)e.appendMarkdown(`$(${(o.type===g.Error?w.error:o.type===g.Warning?w.warning:w.info).id})&nbsp;${o.message}

`)}}const r=V.as(P.ExtensionFeaturesRegistry).getExtensionFeatures();for(const o of r){const s=this.extensionFeaturesManagementService.getAccessData(n,o.id);if(s){e.appendMarkdown(`
 ### ${o.label}

`);const l=s?.current?.status;l&&(l?.severity===g.Error&&e.appendMarkdown(`$(${H.id}) ${l.message}

`),l?.severity===g.Warning&&e.appendMarkdown(`$(${O.id}) ${l.message}

`)),s?.totalCount&&(s.current&&(e.appendMarkdown(`${c("last request","Last Request: `{0}`",G(s.current.lastAccessed,!0,!0))}

`),e.appendMarkdown(`${c("requests count session","Requests (Session) : `{0}`",s.current.count)}

`)),e.appendMarkdown(`${c("requests count total","Requests (Overall): `{0}`",s.totalCount)}

`))}}return e}};v=b([p(0,ge),p(1,k)],v);const C={id:v.ID,label:c("runtime","Runtime Status"),access:{canToggle:!1},renderer:new ae(v)};let D=class extends pe{constructor(t,e,n,i){super(n);this.manifest=t;this.feature=e;this.instantiationService=i;this.extensionId=new h(M(t.publisher,t.name)),this.domNode=a("div.subcontent.feature-contributions"),this.create()}domNode;featureView=this._register(new $);featureViewDimension;layoutParticipants=[];extensionId;layout(t,e){this.layoutParticipants.forEach(n=>n.layout(t,e))}create(){const t=this.getFeatures();if(t.length===0){m(a(".no-features"),this.domNode).textContent=c("noFeatures","No features contributed.");return}const e=this._register(new j(this.domNode,{orientation:Y.HORIZONTAL,proportionalLayout:!0}));this.layoutParticipants.push({layout:(s,l)=>{e.el.style.height=`${s-14}px`,e.layout(l)}});const n=a(".features-list-container"),i=this._register(this.createFeaturesList(n));i.splice(0,i.length,t);const r=a(".feature-view-container");this._register(i.onDidChangeSelection(s=>{const l=s.elements[0];l&&this.showFeatureView(l,r)}));const o=this.feature?t.findIndex(s=>s.id===this.feature):0;i.setSelection([o===-1?0:o]),e.addView({onDidChange:R.None,element:n,minimumSize:100,maximumSize:Number.POSITIVE_INFINITY,layout:(s,l,u)=>{n.style.width=`${s}px`,i.layout(u,s)}},200,void 0,!0),e.addView({onDidChange:R.None,element:r,minimumSize:500,maximumSize:Number.POSITIVE_INFINITY,layout:(s,l,u)=>{r.style.width=`${s}px`,this.featureViewDimension={height:u,width:s},this.layoutFeatureView()}},Z.Distribute,void 0,!0),e.style({separatorBorder:this.theme.getColor(he)})}createFeaturesList(t){const e=this.instantiationService.createInstance(x,this.extensionId),n=new ve;return this.instantiationService.createInstance(oe,"ExtensionFeaturesList",m(t,a(".features-list-wrapper")),n,[e],{multipleSelectionSupport:!1,setRowLineHeight:!1,horizontalScrolling:!1,accessibilityProvider:{getAriaLabel(r){return r?.label??""},getWidgetAriaLabel(){return c("extension features list","Extension Features")}},openOnSingleClick:!0})}layoutFeatureView(){this.featureView.value?.layout(this.featureViewDimension?.height,this.featureViewDimension?.width)}showFeatureView(t,e){this.featureView.value?.feature.id!==t.id&&(S(e),this.featureView.value=this.instantiationService.createInstance(E,this.extensionId,this.manifest,t),e.appendChild(this.featureView.value.domNode),this.layoutFeatureView())}getFeatures(){const t=V.as(P.ExtensionFeaturesRegistry).getExtensionFeatures().filter(n=>{const i=this.getRenderer(n),r=i?.shouldRender(this.manifest);return i?.dispose(),r}).sort((n,i)=>n.label.localeCompare(i.label)),e=this.getRenderer(C);return e?.shouldRender(this.manifest)&&t.splice(0,0,C),e?.dispose(),t}getRenderer(t){return t.renderer?this.instantiationService.createInstance(t.renderer):void 0}};D=b([p(2,me),p(3,_)],D);class ve{getHeight(){return 22}getTemplateId(){return"extensionFeatureDescriptor"}}let x=class{constructor(d,t){this.extensionId=d;this.extensionFeaturesManagementService=t}templateId="extensionFeatureDescriptor";renderTemplate(d){d.classList.add("extension-feature-list-item");const t=m(d,a(".extension-feature-label")),e=m(d,a(".extension-feature-disabled-label"));e.textContent=c("revoked","No Access");const n=m(d,a(".extension-feature-status"));return{label:t,disabledElement:e,statusElement:n,disposables:new T}}renderElement(d,t,e){e.disposables.clear(),e.label.textContent=d.label,e.disabledElement.style.display=d.id===C.id||this.extensionFeaturesManagementService.isEnabled(this.extensionId,d.id)?"none":"inherit",e.disposables.add(this.extensionFeaturesManagementService.onDidChangeEnablement(({extension:r,featureId:o,enabled:s})=>{h.equals(r,this.extensionId)&&o===d.id&&(e.disabledElement.style.display=s?"none":"inherit")}));const n=e.statusElement.className,i=()=>{const r=this.extensionFeaturesManagementService.getAccessData(this.extensionId,d.id);r?.current?.status?(e.statusElement.style.display="inherit",e.statusElement.className=`${n} ${le.className(r.current.status.severity)}`):e.statusElement.style.display="none"};i(),e.disposables.add(this.extensionFeaturesManagementService.onDidChangeAccessData(({extension:r,featureId:o})=>{h.equals(r,this.extensionId)&&o===d.id&&i()}))}disposeElement(d,t,e,n){e.disposables.dispose()}disposeTemplate(d){d.disposables.dispose()}};x=b([p(1,k)],x);let E=class extends N{constructor(t,e,n,i,r,o,s){super();this.extensionId=t;this.manifest=e;this.feature=n;this.openerService=i;this.instantiationService=r;this.extensionFeaturesManagementService=o;this.dialogService=s;this.domNode=a(".extension-feature-content"),this.create(this.domNode)}domNode;layoutParticipants=[];create(t){const e=m(t,a(".feature-header")),n=m(e,a(".feature-title"));if(n.textContent=this.feature.label,this.feature.access.canToggle){const u=m(e,a(".feature-actions")),y=new z(u,ue);this.updateButtonLabel(y),this._register(this.extensionFeaturesManagementService.onDidChangeEnablement(({extension:I,featureId:L})=>{h.equals(I,this.extensionId)&&L===this.feature.id&&this.updateButtonLabel(y)})),this._register(y.onDidClick(async()=>{const I=this.extensionFeaturesManagementService.isEnabled(this.extensionId,this.feature.id);(await this.dialogService.confirm({title:c("accessExtensionFeature","Enable '{0}' Feature",this.feature.label),message:I?c("disableAccessExtensionFeatureMessage","Would you like to revoke '{0}' extension to access '{1}' feature?",this.manifest.displayName??this.extensionId.value,this.feature.label):c("enableAccessExtensionFeatureMessage","Would you like to allow '{0}' extension to access '{1}' feature?",this.manifest.displayName??this.extensionId.value,this.feature.label),custom:!0,primaryButton:I?c("revoke","Revoke Access"):c("grant","Allow Access"),cancelButton:c("cancel","Cancel")})).confirmed&&this.extensionFeaturesManagementService.setEnablement(this.extensionId,this.feature.id,!I)}))}const i=m(t,a(".feature-body")),r=a(".feature-body-content"),o=this._register(new U(r,{}));if(m(i,o.getDomNode()),this.layoutParticipants.push({layout:()=>o.scanDomNode()}),o.scanDomNode(),this.feature.description){const u=m(r,a(".feature-description"));u.textContent=this.feature.description}const s=this.extensionFeaturesManagementService.getAccessData(this.extensionId,this.feature.id);s?.current?.status&&m(r,a(".feature-status",void 0,a(`span${re.asCSSSelector(s.current.status.severity===g.Error?H:s.current.status.severity===g.Warning?O:fe)}`,void 0),a("span",void 0,s.current.status.message)));const l=m(r,a(".feature-content"));if(this.feature.renderer){const u=this.instantiationService.createInstance(this.feature.renderer);u.type==="table"?this.renderTableData(l,u):u.type==="markdown"?this.renderMarkdownData(l,u):u.type==="markdown+table"&&this.renderMarkdownAndTableData(l,u)}}updateButtonLabel(t){t.label=this.extensionFeaturesManagementService.isEnabled(this.extensionId,this.feature.id)?c("revoke","Revoke Access"):c("enable","Allow Access")}renderTableData(t,e){const n=this._register(e.render(this.manifest)),i=this._register(new $);n.onDidChange&&this._register(n.onDidChange(r=>{S(t),i.value=this.renderTable(r,t)})),i.value=this.renderTable(n.data,t)}renderTable(t,e){const n=new T;return m(e,a("table",void 0,a("tr",void 0,...t.headers.map(i=>a("th",void 0,i))),...t.rows.map(i=>a("tr",void 0,...i.map(r=>{if(typeof r=="string")return a("td",void 0,r);const o=Array.isArray(r)?r:[r];return a("td",void 0,...o.map(s=>{const l=[];if(A(r)){const u=a("",void 0);this.renderMarkdown(r,u),l.push(u)}else if(s instanceof te){const u=a("");n.add(new K(u,ie,ce)).set(s),l.push(u)}else s instanceof F&&(l.push(a("span",{class:"colorBox",style:"background-color: "+F.Format.CSS.format(s)},"")),l.push(a("code",void 0,F.Format.CSS.formatHex(s))));return l}).flat())}))))),n}renderMarkdownAndTableData(t,e){const n=this._register(e.render(this.manifest));n.onDidChange&&this._register(n.onDidChange(i=>{S(t),this.renderMarkdownAndTable(i,t)})),this.renderMarkdownAndTable(n.data,t)}renderMarkdownData(t,e){t.classList.add("markdown");const n=this._register(e.render(this.manifest));n.onDidChange&&this._register(n.onDidChange(i=>{S(t),this.renderMarkdown(i,t)})),this.renderMarkdown(n.data,t)}renderMarkdown(t,e){const{element:n,dispose:i}=W({value:t.value,isTrusted:t.isTrusted,supportThemeIcons:!0},{actionHandler:{callback:r=>this.openerService.open(r,{allowCommands:!!t.isTrusted}).catch(Q),disposables:this._store}});this._register(ne(i)),m(e,n)}renderMarkdownAndTable(t,e){for(const n of t)if(A(n)){const i=a("",void 0);this.renderMarkdown(n,i),m(e,i)}else{const i=m(e,a("table"));this.renderTable(n,i)}}layout(t,e){this.layoutParticipants.forEach(n=>n.layout(t,e))}};E=b([p(3,de),p(4,_),p(5,k),p(6,se)],E);export{D as ExtensionFeaturesTab};
