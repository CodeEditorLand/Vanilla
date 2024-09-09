import d from"assert";import{Event as v}from"../../../../../base/common/event.js";import{DisposableStore as S}from"../../../../../base/common/lifecycle.js";import{URI as I}from"../../../../../base/common/uri.js";import{mock as g}from"../../../../../base/test/common/mock.js";import"../../../../common/core/position.js";import"../../../../common/core/range.js";import{DEFAULT_WORD_REGEXP as l}from"../../../../common/core/wordHelper.js";import"../../../../common/languages.js";import{ILanguageConfigurationService as w}from"../../../../common/languages/languageConfigurationRegistry.js";import{BaseEditorSimpleWorker as C}from"../../../../common/services/editorSimpleWorker.js";import{EditorWorkerService as b}from"../../../../browser/services/editorWorkerService.js";import"../../../../common/services/model.js";import"../../../../common/services/textResourceConfiguration.js";import{CompletionItem as L}from"../../browser/suggest.js";import{WordDistance as k}from"../../browser/wordDistance.js";import{createCodeEditorServices as R,instantiateTestCodeEditor as N}from"../../../../test/browser/testCodeEditor.js";import{instantiateTextModel as E}from"../../../../test/common/testTextModel.js";import{TestLanguageConfigurationService as D}from"../../../../test/common/modes/testLanguageConfigurationService.js";import{NullLogService as M}from"../../../../../platform/log/common/log.js";import{LanguageFeaturesService as T}from"../../../../common/services/languageFeaturesService.js";import{ILanguageService as x}from"../../../../common/languages/language.js";import{ensureNoDisposablesAreLeakedInTestSuite as W}from"../../../../../base/test/common/utils.js";suite("suggest, word distance",function(){let m;const r=new S;setup(async function(){const e="bracketMode";r.clear();const n=R(r),t=n.get(w),i=n.get(x);r.add(i.registerLanguage({id:e})),r.add(t.register(e,{brackets:[["{","}"],["[","]"],["(",")"]]}));const o=r.add(E(n,`function abc(aa, ab){
a
}`,e,void 0,I.parse("test:///some.path"))),s=r.add(N(n,o));s.updateOptions({suggest:{localityBonus:!0}}),s.setPosition({lineNumber:2,column:2});const p=new class extends g(){onModelRemoved=v.None;getModel(a){return a.toString()===o.uri.toString()?o:null}},u=new class extends b{_worker=new C;constructor(){super(null,p,new class extends g(){},new M,new D,new T),this._worker.$acceptNewModel({url:o.uri.toString(),lines:o.getLinesContent(),EOL:o.getEOL(),versionId:o.getVersionId()}),o.onDidChangeContent(a=>this._worker.$acceptModelChanged(o.uri.toString(),a))}computeWordRanges(a,f){return this._worker.$computeWordRanges(a.toString(),f,l.source,l.flags)}};m=await k.create(u,s),r.add(u)}),teardown(function(){r.clear()}),W();function c(e,n,t){const i={label:e,range:{startLineNumber:t.lineNumber,startColumn:t.column-n,endLineNumber:t.lineNumber,endColumn:t.column},insertText:e,kind:0},o={suggestions:[i]},s={_debugDisplayName:"test",provideCompletionItems(){}};return new L(t,i,o,s)}test("Suggest locality bonus can boost current word #90515",function(){const e={lineNumber:2,column:2},n=m.distance(e,c("a",1,e).completion),t=m.distance(e,c("aa",1,e).completion),i=m.distance(e,c("ab",1,e).completion);d.ok(n>t),d.ok(t===i)})});
