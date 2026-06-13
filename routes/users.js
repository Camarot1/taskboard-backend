const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const auth = require('../middleware/auth.js')

router.post('/login', async(req, res) => {
    const { login, password} = req.body
    try{
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [login]);

        if (users.length === 0){
            return res.status(401).json({message:"Такой пользватель не найден"})
        }

        const user = users[0]
        const check = bcrypt.compare(password, user.password)
        if (!check){
            return res.status(401).json({message:"Неверный пароль"})
        }

        const token = jwt.sign({id: user.id, login: user.username, company_id: user.company_id}, process.env.JWT_SECRET, {expiresIn: '1d'})

        res.json({
            success: true,
            user:{
                id: user.id,
                login: user.username,
                company_id: user.company_id
            },
            token
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
            return res.status(400).json({message:"Этот логин или почта заняты"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const [result] = await db.execute('INSERT INTO users (email, username, password, isAdmin) VALUES (?,?,?,?)' ,[email, username, hashedPassword, 0])

        res.json({message:"Успешная регистрация"})

    }catch(error){
        console.error(error)
        res.status(500).json({message:"Ошибка при регистрации"})
    }
})

module.exports = router