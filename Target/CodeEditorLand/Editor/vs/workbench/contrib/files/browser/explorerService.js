var D=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var x=(d,e,t,r)=>{for(var i=r>1?void 0:r?P(e,t):e,s=d.length-1,o;s>=0;s--)(o=d[s])&&(i=(r?o(e,t,i):o(i))||i);return r&&i&&D(e,t,i),i},c=(d,e)=>(t,r)=>e(t,r,d);import{RunOnceScheduler as F}from"../../../../base/common/async.js";import{CancellationTokenSource as L}from"../../../../base/common/cancellation.js";import{Event as A}from"../../../../base/common/event.js";import{DisposableStore as M}from"../../../../base/common/lifecycle.js";import{basename as H,dirname as g}from"../../../../base/common/resources.js";import{IBulkEditService as U}from"../../../../editor/browser/services/bulkEditService.js";import{IClipboardService as T}from"../../../../platform/clipboard/common/clipboardService.js";import{IConfigurationService as V}from"../../../../platform/configuration/common/configuration.js";import{FileChangeType as R,FileOperation as E,IFileService as W}from"../../../../platform/files/common/files.js";import{IProgressService as N,ProgressLocation as y}from"../../../../platform/progress/common/progress.js";import{ITelemetryService as k}from"../../../../platform/telemetry/common/telemetry.js";import{UndoRedoSource as _}from"../../../../platform/undoRedo/common/undoRedo.js";import{IUriIdentityService as B}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{IWorkspaceContextService as j}from"../../../../platform/workspace/common/workspace.js";import{ResourceGlobMatcher as G}from"../../../common/resources.js";import{IEditorService as q}from"../../../services/editor/common/editorService.js";import{IFilesConfigurationService as Y}from"../../../services/filesConfiguration/common/filesConfigurationService.js";import{IHostService as X}from"../../../services/host/browser/host.js";import{ExplorerItem as v,ExplorerModel as z}from"../common/explorerModel.js";import{LexicographicOptions as J,SortOrder as S}from"../common/files.js";const K=new _;let m=class{constructor(e,t,r,i,s,o,l,u,n,p,I){this.fileService=e;this.configurationService=t;this.contextService=r;this.clipboardService=i;this.editorService=s;this.uriIdentityService=o;this.bulkEditService=l;this.progressService=u;this.filesConfigurationService=p;this.telemetryService=I;this.config=this.configurationService.getValue("explorer"),this.model=new z(this.contextService,this.uriIdentityService,this.fileService,this.configurationService,this.filesConfigurationService),this.disposables.add(this.model),this.disposables.add(this.fileService.onDidRunOperation(a=>this.onDidRunOperation(a))),this.onFileChangesScheduler=new F(async()=>{const a=this.fileChangeEvents;this.fileChangeEvents=[];const h=[R.DELETED];this.config.sortOrder===S.Modified&&h.push(R.UPDATED);let f=!1;this.roots.forEach(b=>{this.view&&!f&&(f=O(b,this.view,a,h))}),a.forEach(b=>{if(!f)for(const w of b.rawAdded){const C=this.model.findClosest(g(w));if(C&&!C.getChild(H(w))){f=!0;break}}}),f&&await this.refresh(!1)},m.EXPLORER_FILE_CHANGES_REACT_DELAY),this.disposables.add(this.fileService.onDidFilesChange(a=>{this.fileChangeEvents.push(a),!this.editable&&(this.onFileChangesScheduler.isScheduled()||this.onFileChangesScheduler.schedule())})),this.disposables.add(this.configurationService.onDidChangeConfiguration(a=>this.onConfigurationUpdated(a))),this.disposables.add(A.any(this.fileService.onDidChangeFileSystemProviderRegistrations,this.fileService.onDidChangeFileSystemProviderCapabilities)(async a=>{let h=!1;this.model.roots.forEach(f=>{f.resource.scheme===a.scheme&&(h=!0,f.forgetChildren())}),h&&this.view&&await this.view.setTreeInput()})),this.disposables.add(this.model.onDidChangeRoots(()=>{this.view?.setTreeInput()})),this.disposables.add(n.onDidChangeFocus(a=>{a&&this.refresh(!1)})),this.revealExcludeMatcher=new G(a=>Q(t.getValue({resource:a})),a=>a.affectsConfiguration("explorer.autoRevealExclude"),r,t),this.disposables.add(this.revealExcludeMatcher)}static EXPLORER_FILE_CHANGES_REACT_DELAY=500;disposables=new M;editable;config;cutItems;view;model;onFileChangesScheduler;fileChangeEvents=[];revealExcludeMatcher;get roots(){return this.model.roots}get sortOrderConfiguration(){return{sortOrder:this.config.sortOrder,lexicographicOptions:this.config.sortOrderLexicographicOptions,reverse:this.config.sortOrderReverse}}registerView(e){this.view=e}getContext(e,t=!1){if(!this.view)return[];const r=new Set(this.view.getContext(e));return r.forEach(i=>{try{if(e&&!t&&this.view?.isItemCollapsed(i)&&i.nestedChildren)for(const s of i.nestedChildren)r.add(s)}catch{return}}),[...r]}async applyBulkEdit(e,t){const r=new L,i=t.progressLocation??y.Window;let s;i===y.Window?s={location:i,title:t.progressLabel,cancellable:e.length>1}:s={location:i,title:t.progressLabel,cancellable:e.length>1,delay:500};const o=this.progressService.withProgress(s,async l=>{await this.bulkEditService.apply(e,{undoRedoSource:K,label:t.undoLabel,code:"undoredo.explorerOperation",progress:l,token:r.token,confirmBeforeUndo:t.confirmBeforeUndo})},()=>r.cancel());await this.progressService.withProgress({location:y.Explorer,delay:500},()=>o),r.dispose()}hasViewFocus(){return!!this.view&&this.view.hasFocus()}findClosest(e){return this.model.findClosest(e)}findClosestRoot(e){const t=this.model.roots.filter(r=>this.uriIdentityService.extUri.isEqualOrParent(e,r.resource)).sort((r,i)=>i.resource.path.length-r.resource.path.length);return t.length?t[0]:null}async setEditable(e,t){if(!this.view)return;t?this.editable={stat:e,data:t}:this.editable=void 0;const r=this.isEditable(e);try{await this.view.setEditable(e,r)}catch{const i=e.parent,s={parentIsDirectory:i?.isDirectory,isDirectory:e.isDirectory,isReadonly:!!e.isReadonly,parentIsReadonly:!!i?.isReadonly,parentIsExcluded:i?.isExcluded,isExcluded:e.isExcluded,parentIsRoot:i?.isRoot,isRoot:e.isRoot,parentHasNests:i?.hasNests,hasNests:e.hasNests};this.telemetryService.publicLogError2("explorerView.setEditableError",s);return}!this.editable&&this.fileChangeEvents.length&&!this.onFileChangesScheduler.isScheduled()&&this.onFileChangesScheduler.schedule()}async setToCopy(e,t){const r=this.cutItems;this.cutItems=t?e:void 0,await this.clipboardService.writeResources(e.map(i=>i.resource)),this.view?.itemsCopied(e,t,r)}isCut(e){return!!this.cutItems&&this.cutItems.some(t=>this.uriIdentityService.extUri.isEqual(t.resource,e.resource))}getEditable(){return this.editable}getEditableData(e){return this.editable&&this.editable.stat===e?this.editable.data:void 0}isEditable(e){return!!this.editable&&(this.editable.stat===e||!e)}async select(e,t){if(!this.view)return;const r=t==="force",i=this.findClosest(e);if(i)return this.shouldAutoRevealItem(i,r)?(await this.view.selectResource(i.resource,t),Promise.resolve(void 0)):void 0;const s={resolveTo:[e],resolveMetadata:this.config.sortOrder===S.Modified},o=this.findClosestRoot(e);if(o)try{const l=await this.fileService.resolve(o.resource,s),u=v.create(this.fileService,this.configurationService,this.filesConfigurationService,l,void 0,s.resolveTo);v.mergeLocalWithDisk(u,o);const n=o.find(e);if(await this.view.refresh(!0,o),n&&!this.shouldAutoRevealItem(n,r))return;await this.view.selectResource(n?n.resource:void 0,t)}catch(l){o.error=l,await this.view.refresh(!1,o)}}async refresh(e=!0){if(this.model.roots.forEach(t=>t.forgetChildren()),this.view){await this.view.refresh(!0);const t=this.editorService.activeEditor?.resource,r=this.configurationService.getValue().explorer.autoReveal;e&&t&&r&&this.select(t,r)}}async onDidRunOperation(e){const t=this.config.fileNesting.enabled;if(e.isOperation(E.CREATE)||e.isOperation(E.COPY)){const r=e.target,i=g(r.resource),s=this.model.findAll(i);s.length&&await Promise.all(s.map(async o=>{const l=this.config.sortOrder==="modified";if(!o.isDirectoryResolved){const n=await this.fileService.resolve(o.resource,{resolveMetadata:l});if(n){const p=v.create(this.fileService,this.configurationService,this.filesConfigurationService,n,o.parent);v.mergeLocalWithDisk(p,o)}}const u=v.create(this.fileService,this.configurationService,this.filesConfigurationService,r,o.parent);o.removeChild(u),o.addChild(u),await this.view?.refresh(t,o)}))}else if(e.isOperation(E.MOVE)){const r=e.resource,i=e.target,s=g(r),o=g(i.resource),l=this.model.findAll(r);if(l.every(n=>!n.nestedParent)&&this.uriIdentityService.extUri.isEqual(s,o))await Promise.all(l.map(async n=>{n.rename(i),await this.view?.refresh(t,n.parent)}));else{const n=this.model.findAll(o);n.length&&l.length&&await Promise.all(l.map(async(p,I)=>{const a=p.parent,h=p.nestedParent;p.move(n[I]),h&&await this.view?.refresh(!1,h),await this.view?.refresh(!1,a),await this.view?.refresh(t,n[I])}))}}else if(e.isOperation(E.DELETE)){const r=this.model.findAll(e.resource);await Promise.all(r.map(async i=>{if(i.parent){const s=i.parent;s.removeChild(i),this.view?.focusNext();const o=i.nestedParent;o&&(o.removeChild(i),await this.view?.refresh(!1,o)),await this.view?.refresh(t,s),this.view?.getFocus().length===0&&this.view?.focusLast()}}))}}shouldAutoRevealItem(e,t){if(e===void 0||t)return!0;if(this.revealExcludeMatcher.matches(e.resource,s=>!!(e.parent&&e.parent.getChild(s))))return!1;const r=e.root;let i=e.parent;for(;i!==r;){if(i===void 0)return!0;if(this.revealExcludeMatcher.matches(i.resource))return!1;i=i.parent}return!0}async onConfigurationUpdated(e){if(!e.affectsConfiguration("explorer"))return;let t=!1;e.affectsConfiguration("explorer.fileNesting")&&(t=!0);const r=this.configurationService.getValue(),i=r?.explorer?.sortOrder||S.Default;this.config.sortOrder!==i&&(t=this.config.sortOrder!==void 0);const s=r?.explorer?.sortOrderLexicographicOptions||J.Default;this.config.sortOrderLexicographicOptions!==s&&(t=t||this.config.sortOrderLexicographicOptions!==void 0);const o=r?.explorer?.sortOrderReverse||!1;this.config.sortOrderReverse!==o&&(t=t||this.config.sortOrderReverse!==void 0),this.config=r.explorer,t&&await this.refresh()}dispose(){this.disposables.dispose()}};m=x([c(0,W),c(1,V),c(2,j),c(3,T),c(4,q),c(5,B),c(6,U),c(7,N),c(8,X),c(9,Y),c(10,k)],m);function O(d,e,t,r){for(const[i,s]of d.children)if(e.isItemVisible(s)&&(t.some(o=>o.contains(s.resource,...r))||s.isDirectory&&s.isDirectoryResolved&&O(s,e,t,r)))return!0;return!1}function Q(d){const e=d&&d.explorer&&d.explorer.autoRevealExclude;return e||{}}export{m as ExplorerService,K as UNDO_REDO_SOURCE};
