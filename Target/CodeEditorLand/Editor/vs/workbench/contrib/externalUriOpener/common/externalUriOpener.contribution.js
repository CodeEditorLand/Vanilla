import{Extensions as r}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{InstantiationType as i,registerSingleton as e}from"../../../../../vs/platform/instantiation/common/extensions.js";import{Registry as n}from"../../../../../vs/platform/registry/common/platform.js";import{externalUriOpenersConfigurationNode as o}from"../../../../../vs/workbench/contrib/externalUriOpener/common/configuration.js";import{ExternalUriOpenerService as t,IExternalUriOpenerService as a}from"../../../../../vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService.js";e(a,t,i.Delayed),n.as(r.Configuration).registerConfiguration(o);