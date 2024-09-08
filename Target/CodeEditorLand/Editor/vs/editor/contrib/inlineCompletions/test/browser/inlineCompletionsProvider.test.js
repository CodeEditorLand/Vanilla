import assert from "assert";
import { timeout } from "../../../../../base/common/async.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { Range } from "../../../../common/core/range.js";
import { Selection } from "../../../../common/core/selection.js";
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { LanguageFeaturesService } from "../../../../common/services/languageFeaturesService.js";
import {
  withAsyncTestCodeEditor
} from "../../../../test/browser/testCodeEditor.js";
import { createTextModel } from "../../../../test/common/testTextModel.js";
import { InlineCompletionsController } from "../../browser/controller/inlineCompletionsController.js";
import { computeGhostText } from "../../browser/model/singleTextEdit.js";
import { GhostTextContext, MockInlineCompletionsProvider } from "./utils.js";
suite("Inline Completions", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("inlineCompletionToGhostText", () => {
    function getOutput(text, suggestion) {
      const rangeStartOffset = text.indexOf("[");
      const rangeEndOffset = text.indexOf("]") - 1;
      const cleanedText = text.replace("[", "").replace("]", "");
      const tempModel = createTextModel(cleanedText);
      const range = Range.fromPositions(
        tempModel.getPositionAt(rangeStartOffset),
        tempModel.getPositionAt(rangeEndOffset)
      );
      const options = ["prefix", "subword"];
      const result = {};
      for (const option of options) {
        result[option] = computeGhostText(
          new SingleTextEdit(range, suggestion),
          tempModel,
          option
        )?.render(cleanedText, true);
      }
      tempModel.dispose();
      if (new Set(Object.values(result)).size === 1) {
        return Object.values(result)[0];
      }
      return result;
    }
    test("Basic", () => {
      assert.deepStrictEqual(
        getOutput("[foo]baz", "foobar"),
        "foo[bar]baz"
      );
      assert.deepStrictEqual(
        getOutput("[aaa]aaa", "aaaaaa"),
        "aaa[aaa]aaa"
      );
      assert.deepStrictEqual(getOutput("[foo]baz", "boobar"), void 0);
      assert.deepStrictEqual(
        getOutput("[foo]foo", "foofoo"),
        "foo[foo]foo"
      );
      assert.deepStrictEqual(
        getOutput("foo[]", "bar\nhello"),
        "foo[bar\nhello]"
      );
    });
    test("Empty ghost text", () => {
      assert.deepStrictEqual(getOutput("[foo]", "foo"), "foo");
    });
    test("Whitespace (indentation)", () => {
      assert.deepStrictEqual(getOutput("[ foo]", "foobar"), " foo[bar]");
      assert.deepStrictEqual(
        getOutput("[	foo]", "foobar"),
        "	foo[bar]"
      );
      assert.deepStrictEqual(
        getOutput("[	 foo]", "	foobar"),
        "	 foo[bar]"
      );
      assert.deepStrictEqual(getOutput("[	foo]", "		foobar"), {
        prefix: void 0,
        subword: "	[	]foo[bar]"
      });
      assert.deepStrictEqual(
        getOutput("[	]", "		foobar"),
        "	[	foobar]"
      );
      assert.deepStrictEqual(getOutput("	[]", "	"), "	[	]");
      assert.deepStrictEqual(getOutput("	[	]", ""), "		");
      assert.deepStrictEqual(getOutput("[ ]", "return 1"), " [return 1]");
    });
    test("Whitespace (outside of indentation)", () => {
      assert.deepStrictEqual(getOutput("bar[ foo]", "foobar"), void 0);
      assert.deepStrictEqual(
        getOutput("bar[	foo]", "foobar"),
        void 0
      );
    });
    test("Unsupported Case", () => {
      assert.deepStrictEqual(getOutput("fo[o\n]", "x\nbar"), void 0);
    });
    test("New Line", () => {
      assert.deepStrictEqual(
        getOutput("fo[o\n]", "o\nbar"),
        "foo\n[bar]"
      );
    });
    test("Multi Part Diffing", () => {
      assert.deepStrictEqual(getOutput("foo[()]", "(x);"), {
        prefix: void 0,
        subword: "foo([x])[;]"
      });
      assert.deepStrictEqual(getOutput("[	foo]", "		foobar"), {
        prefix: void 0,
        subword: "	[	]foo[bar]"
      });
      assert.deepStrictEqual(
        getOutput("[(y ===)]", "(y === 1) { f(); }"),
        { prefix: void 0, subword: "(y ===[ 1])[ { f(); }]" }
      );
      assert.deepStrictEqual(
        getOutput("[(y ==)]", "(y === 1) { f(); }"),
        { prefix: void 0, subword: "(y ==[= 1])[ { f(); }]" }
      );
      assert.deepStrictEqual(
        getOutput("[(y ==)]", "(y === 1) { f(); }"),
        { prefix: void 0, subword: "(y ==[= 1])[ { f(); }]" }
      );
    });
    test("Multi Part Diffing 1", () => {
      assert.deepStrictEqual(
        getOutput("[if () ()]", "if (1 == f()) ()"),
        { prefix: void 0, subword: "if ([1 == f()]) ()" }
      );
    });
    test("Multi Part Diffing 2", () => {
      assert.deepStrictEqual(getOutput("[)]", "())"), {
        prefix: void 0,
        subword: "[(])[)]"
      });
      assert.deepStrictEqual(getOutput("[))]", "(())"), {
        prefix: void 0,
        subword: "[((]))"
      });
    });
    test("Parenthesis Matching", () => {
      assert.deepStrictEqual(
        getOutput("[console.log()]", 'console.log({ label: "(" })'),
        {
          prefix: void 0,
          subword: 'console.log([{ label: "(" }])'
        }
      );
    });
  });
  test("Does not trigger automatically if disabled", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider, inlineSuggest: { enabled: false } },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("foo");
        await timeout(1e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), []);
        assert.deepStrictEqual(context.getAndClearViewStates(), [""]);
      }
    );
  });
  test("Ghost text is shown after trigger", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("foo");
        provider.setReturnValue({
          insertText: "foobar",
          range: new Range(1, 1, 1, 4)
        });
        model.triggerExplicitly();
        await timeout(1e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,4)", text: "foo", triggerKind: 1 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "foo[bar]"
        ]);
      }
    );
  });
  test("Ghost text is shown automatically when configured", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider, inlineSuggest: { enabled: true } },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("foo");
        provider.setReturnValue({
          insertText: "foobar",
          range: new Range(1, 1, 1, 4)
        });
        await timeout(1e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,4)", text: "foo", triggerKind: 0 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "foo[bar]"
        ]);
      }
    );
  });
  test("Ghost text is updated automatically", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        provider.setReturnValue({
          insertText: "foobar",
          range: new Range(1, 1, 1, 4)
        });
        context.keyboardType("foo");
        model.triggerExplicitly();
        await timeout(1e3);
        provider.setReturnValue({
          insertText: "foobizz",
          range: new Range(1, 1, 1, 6)
        });
        context.keyboardType("b");
        context.keyboardType("i");
        await timeout(1e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,4)", text: "foo", triggerKind: 1 },
          { position: "(1,6)", text: "foobi", triggerKind: 0 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "foo[bar]",
          "foob[ar]",
          "foobi",
          "foobi[zz]"
        ]);
      }
    );
  });
  test("Unindent whitespace", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("  ");
        provider.setReturnValue({
          insertText: "foo",
          range: new Range(1, 2, 1, 3)
        });
        model.triggerExplicitly();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "  [foo]"
        ]);
        model.accept(editor);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,3)", text: "  ", triggerKind: 1 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          " foo"
        ]);
      }
    );
  });
  test("Unindent tab", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("		");
        provider.setReturnValue({
          insertText: "foo",
          range: new Range(1, 2, 1, 3)
        });
        model.triggerExplicitly();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "		[foo]"
        ]);
        model.accept(editor);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,3)", text: "		", triggerKind: 1 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "	foo"
        ]);
      }
    );
  });
  test("No unindent after indentation", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("buzz  ");
        provider.setReturnValue({
          insertText: "foo",
          range: new Range(1, 6, 1, 7)
        });
        model.triggerExplicitly();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [""]);
        model.accept(editor);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,7)", text: "buzz  ", triggerKind: 1 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), []);
      }
    );
  });
  test("Next/previous", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("foo");
        provider.setReturnValue({
          insertText: "foobar1",
          range: new Range(1, 1, 1, 4)
        });
        model.trigger();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "foo[bar1]"
        ]);
        provider.setReturnValues([
          { insertText: "foobar1", range: new Range(1, 1, 1, 4) },
          { insertText: "foobizz2", range: new Range(1, 1, 1, 4) },
          { insertText: "foobuzz3", range: new Range(1, 1, 1, 4) }
        ]);
        model.next();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "foo[bizz2]"
        ]);
        model.next();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "foo[buzz3]"
        ]);
        model.next();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "foo[bar1]"
        ]);
        model.previous();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "foo[buzz3]"
        ]);
        model.previous();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "foo[bizz2]"
        ]);
        model.previous();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "foo[bar1]"
        ]);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,4)", text: "foo", triggerKind: 0 },
          { position: "(1,4)", text: "foo", triggerKind: 1 }
        ]);
      }
    );
  });
  test("Calling the provider is debounced", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        model.trigger();
        context.keyboardType("f");
        await timeout(40);
        context.keyboardType("o");
        await timeout(40);
        context.keyboardType("o");
        await timeout(40);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), []);
        await timeout(400);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,4)", text: "foo", triggerKind: 0 }
        ]);
        provider.assertNotCalledTwiceWithin50ms();
      }
    );
  });
  test("Backspace is debounced", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider, inlineSuggest: { enabled: true } },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("foo");
        provider.setReturnValue({
          insertText: "foobar",
          range: new Range(1, 1, 1, 4)
        });
        await timeout(1e3);
        for (let j = 0; j < 2; j++) {
          for (let i = 0; i < 3; i++) {
            context.leftDelete();
            await timeout(5);
          }
          context.keyboardType("bar");
        }
        await timeout(400);
        provider.assertNotCalledTwiceWithin50ms();
      }
    );
  });
  test("Forward stability", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        provider.setReturnValue({
          insertText: "foobar",
          range: new Range(1, 1, 1, 4)
        });
        context.keyboardType("foo");
        model.trigger();
        await timeout(1e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,4)", text: "foo", triggerKind: 0 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "foo[bar]"
        ]);
        provider.setReturnValue({
          insertText: "foobar",
          range: new Range(1, 1, 1, 5)
        });
        context.keyboardType("b");
        assert.deepStrictEqual(
          context.currentPrettyViewState,
          "foob[ar]"
        );
        await timeout(1e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,5)", text: "foob", triggerKind: 0 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "foob[ar]"
        ]);
        provider.setReturnValue({
          insertText: "foobar",
          range: new Range(1, 1, 1, 6)
        });
        context.keyboardType("a");
        assert.deepStrictEqual(
          context.currentPrettyViewState,
          "fooba[r]"
        );
        await timeout(1e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,6)", text: "fooba", triggerKind: 0 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "fooba[r]"
        ]);
      }
    );
  });
  test("Support forward instability", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        provider.setReturnValue({
          insertText: "foobar",
          range: new Range(1, 1, 1, 4)
        });
        context.keyboardType("foo");
        model.triggerExplicitly();
        await timeout(100);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,4)", text: "foo", triggerKind: 1 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "foo[bar]"
        ]);
        provider.setReturnValue({
          insertText: "foobaz",
          range: new Range(1, 1, 1, 5)
        });
        context.keyboardType("b");
        assert.deepStrictEqual(
          context.currentPrettyViewState,
          "foob[ar]"
        );
        await timeout(100);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,5)", text: "foob", triggerKind: 0 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "foob[ar]",
          "foob[az]"
        ]);
      }
    );
  });
  test("Support backward instability", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("fooba");
        provider.setReturnValue({
          insertText: "foobar",
          range: new Range(1, 1, 1, 6)
        });
        model.triggerExplicitly();
        await timeout(1e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,6)", text: "fooba", triggerKind: 1 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "fooba[r]"
        ]);
        provider.setReturnValue({
          insertText: "foobaz",
          range: new Range(1, 1, 1, 5)
        });
        context.leftDelete();
        await timeout(1e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(1,5)", text: "foob", triggerKind: 0 }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "foob[ar]",
          "foob[az]"
        ]);
      }
    );
  });
  test("No race conditions", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("h");
        provider.setReturnValue(
          { insertText: "helloworld", range: new Range(1, 1, 1, 2) },
          1e3
        );
        model.triggerExplicitly();
        await timeout(1030);
        context.keyboardType("ello");
        provider.setReturnValue(
          { insertText: "helloworld", range: new Range(1, 1, 1, 6) },
          1e3
        );
        await timeout(2e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "hello[world]"
        ]);
      }
    );
  });
  test("Do not reuse cache from previous session (#132516)", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider, inlineSuggest: { enabled: true } },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("hello\n");
        context.cursorLeft();
        context.keyboardType("x");
        context.leftDelete();
        provider.setReturnValue(
          { insertText: "helloworld", range: new Range(1, 1, 1, 6) },
          1e3
        );
        await timeout(2e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          {
            position: "(1,6)",
            text: "hello\n",
            triggerKind: 0
          }
        ]);
        provider.setReturnValue(
          { insertText: "helloworld", range: new Range(2, 1, 2, 6) },
          1e3
        );
        context.cursorDown();
        context.keyboardType("hello");
        await timeout(40);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), []);
        context.keyboardType("w");
        context.leftDelete();
        await timeout(2e3);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(2,6)", triggerKind: 0, text: "hello\nhello" }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "hello[world]\n",
          "hello\n",
          "hello\nhello[world]"
        ]);
      }
    );
  });
  test("Additional Text Edits", async () => {
    const provider = new MockInlineCompletionsProvider();
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, model, context }) => {
        context.keyboardType("buzz\nbaz");
        provider.setReturnValue({
          insertText: "bazz",
          range: new Range(2, 1, 2, 4),
          additionalTextEdits: [
            {
              range: new Range(1, 1, 1, 5),
              text: "bla"
            }
          ]
        });
        model.triggerExplicitly();
        await timeout(1e3);
        model.accept(editor);
        assert.deepStrictEqual(provider.getAndClearCallHistory(), [
          { position: "(2,4)", triggerKind: 1, text: "buzz\nbaz" }
        ]);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "buzz\nbaz[z]",
          "bla\nbazz"
        ]);
      }
    );
  });
  suite("inlineCompletionMultiCursor", () => {
    test("Basic", async () => {
      const provider = new MockInlineCompletionsProvider();
      await withAsyncTestCodeEditorAndInlineCompletionsModel(
        "",
        { fakeClock: true, provider },
        async ({ editor, editorViewModel, model, context }) => {
          context.keyboardType("console\nconsole\n");
          editor.setSelections([
            new Selection(1, 1e3, 1, 1e3),
            new Selection(2, 1e3, 2, 1e3)
          ]);
          provider.setReturnValue({
            insertText: 'console.log("hello");',
            range: new Range(1, 1, 1, 1e3)
          });
          model.triggerExplicitly();
          await timeout(1e3);
          model.accept(editor);
          assert.deepStrictEqual(
            editor.getValue(),
            [
              `console.log("hello");`,
              `console.log("hello");`,
              ``
            ].join("\n")
          );
        }
      );
    });
    test("Multi Part", async () => {
      const provider = new MockInlineCompletionsProvider();
      await withAsyncTestCodeEditorAndInlineCompletionsModel(
        "",
        { fakeClock: true, provider },
        async ({ editor, editorViewModel, model, context }) => {
          context.keyboardType("console.log()\nconsole.log\n");
          editor.setSelections([
            new Selection(1, 12, 1, 12),
            new Selection(2, 1e3, 2, 1e3)
          ]);
          provider.setReturnValue({
            insertText: 'console.log("hello");',
            range: new Range(1, 1, 1, 1e3)
          });
          model.triggerExplicitly();
          await timeout(1e3);
          model.accept(editor);
          assert.deepStrictEqual(
            editor.getValue(),
            [
              `console.log("hello");`,
              `console.log("hello");`,
              ``
            ].join("\n")
          );
        }
      );
    });
    test("Multi Part and Different Cursor Columns", async () => {
      const provider = new MockInlineCompletionsProvider();
      await withAsyncTestCodeEditorAndInlineCompletionsModel(
        "",
        { fakeClock: true, provider },
        async ({ editor, editorViewModel, model, context }) => {
          context.keyboardType("console.log()\nconsole.warn\n");
          editor.setSelections([
            new Selection(1, 12, 1, 12),
            new Selection(2, 14, 2, 14)
          ]);
          provider.setReturnValue({
            insertText: 'console.log("hello");',
            range: new Range(1, 1, 1, 1e3)
          });
          model.triggerExplicitly();
          await timeout(1e3);
          model.accept(editor);
          assert.deepStrictEqual(
            editor.getValue(),
            [
              `console.log("hello");`,
              `console.warn("hello");`,
              ``
            ].join("\n")
          );
        }
      );
    });
    async function acceptNextWord(model, editor, timesToAccept = 1) {
      for (let i = 0; i < timesToAccept; i++) {
        model.triggerExplicitly();
        await timeout(1e3);
        await model.acceptNextWord(editor);
      }
    }
    test("Basic Partial Completion", async () => {
      const provider = new MockInlineCompletionsProvider();
      await withAsyncTestCodeEditorAndInlineCompletionsModel(
        "",
        { fakeClock: true, provider },
        async ({ editor, editorViewModel, model, context }) => {
          context.keyboardType("let\nlet\n");
          editor.setSelections([
            new Selection(1, 1e3, 1, 1e3),
            new Selection(2, 1e3, 2, 1e3)
          ]);
          provider.setReturnValue({
            insertText: `let a = 'some word'; `,
            range: new Range(1, 1, 1, 1e3)
          });
          await acceptNextWord(model, editor, 2);
          assert.deepStrictEqual(
            editor.getValue(),
            [`let a`, `let a`, ``].join("\n")
          );
        }
      );
    });
    test("Partial Multi-Part Completion", async () => {
      const provider = new MockInlineCompletionsProvider();
      await withAsyncTestCodeEditorAndInlineCompletionsModel(
        "",
        { fakeClock: true, provider },
        async ({ editor, editorViewModel, model, context }) => {
          context.keyboardType("for ()\nfor \n");
          editor.setSelections([
            new Selection(1, 5, 1, 5),
            new Selection(2, 1e3, 2, 1e3)
          ]);
          provider.setReturnValue({
            insertText: `for (let i = 0; i < 10; i++) {`,
            range: new Range(1, 1, 1, 1e3)
          });
          model.triggerExplicitly();
          await timeout(1e3);
          await acceptNextWord(model, editor, 3);
          assert.deepStrictEqual(
            editor.getValue(),
            [`for (let i)`, `for (let i`, ``].join("\n")
          );
        }
      );
    });
    test("Partial Mutli-Part and Different Cursor Columns Completion", async () => {
      const provider = new MockInlineCompletionsProvider();
      await withAsyncTestCodeEditorAndInlineCompletionsModel(
        "",
        { fakeClock: true, provider },
        async ({ editor, editorViewModel, model, context }) => {
          context.keyboardType(`console.log()
console.warnnnn
`);
          editor.setSelections([
            new Selection(1, 12, 1, 12),
            new Selection(2, 16, 2, 16)
          ]);
          provider.setReturnValue({
            insertText: `console.log("hello" + " " + "world");`,
            range: new Range(1, 1, 1, 1e3)
          });
          model.triggerExplicitly();
          await timeout(1e3);
          await acceptNextWord(model, editor, 4);
          assert.deepStrictEqual(
            editor.getValue(),
            [
              `console.log("hello" + )`,
              `console.warnnnn("hello" + `,
              ``
            ].join("\n")
          );
        }
      );
    });
  });
});
async function withAsyncTestCodeEditorAndInlineCompletionsModel(text, options, callback) {
  return await runWithFakedTimers(
    {
      useFakeTimers: options.fakeClock
    },
    async () => {
      const disposableStore = new DisposableStore();
      try {
        if (options.provider) {
          const languageFeaturesService = new LanguageFeaturesService();
          if (!options.serviceCollection) {
            options.serviceCollection = new ServiceCollection();
          }
          options.serviceCollection.set(
            ILanguageFeaturesService,
            languageFeaturesService
          );
          options.serviceCollection.set(IAccessibilitySignalService, {
            playSignal: async () => {
            },
            isSoundEnabled(signal) {
              return false;
            }
          });
          const d = languageFeaturesService.inlineCompletionsProvider.register(
            { pattern: "**" },
            options.provider
          );
          disposableStore.add(d);
        }
        let result;
        await withAsyncTestCodeEditor(
          text,
          options,
          async (editor, editorViewModel, instantiationService) => {
            const controller = instantiationService.createInstance(
              InlineCompletionsController,
              editor
            );
            const model = controller.model.get();
            const context = new GhostTextContext(model, editor);
            try {
              result = await callback({
                editor,
                editorViewModel,
                model,
                context
              });
            } finally {
              context.dispose();
              model.dispose();
              controller.dispose();
            }
          }
        );
        if (options.provider instanceof MockInlineCompletionsProvider) {
          options.provider.assertNotCalledTwiceWithin50ms();
        }
        return result;
      } finally {
        disposableStore.dispose();
      }
    }
  );
}
