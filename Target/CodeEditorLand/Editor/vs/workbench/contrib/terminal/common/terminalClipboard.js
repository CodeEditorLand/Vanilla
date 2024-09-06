import{localize as t}from"../../../../../vs/nls.js";import{IConfigurationService as b}from"../../../../../vs/platform/configuration/common/configuration.js";import{IDialogService as y}from"../../../../../vs/platform/dialogs/common/dialogs.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{TerminalSettingId as m}from"../../../../../vs/platform/terminal/common/terminal.js";async function A(s,o,g){const l=s.get(b),d=s.get(y),n=o.split(/\r?\n/);if(n.length===1)return!0;function p(e){return typeof e=="string"&&(e==="auto"||e==="always"||e==="never")?e:typeof e=="boolean"?e?"auto":"never":"auto"}const c=p(l.getValue(m.EnableMultiLinePasteWarning));if(c==="never")return!0;if(c==="auto"){if(g)return!0;const e=o.split(/\r?\n/);if(e.length===2&&e[1].trim().length===0)return!0}const u=3,f=30;let r=t("preview","Preview:");for(let e=0;e<Math.min(n.length,u);e++){const a=n[e],L=a.length>f?`${a.slice(0,f)}\u2026`:a;r+=`
${L}`}n.length>u&&(r+=`
\u2026`);const{result:i,checkboxChecked:h}=await d.prompt({message:t("confirmMoveTrashMessageFilesAndDirectories","Are you sure you want to paste {0} lines of text into the terminal?",n.length),detail:r,type:"warning",buttons:[{label:t({key:"multiLinePasteButton",comment:["&& denotes a mnemonic"]},"&&Paste"),run:()=>({confirmed:!0,singleLine:!1})},{label:t({key:"multiLinePasteButton.oneLine",comment:["&& denotes a mnemonic"]},"Paste as &&one line"),run:()=>({confirmed:!0,singleLine:!0})}],cancelButton:!0,checkbox:{label:t("doNotAskAgain","Do not ask me again")}});return i?(i.confirmed&&h&&await l.updateValue(m.EnableMultiLinePasteWarning,!1),i.singleLine?{modifiedText:o.replace(/\r?\n/g,"")}:i.confirmed):!1}export{A as shouldPasteTerminalText};
