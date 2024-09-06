import"../../../../../vs/base/common/collections.js";import"../../../../../vs/base/common/jsonSchema.js";import*as D from"../../../../../vs/base/common/objects.js";import"../../../../../vs/base/common/parsers.js";import{Platform as M}from"../../../../../vs/base/common/platform.js";import*as T from"../../../../../vs/base/common/types.js";import"../../../../../vs/base/common/uri.js";import*as ce from"../../../../../vs/base/common/uuid.js";import*as S from"../../../../../vs/nls.js";import"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/workspace/common/workspace.js";import{isNamedProblemMatcher as ke,ProblemMatcherParser as se,ProblemMatcherRegistry as ge}from"../../../../../vs/workbench/contrib/tasks/common/problemMatcher.js";import{ProcessExecutionSupportedContext as Te,ShellExecutionSupportedContext as oe}from"../../../../../vs/workbench/contrib/tasks/common/taskService.js";import"../../../../../vs/workbench/services/configurationResolver/common/configurationResolver.js";import{TaskDefinitionRegistry as te}from"./taskDefinitionRegistry.js";import*as l from"./tasks.js";var he=(t=>(t[t.escape=1]="escape",t[t.strong=2]="strong",t[t.weak=3]="weak",t))(he||{}),ae;(a=>{function f(u){return u!==void 0&&T.isString(u.type)}a.is=f})(ae||={});var Ce;(a=>{function f(u){return T.isString(u)?u:T.isStringArray(u)?u.join(" "):T.isString(u.value)?u.value:u.value.join(" ")}a.value=f})(Ce||={});var Ie=(o=>(o[o.Unknown=0]="Unknown",o[o.String=1]="String",o[o.ProblemMatcher=2]="ProblemMatcher",o[o.Array=3]="Array",o))(Ie||{});const F=[];Object.freeze(F);function O(f,a,u){const t=a[u];t!==void 0&&(f[u]=t)}function v(f,a,u){const t=a[u];f[u]===void 0&&t!==void 0&&(f[u]=t)}function E(f,a,u=!1){if(f==null||a===void 0)return!0;for(const t of a){const o=f[t.property];if(o!=null){if(t.type!==void 0&&!t.type.isEmpty(o))return!1;if(!Array.isArray(o)||o.length>0||u)return!1}}return!0}function L(f,a,u){if(!a||E(a,u))return f;if(!f||E(f,u))return a;for(const t of u){const o=t.property;let r;t.type!==void 0?r=t.type.assignProperties(f[o],a[o]):r=a[o],r!=null&&(f[o]=r)}return f}function z(f,a,u,t=!1){if(!a||E(a,u))return f;if(!f||E(f,u,t))return a;for(const o of u){const r=o.property;let i;o.type?i=o.type.fillProperties(f[r],a[r]):f[r]===void 0&&(i=a[r]),i!=null&&(f[r]=i)}return f}function ue(f,a,u,t){if(f&&Object.isFrozen(f))return f;if(f==null||a===void 0||a===null)return a!=null?D.deepClone(a):void 0;for(const o of u){const r=o.property;if(f[r]!==void 0)continue;let i;o.type?i=o.type.fillDefaults(f[r],t):i=a[r],i!=null&&(f[r]=i)}return f}function J(f,a){if(f!=null){if(Object.isFrozen(f))return f;for(const u of a)if(u.type){const t=f[u.property];t&&u.type.freeze(t)}return Object.freeze(f),f}}var fe;(a=>{function f(u){if(!u)return l.RunOnOptions.default;switch(u.toLowerCase()){case"folderopen":return l.RunOnOptions.folderOpen;case"default":default:return l.RunOnOptions.default}}a.fromString=f})(fe||={});var G;(o=>{const f=[{property:"reevaluateOnRerun"},{property:"runOn"},{property:"instanceLimit"}];function a(r){return{reevaluateOnRerun:r?r.reevaluateOnRerun:!0,runOn:r?fe.fromString(r.runOn):l.RunOnOptions.default,instanceLimit:r?r.instanceLimit:1}}o.fromConfiguration=a;function u(r,i){return L(r,i,f)}o.assignProperties=u;function t(r,i){return z(r,i,f)}o.fillProperties=t})(G||={});var x;(d=>{const f=[{property:"executable"},{property:"args"},{property:"quoting"}];function a(n){const p=n;return p&&(T.isString(p.executable)||T.isStringArray(p.args))}d.is=a;function u(n,p){if(!a(n))return;const m={};return n.executable!==void 0&&(m.executable=n.executable),n.args!==void 0&&(m.args=n.args.slice()),n.quoting!==void 0&&(m.quoting=D.deepClone(n.quoting)),m}d.from=u;function t(n){return E(n,f,!0)}d.isEmpty=t;function o(n,p){return L(n,p,f)}d.assignProperties=o;function r(n,p){return z(n,p,f,!0)}d.fillProperties=r;function i(n,p){return n}d.fillDefaults=i;function e(n){if(n)return Object.freeze(n)}d.freeze=e})(x||={});var _;(d=>{const f=[{property:"cwd"},{property:"env"},{property:"shell",type:x}],a={cwd:"${workspaceFolder}"};function u(n,p){const m={};return n.cwd!==void 0&&(T.isString(n.cwd)?m.cwd=n.cwd:p.taskLoadIssues.push(S.localize("ConfigurationParser.invalidCWD",`Warning: options.cwd must be of type string. Ignoring value {0}
`,n.cwd))),n.env!==void 0&&(m.env=D.deepClone(n.env)),m.shell=x.from(n.shell,p),t(m)?void 0:m}d.from=u;function t(n){return E(n,f)}d.isEmpty=t;function o(n,p){if(p===void 0||t(p))return n;if(n===void 0||t(n))return p;if(O(n,p,"cwd"),n.env===void 0)n.env=p.env;else if(p.env!==void 0){const m=Object.create(null);n.env!==void 0&&Object.keys(n.env).forEach(k=>m[k]=n.env[k]),p.env!==void 0&&Object.keys(p.env).forEach(k=>m[k]=p.env[k]),n.env=m}return n.shell=x.assignProperties(n.shell,p.shell),n}d.assignProperties=o;function r(n,p){return z(n,p,f)}d.fillProperties=r;function i(n,p){return ue(n,a,f,p)}d.fillDefaults=i;function e(n){return J(n,f)}d.freeze=e})(_||={});var w;(k=>{let f;(B=>{const s=[{property:"echo"},{property:"reveal"},{property:"revealProblems"},{property:"focus"},{property:"panel"},{property:"showReuseMessage"},{property:"clear"},{property:"group"},{property:"close"}];function c(g,R){let N,j,H,X,Q,ee,ne,re,ie,A=!1;T.isBoolean(g.echoCommand)&&(N=g.echoCommand,A=!0),T.isString(g.showOutput)&&(j=l.RevealKind.fromString(g.showOutput),A=!0);const y=g.presentation||g.terminal;if(y&&(T.isBoolean(y.echo)&&(N=y.echo),T.isString(y.reveal)&&(j=l.RevealKind.fromString(y.reveal)),T.isString(y.revealProblems)&&(H=l.RevealProblemKind.fromString(y.revealProblems)),T.isBoolean(y.focus)&&(X=y.focus),T.isString(y.panel)&&(Q=l.PanelKind.fromString(y.panel)),T.isBoolean(y.showReuseMessage)&&(ee=y.showReuseMessage),T.isBoolean(y.clear)&&(ne=y.clear),T.isString(y.group)&&(re=y.group),T.isBoolean(y.close)&&(ie=y.close),A=!0),!!A)return{echo:N,reveal:j,revealProblems:H,focus:X,panel:Q,showReuseMessage:ee,clear:ne,group:re,close:ie}}B.from=c;function h(g,R){return L(g,R,s)}B.assignProperties=h;function C(g,R){return z(g,R,s)}B.fillProperties=C;function I(g,R){const N=R.engine===l.ExecutionEngine.Terminal;return ue(g,{echo:N,reveal:l.RevealKind.Always,revealProblems:l.RevealProblemKind.Never,focus:!1,panel:l.PanelKind.Shared,showReuseMessage:!0,clear:!1},s,R)}B.fillDefaults=I;function P(g){return J(g,s)}B.freeze=P;function b(g){return E(g,s)}B.isEmpty=b})(f=k.PresentationOptions||={});let a;(c=>{function s(h){if(h!=null){if(T.isString(h))return h;if(T.isStringArray(h))return h.join(" ");{const C=l.ShellQuoting.from(h.quoting),I=T.isString(h.value)?h.value:T.isStringArray(h.value)?h.value.join(" "):void 0;return I?{value:I,quoting:C}:void 0}}}c.from=s})(a||={});const u=[{property:"runtime"},{property:"name"},{property:"options",type:_},{property:"args"},{property:"taskSelector"},{property:"suppressTaskName"},{property:"presentation",type:f}];function t(s,c){let h=o(s,c),C;return s.windows&&c.platform===M.Windows?C=o(s.windows,c):s.osx&&c.platform===M.Mac?C=o(s.osx,c):s.linux&&c.platform===M.Linux&&(C=o(s.linux,c)),C&&(h=e(h,C,c.schemaVersion===l.JsonSchemaVersion.V2_0_0)),i(h)?void 0:h}k.from=t;function o(s,c){const h=a.from(s.command);let C;T.isString(s.type)&&(s.type==="shell"||s.type==="process")&&(C=l.RuntimeType.fromString(s.type)),T.isBoolean(s.isShellCommand)||x.is(s.isShellCommand)?C=l.RuntimeType.Shell:s.isShellCommand!==void 0&&(C=s.isShellCommand?l.RuntimeType.Shell:l.RuntimeType.Process);const I={name:h,runtime:C,presentation:f.from(s,c)};if(s.args!==void 0){I.args=[];for(const P of s.args){const b=a.from(P);b!==void 0?I.args.push(b):c.taskLoadIssues.push(S.localize("ConfigurationParser.inValidArg",`Error: command argument must either be a string or a quoted string. Provided value is:
{0}`,P?JSON.stringify(P,void 0,4):"undefined"))}}return s.options!==void 0&&(I.options=_.from(s.options,c),I.options&&I.options.shell===void 0&&x.is(s.isShellCommand)&&(I.options.shell=x.from(s.isShellCommand,c),c.engine!==l.ExecutionEngine.Terminal&&c.taskLoadIssues.push(S.localize("ConfigurationParser.noShell","Warning: shell configuration is only supported when executing tasks in the terminal.")))),T.isString(s.taskSelector)&&(I.taskSelector=s.taskSelector),T.isBoolean(s.suppressTaskName)&&(I.suppressTaskName=s.suppressTaskName),i(I)?void 0:I}function r(s){return s&&!!s.name}k.hasCommand=r;function i(s){return E(s,u)}k.isEmpty=i;function e(s,c,h){return i(c)?s:i(s)?c:(O(s,c,"name"),O(s,c,"runtime"),O(s,c,"taskSelector"),O(s,c,"suppressTaskName"),c.args!==void 0&&(s.args===void 0||h?s.args=c.args:s.args=s.args.concat(c.args)),s.presentation=f.assignProperties(s.presentation,c.presentation),s.options=_.assignProperties(s.options,c.options),s)}k.assignProperties=e;function d(s,c){return z(s,c,u)}k.fillProperties=d;function n(s,c,h){if(c===void 0||i(c))return s;if(s=s||{name:void 0,runtime:void 0,presentation:void 0},s.name===void 0){v(s,c,"name"),v(s,c,"taskSelector"),v(s,c,"suppressTaskName");let C=c.args?c.args.slice():[];!s.suppressTaskName&&h&&(s.taskSelector!==void 0?C.push(s.taskSelector+h):C.push(h)),s.args&&(C=C.concat(s.args)),s.args=C}return v(s,c,"runtime"),s.presentation=f.fillProperties(s.presentation,c.presentation),s.options=_.fillProperties(s.options,c.options),s}k.fillGlobals=n;function p(s,c){!s||Object.isFrozen(s)||(s.name!==void 0&&s.runtime===void 0&&(s.runtime=l.RuntimeType.Process),s.presentation=f.fillDefaults(s.presentation,c),i(s)||(s.options=_.fillDefaults(s.options,c)),s.args===void 0&&(s.args=F),s.suppressTaskName===void 0&&(s.suppressTaskName=c.schemaVersion===l.JsonSchemaVersion.V2_0_0))}k.fillDefaults=p;function m(s){return J(s,u)}k.freeze=m})(w||={});var W;(r=>{function f(i,e){const d=Object.create(null);return Array.isArray(i)&&i.forEach(n=>{const p=new se(e.problemReporter).parse(n);ke(p)?d[p.name]=p:e.problemReporter.error(S.localize("ConfigurationParser.noName",`Error: Problem Matcher in declare scope must have a name:
{0}
`,JSON.stringify(n,void 0,4)))}),d}r.namedFrom=f;function a(i,e){let d={};return i.windows&&i.windows.problemMatcher&&e.platform===M.Windows?d=u(i.windows.problemMatcher,e):i.osx&&i.osx.problemMatcher&&e.platform===M.Mac?d=u(i.osx.problemMatcher,e):i.linux&&i.linux.problemMatcher&&e.platform===M.Linux?d=u(i.linux.problemMatcher,e):i.problemMatcher&&(d=u(i.problemMatcher,e)),d}r.fromWithOsConfig=a;function u(i,e){const d=[];if(i===void 0)return{value:d};const n=[];function p(k){k.value&&d.push(k.value),k.errors&&n.push(...k.errors)}const m=t(i);if(m===0){const k=S.localize("ConfigurationParser.unknownMatcherKind",`Warning: the defined problem matcher is unknown. Supported types are string | ProblemMatcher | Array<string | ProblemMatcher>.
{0}
`,JSON.stringify(i,null,4));e.problemReporter.warn(k)}else m===1||m===2?p(o(i,e)):m===3&&i.forEach(s=>{p(o(s,e))});return{value:d,errors:n}}r.from=u;function t(i){return T.isString(i)?1:Array.isArray(i)?3:T.isUndefined(i)?0:2}function o(i,e){if(T.isString(i)){let d=i;if(d.length>1&&d[0]==="$"){d=d.substring(1);const n=ge.get(d);if(n)return{value:D.deepClone(n)};let p=e.namedProblemMatchers[d];if(p)return p=D.deepClone(p),delete p.name,{value:p}}return{errors:[S.localize("ConfigurationParser.invalidVariableReference",`Error: Invalid problemMatcher reference: {0}
`,i)]}}else{const d=i;return{value:new se(e.problemReporter).parse(d)}}}})(W||={});var q;(u=>{function f(t){if(t!==void 0){if(T.isString(t)&&l.TaskGroup.is(t))return{_id:t,isDefault:!1};if(T.isString(t.kind)&&l.TaskGroup.is(t.kind)){const o=t.kind,r=T.isUndefined(t.isDefault)?!1:t.isDefault;return{_id:o,isDefault:r}}}}u.from=f;function a(t){return T.isString(t)?t:t.isDefault?{kind:t._id,isDefault:t.isDefault}:t._id}u.to=a})(q||={});var Y;(u=>{function f(t,o){switch(o){case 2:return l.USER_TASKS_GROUP_KEY;case 0:return t.workspaceFolder.uri;default:return t.workspace&&t.workspace.configuration?t.workspace.configuration:t.workspaceFolder.uri}}function a(t,o,r){return T.isString(t)?{uri:f(o,r),task:t}:ae.is(t)?{uri:f(o,r),task:l.TaskDefinition.createTaskIdentifier(t,o.problemReporter)}:void 0}u.from=a})(Y||={});var de;(a=>{function f(u){switch(u){case l.DependsOrder.sequence:return l.DependsOrder.sequence;case l.DependsOrder.parallel:default:return l.DependsOrder.parallel}}a.from=f})(de||={});var Z;(t=>{const f=[{property:"name"},{property:"identifier"},{property:"group"},{property:"isBackground"},{property:"promptOnClose"},{property:"dependsOn"},{property:"presentation",type:w.PresentationOptions},{property:"problemMatchers"},{property:"options"},{property:"icon"},{property:"hide"}];function a(o,r,i,e,d){if(!o)return{};const n={};if(d)for(const m of Object.keys(d))o[m]!==void 0&&(n[m]=D.deepClone(o[m]));if(T.isString(o.taskName)&&(n.name=o.taskName),T.isString(o.label)&&r.schemaVersion===l.JsonSchemaVersion.V2_0_0&&(n.name=o.label),T.isString(o.identifier)&&(n.identifier=o.identifier),n.icon=o.icon,n.hide=o.hide,o.isBackground!==void 0&&(n.isBackground=!!o.isBackground),o.promptOnClose!==void 0&&(n.promptOnClose=!!o.promptOnClose),n.group=q.from(o.group),o.dependsOn!==void 0)if(Array.isArray(o.dependsOn))n.dependsOn=o.dependsOn.reduce((m,k)=>{const s=Y.from(k,r,e);return s&&m.push(s),m},[]);else{const m=Y.from(o.dependsOn,r,e);n.dependsOn=m?[m]:void 0}n.dependsOrder=de.from(o.dependsOrder),i&&(o.presentation!==void 0||o.terminal!==void 0)&&(n.presentation=w.PresentationOptions.from(o,r)),i&&o.options!==void 0&&(n.options=_.from(o.options,r));const p=W.fromWithOsConfig(o,r);return p.value!==void 0&&(n.problemMatchers=p.value),o.detail&&(n.detail=o.detail),u(n)?{}:{value:n,errors:p.errors}}t.from=a;function u(o){return E(o,f)}t.isEmpty=u})(Z||={});const K="Workspace";var pe;(i=>{const f="grunt.",a="jake.",u="gulp.",t="vscode.npm.",o="vscode.typescript.";function r(e,d,n,p,m){if(!e)return;const k=e.type,s=e.customize;if(!k&&!s){d.problemReporter.error(S.localize("ConfigurationParser.noTaskType",`Error: tasks configuration must have a type property. The configuration will be ignored.
{0}
`,JSON.stringify(e,null,4)));return}const c=k?m?.get?.(k)||te.get(k):void 0;if(!c){const g=S.localize("ConfigurationParser.noTypeDefinition","Error: there is no registered task type '{0}'. Did you miss installing an extension that provides a corresponding task provider?",k);d.problemReporter.error(g);return}let h;if(T.isString(s)?s.indexOf(f)===0?h={type:"grunt",task:s.substring(f.length)}:s.indexOf(a)===0?h={type:"jake",task:s.substring(a.length)}:s.indexOf(u)===0?h={type:"gulp",task:s.substring(u.length)}:s.indexOf(t)===0?h={type:"npm",script:s.substring(t.length+4)}:s.indexOf(o)===0&&(h={type:"typescript",tsconfig:s.substring(o.length+6)}):T.isString(e.type)&&(h=e),h===void 0){d.problemReporter.error(S.localize("ConfigurationParser.missingType","Error: the task configuration '{0}' is missing the required property 'type'. The task configuration will be ignored.",JSON.stringify(e,void 0,0)));return}const C=l.TaskDefinition.createTaskIdentifier(h,d.problemReporter);if(C===void 0){d.problemReporter.error(S.localize("ConfigurationParser.incorrectType","Error: the task configuration '{0}' is using an unknown type. The task configuration will be ignored.",JSON.stringify(e,void 0,0)));return}const I={workspaceFolder:d.workspaceFolder,file:".vscode/tasks.json",index:n,element:e};let P;switch(p){case 2:{P={kind:l.TaskSourceKind.User,config:I,label:K};break}case 1:{P={kind:l.TaskSourceKind.WorkspaceFile,config:I,label:K};break}default:{P={kind:l.TaskSourceKind.Workspace,config:I,label:K};break}}const b=new l.ConfiguringTask(`${c.extensionId}.${C._key}`,P,void 0,k,C,G.fromConfiguration(e.runOptions),{hide:e.hide}),B=Z.from(e,d,!0,p,c.properties);if(b.addTaskLoadMessages(B.errors),B.value){if(b.configurationProperties=Object.assign(b.configurationProperties,B.value),b.configurationProperties.name)b._label=b.configurationProperties.name;else{let g=b.configures.type;if(c.required&&c.required.length>0)for(const R of c.required){const N=b.configures[R];if(N){g=g+": "+N;break}}b._label=g}b.configurationProperties.identifier||(b.configurationProperties.identifier=C._key)}return b}i.from=r})(pe||={});var V;(o=>{function f(r,i,e,d){if(!r)return;let n=r.type;if(n==null&&(n=l.CUSTOMIZED_TASK_TYPE),n!==l.CUSTOMIZED_TASK_TYPE&&n!=="shell"&&n!=="process"){i.problemReporter.error(S.localize("ConfigurationParser.notCustom",`Error: tasks is not declared as a custom task. The configuration will be ignored.
{0}
`,JSON.stringify(r,null,4)));return}let p=r.taskName;if(T.isString(r.label)&&i.schemaVersion===l.JsonSchemaVersion.V2_0_0&&(p=r.label),!p){i.problemReporter.error(S.localize("ConfigurationParser.noTaskName",`Error: a task must provide a label property. The task will be ignored.
{0}
`,JSON.stringify(r,null,4)));return}let m;switch(d){case 2:{m={kind:l.TaskSourceKind.User,config:{index:e,element:r,file:".vscode/tasks.json",workspaceFolder:i.workspaceFolder},label:K};break}case 1:{m={kind:l.TaskSourceKind.WorkspaceFile,config:{index:e,element:r,file:".vscode/tasks.json",workspaceFolder:i.workspaceFolder,workspace:i.workspace},label:K};break}default:{m={kind:l.TaskSourceKind.Workspace,config:{index:e,element:r,file:".vscode/tasks.json",workspaceFolder:i.workspaceFolder},label:K};break}}const k=new l.CustomTask(i.uuidMap.getUUID(p),m,p,l.CUSTOMIZED_TASK_TYPE,void 0,!1,G.fromConfiguration(r.runOptions),{name:p,identifier:p}),s=Z.from(r,i,!1,d);if(k.addTaskLoadMessages(s.errors),s.value&&(k.configurationProperties=Object.assign(k.configurationProperties,s.value)),!0){const C=r;k.configurationProperties.isBackground===void 0&&C.isWatching!==void 0&&(k.configurationProperties.isBackground=!!C.isWatching),k.configurationProperties.group===void 0&&(C.isBuildCommand===!0?k.configurationProperties.group=l.TaskGroup.Build:C.isTestCommand===!0&&(k.configurationProperties.group=l.TaskGroup.Test))}const h=w.from(r,i);return h&&(k.command=h),r.command!==void 0&&(h.suppressTaskName=!0),k}o.from=f;function a(r,i){(w.hasCommand(r.command)||r.configurationProperties.dependsOn===void 0)&&(r.command=w.fillGlobals(r.command,i.command,r.configurationProperties.name)),r.configurationProperties.problemMatchers===void 0&&i.problemMatcher!==void 0&&(r.configurationProperties.problemMatchers=D.deepClone(i.problemMatcher),r.hasDefinedMatchers=!0),r.configurationProperties.promptOnClose===void 0&&r.configurationProperties.isBackground===void 0&&i.promptOnClose!==void 0&&(r.configurationProperties.promptOnClose=i.promptOnClose)}o.fillGlobals=a;function u(r,i){w.fillDefaults(r.command,i),r.configurationProperties.promptOnClose===void 0&&(r.configurationProperties.promptOnClose=r.configurationProperties.isBackground!==void 0?!r.configurationProperties.isBackground:!0),r.configurationProperties.isBackground===void 0&&(r.configurationProperties.isBackground=!1),r.configurationProperties.problemMatchers===void 0&&(r.configurationProperties.problemMatchers=F)}o.fillDefaults=u;function t(r,i){const e=new l.CustomTask(i._id,Object.assign({},i._source,{customizes:r.defines}),i.configurationProperties.name||r._label,l.CUSTOMIZED_TASK_TYPE,r.command,!1,r.runOptions,{name:i.configurationProperties.name||r.configurationProperties.name,identifier:i.configurationProperties.identifier||r.configurationProperties.identifier,icon:i.configurationProperties.icon,hide:i.configurationProperties.hide});e.addTaskLoadMessages(i.taskLoadMessages);const d=e.configurationProperties;O(d,i.configurationProperties,"group"),O(d,i.configurationProperties,"isBackground"),O(d,i.configurationProperties,"dependsOn"),O(d,i.configurationProperties,"problemMatchers"),O(d,i.configurationProperties,"promptOnClose"),O(d,i.configurationProperties,"detail"),e.command.presentation=w.PresentationOptions.assignProperties(e.command.presentation,i.configurationProperties.presentation),e.command.options=_.assignProperties(e.command.options,i.configurationProperties.options),e.runOptions=G.assignProperties(e.runOptions,i.runOptions);const n=r.configurationProperties;return v(d,n,"group"),v(d,n,"isBackground"),v(d,n,"dependsOn"),v(d,n,"problemMatchers"),v(d,n,"promptOnClose"),v(d,n,"detail"),e.command.presentation=w.PresentationOptions.fillProperties(e.command.presentation,n.presentation),e.command.options=_.fillProperties(e.command.options,n.options),e.runOptions=G.fillProperties(e.runOptions,r.runOptions),r.hasDefinedMatchers===!0&&(e.hasDefinedMatchers=!0),e}o.createCustomTask=t})(V||={});var U;(o=>{function f(r){const i=r.type;return r.customize===void 0&&(i==null||i===l.CUSTOMIZED_TASK_TYPE||i==="shell"||i==="process")}const a={shell:oe,process:Te};function u(r,i,e,d,n){const p={custom:[],configured:[]};if(!r)return p;const m={task:void 0,rank:-1},k={task:void 0,rank:-1},s=e.schemaVersion===l.JsonSchemaVersion.V2_0_0,c=D.deepClone(e.taskLoadIssues);for(let I=0;I<r.length;I++){const P=r[I],b=P.type?n?.get?.(P.type)||te.get(P.type):void 0;let B=!1;if(b&&b.when&&!e.contextKeyService.contextMatchesRules(b.when))B=!0;else if(!b&&P.type){for(const g of Object.keys(a))if(P.type===g){B=!oe.evaluate(e.contextKeyService.getContext(null));break}}if(B){e.problemReporter.info(S.localize("taskConfiguration.providerUnavailable",`Warning: {0} tasks are unavailable in the current environment.
`,P.type));continue}if(f(P)){const g=V.from(P,e,I,d);if(g){if(V.fillGlobals(g,i),V.fillDefaults(g,e),s){if((g.command===void 0||g.command.name===void 0)&&(g.configurationProperties.dependsOn===void 0||g.configurationProperties.dependsOn.length===0)){e.problemReporter.error(S.localize("taskConfiguration.noCommandOrDependsOn",`Error: the task '{0}' neither specifies a command nor a dependsOn property. The task will be ignored. Its definition is:
{1}`,g.configurationProperties.name,JSON.stringify(P,void 0,4)));continue}}else if(g.command===void 0||g.command.name===void 0){e.problemReporter.warn(S.localize("taskConfiguration.noCommand",`Error: the task '{0}' doesn't define a command. The task will be ignored. Its definition is:
{1}`,g.configurationProperties.name,JSON.stringify(P,void 0,4)));continue}g.configurationProperties.group===l.TaskGroup.Build&&m.rank<2?(m.task=g,m.rank=2):g.configurationProperties.group===l.TaskGroup.Test&&k.rank<2?(k.task=g,k.rank=2):g.configurationProperties.name==="build"&&m.rank<1?(m.task=g,m.rank=1):g.configurationProperties.name==="test"&&k.rank<1&&(k.task=g,k.rank=1),g.addTaskLoadMessages(e.taskLoadIssues),p.custom.push(g)}}else{const g=pe.from(P,e,I,d,n);g&&(g.addTaskLoadMessages(e.taskLoadIssues),p.configured.push(g))}e.taskLoadIssues=D.deepClone(c)}const h=T.isString(m.task?.configurationProperties.group)?m.task?.configurationProperties.group:m.task?.configurationProperties.group?._id,C=T.isString(k.task?.configurationProperties.group)?k.task?.configurationProperties.group:k.task?.configurationProperties.group?._id;return h!==l.TaskGroup.Build._id&&m.rank>-1&&m.rank<2&&m.task?m.task.configurationProperties.group=l.TaskGroup.Build:C!==l.TaskGroup.Test._id&&k.rank>-1&&k.rank<2&&k.task&&(k.task.configurationProperties.group=l.TaskGroup.Test),p}o.from=u;function t(r,i){if(i===void 0||i.length===0)return r;if(r===void 0||r.length===0)return i;if(i){const e=Object.create(null);r.forEach(n=>{e[n.configurationProperties.name]=n}),i.forEach(n=>{e[n.configurationProperties.name]=n});const d=[];r.forEach(n=>{d.push(e[n.configurationProperties.name]),delete e[n.configurationProperties.name]}),Object.keys(e).forEach(n=>d.push(e[n])),r=d}return r}o.assignTasks=t})(U||={});var le;(i=>{function f(e,d){let n=a(e,d),p;e.windows&&d.platform===M.Windows?p=a(e.windows,d):e.osx&&d.platform===M.Mac?p=a(e.osx,d):e.linux&&d.platform===M.Linux&&(p=a(e.linux,d)),p&&(n=i.assignProperties(n,p));const m=w.from(e,d);return m&&(n.command=m),i.fillDefaults(n,d),i.freeze(n),n}i.from=f;function a(e,d){const n={};return e.suppressTaskName!==void 0&&(n.suppressTaskName=!!e.suppressTaskName),e.promptOnClose!==void 0&&(n.promptOnClose=!!e.promptOnClose),e.problemMatcher&&(n.problemMatcher=W.from(e.problemMatcher,d).value),n}i.fromBase=a;function u(e){return!e||e.command===void 0&&e.promptOnClose===void 0&&e.suppressTaskName===void 0}i.isEmpty=u;function t(e,d){return u(d)?e:u(e)?d:(O(e,d,"promptOnClose"),O(e,d,"suppressTaskName"),e)}i.assignProperties=t;function o(e,d){e&&(w.fillDefaults(e.command,d),e.suppressTaskName===void 0&&(e.suppressTaskName=d.schemaVersion===l.JsonSchemaVersion.V2_0_0),e.promptOnClose===void 0&&(e.promptOnClose=!0))}i.fillDefaults=o;function r(e){Object.freeze(e),e.command&&w.freeze(e.command)}i.freeze=r})(le||={});var me;(a=>{function f(u){const t=u.runner||u._runner;let o;if(t)switch(t){case"terminal":o=l.ExecutionEngine.Terminal;break;case"process":o=l.ExecutionEngine.Process;break}const r=$.from(u);if(r===l.JsonSchemaVersion.V0_1_0)return o||l.ExecutionEngine.Process;if(r===l.JsonSchemaVersion.V2_0_0)return l.ExecutionEngine.Terminal;throw new Error("Shouldn't happen.")}a.from=f})(me||={});var $;(u=>{const f=l.JsonSchemaVersion.V2_0_0;function a(t){const o=t.version;if(!o)return f;switch(o){case"0.1.0":return l.JsonSchemaVersion.V0_1_0;case"2.0.0":return l.JsonSchemaVersion.V2_0_0;default:return f}}u.from=a})($||={});class Pe{last;current;constructor(a){if(this.current=Object.create(null),a)for(const u of Object.keys(a.current)){const t=a.current[u];Array.isArray(t)?this.current[u]=t.slice():this.current[u]=t}}start(){this.last=this.current,this.current=Object.create(null)}getUUID(a){const u=this.last?this.last[a]:void 0;let t;u!==void 0&&(Array.isArray(u)?(t=u.shift(),u.length===0&&delete this.last[a]):(t=u,delete this.last[a])),t===void 0&&(t=ce.generateUuid());const o=this.current[a];if(o===void 0)this.current[a]=t;else if(Array.isArray(o))o.push(t);else{const r=[o];r.push(t),this.current[a]=r}return t}finish(){this.last=void 0}}var be=(t=>(t[t.TasksJson=0]="TasksJson",t[t.WorkspaceFile=1]="WorkspaceFile",t[t.User=2]="User",t))(be||{});class ye{workspaceFolder;workspace;problemReporter;uuidMap;platform;constructor(a,u,t,o,r){this.workspaceFolder=a,this.workspace=u,this.platform=t,this.problemReporter=o,this.uuidMap=r}run(a,u,t){const o=me.from(a),r=$.from(a),i={workspaceFolder:this.workspaceFolder,workspace:this.workspace,problemReporter:this.problemReporter,uuidMap:this.uuidMap,namedProblemMatchers:{},engine:o,schemaVersion:r,platform:this.platform,taskLoadIssues:[],contextKeyService:t},e=this.createTaskRunnerConfiguration(a,i,u);return{validationStatus:this.problemReporter.status,custom:e.custom,configured:e.configured,engine:o}}createTaskRunnerConfiguration(a,u,t){const o=le.from(a,u);if(this.problemReporter.status.isFatal())return{custom:[],configured:[]};u.namedProblemMatchers=W.namedFrom(a.declares,u);let r,i;if(a.windows&&u.platform===M.Windows?(r=U.from(a.windows.tasks,o,u,t).custom,i=a.windows.tasks):a.osx&&u.platform===M.Mac?(r=U.from(a.osx.tasks,o,u,t).custom,i=a.osx.tasks):a.linux&&u.platform===M.Linux&&(r=U.from(a.linux.tasks,o,u,t).custom,i=a.linux.tasks),u.schemaVersion===l.JsonSchemaVersion.V2_0_0&&r&&r.length>0&&i&&i.length>0){const d=[];for(const n of i)d.push(JSON.stringify(n,null,4));u.problemReporter.error(S.localize({key:"TaskParse.noOsSpecificGlobalTasks",comment:['"Task version 2.0.0" refers to the 2.0.0 version of the task system. The "version 2.0.0" is not localizable as it is a json key and value.']},`Task version 2.0.0 doesn't support global OS specific tasks. Convert them to a task with a OS specific command. Affected tasks are:
{0}`,d.join(`
`)))}let e={custom:[],configured:[]};if(a.tasks&&(e=U.from(a.tasks,o,u,t)),r&&(e.custom=U.assignTasks(e.custom,r)),(!e.custom||e.custom.length===0)&&o.command&&o.command.name){const d=W.from(a.problemMatcher,u).value??[],n=a.isBackground?!!a.isBackground:a.isWatching?!!a.isWatching:void 0,p=l.CommandString.value(o.command.name),m=new l.CustomTask(u.uuidMap.getUUID(p),Object.assign({},t,"workspace",{config:{index:-1,element:a,workspaceFolder:u.workspaceFolder}}),p,l.CUSTOMIZED_TASK_TYPE,{name:void 0,runtime:void 0,presentation:void 0,suppressTaskName:!0},!1,{reevaluateOnRerun:!0},{name:p,identifier:p,group:l.TaskGroup.Build,isBackground:n,problemMatchers:d}),k=q.from(a.group);k!==void 0?m.configurationProperties.group=k:a.group==="none"&&(m.configurationProperties.group=void 0),V.fillGlobals(m,o),V.fillDefaults(m,u),e.custom=[m]}return e.custom=e.custom||[],e.configured=e.configured||[],e}}const Se=new Map,Oe=new Map;function He(f,a,u,t,o,r,i,e=!1){const d=e?Oe:Se;let n=d.get(r);n||(d.set(r,new Map),n=d.get(r));let p=n.get(f.uri.toString());p||(p=new Pe,n.set(f.uri.toString(),p));try{return p.start(),new ye(f,a,u,o,p).run(t,r,i)}finally{p.finish()}}function Xe(f,a){return V.createCustomTask(f,a)}export{Ce as CommandString,me as ExecutionEngine,q as GroupKind,ae as ITaskIdentifier,$ as JsonSchemaVersion,W as ProblemMatcherConverter,fe as RunOnOptions,G as RunOptions,he as ShellQuoting,be as TaskConfigSource,U as TaskParser,Pe as UUIDMap,Xe as createCustomTask,He as parse};
