const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({})
    response.json(notes.map(note => note.toJSON()))
})
  
notesRouter.get('/:id', async (request, response) => {
    const id = request.params.id
    const note = await Note.findById(id)
    response.json(note.toJSON())
})

notesRouter.delete('/:id', async (request, response, next) =>{
    const id=request.params.id
    const note = await Note.findByIdAndRemove(id)
    response.status(204).end()
})

notesRouter.post('/', async (request, response, next)=>{
    
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important||false,
        date: new Date()
    })
    
    const success = await note.save()
    console.log(success)
    response.status(201).json(success)    
})

notesRouter.put('/:id', async (request, response, next)=>{
    const { content, important } = request.body

    const updatedNote = await Note
        .findByIdAndUpdate(
            request.params.id, 
            { content, important }, 
            { new: true, runValidators: true, context: 'query'}
        )
    if(updatedNote){    
        response.json(updatedNote)
    }else{
        response.status(404).end()
    }
})

module.exports = notesRouter