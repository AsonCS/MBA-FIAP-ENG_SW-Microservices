plugins {
    kotlin("jvm") version "1.9.21"
    kotlin("plugin.serialization") version "1.9.21"
    application
    `java-library`
}

group = "com.project"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // Ktor Server
    implementation("io.ktor:ktor-server-core:2.3.7")
    implementation("io.ktor:ktor-server-netty:2.3.7")
    implementation("io.ktor:ktor-server-call-logging:2.3.7")

    // Jackson (JSON serialization)
    implementation("com.fasterxml.jackson.core:jackson-databind:2.16.1")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.16.1")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.16.1")

    // Kafka
    implementation("org.apache.kafka:kafka-clients:3.5.1")

    // Logging
    implementation("ch.qos.logback:logback-classic:1.4.11")
    implementation("ch.qos.logback:logback-core:1.4.11")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    // Testing
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    testImplementation("io.kotest:kotest-runner-junit5:5.8.0")
    testImplementation("io.kotest:kotest-assertions-core:5.8.0")
    testImplementation("io.mockk:mockk:1.13.7")
    testImplementation("io.ktor:ktor-server-tests:2.3.7")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}

kotlin {
    jvmToolchain(17)
}

tasks.test {
    useJUnitPlatform()
}

application {
    mainClass.set("com.project.feed.ApplicationKt")
}

tasks.jar {
    manifest {
        attributes["Main-Class"] = "com.project.feed.ApplicationKt"
    }
    
    archiveBaseName.set("feed")
    archiveVersion.set("1.0.0")
    archiveClassifier.set("all")
    
    // Include all dependencies in the JAR
    from(sourceSets.main.get().output)
    from({
        configurations.runtimeClasspath.get().filter { it.isFile }.map { zipTree(it) }
    })
    
    // Handle duplicate files
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}
