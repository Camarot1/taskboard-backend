require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const port = 5000
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const jwtAuth = require('./middleware/auth')

const taskRouter = require('./routes/task')
app.use('/tasks', taskRouter)

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

app.get('/', (req,res) =>{
    res.send('SERVER NORM')
})

app.listen(port, '0.0.0.0', () =>{
    console.log(`SERVER START: ${port}`)
})