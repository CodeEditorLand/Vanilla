import{URI as n}from"../../../../base/common/uri.js";import{createDecorator as o}from"../../../../platform/instantiation/common/instantiation.js";import*as a from"../../../services/extensions/common/extensionsRegistry.js";import{terminalContributionsDescriptor as l}from"./terminal.js";const s=a.ExtensionsRegistry.registerExtensionPoint(l),d=o("terminalContributionsService");class I{_terminalProfiles=[];get terminalProfiles(){return this._terminalProfiles}constructor(){s.setHandler(t=>{this._terminalProfiles=t.flatMap(e=>e.value?.profiles?.filter(r=>m(r)).map(r=>({...r,extensionIdentifier:e.description.identifier.value}))||[])})}}function m(i){return!i.icon||typeof i.icon=="string"||n.isUri(i.icon)||"light"in i.icon&&"dark"in i.icon&&n.isUri(i.icon.light)&&n.isUri(i.icon.dark)}export{d as ITerminalContributionService,I as TerminalContributionService};
