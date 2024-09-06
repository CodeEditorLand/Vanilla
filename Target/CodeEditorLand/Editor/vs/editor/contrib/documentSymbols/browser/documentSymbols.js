import{CancellationToken as m}from"../../../../../vs/base/common/cancellation.js";import{assertType as n}from"../../../../../vs/base/common/types.js";import{URI as c}from"../../../../../vs/base/common/uri.js";import{ITextModelService as l}from"../../../../../vs/editor/common/services/resolverService.js";import{IOutlineModelService as s}from"../../../../../vs/editor/contrib/documentSymbols/browser/outlineModel.js";import{CommandsRegistry as a}from"../../../../../vs/platform/commands/common/commands.js";a.registerCommand("_executeDocumentSymbolProvider",async function(e,...t){const[o]=t;n(c.isUri(o));const i=e.get(s),r=await e.get(l).createModelReference(o);try{return(await i.getOrCreate(r.object.textEditorModel,m.None)).getTopLevelSymbols()}finally{r.dispose()}});
