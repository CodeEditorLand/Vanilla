import{observableFromEvent as a}from"../../../../base/common/observable.js";import{localize as e}from"../../../../nls.js";var r=(t=>(t.AutoRunDelay="testing.autoRun.delay",t.AutoOpenPeekView="testing.automaticallyOpenPeekView",t.AutoOpenPeekViewDuringContinuousRun="testing.automaticallyOpenPeekViewDuringAutoRun",t.OpenTesting="testing.openTesting",t.FollowRunningTest="testing.followRunningTest",t.DefaultGutterClickAction="testing.defaultGutterClickAction",t.GutterEnabled="testing.gutterEnabled",t.SaveBeforeTest="testing.saveBeforeTest",t.AlwaysRevealTestOnStateChange="testing.alwaysRevealTestOnStateChange",t.CountBadge="testing.countBadge",t.ShowAllMessages="testing.showAllMessages",t.CoveragePercent="testing.displayedCoveragePercent",t.ShowCoverageInExplorer="testing.showCoverageInExplorer",t.CoverageBarThresholds="testing.coverageBarThresholds",t.CoverageToolbarEnabled="testing.coverageToolbarEnabled",t))(r||{}),l=(n=>(n.NeverOpen="neverOpen",n.OpenOnTestStart="openOnTestStart",n.OpenOnTestFailure="openOnTestFailure",n.OpenExplorerOnTestStart="openExplorerOnTestStart",n))(l||{}),u=(o=>(o.FailureVisible="failureInVisibleDocument",o.FailureAnywhere="failureAnywhere",o.Never="never",o))(u||{}),g=(n=>(n.Run="run",n.Debug="debug",n.Coverage="runWithCoverage",n.ContextMenu="contextMenu",n))(g||{}),p=(n=>(n.Failed="failed",n.Off="off",n.Passed="passed",n.Skipped="skipped",n))(p||{}),d=(o=>(o.TotalCoverage="totalCoverage",o.Statement="statement",o.Minimum="minimum",o))(d||{});const h={id:"testing",order:21,title:e("testConfigurationTitle","Testing"),type:"object",properties:{"testing.autoRun.delay":{type:"integer",minimum:0,description:e("testing.autoRun.delay","How long to wait, in milliseconds, after a test is marked as outdated and starting a new run."),default:1e3},"testing.automaticallyOpenPeekView":{description:e("testing.automaticallyOpenPeekView","Configures when the error Peek view is automatically opened."),enum:["failureAnywhere","failureInVisibleDocument","never"],default:"failureInVisibleDocument",enumDescriptions:[e("testing.automaticallyOpenPeekView.failureAnywhere","Open automatically no matter where the failure is."),e("testing.automaticallyOpenPeekView.failureInVisibleDocument","Open automatically when a test fails in a visible document."),e("testing.automaticallyOpenPeekView.never","Never automatically open.")]},"testing.showAllMessages":{description:e("testing.showAllMessages","Controls whether to show messages from all test runs."),type:"boolean",default:!1},"testing.automaticallyOpenPeekViewDuringAutoRun":{description:e("testing.automaticallyOpenPeekViewDuringContinuousRun","Controls whether to automatically open the Peek view during continuous run mode."),type:"boolean",default:!1},"testing.countBadge":{description:e("testing.countBadge","Controls the count badge on the Testing icon on the Activity Bar."),enum:["failed","off","passed","skipped"],enumDescriptions:[e("testing.countBadge.failed","Show the number of failed tests"),e("testing.countBadge.off","Disable the testing count badge"),e("testing.countBadge.passed","Show the number of passed tests"),e("testing.countBadge.skipped","Show the number of skipped tests")],default:"failed"},"testing.followRunningTest":{description:e("testing.followRunningTest","Controls whether the running test should be followed in the Test Explorer view."),type:"boolean",default:!0},"testing.defaultGutterClickAction":{description:e("testing.defaultGutterClickAction","Controls the action to take when left-clicking on a test decoration in the gutter."),enum:["run","debug","runWithCoverage","contextMenu"],enumDescriptions:[e("testing.defaultGutterClickAction.run","Run the test."),e("testing.defaultGutterClickAction.debug","Debug the test."),e("testing.defaultGutterClickAction.coverage","Run the test with coverage."),e("testing.defaultGutterClickAction.contextMenu","Open the context menu for more options.")],default:"run"},"testing.gutterEnabled":{description:e("testing.gutterEnabled","Controls whether test decorations are shown in the editor gutter."),type:"boolean",default:!0},"testing.saveBeforeTest":{description:e("testing.saveBeforeTest","Control whether save all dirty editors before running a test."),type:"boolean",default:!0},"testing.openTesting":{enum:["neverOpen","openOnTestStart","openOnTestFailure","openExplorerOnTestStart"],enumDescriptions:[e("testing.openTesting.neverOpen","Never automatically open the testing views"),e("testing.openTesting.openOnTestStart","Open the test results view when tests start"),e("testing.openTesting.openOnTestFailure","Open the test result view on any test failure"),e("testing.openTesting.openExplorerOnTestStart","Open the test explorer when tests start")],default:"openOnTestStart",description:e("testing.openTesting","Controls when the testing view should open.")},"testing.alwaysRevealTestOnStateChange":{markdownDescription:e("testing.alwaysRevealTestOnStateChange","Always reveal the executed test when {0} is on. If this setting is turned off, only failed tests will be revealed.","`#testing.followRunningTest#`"),type:"boolean",default:!1},"testing.showCoverageInExplorer":{description:e("testing.ShowCoverageInExplorer","Whether test coverage should be down in the File Explorer view."),type:"boolean",default:!0},"testing.displayedCoveragePercent":{markdownDescription:e("testing.displayedCoveragePercent","Configures what percentage is displayed by default for test coverage."),default:"totalCoverage",enum:["totalCoverage","statement","minimum"],enumDescriptions:[e("testing.displayedCoveragePercent.totalCoverage","A calculation of the combined statement, function, and branch coverage."),e("testing.displayedCoveragePercent.statement","The statement coverage."),e("testing.displayedCoveragePercent.minimum","The minimum of statement, function, and branch coverage.")]},"testing.coverageBarThresholds":{markdownDescription:e("testing.coverageBarThresholds","Configures the colors used for percentages in test coverage bars."),default:{red:0,yellow:60,green:90},properties:{red:{type:"number",minimum:0,maximum:100,default:0},yellow:{type:"number",minimum:0,maximum:100,default:60},green:{type:"number",minimum:0,maximum:100,default:90}}},"testing.coverageToolbarEnabled":{description:e("testing.coverageToolbarEnabled","Controls whether the coverage toolbar is shown in the editor."),type:"boolean",default:!1}}},c=(i,s)=>i.getValue(s),C=(i,s)=>a(i.onDidChangeConfiguration,()=>c(i,s));export{u as AutoOpenPeekViewWhen,l as AutoOpenTesting,g as DefaultGutterClickAction,r as TestingConfigKeys,p as TestingCountBadge,d as TestingDisplayedCoveragePercent,c as getTestingConfiguration,C as observeTestingConfiguration,h as testingConfiguration};
