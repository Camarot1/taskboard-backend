const express = require('express')
const router = express.Router()
const db = require('../db')

router.post('/login', async(req, res) => {
    const { login, password} = req.body
    try{
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [login]);

        if (users.length === 0){
            return res.status(401).json({message:"Такой пользватель не найден"})
        }

        const user = users[0]
        if (!(user.password == password)){
            return res.status(401).json({message:"Неверный пароль"})
        }

        res.json({
            success: true,
            user:{
                id: user.id,
                login: user.username,
                company_id: user.company_id
            }
        }) 
    }catch(error) {
        console.error(error)
        res.status(500).json({message:"Ошибка при входе"})
    }
})

router.post('/register', async(req,res)=>{
    try{
        const {email, username, password} = req.body

        if (!email || !username || !password){
            return res.status(400).json({
                message: "Все поля обязальны",
                data: {email,username,password}
        })
        }

        const [users] = await db.execute('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);

        if (users.length > 0){
            return res.status(400).json({message:"Этот логин или почтв заняты"})
        }

        const [result] = await db.execute('INSERT INTO users (email, username, password, company_id, isAdmin) VALUES (?,?,?,?,?)' ,[email, username, password, 2, 0])

        res.json({message:"Успешная регистрация"})

    }catch(error){
        console.error(error)
        res.status(500).json({message:"Ошибка при регистрации"})
    }
})

module.exports = router