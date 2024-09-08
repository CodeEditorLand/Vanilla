import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { URI } from "../../../../../base/common/uri.js";
import {
  ensureNoDisposablesAreLeakedInTestSuite,
  toResource
} from "../../../../../base/test/common/utils.js";
import { Position } from "../../../../../editor/common/core/position.js";
import {
  EditorResolution
} from "../../../../../platform/editor/common/editor.js";
import { SyncDescriptor } from "../../../../../platform/instantiation/common/descriptors.js";
import { whenEditorClosed } from "../../../../browser/editor.js";
import {
  EditorInputCapabilities,
  EditorResourceAccessor,
  SideBySideEditor,
  isEditorIdentifier,
  isEditorInput,
  isEditorInputWithOptions,
  isEditorInputWithOptionsAndGroup,
  isResourceDiffEditorInput,
  isResourceEditorInput,
  isResourceMergeEditorInput,
  isResourceSideBySideEditorInput,
  isTextEditorViewState,
  isUntitledResourceEditorInput
} from "../../../../common/editor.js";
import { DiffEditorInput } from "../../../../common/editor/diffEditorInput.js";
import { SideBySideEditorInput } from "../../../../common/editor/sideBySideEditorInput.js";
import { EditorService } from "../../../../services/editor/browser/editorService.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { UntitledTextEditorInput } from "../../../../services/untitled/common/untitledTextEditorInput.js";
import {
  TestEditorInput,
  TestFileEditorInput,
  TestServiceAccessor,
  createEditorPart,
  registerTestEditor,
  registerTestFileEditor,
  registerTestResourceEditor,
  registerTestSideBySideEditor,
  workbenchInstantiationService
} from "../../workbenchTestServices.js";
suite("Workbench editor utils", () => {
  class TestEditorInputWithPreferredResource extends TestEditorInput {
    constructor(resource, preferredResource, typeId) {
      super(resource, typeId);
      this.preferredResource = preferredResource;
    }
  }
  const disposables = new DisposableStore();
  const TEST_EDITOR_ID = "MyTestEditorForEditors";
  let instantiationService;
  let accessor;
  setup(() => {
    instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    accessor = instantiationService.createInstance(TestServiceAccessor);
    disposables.add(accessor.untitledTextEditorService);
    disposables.add(registerTestFileEditor());
    disposables.add(registerTestSideBySideEditor());
    disposables.add(registerTestResourceEditor());
    disposables.add(
      registerTestEditor(TEST_EDITOR_ID, [
        new SyncDescriptor(TestFileEditorInput)
      ])
    );
  });
  teardown(() => {
    disposables.clear();
  });
  test("untyped check functions", () => {
    assert.ok(!isResourceEditorInput(void 0));
    assert.ok(!isResourceEditorInput({}));
    assert.ok(
      !isResourceEditorInput({
        original: { resource: URI.file("/") },
        modified: { resource: URI.file("/") }
      })
    );
    assert.ok(isResourceEditorInput({ resource: URI.file("/") }));
    assert.ok(!isUntitledResourceEditorInput(void 0));
    assert.ok(isUntitledResourceEditorInput({}));
    assert.ok(
      isUntitledResourceEditorInput({
        resource: URI.file("/").with({ scheme: Schemas.untitled })
      })
    );
    assert.ok(
      isUntitledResourceEditorInput({
        resource: URI.file("/"),
        forceUntitled: true
      })
    );
    assert.ok(!isResourceDiffEditorInput(void 0));
    assert.ok(!isResourceDiffEditorInput({}));
    assert.ok(!isResourceDiffEditorInput({ resource: URI.file("/") }));
    assert.ok(
      isResourceDiffEditorInput({
        original: { resource: URI.file("/") },
        modified: { resource: URI.file("/") }
      })
    );
    assert.ok(
      isResourceDiffEditorInput({
        original: { resource: URI.file("/") },
        modified: { resource: URI.file("/") },
        primary: { resource: URI.file("/") },
        secondary: { resource: URI.file("/") }
      })
    );
    assert.ok(
      !isResourceDiffEditorInput({
        primary: { resource: URI.file("/") },
        secondary: { resource: URI.file("/") }
      })
    );
    assert.ok(!isResourceSideBySideEditorInput(void 0));
    assert.ok(!isResourceSideBySideEditorInput({}));
    assert.ok(
      !isResourceSideBySideEditorInput({ resource: URI.file("/") })
    );
    assert.ok(
      isResourceSideBySideEditorInput({
        primary: { resource: URI.file("/") },
        secondary: { resource: URI.file("/") }
      })
    );
    assert.ok(
      !isResourceSideBySideEditorInput({
        original: { resource: URI.file("/") },
        modified: { resource: URI.file("/") }
      })
    );
    assert.ok(
      !isResourceSideBySideEditorInput({
        primary: { resource: URI.file("/") },
        secondary: { resource: URI.file("/") },
        original: { resource: URI.file("/") },
        modified: { resource: URI.file("/") }
      })
    );
    assert.ok(!isResourceMergeEditorInput(void 0));
    assert.ok(!isResourceMergeEditorInput({}));
    assert.ok(!isResourceMergeEditorInput({ resource: URI.file("/") }));
    assert.ok(
      isResourceMergeEditorInput({
        input1: { resource: URI.file("/") },
        input2: { resource: URI.file("/") },
        base: { resource: URI.file("/") },
        result: { resource: URI.file("/") }
      })
    );
  });
  test("EditorInputCapabilities", () => {
    const testInput1 = disposables.add(
      new TestFileEditorInput(URI.file("resource1"), "testTypeId")
    );
    const testInput2 = disposables.add(
      new TestFileEditorInput(URI.file("resource2"), "testTypeId")
    );
    testInput1.capabilities = EditorInputCapabilities.None;
    assert.strictEqual(
      testInput1.hasCapability(EditorInputCapabilities.None),
      true
    );
    assert.strictEqual(
      testInput1.hasCapability(EditorInputCapabilities.Readonly),
      false
    );
    assert.strictEqual(testInput1.isReadonly(), false);
    assert.strictEqual(
      testInput1.hasCapability(EditorInputCapabilities.Untitled),
      false
    );
    assert.strictEqual(
      testInput1.hasCapability(EditorInputCapabilities.RequiresTrust),
      false
    );
    assert.strictEqual(
      testInput1.hasCapability(EditorInputCapabilities.Singleton),
      false
    );
    testInput1.capabilities |= EditorInputCapabilities.Readonly;
    assert.strictEqual(
      testInput1.hasCapability(EditorInputCapabilities.Readonly),
      true
    );
    assert.strictEqual(!!testInput1.isReadonly(), true);
    assert.strictEqual(
      testInput1.hasCapability(EditorInputCapabilities.None),
      false
    );
    assert.strictEqual(
      testInput1.hasCapability(EditorInputCapabilities.Untitled),
      false
    );
    assert.strictEqual(
      testInput1.hasCapability(EditorInputCapabilities.RequiresTrust),
      false
    );
    assert.strictEqual(
      testInput1.hasCapability(EditorInputCapabilities.Singleton),
      false
    );
    testInput1.capabilities = EditorInputCapabilities.None;
    testInput2.capabilities = EditorInputCapabilities.None;
    const sideBySideInput = instantiationService.createInstance(
      SideBySideEditorInput,
      "name",
      void 0,
      testInput1,
      testInput2
    );
    assert.strictEqual(
      sideBySideInput.hasCapability(
        EditorInputCapabilities.MultipleEditors
      ),
      true
    );
    assert.strictEqual(
      sideBySideInput.hasCapability(EditorInputCapabilities.Readonly),
      false
    );
    assert.strictEqual(sideBySideInput.isReadonly(), false);
    assert.strictEqual(
      sideBySideInput.hasCapability(EditorInputCapabilities.Untitled),
      false
    );
    assert.strictEqual(
      sideBySideInput.hasCapability(
        EditorInputCapabilities.RequiresTrust
      ),
      false
    );
    assert.strictEqual(
      sideBySideInput.hasCapability(EditorInputCapabilities.Singleton),
      false
    );
    testInput1.capabilities |= EditorInputCapabilities.Readonly;
    assert.strictEqual(
      sideBySideInput.hasCapability(EditorInputCapabilities.Readonly),
      false
    );
    assert.strictEqual(sideBySideInput.isReadonly(), false);
    testInput2.capabilities |= EditorInputCapabilities.Readonly;
    assert.strictEqual(
      sideBySideInput.hasCapability(EditorInputCapabilities.Readonly),
      true
    );
    assert.strictEqual(!!sideBySideInput.isReadonly(), true);
    testInput1.capabilities |= EditorInputCapabilities.Untitled;
    assert.strictEqual(
      sideBySideInput.hasCapability(EditorInputCapabilities.Untitled),
      false
    );
    testInput2.capabilities |= EditorInputCapabilities.Untitled;
    assert.strictEqual(
      sideBySideInput.hasCapability(EditorInputCapabilities.Untitled),
      true
    );
    testInput1.capabilities |= EditorInputCapabilities.RequiresTrust;
    assert.strictEqual(
      sideBySideInput.hasCapability(
        EditorInputCapabilities.RequiresTrust
      ),
      true
    );
    testInput2.capabilities |= EditorInputCapabilities.RequiresTrust;
    assert.strictEqual(
      sideBySideInput.hasCapability(
        EditorInputCapabilities.RequiresTrust
      ),
      true
    );
    testInput1.capabilities |= EditorInputCapabilities.Singleton;
    assert.strictEqual(
      sideBySideInput.hasCapability(EditorInputCapabilities.Singleton),
      true
    );
    testInput2.capabilities |= EditorInputCapabilities.Singleton;
    assert.strictEqual(
      sideBySideInput.hasCapability(EditorInputCapabilities.Singleton),
      true
    );
  });
  test("EditorResourceAccessor - typed inputs", () => {
    const service = accessor.untitledTextEditorService;
    assert.ok(!EditorResourceAccessor.getCanonicalUri(null));
    assert.ok(!EditorResourceAccessor.getOriginalUri(null));
    const untitled = disposables.add(
      instantiationService.createInstance(
        UntitledTextEditorInput,
        service.create()
      )
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled)?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        supportSideBySide: SideBySideEditor.PRIMARY
      })?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        supportSideBySide: SideBySideEditor.ANY
      })?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        supportSideBySide: SideBySideEditor.SECONDARY
      })?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        supportSideBySide: SideBySideEditor.BOTH
      })?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        filterByScheme: Schemas.untitled
      })?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        filterByScheme: [Schemas.file, Schemas.untitled]
      })?.toString(),
      untitled.resource.toString()
    );
    assert.ok(
      !EditorResourceAccessor.getCanonicalUri(untitled, {
        filterByScheme: Schemas.file
      })
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled)?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        supportSideBySide: SideBySideEditor.PRIMARY
      })?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        supportSideBySide: SideBySideEditor.ANY
      })?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        supportSideBySide: SideBySideEditor.SECONDARY
      })?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        supportSideBySide: SideBySideEditor.BOTH
      })?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        filterByScheme: Schemas.untitled
      })?.toString(),
      untitled.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        filterByScheme: [Schemas.file, Schemas.untitled]
      })?.toString(),
      untitled.resource.toString()
    );
    assert.ok(
      !EditorResourceAccessor.getOriginalUri(untitled, {
        filterByScheme: Schemas.file
      })
    );
    const file = disposables.add(
      new TestEditorInput(
        URI.file("/some/path.txt"),
        "editorResourceFileTest"
      )
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file)?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        supportSideBySide: SideBySideEditor.PRIMARY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        supportSideBySide: SideBySideEditor.ANY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        supportSideBySide: SideBySideEditor.SECONDARY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        supportSideBySide: SideBySideEditor.BOTH
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        filterByScheme: Schemas.file
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        filterByScheme: [Schemas.file, Schemas.untitled]
      })?.toString(),
      file.resource.toString()
    );
    assert.ok(
      !EditorResourceAccessor.getCanonicalUri(file, {
        filterByScheme: Schemas.untitled
      })
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file)?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        supportSideBySide: SideBySideEditor.PRIMARY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        supportSideBySide: SideBySideEditor.ANY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        supportSideBySide: SideBySideEditor.SECONDARY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        supportSideBySide: SideBySideEditor.BOTH
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        filterByScheme: Schemas.file
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        filterByScheme: [Schemas.file, Schemas.untitled]
      })?.toString(),
      file.resource.toString()
    );
    assert.ok(
      !EditorResourceAccessor.getOriginalUri(file, {
        filterByScheme: Schemas.untitled
      })
    );
    const diffInput = instantiationService.createInstance(
      DiffEditorInput,
      "name",
      "description",
      untitled,
      file,
      void 0
    );
    const sideBySideInput = instantiationService.createInstance(
      SideBySideEditorInput,
      "name",
      "description",
      untitled,
      file
    );
    for (const input of [diffInput, sideBySideInput]) {
      assert.ok(!EditorResourceAccessor.getCanonicalUri(input));
      assert.ok(
        !EditorResourceAccessor.getCanonicalUri(input, {
          filterByScheme: Schemas.file
        })
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.PRIMARY
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.PRIMARY,
          filterByScheme: Schemas.file
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.PRIMARY,
          filterByScheme: [Schemas.file, Schemas.untitled]
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.SECONDARY
        })?.toString(),
        untitled.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.SECONDARY,
          filterByScheme: Schemas.untitled
        })?.toString(),
        untitled.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.SECONDARY,
          filterByScheme: [Schemas.file, Schemas.untitled]
        })?.toString(),
        untitled.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: Schemas.file
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: [Schemas.file, Schemas.untitled]
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH
        }).secondary.toString(),
        untitled.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: Schemas.untitled
        }).secondary.toString(),
        untitled.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: [Schemas.file, Schemas.untitled]
        }).secondary.toString(),
        untitled.resource.toString()
      );
      assert.ok(!EditorResourceAccessor.getOriginalUri(input));
      assert.ok(
        !EditorResourceAccessor.getOriginalUri(input, {
          filterByScheme: Schemas.file
        })
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.PRIMARY
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.PRIMARY,
          filterByScheme: Schemas.file
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.PRIMARY,
          filterByScheme: [Schemas.file, Schemas.untitled]
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.SECONDARY
        })?.toString(),
        untitled.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.SECONDARY,
          filterByScheme: Schemas.untitled
        })?.toString(),
        untitled.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.SECONDARY,
          filterByScheme: [Schemas.file, Schemas.untitled]
        })?.toString(),
        untitled.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: Schemas.file
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: [Schemas.file, Schemas.untitled]
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH
        }).secondary.toString(),
        untitled.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: Schemas.untitled
        }).secondary.toString(),
        untitled.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(input, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: [Schemas.file, Schemas.untitled]
        }).secondary.toString(),
        untitled.resource.toString()
      );
    }
    const resource = URI.file("/some/path.txt");
    const preferredResource = URI.file("/some/PATH.txt");
    const fileWithPreferredResource = disposables.add(
      new TestEditorInputWithPreferredResource(
        URI.file("/some/path.txt"),
        URI.file("/some/PATH.txt"),
        "editorResourceFileTest"
      )
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(
        fileWithPreferredResource
      )?.toString(),
      resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(
        fileWithPreferredResource
      )?.toString(),
      preferredResource.toString()
    );
  });
  test("EditorResourceAccessor - untyped inputs", () => {
    assert.ok(!EditorResourceAccessor.getCanonicalUri(null));
    assert.ok(!EditorResourceAccessor.getOriginalUri(null));
    const untitledURI = URI.from({
      scheme: Schemas.untitled,
      authority: "foo",
      path: "/bar"
    });
    const untitled = {
      resource: untitledURI
    };
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled)?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        supportSideBySide: SideBySideEditor.PRIMARY
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        supportSideBySide: SideBySideEditor.ANY
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        supportSideBySide: SideBySideEditor.SECONDARY
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        supportSideBySide: SideBySideEditor.BOTH
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        filterByScheme: Schemas.untitled
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(untitled, {
        filterByScheme: [Schemas.file, Schemas.untitled]
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.ok(
      !EditorResourceAccessor.getCanonicalUri(untitled, {
        filterByScheme: Schemas.file
      })
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled)?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        supportSideBySide: SideBySideEditor.PRIMARY
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        supportSideBySide: SideBySideEditor.ANY
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        supportSideBySide: SideBySideEditor.SECONDARY
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        supportSideBySide: SideBySideEditor.BOTH
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        filterByScheme: Schemas.untitled
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(untitled, {
        filterByScheme: [Schemas.file, Schemas.untitled]
      })?.toString(),
      untitled.resource?.toString()
    );
    assert.ok(
      !EditorResourceAccessor.getOriginalUri(untitled, {
        filterByScheme: Schemas.file
      })
    );
    const file = {
      resource: URI.file("/some/path.txt")
    };
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file)?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        supportSideBySide: SideBySideEditor.PRIMARY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        supportSideBySide: SideBySideEditor.ANY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        supportSideBySide: SideBySideEditor.SECONDARY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        supportSideBySide: SideBySideEditor.BOTH
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        filterByScheme: Schemas.file
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(file, {
        filterByScheme: [Schemas.file, Schemas.untitled]
      })?.toString(),
      file.resource.toString()
    );
    assert.ok(
      !EditorResourceAccessor.getCanonicalUri(file, {
        filterByScheme: Schemas.untitled
      })
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file)?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        supportSideBySide: SideBySideEditor.PRIMARY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        supportSideBySide: SideBySideEditor.ANY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        supportSideBySide: SideBySideEditor.SECONDARY
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        supportSideBySide: SideBySideEditor.BOTH
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        filterByScheme: Schemas.file
      })?.toString(),
      file.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(file, {
        filterByScheme: [Schemas.file, Schemas.untitled]
      })?.toString(),
      file.resource.toString()
    );
    assert.ok(
      !EditorResourceAccessor.getOriginalUri(file, {
        filterByScheme: Schemas.untitled
      })
    );
    const diffInput = {
      original: untitled,
      modified: file
    };
    const sideBySideInput = {
      primary: file,
      secondary: untitled
    };
    for (const untypedInput of [diffInput, sideBySideInput]) {
      assert.ok(!EditorResourceAccessor.getCanonicalUri(untypedInput));
      assert.ok(
        !EditorResourceAccessor.getCanonicalUri(untypedInput, {
          filterByScheme: Schemas.file
        })
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.PRIMARY
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.PRIMARY,
          filterByScheme: Schemas.file
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.PRIMARY,
          filterByScheme: [Schemas.file, Schemas.untitled]
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.SECONDARY
        })?.toString(),
        untitled.resource?.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.SECONDARY,
          filterByScheme: Schemas.untitled
        })?.toString(),
        untitled.resource?.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.SECONDARY,
          filterByScheme: [Schemas.file, Schemas.untitled]
        })?.toString(),
        untitled.resource?.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: Schemas.file
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: [Schemas.file, Schemas.untitled]
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH
        }).secondary.toString(),
        untitled.resource?.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: Schemas.untitled
        }).secondary.toString(),
        untitled.resource?.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getCanonicalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: [Schemas.file, Schemas.untitled]
        }).secondary.toString(),
        untitled.resource?.toString()
      );
      assert.ok(!EditorResourceAccessor.getOriginalUri(untypedInput));
      assert.ok(
        !EditorResourceAccessor.getOriginalUri(untypedInput, {
          filterByScheme: Schemas.file
        })
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.PRIMARY
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.PRIMARY,
          filterByScheme: Schemas.file
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.PRIMARY,
          filterByScheme: [Schemas.file, Schemas.untitled]
        })?.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.SECONDARY
        })?.toString(),
        untitled.resource?.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.SECONDARY,
          filterByScheme: Schemas.untitled
        })?.toString(),
        untitled.resource?.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.SECONDARY,
          filterByScheme: [Schemas.file, Schemas.untitled]
        })?.toString(),
        untitled.resource?.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: Schemas.file
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: [Schemas.file, Schemas.untitled]
        }).primary.toString(),
        file.resource.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH
        }).secondary.toString(),
        untitled.resource?.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: Schemas.untitled
        }).secondary.toString(),
        untitled.resource?.toString()
      );
      assert.strictEqual(
        EditorResourceAccessor.getOriginalUri(untypedInput, {
          supportSideBySide: SideBySideEditor.BOTH,
          filterByScheme: [Schemas.file, Schemas.untitled]
        }).secondary.toString(),
        untitled.resource?.toString()
      );
    }
    const fileMerge = {
      input1: { resource: URI.file("/some/remote.txt") },
      input2: { resource: URI.file("/some/local.txt") },
      base: { resource: URI.file("/some/base.txt") },
      result: { resource: URI.file("/some/merged.txt") }
    };
    assert.strictEqual(
      EditorResourceAccessor.getCanonicalUri(fileMerge)?.toString(),
      fileMerge.result.resource.toString()
    );
    assert.strictEqual(
      EditorResourceAccessor.getOriginalUri(fileMerge)?.toString(),
      fileMerge.result.resource.toString()
    );
  });
  test("isEditorIdentifier", () => {
    assert.strictEqual(isEditorIdentifier(void 0), false);
    assert.strictEqual(isEditorIdentifier("undefined"), false);
    const testInput1 = disposables.add(
      new TestFileEditorInput(URI.file("resource1"), "testTypeId")
    );
    assert.strictEqual(isEditorIdentifier(testInput1), false);
    assert.strictEqual(
      isEditorIdentifier({ editor: testInput1, groupId: 3 }),
      true
    );
  });
  test("isEditorInputWithOptionsAndGroup", () => {
    const editorInput = disposables.add(
      new TestFileEditorInput(URI.file("resource1"), "testTypeId")
    );
    assert.strictEqual(isEditorInput(editorInput), true);
    assert.strictEqual(isEditorInputWithOptions(editorInput), false);
    assert.strictEqual(
      isEditorInputWithOptionsAndGroup(editorInput),
      false
    );
    const editorInputWithOptions = {
      editor: editorInput,
      options: { override: EditorResolution.PICK }
    };
    assert.strictEqual(isEditorInput(editorInputWithOptions), false);
    assert.strictEqual(
      isEditorInputWithOptions(editorInputWithOptions),
      true
    );
    assert.strictEqual(
      isEditorInputWithOptionsAndGroup(editorInputWithOptions),
      false
    );
    const service = accessor.editorGroupService;
    const editorInputWithOptionsAndGroup = {
      editor: editorInput,
      options: { override: EditorResolution.PICK },
      group: service.activeGroup
    };
    assert.strictEqual(
      isEditorInput(editorInputWithOptionsAndGroup),
      false
    );
    assert.strictEqual(
      isEditorInputWithOptions(editorInputWithOptionsAndGroup),
      true
    );
    assert.strictEqual(
      isEditorInputWithOptionsAndGroup(editorInputWithOptionsAndGroup),
      true
    );
  });
  test("isTextEditorViewState", () => {
    assert.strictEqual(isTextEditorViewState(void 0), false);
    assert.strictEqual(isTextEditorViewState({}), false);
    const codeEditorViewState = {
      contributionsState: {},
      cursorState: [],
      viewState: {
        scrollLeft: 0,
        firstPosition: new Position(1, 1),
        firstPositionDeltaTop: 1
      }
    };
    assert.strictEqual(isTextEditorViewState(codeEditorViewState), true);
    const diffEditorViewState = {
      original: codeEditorViewState,
      modified: codeEditorViewState
    };
    assert.strictEqual(isTextEditorViewState(diffEditorViewState), true);
  });
  test("whenEditorClosed (single editor)", async function() {
    return testWhenEditorClosed(
      false,
      false,
      toResource.call(this, "/path/index.txt")
    );
  });
  test("whenEditorClosed (multiple editor)", async function() {
    return testWhenEditorClosed(
      false,
      false,
      toResource.call(this, "/path/index.txt"),
      toResource.call(this, "/test.html")
    );
  });
  test("whenEditorClosed (single editor, diff editor)", async function() {
    return testWhenEditorClosed(
      true,
      false,
      toResource.call(this, "/path/index.txt")
    );
  });
  test("whenEditorClosed (multiple editor, diff editor)", async function() {
    return testWhenEditorClosed(
      true,
      false,
      toResource.call(this, "/path/index.txt"),
      toResource.call(this, "/test.html")
    );
  });
  test("whenEditorClosed (single custom editor)", async function() {
    return testWhenEditorClosed(
      false,
      true,
      toResource.call(this, "/path/index.txt")
    );
  });
  test("whenEditorClosed (multiple custom editor)", async function() {
    return testWhenEditorClosed(
      false,
      true,
      toResource.call(this, "/path/index.txt"),
      toResource.call(this, "/test.html")
    );
  });
  async function createServices() {
    const instantiationService2 = workbenchInstantiationService(
      void 0,
      disposables
    );
    const part = await createEditorPart(instantiationService2, disposables);
    instantiationService2.stub(IEditorGroupsService, part);
    const editorService = disposables.add(
      instantiationService2.createInstance(EditorService, void 0)
    );
    instantiationService2.stub(IEditorService, editorService);
    return instantiationService2.createInstance(TestServiceAccessor);
  }
  async function testWhenEditorClosed(sideBySide, custom, ...resources) {
    const accessor2 = await createServices();
    for (const resource of resources) {
      if (custom) {
        await accessor2.editorService.openEditor(
          new TestFileEditorInput(resource, "testTypeId"),
          { pinned: true }
        );
      } else if (sideBySide) {
        await accessor2.editorService.openEditor(
          instantiationService.createInstance(
            SideBySideEditorInput,
            "testSideBySideEditor",
            void 0,
            new TestFileEditorInput(resource, "testTypeId"),
            new TestFileEditorInput(resource, "testTypeId")
          ),
          { pinned: true }
        );
      } else {
        await accessor2.editorService.openEditor({
          resource,
          options: { pinned: true }
        });
      }
    }
    const closedPromise = accessor2.instantitionService.invokeFunction(
      (accessor3) => whenEditorClosed(accessor3, resources)
    );
    accessor2.editorGroupService.activeGroup.closeAllEditors();
    await closedPromise;
  }
  ensureNoDisposablesAreLeakedInTestSuite();
});
