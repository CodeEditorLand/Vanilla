import{shell as I}from"electron";import{toErrorMessage as s}from"../../../../vs/base/common/errorMessage.js";import"../../../../vs/base/common/event.js";import"../../../../vs/base/common/lifecycle.js";import{basename as m,normalize as v}from"../../../../vs/base/common/path.js";import{isWindows as h}from"../../../../vs/base/common/platform.js";import{URI as d}from"../../../../vs/base/common/uri.js";import{DefaultURITransformer as F}from"../../../../vs/base/common/uriIpc.js";import{localize as a}from"../../../../vs/nls.js";import"../../../../vs/platform/environment/common/environment.js";import{createFileSystemProviderError as c,FileSystemProviderErrorCode as l}from"../../../../vs/platform/files/common/files.js";import"../../../../vs/platform/files/node/diskFileSystemProvider.js";import{AbstractDiskFileSystemProviderChannel as S,AbstractSessionFileWatcher as u}from"../../../../vs/platform/files/node/diskFileSystemProviderServer.js";import"../../../../vs/platform/log/common/log.js";class N extends S{constructor(r,e,o){super(r,e);this.environmentService=o}getUriTransformer(r){return F}transformIncoming(r,e){return d.revive(e)}async delete(r,e,o){if(!o.useTrash)return super.delete(r,e,o);const f=this.transformIncoming(r,e),t=v(f.fsPath);try{await I.trashItem(t)}catch(n){throw c(h?a("binFailed","Failed to move '{0}' to the recycle bin ({1})",m(t),s(n)):a("trashFailed","Failed to move '{0}' to the trash ({1})",m(t),s(n)),l.Unknown)}}createSessionFileWatcher(r,e){return new U(r,e,this.logService,this.environmentService)}}class U extends u{watch(i,r,e){if(e.recursive)throw c("Recursive file watching is not supported from main process for performance reasons.",l.Unavailable);return super.watch(i,r,e)}}export{N as DiskFileSystemProviderChannel};