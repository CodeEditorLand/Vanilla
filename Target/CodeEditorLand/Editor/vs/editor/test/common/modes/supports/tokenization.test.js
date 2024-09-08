import l from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as I}from"../../../../../base/test/common/utils.js";import{FontStyle as e}from"../../../../common/encodedTokenAttributes.js";import{ColorMap as u,ExternalThemeTrieElement as i,ParsedTokenThemeRule as r,ThemeTrieElementRule as s,TokenTheme as g,parseTokenTheme as E,strcmp as _}from"../../../../common/languages/supports/tokenization.js";suite("Token theme matching",()=>{I(),test("gives higher priority to deeper matches",()=>{const o=g.createFromRawTokenTheme([{token:"",foreground:"100000",background:"200000"},{token:"punctuation.definition.string.begin.html",foreground:"300000"},{token:"punctuation.definition.string",foreground:"400000"}],[]),t=new u;t.getId("100000");const c=t.getId("200000");t.getId("400000");const n=t.getId("300000"),d=o._match("punctuation.definition.string.begin.html");l.deepStrictEqual(d,new s(e.None,n,c))}),test("can match",()=>{const o=g.createFromRawTokenTheme([{token:"",foreground:"F8F8F2",background:"272822"},{token:"source",background:"100000"},{token:"something",background:"100000"},{token:"bar",background:"200000"},{token:"baz",background:"200000"},{token:"bar",fontStyle:"bold"},{token:"constant",fontStyle:"italic",foreground:"300000"},{token:"constant.numeric",foreground:"400000"},{token:"constant.numeric.hex",fontStyle:"bold"},{token:"constant.numeric.oct",fontStyle:"bold italic underline"},{token:"constant.numeric.bin",fontStyle:"bold strikethrough"},{token:"constant.numeric.dec",fontStyle:"",foreground:"500000"},{token:"storage.object.bar",fontStyle:"",foreground:"600000"}],[]),t=new u,c=t.getId("F8F8F2"),n=t.getId("272822"),d=t.getId("200000"),f=t.getId("300000"),m=t.getId("400000"),F=t.getId("500000"),w=t.getId("100000"),h=t.getId("600000");function b(p,T){const k=o._match(p);l.deepStrictEqual(k,T,"when matching <<"+p+">>")}function a(p,T,k,N){b(p,new s(T,k,N))}function S(p){b(p,new s(e.None,c,n))}S(""),S("bazz"),S("asdfg"),a("source",e.None,c,w),a("source.ts",e.None,c,w),a("source.tss",e.None,c,w),a("something",e.None,c,w),a("something.ts",e.None,c,w),a("something.tss",e.None,c,w),a("baz",e.None,c,d),a("baz.ts",e.None,c,d),a("baz.tss",e.None,c,d),a("constant",e.Italic,f,n),a("constant.string",e.Italic,f,n),a("constant.hex",e.Italic,f,n),a("constant.numeric",e.Italic,m,n),a("constant.numeric.baz",e.Italic,m,n),a("constant.numeric.hex",e.Bold,m,n),a("constant.numeric.hex.baz",e.Bold,m,n),a("constant.numeric.oct",e.Bold|e.Italic|e.Underline,m,n),a("constant.numeric.oct.baz",e.Bold|e.Italic|e.Underline,m,n),a("constant.numeric.bin",e.Bold|e.Strikethrough,m,n),a("constant.numeric.bin.baz",e.Bold|e.Strikethrough,m,n),a("constant.numeric.dec",e.None,F,n),a("constant.numeric.dec.baz",e.None,F,n),a("storage.object.bar",e.None,h,n),a("storage.object.bar.baz",e.None,h,n),a("storage.object.bart",e.None,c,n),a("storage.object",e.None,c,n),a("storage",e.None,c,n),a("bar",e.Bold,c,d)})}),suite("Token theme parsing",()=>{I(),test("can parse",()=>{const o=E([{token:"",foreground:"F8F8F2",background:"272822"},{token:"source",background:"100000"},{token:"something",background:"100000"},{token:"bar",background:"010000"},{token:"baz",background:"010000"},{token:"bar",fontStyle:"bold"},{token:"constant",fontStyle:"italic",foreground:"ff0000"},{token:"constant.numeric",foreground:"00ff00"},{token:"constant.numeric.hex",fontStyle:"bold"},{token:"constant.numeric.oct",fontStyle:"bold italic underline"},{token:"constant.numeric.dec",fontStyle:"",foreground:"0000ff"}]),t=[new r("",0,e.NotSet,"F8F8F2","272822"),new r("source",1,e.NotSet,null,"100000"),new r("something",2,e.NotSet,null,"100000"),new r("bar",3,e.NotSet,null,"010000"),new r("baz",4,e.NotSet,null,"010000"),new r("bar",5,e.Bold,null,null),new r("constant",6,e.Italic,"ff0000",null),new r("constant.numeric",7,e.NotSet,"00ff00",null),new r("constant.numeric.hex",8,e.Bold,null,null),new r("constant.numeric.oct",9,e.Bold|e.Italic|e.Underline,null,null),new r("constant.numeric.dec",10,e.None,"0000ff",null)];l.deepStrictEqual(o,t)})}),suite("Token theme resolving",()=>{I(),test("strcmp works",()=>{const o=["bar","z","zu","a","ab",""].sort(_),t=["","a","ab","bar","z","zu"];l.deepStrictEqual(o,t)}),test("always has defaults",()=>{const o=g.createFromParsedTokenTheme([],[]),t=new u,c=t.getId("000000"),n=t.getId("ffffff");l.deepStrictEqual(o.getColorMap(),t.getColorMap()),l.deepStrictEqual(o.getThemeTrieElement(),new i(new s(e.None,c,n)))}),test("respects incoming defaults 1",()=>{const o=g.createFromParsedTokenTheme([new r("",-1,e.NotSet,null,null)],[]),t=new u,c=t.getId("000000"),n=t.getId("ffffff");l.deepStrictEqual(o.getColorMap(),t.getColorMap()),l.deepStrictEqual(o.getThemeTrieElement(),new i(new s(e.None,c,n)))}),test("respects incoming defaults 2",()=>{const o=g.createFromParsedTokenTheme([new r("",-1,e.None,null,null)],[]),t=new u,c=t.getId("000000"),n=t.getId("ffffff");l.deepStrictEqual(o.getColorMap(),t.getColorMap()),l.deepStrictEqual(o.getThemeTrieElement(),new i(new s(e.None,c,n)))}),test("respects incoming defaults 3",()=>{const o=g.createFromParsedTokenTheme([new r("",-1,e.Bold,null,null)],[]),t=new u,c=t.getId("000000"),n=t.getId("ffffff");l.deepStrictEqual(o.getColorMap(),t.getColorMap()),l.deepStrictEqual(o.getThemeTrieElement(),new i(new s(e.Bold,c,n)))}),test("respects incoming defaults 4",()=>{const o=g.createFromParsedTokenTheme([new r("",-1,e.NotSet,"ff0000",null)],[]),t=new u,c=t.getId("ff0000"),n=t.getId("ffffff");l.deepStrictEqual(o.getColorMap(),t.getColorMap()),l.deepStrictEqual(o.getThemeTrieElement(),new i(new s(e.None,c,n)))}),test("respects incoming defaults 5",()=>{const o=g.createFromParsedTokenTheme([new r("",-1,e.NotSet,null,"ff0000")],[]),t=new u,c=t.getId("000000"),n=t.getId("ff0000");l.deepStrictEqual(o.getColorMap(),t.getColorMap()),l.deepStrictEqual(o.getThemeTrieElement(),new i(new s(e.None,c,n)))}),test("can merge incoming defaults",()=>{const o=g.createFromParsedTokenTheme([new r("",-1,e.NotSet,null,"ff0000"),new r("",-1,e.NotSet,"00ff00",null),new r("",-1,e.Bold,null,null)],[]),t=new u,c=t.getId("00ff00"),n=t.getId("ff0000");l.deepStrictEqual(o.getColorMap(),t.getColorMap()),l.deepStrictEqual(o.getThemeTrieElement(),new i(new s(e.Bold,c,n)))}),test("defaults are inherited",()=>{const o=g.createFromParsedTokenTheme([new r("",-1,e.NotSet,"F8F8F2","272822"),new r("var",-1,e.NotSet,"ff0000",null)],[]),t=new u,c=t.getId("F8F8F2"),n=t.getId("272822"),d=t.getId("ff0000");l.deepStrictEqual(o.getColorMap(),t.getColorMap());const f=new i(new s(e.None,c,n),{var:new i(new s(e.None,d,n))});l.deepStrictEqual(o.getThemeTrieElement(),f)}),test("same rules get merged",()=>{const o=g.createFromParsedTokenTheme([new r("",-1,e.NotSet,"F8F8F2","272822"),new r("var",1,e.Bold,null,null),new r("var",0,e.NotSet,"ff0000",null)],[]),t=new u,c=t.getId("F8F8F2"),n=t.getId("272822"),d=t.getId("ff0000");l.deepStrictEqual(o.getColorMap(),t.getColorMap());const f=new i(new s(e.None,c,n),{var:new i(new s(e.Bold,d,n))});l.deepStrictEqual(o.getThemeTrieElement(),f)}),test("rules are inherited 1",()=>{const o=g.createFromParsedTokenTheme([new r("",-1,e.NotSet,"F8F8F2","272822"),new r("var",-1,e.Bold,"ff0000",null),new r("var.identifier",-1,e.NotSet,"00ff00",null)],[]),t=new u,c=t.getId("F8F8F2"),n=t.getId("272822"),d=t.getId("ff0000"),f=t.getId("00ff00");l.deepStrictEqual(o.getColorMap(),t.getColorMap());const m=new i(new s(e.None,c,n),{var:new i(new s(e.Bold,d,n),{identifier:new i(new s(e.Bold,f,n))})});l.deepStrictEqual(o.getThemeTrieElement(),m)}),test("rules are inherited 2",()=>{const o=g.createFromParsedTokenTheme([new r("",-1,e.NotSet,"F8F8F2","272822"),new r("var",-1,e.Bold,"ff0000",null),new r("var.identifier",-1,e.NotSet,"00ff00",null),new r("constant",4,e.Italic,"100000",null),new r("constant.numeric",5,e.NotSet,"200000",null),new r("constant.numeric.hex",6,e.Bold,null,null),new r("constant.numeric.oct",7,e.Bold|e.Italic|e.Underline,null,null),new r("constant.numeric.dec",8,e.None,"300000",null)],[]),t=new u,c=t.getId("F8F8F2"),n=t.getId("272822"),d=t.getId("100000"),f=t.getId("200000"),m=t.getId("300000"),F=t.getId("ff0000"),w=t.getId("00ff00");l.deepStrictEqual(o.getColorMap(),t.getColorMap());const h=new i(new s(e.None,c,n),{var:new i(new s(e.Bold,F,n),{identifier:new i(new s(e.Bold,w,n))}),constant:new i(new s(e.Italic,d,n),{numeric:new i(new s(e.Italic,f,n),{hex:new i(new s(e.Bold,f,n)),oct:new i(new s(e.Bold|e.Italic|e.Underline,f,n)),dec:new i(new s(e.None,m,n))})})});l.deepStrictEqual(o.getThemeTrieElement(),h)}),test("custom colors are first in color map",()=>{const o=g.createFromParsedTokenTheme([new r("var",-1,e.NotSet,"F8F8F2",null)],["000000","FFFFFF","0F0F0F"]),t=new u;t.getId("000000"),t.getId("FFFFFF"),t.getId("0F0F0F"),t.getId("F8F8F2"),l.deepStrictEqual(o.getColorMap(),t.getColorMap())})});
