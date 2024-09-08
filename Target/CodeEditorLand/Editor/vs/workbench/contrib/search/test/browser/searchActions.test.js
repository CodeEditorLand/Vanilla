import assert from "assert";
import { OS } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { USLayoutResolvedKeybinding } from "../../../../../platform/keybinding/common/usLayoutResolvedKeybinding.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import {
  QueryType
} from "../../../../services/search/common/search.js";
import { INotebookEditorService } from "../../../notebook/browser/services/notebookEditorService.js";
import {
  getElementToFocusAfterRemoved,
  getLastNodeFromSameType
} from "../../browser/searchActionsRemoveReplace.js";
import {
  FileMatch,
  FolderMatch,
  Match,
  SearchModel
} from "../../browser/searchModel.js";
import { MockObjectTree } from "./mockSearchTree.js";
import {
  createFileUriFromPathFromRoot,
  stubModelService,
  stubNotebookEditorService
} from "./searchTestCommon.js";
suite("Search Actions", () => {
  let instantiationService;
  let counter;
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    instantiationService = new TestInstantiationService();
    instantiationService.stub(
      IModelService,
      stubModelService(instantiationService, (e) => store.add(e))
    );
    instantiationService.stub(
      INotebookEditorService,
      stubNotebookEditorService(
        instantiationService,
        (e) => store.add(e)
      )
    );
    instantiationService.stub(IKeybindingService, {});
    instantiationService.stub(ILabelService, {
      getUriBasenameLabel: (uri) => ""
    });
    instantiationService.stub(
      IKeybindingService,
      "resolveKeybinding",
      (keybinding) => USLayoutResolvedKeybinding.resolveKeybinding(keybinding, OS)
    );
    instantiationService.stub(
      IKeybindingService,
      "lookupKeybinding",
      (id) => null
    );
    instantiationService.stub(
      IKeybindingService,
      "lookupKeybinding",
      (id) => null
    );
    counter = 0;
  });
  teardown(() => {
    instantiationService.dispose();
  });
  test("get next element to focus after removing a match when it has next sibling file", () => {
    const fileMatch1 = aFileMatch();
    const fileMatch2 = aFileMatch();
    const data = [
      fileMatch1,
      aMatch(fileMatch1),
      aMatch(fileMatch1),
      fileMatch2,
      aMatch(fileMatch2),
      aMatch(fileMatch2)
    ];
    const tree = aTree(data);
    const target = data[2];
    const actual = getElementToFocusAfterRemoved(tree, target, [target]);
    assert.strictEqual(data[4], actual);
  });
  test("get next element to focus after removing a match when it is the only match", () => {
    const fileMatch1 = aFileMatch();
    const data = [fileMatch1, aMatch(fileMatch1)];
    const tree = aTree(data);
    const target = data[1];
    const actual = getElementToFocusAfterRemoved(tree, target, [target]);
    assert.strictEqual(void 0, actual);
  });
  test("get next element to focus after removing a file match when it has next sibling", () => {
    const fileMatch1 = aFileMatch();
    const fileMatch2 = aFileMatch();
    const fileMatch3 = aFileMatch();
    const data = [
      fileMatch1,
      aMatch(fileMatch1),
      fileMatch2,
      aMatch(fileMatch2),
      fileMatch3,
      aMatch(fileMatch3)
    ];
    const tree = aTree(data);
    const target = data[2];
    const actual = getElementToFocusAfterRemoved(tree, target, []);
    assert.strictEqual(data[4], actual);
  });
  test("Find last FileMatch in Tree", () => {
    const fileMatch1 = aFileMatch();
    const fileMatch2 = aFileMatch();
    const fileMatch3 = aFileMatch();
    const data = [
      fileMatch1,
      aMatch(fileMatch1),
      fileMatch2,
      aMatch(fileMatch2),
      fileMatch3,
      aMatch(fileMatch3)
    ];
    const tree = aTree(data);
    const actual = getLastNodeFromSameType(tree, fileMatch1);
    assert.strictEqual(fileMatch3, actual);
  });
  test("Find last Match in Tree", () => {
    const fileMatch1 = aFileMatch();
    const fileMatch2 = aFileMatch();
    const fileMatch3 = aFileMatch();
    const data = [
      fileMatch1,
      aMatch(fileMatch1),
      fileMatch2,
      aMatch(fileMatch2),
      fileMatch3,
      aMatch(fileMatch3)
    ];
    const tree = aTree(data);
    const actual = getLastNodeFromSameType(tree, aMatch(fileMatch1));
    assert.strictEqual(data[5], actual);
  });
  test("get next element to focus after removing a file match when it is only match", () => {
    const fileMatch1 = aFileMatch();
    const data = [fileMatch1, aMatch(fileMatch1)];
    const tree = aTree(data);
    const target = data[0];
    const actual = getElementToFocusAfterRemoved(tree, target, []);
    assert.strictEqual(void 0, actual);
  });
  function aFileMatch() {
    const rawMatch = {
      resource: URI.file("somepath" + ++counter),
      results: []
    };
    const searchModel = instantiationService.createInstance(SearchModel);
    store.add(searchModel);
    const folderMatch = instantiationService.createInstance(
      FolderMatch,
      URI.file("somepath"),
      "",
      0,
      {
        type: QueryType.Text,
        folderQueries: [{ folder: createFileUriFromPathFromRoot() }],
        contentPattern: {
          pattern: ""
        }
      },
      searchModel.searchResult,
      searchModel.searchResult,
      null
    );
    store.add(folderMatch);
    const fileMatch = instantiationService.createInstance(
      FileMatch,
      {
        pattern: ""
      },
      void 0,
      void 0,
      folderMatch,
      rawMatch,
      null,
      ""
    );
    fileMatch.createMatches(false);
    store.add(fileMatch);
    return fileMatch;
  }
  function aMatch(fileMatch) {
    const line = ++counter;
    const match = new Match(
      fileMatch,
      ["some match"],
      {
        startLineNumber: 0,
        startColumn: 0,
        endLineNumber: 0,
        endColumn: 2
      },
      {
        startLineNumber: line,
        startColumn: 0,
        endLineNumber: line,
        endColumn: 2
      },
      false
    );
    fileMatch.add(match);
    return match;
  }
  function aTree(elements) {
    return new MockObjectTree(elements);
  }
});
