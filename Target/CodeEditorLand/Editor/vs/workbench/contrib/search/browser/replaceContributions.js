import{InstantiationType as r,registerSingleton as o}from"../../../../../vs/platform/instantiation/common/extensions.js";import{registerWorkbenchContribution2 as t,WorkbenchPhase as i}from"../../../../../vs/workbench/common/contributions.js";import{IReplaceService as n}from"../../../../../vs/workbench/contrib/search/browser/replace.js";import{ReplacePreviewContentProvider as e,ReplaceService as p}from"../../../../../vs/workbench/contrib/search/browser/replaceService.js";function s(){o(n,p,r.Delayed),t(e.ID,e,i.BlockStartup)}export{s as registerContributions};
