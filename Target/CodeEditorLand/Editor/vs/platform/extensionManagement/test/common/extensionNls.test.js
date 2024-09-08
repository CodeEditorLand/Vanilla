import assert from "assert";
import { deepClone } from "../../../../base/common/objects.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { NullLogger } from "../../../log/common/log.js";
import { localizeManifest } from "../../common/extensionNls.js";
const manifest = {
  name: "test",
  publisher: "test",
  version: "1.0.0",
  engines: {
    vscode: "*"
  },
  contributes: {
    commands: [
      {
        command: "test.command",
        title: "%test.command.title%",
        category: "%test.command.category%"
      }
    ],
    authentication: [
      {
        id: "test.authentication",
        label: "%test.authentication.label%"
      }
    ],
    configuration: {
      // to ensure we test another "title" property
      title: "%test.configuration.title%",
      properties: {
        "test.configuration": {
          type: "string",
          description: "not important"
        }
      }
    }
  }
};
suite("Localize Manifest", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  test("replaces template strings", () => {
    const localizedManifest = localizeManifest(
      store.add(new NullLogger()),
      deepClone(manifest),
      {
        "test.command.title": "Test Command",
        "test.command.category": "Test Category",
        "test.authentication.label": "Test Authentication",
        "test.configuration.title": "Test Configuration"
      }
    );
    assert.strictEqual(
      localizedManifest.contributes?.commands?.[0].title,
      "Test Command"
    );
    assert.strictEqual(
      localizedManifest.contributes?.commands?.[0].category,
      "Test Category"
    );
    assert.strictEqual(
      localizedManifest.contributes?.authentication?.[0].label,
      "Test Authentication"
    );
    assert.strictEqual(
      (localizedManifest.contributes?.configuration).title,
      "Test Configuration"
    );
  });
  test("replaces template strings with fallback if not found in translations", () => {
    const localizedManifest = localizeManifest(
      store.add(new NullLogger()),
      deepClone(manifest),
      {},
      {
        "test.command.title": "Test Command",
        "test.command.category": "Test Category",
        "test.authentication.label": "Test Authentication",
        "test.configuration.title": "Test Configuration"
      }
    );
    assert.strictEqual(
      localizedManifest.contributes?.commands?.[0].title,
      "Test Command"
    );
    assert.strictEqual(
      localizedManifest.contributes?.commands?.[0].category,
      "Test Category"
    );
    assert.strictEqual(
      localizedManifest.contributes?.authentication?.[0].label,
      "Test Authentication"
    );
    assert.strictEqual(
      (localizedManifest.contributes?.configuration).title,
      "Test Configuration"
    );
  });
  test("replaces template strings - command title & categories become ILocalizedString", () => {
    const localizedManifest = localizeManifest(
      store.add(new NullLogger()),
      deepClone(manifest),
      {
        "test.command.title": "Befehl test",
        "test.command.category": "Testkategorie",
        "test.authentication.label": "Testauthentifizierung",
        "test.configuration.title": "Testkonfiguration"
      },
      {
        "test.command.title": "Test Command",
        "test.command.category": "Test Category",
        "test.authentication.label": "Test Authentication",
        "test.configuration.title": "Test Configuration"
      }
    );
    const title = localizedManifest.contributes?.commands?.[0].title;
    const category = localizedManifest.contributes?.commands?.[0].category;
    assert.strictEqual(title.value, "Befehl test");
    assert.strictEqual(title.original, "Test Command");
    assert.strictEqual(category.value, "Testkategorie");
    assert.strictEqual(category.original, "Test Category");
    assert.strictEqual(
      localizedManifest.contributes?.authentication?.[0].label,
      "Testauthentifizierung"
    );
    assert.strictEqual(
      (localizedManifest.contributes?.configuration).title,
      "Testkonfiguration"
    );
  });
  test("replaces template strings - is best effort #164630", () => {
    const manifestWithTypo = {
      name: "test",
      publisher: "test",
      version: "1.0.0",
      engines: {
        vscode: "*"
      },
      contributes: {
        authentication: [
          {
            id: "test.authentication",
            // This not existing in the bundle shouldn't cause an error.
            label: "%doesnotexist%"
          }
        ],
        commands: [
          {
            command: "test.command",
            title: "%test.command.title%",
            category: "%test.command.category%"
          }
        ]
      }
    };
    const localizedManifest = localizeManifest(
      store.add(new NullLogger()),
      deepClone(manifestWithTypo),
      {
        "test.command.title": "Test Command",
        "test.command.category": "Test Category"
      }
    );
    assert.strictEqual(
      localizedManifest.contributes?.commands?.[0].title,
      "Test Command"
    );
    assert.strictEqual(
      localizedManifest.contributes?.commands?.[0].category,
      "Test Category"
    );
    assert.strictEqual(
      localizedManifest.contributes?.authentication?.[0].label,
      "%doesnotexist%"
    );
  });
});
