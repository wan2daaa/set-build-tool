import core from '@actions/core';
import tc from "@actions/tool-cache";
import path from "path";

async function downloadAndExtractBuildTool(downloadUrl, toolDirectoryName, toolPath, buildToolName, version) {
  try {
    const downloadPath = await tc.downloadTool(downloadUrl)
    console.log(`download on directory ${downloadPath}`)
    const extractedPath = await tc.extractTar(downloadPath)
    console.log(`extracted on directory ${extractedPath}`)
    let toolRoot = path.join(extractedPath, toolDirectoryName)
    console.log(`toolRoot on directory ${toolRoot}`)

    toolPath = await tc.cacheDir(toolRoot, buildToolName, version)
  } catch (err) {
    core.setFailed(err);
  }
  return toolPath;
}

async function run() {

  const buildToolName = core.getInput('build-tool');
  const version = core.getInput('version');

  let toolPath = tc.find(buildToolName, version);

  if (!toolPath) {
    let toolDirectoryName;
    let downloadUrl;

    if (buildToolName === 'maven') {
      toolDirectoryName = `apache-maven-${version}`
      downloadUrl =
          `https://archive.apache.org/dist/maven/maven-3/${version}/binaries/${toolDirectoryName}-bin.tar.gz`
      console.log(`downloading ${downloadUrl}`)

    } else if (buildToolName === 'gradle') {
      toolDirectoryName = `gradle-${version}`
      downloadUrl = `https://services.gradle.org/distributions/gradle-${version}-bin.zip`
      console.log(`downloading ${downloadUrl}`)

    } else {
      core.setFailed('not supported build tool or name is wrong');
    }
    toolPath = await downloadAndExtractBuildTool(downloadUrl, toolDirectoryName, toolPath, buildToolName, version);
  }

  toolPath = path.join(toolPath, 'bin');

  core.addPath(toolPath);
}

run();