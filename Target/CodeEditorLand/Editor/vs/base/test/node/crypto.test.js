import*as o from"fs";import{tmpdir as s}from"os";import{join as i}from"../../common/path.js";import{checksum as m}from"../../node/crypto.js";import{Promises as e}from"../../node/pfs.js";import{ensureNoDisposablesAreLeakedInTestSuite as a}from"../common/utils.js";import{flakySuite as c,getRandomTestPath as f}from"./testUtils.js";c("Crypto",()=>{let t;a(),setup(function(){return t=f(s(),"vsctests","crypto"),o.promises.mkdir(t,{recursive:!0})}),teardown(function(){return e.rm(t)}),test("checksum",async()=>{const r=i(t,"checksum.txt");await e.writeFile(r,"Hello World"),await m(r,"a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e")})});
