import"../../../vs/base/common/event.js";import{delimiter as m,posix as a}from"../../../vs/base/common/path.js";import{URI as i}from"../../../vs/base/common/uri.js";import"../../../vs/base/common/uriIpc.js";import"../../../vs/platform/files/common/files.js";import"../../../vs/platform/files/common/watcher.js";import{DiskFileSystemProvider as c}from"../../../vs/platform/files/node/diskFileSystemProvider.js";import{AbstractDiskFileSystemProviderChannel as f,AbstractSessionFileWatcher as l}from"../../../vs/platform/files/node/diskFileSystemProviderServer.js";import"../../../vs/platform/log/common/log.js";import"../../../vs/platform/remote/common/remoteAgentEnvironment.js";import"../../../vs/server/node/serverEnvironmentService.js";import{createURITransformer as v}from"../../../vs/workbench/api/node/uriTransformer.js";class L extends f{constructor(r,e){super(new c(r),r);this.environmentService=e;this._register(this.provider)}uriTransformerCache=new Map;getUriTransformer(r){let e=this.uriTransformerCache.get(r.remoteAuthority);return e||(e=v(r.remoteAuthority),this.uriTransformerCache.set(r.remoteAuthority,e)),e}transformIncoming(r,e,n=!1){if(n&&e.path==="/vscode-resource"&&e.query){const o=JSON.parse(e.query).requestResourcePath;return i.from({scheme:"file",path:o})}return i.revive(r.transformIncoming(e))}createSessionFileWatcher(r,e){return new p(r,e,this.logService,this.environmentService)}}class p extends l{constructor(t,r,e,n){super(t,r,e,n)}getRecursiveWatcherOptions(t){const r=t.args["file-watcher-polling"];if(r){const e=r.split(m),n=Number(e[0]);if(n>0)return{usePolling:e.length>1?e.slice(1):!0,pollingInterval:n}}}getExtraExcludes(t){if(t.extensionsPath)return[a.join(t.extensionsPath,"**")]}}export{L as RemoteAgentFileSystemProviderChannel};
