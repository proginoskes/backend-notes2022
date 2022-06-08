require('dotenv').config()
const express = require('express')
const requestLogger = require('./middleware/request-logger')
const unknownEndpoint = require('./middleware/unknown-req')
const cors = require('cors')
const mongoose = require('mongoose')

const app=express()

const url = process.env.MONGODB_URI

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean
})

const Note = mongoose.model('Note',noteSchema)


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

// let notes = [
//     {
//         "id": 1,
//         "content": "HTML is easy",
//         "date": "2019-05-30T17:30:31.098Z",
//         "important": true
//     },
//     {
//         "id": 2,
//         "content": "Browser can execute only JavaScript",
//         "date": "2019-05-30T18:39:34.091Z",
//         "important": true
//     },
//     {
//         "id": 3,
//         "content": "GET and POST are the most important methods of HTTP protocol",
//         "date": "2019-05-30T19:20:14.298Z",
//         "important": false
//     },
//     {
//         "content": "Hello",
//         "date": "2022-06-08T03:28:36.427Z",
//         "important": false,
//         "id": 4
//     },
//     {
//         "content": "I Love Sonja Morgan",
//         "date": "2022-06-08T03:29:47.412Z",
//         "important": false,
//         "id": 5
//     },
//     {
//         "content": "Lelia",
//         "date": "2022-06-08T03:30:26.749Z",
//         "important": true,
//         "id": 6
//     }
// ]

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
    const id = Number(request.params.id)
    Note.findById(id, (err, note)=>{
        if(note){
            response.json(note)
        }else{
            response.status(404).end()
        }
    })
})

app.delete('/api/notes/:id', (request, response) =>{
    const id=Number(request.params.id)
    notes=notes.filter(note=>note.id!==id)

    response.status(204).end()
})


const generateId = () =>{
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n=>n.id))
        :0
    return maxId+1
}

app.post('/api/notes/', (request, response)=>{
    //console.log(request.body)
    const body = request.body
    
    if(!body.content){
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: body.important||false,
        date:new Date(),
        id:generateId()
    })
    
    note.save().then(result =>{
        response.json(note)
        mongoose.connection.close
    })

    
})

app.put('/api/notes/:id', (request, response)=>{
    const id = Number(request.params.id)
    const importance = request.body.important
    console.log(typeof(importance))
    let note = notes.find(note=>note.id===id)
    if(note && typeof(importance)==='boolean'){
        note.important = importance
        response.json(note)
    }else if(!note){
        response.status(404).end()
    }else{
        response.status(400).end()
    }
})

app.use(unknownEndpoint())

const PORT = process.env.PORT||3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})