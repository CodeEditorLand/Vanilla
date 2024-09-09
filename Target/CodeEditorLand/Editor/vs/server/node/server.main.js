import*as p from"os";import*as a from"fs";import"net";import{FileAccess as m}from"../../base/common/network.js";import{run as d}from"./remoteExtensionHostAgentCli.js";import{createServer as l}from"./remoteExtensionHostAgentServer.js";import{parseArgs as f}from"../../platform/environment/node/argv.js";import{join as e,dirname as E}from"../../base/common/path.js";import{performance as O}from"perf_hooks";import{serverOptions as c}from"./serverEnvironmentService.js";import S from"../../platform/product/common/product.js";import*as A from"../../base/common/performance.js";A.mark("code/server/codeLoaded"),global.vscodeServerCodeLoadedTime=O.now();const _={onMultipleValues:(r,n)=>{console.error(`Option '${r}' can only be defined once. Using value ${n}.`)},onEmptyValue:r=>{console.error(`Ignoring option '${r}': Value must not be empty.`)},onUnknownOption:r=>{console.error(`Ignoring option '${r}': not supported for server.`)},onDeprecatedOption:(r,n)=>{console.warn(`Option '${r}' is deprecated: ${n}`)}},o=f(process.argv.slice(2),c,_),t=o["server-data-dir"]||process.env.VSCODE_AGENT_FOLDER||e(p.homedir(),S.serverDataFolderName||".vscode-remote"),s=e(t,"data"),i=e(s,"User"),g=e(i,"globalStorage"),u=e(i,"History"),v=e(s,"Machine");o["user-data-dir"]=s;const T=E(m.asFileUri("").fsPath),I=e(T,"extensions");o["builtin-extensions-dir"]=I,o["extensions-dir"]=o["extensions-dir"]||e(t,"extensions"),[t,o["extensions-dir"],s,i,v,g,u].forEach(r=>{try{a.existsSync(r)||a.mkdirSync(r,{mode:448})}catch(n){console.error(n)}});function U(){d(o,t,c)}function $(r){return l(r,o,t)}export{$ as createServer,U as spawnCli};
