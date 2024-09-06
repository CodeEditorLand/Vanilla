import { URI } from "vs/base/common/uri";
import { ITestResult } from "vs/workbench/contrib/testing/common/testResult";
import { IRichLocation, ITestItem, ITestMessage, ITestMessageMenuArgs, ITestRunTask, ITestTaskState, TestResultItem } from "vs/workbench/contrib/testing/common/testTypes";
export declare const getMessageArgs: (test: TestResultItem, message: ITestMessage) => ITestMessageMenuArgs;
interface ISubjectCommon {
    controllerId: string;
}
export declare class MessageSubject implements ISubjectCommon {
    readonly result: ITestResult;
    readonly taskIndex: number;
    readonly messageIndex: number;
    readonly test: ITestItem;
    readonly message: ITestMessage;
    readonly expectedUri: URI;
    readonly actualUri: URI;
    readonly messageUri: URI;
    readonly revealLocation: IRichLocation | undefined;
    readonly context: ITestMessageMenuArgs | undefined;
    get controllerId(): any;
    get isDiffable(): any;
    get contextValue(): any;
    get stack(): any;
    constructor(result: ITestResult, test: TestResultItem, taskIndex: number, messageIndex: number);
}
export declare class TaskSubject implements ISubjectCommon {
    readonly result: ITestResult;
    readonly taskIndex: number;
    readonly outputUri: URI;
    readonly revealLocation: undefined;
    get controllerId(): any;
    constructor(result: ITestResult, taskIndex: number);
}
export declare class TestOutputSubject implements ISubjectCommon {
    readonly result: ITestResult;
    readonly taskIndex: number;
    readonly test: TestResultItem;
    readonly outputUri: URI;
    readonly revealLocation: undefined;
    readonly task: ITestRunTask;
    get controllerId(): any;
    constructor(result: ITestResult, taskIndex: number, test: TestResultItem);
}
export type InspectSubject = MessageSubject | TaskSubject | TestOutputSubject;
export declare const equalsSubject: (a: InspectSubject, b: InspectSubject) => boolean;
export declare const mapFindTestMessage: <T>(test: TestResultItem, fn: (task: ITestTaskState, message: ITestMessage, messageIndex: number, taskIndex: number) => T | undefined) => (T & ({} | null)) | undefined;
export declare const getSubjectTestItem: (subject: InspectSubject) => any;
export {};
