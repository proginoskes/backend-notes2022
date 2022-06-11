const errorHandler = () => {
    const eH = (error, request, response, next) => {
        console.error(`${error.name}: ${error.message}`)
    
        if (error.name === 'CastError') {
            return response.status(400).send({ error: 'malformatted id' })
        } else if (error.name === 'ValidationError'){
            return response.status(400).json({error: error.message})
        } else if (error.name === 'TypeError'){
            return response.status(404).json({error: error.message})
        } else if (error.name === 'JsonWebTokenError') {
            return response.status(401).json({
                error: 'invalid token'
            })
        } else if (error.name === 'ReferenceError'){
            return response.status(404).json({error: error.message})
        }

        logger.error(error.message)
    
        next(error)
    }
    return eH
}

module.exports = errorHandler