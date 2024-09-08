import assert from "assert";
import {
  getMachineId,
  getSqmMachineId,
  getdevDeviceId
} from "../../node/id.js";
import { getMac } from "../../node/macAddress.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
import { flakySuite } from "./testUtils.js";
flakySuite("ID", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("getMachineId", async () => {
    const errors = [];
    const id = await getMachineId((err) => errors.push(err));
    assert.ok(id);
    assert.strictEqual(errors.length, 0);
  });
  test("getSqmId", async () => {
    const errors = [];
    const id = await getSqmMachineId((err) => errors.push(err));
    assert.ok(typeof id === "string");
    assert.strictEqual(errors.length, 0);
  });
  test("getdevDeviceId", async () => {
    const errors = [];
    const id = await getdevDeviceId((err) => errors.push(err));
    assert.ok(typeof id === "string");
    assert.strictEqual(errors.length, 0);
  });
  test("getMac", async () => {
    const macAddress = getMac();
    assert.ok(
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macAddress),
      `Expected a MAC address, got: ${macAddress}`
    );
  });
});
