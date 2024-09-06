var d=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var a=(t,e,r,i)=>{for(var o=i>1?void 0:i?c(e,r):e,n=t.length-1,m;n>=0;n--)(m=t[n])&&(o=(i?m(e,r,o):m(o))||o);return i&&o&&d(e,r,o),o},l=(t,e)=>(r,i)=>e(r,i,t);import{Schemas as v}from"../../../base/common/network.js";import{isLinux as p}from"../../../base/common/platform.js";import{FilePermission as y}from"../../../platform/files/common/files.js";import{DiskFileSystemProvider as u}from"../../../platform/files/node/diskFileSystemProvider.js";import{ILogService as h}from"../../../platform/log/common/log.js";import{IExtHostConsumerFileSystem as f}from"../common/extHostFileSystemConsumer.js";let s=class{constructor(e,r){e.addFileSystemProvider(v.file,new w(r),{isCaseSensitive:p})}};s=a([l(0,f),l(1,h)],s);class w{constructor(e){this.logService=e}impl=new u(this.logService);async stat(e){const r=await this.impl.stat(e);return{type:r.type,ctime:r.ctime,mtime:r.mtime,size:r.size,permissions:r.permissions===y.Readonly?1:void 0}}readDirectory(e){return this.impl.readdir(e)}createDirectory(e){return this.impl.mkdir(e)}readFile(e){return this.impl.readFile(e)}writeFile(e,r,i){return this.impl.writeFile(e,r,{...i,unlock:!1,atomic:!1})}delete(e,r){return this.impl.delete(e,{...r,useTrash:!1,atomic:!1})}rename(e,r,i){return this.impl.rename(e,r,i)}copy(e,r,i){return this.impl.copy(e,r,i)}get onDidChangeFile(){throw new Error("Method not implemented.")}watch(e,r){throw new Error("Method not implemented.")}}export{s as ExtHostDiskFileSystemProvider};
