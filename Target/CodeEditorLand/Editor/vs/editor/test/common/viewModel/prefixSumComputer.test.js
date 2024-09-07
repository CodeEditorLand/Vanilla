import t from"assert";import{toUint32 as a}from"../../../../base/common/uint.js";import{ensureNoDisposablesAreLeakedInTestSuite as s}from"../../../../base/test/common/utils.js";import{PrefixSumComputer as l}from"../../../common/model/prefixSumComputer.js";function n(e){const r=e.length,u=new Uint32Array(r);for(let i=0;i<r;i++)u[i]=a(e[i]);return u}suite("Editor ViewModel - PrefixSumComputer",()=>{s(),test("PrefixSumComputer",()=>{let e;const r=new l(n([1,1,2,1,3]));t.strictEqual(r.getTotalSum(),8),t.strictEqual(r.getPrefixSum(-1),0),t.strictEqual(r.getPrefixSum(0),1),t.strictEqual(r.getPrefixSum(1),2),t.strictEqual(r.getPrefixSum(2),4),t.strictEqual(r.getPrefixSum(3),5),t.strictEqual(r.getPrefixSum(4),8),e=r.getIndexOf(0),t.strictEqual(e.index,0),t.strictEqual(e.remainder,0),e=r.getIndexOf(1),t.strictEqual(e.index,1),t.strictEqual(e.remainder,0),e=r.getIndexOf(2),t.strictEqual(e.index,2),t.strictEqual(e.remainder,0),e=r.getIndexOf(3),t.strictEqual(e.index,2),t.strictEqual(e.remainder,1),e=r.getIndexOf(4),t.strictEqual(e.index,3),t.strictEqual(e.remainder,0),e=r.getIndexOf(5),t.strictEqual(e.index,4),t.strictEqual(e.remainder,0),e=r.getIndexOf(6),t.strictEqual(e.index,4),t.strictEqual(e.remainder,1),e=r.getIndexOf(7),t.strictEqual(e.index,4),t.strictEqual(e.remainder,2),e=r.getIndexOf(8),t.strictEqual(e.index,4),t.strictEqual(e.remainder,3),r.setValue(1,2),t.strictEqual(r.getTotalSum(),9),t.strictEqual(r.getPrefixSum(0),1),t.strictEqual(r.getPrefixSum(1),3),t.strictEqual(r.getPrefixSum(2),5),t.strictEqual(r.getPrefixSum(3),6),t.strictEqual(r.getPrefixSum(4),9),r.setValue(1,0),t.strictEqual(r.getTotalSum(),7),t.strictEqual(r.getPrefixSum(0),1),t.strictEqual(r.getPrefixSum(1),1),t.strictEqual(r.getPrefixSum(2),3),t.strictEqual(r.getPrefixSum(3),4),t.strictEqual(r.getPrefixSum(4),7),e=r.getIndexOf(0),t.strictEqual(e.index,0),t.strictEqual(e.remainder,0),e=r.getIndexOf(1),t.strictEqual(e.index,2),t.strictEqual(e.remainder,0),e=r.getIndexOf(2),t.strictEqual(e.index,2),t.strictEqual(e.remainder,1),e=r.getIndexOf(3),t.strictEqual(e.index,3),t.strictEqual(e.remainder,0),e=r.getIndexOf(4),t.strictEqual(e.index,4),t.strictEqual(e.remainder,0),e=r.getIndexOf(5),t.strictEqual(e.index,4),t.strictEqual(e.remainder,1),e=r.getIndexOf(6),t.strictEqual(e.index,4),t.strictEqual(e.remainder,2),e=r.getIndexOf(7),t.strictEqual(e.index,4),t.strictEqual(e.remainder,3),r.setValue(2,0),t.strictEqual(r.getTotalSum(),5),t.strictEqual(r.getPrefixSum(0),1),t.strictEqual(r.getPrefixSum(1),1),t.strictEqual(r.getPrefixSum(2),1),t.strictEqual(r.getPrefixSum(3),2),t.strictEqual(r.getPrefixSum(4),5),e=r.getIndexOf(0),t.strictEqual(e.index,0),t.strictEqual(e.remainder,0),e=r.getIndexOf(1),t.strictEqual(e.index,3),t.strictEqual(e.remainder,0),e=r.getIndexOf(2),t.strictEqual(e.index,4),t.strictEqual(e.remainder,0),e=r.getIndexOf(3),t.strictEqual(e.index,4),t.strictEqual(e.remainder,1),e=r.getIndexOf(4),t.strictEqual(e.index,4),t.strictEqual(e.remainder,2),e=r.getIndexOf(5),t.strictEqual(e.index,4),t.strictEqual(e.remainder,3),r.setValue(3,0),t.strictEqual(r.getTotalSum(),4),t.strictEqual(r.getPrefixSum(0),1),t.strictEqual(r.getPrefixSum(1),1),t.strictEqual(r.getPrefixSum(2),1),t.strictEqual(r.getPrefixSum(3),1),t.strictEqual(r.getPrefixSum(4),4),e=r.getIndexOf(0),t.strictEqual(e.index,0),t.strictEqual(e.remainder,0),e=r.getIndexOf(1),t.strictEqual(e.index,4),t.strictEqual(e.remainder,0),e=r.getIndexOf(2),t.strictEqual(e.index,4),t.strictEqual(e.remainder,1),e=r.getIndexOf(3),t.strictEqual(e.index,4),t.strictEqual(e.remainder,2),e=r.getIndexOf(4),t.strictEqual(e.index,4),t.strictEqual(e.remainder,3),r.setValue(1,1),r.setValue(3,1),r.setValue(4,1),t.strictEqual(r.getTotalSum(),4),t.strictEqual(r.getPrefixSum(0),1),t.strictEqual(r.getPrefixSum(1),2),t.strictEqual(r.getPrefixSum(2),2),t.strictEqual(r.getPrefixSum(3),3),t.strictEqual(r.getPrefixSum(4),4),e=r.getIndexOf(0),t.strictEqual(e.index,0),t.strictEqual(e.remainder,0),e=r.getIndexOf(1),t.strictEqual(e.index,1),t.strictEqual(e.remainder,0),e=r.getIndexOf(2),t.strictEqual(e.index,3),t.strictEqual(e.remainder,0),e=r.getIndexOf(3),t.strictEqual(e.index,4),t.strictEqual(e.remainder,0),e=r.getIndexOf(4),t.strictEqual(e.index,4),t.strictEqual(e.remainder,1)})});