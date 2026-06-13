const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', async (req, res) => {
    try {
        const [tasks] = await db.execute('SELECT * from tasks')
        return res.json(tasks)
    } catch (error) {
        return res.status(500).json({ message: 'Ошибка при получении задач' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id

        const [result] = await db.execute('SELECT * from tasks WHERE user_id = ?', [id])


        return res.json(result)
    } catch (error) {
        console.error(error)
        return res.status(500).json([])
    }
})

router.post('/add', async (req, res) => {
    try {
        const { username, name, title, description, status, display_order } = req.body

        const [users] = await db.execute('SELECT * FROM users where username = ?', [username])
        const user = users[0]
        const [companys] = await db.execute('SELECT * from companies where name = ?', [name])
        const company = companys[0]
        const [result] = await db.execute(
            'INSERT INTO tasks (user_id, company_id, title, description, status, display_order) values (?,?,?,?,?,?)',
            [user.id, company.id, title, description, status, display_order]
        )
        return res.json({ message: true })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Ошибка при добавлении задачи' })
    }
})

router.get('/gettask/:id', async (req, res) => {
    try {
        const id = req.params.id
        const [result] = await db.execute('select * from tasks where id = ?', [id])
        return res.json({ message: result })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Ошибка при выдаче данных о задаче' })
    }
})

router.patch('/patchtask/:id', async (req, res) => {
    try {
        const id = req.params.id
        const { title, description } = req.body

        const [sql] = await db.execute('UPDATE tasks SET title = ?, description = ?  WHERE id = ? ', [title,description, id])
        return res.json({message: true})
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Ошибка при обновлении задачи' })
    }
})

router.patch('/patch/:id', async (req, res) => {
    try {
        const id = req.params.id
        const updates = req.body

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Нет данных' })
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

        if (update.length === 0) {
            res.status(404).json({ message: 'Не нашел задачу' })
        }

        res.json(update[0])

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Ошибка при обновлении задачи' })
    }
})

router.post('/done/:id', async (req, res) => {
    const id = req.params.id
    const conn = await db.getConnection()
    try {
        await conn.beginTransaction()

        const [result] = await db.execute('SELECT * from tasks where id = ?', [id])

        const task = result[0]

        await conn.execute('INSERT INTO archive (task_id, user_id, company_id, title, description) values (?,?,?,?,?)', [task.id, task.user_id, task.company_id, task.title, task.description])
        await conn.execute('DELETE from tasks where id = ?', [id])
        await conn.commit()

        res.json({ message: "True" })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'ошибка при переводе в архив' })
    }
})

router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id
        const [result] = await db.execute(
            'DELETE FROM tasks WHERE id = ?', [id]
        )
        res.json({ message: "Задача удалена" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'ошибка при удалении' })
    }
})

module.exports = router;