import o from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as i}from"../../../../base/test/common/utils.js";import{PLAINTEXT_LANGUAGE_ID as e}from"../../../common/languages/modesRegistry.js";import{LanguageService as r}from"../../../common/services/languageService.js";suite("LanguageService",()=>{i(),test("LanguageSelection does not leak a disposable",()=>{const a=new r,s=a.createById(e);o.strictEqual(s.languageId,e);const t=a.createById(e),n=t.onDidChange(()=>{});o.strictEqual(t.languageId,e),n.dispose(),a.dispose()})});