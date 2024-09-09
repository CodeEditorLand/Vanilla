import u from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as C}from"../../../../base/test/common/utils.js";import{EditorOptions as s,WrappingIndent as n}from"../../../common/config/editorOptions.js";import{FontInfo as y}from"../../../common/config/fontInfo.js";import{ModelLineProjectionData as W}from"../../../common/modelLineProjectionData.js";import{MonospaceLineBreaksComputerFactory as o}from"../../../common/viewModel/monospaceLineBreaksComputer.js";function x(l){let i="",e=0;const t=[];for(let r=0,c=l.length;r<c;r++)l.charAt(r)==="|"?e++:(i+=l.charAt(r),t[i.length-1]=e);return{text:i,indices:t}}function h(l,i){let e="";if(i){let t=0;for(let r=0,c=l.length;r<c;r++){const m=i.translateToOutputPosition(r);t!==m.outputLineIndex&&(t=m.outputLineIndex,e+="|"),e+=l.charAt(r)}}else e=l;return e}function w(l,i,e,t,r,c,m,d){const p=new y({pixelRatio:1,fontFamily:"testFontFamily",fontWeight:"normal",fontSize:14,fontFeatureSettings:"",fontVariationSettings:"",lineHeight:19,letterSpacing:0,isMonospace:!0,typicalHalfwidthCharacterWidth:7,typicalFullwidthCharacterWidth:7*t,canUseHalfwidthRightwardsArrow:!0,spaceWidth:7,middotWidth:7,wsmiddotWidth:7,maxDigitWidth:7},!1),f=l.createLineBreaksComputer(p,i,e,r,c),b=d?new W(null,null,d.breakOffsets.slice(0),d.breakOffsetsVisibleColumn.slice(0),d.wrappedTextIndentLength):null;return f.addRequest(m,null,b),f.finalize()[0]}function a(l,i,e,t,r=n.None,c="normal"){const m=x(t).text,d=w(l,i,e,2,r,c,m,null),p=h(m,d);return u.strictEqual(p,t),d}suite("Editor ViewModel - MonospaceLineBreaksComputer",()=>{C(),test("MonospaceLineBreaksComputer",()=>{const e=new o("(","	).");a(e,4,5,""),a(e,4,5,"aaa"),a(e,4,5,"aaaaa"),a(e,4,-1,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),a(e,4,5,"aaaaa|a"),a(e,4,5,"aaaaa|."),a(e,4,5,"aaaaa|a.|aaa.|aa"),a(e,4,5,"aaaaa|a..|aaa.|aa"),a(e,4,5,"aaaaa|a...|aaa.|aa"),a(e,4,5,"aaaaa|a....|aaa.|aa"),a(e,4,5,"	"),a(e,4,5,"	|aaa"),a(e,4,5,"	|a	|aa"),a(e,4,5,"aa	a"),a(e,4,5,"aa	|aa"),a(e,4,5,"aaa.|aa"),a(e,4,5,"aaa(.|aa"),a(e,4,5,"aaa))|).aaa"),a(e,4,5,"aaa))|).|aaaa"),a(e,4,5,"aaa)|().|aaa"),a(e,4,5,"aaa|(().|aaa"),a(e,4,5,"aa.|(().|aaa"),a(e,4,5,"aa.|(.).|aaa")});function l(e,t){if(!e||!t){u.deepStrictEqual(e,t);return}u.deepStrictEqual(e.breakOffsets,t.breakOffsets),u.deepStrictEqual(e.wrappedTextIndentLength,t.wrappedTextIndentLength);for(let r=0;r<e.breakOffsetsVisibleColumn.length;r++){const c=e.breakOffsetsVisibleColumn[r]-t.breakOffsetsVisibleColumn[r];u.ok(c<.001)}}function i(e,t,r,c,m,d,p,f=n.None,b=2){u.strictEqual(t,x(m).text),u.strictEqual(t,x(p).text);const g=w(e,r,c,b,f,"normal",t,null);u.strictEqual(h(t,g),m);const v=w(e,r,d,b,f,"normal",t,null);u.strictEqual(h(t,v),p);const k=w(e,r,d,b,f,"normal",t,g);u.strictEqual(h(t,k),p),l(k,v);const B=w(e,r,c,b,f,"normal",t,v);u.strictEqual(h(t,B),m),l(B,g)}test("MonospaceLineBreaksComputer incremental 1",()=>{const e=new o(s.wordWrapBreakBeforeCharacters.defaultValue,s.wordWrapBreakAfterCharacters.defaultValue);i(e,"just some text and more",4,10,"just some |text and |more",15,"just some text |and more"),i(e,"Cu scripserit suscipiantur eos, in affert pericula contentiones sed, cetero sanctus et pro. Ius vidit magna regione te, sit ei elaboraret liberavisse. Mundi verear eu mea, eam vero scriptorem in, vix in menandri assueverit. Natum definiebas cu vim. Vim doming vocibus efficiantur id. In indoctum deseruisse voluptatum vim, ad debitis verterem sed.",4,47,"Cu scripserit suscipiantur eos, in affert |pericula contentiones sed, cetero sanctus et |pro. Ius vidit magna regione te, sit ei |elaboraret liberavisse. Mundi verear eu mea, |eam vero scriptorem in, vix in menandri |assueverit. Natum definiebas cu vim. Vim |doming vocibus efficiantur id. In indoctum |deseruisse voluptatum vim, ad debitis verterem |sed.",142,"Cu scripserit suscipiantur eos, in affert pericula contentiones sed, cetero sanctus et pro. Ius vidit magna regione te, sit ei elaboraret |liberavisse. Mundi verear eu mea, eam vero scriptorem in, vix in menandri assueverit. Natum definiebas cu vim. Vim doming vocibus efficiantur |id. In indoctum deseruisse voluptatum vim, ad debitis verterem sed."),i(e,"An his legere persecuti, oblique delicata efficiantur ex vix, vel at graecis officiis maluisset. Et per impedit voluptua, usu discere maiorum at. Ut assum ornatus temporibus vis, an sea melius pericula. Ea dicunt oblique phaedrum nam, eu duo movet nobis. His melius facilis eu, vim malorum temporibus ne. Nec no sale regione, meliore civibus placerat id eam. Mea alii fabulas definitionem te, agam volutpat ad vis, et per bonorum nonumes repudiandae.",4,57,"An his legere persecuti, oblique delicata efficiantur ex |vix, vel at graecis officiis maluisset. Et per impedit |voluptua, usu discere maiorum at. Ut assum ornatus |temporibus vis, an sea melius pericula. Ea dicunt |oblique phaedrum nam, eu duo movet nobis. His melius |facilis eu, vim malorum temporibus ne. Nec no sale |regione, meliore civibus placerat id eam. Mea alii |fabulas definitionem te, agam volutpat ad vis, et per |bonorum nonumes repudiandae.",58,"An his legere persecuti, oblique delicata efficiantur ex |vix, vel at graecis officiis maluisset. Et per impedit |voluptua, usu discere maiorum at. Ut assum ornatus |temporibus vis, an sea melius pericula. Ea dicunt oblique |phaedrum nam, eu duo movet nobis. His melius facilis eu, |vim malorum temporibus ne. Nec no sale regione, meliore |civibus placerat id eam. Mea alii fabulas definitionem |te, agam volutpat ad vis, et per bonorum nonumes |repudiandae."),i(e,'		"owner": "vscode",',4,14,'		"owner|": |"vscod|e",',16,'		"owner":| |"vscode"|,',n.Same),i(e,"\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}&\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}",4,51,"\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}&|\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}",50,"\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}|&|\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}",n.Same),i(e,"\u{1F407}\u{1F46C}&\u{1F31E}\u{1F316}",4,5,"\u{1F407}\u{1F46C}&|\u{1F31E}\u{1F316}",4,"\u{1F407}\u{1F46C}|&|\u{1F31E}\u{1F316}",n.Same),i(e,"		func('\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}&\u{1F46C}\u{1F316}\u{1F31E}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}', WrappingIndent.Same);",4,26,"		func|('\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}&|\u{1F46C}\u{1F316}\u{1F31E}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}|\u{1F46C}', |WrappingIndent.|Same);",27,"		func|('\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}&|\u{1F46C}\u{1F316}\u{1F31E}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}|\u{1F46C}', |WrappingIndent.|Same);",n.Same),i(e,'factory, "xtxtfunc(x"\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}&\u{1F46C}\u{1F316}\u{1F31E}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}x"',4,16,'factory, |"xtxtfunc|(x"\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F31E}\u{1F3C7}\u{1F37C}|\u{1F407}&|\u{1F46C}\u{1F316}\u{1F31E}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}|\u{1F407}\u{1F46C}x"',17,'factory, |"xtxtfunc|(x"\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}|&\u{1F46C}\u{1F316}\u{1F31E}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}|\u{1F407}\u{1F46C}x"',n.Same)}),test("issue #95686: CRITICAL: loop forever on the monospaceLineBreaksComputer",()=>{const e=new o(s.wordWrapBreakBeforeCharacters.defaultValue,s.wordWrapBreakAfterCharacters.defaultValue);i(e,'						<tr dmx-class:table-danger="(alt <= 50)" dmx-class:table-warning="(alt <= 200)" dmx-class:table-primary="(alt <= 400)" dmx-class:table-info="(alt <= 800)" dmx-class:table-success="(alt >= 400)">',4,179,'						<tr dmx-class:table-danger="(alt <= 50)" dmx-class:table-warning="(alt <= 200)" dmx-class:table-primary="(alt <= 400)" dmx-class:table-info="(alt <= 800)" |dmx-class:table-success="(alt >= 400)">',1,'	|	|	|	|	|	|<|t|r| |d|m|x|-|c|l|a|s|s|:|t|a|b|l|e|-|d|a|n|g|e|r|=|"|(|a|l|t| |<|=| |5|0|)|"| |d|m|x|-|c|l|a|s|s|:|t|a|b|l|e|-|w|a|r|n|i|n|g|=|"|(|a|l|t| |<|=| |2|0|0|)|"| |d|m|x|-|c|l|a|s|s|:|t|a|b|l|e|-|p|r|i|m|a|r|y|=|"|(|a|l|t| |<|=| |4|0|0|)|"| |d|m|x|-|c|l|a|s|s|:|t|a|b|l|e|-|i|n|f|o|=|"|(|a|l|t| |<|=| |8|0|0|)|"| |d|m|x|-|c|l|a|s|s|:|t|a|b|l|e|-|s|u|c|c|e|s|s|=|"|(|a|l|t| |>|=| |4|0|0|)|"|>',n.Same)}),test("issue #110392: Occasional crash when resize with panel on the right",()=>{const e=new o(s.wordWrapBreakBeforeCharacters.defaultValue,s.wordWrapBreakAfterCharacters.defaultValue);i(e,"\u4F60\u597D **hello** **hello** **hello-world** hey there!",4,15,"\u4F60\u597D **hello** |**hello** |**hello-world**| hey there!",1,"\u4F60|\u597D| |*|*|h|e|l|l|o|*|*| |*|*|h|e|l|l|o|*|*| |*|*|h|e|l|l|o|-|w|o|r|l|d|*|*| |h|e|y| |t|h|e|r|e|!",n.Same,1.6605405405405405)}),test("MonospaceLineBreaksComputer - CJK and Kinsoku Shori",()=>{const e=new o("(","	)");a(e,4,5,"aa \u5B89|\u5B89"),a(e,4,5,"\u3042 \u5B89|\u5B89"),a(e,4,5,"\u3042\u3042|\u5B89\u5B89"),a(e,4,5,"aa |\u5B89)\u5B89|\u5B89"),a(e,4,5,"aa \u3042|\u5B89\u3042)|\u5B89"),a(e,4,5,"aa |(\u5B89aa|\u5B89")}),test("MonospaceLineBreaksComputer - WrappingIndent.Same",()=>{const e=new o("","	 ");a(e,4,38," *123456789012345678901234567890123456|7890",n.Same)}),test("issue #16332: Scroll bar overlaying on top of text",()=>{const e=new o("","	 ");a(e,4,24,"a/ very/long/line/of/tex|t/that/expands/beyon|d/your/typical/line/|of/code/",n.Indent)}),test("issue #35162: wrappingIndent not consistently working",()=>{const e=new o("","	 "),t=a(e,4,24,"                t h i s |i s |a l |o n |g l |i n |e",n.Indent);u.strictEqual(t.wrappedTextIndentLength,20)}),test("issue #75494: surrogate pairs",()=>{const e=new o("	"," ");a(e,4,49,"\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}|\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}|\u{1F407}\u{1F46C}",n.Same)}),test("issue #75494: surrogate pairs overrun 1",()=>{const e=new o(s.wordWrapBreakBeforeCharacters.defaultValue,s.wordWrapBreakAfterCharacters.defaultValue);a(e,4,4,"\u{1F407}\u{1F46C}|&|\u{1F31E}\u{1F316}",n.Same)}),test("issue #75494: surrogate pairs overrun 2",()=>{const e=new o(s.wordWrapBreakBeforeCharacters.defaultValue,s.wordWrapBreakAfterCharacters.defaultValue);a(e,4,17,'factory, |"xtxtfunc|(x"\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F31E}\u{1F3C7}\u{1F37C}\u{1F407}|&\u{1F46C}\u{1F316}\u{1F31E}\u{1F46C}\u{1F316}\u{1F31E}\u{1F3C7}\u{1F37C}|\u{1F407}\u{1F46C}x"',n.Same)}),test("MonospaceLineBreaksComputer - WrappingIndent.DeepIndent",()=>{const e=new o("","	 "),t=a(e,4,26,"        W e A r e T e s t |i n g D e |e p I n d |e n t a t |i o n",n.DeepIndent);u.strictEqual(t.wrappedTextIndentLength,16)}),test("issue #33366: Word wrap algorithm behaves differently around punctuation",()=>{const e=new o(s.wordWrapBreakBeforeCharacters.defaultValue,s.wordWrapBreakAfterCharacters.defaultValue);a(e,4,23,"this is a line of |text, text that sits |on a line",n.Same)}),test("issue #152773: Word wrap algorithm behaves differently with bracket followed by comma",()=>{const e=new o(s.wordWrapBreakBeforeCharacters.defaultValue,s.wordWrapBreakAfterCharacters.defaultValue);a(e,4,24,"this is a line of |(text), text that sits |on a line",n.Same)}),test("issue #112382: Word wrap doesn't work well with control characters",()=>{const e=new o(s.wordWrapBreakBeforeCharacters.defaultValue,s.wordWrapBreakAfterCharacters.defaultValue);a(e,4,6,"|",n.Same)}),test("Word break work well with Chinese/Japanese/Korean (CJK) text when setting normal",()=>{const e=new o(s.wordWrapBreakBeforeCharacters.defaultValue,s.wordWrapBreakAfterCharacters.defaultValue);a(e,4,5,"\u4F60\u597D|1111",n.Same,"normal")}),test("Word break work well with Chinese/Japanese/Korean (CJK) text when setting keepAll",()=>{const e=new o(s.wordWrapBreakBeforeCharacters.defaultValue,s.wordWrapBreakAfterCharacters.defaultValue);a(e,4,8,"\u4F60\u597D1111",n.Same,"keepAll")})});
