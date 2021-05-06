const setupDatabase = require('./db')
const setupLinks = require('./links.service')
const setupRouters = require('./router.service')

module.exports = {
    setupDatabase,
    setupLinks,
    setupRouters
}
