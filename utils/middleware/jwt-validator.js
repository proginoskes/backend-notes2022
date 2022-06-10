const jwt = require ('jsonwebtoken')
const jwtValidator = () => {
    const getTokenFrom = request =>{
        const authorization = request.get('authorization')
        if(authorization && authorization.toLowerCase().startsWith('bearer ')){
            return authorization.substring(7)
        }
        return null
    }

    const validate = (request,response,next) => {
        if(response.method === 'POST'){
            const token = getTokenFrom(request)
            const decodedToken = jwt.verify(token,process.env.SECRET)

            response.locals.userId = decodedToken.id
        }

        next()
    }
    return validate
}

module.exports = jwtValidator