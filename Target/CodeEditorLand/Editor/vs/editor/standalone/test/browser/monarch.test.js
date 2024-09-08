import l from"assert";import{DisposableStore as m}from"../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as h}from"../../../../base/test/common/utils.js";import{Token as e,TokenizationRegistry as k}from"../../../common/languages.js";import"../../../common/languages/language.js";import{LanguageService as u}from"../../../common/services/languageService.js";import{StandaloneConfigurationService as d}from"../../browser/standaloneServices.js";import{compile as S}from"../../common/monarch/monarchCompile.js";import{MonarchTokenizer as T}from"../../common/monarch/monarchLexer.js";import"../../common/monarch/monarchTypes.js";import"../../../../platform/configuration/common/configuration.js";import{NullLogService as g}from"../../../../platform/log/common/log.js";suite("Monarch",()=>{h();function a(t,n,s,o){return new T(t,null,n,S(n,s),o)}function c(t,n){const s=[];let o=t.getInitialState();for(const r of n){const i=t.tokenize(r,!0,o);s.push(i.tokens),o=i.endState}return s}test("Ensure @rematch and nextEmbedded can be used together in Monarch grammar",()=>{const t=new m,n=t.add(new u),s=new d(new g);t.add(n.registerLanguage({id:"sql"})),t.add(k.register("sql",t.add(a(n,"sql",{tokenizer:{root:[[/./,"token"]]}},s))));const o="(SELECT|INSERT|UPDATE|DELETE|CREATE|REPLACE|ALTER|WITH)",r=t.add(a(n,"test1",{tokenizer:{root:[[`(""")${o}`,[{token:"string.quote"},{token:"@rematch",next:"@endStringWithSQL",nextEmbedded:"sql"}]],[/(""")$/,[{token:"string.quote",next:"@maybeStringIsSQL"}]]],maybeStringIsSQL:[[/(.*)/,{cases:{[`${o}\\b.*`]:{token:"@rematch",next:"@endStringWithSQL",nextEmbedded:"sql"},"@default":{token:"@rematch",switchTo:"@endDblDocString"}}}]],endDblDocString:[["[^']+","string"],["\\\\'","string"],["'''","string","@popall"],["'","string"]],endStringWithSQL:[[/"""/,{token:"string.quote",next:"@popall",nextEmbedded:"@pop"}]]}},s)),w=c(r,[`mysql_query("""SELECT * FROM table_name WHERE ds = '<DATEID>'""")`,'mysql_query("""',"SELECT *","FROM table_name","WHERE ds = '<DATEID>'",'""")']);l.deepStrictEqual(w,[[new e(0,"source.test1","test1"),new e(12,"string.quote.test1","test1"),new e(15,"token.sql","sql"),new e(61,"string.quote.test1","test1"),new e(64,"source.test1","test1")],[new e(0,"source.test1","test1"),new e(12,"string.quote.test1","test1")],[new e(0,"token.sql","sql")],[new e(0,"token.sql","sql")],[new e(0,"token.sql","sql")],[new e(0,"string.quote.test1","test1"),new e(3,"source.test1","test1")]]),t.dispose()}),test("microsoft/monaco-editor#1235: Empty Line Handling",()=>{const t=new m,n=new d(new g),s=t.add(new u),o=t.add(a(s,"test",{tokenizer:{root:[{include:"@comments"}],comments:[[/\/\/$/,"comment"],[/\/\//,"comment","@comment_cpp"]],comment_cpp:[[/(?:[^\\]|(?:\\.))+$/,"comment","@pop"],[/.+$/,"comment"],[/$/,"comment","@pop"]]}},n)),i=c(o,["// This comment \\","   continues on the following line","","// This comment does NOT continue \\\\","   because the escape char was itself escaped","","// This comment DOES continue because \\\\\\","   the 1st '\\' escapes the 2nd; the 3rd escapes EOL","","// This comment continues to the following line \\","","But the line was empty. This line should not be commented."]);l.deepStrictEqual(i,[[new e(0,"comment.test","test")],[new e(0,"comment.test","test")],[],[new e(0,"comment.test","test")],[new e(0,"source.test","test")],[],[new e(0,"comment.test","test")],[new e(0,"comment.test","test")],[],[new e(0,"comment.test","test")],[],[new e(0,"source.test","test")]]),t.dispose()}),test("microsoft/monaco-editor#2265: Exit a state at end of line",()=>{const t=new m,n=new d(new g),s=t.add(new u),o=t.add(a(s,"test",{includeLF:!0,tokenizer:{root:[[/^\*/,"","@inner"],[/\:\*/,"","@inner"],[/[^*:]+/,"string"],[/[*:]/,"string"]],inner:[[/\n/,"","@pop"],[/\d+/,"number"],[/[^\d]+/,""]]}},n)),i=c(o,["PRINT 10 * 20","*FX200, 3","PRINT 2*3:*FX200, 3"]);l.deepStrictEqual(i,[[new e(0,"string.test","test")],[new e(0,"","test"),new e(3,"number.test","test"),new e(6,"","test"),new e(8,"number.test","test")],[new e(0,"string.test","test"),new e(9,"","test"),new e(13,"number.test","test"),new e(16,"","test"),new e(18,"number.test","test")]]),t.dispose()}),test("issue #115662: monarchCompile function need an extra option which can control replacement",()=>{const t=new m,n=new d(new g),s=t.add(new u),o=t.add(a(s,"test",{ignoreCase:!1,uselessReplaceKey1:"@uselessReplaceKey2",uselessReplaceKey2:"@uselessReplaceKey3",uselessReplaceKey3:"@uselessReplaceKey4",uselessReplaceKey4:"@uselessReplaceKey5",uselessReplaceKey5:"@ham",tokenizer:{root:[{regex:/@\w+/.test("@ham")?new RegExp("^@uselessReplaceKey1$"):new RegExp("^@ham$"),action:{token:"ham"}}]}},n)),r=t.add(a(s,"test",{ignoreCase:!1,tokenizer:{root:[{regex:/@@ham/,action:{token:"ham"}}]}},n)),i=["@ham"],w=c(o,i);l.deepStrictEqual(w,[[new e(0,"ham.test","test")]]);const p=c(r,i);l.deepStrictEqual(p,[[new e(0,"ham.test","test")]]),t.dispose()}),test("microsoft/monaco-editor#2424: Allow to target @@",()=>{const t=new m,n=new d(new g),s=t.add(new u),o=t.add(a(s,"test",{ignoreCase:!1,tokenizer:{root:[{regex:/@@@@/,action:{token:"ham"}}]}},n)),i=c(o,["@@"]);l.deepStrictEqual(i,[[new e(0,"ham.test","test")]]),t.dispose()}),test("microsoft/monaco-editor#3025: Check maxTokenizationLineLength before tokenizing",async()=>{const t=new m,n=new d(new g),s=t.add(new u);await n.updateValue("editor.maxTokenizationLineLength",4);const o=t.add(a(s,"test",{tokenizer:{root:[{regex:/ham/,action:{token:"ham"}}]}},n)),i=c(o,["ham","hamham"]);l.deepStrictEqual(i,[[new e(0,"ham.test","test")],[new e(0,"","test")]]),t.dispose()}),test("microsoft/monaco-editor#3128: allow state access within rules",()=>{const t=new m,n=new d(new g),s=t.add(new u),o=t.add(a(s,"test",{ignoreCase:!1,encoding:/u|u8|U|L/,tokenizer:{root:[[/@encoding?R\"(?:([^ ()\\\t]*))\(/,{token:"string.raw.begin",next:"@raw.$1"}]],raw:[[/.*\)$S2\"/,"string.raw","@pop"],[/.*/,"string.raw"]]}},n)),i=c(o,["int main(){","",'	auto s = R""""(',"	Hello World",'	)"""";',"",'	std::cout << "hello";',"","}"]);l.deepStrictEqual(i,[[new e(0,"source.test","test")],[],[new e(0,"source.test","test"),new e(10,"string.raw.begin.test","test")],[new e(0,"string.raw.test","test")],[new e(0,"string.raw.test","test"),new e(6,"source.test","test")],[],[new e(0,"source.test","test")],[],[new e(0,"source.test","test")]]),t.dispose()})});
