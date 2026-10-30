import JSZip from 'jszip';
import { GITHUB_REPOSITORY_FILES } from '../data/kotlinCodebase';

// Minimal standard gradlew script for Unix systems
const GRADLEW_UNIX = `#!/bin/sh
exec gradle "$@"
`;

const GRADLEW_BAT = `@rem Gradle wrapper script for Windows
@gradle "%*"
`;

const GRADLE_WRAPPER_PROPERTIES = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Add all project files
  for (const file of GITHUB_REPOSITORY_FILES) {
    zip.file(file.path, file.content);
  }

  // Add Gradle wrapper files
  zip.file('gradlew', GRADLEW_UNIX, { unixPermissions: '755' });
  zip.file('gradlew.bat', GRADLEW_BAT);
  zip.file('gradle/wrapper/gradle-wrapper.properties', GRADLE_WRAPPER_PROPERTIES);

  const content = await zip.generateAsync({ type: 'blob' });
  return content;
}
