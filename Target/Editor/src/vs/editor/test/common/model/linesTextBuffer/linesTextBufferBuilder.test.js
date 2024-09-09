import t from"assert";import*as i from"../../../../../base/common/strings.js";import{ensureNoDisposablesAreLeakedInTestSuite as d}from"../../../../../base/test/common/utils.js";import{DefaultEndOfLine as f}from"../../../../common/model.js";import{createTextBufferFactory as u}from"../../../../common/model/textModel.js";function e(r,n,l,a){const{disposable:s,textBuffer:o}=u(r).create(f.LF);t.strictEqual(o.mightContainNonBasicASCII(),l),t.strictEqual(o.mightContainRTL(),a),t.strictEqual(o.getEOL(),n),s.dispose()}suite("ModelBuilder",()=>{d(),test("t1",()=>{e("",`
`,!1,!1)}),test("t2",()=>{e("Hello world",`
`,!1,!1)}),test("t3",()=>{e(`Hello world
How are you?`,`
`,!1,!1)}),test("t4",()=>{e(`Hello world
How are you?
Is everything good today?
Do you enjoy the weather?`,`
`,!1,!1)}),test("carriage return detection (1 \\r\\n 2 \\n)",()=>{e(`Hello world\r
How are you?
Is everything good today?
Do you enjoy the weather?`,`
`,!1,!1)}),test("carriage return detection (2 \\r\\n 1 \\n)",()=>{e(`Hello world\r
How are you?\r
Is everything good today?
Do you enjoy the weather?`,`\r
`,!1,!1)}),test("carriage return detection (3 \\r\\n 0 \\n)",()=>{e(`Hello world\r
How are you?\r
Is everything good today?\r
Do you enjoy the weather?`,`\r
`,!1,!1)}),test("BOM handling",()=>{e(i.UTF8_BOM_CHARACTER+"Hello world!",`
`,!1,!1)}),test("RTL handling 2",()=>{e("Hello world!\u05D6\u05D5\u05D4\u05D9 \u05E2\u05D5\u05D1\u05D3\u05D4 \u05DE\u05D1\u05D5\u05E1\u05E1\u05EA \u05E9\u05D3\u05E2\u05EA\u05D5",`
`,!0,!0)}),test("RTL handling 3",()=>{e(`Hello world!\u05D6\u05D5\u05D4\u05D9 
\u05E2\u05D5\u05D1\u05D3\u05D4 \u05DE\u05D1\u05D5\u05E1\u05E1\u05EA \u05E9\u05D3\u05E2\u05EA\u05D5`,`
`,!0,!0)}),test("ASCII handling 1",()=>{e(`Hello world!!
How do you do?`,`
`,!1,!1)}),test("ASCII handling 2",()=>{e(`Hello world!!
How do you do?Z\xFCricha\u{1F4DA}\u{1F4DA}b`,`
`,!0,!1)})});
