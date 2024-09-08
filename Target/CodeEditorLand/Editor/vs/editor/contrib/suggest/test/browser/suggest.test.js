import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { LanguageFeatureRegistry } from "../../../../common/languageFeatureRegistry.js";
import {
  CompletionItemKind
} from "../../../../common/languages.js";
import { createTextModel } from "../../../../test/common/testTextModel.js";
import {
  CompletionOptions,
  SnippetSortOrder,
  provideSuggestionItems
} from "../../browser/suggest.js";
suite("Suggest", () => {
  let model;
  let registration;
  let registry;
  setup(() => {
    registry = new LanguageFeatureRegistry();
    model = createTextModel(
      "FOO\nbarBAR\nfoo",
      void 0,
      void 0,
      URI.parse("foo:bar/path")
    );
    registration = registry.register(
      { pattern: "bar/path", scheme: "foo" },
      {
        _debugDisplayName: "test",
        provideCompletionItems(_doc, pos) {
          return {
            incomplete: false,
            suggestions: [
              {
                label: "aaa",
                kind: CompletionItemKind.Snippet,
                insertText: "aaa",
                range: Range.fromPositions(pos)
              },
              {
                label: "zzz",
                kind: CompletionItemKind.Snippet,
                insertText: "zzz",
                range: Range.fromPositions(pos)
              },
              {
                label: "fff",
                kind: CompletionItemKind.Property,
                insertText: "fff",
                range: Range.fromPositions(pos)
              }
            ]
          };
        }
      }
    );
  });
  teardown(() => {
    registration.dispose();
    model.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("sort - snippet inline", async () => {
    const { items, disposable } = await provideSuggestionItems(
      registry,
      model,
      new Position(1, 1),
      new CompletionOptions(SnippetSortOrder.Inline)
    );
    assert.strictEqual(items.length, 3);
    assert.strictEqual(items[0].completion.label, "aaa");
    assert.strictEqual(items[1].completion.label, "fff");
    assert.strictEqual(items[2].completion.label, "zzz");
    disposable.dispose();
  });
  test("sort - snippet top", async () => {
    const { items, disposable } = await provideSuggestionItems(
      registry,
      model,
      new Position(1, 1),
      new CompletionOptions(SnippetSortOrder.Top)
    );
    assert.strictEqual(items.length, 3);
    assert.strictEqual(items[0].completion.label, "aaa");
    assert.strictEqual(items[1].completion.label, "zzz");
    assert.strictEqual(items[2].completion.label, "fff");
    disposable.dispose();
  });
  test("sort - snippet bottom", async () => {
    const { items, disposable } = await provideSuggestionItems(
      registry,
      model,
      new Position(1, 1),
      new CompletionOptions(SnippetSortOrder.Bottom)
    );
    assert.strictEqual(items.length, 3);
    assert.strictEqual(items[0].completion.label, "fff");
    assert.strictEqual(items[1].completion.label, "aaa");
    assert.strictEqual(items[2].completion.label, "zzz");
    disposable.dispose();
  });
  test("sort - snippet none", async () => {
    const { items, disposable } = await provideSuggestionItems(
      registry,
      model,
      new Position(1, 1),
      new CompletionOptions(
        void 0,
        (/* @__PURE__ */ new Set()).add(CompletionItemKind.Snippet)
      )
    );
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].completion.label, "fff");
    disposable.dispose();
  });
  test("only from", (callback) => {
    const foo = {
      triggerCharacters: [],
      provideCompletionItems() {
        return {
          currentWord: "",
          incomplete: false,
          suggestions: [
            {
              label: "jjj",
              type: "property",
              insertText: "jjj"
            }
          ]
        };
      }
    };
    const registration2 = registry.register(
      { pattern: "bar/path", scheme: "foo" },
      foo
    );
    provideSuggestionItems(
      registry,
      model,
      new Position(1, 1),
      new CompletionOptions(
        void 0,
        void 0,
        (/* @__PURE__ */ new Set()).add(foo)
      )
    ).then(({ items, disposable }) => {
      registration2.dispose();
      assert.strictEqual(items.length, 1);
      assert.ok(items[0].provider === foo);
      disposable.dispose();
      callback();
    });
  });
  test("Ctrl+space completions stopped working with the latest Insiders, #97650", async () => {
    const foo = new class {
      _debugDisplayName = "test";
      triggerCharacters = [];
      provideCompletionItems() {
        return {
          suggestions: [
            {
              label: "one",
              kind: CompletionItemKind.Class,
              insertText: "one",
              range: {
                insert: new Range(0, 0, 0, 0),
                replace: new Range(0, 0, 0, 10)
              }
            },
            {
              label: "two",
              kind: CompletionItemKind.Class,
              insertText: "two",
              range: {
                insert: new Range(0, 0, 0, 0),
                replace: new Range(0, 1, 0, 10)
              }
            }
          ]
        };
      }
    }();
    const registration2 = registry.register(
      { pattern: "bar/path", scheme: "foo" },
      foo
    );
    const { items, disposable } = await provideSuggestionItems(
      registry,
      model,
      new Position(0, 0),
      new CompletionOptions(
        void 0,
        void 0,
        (/* @__PURE__ */ new Set()).add(foo)
      )
    );
    registration2.dispose();
    assert.strictEqual(items.length, 2);
    const [a, b] = items;
    assert.strictEqual(a.completion.label, "one");
    assert.strictEqual(a.isInvalid, false);
    assert.strictEqual(b.completion.label, "two");
    assert.strictEqual(b.isInvalid, true);
    disposable.dispose();
  });
});
