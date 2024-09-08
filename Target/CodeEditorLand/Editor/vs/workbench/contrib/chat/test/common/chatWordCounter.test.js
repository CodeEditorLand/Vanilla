import r from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as a}from"../../../../../base/test/common/utils.js";import{getNWords as h}from"../../common/chatWordCounter.js";suite("ChatWordCounter",()=>{a();function l(s,e,o){const t=h(s,e);r.strictEqual(t.value,o),r.strictEqual(t.returnedWordCount,e)}suite("getNWords",()=>{test("matching actualWordCount",()=>{[["hello world",1,"hello"],["hello",1,"hello"],["hello world",0,""],["here's, some.   punctuation?",3,"here's, some.   punctuation?"],["| markdown | _table_ | header |",3,"| markdown | _table_ | header"],["| --- | --- | --- |",1,"| ---"],["| --- | --- | --- |",3,"| --- | --- | ---"],[` 	 some 
 whitespace     


here   `,3,` 	 some 
 whitespace     


here`]].forEach(([e,o,t])=>l(e,o,t))}),test("matching links",()=>{[["[hello](https://example.com) world",1,"[hello](https://example.com)"],["[hello](https://example.com) world",2,"[hello](https://example.com) world"],['oh [hello](https://example.com "title") world',1,"oh"],['oh [hello](https://example.com "title") world',2,'oh [hello](https://example.com "title")'],["[hello](https://example.com?()) world",1,"[hello](https://example.com?())"],["[he \\[l\\] \\]lo](https://example.com?()) world",1,"[he \\[l\\] \\]lo](https://example.com?())"]].forEach(([e,o,t])=>l(e,o,t))}),test("code",()=>{[["let a=1-2",2,"let a"],["let a=1-2",3,"let a="],["let a=1-2",4,"let a=1"],["const myVar = 1+2",4,"const myVar = 1"],['<div id="myDiv"></div>',3,"<div id="],['<div id="myDiv"></div>',4,'<div id="myDiv"></div>']].forEach(([e,o,t])=>l(e,o,t))}),test("chinese characters",()=>{[["\u6211\u559C\u6B22\u4E2D\u56FD\u83DC",3,"\u6211\u559C\u6B22"]].forEach(([e,o,t])=>l(e,o,t))})})});
