import n from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as k}from"../../../../base/test/common/utils.js";import"../../../common/core/position.js";import{Range as r}from"../../../common/core/range.js";import"../../../common/languages.js";import{BaseEditorSimpleWorker as p}from"../../../common/services/editorSimpleWorker.js";import"../../../common/services/textModelSync/textModelSync.impl.js";suite("EditorSimpleWorker",()=>{k();class m extends p{getModel(e){return this._getModel(e)}addModel(e,a=`
`){const c="test:file#"+Date.now();return this.$acceptNewModel({url:c,versionId:1,lines:e,EOL:a}),this._getModel(c)}}let t,i;setup(()=>{t=new m,i=t.addModel(["This is line one","and this is line number two","it is followed by #3","and finished with the fourth."])});function l(o,e,a){const c=i.positionAt(o);n.strictEqual(c.lineNumber,e),n.strictEqual(c.column,a)}function s(o,e,a){const c=i.offsetAt({lineNumber:o,column:e});n.strictEqual(c,a)}test("ICommonModel#offsetAt",()=>{s(1,1,0),s(1,2,1),s(1,17,16),s(2,1,17),s(2,4,20),s(3,1,45),s(5,30,95),s(5,31,95),s(5,Number.MAX_VALUE,95),s(6,30,95),s(Number.MAX_VALUE,30,95),s(Number.MAX_VALUE,Number.MAX_VALUE,95)}),test("ICommonModel#positionAt",()=>{l(0,1,1),l(Number.MIN_VALUE,1,1),l(1,1,2),l(16,1,17),l(17,2,1),l(20,2,4),l(45,3,1),l(95,4,30),l(96,4,30),l(99,4,30),l(Number.MAX_VALUE,4,30)}),test("ICommonModel#validatePosition, issue #15882",function(){const o=t.addModel(['{"id": "0001","type": "donut","name": "Cake","image":{"url": "images/0001.jpg","width": 200,"height": 200},"thumbnail":{"url": "images/thumbnails/0001.jpg","width": 32,"height": 32}}']);n.strictEqual(o.offsetAt({lineNumber:1,column:2}),1)}),test("MoreMinimal",()=>t.$computeMoreMinimalEdits(i.uri.toString(),[{text:"This is line One",range:new r(1,1,1,17)}],!1).then(o=>{n.strictEqual(o.length,1);const[e]=o;n.strictEqual(e.text,"O"),n.deepStrictEqual(e.range,{startLineNumber:1,startColumn:14,endLineNumber:1,endColumn:15})})),test("MoreMinimal, merge adjacent edits",async function(){const o=t.addModel(["one","two","three","four","five"],`
`),e=await t.$computeMoreMinimalEdits(o.uri.toString(),[{range:new r(1,1,2,1),text:`one
two
three
`},{range:new r(2,1,3,1),text:""},{range:new r(3,1,4,1),text:""},{range:new r(4,2,4,3),text:"4"},{range:new r(5,3,5,5),text:"5"}],!1);n.strictEqual(e.length,2),n.strictEqual(e[0].text,"4"),n.strictEqual(e[1].text,"5")}),test("MoreMinimal, issue #15385 newline changes only",function(){const o=t.addModel(["{",'	"a":1',"}"],`
`);return t.$computeMoreMinimalEdits(o.uri.toString(),[{text:`{\r
	"a":1\r
}`,range:new r(1,1,3,2)}],!1).then(e=>{n.strictEqual(e.length,0)})}),test("MoreMinimal, issue #15385 newline changes and other",function(){const o=t.addModel(["{",'	"a":1',"}"],`
`);return t.$computeMoreMinimalEdits(o.uri.toString(),[{text:`{\r
	"b":1\r
}`,range:new r(1,1,3,2)}],!1).then(e=>{n.strictEqual(e.length,1);const[a]=e;n.strictEqual(a.text,"b"),n.deepStrictEqual(a.range,{startLineNumber:2,startColumn:3,endLineNumber:2,endColumn:4})})}),test("MoreMinimal, issue #15385 newline changes and other 2/2",function(){const o=t.addModel(["package main","func foo() {","}"]);return t.$computeMoreMinimalEdits(o.uri.toString(),[{text:`
`,range:new r(3,2,4,1e3)}],!1).then(e=>{n.strictEqual(e.length,1);const[a]=e;n.strictEqual(a.text,`
`),n.deepStrictEqual(a.range,{startLineNumber:3,startColumn:2,endLineNumber:3,endColumn:2})})});async function u(o,e){const a=t.addModel(o),c=await t.$computeHumanReadableDiff(a.uri.toString(),e,{ignoreTrimWhitespace:!1,maxComputationTimeMs:0,computeMoves:!1}),g=f(a.getValue(),e),h=f(a.getValue(),c);return n.deepStrictEqual(g,h),c.map(d=>({range:r.lift(d.range).toString(),text:d.text}))}test("computeHumanReadableDiff 1",async()=>{n.deepStrictEqual(await u(["function test() {}"],[{text:`
/** Some Comment */
`,range:new r(1,1,1,1)}]),[{range:"[1,1 -> 1,1]",text:`
/** Some Comment */
`}])}),test("computeHumanReadableDiff 2",async()=>{n.deepStrictEqual(await u(["function test() {}"],[{text:"function test(myParam: number) { console.log(myParam); }",range:new r(1,1,1,Number.MAX_SAFE_INTEGER)}]),[{range:"[1,15 -> 1,15]",text:"myParam: number"},{range:"[1,18 -> 1,18]",text:" console.log(myParam); "}])}),test("computeHumanReadableDiff 3",async()=>{n.deepStrictEqual(await u(["","","",""],[{text:`function test(myParam: number) { console.log(myParam); }

`,range:new r(2,1,3,20)}]),[{range:"[2,1 -> 2,1]",text:`function test(myParam: number) { console.log(myParam); }
`}])}),test("computeHumanReadableDiff 4",async()=>{n.deepStrictEqual(await u(["function algorithm() {}"],[{text:"function alm() {}",range:new r(1,1,1,Number.MAX_SAFE_INTEGER)}]),[{range:"[1,10 -> 1,19]",text:"alm"}])}),test('[Bug] Getting Message "Overlapping ranges are not allowed" and nothing happens with Inline-Chat ',async function(){await u(`const API = require('../src/api');

describe('API', () => {
  let api;
  let database;

  beforeAll(() => {
    database = {
      getAllBooks: jest.fn(),
      getBooksByAuthor: jest.fn(),
      getBooksByTitle: jest.fn(),
    };
    api = new API(database);
  });

  describe('GET /books', () => {
    it('should return all books', async () => {
      const mockBooks = [{ title: 'Book 1' }, { title: 'Book 2' }];
      database.getAllBooks.mockResolvedValue(mockBooks);

      const req = {};
      const res = {
        json: jest.fn(),
      };

      await api.register({
        get: (path, handler) => {
          if (path === '/books') {
            handler(req, res);
          }
        },
      });

      expect(database.getAllBooks).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockBooks);
    });
  });

  describe('GET /books/author/:author', () => {
    it('should return books by author', async () => {
      const mockAuthor = 'John Doe';
      const mockBooks = [{ title: 'Book 1', author: mockAuthor }, { title: 'Book 2', author: mockAuthor }];
      database.getBooksByAuthor.mockResolvedValue(mockBooks);

      const req = {
        params: {
          author: mockAuthor,
        },
      };
      const res = {
        json: jest.fn(),
      };

      await api.register({
        get: (path, handler) => {
          if (path === \`/books/author/\${mockAuthor}\`) {
            handler(req, res);
          }
        },
      });

      expect(database.getBooksByAuthor).toHaveBeenCalledWith(mockAuthor);
      expect(res.json).toHaveBeenCalledWith(mockBooks);
    });
  });

  describe('GET /books/title/:title', () => {
    it('should return books by title', async () => {
      const mockTitle = 'Book 1';
      const mockBooks = [{ title: mockTitle, author: 'John Doe' }];
      database.getBooksByTitle.mockResolvedValue(mockBooks);

      const req = {
        params: {
          title: mockTitle,
        },
      };
      const res = {
        json: jest.fn(),
      };

      await api.register({
        get: (path, handler) => {
          if (path === \`/books/title/\${mockTitle}\`) {
            handler(req, res);
          }
        },
      });

      expect(database.getBooksByTitle).toHaveBeenCalledWith(mockTitle);
      expect(res.json).toHaveBeenCalledWith(mockBooks);
    });
  });
});
`.split(`
`),[{range:{startLineNumber:1,startColumn:1,endLineNumber:96,endColumn:1},text:`const request = require('supertest');
const API = require('../src/api');

describe('API', () => {
  let api;
  let database;

  beforeAll(() => {
    database = {
      getAllBooks: jest.fn(),
      getBooksByAuthor: jest.fn(),
      getBooksByTitle: jest.fn(),
    };
    api = new API(database);
  });

  describe('GET /books', () => {
    it('should return all books', async () => {
      const mockBooks = [{ title: 'Book 1' }, { title: 'Book 2' }];
      database.getAllBooks.mockResolvedValue(mockBooks);

      const response = await request(api.app).get('/books');

      expect(database.getAllBooks).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBooks);
    });
  });

  describe('GET /books/author/:author', () => {
    it('should return books by author', async () => {
      const mockAuthor = 'John Doe';
      const mockBooks = [{ title: 'Book 1', author: mockAuthor }, { title: 'Book 2', author: mockAuthor }];
      database.getBooksByAuthor.mockResolvedValue(mockBooks);

      const response = await request(api.app).get(\`/books/author/\${mockAuthor}\`);

      expect(database.getBooksByAuthor).toHaveBeenCalledWith(mockAuthor);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBooks);
    });
  });

  describe('GET /books/title/:title', () => {
    it('should return books by title', async () => {
      const mockTitle = 'Book 1';
      const mockBooks = [{ title: mockTitle, author: 'John Doe' }];
      database.getBooksByTitle.mockResolvedValue(mockBooks);

      const response = await request(api.app).get(\`/books/title/\${mockTitle}\`);

      expect(database.getBooksByTitle).toHaveBeenCalledWith(mockTitle);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBooks);
    });
  });
});
`}])}),test("ICommonModel#getValueInRange, issue #17424",function(){const e=t.addModel(["package main","func foo() {","}"]).getValueInRange({startLineNumber:3,startColumn:1,endLineNumber:4,endColumn:1});n.strictEqual(e,"}")}),test("textualSuggest, issue #17785",function(){const o=t.addModel(["foobar","f f"]);return t.$textualSuggest([o.uri.toString()],"f","[a-z]+","img").then(e=>{e||n.ok(!1),n.strictEqual(e.words.length,1),n.strictEqual(typeof e.duration,"number"),n.strictEqual(e.words[0],"foobar")})}),test("get words via iterator, issue #46930",function(){const e=[...t.addModel(["one line","two line","","past empty","single","","and now we are done"]).words(/[a-z]+/img)];n.deepStrictEqual(e,["one","line","two","line","past","empty","single","and","now","we","are","done"])})});function f(m,t){const i=new b(m),l=t.map(s=>{const u=r.lift(s.range);return{startOffset:i.getOffset(u.getStartPosition()),endOffset:i.getOffset(u.getEndPosition()),text:s.text}});l.sort((s,u)=>u.startOffset-s.startOffset);for(const s of l)m=m.substring(0,s.startOffset)+s.text+m.substring(s.endOffset);return m}class b{constructor(t){this.text=t;this.lineStartOffsetByLineIdx=[],this.lineStartOffsetByLineIdx.push(0);for(let i=0;i<t.length;i++)t.charAt(i)===`
`&&this.lineStartOffsetByLineIdx.push(i+1);this.lineStartOffsetByLineIdx.push(t.length+1)}lineStartOffsetByLineIdx;getOffset(t){const i=t.lineNumber>=this.lineStartOffsetByLineIdx.length?this.text.length:this.lineStartOffsetByLineIdx[t.lineNumber]-1;return Math.min(this.lineStartOffsetByLineIdx[t.lineNumber-1]+t.column-1,i)}}
