import{mainWindow as i}from"../../../../base/browser/window.js";import{isRemoteDiagnosticError as o}from"../../../../platform/diagnostics/common/diagnostics.js";import{IssueType as t}from"../common/issue.js";class l{_data;constructor(e){const s={issueType:t.Bug,includeSystemInfo:!0,includeWorkspaceInfo:!0,includeProcessInfo:!0,includeExtensions:!0,includeExperiments:!0,includeExtensionData:!0,allExtensions:[]};this._data=e?Object.assign(s,e):s,i.addEventListener("message",async n=>{n.data&&n.data.sendChannel==="vscode:triggerIssueData"&&i.postMessage({data:{issueBody:this._data.issueDescription,issueTitle:this._data.issueTitle},replyChannel:"vscode:triggerIssueDataResponse"},"*")})}getData(){return this._data}update(e){Object.assign(this._data,e)}serialize(){const e=[];return this._data.restrictedMode&&e.push("Restricted"),this._data.isUnsupported&&e.push("Unsupported"),`
Type: <b>${this.getIssueTypeTitle()}</b>

${this._data.issueDescription}
${this.getExtensionVersion()}
VS Code version: ${this._data.versionInfo&&this._data.versionInfo.vscodeVersion}
OS version: ${this._data.versionInfo&&this._data.versionInfo.os}
Modes:${e.length?" "+e.join(", "):""}
${this.getRemoteOSes()}
${this.getInfos()}
<!-- generated by issue reporter -->`}getRemoteOSes(){return this._data.systemInfo&&this._data.systemInfo.remoteData.length?this._data.systemInfo.remoteData.map(e=>o(e)?e.errorMessage:`Remote OS version: ${e.machineInfo.os}`).join(`
`)+`
`:""}fileOnExtension(){return(this._data.issueType===t.Bug||this._data.issueType===t.PerformanceIssue||this._data.issueType===t.FeatureRequest)&&this._data.fileOnExtension}getExtensionVersion(){return this.fileOnExtension()&&this._data.selectedExtension?`
Extension version: ${this._data.selectedExtension.version}`:""}getIssueTypeTitle(){return this._data.issueType===t.Bug?"Bug":this._data.issueType===t.PerformanceIssue?"Performance Issue":"Feature Request"}getInfos(){let e="";if(this._data.fileOnMarketplace)return e;const s=this._data.issueType===t.Bug||this._data.issueType===t.PerformanceIssue;return s&&(this._data.includeExtensionData&&this._data.extensionData&&(e+=this.getExtensionData()),this._data.includeSystemInfo&&this._data.systemInfo&&(e+=this.generateSystemInfoMd()),this._data.includeSystemInfo&&this._data.systemInfoWeb&&(e+="System Info: "+this._data.systemInfoWeb)),this._data.issueType===t.PerformanceIssue&&(this._data.includeProcessInfo&&(e+=this.generateProcessInfoMd()),this._data.includeWorkspaceInfo&&(e+=this.generateWorkspaceInfoMd())),s&&(!this._data.fileOnExtension&&this._data.includeExtensions&&(e+=this.generateExtensionsMd()),this._data.includeExperiments&&this._data.experimentInfo&&(e+=this.generateExperimentsInfoMd())),e}getExtensionData(){return this._data.extensionData??""}generateSystemInfoMd(){let e=`<details>
<summary>System Info</summary>

|Item|Value|
|---|---|
`;return this._data.systemInfo&&(e+=`|CPUs|${this._data.systemInfo.cpus}|
|GPU Status|${Object.keys(this._data.systemInfo.gpuStatus).map(s=>`${s}: ${this._data.systemInfo.gpuStatus[s]}`).join("<br>")}|
|Load (avg)|${this._data.systemInfo.load}|
|Memory (System)|${this._data.systemInfo.memory}|
|Process Argv|${this._data.systemInfo.processArgs.replace(/\\/g,"\\\\")}|
|Screen Reader|${this._data.systemInfo.screenReader}|
|VM|${this._data.systemInfo.vmHint}|`,this._data.systemInfo.linuxEnv&&(e+=`
|DESKTOP_SESSION|${this._data.systemInfo.linuxEnv.desktopSession}|
|XDG_CURRENT_DESKTOP|${this._data.systemInfo.linuxEnv.xdgCurrentDesktop}|
|XDG_SESSION_DESKTOP|${this._data.systemInfo.linuxEnv.xdgSessionDesktop}|
|XDG_SESSION_TYPE|${this._data.systemInfo.linuxEnv.xdgSessionType}|`),this._data.systemInfo.remoteData.forEach(s=>{o(s)?e+=`

${s.errorMessage}`:e+=`

|Item|Value|
|---|---|
|Remote|${s.latency?`${s.hostName} (latency: ${s.latency.current.toFixed(2)}ms last, ${s.latency.average.toFixed(2)}ms average)`:s.hostName}|
|OS|${s.machineInfo.os}|
|CPUs|${s.machineInfo.cpus}|
|Memory (System)|${s.machineInfo.memory}|
|VM|${s.machineInfo.vmHint}|`})),e+=`
</details>`,e}generateProcessInfoMd(){return`<details>
<summary>Process Info</summary>

\`\`\`
${this._data.processInfo}
\`\`\`

</details>
`}generateWorkspaceInfoMd(){return`<details>
<summary>Workspace Info</summary>

\`\`\`
${this._data.workspaceInfo};
\`\`\`

</details>
`}generateExperimentsInfoMd(){return`<details>
<summary>A/B Experiments</summary>

\`\`\`
${this._data.experimentInfo}
\`\`\`

</details>
`}generateExtensionsMd(){if(this._data.extensionsDisabled)return"Extensions disabled";const e=this._data.numberOfThemeExtesions?`
(${this._data.numberOfThemeExtesions} theme extensions excluded)`:"";if(!this._data.enabledNonThemeExtesions)return"Extensions: none"+e;const s=`Extension|Author (truncated)|Version
---|---|---`,n=this._data.enabledNonThemeExtesions.map(a=>`${a.name}|${a.publisher?.substr(0,3)??"N/A"}|${a.version}`).join(`
`);return`<details><summary>Extensions (${this._data.enabledNonThemeExtesions.length})</summary>

${s}
${n}
${e}

</details>`}}export{l as IssueReporterModel};
