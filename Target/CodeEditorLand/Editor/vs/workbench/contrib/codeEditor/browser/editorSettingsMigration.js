import {
  EditorSettingMigration
} from "../../../../editor/browser/config/migrateOptions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  Extensions
} from "../../../common/configuration.js";
Registry.as(
  Extensions.ConfigurationMigration
).registerConfigurationMigrations(
  EditorSettingMigration.items.map((item) => ({
    key: `editor.${item.key}`,
    migrateFn: (value, accessor) => {
      const configurationKeyValuePairs = [];
      const writer = (key, value2) => configurationKeyValuePairs.push([`editor.${key}`, { value: value2 }]);
      item.migrate(value, (key) => accessor(`editor.${key}`), writer);
      return configurationKeyValuePairs;
    }
  }))
);
