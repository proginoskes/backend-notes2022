const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')

const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')

// middleware
const requestLogger = require('./utils/middleware/request-logger')
const errorHandler = require('./utils/middleware/error-handler')
const unknownEndpoint = require('./utils/middleware/unknown-req')

const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(()=>{
        logger.info('connected to MongoDB')
    })
    .catch(error => {
        logger.error('error connecting to MongoDB', error.message)
    })

// parse json
app.use(express.json())
// serve build files first
app.use(express.static('build'))

// homemade middleware
app.use(requestLogger())

// cross origin access
app.use(cors())

// routers
app.use('/api/notes', notesRouter)
app.use('/api/users', usersRouter)


app.use(errorHandler())
app.use(unknownEndpoint())

module.exports = app