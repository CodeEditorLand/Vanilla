var D=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var x=(d,e,i,r)=>{for(var t=r>1?void 0:r?P(e,i):e,s=d.length-1,o;s>=0;s--)(o=d[s])&&(t=(r?o(e,i,t):o(t))||t);return r&&t&&D(e,i,t),t},c=(d,e)=>(i,r)=>e(i,r,d);import{Event as F}from"../../../../base/common/event.js";import{IWorkspaceContextService as L}from"../../../../platform/workspace/common/workspace.js";import{DisposableStore as A}from"../../../../base/common/lifecycle.js";import{SortOrder as b,LexicographicOptions as M}from"../common/files.js";import{ExplorerItem as v,ExplorerModel as H}from"../common/explorerModel.js";import{FileOperation as g,IFileService as U,FileChangeType as R}from"../../../../platform/files/common/files.js";import{dirname as E,basename as T}from"../../../../base/common/resources.js";import{IConfigurationService as V}from"../../../../platform/configuration/common/configuration.js";import{IClipboardService as W}from"../../../../platform/clipboard/common/clipboardService.js";import{IEditorService as N}from"../../../services/editor/common/editorService.js";import{IUriIdentityService as k}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IBulkEditService as _}from"../../../../editor/browser/services/bulkEditService.js";import{UndoRedoSource as B}from"../../../../platform/undoRedo/common/undoRedo.js";import{IProgressService as G,ProgressLocation as C}from"../../../../platform/progress/common/progress.js";import{CancellationTokenSource as q}from"../../../../base/common/cancellation.js";import{RunOnceScheduler as Y}from"../../../../base/common/async.js";import{IHostService as X}from"../../../services/host/browser/host.js";import{ResourceGlobMatcher as j}from"../../../common/resources.js";import{IFilesConfigurationService as z}from"../../../services/filesConfiguration/common/filesConfigurationService.js";import{ITelemetryService as J}from"../../../../platform/telemetry/common/telemetry.js";const K=new B;let m=class{constructor(e,i,r,t,s,o,l,u,n,p,I){this.fileService=e;this.configurationService=i;this.contextService=r;this.clipboardService=t;this.editorService=s;this.uriIdentityService=o;this.bulkEditService=l;this.progressService=u;this.filesConfigurationService=p;this.telemetryService=I;this.config=this.configurationService.getValue("explorer"),this.model=new H(this.contextService,this.uriIdentityService,this.fileService,this.configurationService,this.filesConfigurationService),this.disposables.add(this.model),this.disposables.add(this.fileService.onDidRunOperation(a=>this.onDidRunOperation(a))),this.onFileChangesScheduler=new Y(async()=>{const a=this.fileChangeEvents;this.fileChangeEvents=[];const h=[R.DELETED];this.config.sortOrder===b.Modified&&h.push(R.UPDATED);let f=!1;this.roots.forEach(S=>{this.view&&!f&&(f=O(S,this.view,a,h))}),a.forEach(S=>{if(!f)for(const w of S.rawAdded){const y=this.model.findClosest(E(w));if(y&&!y.getChild(T(w))){f=!0;break}}}),f&&await this.refresh(!1)},m.EXPLORER_FILE_CHANGES_REACT_DELAY),this.disposables.add(this.fileService.onDidFilesChange(a=>{this.fileChangeEvents.push(a),!this.editable&&(this.onFileChangesScheduler.isScheduled()||this.onFileChangesScheduler.schedule())})),this.disposables.add(this.configurationService.onDidChangeConfiguration(a=>this.onConfigurationUpdated(a))),this.disposables.add(F.any(this.fileService.onDidChangeFileSystemProviderRegistrations,this.fileService.onDidChangeFileSystemProviderCapabilities)(async a=>{let h=!1;this.model.roots.forEach(f=>{f.resource.scheme===a.scheme&&(h=!0,f.forgetChildren())}),h&&this.view&&await this.view.setTreeInput()})),this.disposables.add(this.model.onDidChangeRoots(()=>{this.view?.setTreeInput()})),this.disposables.add(n.onDidChangeFocus(a=>{a&&this.refresh(!1)})),this.revealExcludeMatcher=new j(a=>Q(i.getValue({resource:a})),a=>a.affectsConfiguration("explorer.autoRevealExclude"),r,i),this.disposables.add(this.revealExcludeMatcher)}static EXPLORER_FILE_CHANGES_REACT_DELAY=500;disposables=new A;editable;config;cutItems;view;model;onFileChangesScheduler;fileChangeEvents=[];revealExcludeMatcher;get roots(){return this.model.roots}get sortOrderConfiguration(){return{sortOrder:this.config.sortOrder,lexicographicOptions:this.config.sortOrderLexicographicOptions,reverse:this.config.sortOrderReverse}}registerView(e){this.view=e}getContext(e,i=!1){if(!this.view)return[];const r=new Set(this.view.getContext(e));return r.forEach(t=>{try{if(e&&!i&&this.view?.isItemCollapsed(t)&&t.nestedChildren)for(const s of t.nestedChildren)r.add(s)}catch{return}}),[...r]}async applyBulkEdit(e,i){const r=new q,t=i.progressLocation??C.Window;let s;t===C.Window?s={location:t,title:i.progressLabel,cancellable:e.length>1}:s={location:t,title:i.progressLabel,cancellable:e.length>1,delay:500};const o=this.progressService.withProgress(s,async l=>{await this.bulkEditService.apply(e,{undoRedoSource:K,label:i.undoLabel,code:"undoredo.explorerOperation",progress:l,token:r.token,confirmBeforeUndo:i.confirmBeforeUndo})},()=>r.cancel());await this.progressService.withProgress({location:C.Explorer,delay:500},()=>o),r.dispose()}hasViewFocus(){return!!this.view&&this.view.hasFocus()}findClosest(e){return this.model.findClosest(e)}findClosestRoot(e){const i=this.model.roots.filter(r=>this.uriIdentityService.extUri.isEqualOrParent(e,r.resource)).sort((r,t)=>t.resource.path.length-r.resource.path.length);return i.length?i[0]:null}async setEditable(e,i){if(!this.view)return;i?this.editable={stat:e,data:i}:this.editable=void 0;const r=this.isEditable(e);try{await this.view.setEditable(e,r)}catch{const t=e.parent,s={parentIsDirectory:t?.isDirectory,isDirectory:e.isDirectory,isReadonly:!!e.isReadonly,parentIsReadonly:!!t?.isReadonly,parentIsExcluded:t?.isExcluded,isExcluded:e.isExcluded,parentIsRoot:t?.isRoot,isRoot:e.isRoot,parentHasNests:t?.hasNests,hasNests:e.hasNests};this.telemetryService.publicLogError2("explorerView.setEditableError",s);return}!this.editable&&this.fileChangeEvents.length&&!this.onFileChangesScheduler.isScheduled()&&this.onFileChangesScheduler.schedule()}async setToCopy(e,i){const r=this.cutItems;this.cutItems=i?e:void 0,await this.clipboardService.writeResources(e.map(t=>t.resource)),this.view?.itemsCopied(e,i,r)}isCut(e){return!!this.cutItems&&this.cutItems.some(i=>this.uriIdentityService.extUri.isEqual(i.resource,e.resource))}getEditable(){return this.editable}getEditableData(e){return this.editable&&this.editable.stat===e?this.editable.data:void 0}isEditable(e){return!!this.editable&&(this.editable.stat===e||!e)}async select(e,i){if(!this.view)return;const r=i==="force",t=this.findClosest(e);if(t)return this.shouldAutoRevealItem(t,r)?(await this.view.selectResource(t.resource,i),Promise.resolve(void 0)):void 0;const s={resolveTo:[e],resolveMetadata:this.config.sortOrder===b.Modified},o=this.findClosestRoot(e);if(o)try{const l=await this.fileService.resolve(o.resource,s),u=v.create(this.fileService,this.configurationService,this.filesConfigurationService,l,void 0,s.resolveTo);v.mergeLocalWithDisk(u,o);const n=o.find(e);if(await this.view.refresh(!0,o),n&&!this.shouldAutoRevealItem(n,r))return;await this.view.selectResource(n?n.resource:void 0,i)}catch(l){o.error=l,await this.view.refresh(!1,o)}}async refresh(e=!0){if(this.model.roots.forEach(i=>i.forgetChildren()),this.view){await this.view.refresh(!0);const i=this.editorService.activeEditor?.resource,r=this.configurationService.getValue().explorer.autoReveal;e&&i&&r&&this.select(i,r)}}async onDidRunOperation(e){const i=this.config.fileNesting.enabled;if(e.isOperation(g.CREATE)||e.isOperation(g.COPY)){const r=e.target,t=E(r.resource),s=this.model.findAll(t);s.length&&await Promise.all(s.map(async o=>{const l=this.config.sortOrder==="modified";if(!o.isDirectoryResolved){const n=await this.fileService.resolve(o.resource,{resolveMetadata:l});if(n){const p=v.create(this.fileService,this.configurationService,this.filesConfigurationService,n,o.parent);v.mergeLocalWithDisk(p,o)}}const u=v.create(this.fileService,this.configurationService,this.filesConfigurationService,r,o.parent);o.removeChild(u),o.addChild(u),await this.view?.refresh(i,o)}))}else if(e.isOperation(g.MOVE)){const r=e.resource,t=e.target,s=E(r),o=E(t.resource),l=this.model.findAll(r);if(l.every(n=>!n.nestedParent)&&this.uriIdentityService.extUri.isEqual(s,o))await Promise.all(l.map(async n=>{n.rename(t),await this.view?.refresh(i,n.parent)}));else{const n=this.model.findAll(o);n.length&&l.length&&await Promise.all(l.map(async(p,I)=>{const a=p.parent,h=p.nestedParent;p.move(n[I]),h&&await this.view?.refresh(!1,h),await this.view?.refresh(!1,a),await this.view?.refresh(i,n[I])}))}}else if(e.isOperation(g.DELETE)){const r=this.model.findAll(e.resource);await Promise.all(r.map(async t=>{if(t.parent){const s=t.parent;s.removeChild(t),this.view?.focusNext();const o=t.nestedParent;o&&(o.removeChild(t),await this.view?.refresh(!1,o)),await this.view?.refresh(i,s),this.view?.getFocus().length===0&&this.view?.focusLast()}}))}}shouldAutoRevealItem(e,i){if(e===void 0||i)return!0;if(this.revealExcludeMatcher.matches(e.resource,s=>!!(e.parent&&e.parent.getChild(s))))return!1;const r=e.root;let t=e.parent;for(;t!==r;){if(t===void 0)return!0;if(this.revealExcludeMatcher.matches(t.resource))return!1;t=t.parent}return!0}async onConfigurationUpdated(e){if(!e.affectsConfiguration("explorer"))return;let i=!1;e.affectsConfiguration("explorer.fileNesting")&&(i=!0);const r=this.configurationService.getValue(),t=r?.explorer?.sortOrder||b.Default;this.config.sortOrder!==t&&(i=this.config.sortOrder!==void 0);const s=r?.explorer?.sortOrderLexicographicOptions||M.Default;this.config.sortOrderLexicographicOptions!==s&&(i=i||this.config.sortOrderLexicographicOptions!==void 0);const o=r?.explorer?.sortOrderReverse||!1;this.config.sortOrderReverse!==o&&(i=i||this.config.sortOrderReverse!==void 0),this.config=r.explorer,i&&await this.refresh()}dispose(){this.disposables.dispose()}};m=x([c(0,U),c(1,V),c(2,L),c(3,W),c(4,N),c(5,k),c(6,_),c(7,G),c(8,X),c(9,z),c(10,J)],m);function O(d,e,i,r){for(const[t,s]of d.children)if(e.isItemVisible(s)&&(i.some(o=>o.contains(s.resource,...r))||s.isDirectory&&s.isDirectoryResolved&&O(s,e,i,r)))return!0;return!1}function Q(d){const e=d&&d.explorer&&d.explorer.autoRevealExclude;return e||{}}export{m as ExplorerService,K as UNDO_REDO_SOURCE};
