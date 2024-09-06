import*as x from"child_process";import*as S from"fs";import*as T from"http";import*as O from"url";import{DeferredPromise as F}from"../../base/common/async.js";import{dirname as M,extname as L,join as U,resolve as I}from"../../base/common/path.js";import{cwd as N}from"../../base/common/process.js";import"../../platform/environment/common/argv.js";import{buildHelpMessage as V,buildVersionMessage as W,OPTIONS as A,parseArgs as j}from"../../platform/environment/node/argv.js";import{getStdinFilePath as q,hasStdinWithoutTty as H,readFromStdin as J}from"../../platform/environment/node/stdin.js";import{createWaitMarkerFileSync as z}from"../../platform/environment/node/wait.js";import"../../workbench/api/node/extHostCLIServer.js";const B=o=>{switch(o){case"user-data-dir":case"extensions-dir":case"export-default-configuration":case"install-source":case"enable-smoke-test-driver":case"extensions-download-dir":case"builtin-extensions-dir":case"telemetry":return!1;default:return!0}},K=o=>{switch(o){case"version":case"help":case"folder-uri":case"file-uri":case"add":case"diff":case"merge":case"wait":case"goto":case"reuse-window":case"new-window":case"status":case"install-extension":case"uninstall-extension":case"update-extensions":case"list-extensions":case"force":case"show-versions":case"category":case"verbose":case"remote":case"locate-shell-integration-path":return!0;default:return!1}},y=process.env.VSCODE_IPC_HOOK_CLI,g=process.env.VSCODE_CLIENT_COMMAND,X=process.env.VSCODE_CLIENT_COMMAND_CWD,C=process.env.VSCODE_CLI_AUTHORITY,Y=process.env.VSCODE_STDIN_FILE_PATH;async function Z(o,c){if(!y&&!g){console.log("Command is only available in WSL or inside a Visual Studio Code terminal.");return}const l={...A,gitCredential:{type:"string"},openExternal:{type:"boolean"}},i=g?B:K;for(const n in A){const t=n;i(t)||delete l[t]}y&&(l.openExternal={type:"boolean"});const e=j(c,l,{onMultipleValues:(n,t)=>{console.error(`Option '${n}' can only be defined once. Using value ${t}.`)},onEmptyValue:n=>{console.error(`Ignoring option '${n}': Value must not be empty.`)},onUnknownOption:n=>{console.error(`Ignoring option '${n}': not supported for ${o.executableName}.`)},onDeprecatedOption:(n,t)=>{console.warn(`Option '${n}' is deprecated: ${t}`)}}),a=C?oe:n=>n,s=!!e.verbose;if(e.help){console.log(V(o.productName,o.executableName,o.version,l));return}if(e.version){console.log(W(o.version,o.commit));return}if(e["locate-shell-integration-path"]){let n;switch(e["locate-shell-integration-path"]){case"bash":n="shellIntegration-bash.sh";break;case"pwsh":n="shellIntegration.ps1";break;case"zsh":n="shellIntegration-rc.zsh";break;case"fish":n="fish_xdg_data/fish/vendor_conf.d/shellIntegration.fish";break;default:throw new Error("Error using --locate-shell-integration-path: Invalid shell type")}console.log(I(__dirname,"../..","workbench","contrib","terminal","browser","media",n));return}if(y&&e.openExternal){ee(e._,s);return}let f=e.remote;(f==="local"||f==="false"||f==="")&&(f=null);const p=(e["folder-uri"]||[]).map(a);e["folder-uri"]=p;const m=(e["file-uri"]||[]).map(a);e["file-uri"]=m;const k=e._;let _=!1;for(const n of k)n==="-"?_=!0:$(n,a,p,m);e._=[];let E;if(_&&H())try{let n=Y;if(!n){n=q();const t=new F;await J(n,s,()=>t.complete()),e.wait||(E=t.p)}$(n,a,p,m),e["skip-add-to-recently-opened"]=!0,console.log(`Reading from stdin via: ${n}`)}catch(n){console.log(`Failed to create file to read via stdin: ${n.toString()}`)}e.extensionDevelopmentPath&&(e.extensionDevelopmentPath=e.extensionDevelopmentPath.map(n=>a(v(n).href))),e.extensionTestsPath&&(e.extensionTestsPath=a(v(e.extensionTestsPath).href));const b=e["crash-reporter-directory"];if(b!==void 0&&!b.match(/^([a-zA-Z]:[\\\/])/)){console.log(`The crash reporter directory '${b}' must be an absolute Windows path (e.g. c:/crashes)`);return}if(g){if(e["install-extension"]!==void 0||e["uninstall-extension"]!==void 0||e["list-extensions"]||e["update-extensions"]){const r=[];e["install-extension"]?.forEach(d=>r.push("--install-extension",d)),e["uninstall-extension"]?.forEach(d=>r.push("--uninstall-extension",d)),["list-extensions","force","show-versions","category"].forEach(d=>{const w=e[d];w!==void 0&&r.push(`--${d}=${w}`)}),e["update-extensions"]&&r.push("--update-extensions"),x.fork(U(__dirname,"../../../server-main.js"),r,{stdio:"inherit"}).on("error",d=>console.log(d));return}const n=[];for(const r in e){const u=e[r];if(typeof u=="boolean")u&&n.push("--"+r);else if(Array.isArray(u))for(const d of u)n.push(`--${r}=${d.toString()}`);else u&&n.push(`--${r}=${u.toString()}`)}f!==null&&n.push(`--remote=${f||C}`);const t=L(g);if(t===".bat"||t===".cmd"){const r=X||N();s&&console.log(`Invoking: cmd.exe /C ${g} ${n.join(" ")} in ${r}`),x.spawn("cmd.exe",["/C",g,...n],{stdio:"inherit",cwd:r})}else{const r=M(g),u={...process.env,ELECTRON_RUN_AS_NODE:"1"};if(n.unshift("resources/app/out/cli.js"),s&&console.log(`Invoking: cd "${r}" && ELECTRON_RUN_AS_NODE=1 "${g}" "${n.join('" "')}"`),G()){s&&console.log("Using pipes for output.");const d=x.spawn(g,n,{cwd:r,env:u,stdio:["inherit","pipe","pipe"]});d.stdout.on("data",w=>process.stdout.write(w)),d.stderr.on("data",w=>process.stderr.write(w))}else x.spawn(g,n,{cwd:r,env:u,stdio:"inherit"})}}else{if(e.status){P({type:"status"},s).then(t=>{console.log(t)}).catch(t=>{console.error("Error when requesting status:",t)});return}if(e["install-extension"]!==void 0||e["uninstall-extension"]!==void 0||e["list-extensions"]||e["update-extensions"]){P({type:"extensionManagement",list:e["list-extensions"]?{showVersions:e["show-versions"],category:e.category}:void 0,install:D(e["install-extension"]),uninstall:D(e["uninstall-extension"]),force:e.force},s).then(t=>{console.log(t)}).catch(t=>{console.error("Error when invoking the extension management command:",t)});return}let n;if(e.wait){if(!m.length){console.log("At least one file must be provided to wait for.");return}n=z(s)}P({type:"open",fileURIs:m,folderURIs:p,diffMode:e.diff,mergeMode:e.merge,addMode:e.add,gotoLineMode:e.goto,forceReuseWindow:e["reuse-window"],forceNewWindow:e["new-window"],waitMarkerFilePath:n,remoteAuthority:f},s).catch(t=>{console.error("Error when invoking the open command:",t)}),n&&Q(n),E&&await E}}function G(){if(process.env.WSL_DISTRO_NAME)try{return x.execSync("uname -r",{encoding:"utf8"}).includes("-microsoft-")}catch{}return!1}async function Q(o){for(;S.existsSync(o);)await new Promise(c=>setTimeout(c,1e3))}function ee(o,c){const l=[];for(const i of o)try{/^(http|https|file):\/\//.test(i)?l.push(O.parse(i).href):l.push(v(i).href)}catch{console.log(`Invalid url: ${i}`)}l.length&&P({type:"openExternal",uris:l},c).catch(i=>{console.error("Error when invoking the open external command:",i)})}function P(o,c){return c&&console.log(JSON.stringify(o,null,"  ")),new Promise((l,i)=>{const h=JSON.stringify(o);if(!y){console.log("Message "+h),l("");return}const e={socketPath:y,path:"/",method:"POST",headers:{"content-type":"application/json",accept:"application/json"}},a=T.request(e,s=>{if(s.headers["content-type"]!=="application/json"){i("Error in response: Invalid content type: Expected 'application/json', is: "+s.headers["content-type"]);return}const f=[];s.setEncoding("utf8"),s.on("data",p=>{f.push(p)}),s.on("error",p=>R("Error in response.",p)),s.on("end",()=>{const p=f.join("");try{const m=JSON.parse(p);s.statusCode===200?l(m):i(m)}catch{i("Error in response: Unable to parse response as JSON: "+p)}})});a.on("error",s=>R("Error in request.",s)),a.write(h),a.end()})}function D(o){return o?.map(c=>/\.vsix$/i.test(c)?v(c).href:c)}function R(o,c){console.error("Unable to connect to VS Code server: "+o),console.error(c),process.exit(1)}const ne=process.env.PWD||N();function v(o){return o=o.trim(),o=I(ne,o),O.pathToFileURL(o)}function $(o,c,l,i){const h=v(o),e=c(h.href);try{const a=S.lstatSync(S.realpathSync(o));a.isFile()?i.push(e):a.isDirectory()?l.push(e):o==="/dev/null"&&i.push(e)}catch(a){a.code==="ENOENT"?i.push(e):console.log(`Problem accessing file ${o}. Ignoring file`,a)}}function oe(o){return o.replace(/^file:\/\//,"vscode-remote://"+C)}const[,,te,se,re,ie,...ae]=process.argv;Z({productName:te,version:se,commit:re,executableName:ie},ae).then(null,o=>{console.error(o.message||o.stack||o)});export{Z as main};
