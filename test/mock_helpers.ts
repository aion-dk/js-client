/*eslint-disable @typescript-eslint/no-explicit-any*/
import nock = require('nock');
import * as fs from 'fs';
import * as path from 'path'
import { mailcatcherHost } from './test_helpers'

export function prepareRecording(namespace: string){
  function useRecordedResponse( scope: string, method: string, path: string ){
    const fileName = filenameFromRequest(namespace, scope, method, path)

    return nock(scope)[method.toLowerCase()](path)
      .query(true) // this will bypass query as 
      .replyWithFile(200, fileName)
  }

  async function recordResponses(callback: () => any){
    setupRecording()
    await callback()
    stopRecording()
    saveFiles(namespace)
    cleanup()
  }

  function recordable(useMocks: boolean, callback: () => Promise<any>){
    return async () => {
      if( useMocks ){
        await callback()
      } else {
        await recordResponses(async () => await callback())
      }
    }
  }

  return {
    useRecordedResponse,
    recordable
  }
}

function setupRecording() {
  nock.restore(); // Clear nock
  nock.recorder.clear(); // Clear recorder
  nock.recorder.rec({
    dont_print: true, // No stdout output
    output_objects: true // Returns objects instead of a string about recording
  })
}

function stopRecording() {
  nock.restore()
  nock.activate()
}

function saveFiles(namespace: string) {
  const indentationSpaces = 2
  nock.recorder.play().forEach(record => {
    // Exclude getting OTP code from email requests
    if (record.scope == mailcatcherHost.replace(/\/$/, '')) {
      return;
    }

    const filePath = filenameFromRequest(namespace, record.scope, record.method, record.path)
    const json = JSON.stringify(record.response, null, indentationSpaces)
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, json);
      fs.readFileSync(filePath)
      console.debug(`Response written to ${filePath}`)
    } catch(error) {
      console.error(error)
    }
  });
}

function cleanup(){
  nock.recorder.clear()
  console.debug("Finished recording responses")
}

function filenameFromRequest(namespace: string, scope: string, httpMethod: string, url: string) {
  const targetDir = path.join(__dirname, 'replies', serializePathSegment(namespace))

  const pathPart = url.split('?')[0]

  return path.join(
    targetDir, 
    serializePathSegment(scope.replace(/\/$/, '')),
    `${serializePathSegment(`${httpMethod}_${pathPart}`)}.json`
  )
}

function serializePathSegment( fileName: string ){
  return fileName
    .replace(/^\//g, '') // Remove leading slash
    .replace(/=/g, "-") // Convert all '=' to '-', for example, 'foo?bar=1' becomes 'foo?bar-1'
    .replace(/[^\w-]+/g, "_") // Leave alphanumeric characters and dashes as is, convert everything else to underscores
    .toLowerCase() // Preventing filename case sensitivity issues before they become a pain
}
