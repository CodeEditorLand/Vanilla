import e from"assert";import{CharCode as r}from"../../../../base/common/charCode.js";import{ensureNoDisposablesAreLeakedInTestSuite as s}from"../../../../base/test/common/utils.js";import{CharacterClassifier as a}from"../../../common/core/characterClassifier.js";suite("CharacterClassifier",()=>{s(),test("works",()=>{const t=new a(0);e.strictEqual(t.get(-1),0),e.strictEqual(t.get(0),0),e.strictEqual(t.get(r.a),0),e.strictEqual(t.get(r.b),0),e.strictEqual(t.get(r.z),0),e.strictEqual(t.get(255),0),e.strictEqual(t.get(1e3),0),e.strictEqual(t.get(2e3),0),t.set(r.a,1),t.set(r.z,2),t.set(1e3,3),e.strictEqual(t.get(-1),0),e.strictEqual(t.get(0),0),e.strictEqual(t.get(r.a),1),e.strictEqual(t.get(r.b),0),e.strictEqual(t.get(r.z),2),e.strictEqual(t.get(255),0),e.strictEqual(t.get(1e3),3),e.strictEqual(t.get(2e3),0)})});
