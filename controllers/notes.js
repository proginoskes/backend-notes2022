const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async (request, response) => {
    const notes = await Note
        .find({})
        .populate('user', {username: 1, name: 1})
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

    const user = await User.findById(body.userId)

    const note = new Note({
        content: body.content,
        important: body.important||false,
        date: new Date(),
        user: body.userId
    })
    
    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.status(201).json(savedNote)    
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