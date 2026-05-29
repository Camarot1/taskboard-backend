const express = require('express')
const app = express()
const cors = require('cors')

const port = 5000
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const taskRouter = require('./routes/task')
app.use('/tasks', taskRouter)

app.get('/', (req,res) =>{
    res.send('SERVER NORM')
})

app.listen(port, '0.0.0.0', () =>{
    console.log(`SERVER START: ${port}`)
})