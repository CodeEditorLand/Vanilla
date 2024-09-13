import{localize as i}from"../../../../nls.js";import{Extensions as t}from"../../../../platform/configuration/common/configurationRegistry.js";import{Registry as r}from"../../../../platform/registry/common/platform.js";import{applicationConfigurationNodeBase as n}from"../../../common/configuration.js";import{Extensions as e}from"../../../common/contributions.js";import{LifecyclePhase as o}from"../../../services/lifecycle/common/lifecycle.js";import{RendererProfiling as a}from"./rendererAutoProfiler.js";import{StartupProfiler as s}from"./startupProfiler.js";import{NativeStartupTimings as p}from"./startupTimings.js";r.as(e.Workbench).registerWorkbenchContribution(a,o.Eventually),r.as(e.Workbench).registerWorkbenchContribution(s,o.Restored),r.as(e.Workbench).registerWorkbenchContribution(p,o.Eventually),r.as(t.Configuration).registerConfiguration({...n,properties:{"application.experimental.rendererProfiling":{type:"boolean",default:!1,tags:["experimental"],markdownDescription:i("experimental.rendererProfiling","When enabled slow renderers are automatically profiled")}}});
