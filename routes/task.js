const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', async(req, res) => {
    try{
        const [tasks] = await db.execute('SELECT * from tasks')
        res.json(tasks)
    }catch(error){
        res.status(500).json({message: 'Ошибка при получении задач'})
    }
})

router.get('/:id', async(req,res)=>{
    try{
        const id = req.params.id

        const [result] = await db.execute('SELECT * from tasks WHERE user_id = ?', [id])

        if (result.length === 0){
            res.status(404).json({message:'Нет задач у юзера'})
        }

        res.json(result)
    }catch(error){
        console.error(error)
        res.status(500).json({message:'Ошибка при получении задач'})
    }
})

router.post('/add', async(req,res) =>{
    try{
        const {user_id, company_id, title, description, status, display_order} = req.body

        const [result] = await db.execute(
            'INSERT INTO tasks (user_id, company_id, title, description, status, display_order) values (?,?,?,?,?,?)',
            [user_id, company_id, title, description, status, display_order]
        )
        res.json({message: true})
    }catch(error){
        console.error(error)
        res.status(500).json({message: 'Ошибка при добавлении задачи'})
    }
})

router.patch('/patch/:id', async(req,res) =>{
    try{
        const id = req.params.id
        const updates = req.body

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({message:  'Нет данных'})
        }

        const fieldsTitle = []
        const fielsdValues = []

        for (const [fieldTitle, fieldValue] of Object.entries(updates)) {
            fieldsTitle.push(`${fieldTitle} = ?`)
            fielsdValues.push(fieldValue)
        }

        fielsdValues.push(id)

        const [result] = await db.execute(
            `UPDATE tasks SET ${fieldsTitle.join(' , ')} WHERE id = ?`, fielsdValues
        )

        const [update] = await db.execute('SELECT * FROM tasks WHERE id = ?', [id])

        if(update.length === 0){
            res.status(404).json({message: 'Не нашел задачу'})
        }

        res.json(update[0])

    } catch(error){
        console.error(error)
        res.status(500).json({message:'Ошибка при обновлении задачи'})
    }
})

router.post('/done/:id', async(req,res) =>{
    const id = req.params.id
    const conn = await db.getConnection()
    try{
        await conn.beginTransaction()

        const  [result] = await db.execute('SELECT * from tasks where id = ?', [id])

        const task = result[0]

        await conn.execute('INSERT INTO archive (task_id, user_id, company_id, title, description) values (?,?,?,?,?)', [task.id, task.user_id, task.company_id, task.title, task.description])

        await conn.execute('DELETE from tasks where id = ?', [id])
        
        await conn.commit()

        res.json({message:"True"})


    }catch(error){
        console.error(error)
        res.status(500).json({message:'ошибка при переводе в архив'})
    }
})

router.delete('/delete/:id', async(req,res) =>{
    try{
        const id = req.params.id
        const [result] = await db.execute(
            'DELETE FROM tasks WHERE id = ?', [id]
        )
        res.json({message: "Задача удалена"})
    }catch(error){
        console.error(error)
        res.status(500).json({message: 'ошибка при удалении'})
    }
})

module.exports = router;