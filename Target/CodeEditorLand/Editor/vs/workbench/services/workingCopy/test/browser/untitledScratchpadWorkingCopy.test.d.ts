import { type VSBufferReadableStream } from "../../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { URI } from "../../../../../base/common/uri.js";
import { type IUntitledFileWorkingCopyModelFactory } from "../../common/untitledFileWorkingCopy.js";
import { TestUntitledFileWorkingCopyModel } from "./untitledFileWorkingCopy.test.js";
export declare class TestUntitledFileWorkingCopyModelFactory implements IUntitledFileWorkingCopyModelFactory<TestUntitledFileWorkingCopyModel> {
    createModel(resource: URI, contents: VSBufferReadableStream, token: CancellationToken): Promise<TestUntitledFileWorkingCopyModel>;
}
