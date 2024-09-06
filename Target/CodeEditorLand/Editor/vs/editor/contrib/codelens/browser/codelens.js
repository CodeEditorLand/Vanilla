import{CancellationToken as u}from"../../../../../vs/base/common/cancellation.js";import{illegalArgument as L,onUnexpectedExternalError as C}from"../../../../../vs/base/common/errors.js";import{DisposableStore as p}from"../../../../../vs/base/common/lifecycle.js";import{assertType as f}from"../../../../../vs/base/common/types.js";import{URI as c}from"../../../../../vs/base/common/uri.js";import"../../../../../vs/editor/common/languageFeatureRegistry.js";import"../../../../../vs/editor/common/languages.js";import"../../../../../vs/editor/common/model.js";import{ILanguageFeaturesService as v}from"../../../../../vs/editor/common/services/languageFeatures.js";import{IModelService as y}from"../../../../../vs/editor/common/services/model.js";import{CommandsRegistry as b}from"../../../../../vs/platform/commands/common/commands.js";class h{lenses=[];_disposables=new p;dispose(){this._disposables.dispose()}get isDisposed(){return this._disposables.isDisposed}add(n,l){this._disposables.add(n);for(const r of n.lenses)this.lenses.push({symbol:r,provider:l})}}async function P(m,n,l){const r=m.ordered(n),t=new Map,s=new h,a=r.map(async(e,o)=>{t.set(e,o);try{const i=await Promise.resolve(e.provideCodeLenses(n,l));i&&s.add(i,e)}catch(i){C(i)}});return await Promise.all(a),s.lenses=s.lenses.sort((e,o)=>e.symbol.range.startLineNumber<o.symbol.range.startLineNumber?-1:e.symbol.range.startLineNumber>o.symbol.range.startLineNumber?1:t.get(e.provider)<t.get(o.provider)?-1:t.get(e.provider)>t.get(o.provider)?1:e.symbol.range.startColumn<o.symbol.range.startColumn?-1:e.symbol.range.startColumn>o.symbol.range.startColumn?1:0),s}b.registerCommand("_executeCodeLensProvider",function(m,...n){let[l,r]=n;f(c.isUri(l)),f(typeof r=="number"||!r);const{codeLensProvider:t}=m.get(v),s=m.get(y).getModel(l);if(!s)throw L();const a=[],e=new p;return P(t,s,u.None).then(o=>{e.add(o);const i=[];for(const d of o.lenses)r==null||d.symbol.command?a.push(d.symbol):r-- >0&&d.provider.resolveCodeLens&&i.push(Promise.resolve(d.provider.resolveCodeLens(s,d.symbol,u.None)).then(g=>a.push(g||d.symbol)));return Promise.all(i)}).then(()=>a).finally(()=>{setTimeout(()=>e.dispose(),100)})});export{h as CodeLensModel,P as getCodeLensModel};
