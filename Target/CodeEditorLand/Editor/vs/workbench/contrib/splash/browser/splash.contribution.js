import{InstantiationType as o,registerSingleton as t}from"../../../../../vs/platform/instantiation/common/extensions.js";import"../../../../../vs/platform/theme/common/themeService.js";import{registerWorkbenchContribution2 as s,WorkbenchPhase as i}from"../../../../../vs/workbench/common/contributions.js";import{PartsSplash as r}from"../../../../../vs/workbench/contrib/splash/browser/partsSplash.js";import{ISplashStorageService as n}from"../../../../../vs/workbench/contrib/splash/browser/splash.js";t(n,class{_serviceBrand;async saveWindowSplash(e){const a=JSON.stringify(e);localStorage.setItem("monaco-parts-splash",a)}},o.Delayed),s(r.ID,r,i.BlockStartup);
