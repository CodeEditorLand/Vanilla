import{Queue as a}from"../../../../base/common/async.js";import{VSBuffer as c}from"../../../../base/common/buffer.js";import{joinPath as t}from"../../../../base/common/resources.js";import{FileOperationResult as s}from"../../../../platform/files/common/files.js";class l{constructor(e,i,r){this.donotCacheResourcesWithSchemes=e;this.fileService=r;this.cacheHome=i.cacheHome}cacheHome;cachedConfigurations=new Map;needsCaching(e){return!this.donotCacheResourcesWithSchemes.includes(e.scheme)}read(e){return this.getCachedConfiguration(e).read()}write(e,i){return this.getCachedConfiguration(e).save(i)}remove(e){return this.getCachedConfiguration(e).remove()}getCachedConfiguration({type:e,key:i}){const r=`${e}:${i}`;let o=this.cachedConfigurations.get(r);return o||(o=new u({type:e,key:i},this.cacheHome,this.fileService),this.cachedConfigurations.set(r,o)),o}}class u{constructor({type:e,key:i},r,o){this.fileService=o;this.cachedConfigurationFolderResource=t(r,"CachedConfigurations",e,i),this.cachedConfigurationFileResource=t(this.cachedConfigurationFolderResource,e==="workspaces"?"workspace.json":"configuration.json"),this.queue=new a}queue;cachedConfigurationFolderResource;cachedConfigurationFileResource;async read(){try{return(await this.fileService.readFile(this.cachedConfigurationFileResource)).value.toString()}catch{return""}}async save(e){await this.createCachedFolder()&&await this.queue.queue(async()=>{await this.fileService.writeFile(this.cachedConfigurationFileResource,c.fromString(e))})}async remove(){try{await this.queue.queue(()=>this.fileService.del(this.cachedConfigurationFolderResource,{recursive:!0,useTrash:!1}))}catch(e){if(e.fileOperationResult!==s.FILE_NOT_FOUND)throw e}}async createCachedFolder(){if(await this.fileService.exists(this.cachedConfigurationFolderResource))return!0;try{return await this.fileService.createFolder(this.cachedConfigurationFolderResource),!0}catch{return!1}}}export{l as ConfigurationCache};
