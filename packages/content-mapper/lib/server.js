import {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter
} from 'vscode-jsonrpc/node'

import {closeProject} from './requests/close-project.js'
import {initialize} from './requests/initialize.js'
import {openProject} from './requests/open-project.js'
import {transform} from './requests/transform.js'

const connection = createMessageConnection(
  new StreamMessageReader(process.stdin),
  new StreamMessageWriter(process.stdout)
)

connection.onRequest('closeProject', closeProject)
connection.onRequest('initialize', initialize)
connection.onRequest('openProject', openProject)
connection.onRequest('transform', transform)

connection.listen()
