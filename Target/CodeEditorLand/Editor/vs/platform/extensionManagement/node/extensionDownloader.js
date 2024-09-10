var I=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var S=(m,l,e,t)=>{for(var i=t>1?void 0:t?x(l,e):l,o=m.length-1,r;o>=0;o--)(r=m[o])&&(i=(t?r(l,e,i):r(i))||i);return t&&i&&I(l,e,i),i},c=(m,l)=>(e,t)=>l(e,t,m);import{Promises as E}from"../../../base/common/async.js";import{getErrorMessage as f}from"../../../base/common/errors.js";import{Disposable as P}from"../../../base/common/lifecycle.js";import{Schemas as D}from"../../../base/common/network.js";import{joinPath as v}from"../../../base/common/resources.js";import*as R from"../../../base/common/semver/semver.js";import{isBoolean as U}from"../../../base/common/types.js";import{generateUuid as p}from"../../../base/common/uuid.js";import{Promises as V}from"../../../base/node/pfs.js";import{buffer as b,CorruptZipMessage as G}from"../../../base/node/zip.js";import{IConfigurationService as M}from"../../configuration/common/configuration.js";import{INativeEnvironmentService as A}from"../../environment/common/environment.js";import{toExtensionManagementError as g}from"../common/abstractExtensionManagementService.js";import{ExtensionManagementError as C,ExtensionManagementErrorCode as y,IExtensionGalleryService as F}from"../common/extensionManagement.js";import{ExtensionKey as w,groupByExtension as L}from"../common/extensionManagementUtil.js";import{fromExtractError as $}from"./extensionManagementUtil.js";import{ExtensionSignatureVerificationCode as u,IExtensionSignatureVerificationService as N}from"./extensionSignatureVerificationService.js";import{IFileService as T}from"../../files/common/files.js";import{ILogService as W}from"../../log/common/log.js";import{ITelemetryService as Z}from"../../telemetry/common/telemetry.js";let h=class extends P{constructor(e,t,i,o,r,n,a){super();this.fileService=t;this.extensionGalleryService=i;this.configurationService=o;this.extensionSignatureVerificationService=r;this.telemetryService=n;this.logService=a;this.extensionsDownloadDir=e.extensionsDownloadLocation,this.cache=20,this.cleanUpPromise=this.cleanUp()}static SignatureArchiveExtension=".sigzip";extensionsDownloadDir;cache;cleanUpPromise;async download(e,t,i,o){await this.cleanUpPromise;const r=await this.downloadVSIX(e,t);let n=!1;if(i&&this.shouldVerifySignature(e)){let a;try{a=await this.downloadSignatureArchive(e)}catch(s){try{await this.delete(r)}catch(d){this.logService.error(d)}throw s}try{n=await this.extensionSignatureVerificationService.verify(e,r.fsPath,a.fsPath,o)}catch(s){if(n=s.code,n===u.PackageIsInvalidZip||n===u.SignatureArchiveIsInvalidZip){try{await this.delete(r)}catch(d){this.logService.error(d)}throw new C(G,y.CorruptZip)}}finally{try{await this.delete(a)}catch(s){this.logService.error(s)}}}return{location:r,verificationStatus:n}}shouldVerifySignature(e){if(!e.isSigned)return this.logService.info(`Extension is not signed: ${e.identifier.id}`),!1;const t=this.configurationService.getValue("extensions.verifySignature");return U(t)?t:!0}async downloadVSIX(e,t){try{const i=v(this.extensionsDownloadDir,this.getName(e)),o=await this.doDownload(e,"vsix",async()=>{await this.downloadFile(e,i,r=>this.extensionGalleryService.download(e,r,t));try{await this.validate(i.fsPath,"extension/package.json")}catch(r){try{await this.fileService.del(i)}catch(n){this.logService.warn(`Error while deleting: ${i.path}`,f(n))}throw r}},2);return o>1&&this.telemetryService.publicLog2("extensiongallery:downloadvsix:retry",{extensionId:e.identifier.id,attempts:o}),i}catch(i){throw g(i,y.Download)}}async downloadSignatureArchive(e){try{const t=v(this.extensionsDownloadDir,`.${p()}`),i=await this.doDownload(e,"sigzip",async()=>{await this.extensionGalleryService.downloadSignatureArchive(e,t);try{await this.validate(t.fsPath,".signature.p7s")}catch(o){try{await this.fileService.del(t)}catch(r){this.logService.warn(`Error while deleting: ${t.path}`,f(r))}throw o}},2);return i>1&&this.telemetryService.publicLog2("extensiongallery:downloadsigzip:retry",{extensionId:e.identifier.id,attempts:i}),t}catch(t){throw g(t,y.DownloadSignature)}}async downloadFile(e,t,i){if(await this.fileService.exists(t))return;if(t.scheme!==D.file){await i(t);return}const o=v(this.extensionsDownloadDir,`.${p()}`);try{await i(o)}catch(r){try{await this.fileService.del(o)}catch{}throw r}try{await V.rename(o.fsPath,t.fsPath,2*60*1e3)}catch(r){try{await this.fileService.del(o)}catch{}let n=!1;try{n=await this.fileService.exists(t)}catch{}if(n)this.logService.info("Rename failed because the file was downloaded by another source. So ignoring renaming.",e.identifier.id,t.path);else throw this.logService.info(`Rename failed because of ${f(r)}. Deleted the file from downloaded location`,o.path),r}}async doDownload(e,t,i,o){let r=1;for(;;)try{return await i(),r}catch(n){if(r++>o)throw n;this.logService.warn(`Failed downloading ${t}. ${f(n)}. Retry again...`,e.identifier.id)}}async validate(e,t){try{await b(e,t)}catch(i){throw $(i)}}async delete(e){await this.cleanUpPromise,await this.fileService.del(e)}async cleanUp(){try{if(!await this.fileService.exists(this.extensionsDownloadDir)){this.logService.trace("Extension VSIX downloads cache dir does not exist");return}const e=await this.fileService.resolve(this.extensionsDownloadDir,{resolveMetadata:!0});if(e.children){const t=[],i=[],o=[];for(const a of e.children)if(a.name.endsWith(h.SignatureArchiveExtension))o.push(a.resource);else{const s=w.parse(a.name);s&&i.push([s,a])}const r=L(i,([a])=>a),n=[];for(const a of r)a.sort((s,d)=>R.rcompare(s[0].version,d[0].version)),t.push(...a.slice(1).map(s=>s[1].resource)),n.push(a[0][1]);n.sort((a,s)=>a.mtime-s.mtime),t.push(...n.slice(0,Math.max(0,n.length-this.cache)).map(a=>a.resource)),t.push(...o),await E.settled(t.map(a=>(this.logService.trace("Deleting from cache",a.path),this.fileService.del(a))))}}catch(e){this.logService.error(e)}}getName(e){return this.cache?w.create(e).toString().toLowerCase():p()}};h=S([c(0,A),c(1,T),c(2,F),c(3,M),c(4,N),c(5,Z),c(6,W)],h);export{h as ExtensionsDownloader};
