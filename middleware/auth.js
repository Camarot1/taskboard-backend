const jwt = require('jsonwebtoken')

module.exports = function (req,res,next) {
    const authHeader = req.headers.authorization

    if (!authHeader){
        return res.status(401).json({
            message: 'Нет токена'
        })
    }

    const token = authHeader.split(' ')[1]

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.profile = decode
        next()
    }catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({ message: 'Токен истек'})
        }else{
            return res.status(403).json({message: 'Токен истек'})
        }
    }
}