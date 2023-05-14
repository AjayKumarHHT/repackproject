/**
 * @format
 */

import App from './App';
import {AppRegistry, Platform} from 'react-native';
import {ScriptManager, Script} from '@callstack/repack/client';
import {
  name as appName,
  localChunks,
  remoteChunkUrl,
  remoteChunkPort,
  devChunkurl,
  devChunkPort,
} from './app.json';

ScriptManager.shared.addResolver(async scriptId => {
  // For development we want to load scripts from the dev server.
  if (__DEV__) {
    const decScriptUrl = {
      url: `${devChunkurl}:${devChunkPort}/${Platform.OS}/${scriptId}.chunk.bundle`,
      cache: false,
    };
    return decScriptUrl;
  }

  // For production we want to load local chunks from from the file system.
  if (localChunks.includes(scriptId)) {
    return {
      url: Script.getFileSystemURL(scriptId),
    };
  }

  /**
   * For production we want to load remote chunks from the remote server.
   *
   * We have create a small http server that serves the remote chunks.
   * The server is started by the `start:remote` script. It serves the chunks from the `build/output` directory.
   * For customizing server see `./serve-remote-bundles.js`
   */
  const remoteScriptUrl = `${remoteChunkUrl}:${remoteChunkPort}/build/output/${Platform.OS}/remote/${scriptId}`;

  const scriptUrl = Platform.select({
    ios: {url: Script.getRemoteURL(remoteScriptUrl)},
    android: {url: Script.getRemoteURL(remoteScriptUrl)},
  });

  return scriptUrl
});

AppRegistry.registerComponent(appName, () => App);
