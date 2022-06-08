require('dotenv').config()
const express = require('express')
const requestLogger = require('./middleware/request-logger')
const unknownEndpoint = require('./middleware/unknown-req')
const errorHandler = require('./middleware/error-handler')
const cors = require('cors')
const mongoose = require('mongoose')

const app=express()

const url = process.env.MONGODB_URI

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        minLength: 5,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    important: Boolean
})

const Note = mongoose.model('Note',noteSchema)

noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

// const requestLogger = (request, response, next) => {
//     console.log('Method:', request.method)
//     console.log('Path:  ', request.path)
//     console.log('Body:  ', request.body)
//     console.log('---')
//     next()
// }

// parse json
app.use(express.json())
// serve build files first
app.use(express.static('build'))

// homemade middleware
app.use(requestLogger())

// cross origin access
app.use(cors())

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
  
app.get('/api/notes', (request, response) => {
    Note
        .find({})
        .then(notes =>   
            response.json(notes)
        )
        .catch(()=>
            response.status(404).end()
        )
    
})
  
app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id
    Note
        .findById(id)
        .then(note=>{
            response.json(note)
        })
        .catch(()=>{
            response.status(404).end()
        })
})

app.delete('/api/notes/:id', (request, response, next) =>{
    const id=request.params.id
    Note
        .findByIdAndRemove(id)
        .then(()=>{
            response.status(204).end()
        })
        .catch((err)=>{
            return next(err)
        })

})



app.post('/api/notes/', (request, response, next)=>{
    //console.log(request.body)
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important||false,
        date: new Date()
    })
    
    note
        .save()
        .then(() =>{
            response.json(note)
            mongoose.connection.close
        })
        .catch(err=>
            next(err)
        )

    
})

app.put('/api/notes/:id', (request, response, next)=>{
    const { content, important } = request.body

    Note
        .findByIdAndUpdate(
            request.params.id, 
            { content, important }, 
            { new: true, runValidators: true, context: 'query'}
        )
        .then((updatedNote) => {
            // still need to check for non-null note
            if(updatedNote){    
                response.json(updatedNote)
            }else{
                response.status(404).end()
            }
        })
        .catch((err)=>
            next(err)
        )
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT||3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})