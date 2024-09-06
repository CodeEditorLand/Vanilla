import{CancellationToken as p}from"../../../../base/common/cancellation.js";import{onUnexpectedExternalError as m}from"../../../../base/common/errors.js";import{assertType as g}from"../../../../base/common/types.js";import{URI as f}from"../../../../base/common/uri.js";import{CommandsRegistry as d}from"../../../../platform/commands/common/commands.js";import{RawContextKey as u}from"../../../../platform/contextkey/common/contextkey.js";import{Position as l}from"../../../common/core/position.js";import"../../../common/languageFeatureRegistry.js";import*as c from"../../../common/languages.js";import"../../../common/model.js";import{ILanguageFeaturesService as x}from"../../../common/services/languageFeatures.js";import{ITextModelService as S}from"../../../common/services/resolverService.js";const K={Visible:new u("parameterHintsVisible",!1),MultipleSignatures:new u("parameterHintsMultipleSignatures",!1)};async function y(t,i,o,n,r){const s=t.ordered(i);for(const a of s)try{const e=await a.provideSignatureHelp(i,o,r,n);if(e)return e}catch(e){m(e)}}d.registerCommand("_executeSignatureHelpProvider",async(t,...i)=>{const[o,n,r]=i;g(f.isUri(o)),g(l.isIPosition(n)),g(typeof r=="string"||!r);const s=t.get(x),a=await t.get(S).createModelReference(o);try{const e=await y(s.signatureHelpProvider,a.object.textEditorModel,l.lift(n),{triggerKind:c.SignatureHelpTriggerKind.Invoke,isRetrigger:!1,triggerCharacter:r},p.None);return e?(setTimeout(()=>e.dispose(),0),e.value):void 0}finally{a.dispose()}});export{K as Context,y as provideSignatureHelp};
