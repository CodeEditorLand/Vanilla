var u=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var d=(o,e,r,t)=>{for(var i=t>1?void 0:t?p(e,r):e,s=o.length-1,c;s>=0;s--)(c=o[s])&&(i=(t?c(e,r,i):c(i))||i);return t&&i&&u(e,r,i),i},l=(o,e)=>(r,t)=>e(r,t,o);import{Emitter as m}from"../../../../../base/common/event.js";import{toDisposable as h}from"../../../../../base/common/lifecycle.js";import{localize as n}from"../../../../../nls.js";import{ILogService as g}from"../../../../../platform/log/common/log.js";import"../../../../../platform/terminal/common/terminal.js";import{isProposedApiEnabled as x}from"../../../../services/extensions/common/extensions.js";import{ExtensionsRegistry as f}from"../../../../services/extensions/common/extensionsRegistry.js";import"./quickFix.js";let a=class{constructor(e){this._logService=e;this.extensionQuickFixes=new Promise(r=>v.setHandler(t=>{r(t.filter(i=>x(i.description,"terminalQuickFixProvider")).map(i=>i.value?i.value.map(s=>({...s,extensionIdentifier:i.description.identifier.value})):[]).flat())})),this.extensionQuickFixes.then(r=>{for(const t of r)this.registerCommandSelector(t)})}_selectors=new Map;_providers=new Map;get providers(){return this._providers}_onDidRegisterProvider=new m;onDidRegisterProvider=this._onDidRegisterProvider.event;_onDidRegisterCommandSelector=new m;onDidRegisterCommandSelector=this._onDidRegisterCommandSelector.event;_onDidUnregisterProvider=new m;onDidUnregisterProvider=this._onDidUnregisterProvider.event;extensionQuickFixes;registerCommandSelector(e){this._selectors.set(e.id,e),this._onDidRegisterCommandSelector.fire(e)}registerQuickFixProvider(e,r){let t=!1;return this.extensionQuickFixes.then(()=>{if(t)return;this._providers.set(e,r);const i=this._selectors.get(e);if(!i){this._logService.error(`No registered selector for ID: ${e}`);return}this._onDidRegisterProvider.fire({selector:i,provider:r})}),h(()=>{t=!0,this._providers.delete(e);const i=this._selectors.get(e);i&&(this._selectors.delete(e),this._onDidUnregisterProvider.fire(i.id))})}};a=d([l(0,g)],a);const v=f.registerExtensionPoint({extensionPoint:"terminalQuickFixes",defaultExtensionKind:["workspace"],activationEventsGenerator:(o,e)=>{for(const r of o??[])e.push(`onTerminalQuickFixRequest:${r.id}`)},jsonSchema:{description:n("vscode.extension.contributes.terminalQuickFixes","Contributes terminal quick fixes."),type:"array",items:{type:"object",additionalProperties:!1,required:["id","commandLineMatcher","outputMatcher","commandExitResult"],defaultSnippets:[{body:{id:"$1",commandLineMatcher:"$2",outputMatcher:"$3",exitStatus:"$4"}}],properties:{id:{description:n("vscode.extension.contributes.terminalQuickFixes.id","The ID of the quick fix provider"),type:"string"},commandLineMatcher:{description:n("vscode.extension.contributes.terminalQuickFixes.commandLineMatcher","A regular expression or string to test the command line against"),type:"string"},outputMatcher:{markdownDescription:n("vscode.extension.contributes.terminalQuickFixes.outputMatcher",`A regular expression or string to match a single line of the output against, which provides groups to be referenced in terminalCommand and uri.

For example:

 \`lineMatcher: /git push --set-upstream origin (?<branchName>[^s]+)/;\`

\`terminalCommand: 'git push --set-upstream origin \${group:branchName}';\`
`),type:"object",required:["lineMatcher","anchor","offset","length"],properties:{lineMatcher:{description:"A regular expression or string to test the command line against",type:"string"},anchor:{description:"Where the search should begin in the buffer",enum:["top","bottom"]},offset:{description:"The number of lines vertically from the anchor in the buffer to start matching against",type:"number"},length:{description:"The number of rows to match against, this should be as small as possible for performance reasons",type:"number"}}},commandExitResult:{description:n("vscode.extension.contributes.terminalQuickFixes.commandExitResult","The command exit result to match on"),enum:["success","error"],enumDescriptions:["The command exited with an exit code of zero.","The command exited with a non-zero exit code."]},kind:{description:n("vscode.extension.contributes.terminalQuickFixes.kind","The kind of the resulting quick fix. This changes how the quick fix is presented. Defaults to {0}.",'`"fix"`'),enum:["default","explain"],enumDescriptions:["A high confidence quick fix.","An explanation of the problem."]}}}}});export{a as TerminalQuickFixService};
