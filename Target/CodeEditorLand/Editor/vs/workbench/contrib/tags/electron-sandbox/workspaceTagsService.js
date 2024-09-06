var H=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var I=(f,e,c,i)=>{for(var s=i>1?void 0:i?N(e,c):e,u=f.length-1,l;u>=0;u--)(l=f[u])&&(s=(i?l(e,c,s):l(s))||s);return i&&s&&H(e,c,s),s},v=(f,e)=>(c,i)=>e(c,i,f);import{sha1Hex as B}from"../../../../base/browser/hash.js";import{Schemas as U}from"../../../../base/common/network.js";import{splitLines as x}from"../../../../base/common/strings.js";import{URI as A}from"../../../../base/common/uri.js";import{IFileService as Y}from"../../../../platform/files/common/files.js";import{InstantiationType as K,registerSingleton as Q}from"../../../../platform/instantiation/common/extensions.js";import{IWorkspaceContextService as V,WorkbenchState as b}from"../../../../platform/workspace/common/workspace.js";import{IWorkbenchEnvironmentService as X}from"../../../services/environment/common/environmentService.js";import{ITextFileService as Z}from"../../../services/textfile/common/textfiles.js";import{GradleDependencyCompactRegex as ee,GradleDependencyLooseRegex as ae,JavaLibrariesToLookFor as re,MavenArtifactIdRegex as te,MavenDependenciesRegex as se,MavenDependencyRegex as ie,MavenGroupIdRegex as oe}from"../common/javaWorkspaceTags.js";import{IWorkspaceTagsService as ne}from"../common/workspaceTags.js";import{getHashedRemotesFromConfig as ce}from"./workspaceTags.js";const ue=["@azure","@azure/ai","@azure/core","@azure/cosmos","@azure/event","@azure/identity","@azure/keyvault","@azure/search","@azure/storage"],ge=["express","sails","koa","hapi","socket.io","restify","next","nuxt","@nestjs/core","strapi","gatsby","react","react-native","react-native-macos","react-native-windows","rnpm-plugin-windows","@angular/core","@ionic","vue","tns-core-modules","@nativescript/core","electron","aws-sdk","aws-amplify","azure","azure-storage","chroma","faiss","firebase","@google-cloud/common","heroku-cli","langchain","milvus","openai","pinecone","qdrant","@microsoft/teams-js","@microsoft/office-js","@microsoft/office-js-helpers","@types/office-js","@types/office-runtime","office-ui-fabric-react","@uifabric/icons","@uifabric/merge-styles","@uifabric/styling","@uifabric/experiments","@uifabric/utilities","@microsoft/rush","lerna","just-task","beachball","playwright","playwright-cli","@playwright/test","playwright-core","playwright-chromium","playwright-firefox","playwright-webkit","cypress","nightwatch","protractor","puppeteer","selenium-webdriver","webdriverio","gherkin","@azure/app-configuration","@azure/cosmos-sign","@azure/cosmos-language-service","@azure/synapse-spark","@azure/synapse-monitoring","@azure/synapse-managed-private-endpoints","@azure/synapse-artifacts","@azure/synapse-access-control","@azure/ai-metrics-advisor","@azure/service-bus","@azure/keyvault-secrets","@azure/keyvault-keys","@azure/keyvault-certificates","@azure/keyvault-admin","@azure/digital-twins-core","@azure/cognitiveservices-anomalydetector","@azure/ai-anomaly-detector","@azure/core-xml","@azure/core-tracing","@azure/core-paging","@azure/core-https","@azure/core-client","@azure/core-asynciterator-polyfill","@azure/core-arm","@azure/amqp-common","@azure/core-lro","@azure/logger","@azure/core-http","@azure/core-auth","@azure/core-amqp","@azure/abort-controller","@azure/eventgrid","@azure/storage-file-datalake","@azure/search-documents","@azure/storage-file","@azure/storage-datalake","@azure/storage-queue","@azure/storage-file-share","@azure/storage-blob-changefeed","@azure/storage-blob","@azure/cognitiveservices-formrecognizer","@azure/ai-form-recognizer","@azure/cognitiveservices-textanalytics","@azure/ai-text-analytics","@azure/event-processor-host","@azure/schema-registry-avro","@azure/schema-registry","@azure/eventhubs-checkpointstore-blob","@azure/event-hubs","@azure/communication-signaling","@azure/communication-calling","@azure/communication-sms","@azure/communication-common","@azure/communication-chat","@azure/communication-administration","@azure/attestation","@azure/data-tables","@azure/arm-appservice","@azure-rest/ai-inference","@azure-rest/arm-appservice","@azure/arm-appcontainers","@azure/arm-rediscache","@azure/arm-redisenterprisecache","@azure/arm-apimanagement","@azure/arm-logic","@azure/app-configuration","@azure/arm-appconfiguration","@azure/arm-dashboard","@azure/arm-signalr","@azure/arm-securitydevops","@azure/arm-labservices","@azure/web-pubsub","@azure/web-pubsub-client","@azure/web-pubsub-client-protobuf","@azure/web-pubsub-express","@azure/openai","@azure/arm-hybridkubernetes","@azure/arm-kubernetesconfiguration","@anthropic-ai/sdk","@anthropic-ai/tokenizer","@arizeai/openinference-instrumentation-langchain","@arizeai/openinference-instrumentation-openai","@aws-sdk-client-bedrock-runtime","@aws-sdk/client-bedrock","@datastax/astra-db-ts","fireworks-js","@google-cloud/aiplatform","@huggingface/inference","humanloop","@langchain/anthropic","langsmith","llamaindex","mongodb","neo4j-driver","ollama","onnxruntime-node","onnxruntime-web","pg","postgresql","redis","@supabase/supabase-js","@tensorflow/tfjs","@xenova/transformers","tika","weaviate-client","@zilliz/milvus2-sdk-node","@azure-rest/ai-anomaly-detector","@azure-rest/ai-content-safety","@azure-rest/ai-document-intelligence","@azure-rest/ai-document-translator","@azure-rest/ai-personalizer","@azure-rest/ai-translation-text","@azure-rest/ai-vision-image-analysis","@azure/ai-anomaly-detector","@azure/ai-form-recognizer","@azure/ai-language-conversations","@azure/ai-language-text","@azure/ai-text-analytics","@azure/arm-botservice","@azure/arm-cognitiveservices","@azure/arm-machinelearning","@azure/cognitiveservices-contentmoderator","@azure/cognitiveservices-customvision-prediction","@azure/cognitiveservices-customvision-training","@azure/cognitiveservices-face","@azure/cognitiveservices-translatortext","microsoft-cognitiveservices-speech-sdk","@google/generative-ai"],le=["azure-ai","azure-cognitiveservices","azure-core","azure-cosmos","azure-event","azure-identity","azure-keyvault","azure-mgmt","azure-ml","azure-search","azure-storage"],pe=["azure","azure-ai-inference","azure-ai-language-conversations","azure-ai-language-questionanswering","azure-ai-ml","azure-ai-translation-document","azure-appconfiguration","azure-appconfiguration-provider","azure-loganalytics","azure-synapse-nspkg","azure-synapse-spark","azure-synapse-artifacts","azure-synapse-accesscontrol","azure-synapse","azure-cognitiveservices-vision-nspkg","azure-cognitiveservices-search-nspkg","azure-cognitiveservices-nspkg","azure-cognitiveservices-language-nspkg","azure-cognitiveservices-knowledge-nspkg","azure-containerregistry","azure-communication-identity","azure-communication-phonenumbers","azure-communication-email","azure-communication-rooms","azure-communication-callautomation","azure-confidentialledger","azure-containerregistry","azure-developer-loadtesting","azure-iot-deviceupdate","azure-messaging-webpubsubservice","azure-monitor","azure-monitor-query","azure-monitor-ingestion","azure-mgmt-appcontainers","azure-mgmt-apimanagement","azure-mgmt-web","azure-mgmt-redis","azure-mgmt-redisenterprise","azure-mgmt-logic","azure-appconfiguration","azure-appconfiguration-provider","azure-mgmt-appconfiguration","azure-mgmt-dashboard","azure-mgmt-signalr","azure-messaging-webpubsubservice","azure-mgmt-webpubsub","azure-mgmt-securitydevops","azure-mgmt-labservices","azure-ai-metricsadvisor","azure-servicebus","azureml-sdk","azure-keyvault-nspkg","azure-keyvault-secrets","azure-keyvault-keys","azure-keyvault-certificates","azure-keyvault-administration","azure-digitaltwins-nspkg","azure-digitaltwins-core","azure-cognitiveservices-anomalydetector","azure-ai-anomalydetector","azure-applicationinsights","azure-core-tracing-opentelemetry","azure-core-tracing-opencensus","azure-nspkg","azure-common","azure-eventgrid","azure-storage-file-datalake","azure-search-nspkg","azure-search-documents","azure-storage-nspkg","azure-storage-file","azure-storage-common","azure-storage-queue","azure-storage-file-share","azure-storage-blob-changefeed","azure-storage-blob","azure-cognitiveservices-formrecognizer","azure-ai-formrecognizer","azure-ai-nspkg","azure-cognitiveservices-language-textanalytics","azure-ai-textanalytics","azure-schemaregistry-avroencoder","azure-schemaregistry-avroserializer","azure-schemaregistry","azure-eventhub-checkpointstoreblob-aio","azure-eventhub-checkpointstoreblob","azure-eventhub","azure-servicefabric","azure-communication-nspkg","azure-communication-sms","azure-communication-chat","azure-communication-administration","azure-security-attestation","azure-data-nspkg","azure-data-tables","azure-devtools","azure-elasticluster","azure-functions","azure-graphrbac","azure-iothub-device-client","azure-shell","azure-translator","azure-mgmt-hybridkubernetes","azure-mgmt-kubernetesconfiguration","adal","pydocumentdb","botbuilder-core","botbuilder-schema","botframework-connector","playwright","transformers","langchain","llama-index","guidance","openai","semantic-kernel","sentence-transformers","anthropic","aporia","arize","deepchecks","fireworks-ai","langchain-fireworks","humanloop","pymongo","langchain-anthropic","langchain-huggingface","langchain-fireworks","ollama","onnxruntime","pgvector","sentence-transformers","tika","trulens","trulens-eval","wandb","azure-ai-contentsafety","azure-ai-documentintelligence","azure-ai-translation-text","azure-ai-vision","azure-cognitiveservices-language-luis","azure-cognitiveservices-speech","azure-cognitiveservices-vision-contentmoderator","azure-cognitiveservices-vision-face","azure-mgmt-cognitiveservices","azure-mgmt-search","google-generativeai"],me=["github.com/Azure/azure-sdk-for-go/sdk/storage/azblob","github.com/Azure/azure-sdk-for-go/sdk/storage/azfile","github.com/Azure/azure-sdk-for-go/sdk/storage/azqueue","github.com/Azure/azure-sdk-for-go/sdk/storage/azdatalake","github.com/Azure/azure-sdk-for-go/sdk/tracing/azotel","github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azadmin","github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azcertificates","github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azkeys","github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azsecrets","github.com/Azure/azure-sdk-for-go/sdk/monitor/azquery","github.com/Azure/azure-sdk-for-go/sdk/monitor/azingest","github.com/Azure/azure-sdk-for-go/sdk/messaging/azeventhubs","github.com/Azure/azure-sdk-for-go/sdk/messaging/azservicebus","github.com/Azure/azure-sdk-for-go/sdk/data/azappconfig","github.com/Azure/azure-sdk-for-go/sdk/data/azcosmos","github.com/Azure/azure-sdk-for-go/sdk/data/aztables","github.com/Azure/azure-sdk-for-go/sdk/containers/azcontainerregistry","github.com/Azure/azure-sdk-for-go/sdk/ai/azopenai","github.com/Azure/azure-sdk-for-go/sdk/azidentity","github.com/Azure/azure-sdk-for-go/sdk/azcore","github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/"];let k=class{constructor(e,c,i,s){this.fileService=e;this.contextService=c;this.environmentService=i;this.textFileService=s}_tags;async getTags(){return this._tags||(this._tags=await this.resolveWorkspaceTags()),this._tags}async getTelemetryWorkspaceId(e,c){function i(u){return B(u.scheme===U.file?u.fsPath:u.toString())}let s;switch(c){case b.EMPTY:s=void 0;break;case b.FOLDER:s=await i(e.folders[0].uri);break;case b.WORKSPACE:e.configuration&&(s=await i(e.configuration))}return s}getHashedRemotesFromUri(e,c=!1){const i=e.path,s=e.with({path:`${i!=="/"?i:""}/.git/config`});return this.fileService.exists(s).then(u=>u?this.textFileService.read(s,{acceptTextOnly:!0}).then(l=>ce(l.value,c),l=>[]):[])}async resolveWorkspaceTags(){const e=Object.create(null),c=this.contextService.getWorkbenchState(),i=this.contextService.getWorkspace();e["workspace.id"]=await this.getTelemetryWorkspaceId(i,c);const{filesToOpenOrCreate:s,filesToDiff:u,filesToMerge:l}=this.environmentService;e["workbench.filesToOpenOrCreate"]=s&&s.length||0,e["workbench.filesToDiff"]=u&&u.length||0,e["workbench.filesToMerge"]=l&&l.length||0;const w=c===b.EMPTY;e["workspace.roots"]=w?0:i.folders.length,e["workspace.empty"]=w;const h=w?void 0:i.folders.map(m=>m.uri);if(!h||!h.length)return Promise.resolve(e);const S=A.joinPath(this.environmentService.workspaceStorageHome,"aiGeneratedWorkspaces.json");return await this.fileService.exists(S).then(async m=>{if(m)try{const p=await this.fileService.readFile(S);JSON.parse(p.value.toString()).indexOf(i.folders[0].uri.toString())>-1&&(e.aiGenerated=!0)}catch{}}),this.fileService.resolveAll(h.map(m=>({resource:m}))).then(m=>{const p=[].concat(...m.map(r=>r.success?r.stat.children||[]:[])).map(r=>r.name),a=p.reduce((r,t)=>r.add(t.toLowerCase()),new Set);e["workspace.grunt"]=a.has("gruntfile.js"),e["workspace.gulp"]=a.has("gulpfile.js"),e["workspace.jake"]=a.has("jakefile.js"),e["workspace.tsconfig"]=a.has("tsconfig.json"),e["workspace.jsconfig"]=a.has("jsconfig.json"),e["workspace.config.xml"]=a.has("config.xml"),e["workspace.vsc.extension"]=a.has("vsc-extension-quickstart.md"),e["workspace.ASP5"]=a.has("project.json")&&this.searchArray(p,/^.+\.cs$/i),e["workspace.sln"]=this.searchArray(p,/^.+\.sln$|^.+\.csproj$/i),e["workspace.unity"]=a.has("assets")&&a.has("library")&&a.has("projectsettings"),e["workspace.npm"]=a.has("package.json")||a.has("node_modules"),e["workspace.bower"]=a.has("bower.json")||a.has("bower_components"),e["workspace.java.pom"]=a.has("pom.xml"),e["workspace.java.gradle"]=a.has("build.gradle")||a.has("settings.gradle")||a.has("build.gradle.kts")||a.has("settings.gradle.kts")||a.has("gradlew")||a.has("gradlew.bat"),e["workspace.yeoman.code.ext"]=a.has("vsc-extension-quickstart.md"),e["workspace.py.requirements"]=a.has("requirements.txt"),e["workspace.py.requirements.star"]=this.searchArray(p,/^(.*)requirements(.*)\.txt$/i),e["workspace.py.Pipfile"]=a.has("pipfile"),e["workspace.py.conda"]=this.searchArray(p,/^environment(\.yml$|\.yaml$)/i),e["workspace.py.setup"]=a.has("setup.py"),e["workspace.py.manage"]=a.has("manage.py"),e["workspace.py.setupcfg"]=a.has("setup.cfg"),e["workspace.py.app"]=a.has("app.py"),e["workspace.py.pyproject"]=a.has("pyproject.toml"),e["workspace.go.mod"]=a.has("go.mod");const F=a.has("mainactivity.cs")||a.has("mainactivity.fs"),P=a.has("appdelegate.cs")||a.has("appdelegate.fs"),W=a.has("androidmanifest.xml"),q=a.has("platforms"),M=a.has("plugins"),O=a.has("www"),R=a.has("properties"),j=a.has("resources"),C=a.has("jni");e["workspace.config.xml"]&&!e["workspace.language.cs"]&&!e["workspace.language.vb"]&&!e["workspace.language.aspx"]&&(q&&M&&O?e["workspace.cordova.high"]=!0:e["workspace.cordova.low"]=!0),e["workspace.config.xml"]&&!e["workspace.language.cs"]&&!e["workspace.language.vb"]&&!e["workspace.language.aspx"]&&a.has("ionic.config.json")&&(e["workspace.ionic"]=!0),F&&R&&j&&(e["workspace.xamarin.android"]=!0),P&&j&&(e["workspace.xamarin.ios"]=!0),W&&C&&(e["workspace.android.cpp"]=!0);function d(r,t,o,n){return a.has(r)?h.map(g=>{const z=g.with({path:`${g.path!=="/"?g.path:""}/${r}`});return t.exists(z).then(y=>{if(y)return o.read(z,{acceptTextOnly:!0}).then(n)},y=>{})}):[]}function T(r){pe.indexOf(r)>-1&&(e["workspace.py."+r]=!0);for(const t of le)r.startsWith(t)&&(e["workspace.py."+t]=!0);e["workspace.py.any-azure"]||(e["workspace.py.any-azure"]=/azure/i.test(r))}const D=d("requirements.txt",this.fileService,this.textFileService,r=>{const t=x(r.value);for(const o of t){const n=o.split("=="),g=o.split(">="),z=(n.length===2?n[0]:g[0]).trim();T(z)}}),L=d("pipfile",this.fileService,this.textFileService,r=>{let t=x(r.value);t=t.slice(t.indexOf("[packages]")+1);for(const o of t){if(o.trim().indexOf("[")>-1)break;if(o.indexOf("=")===-1)continue;const n=o.split("=")[0].trim();T(n)}}),G=d("package.json",this.fileService,this.textFileService,r=>{try{const t=JSON.parse(r.value),o=Object.keys(t.dependencies||{}).concat(Object.keys(t.devDependencies||{}));for(const n of o)if(n.startsWith("react-native"))e["workspace.reactNative"]=!0;else if(n==="tns-core-modules"||n==="@nativescript/core")e["workspace.nativescript"]=!0;else if(ge.indexOf(n)>-1)e["workspace.npm."+n]=!0;else for(const g of ue)n.startsWith(g)&&(e["workspace.npm."+g]=!0)}catch{}}),E=d("go.mod",this.fileService,this.textFileService,r=>{try{const t=x(r.value);let o=!1;for(let n=0;n<t.length;n++){const g=t[n].trim();if(g.startsWith("require (")){if(o)break;o=!0;continue}if(g.startsWith(")"))break;if(o&&g!==""){const z=g.split(" ")[0].trim();for(const y of me)z.startsWith(y)&&(e["workspace.go.mod."+z]=!0)}}}catch{}}),$=d("pom.xml",this.fileService,this.textFileService,r=>{try{let t;for(;t=se.exec(r.value);){let o;for(;o=ie.exec(t[1]);){const n=oe.exec(o[1]),g=te.exec(o[1]);n&&g&&this.tagJavaDependency(n[1],g[1],"workspace.pom.",e)}}}catch{}}),J=d("build.gradle",this.fileService,this.textFileService,r=>{try{this.processGradleDependencies(r.value,ae,e),this.processGradleDependencies(r.value,ee,e)}catch{}}),_=h.map(r=>{const t=A.joinPath(r,"/app/src/main/AndroidManifest.xml");return this.fileService.exists(t).then(o=>{o&&(e["workspace.java.android"]=!0)},o=>{})});return Promise.all([...G,...D,...L,...$,...J,..._,...E]).then(()=>e)})}processGradleDependencies(e,c,i){let s;for(;s=c.exec(e);){const u=s[1],l=s[2];u&&l&&this.tagJavaDependency(u,l,"workspace.gradle.",i)}}tagJavaDependency(e,c,i,s){for(const u of re)if(u.predicate(e,c)){s[i+u.tag]=!0;return}}searchArray(e,c){return e.some(i=>i.search(c)>-1)||void 0}};k=I([v(0,Y),v(1,V),v(2,X),v(3,Z)],k),Q(ne,k,K.Delayed);export{k as WorkspaceTagsService};
