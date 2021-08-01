const PouchDB = require("pouchdb")
const replicationStream = require("pouchdb-replication-stream")
const allDbs = require("pouchdb-all-dbs")
const find = require("pouchdb-find")
const env = require("../environment")

const COUCH_DB_URL = env.COUCH_DB_URL || "http://localhost:10000/db/"

PouchDB.plugin(replicationStream.plugin)
PouchDB.plugin(find)
PouchDB.adapter("writableStream", replicationStream.adapters.writableStream)

let POUCH_DB_DEFAULTS = {
  prefix: COUCH_DB_URL,
}

if (env.isTest()) {
  PouchDB.plugin(require("pouchdb-adapter-memory"))
  POUCH_DB_DEFAULTS = {
    prefix: undefined,
    adapter: "memory",
  }
}

const Pouch = PouchDB.defaults(POUCH_DB_DEFAULTS)

allDbs(Pouch)

// replicate your local levelDB pouch to a running HTTP compliant couch or pouchdb server.
/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function replicateLocal() {
  Pouch.allDbs().then(dbs => {
    for (let db of dbs) {
      new Pouch(db).sync(
        new PouchDB(`http://127.0.0.1:5984/${db}`, { live: true })
      )
    }
  })
}

// replicateLocal()

module.exports = Pouch
