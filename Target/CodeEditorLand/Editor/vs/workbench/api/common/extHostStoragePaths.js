var m=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var l=(o,e,t,r)=>{for(var i=r>1?void 0:r?p(e,t):e,c=o.length-1,d;c>=0;c--)(d=o[c])&&(i=(r?d(e,t,i):d(i))||i);return r&&i&&m(e,t,i),i},a=(o,e)=>(t,r)=>e(t,r,o);import{URI as n}from"../../../../vs/base/common/uri.js";import"../../../../vs/platform/extensions/common/extensions.js";import{createDecorator as u}from"../../../../vs/platform/instantiation/common/instantiation.js";import{ILogService as v}from"../../../../vs/platform/log/common/log.js";import{IExtHostConsumerFileSystem as h}from"../../../../vs/workbench/api/common/extHostFileSystemConsumer.js";import{IExtHostInitDataService as g}from"../../../../vs/workbench/api/common/extHostInitDataService.js";import"../../../../vs/workbench/services/extensions/common/extensionHostProtocol.js";const P=u("IExtensionStoragePaths");let s=class{constructor(e,t,r){this._logService=t;this._extHostFileSystem=r;this._workspace=e.workspace??void 0,this._environment=e.environment,this.whenReady=this._getOrCreateWorkspaceStoragePath().then(i=>this._value=i)}_serviceBrand;_workspace;_environment;whenReady;_value;async _getWorkspaceStorageURI(e){return n.joinPath(this._environment.workspaceStorageHome,e)}async _getOrCreateWorkspaceStoragePath(){if(!this._workspace)return Promise.resolve(void 0);const e=this._workspace.id,t=await this._getWorkspaceStorageURI(e);try{return await this._extHostFileSystem.value.stat(t),this._logService.trace("[ExtHostStorage] storage dir already exists",t),t}catch{}try{return this._logService.trace("[ExtHostStorage] creating dir and metadata-file",t),await this._extHostFileSystem.value.createDirectory(t),await this._extHostFileSystem.value.writeFile(n.joinPath(t,"meta.json"),new TextEncoder().encode(JSON.stringify({id:this._workspace.id,configuration:n.revive(this._workspace.configuration)?.toString(),name:this._workspace.name},void 0,2))),t}catch(r){this._logService.error("[ExtHostStorage]",r);return}}workspaceValue(e){if(this._value)return n.joinPath(this._value,e.identifier.value)}globalValue(e){return n.joinPath(this._environment.globalStorageHome,e.identifier.value.toLowerCase())}onWillDeactivateAll(){}};s=l([a(0,g),a(1,v),a(2,h)],s);export{s as ExtensionStoragePaths,P as IExtensionStoragePaths};
