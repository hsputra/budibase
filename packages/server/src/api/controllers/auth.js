const CouchDB = require("../../db")
const { outputProcessing } = require("../../utilities/rowProcessor")
const { InternalTables } = require("../../db/utils")
const { getFullUser } = require("../../utilities/users")

exports.fetchSelf = async ctx => {
  const appId = ctx.appId
  let userId = ctx.user.userId || ctx.user._id
  /* istanbul ignore next */
  if (!userId) {
    ctx.body = {}
    return
  }

  const user = await getFullUser(ctx, userId)

  if (appId) {
    const db = new CouchDB(appId)
    // remove the full roles structure
    delete user.roles
    try {
      const userTable = await db.get(InternalTables.USER_METADATA)
      const metadata = await db.get(userId)
      // specifically needs to make sure is enriched
      ctx.body = await outputProcessing(appId, userTable, {
        ...user,
        ...metadata,
      })
    } catch (err) {
      ctx.body = user
    }
  } else {
    ctx.body = user
  }
}
