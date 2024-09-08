import assert from "assert";
import { FastDomNode } from "../../../../../base/browser/fastDomNode.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { Event } from "../../../../../base/common/event.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  IMenuService
} from "../../../../../platform/actions/common/actions.js";
import { CellOutputContainer } from "../../browser/view/cellParts/cellOutput.js";
import {
  CellKind
} from "../../common/notebookCommon.js";
import { INotebookService } from "../../common/notebookService.js";
import {
  setupInstantiationService,
  withTestNotebook
} from "./testNotebookEditor.js";
suite("CellOutput", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let instantiationService;
  let outputMenus = [];
  setup(() => {
    outputMenus = [];
    instantiationService = setupInstantiationService(store);
    instantiationService.stub(
      INotebookService,
      new class extends mock() {
        getOutputMimeTypeInfo() {
          return [
            {
              rendererId: "plainTextRendererId",
              mimeType: "text/plain",
              isTrusted: true
            },
            {
              rendererId: "htmlRendererId",
              mimeType: "text/html",
              isTrusted: true
            }
          ];
        }
        getRendererInfo() {
          return {
            id: "rendererId",
            displayName: "Stubbed Renderer",
            extensionId: { _lower: "id", value: "id" }
          };
        }
      }()
    );
    instantiationService.stub(
      IMenuService,
      new class extends mock() {
        createMenu() {
          const menu = new class extends mock() {
            onDidChange = Event.None;
            getActions() {
              return [];
            }
            dispose() {
              outputMenus = outputMenus.filter(
                (item) => item !== menu
              );
            }
          }();
          outputMenus.push(menu);
          return menu;
        }
      }()
    );
  });
  test("Render cell output items with multiple mime types", async () => {
    const outputItem = {
      data: VSBuffer.fromString("output content"),
      mime: "text/plain"
    };
    const htmlOutputItem = {
      data: VSBuffer.fromString("output content"),
      mime: "text/html"
    };
    const output1 = {
      outputId: "abc",
      outputs: [outputItem, htmlOutputItem]
    };
    const output2 = {
      outputId: "def",
      outputs: [outputItem, htmlOutputItem]
    };
    await withTestNotebook(
      [
        [
          "print(output content)",
          "python",
          CellKind.Code,
          [output1, output2],
          {}
        ]
      ],
      (editor, viewModel, disposables, accessor) => {
        const cell = viewModel.viewCells[0];
        const cellTemplate = createCellTemplate(disposables);
        const output = disposables.add(
          accessor.createInstance(
            CellOutputContainer,
            editor,
            cell,
            cellTemplate,
            { limit: 100 }
          )
        );
        output.render();
        cell.outputsViewModels[0].setVisible(true);
        assert.strictEqual(
          outputMenus.length,
          1,
          "should have 1 output menus"
        );
        assert(
          cellTemplate.outputContainer.domNode.style.display !== "none",
          "output container should be visible"
        );
        cell.outputsViewModels[1].setVisible(true);
        assert.strictEqual(
          outputMenus.length,
          2,
          "should have 2 output menus"
        );
        cell.outputsViewModels[1].setVisible(true);
        assert.strictEqual(
          outputMenus.length,
          2,
          "should still have 2 output menus"
        );
      },
      instantiationService
    );
  });
  test("One of many cell outputs becomes hidden", async () => {
    const outputItem = {
      data: VSBuffer.fromString("output content"),
      mime: "text/plain"
    };
    const htmlOutputItem = {
      data: VSBuffer.fromString("output content"),
      mime: "text/html"
    };
    const output1 = {
      outputId: "abc",
      outputs: [outputItem, htmlOutputItem]
    };
    const output2 = {
      outputId: "def",
      outputs: [outputItem, htmlOutputItem]
    };
    const output3 = {
      outputId: "ghi",
      outputs: [outputItem, htmlOutputItem]
    };
    await withTestNotebook(
      [
        [
          "print(output content)",
          "python",
          CellKind.Code,
          [output1, output2, output3],
          {}
        ]
      ],
      (editor, viewModel, disposables, accessor) => {
        const cell = viewModel.viewCells[0];
        const cellTemplate = createCellTemplate(disposables);
        const output = disposables.add(
          accessor.createInstance(
            CellOutputContainer,
            editor,
            cell,
            cellTemplate,
            { limit: 100 }
          )
        );
        output.render();
        cell.outputsViewModels[0].setVisible(true);
        cell.outputsViewModels[1].setVisible(true);
        cell.outputsViewModels[2].setVisible(true);
        cell.outputsViewModels[1].setVisible(false);
        assert(
          cellTemplate.outputContainer.domNode.style.display !== "none",
          "output container should be visible"
        );
        assert.strictEqual(
          outputMenus.length,
          2,
          "should have 2 output menus"
        );
      },
      instantiationService
    );
  });
});
function createCellTemplate(disposables) {
  return {
    outputContainer: new FastDomNode(document.createElement("div")),
    outputShowMoreContainer: new FastDomNode(document.createElement("div")),
    focusSinkElement: document.createElement("div"),
    templateDisposables: disposables,
    elementDisposables: disposables
  };
}
