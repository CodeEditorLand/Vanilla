import r from"assert";import{Selection as c}from"../../../common/core/selection.js";import{withTestCodeEditor as a}from"../testCodeEditor.js";suite("Editor Controller",()=>{test("issue #23913: Greater than 1000+ multi cursor typing replacement text appears inverted, lines begin to drop off selection",function(){this.timeout(1e4);const e=2e3,s=[];for(let n=0;n<e;n++)s[n]="asd";a(s,{},(n,o)=>{const l=n.getModel(),i=[];for(let t=0;t<e;t++)i[t]=new c(t+1,1,t+1,1);o.setSelections("test",i),o.type("n","keyboard"),o.type("n","keyboard");for(let t=0;t<e;t++)r.strictEqual(l.getLineContent(t+1),"nnasd","line #"+(t+1));r.strictEqual(o.getSelections().length,e),r.strictEqual(o.getSelections()[e-1].startLineNumber,e)})})});
