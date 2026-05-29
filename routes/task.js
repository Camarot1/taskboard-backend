const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', async(req, res) => {
    try{
        const [tasks] = await db.execute('SELECT * from tasks')
        res.json(tasks)
    }catch(error){
        res.status(500).json({error: 'Ошибка при получении задач'})
    }
})


router.post('/add', async(req,res) =>{
    try{
        const {user_id, company_id, title, description, status, display_order} = req.body

        const [result] = await db.execute(
            'INSERT INTO tasks (user_id, company_id, title, description, status, display_order) values (?,?,?,?,?,?)',
            [user_id, company_id, title, description, status, display_order]
        )
        res.json({success: true})
    }catch(error){
        console.error(error)
        res.status(500).json({error: 'Ошибка при добавлении задачи'})
    }
})


module.exports = router;