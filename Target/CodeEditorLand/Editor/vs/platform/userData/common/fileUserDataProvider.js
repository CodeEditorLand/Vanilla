import{Emitter as a}from"../../../base/common/event.js";import{Disposable as l,toDisposable as m}from"../../../base/common/lifecycle.js";import{FileSystemProviderCapabilities as n,hasFileFolderCopyCapability as d,hasFileCloneCapability as h}from"../../files/common/files.js";import{TernarySearchTree as c}from"../../../base/common/ternarySearchTree.js";import{ResourceSet as y}from"../../../base/common/map.js";class ee extends l{constructor(e,i,t,r,s,S){super();this.fileSystemScheme=e;this.fileSystemProvider=i;this.userDataScheme=t;this.userDataProfilesService=r;this.uriIdentityService=s;this.logService=S;this.updateAtomicReadWritesResources(),this._register(r.onDidChangeProfiles(()=>this.updateAtomicReadWritesResources())),this._register(this.fileSystemProvider.onDidChangeFile(o=>this.handleFileChanges(o)))}capabilities=this.fileSystemProvider.capabilities;onDidChangeCapabilities=this.fileSystemProvider.onDidChangeCapabilities;_onDidChangeFile=this._register(new a);onDidChangeFile=this._onDidChangeFile.event;watchResources=c.forUris(()=>!(this.capabilities&n.PathCaseSensitive));atomicReadWriteResources=new y(e=>this.uriIdentityService.extUri.getComparisonKey(this.toFileSystemResource(e)));updateAtomicReadWritesResources(){this.atomicReadWriteResources.clear();for(const e of this.userDataProfilesService.profiles)this.atomicReadWriteResources.add(e.settingsResource),this.atomicReadWriteResources.add(e.keybindingsResource),this.atomicReadWriteResources.add(e.tasksResource),this.atomicReadWriteResources.add(e.extensionsResource)}open(e,i){return this.fileSystemProvider.open(this.toFileSystemResource(e),i)}close(e){return this.fileSystemProvider.close(e)}read(e,i,t,r,s){return this.fileSystemProvider.read(e,i,t,r,s)}write(e,i,t,r,s){return this.fileSystemProvider.write(e,i,t,r,s)}watch(e,i){this.watchResources.set(e,e);const t=this.fileSystemProvider.watch(this.toFileSystemResource(e),i);return m(()=>{this.watchResources.delete(e),t.dispose()})}stat(e){return this.fileSystemProvider.stat(this.toFileSystemResource(e))}mkdir(e){return this.fileSystemProvider.mkdir(this.toFileSystemResource(e))}rename(e,i,t){return this.fileSystemProvider.rename(this.toFileSystemResource(e),this.toFileSystemResource(i),t)}readFile(e,i){return this.fileSystemProvider.readFile(this.toFileSystemResource(e),i)}readFileStream(e,i,t){return this.fileSystemProvider.readFileStream(this.toFileSystemResource(e),i,t)}readdir(e){return this.fileSystemProvider.readdir(this.toFileSystemResource(e))}enforceAtomicReadFile(e){return this.atomicReadWriteResources.has(e)}writeFile(e,i,t){return this.fileSystemProvider.writeFile(this.toFileSystemResource(e),i,t)}enforceAtomicWriteFile(e){return this.atomicReadWriteResources.has(e)?{postfix:".vsctmp"}:!1}delete(e,i){return this.fileSystemProvider.delete(this.toFileSystemResource(e),i)}copy(e,i,t){if(d(this.fileSystemProvider))return this.fileSystemProvider.copy(this.toFileSystemResource(e),this.toFileSystemResource(i),t);throw new Error("copy not supported")}cloneFile(e,i){if(h(this.fileSystemProvider))return this.fileSystemProvider.cloneFile(this.toFileSystemResource(e),this.toFileSystemResource(i));throw new Error("clone not supported")}handleFileChanges(e){const i=[];for(const t of e){if(t.resource.scheme!==this.fileSystemScheme)continue;const r=this.toUserDataResource(t.resource);this.watchResources.findSubstr(r)&&i.push({resource:r,type:t.type,cId:t.cId})}i.length&&(this.logService.debug("User data changed"),this._onDidChangeFile.fire(i))}toFileSystemResource(e){return e.with({scheme:this.fileSystemScheme})}toUserDataResource(e){return e.with({scheme:this.userDataScheme})}}export{ee as FileUserDataProvider};
