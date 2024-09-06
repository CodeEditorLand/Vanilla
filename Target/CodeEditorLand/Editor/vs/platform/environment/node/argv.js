import x from"minimist";import{isWindows as v}from"../../../../vs/base/common/platform.js";import{localize as e}from"../../../../vs/nls.js";import"../../../../vs/platform/environment/common/argv.js";const k={o:e("optionsUpperCase","Options"),e:e("extensionsManagement","Extensions Management"),t:e("troubleshooting","Troubleshooting")},U=["tunnel","serve-web"],S={tunnel:{type:"subcommand",description:"Make the current machine accessible from vscode.dev or other machines through a secure tunnel",options:{"cli-data-dir":{type:"string",args:"dir",description:e("cliDataDir","Directory where CLI metadata should be stored.")},"disable-telemetry":{type:"boolean"},"telemetry-level":{type:"string"},user:{type:"subcommand",options:{login:{type:"subcommand",options:{provider:{type:"string"},"access-token":{type:"string"}}}}}}},"serve-web":{type:"subcommand",description:"Run a server that displays the editor UI in browsers.",options:{"cli-data-dir":{type:"string",args:"dir",description:e("cliDataDir","Directory where CLI metadata should be stored.")},"disable-telemetry":{type:"boolean"},"telemetry-level":{type:"string"}}},diff:{type:"boolean",cat:"o",alias:"d",args:["file","file"],description:e("diff","Compare two files with each other.")},merge:{type:"boolean",cat:"o",alias:"m",args:["path1","path2","base","result"],description:e("merge","Perform a three-way merge by providing paths for two modified versions of a file, the common origin of both modified versions and the output file to save merge results.")},add:{type:"boolean",cat:"o",alias:"a",args:"folder",description:e("add","Add folder(s) to the last active window.")},goto:{type:"boolean",cat:"o",alias:"g",args:"file:line[:character]",description:e("goto","Open a file at the path on the specified line and character position.")},"new-window":{type:"boolean",cat:"o",alias:"n",description:e("newWindow","Force to open a new window.")},"reuse-window":{type:"boolean",cat:"o",alias:"r",description:e("reuseWindow","Force to open a file or folder in an already opened window.")},wait:{type:"boolean",cat:"o",alias:"w",description:e("wait","Wait for the files to be closed before returning.")},waitMarkerFilePath:{type:"string"},locale:{type:"string",cat:"o",args:"locale",description:e("locale","The locale to use (e.g. en-US or zh-TW).")},"user-data-dir":{type:"string",cat:"o",args:"dir",description:e("userDataDir","Specifies the directory that user data is kept in. Can be used to open multiple distinct instances of Code.")},profile:{type:"string",cat:"o",args:"profileName",description:e("profileName","Opens the provided folder or workspace with the given profile and associates the profile with the workspace. If the profile does not exist, a new empty one is created.")},help:{type:"boolean",cat:"o",alias:"h",description:e("help","Print usage.")},"extensions-dir":{type:"string",deprecates:["extensionHomePath"],cat:"e",args:"dir",description:e("extensionHomePath","Set the root path for extensions.")},"extensions-download-dir":{type:"string"},"builtin-extensions-dir":{type:"string"},"list-extensions":{type:"boolean",cat:"e",description:e("listExtensions","List the installed extensions.")},"show-versions":{type:"boolean",cat:"e",description:e("showVersions","Show versions of installed extensions, when using --list-extensions.")},category:{type:"string",allowEmptyValue:!0,cat:"e",description:e("category","Filters installed extensions by provided category, when using --list-extensions."),args:"category"},"install-extension":{type:"string[]",cat:"e",args:"ext-id | path",description:e("installExtension","Installs or updates an extension. The argument is either an extension id or a path to a VSIX. The identifier of an extension is '${publisher}.${name}'. Use '--force' argument to update to latest version. To install a specific version provide '@${version}'. For example: 'vscode.csharp@1.2.3'.")},"pre-release":{type:"boolean",cat:"e",description:e("install prerelease","Installs the pre-release version of the extension, when using --install-extension")},"uninstall-extension":{type:"string[]",cat:"e",args:"ext-id",description:e("uninstallExtension","Uninstalls an extension.")},"update-extensions":{type:"boolean",cat:"e",description:e("updateExtensions","Update the installed extensions.")},"enable-proposed-api":{type:"string[]",allowEmptyValue:!0,cat:"e",args:"ext-id",description:e("experimentalApis","Enables proposed API features for extensions. Can receive one or more extension IDs to enable individually.")},version:{type:"boolean",cat:"t",alias:"v",description:e("version","Print version.")},verbose:{type:"boolean",cat:"t",global:!0,description:e("verbose","Print verbose output (implies --wait).")},log:{type:"string[]",cat:"t",args:"level",global:!0,description:e("log","Log level to use. Default is 'info'. Allowed values are 'critical', 'error', 'warn', 'info', 'debug', 'trace', 'off'. You can also configure the log level of an extension by passing extension id and log level in the following format: '${publisher}.${name}:${logLevel}'. For example: 'vscode.csharp:trace'. Can receive one or more such entries.")},status:{type:"boolean",alias:"s",cat:"t",description:e("status","Print process usage and diagnostics information.")},"prof-startup":{type:"boolean",cat:"t",description:e("prof-startup","Run CPU profiler during startup.")},"prof-append-timers":{type:"string"},"prof-duration-markers":{type:"string[]"},"prof-duration-markers-file":{type:"string"},"no-cached-data":{type:"boolean"},"prof-startup-prefix":{type:"string"},"prof-v8-extensions":{type:"boolean"},"disable-extensions":{type:"boolean",deprecates:["disableExtensions"],cat:"t",description:e("disableExtensions","Disable all installed extensions. This option is not persisted and is effective only when the command opens a new window.")},"disable-extension":{type:"string[]",cat:"t",args:"ext-id",description:e("disableExtension","Disable the provided extension. This option is not persisted and is effective only when the command opens a new window.")},sync:{type:"string",cat:"t",description:e("turn sync","Turn sync on or off."),args:["on | off"]},"inspect-extensions":{type:"string",allowEmptyValue:!0,deprecates:["debugPluginHost"],args:"port",cat:"t",description:e("inspect-extensions","Allow debugging and profiling of extensions. Check the developer tools for the connection URI.")},"inspect-brk-extensions":{type:"string",allowEmptyValue:!0,deprecates:["debugBrkPluginHost"],args:"port",cat:"t",description:e("inspect-brk-extensions","Allow debugging and profiling of extensions with the extension host being paused after start. Check the developer tools for the connection URI.")},"disable-lcd-text":{type:"boolean",cat:"t",description:e("disableLCDText","Disable LCD font rendering.")},"disable-gpu":{type:"boolean",cat:"t",description:e("disableGPU","Disable GPU hardware acceleration.")},"disable-chromium-sandbox":{type:"boolean",cat:"t",description:e("disableChromiumSandbox","Use this option only when there is requirement to launch the application as sudo user on Linux or when running as an elevated user in an applocker environment on Windows.")},sandbox:{type:"boolean"},telemetry:{type:"boolean",cat:"t",description:e("telemetry","Shows all telemetry events which VS code collects.")},remote:{type:"string",allowEmptyValue:!0},"folder-uri":{type:"string[]",cat:"o",args:"uri"},"file-uri":{type:"string[]",cat:"o",args:"uri"},"locate-extension":{type:"string[]"},extensionDevelopmentPath:{type:"string[]"},extensionDevelopmentKind:{type:"string[]"},extensionTestsPath:{type:"string"},extensionEnvironment:{type:"string"},debugId:{type:"string"},debugRenderer:{type:"boolean"},"inspect-ptyhost":{type:"string",allowEmptyValue:!0},"inspect-brk-ptyhost":{type:"string",allowEmptyValue:!0},"inspect-search":{type:"string",deprecates:["debugSearch"],allowEmptyValue:!0},"inspect-brk-search":{type:"string",deprecates:["debugBrkSearch"],allowEmptyValue:!0},"inspect-sharedprocess":{type:"string",allowEmptyValue:!0},"inspect-brk-sharedprocess":{type:"string",allowEmptyValue:!0},"export-default-configuration":{type:"string"},"install-source":{type:"string"},"enable-smoke-test-driver":{type:"boolean"},logExtensionHostCommunication:{type:"boolean"},"skip-release-notes":{type:"boolean"},"skip-welcome":{type:"boolean"},"disable-telemetry":{type:"boolean"},"disable-updates":{type:"boolean"},"use-inmemory-secretstorage":{type:"boolean",deprecates:["disable-keytar"]},"password-store":{type:"string"},"disable-workspace-trust":{type:"boolean"},"disable-crash-reporter":{type:"boolean"},"crash-reporter-directory":{type:"string"},"crash-reporter-id":{type:"string"},"skip-add-to-recently-opened":{type:"boolean"},"open-url":{type:"boolean"},"file-write":{type:"boolean"},"file-chmod":{type:"boolean"},"install-builtin-extension":{type:"string[]"},force:{type:"boolean"},"do-not-sync":{type:"boolean"},trace:{type:"boolean"},"trace-category-filter":{type:"string"},"trace-options":{type:"string"},"preserve-env":{type:"boolean"},"force-user-env":{type:"boolean"},"force-disable-user-env":{type:"boolean"},"open-devtools":{type:"boolean"},"disable-gpu-sandbox":{type:"boolean"},logsPath:{type:"string"},"__enable-file-policy":{type:"boolean"},editSessionId:{type:"string"},continueOn:{type:"string"},"locate-shell-integration-path":{type:"string",args:["bash","pwsh","zsh","fish"]},"enable-coi":{type:"boolean"},"no-proxy-server":{type:"boolean"},"no-sandbox":{type:"boolean",alias:"sandbox"},"proxy-server":{type:"string"},"proxy-bypass-list":{type:"string"},"proxy-pac-url":{type:"string"},"js-flags":{type:"string"},inspect:{type:"string",allowEmptyValue:!0},"inspect-brk":{type:"string",allowEmptyValue:!0},nolazy:{type:"boolean"},"force-device-scale-factor":{type:"string"},"force-renderer-accessibility":{type:"boolean"},"ignore-certificate-errors":{type:"boolean"},"allow-insecure-localhost":{type:"boolean"},"log-net-log":{type:"string"},vmodule:{type:"string"},_urls:{type:"string[]"},"disable-dev-shm-usage":{type:"boolean"},"profile-temp":{type:"boolean"},"ozone-platform":{type:"string"},"enable-tracing":{type:"string"},"trace-startup-format":{type:"string"},"trace-startup-file":{type:"string"},"trace-startup-duration":{type:"string"},_:{type:"string[]"}},O={onUnknownOption:()=>{},onMultipleValues:()=>{},onEmptyValue:()=>{},onDeprecatedOption:()=>{}};function E(o,s,r=O){const p=o.find(t=>t.length>0&&t[0]!=="-"),g={},u=["_"],y=[],i={};let d;for(const t in s){const n=s[t];n.type==="subcommand"?t===p&&(d=n):(n.alias&&(g[t]=n.alias),n.type==="string"||n.type==="string[]"?(u.push(t),n.deprecates&&u.push(...n.deprecates)):n.type==="boolean"&&(y.push(t),n.deprecates&&y.push(...n.deprecates)),n.global&&(i[t]=n))}if(d&&p){const t=i;for(const b in d.options)t[b]=d.options[b];const n=o.filter(b=>b!==p),l=r.getSubcommandReporter?r.getSubcommandReporter(p):void 0,f=E(n,t,l);return{[p]:f,_:[]}}const h=x(o,{string:u,boolean:y,alias:g}),c={},a=h;c._=h._.map(t=>String(t)).filter(t=>t.length>0),delete a._;for(const t in s){const n=s[t];if(n.type==="subcommand")continue;n.alias&&delete a[n.alias];let l=a[t];if(n.deprecates)for(const f of n.deprecates)a.hasOwnProperty(f)&&(l||(l=a[f],l&&r.onDeprecatedOption(f,n.deprecationMessage||e("deprecated.useInstead","Use {0} instead.",t))),delete a[f]);if(typeof l<"u"){if(n.type==="string[]"){if(Array.isArray(l)||(l=[l]),!n.allowEmptyValue){const f=l.filter(b=>b.length>0);f.length!==l.length&&(r.onEmptyValue(t),l=f.length>0?f:void 0)}}else n.type==="string"&&(Array.isArray(l)?(l=l.pop(),r.onMultipleValues(t,l)):!l&&!n.allowEmptyValue&&(r.onEmptyValue(t),l=void 0));c[t]=l,n.deprecationMessage&&r.onDeprecatedOption(t,n.deprecationMessage)}delete a[t]}for(const t in a)r.onUnknownOption(t);return c}function T(o,s){let r="";return s.args&&(Array.isArray(s.args)?r=` <${s.args.join("> <")}>`:r=` <${s.args}>`),s.alias?`-${s.alias} --${o}${r}`:`--${o}${r}`}function D(o,s){const r=[];for(const p in o){const g=o[p],u=T(p,g);r.push([u,g.description])}return m(r,s)}function m(o,s){const p=o.reduce((y,i)=>Math.max(y,i[0].length),12)+2+1;if(s-p<25)return o.reduce((y,i)=>y.concat([`  ${i[0]}`,`      ${i[1]}`]),[]);const g=s-p-1,u=[];for(const y of o){const i=y[0],d=P(y[1],g),h=w(p-i.length-2);u.push("  "+i+h+d[0]);for(let c=1;c<d.length;c++)u.push(w(p)+d[c])}return u}function w(o){return" ".repeat(o)}function P(o,s){const r=[];for(;o.length;){const p=o.length<s?o.length:o.lastIndexOf(" ",s),g=o.slice(0,p).trim();o=o.slice(p),r.push(g)}return r}function M(o,s,r,p,g){const u=process.stdout.isTTY&&process.stdout.columns||80,y=g?.noInputFiles!==!0?`[${e("paths","paths")}...]`:"",i=[`${o} ${r}`];i.push(""),i.push(`${e("usage","Usage")}: ${s} [${e("options","options")}]${y}`),i.push(""),g?.noPipe!==!0&&(v?i.push(e("stdinWindows","To read output from another program, append '-' (e.g. 'echo Hello World | {0} -')",s)):i.push(e("stdinUnix","To read from stdin, append '-' (e.g. 'ps aux | grep code | {0} -')",s)),i.push(""));const d={},h=[];for(const c in p){const a=p[c];if(a.type==="subcommand")a.description&&h.push({command:c,description:a.description});else if(a.description&&a.cat){let t=d[a.cat];t||(d[a.cat]=t={}),t[c]=a}}for(const c in d){const a=c,t=d[a];t&&(i.push(k[a]),i.push(...D(t,u)),i.push(""))}return h.length&&(i.push(e("subcommands","Subcommands")),i.push(...m(h.map(c=>[c.command,c.description]),u)),i.push("")),i.join(`
`)}function L(o,s){return`${o||e("unknownVersion","Unknown version")}
${s||e("unknownCommit","Unknown commit")}
${process.arch}`}export{U as NATIVE_CLI_COMMANDS,S as OPTIONS,M as buildHelpMessage,L as buildVersionMessage,D as formatOptions,E as parseArgs};
