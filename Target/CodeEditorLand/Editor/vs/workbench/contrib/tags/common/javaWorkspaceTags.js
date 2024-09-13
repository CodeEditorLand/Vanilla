const t=/group\s*:\s*['"](.*?)['"]\s*,\s*name\s*:\s*['"](.*?)['"]\s*,\s*version\s*:\s*['"](.*?)['"]/g,r=/['"]([^'"\s]*?):([^'"\s]*?):([^'"\s]*?)['"]/g,i=/<dependencies>([\s\S]*?)<\/dependencies>/g,c=/<dependency>([\s\S]*?)<\/dependency>/g,s=/<groupId>([\s\S]*?)<\/groupId>/,o=/<artifactId>([\s\S]*?)<\/artifactId>/,n=[{predicate:(e,a)=>e==="com.microsoft.azure"&&a==="azure",tag:"azure"},{predicate:(e,a)=>e==="com.microsoft.azure"&&a.startsWith("azure-mgmt-"),tag:"azure"},{predicate:(e,a)=>e.startsWith("com.microsoft.azure")&&a.startsWith("azure-mgmt-"),tag:"azure"},{predicate:(e,a)=>e==="com.azure.resourcemanager"&&a.startsWith("azure-resourcemanager"),tag:"azure"},{predicate:(e,a)=>e==="javax"&&a==="javaee-api",tag:"javaee"},{predicate:(e,a)=>e==="javax.xml.bind"&&a==="jaxb-api",tag:"javaee"},{predicate:(e,a)=>e==="mysql"&&a==="mysql-connector-java",tag:"jdbc"},{predicate:(e,a)=>e==="com.microsoft.sqlserver"&&a==="mssql-jdbc",tag:"jdbc"},{predicate:(e,a)=>e==="com.oracle.database.jdbc"&&a.startsWith("ojdbc"),tag:"jdbc"},{predicate:(e,a)=>e==="org.hibernate",tag:"jpa"},{predicate:(e,a)=>e==="org.eclipse.persistence"&&a==="eclipselink",tag:"jpa"},{predicate:(e,a)=>e==="org.projectlombok",tag:"lombok"},{predicate:(e,a)=>e==="org.springframework.data"&&a==="spring-data-redis",tag:"redis"},{predicate:(e,a)=>e==="redis.clients"&&a==="jedis",tag:"redis"},{predicate:(e,a)=>e==="org.redisson",tag:"redis"},{predicate:(e,a)=>e==="io.lettuce"&&a==="lettuce-core",tag:"redis"},{predicate:(e,a)=>e==="org.springframework.boot",tag:"springboot"},{predicate:(e,a)=>e==="org.jooq",tag:"sql"},{predicate:(e,a)=>e==="org.mybatis",tag:"sql"},{predicate:(e,a)=>e==="org.junit.jupiter"&&a==="junit-jupiter-api",tag:"unitTest"},{predicate:(e,a)=>e==="junit"&&a==="junit",tag:"unitTest"},{predicate:(e,a)=>e==="org.testng"&&a==="testng",tag:"unitTest"},{predicate:(e,a)=>e==="com.azure"&&a.includes("cosmos"),tag:"azure-cosmos"},{predicate:(e,a)=>e==="com.azure.spring"&&a.includes("cosmos"),tag:"azure-cosmos"},{predicate:(e,a)=>e==="com.azure"&&a.includes("azure-storage"),tag:"azure-storage"},{predicate:(e,a)=>e==="com.azure.spring"&&a.includes("storage"),tag:"azure-storage"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-messaging-servicebus",tag:"azure-servicebus"},{predicate:(e,a)=>e==="com.azure.spring"&&a.includes("servicebus"),tag:"azure-servicebus"},{predicate:(e,a)=>e==="com.azure"&&a.startsWith("azure-messaging-eventhubs"),tag:"azure-eventhubs"},{predicate:(e,a)=>e==="com.azure.spring"&&a.includes("eventhubs"),tag:"azure-eventhubs"},{predicate:(e,a)=>e==="dev.langchain4j",tag:"langchain4j"},{predicate:(e,a)=>e==="io.springboot.ai",tag:"springboot-ai"},{predicate:(e,a)=>e==="com.microsoft.semantic-kernel",tag:"semantic-kernel"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-anomalydetector",tag:"azure-ai-anomalydetector"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-formrecognizer",tag:"azure-ai-formrecognizer"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-documentintelligence",tag:"azure-ai-documentintelligence"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-translation-document",tag:"azure-ai-translation-document"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-personalizer",tag:"azure-ai-personalizer"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-translation-text",tag:"azure-ai-translation-text"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-contentsafety",tag:"azure-ai-contentsafety"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-vision-imageanalysis",tag:"azure-ai-vision-imageanalysis"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-textanalytics",tag:"azure-ai-textanalytics"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-search-documents",tag:"azure-search-documents"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-documenttranslator",tag:"azure-ai-documenttranslator"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-vision-face",tag:"azure-ai-vision-face"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-openai-assistants",tag:"azure-ai-openai-assistants"},{predicate:(e,a)=>e==="com.microsoft.azure.cognitiveservices",tag:"azure-cognitiveservices"},{predicate:(e,a)=>e==="com.microsoft.cognitiveservices.speech",tag:"azure-cognitiveservices-speech"},{predicate:(e,a)=>e==="com.theokanning.openai-gpt3-java",tag:"openai"},{predicate:(e,a)=>e==="com.azure"&&a==="azure-ai-openai",tag:"azure-openai"},{predicate:(e,a)=>e==="com.microsoft.azure.functions"&&a==="azure-functions-java-library",tag:"azure-functions"},{predicate:(e,a)=>e==="io.quarkus",tag:"quarkus"},{predicate:(e,a)=>e.startsWith("org.eclipse.microprofile"),tag:"microprofile"},{predicate:(e,a)=>e==="io.micronaut",tag:"micronaut"},{predicate:(e,a)=>e.startsWith("org.graalvm"),tag:"graalvm"}];export{r as GradleDependencyCompactRegex,t as GradleDependencyLooseRegex,n as JavaLibrariesToLookFor,o as MavenArtifactIdRegex,i as MavenDependenciesRegex,c as MavenDependencyRegex,s as MavenGroupIdRegex};
