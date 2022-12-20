const User = require('../models/User')

const bcrypt = require('bcryptjs')



module.exports = class AuthController {

    // página de login
    static login(req, res) {
        res.render('auth/login')
    }


    // página de registro
    static register(req, res) {
        res.render('auth/register')
    }

    // post do registro
    static async registerPost(req, res) {

        const { name, email, password, confirmpassword } = req.body

        // password match validation
        if(password != confirmpassword) {
            // mensagem
            req.flash('message', 'As senhas não conferem, tente novamente!')
            res.render('auth/register')

            return
        }


        // check if user exists
        const checkIfUserExists = await User.findOne({where: {email: email}})

        if(checkIfUserExists) {
            
            req.flash('message', 'O e-mail já está em uso!')
            res.render('auth/register')

            return
        }


        // create a password
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)

        const user = {
            name,
            email,
            password: hashedPassword
        }

        try {
            const createdUser = await User.create(user)

            // initialize session 
            req.session.userid = createdUser.id

            req.flash('message', 'Cadstro realizado com sucesso!')

            req.session.save(() => {
                res.redirect('/')
            })

        } catch (err) {
            console.log(err)
        }

        

    }
}