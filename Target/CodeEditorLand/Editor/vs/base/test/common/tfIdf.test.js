var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { CancellationToken } from "../../common/cancellation.js";
import { TfIdfCalculator, TfIdfDocument, TfIdfScore } from "../../common/tfIdf.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "./utils.js";
function permutate(arr) {
  if (arr.length === 0) {
    return [[]];
  }
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const permutationsRest = permutate(rest);
    for (let j = 0; j < permutationsRest.length; j++) {
      result.push([arr[i], ...permutationsRest[j]]);
    }
  }
  return result;
}
__name(permutate, "permutate");
function assertScoreOrdersEqual(actualScores, expectedScoreKeys) {
  actualScores.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
  assert.strictEqual(actualScores.length, expectedScoreKeys.length);
  for (let i = 0; i < expectedScoreKeys.length; i++) {
    assert.strictEqual(actualScores[i].key, expectedScoreKeys[i]);
  }
}
__name(assertScoreOrdersEqual, "assertScoreOrdersEqual");
suite("TF-IDF Calculator", function() {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Should return no scores when no documents are given", () => {
    const tfidf = new TfIdfCalculator();
    const scores = tfidf.calculateScores("something", CancellationToken.None);
    assertScoreOrdersEqual(scores, []);
  });
  test("Should return no scores for term not in document", () => {
    const tfidf = new TfIdfCalculator().updateDocuments([
      makeDocument("A", "cat dog fish")
    ]);
    const scores = tfidf.calculateScores("elepant", CancellationToken.None);
    assertScoreOrdersEqual(scores, []);
  });
  test("Should return scores for document with exact match", () => {
    for (const docs of permutate([
      makeDocument("A", "cat dog cat"),
      makeDocument("B", "cat fish")
    ])) {
      const tfidf = new TfIdfCalculator().updateDocuments(docs);
      const scores = tfidf.calculateScores("dog", CancellationToken.None);
      assertScoreOrdersEqual(scores, ["A"]);
    }
  });
  test("Should return document with more matches first", () => {
    for (const docs of permutate([
      makeDocument("/A", "cat dog cat"),
      makeDocument("/B", "cat fish"),
      makeDocument("/C", "frog")
    ])) {
      const tfidf = new TfIdfCalculator().updateDocuments(docs);
      const scores = tfidf.calculateScores("cat", CancellationToken.None);
      assertScoreOrdersEqual(scores, ["/A", "/B"]);
    }
  });
  test("Should return document with more matches first when term appears in all documents", () => {
    for (const docs of permutate([
      makeDocument("/A", "cat dog cat cat"),
      makeDocument("/B", "cat fish"),
      makeDocument("/C", "frog cat cat")
    ])) {
      const tfidf = new TfIdfCalculator().updateDocuments(docs);
      const scores = tfidf.calculateScores("cat", CancellationToken.None);
      assertScoreOrdersEqual(scores, ["/A", "/C", "/B"]);
    }
  });
  test("Should weigh less common term higher", () => {
    for (const docs of permutate([
      makeDocument("/A", "cat dog cat"),
      makeDocument("/B", "fish"),
      makeDocument("/C", "cat cat cat cat"),
      makeDocument("/D", "cat fish")
    ])) {
      const tfidf = new TfIdfCalculator().updateDocuments(docs);
      const scores = tfidf.calculateScores("cat the dog", CancellationToken.None);
      assertScoreOrdersEqual(scores, ["/A", "/C", "/D"]);
    }
  });
  test("Should weigh chunks with less common terms higher", () => {
    for (const docs of permutate([
      makeDocument("/A", ["cat dog cat", "fish"]),
      makeDocument("/B", ["cat cat cat cat dog", "dog"])
    ])) {
      const tfidf = new TfIdfCalculator().updateDocuments(docs);
      const scores = tfidf.calculateScores("cat", CancellationToken.None);
      assertScoreOrdersEqual(scores, ["/B", "/A"]);
    }
    for (const docs of permutate([
      makeDocument("/A", ["cat dog cat", "fish"]),
      makeDocument("/B", ["cat cat cat cat dog", "dog"])
    ])) {
      const tfidf = new TfIdfCalculator().updateDocuments(docs);
      const scores = tfidf.calculateScores("dog", CancellationToken.None);
      assertScoreOrdersEqual(scores, ["/A", "/B", "/B"]);
    }
    for (const docs of permutate([
      makeDocument("/A", ["cat dog cat", "fish"]),
      makeDocument("/B", ["cat cat cat cat dog", "dog"])
    ])) {
      const tfidf = new TfIdfCalculator().updateDocuments(docs);
      const scores = tfidf.calculateScores("cat the dog", CancellationToken.None);
      assertScoreOrdersEqual(scores, ["/B", "/A", "/B"]);
    }
    for (const docs of permutate([
      makeDocument("/A", ["cat dog cat", "fish"]),
      makeDocument("/B", ["cat cat cat cat dog", "dog"])
    ])) {
      const tfidf = new TfIdfCalculator().updateDocuments(docs);
      const scores = tfidf.calculateScores("lake fish", CancellationToken.None);
      assertScoreOrdersEqual(scores, ["/A"]);
    }
  });
  test("Should ignore case and punctuation", () => {
    for (const docs of permutate([
      makeDocument("/A", "Cat doG.cat"),
      makeDocument("/B", "cAt fiSH"),
      makeDocument("/C", "frOg")
    ])) {
      const tfidf = new TfIdfCalculator().updateDocuments(docs);
      const scores = tfidf.calculateScores(". ,CaT!  ", CancellationToken.None);
      assertScoreOrdersEqual(scores, ["/A", "/B"]);
    }
  });
  test("Should match on camelCase words", () => {
    for (const docs of permutate([
      makeDocument("/A", "catDog cat"),
      makeDocument("/B", "fishCatFish"),
      makeDocument("/C", "frogcat")
    ])) {
      const tfidf = new TfIdfCalculator().updateDocuments(docs);
      const scores = tfidf.calculateScores("catDOG", CancellationToken.None);
      assertScoreOrdersEqual(scores, ["/A", "/B"]);
    }
  });
  test("Should not match document after delete", () => {
    const docA = makeDocument("/A", "cat dog cat");
    const docB = makeDocument("/B", "cat fish");
    const docC = makeDocument("/C", "frog");
    const tfidf = new TfIdfCalculator().updateDocuments([docA, docB, docC]);
    let scores = tfidf.calculateScores("cat", CancellationToken.None);
    assertScoreOrdersEqual(scores, ["/A", "/B"]);
    tfidf.deleteDocument(docA.key);
    scores = tfidf.calculateScores("cat", CancellationToken.None);
    assertScoreOrdersEqual(scores, ["/B"]);
    tfidf.deleteDocument(docC.key);
    scores = tfidf.calculateScores("cat", CancellationToken.None);
    assertScoreOrdersEqual(scores, ["/B"]);
    tfidf.deleteDocument(docB.key);
    scores = tfidf.calculateScores("cat", CancellationToken.None);
    assertScoreOrdersEqual(scores, []);
  });
});
function makeDocument(key, content) {
  return {
    key,
    textChunks: Array.isArray(content) ? content : [content]
  };
}
__name(makeDocument, "makeDocument");
//# sourceMappingURL=tfIdf.test.js.map
