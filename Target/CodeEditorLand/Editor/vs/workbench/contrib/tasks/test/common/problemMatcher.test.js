import*as n from"../../common/problemMatcher.js";import e from"assert";import{ValidationState as i,ValidationStatus as o}from"../../../../../base/common/parsers.js";class p{_validationStatus;_messages;constructor(){this._validationStatus=new o,this._messages=[]}info(a){this._messages.push(a),this._validationStatus.state=i.Info}warn(a){this._messages.push(a),this._validationStatus.state=i.Warning}error(a){this._messages.push(a),this._validationStatus.state=i.Error}fatal(a){this._messages.push(a),this._validationStatus.state=i.Fatal}hasMessage(a){return this._messages.indexOf(a)!==null}get messages(){return this._messages}get state(){return this._validationStatus.state}isOK(){return this._validationStatus.isOK()}get status(){return this._validationStatus}}suite("ProblemPatternParser",()=>{let r,a;const l=new RegExp("test");setup(()=>{r=new p,a=new n.ProblemPatternParser(r)}),suite("single-pattern definitions",()=>{test("parses a pattern defined by only a regexp",()=>{const t={regexp:"test"},s=a.parse(t);e(r.isOK()),e.deepStrictEqual(s,{regexp:l,kind:n.ProblemLocationKind.Location,file:1,line:2,character:3,message:0})}),test("does not sets defaults for line and character if kind is File",()=>{const t={regexp:"test",kind:"file"},s=a.parse(t);e.deepStrictEqual(s,{regexp:l,kind:n.ProblemLocationKind.File,file:1,message:0})})}),suite("multi-pattern definitions",()=>{test("defines a pattern based on regexp and property fields, with file/line location",()=>{const t=[{regexp:"test",file:3,line:4,column:5,message:6}],s=a.parse(t);e(r.isOK()),e.deepStrictEqual(s,[{regexp:l,kind:n.ProblemLocationKind.Location,file:3,line:4,character:5,message:6}])}),test("defines a pattern bsaed on regexp and property fields, with location",()=>{const t=[{regexp:"test",file:3,location:4,message:6}],s=a.parse(t);e(r.isOK()),e.deepStrictEqual(s,[{regexp:l,kind:n.ProblemLocationKind.Location,file:3,location:4,message:6}])}),test("accepts a pattern that provides the fields from multiple entries",()=>{const t=[{regexp:"test",file:3},{regexp:"test1",line:4},{regexp:"test2",column:5},{regexp:"test3",message:6}],s=a.parse(t);e(r.isOK()),e.deepStrictEqual(s,[{regexp:l,kind:n.ProblemLocationKind.Location,file:3},{regexp:new RegExp("test1"),line:4},{regexp:new RegExp("test2"),character:5},{regexp:new RegExp("test3"),message:6}])}),test("forbids setting the loop flag outside of the last element in the array",()=>{const t=[{regexp:"test",file:3,loop:!0},{regexp:"test1",line:4}],s=a.parse(t);e.strictEqual(null,s),e.strictEqual(i.Error,r.state),e(r.hasMessage("The loop property is only supported on the last line matcher."))}),test("forbids setting the kind outside of the first element of the array",()=>{const t=[{regexp:"test",file:3},{regexp:"test1",kind:"file",line:4}],s=a.parse(t);e.strictEqual(null,s),e.strictEqual(i.Error,r.state),e(r.hasMessage("The problem pattern is invalid. The kind property must be provided only in the first element"))}),test("kind: Location requires a regexp",()=>{const t=[{file:0,line:1,column:20,message:0}],s=a.parse(t);e.strictEqual(null,s),e.strictEqual(i.Error,r.state),e(r.hasMessage("The problem pattern is missing a regular expression."))}),test("kind: Location requires a regexp on every entry",()=>{const t=[{regexp:"test",file:3},{line:4},{regexp:"test2",column:5},{regexp:"test3",message:6}],s=a.parse(t);e.strictEqual(null,s),e.strictEqual(i.Error,r.state),e(r.hasMessage("The problem pattern is missing a regular expression."))}),test("kind: Location requires a message",()=>{const t=[{regexp:"test",file:0,line:1,column:20}],s=a.parse(t);e.strictEqual(null,s),e.strictEqual(i.Error,r.state),e(r.hasMessage("The problem pattern is invalid. It must have at least have a file and a message."))}),test("kind: Location requires a file",()=>{const t=[{regexp:"test",line:1,column:20,message:0}],s=a.parse(t);e.strictEqual(null,s),e.strictEqual(i.Error,r.state),e(r.hasMessage('The problem pattern is invalid. It must either have kind: "file" or have a line or location match group.'))}),test("kind: Location requires either a line or location",()=>{const t=[{regexp:"test",file:1,column:20,message:0}],s=a.parse(t);e.strictEqual(null,s),e.strictEqual(i.Error,r.state),e(r.hasMessage('The problem pattern is invalid. It must either have kind: "file" or have a line or location match group.'))}),test("kind: File accepts a regexp, file and message",()=>{const t=[{regexp:"test",file:2,kind:"file",message:6}],s=a.parse(t);e(r.isOK()),e.deepStrictEqual(s,[{regexp:l,kind:n.ProblemLocationKind.File,file:2,message:6}])}),test("kind: File requires a file",()=>{const t=[{regexp:"test",kind:"file",message:6}],s=a.parse(t);e.strictEqual(null,s),e.strictEqual(i.Error,r.state),e(r.hasMessage("The problem pattern is invalid. It must have at least have a file and a message."))}),test("kind: File requires a message",()=>{const t=[{regexp:"test",kind:"file",file:6}],s=a.parse(t);e.strictEqual(null,s),e.strictEqual(i.Error,r.state),e(r.hasMessage("The problem pattern is invalid. It must have at least have a file and a message."))})})});