import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { parseNextChatResponseChunk } from "../../electron-sandbox/actions/voiceChatActions.js";
suite("VoiceChatActions", () => {
  function assertChunk(text, expected, offset) {
    const res = parseNextChatResponseChunk(text, offset);
    assert.strictEqual(res.chunk, expected);
    return res;
  }
  test("parseNextChatResponseChunk", () => {
    assertChunk("Hello World", void 0, 0);
    assertChunk("Hello World.", void 0, 0);
    assertChunk("Hello World. ", "Hello World.", 0);
    assertChunk("Hello World? ", "Hello World?", 0);
    assertChunk("Hello World! ", "Hello World!", 0);
    assertChunk("Hello World: ", "Hello World:", 0);
    assertChunk(
      "Hello World. How is your day? And more...",
      "Hello World. How is your day?",
      0
    );
    let offset = assertChunk(
      "Hello World. How is your ",
      "Hello World.",
      0
    ).offset;
    offset = assertChunk(
      "Hello World. How is your day? And more...",
      "How is your day?",
      offset
    ).offset;
    offset = assertChunk(
      "Hello World. How is your day? And more to come! ",
      "And more to come!",
      offset
    ).offset;
    assertChunk(
      "Hello World. How is your day? And more to come! ",
      void 0,
      offset
    );
    offset = assertChunk(
      "Hello World.\nHow is your",
      "Hello World.",
      0
    ).offset;
    assertChunk(
      "Hello World.\nHow is your day?\n",
      "How is your day?",
      offset
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
