var F=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var x=(s,e,r,i)=>{for(var t=i>1?void 0:i?q(e,r):e,o=s.length-1,n;o>=0;o--)(n=s[o])&&(t=(i?n(e,r,t):n(t))||t);return i&&t&&F(e,r,t),t},c=(s,e)=>(r,i)=>e(r,i,s);import{Barrier as L}from"../../../base/common/async.js";import{URI as a}from"../../../base/common/uri.js";import{Event as N,Emitter as l}from"../../../base/common/event.js";import{observableValue as v,observableValueOpts as C,transaction as Q}from"../../../base/common/observable.js";import{DisposableStore as A,combinedDisposable as W,dispose as P,Disposable as j}from"../../../base/common/lifecycle.js";import{ISCMService as J,ISCMViewService as z}from"../../contrib/scm/common/scm.js";import{ExtHostContext as K,MainContext as X}from"../common/extHost.protocol.js";import"../../../editor/common/languages.js";import{extHostNamedCustomer as Y}from"../../services/extensions/common/extHostCustomers.js";import{CancellationToken as f}from"../../../base/common/cancellation.js";import{MarshalledId as S}from"../../../base/common/marshallingIds.js";import{ThemeIcon as M}from"../../../base/common/themables.js";import"../../../base/common/htmlContent.js";import{IQuickDiffService as Z}from"../../contrib/scm/common/quickDiff.js";import"../../contrib/scm/common/history.js";import{ResourceTree as ee}from"../../../base/common/resourceTree.js";import{IUriIdentityService as re}from"../../../platform/uriIdentity/common/uriIdentity.js";import{IWorkspaceContextService as ie}from"../../../platform/workspace/common/workspace.js";import{basename as te}from"../../../base/common/resources.js";import{ILanguageService as oe}from"../../../editor/common/languages/language.js";import{IModelService as se}from"../../../editor/common/services/model.js";import{ITextModelService as ne}from"../../../editor/common/services/resolverService.js";import{Schemas as ae}from"../../../base/common/network.js";import"../../../editor/common/model.js";import{structuralEquals as _}from"../../../base/common/equals.js";import{historyItemBaseRefColor as de,historyItemRefColor as ue,historyItemRemoteRefColor as pe}from"../../contrib/scm/browser/scmHistory.js";import"../../../platform/theme/common/colorUtils.js";function R(s){if(s!==void 0){if(a.isUri(s))return a.revive(s);if(M.isThemeIcon(s))return s;{const e=s;return{light:a.revive(e.light),dark:a.revive(e.dark)}}}}function ce(s){const e=s.references?.map(t=>({...t,icon:R(t.icon)})),r=s.message.indexOf(`
`),i=r===-1?s.message:`${s.message.substring(0,r)}\u2026`;return{...s,subject:i,references:e}}function h(s,e){return s?{...s,icon:R(s.icon),color:e}:void 0}class me extends j{constructor(r,i,t){super();this.modelService=i;this.languageService=t;this._register(r.registerTextModelContentProvider(ae.vscodeSourceControl,this))}async provideTextContent(r){const i=this.modelService.getModel(r);return i||this.modelService.createModel("",this.languageService.createById("scminput"),r)}}class he{constructor(e,r,i,t,o,n,p,d){this.sourceControlHandle=e;this.handle=r;this.provider=i;this.features=t;this.label=o;this.id=n;this.multiDiffEditorEnableViewChanges=p;this._uriIdentService=d}resources=[];_resourceTree;get resourceTree(){if(!this._resourceTree){const e=this.provider.rootUri??a.file("/");this._resourceTree=new ee(this,e,this._uriIdentService.extUri);for(const r of this.resources)this._resourceTree.add(r.sourceUri,r)}return this._resourceTree}_onDidChange=new l;onDidChange=this._onDidChange.event;_onDidChangeResources=new l;onDidChangeResources=this._onDidChangeResources.event;get hideWhenEmpty(){return!!this.features.hideWhenEmpty}toJSON(){return{$mid:S.ScmResourceGroup,sourceControlHandle:this.sourceControlHandle,groupHandle:this.handle}}splice(e,r,i){this.resources.splice(e,r,...i),this._resourceTree=void 0,this._onDidChangeResources.fire()}$updateGroup(e){this.features={...this.features,...e},this._onDidChange.fire()}$updateGroupLabel(e){this.label=e,this._onDidChange.fire()}}class le{constructor(e,r,i,t,o,n,p,d,m,u,D){this.proxy=e;this.sourceControlHandle=r;this.groupHandle=i;this.handle=t;this.sourceUri=o;this.resourceGroup=n;this.decorations=p;this.contextValue=d;this.command=m;this.multiDiffEditorOriginalUri=u;this.multiDiffEditorModifiedUri=D}open(e){return this.proxy.$executeResourceCommand(this.sourceControlHandle,this.groupHandle,this.handle,e)}toJSON(){return{$mid:S.ScmResource,sourceControlHandle:this.sourceControlHandle,groupHandle:this.groupHandle,handle:this.handle}}}class ve{constructor(e,r){this.proxy=e;this.handle=r}_historyItemRef=C({owner:this,equalsFn:_},void 0);get historyItemRef(){return this._historyItemRef}_historyItemRemoteRef=C({owner:this,equalsFn:_},void 0);get historyItemRemoteRef(){return this._historyItemRemoteRef}_historyItemBaseRef=C({owner:this,equalsFn:_},void 0);get historyItemBaseRef(){return this._historyItemBaseRef}_historyItemRefChanges=v(this,{added:[],modified:[],removed:[],silent:!1});get historyItemRefChanges(){return this._historyItemRefChanges}async resolveHistoryItemRefsCommonAncestor(e){return this.proxy.$resolveHistoryItemRefsCommonAncestor(this.handle,e,f.None)}async provideHistoryItemRefs(){return(await this.proxy.$provideHistoryItemRefs(this.handle,f.None))?.map(r=>({...r,icon:R(r.icon)}))}async provideHistoryItems(e){return(await this.proxy.$provideHistoryItems(this.handle,e,f.None))?.map(i=>ce(i))}async provideHistoryItemChanges(e,r){return(await this.proxy.$provideHistoryItemChanges(this.handle,e,r,f.None))?.map(t=>({uri:a.revive(t.uri),originalUri:t.originalUri&&a.revive(t.originalUri),modifiedUri:t.modifiedUri&&a.revive(t.modifiedUri),renameUri:t.renameUri&&a.revive(t.renameUri)}))}$onDidChangeCurrentHistoryItemRefs(e,r,i){Q(t=>{this._historyItemRef.set(h(e,ue),t),this._historyItemRemoteRef.set(h(r,pe),t),this._historyItemBaseRef.set(h(i,de),t)})}$onDidChangeHistoryItemRefs(e){const r=e.added.map(o=>h(o)),i=e.modified.map(o=>h(o)),t=e.removed.map(o=>h(o));this._historyItemRefChanges.set({added:r,modified:i,removed:t,silent:e.silent},void 0)}}class b{constructor(e,r,i,t,o,n,p,d,m){this.proxy=e;this._handle=r;this._providerId=i;this._label=t;this._rootUri=o;this._inputBoxTextModel=n;this._quickDiffService=p;this._uriIdentService=d;this._workspaceContextService=m;if(o){const u=this._workspaceContextService.getWorkspaceFolder(o);u?.uri.toString()===o.toString()?this._name=u.name:o.path!=="/"&&(this._name=te(o))}}static ID_HANDLE=0;_id=`scm${b.ID_HANDLE++}`;get id(){return this._id}groups=[];_onDidChangeResourceGroups=new l;onDidChangeResourceGroups=this._onDidChangeResourceGroups.event;_onDidChangeResources=new l;onDidChangeResources=this._onDidChangeResources.event;_groupsByHandle=Object.create(null);features={};get handle(){return this._handle}get label(){return this._label}get rootUri(){return this._rootUri}get inputBoxTextModel(){return this._inputBoxTextModel}get contextValue(){return this._providerId}get acceptInputCommand(){return this.features.acceptInputCommand}get actionButton(){return this.features.actionButton??void 0}_count=v(this,void 0);get count(){return this._count}_statusBarCommands=v(this,void 0);get statusBarCommands(){return this._statusBarCommands}_name;get name(){return this._name??this._label}_commitTemplate=v(this,"");get commitTemplate(){return this._commitTemplate}_onDidChange=new l;onDidChange=this._onDidChange.event;_quickDiff;isSCM=!0;_historyProvider=v(this,void 0);get historyProvider(){return this._historyProvider}$updateSourceControl(e){if(this.features={...this.features,...e},this._onDidChange.fire(),typeof e.commitTemplate<"u"&&this._commitTemplate.set(e.commitTemplate,void 0),typeof e.count<"u"&&this._count.set(e.count,void 0),typeof e.statusBarCommands<"u"&&this._statusBarCommands.set(e.statusBarCommands,void 0),e.hasQuickDiffProvider&&!this._quickDiff?this._quickDiff=this._quickDiffService.addQuickDiffProvider({label:e.quickDiffLabel??this.label,rootUri:this.rootUri,isSCM:this.isSCM,getOriginalResource:r=>this.getOriginalResource(r)}):e.hasQuickDiffProvider===!1&&this._quickDiff&&(this._quickDiff.dispose(),this._quickDiff=void 0),e.hasHistoryProvider&&!this.historyProvider.get()){const r=new ve(this.proxy,this.handle);this._historyProvider.set(r,void 0)}else e.hasHistoryProvider===!1&&this.historyProvider.get()&&this._historyProvider.set(void 0,void 0)}$registerGroups(e){const r=e.map(([i,t,o,n,p])=>{const d=new he(this.handle,i,this,n,o,t,p,this._uriIdentService);return this._groupsByHandle[i]=d,d});this.groups.splice(this.groups.length,0,...r),this._onDidChangeResourceGroups.fire()}$updateGroup(e,r){const i=this._groupsByHandle[e];i&&i.$updateGroup(r)}$updateGroupLabel(e,r){const i=this._groupsByHandle[e];i&&i.$updateGroupLabel(r)}$spliceGroupResourceStates(e){for(const[r,i]of e){const t=this._groupsByHandle[r];if(t){i.reverse();for(const[o,n,p]of i){const d=p.map(m=>{const[u,D,w,$,T,B,U,G,k,E]=m,[g,I]=w,H=M.isThemeIcon(g)?g:a.revive(g),V=(M.isThemeIcon(I)?I:a.revive(I))||H,O={icon:H,iconDark:V,tooltip:$,strikeThrough:T,faded:B};return new le(this.proxy,this.handle,r,u,a.revive(D),t,O,U||void 0,G,a.revive(k),a.revive(E))});t.splice(o,n,d)}}}this._onDidChangeResources.fire()}$unregisterGroup(e){const r=this._groupsByHandle[e];r&&(delete this._groupsByHandle[e],this.groups.splice(this.groups.indexOf(r),1),this._onDidChangeResourceGroups.fire())}async getOriginalResource(e){if(!this.features.hasQuickDiffProvider)return null;const r=await this.proxy.$provideOriginalResource(this.handle,e,f.None);return r&&a.revive(r)}$onDidChangeHistoryProviderCurrentHistoryItemRefs(e,r,i){this.historyProvider.get()&&this._historyProvider.get()?.$onDidChangeCurrentHistoryItemRefs(e,r,i)}$onDidChangeHistoryProviderHistoryItemRefs(e){this.historyProvider.get()&&this._historyProvider.get()?.$onDidChangeHistoryItemRefs(e)}toJSON(){return{$mid:S.ScmProvider,handle:this.handle}}dispose(){this._quickDiff?.dispose()}}let y=class{constructor(e,r,i,t,o,n,p,d,m){this.scmService=r;this.scmViewService=i;this.languageService=t;this.modelService=o;this.textModelService=n;this.quickDiffService=p;this._uriIdentService=d;this.workspaceContextService=m;this._proxy=e.getProxy(K.ExtHostSCM),this._disposables.add(new me(this.textModelService,this.modelService,this.languageService))}_proxy;_repositories=new Map;_repositoryBarriers=new Map;_repositoryDisposables=new Map;_disposables=new A;dispose(){P(this._repositories.values()),this._repositories.clear(),P(this._repositoryDisposables.values()),this._repositoryDisposables.clear(),this._disposables.dispose()}async $registerSourceControl(e,r,i,t,o){this._repositoryBarriers.set(e,new L);const n=await this.textModelService.createModelReference(a.revive(o)),p=new b(this._proxy,e,r,i,t?a.revive(t):void 0,n.object.textEditorModel,this.quickDiffService,this._uriIdentService,this.workspaceContextService),d=this.scmService.registerSCMProvider(p);this._repositories.set(e,d);const m=W(n,N.filter(this.scmViewService.onDidFocusRepository,u=>u===d)(u=>this._proxy.$setSelectedSourceControl(e)),d.input.onDidChange(({value:u})=>this._proxy.$onInputBoxValueChange(e,u)));this._repositoryDisposables.set(e,m),this.scmViewService.focusedRepository===d&&setTimeout(()=>this._proxy.$setSelectedSourceControl(e),0),d.input.value&&setTimeout(()=>this._proxy.$onInputBoxValueChange(e,d.input.value),0),this._repositoryBarriers.get(e)?.open()}async $updateSourceControl(e,r){await this._repositoryBarriers.get(e)?.wait();const i=this._repositories.get(e);if(!i)return;i.provider.$updateSourceControl(r)}async $unregisterSourceControl(e){await this._repositoryBarriers.get(e)?.wait();const r=this._repositories.get(e);r&&(this._repositoryDisposables.get(e).dispose(),this._repositoryDisposables.delete(e),r.dispose(),this._repositories.delete(e))}async $registerGroups(e,r,i){await this._repositoryBarriers.get(e)?.wait();const t=this._repositories.get(e);if(!t)return;const o=t.provider;o.$registerGroups(r),o.$spliceGroupResourceStates(i)}async $updateGroup(e,r,i){await this._repositoryBarriers.get(e)?.wait();const t=this._repositories.get(e);if(!t)return;t.provider.$updateGroup(r,i)}async $updateGroupLabel(e,r,i){await this._repositoryBarriers.get(e)?.wait();const t=this._repositories.get(e);if(!t)return;t.provider.$updateGroupLabel(r,i)}async $spliceResourceStates(e,r){await this._repositoryBarriers.get(e)?.wait();const i=this._repositories.get(e);if(!i)return;i.provider.$spliceGroupResourceStates(r)}async $unregisterGroup(e,r){await this._repositoryBarriers.get(e)?.wait();const i=this._repositories.get(e);if(!i)return;i.provider.$unregisterGroup(r)}async $setInputBoxValue(e,r){await this._repositoryBarriers.get(e)?.wait();const i=this._repositories.get(e);i&&i.input.setValue(r,!1)}async $setInputBoxPlaceholder(e,r){await this._repositoryBarriers.get(e)?.wait();const i=this._repositories.get(e);i&&(i.input.placeholder=r)}async $setInputBoxEnablement(e,r){await this._repositoryBarriers.get(e)?.wait();const i=this._repositories.get(e);i&&(i.input.enabled=r)}async $setInputBoxVisibility(e,r){await this._repositoryBarriers.get(e)?.wait();const i=this._repositories.get(e);i&&(i.input.visible=r)}async $showValidationMessage(e,r,i){await this._repositoryBarriers.get(e)?.wait();const t=this._repositories.get(e);t&&t.input.showValidationMessage(r,i)}async $setValidationProviderIsEnabled(e,r){await this._repositoryBarriers.get(e)?.wait();const i=this._repositories.get(e);i&&(r?i.input.validateInput=async(t,o)=>{const n=await this._proxy.$validateInput(e,t,o);return n&&{message:n[0],type:n[1]}}:i.input.validateInput=async()=>{})}async $onDidChangeHistoryProviderCurrentHistoryItemRefs(e,r,i,t){await this._repositoryBarriers.get(e)?.wait();const o=this._repositories.get(e);if(!o)return;o.provider.$onDidChangeHistoryProviderCurrentHistoryItemRefs(r,i,t)}async $onDidChangeHistoryProviderHistoryItemRefs(e,r){await this._repositoryBarriers.get(e)?.wait();const i=this._repositories.get(e);if(!i)return;i.provider.$onDidChangeHistoryProviderHistoryItemRefs(r)}};y=x([Y(X.MainThreadSCM),c(1,J),c(2,z),c(3,oe),c(4,se),c(5,ne),c(6,Z),c(7,re),c(8,ie)],y);export{y as MainThreadSCM};
