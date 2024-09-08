import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { CursorColumns } from "../../../common/core/cursorColumns.js";
suite("CursorMove", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("nextRenderTabStop", () => {
    assert.strictEqual(CursorColumns.nextRenderTabStop(0, 4), 4);
    assert.strictEqual(CursorColumns.nextRenderTabStop(1, 4), 4);
    assert.strictEqual(CursorColumns.nextRenderTabStop(2, 4), 4);
    assert.strictEqual(CursorColumns.nextRenderTabStop(3, 4), 4);
    assert.strictEqual(CursorColumns.nextRenderTabStop(4, 4), 8);
    assert.strictEqual(CursorColumns.nextRenderTabStop(5, 4), 8);
    assert.strictEqual(CursorColumns.nextRenderTabStop(6, 4), 8);
    assert.strictEqual(CursorColumns.nextRenderTabStop(7, 4), 8);
    assert.strictEqual(CursorColumns.nextRenderTabStop(8, 4), 12);
    assert.strictEqual(CursorColumns.nextRenderTabStop(0, 2), 2);
    assert.strictEqual(CursorColumns.nextRenderTabStop(1, 2), 2);
    assert.strictEqual(CursorColumns.nextRenderTabStop(2, 2), 4);
    assert.strictEqual(CursorColumns.nextRenderTabStop(3, 2), 4);
    assert.strictEqual(CursorColumns.nextRenderTabStop(4, 2), 6);
    assert.strictEqual(CursorColumns.nextRenderTabStop(5, 2), 6);
    assert.strictEqual(CursorColumns.nextRenderTabStop(6, 2), 8);
    assert.strictEqual(CursorColumns.nextRenderTabStop(7, 2), 8);
    assert.strictEqual(CursorColumns.nextRenderTabStop(8, 2), 10);
    assert.strictEqual(CursorColumns.nextRenderTabStop(0, 1), 1);
    assert.strictEqual(CursorColumns.nextRenderTabStop(1, 1), 2);
    assert.strictEqual(CursorColumns.nextRenderTabStop(2, 1), 3);
    assert.strictEqual(CursorColumns.nextRenderTabStop(3, 1), 4);
    assert.strictEqual(CursorColumns.nextRenderTabStop(4, 1), 5);
    assert.strictEqual(CursorColumns.nextRenderTabStop(5, 1), 6);
    assert.strictEqual(CursorColumns.nextRenderTabStop(6, 1), 7);
    assert.strictEqual(CursorColumns.nextRenderTabStop(7, 1), 8);
    assert.strictEqual(CursorColumns.nextRenderTabStop(8, 1), 9);
  });
  test("visibleColumnFromColumn", () => {
    function testVisibleColumnFromColumn(text, tabSize, column, expected) {
      assert.strictEqual(
        CursorColumns.visibleColumnFromColumn(text, column, tabSize),
        expected
      );
    }
    testVisibleColumnFromColumn("		var x = 3;", 4, 1, 0);
    testVisibleColumnFromColumn("		var x = 3;", 4, 2, 4);
    testVisibleColumnFromColumn("		var x = 3;", 4, 3, 8);
    testVisibleColumnFromColumn("		var x = 3;", 4, 4, 9);
    testVisibleColumnFromColumn("		var x = 3;", 4, 5, 10);
    testVisibleColumnFromColumn("		var x = 3;", 4, 6, 11);
    testVisibleColumnFromColumn("		var x = 3;", 4, 7, 12);
    testVisibleColumnFromColumn("		var x = 3;", 4, 8, 13);
    testVisibleColumnFromColumn("		var x = 3;", 4, 9, 14);
    testVisibleColumnFromColumn("		var x = 3;", 4, 10, 15);
    testVisibleColumnFromColumn("		var x = 3;", 4, 11, 16);
    testVisibleColumnFromColumn("		var x = 3;", 4, 12, 17);
    testVisibleColumnFromColumn("		var x = 3;", 4, 13, 18);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 1, 0);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 2, 4);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 3, 5);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 4, 8);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 5, 9);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 6, 10);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 7, 11);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 8, 12);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 9, 13);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 10, 14);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 11, 15);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 12, 16);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 13, 17);
    testVisibleColumnFromColumn("	 	var x = 3;", 4, 14, 18);
    testVisibleColumnFromColumn("	  	x	", 4, -1, 0);
    testVisibleColumnFromColumn("	  	x	", 4, 0, 0);
    testVisibleColumnFromColumn("	  	x	", 4, 1, 0);
    testVisibleColumnFromColumn("	  	x	", 4, 2, 4);
    testVisibleColumnFromColumn("	  	x	", 4, 3, 5);
    testVisibleColumnFromColumn("	  	x	", 4, 4, 6);
    testVisibleColumnFromColumn("	  	x	", 4, 5, 8);
    testVisibleColumnFromColumn("	  	x	", 4, 6, 9);
    testVisibleColumnFromColumn("	  	x	", 4, 7, 12);
    testVisibleColumnFromColumn("	  	x	", 4, 8, 12);
    testVisibleColumnFromColumn("	  	x	", 4, 9, 12);
    testVisibleColumnFromColumn("baz", 4, 1, 0);
    testVisibleColumnFromColumn("baz", 4, 2, 1);
    testVisibleColumnFromColumn("baz", 4, 3, 2);
    testVisibleColumnFromColumn("baz", 4, 4, 3);
    testVisibleColumnFromColumn("\u{1F4DA}az", 4, 1, 0);
    testVisibleColumnFromColumn("\u{1F4DA}az", 4, 2, 1);
    testVisibleColumnFromColumn("\u{1F4DA}az", 4, 3, 2);
    testVisibleColumnFromColumn("\u{1F4DA}az", 4, 4, 3);
    testVisibleColumnFromColumn("\u{1F4DA}az", 4, 5, 4);
  });
  test("columnFromVisibleColumn", () => {
    function testColumnFromVisibleColumn(text, tabSize, visibleColumn, expected) {
      assert.strictEqual(
        CursorColumns.columnFromVisibleColumn(
          text,
          visibleColumn,
          tabSize
        ),
        expected
      );
    }
    testColumnFromVisibleColumn("		var x = 3;", 4, 1, 1);
    testColumnFromVisibleColumn("		var x = 3;", 4, 2, 1);
    testColumnFromVisibleColumn("		var x = 3;", 4, 3, 2);
    testColumnFromVisibleColumn("		var x = 3;", 4, 4, 2);
    testColumnFromVisibleColumn("		var x = 3;", 4, 5, 2);
    testColumnFromVisibleColumn("		var x = 3;", 4, 6, 2);
    testColumnFromVisibleColumn("		var x = 3;", 4, 7, 3);
    testColumnFromVisibleColumn("		var x = 3;", 4, 8, 3);
    testColumnFromVisibleColumn("		var x = 3;", 4, 9, 4);
    testColumnFromVisibleColumn("		var x = 3;", 4, 10, 5);
    testColumnFromVisibleColumn("		var x = 3;", 4, 11, 6);
    testColumnFromVisibleColumn("		var x = 3;", 4, 12, 7);
    testColumnFromVisibleColumn("		var x = 3;", 4, 13, 8);
    testColumnFromVisibleColumn("		var x = 3;", 4, 14, 9);
    testColumnFromVisibleColumn("		var x = 3;", 4, 15, 10);
    testColumnFromVisibleColumn("		var x = 3;", 4, 16, 11);
    testColumnFromVisibleColumn("		var x = 3;", 4, 17, 12);
    testColumnFromVisibleColumn("		var x = 3;", 4, 18, 13);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 0, 1);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 1, 1);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 2, 1);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 3, 2);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 4, 2);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 5, 3);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 6, 3);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 7, 4);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 8, 4);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 9, 5);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 10, 6);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 11, 7);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 12, 8);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 13, 9);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 14, 10);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 15, 11);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 16, 12);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 17, 13);
    testColumnFromVisibleColumn("	 	var x = 3;", 4, 18, 14);
    testColumnFromVisibleColumn("	  	x	", 4, -2, 1);
    testColumnFromVisibleColumn("	  	x	", 4, -1, 1);
    testColumnFromVisibleColumn("	  	x	", 4, 0, 1);
    testColumnFromVisibleColumn("	  	x	", 4, 1, 1);
    testColumnFromVisibleColumn("	  	x	", 4, 2, 1);
    testColumnFromVisibleColumn("	  	x	", 4, 3, 2);
    testColumnFromVisibleColumn("	  	x	", 4, 4, 2);
    testColumnFromVisibleColumn("	  	x	", 4, 5, 3);
    testColumnFromVisibleColumn("	  	x	", 4, 6, 4);
    testColumnFromVisibleColumn("	  	x	", 4, 7, 4);
    testColumnFromVisibleColumn("	  	x	", 4, 8, 5);
    testColumnFromVisibleColumn("	  	x	", 4, 9, 6);
    testColumnFromVisibleColumn("	  	x	", 4, 10, 6);
    testColumnFromVisibleColumn("	  	x	", 4, 11, 7);
    testColumnFromVisibleColumn("	  	x	", 4, 12, 7);
    testColumnFromVisibleColumn("	  	x	", 4, 13, 7);
    testColumnFromVisibleColumn("	  	x	", 4, 14, 7);
    testColumnFromVisibleColumn("baz", 4, 0, 1);
    testColumnFromVisibleColumn("baz", 4, 1, 2);
    testColumnFromVisibleColumn("baz", 4, 2, 3);
    testColumnFromVisibleColumn("baz", 4, 3, 4);
    testColumnFromVisibleColumn("\u{1F4DA}az", 4, 0, 1);
    testColumnFromVisibleColumn("\u{1F4DA}az", 4, 1, 1);
    testColumnFromVisibleColumn("\u{1F4DA}az", 4, 2, 3);
    testColumnFromVisibleColumn("\u{1F4DA}az", 4, 3, 4);
    testColumnFromVisibleColumn("\u{1F4DA}az", 4, 4, 5);
  });
  test("toStatusbarColumn", () => {
    function t(text, tabSize, column, expected) {
      assert.strictEqual(
        CursorColumns.toStatusbarColumn(text, column, tabSize),
        expected,
        `<<t('${text}', ${tabSize}, ${column}, ${expected})>>`
      );
    }
    t("    spaces", 4, 1, 1);
    t("    spaces", 4, 2, 2);
    t("    spaces", 4, 3, 3);
    t("    spaces", 4, 4, 4);
    t("    spaces", 4, 5, 5);
    t("    spaces", 4, 6, 6);
    t("    spaces", 4, 7, 7);
    t("    spaces", 4, 8, 8);
    t("    spaces", 4, 9, 9);
    t("    spaces", 4, 10, 10);
    t("    spaces", 4, 11, 11);
    t("	tab", 4, 1, 1);
    t("	tab", 4, 2, 5);
    t("	tab", 4, 3, 6);
    t("	tab", 4, 4, 7);
    t("	tab", 4, 5, 8);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 1, 1);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 2, 2);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 3, 2);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 4, 3);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 5, 3);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 6, 4);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 7, 4);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 8, 5);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 9, 5);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 10, 6);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 11, 6);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 12, 7);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 13, 7);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 14, 8);
    t("\u{10300}\u{10301}\u{10302}\u{10303}\u{10304}\u{10305}\u{10306}", 4, 15, 8);
    t("\u{1F388}\u{1F388}\u{1F388}\u{1F388}", 4, 1, 1);
    t("\u{1F388}\u{1F388}\u{1F388}\u{1F388}", 4, 2, 2);
    t("\u{1F388}\u{1F388}\u{1F388}\u{1F388}", 4, 3, 2);
    t("\u{1F388}\u{1F388}\u{1F388}\u{1F388}", 4, 4, 3);
    t("\u{1F388}\u{1F388}\u{1F388}\u{1F388}", 4, 5, 3);
    t("\u{1F388}\u{1F388}\u{1F388}\u{1F388}", 4, 6, 4);
    t("\u{1F388}\u{1F388}\u{1F388}\u{1F388}", 4, 7, 4);
    t("\u{1F388}\u{1F388}\u{1F388}\u{1F388}", 4, 8, 5);
    t("\u{1F388}\u{1F388}\u{1F388}\u{1F388}", 4, 9, 5);
    t("\u4F55\u4F55\u4F55\u4F55", 4, 1, 1);
    t("\u4F55\u4F55\u4F55\u4F55", 4, 2, 2);
    t("\u4F55\u4F55\u4F55\u4F55", 4, 3, 3);
    t("\u4F55\u4F55\u4F55\u4F55", 4, 4, 4);
  });
});
