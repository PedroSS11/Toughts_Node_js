const User = require("../models/User");

const bcrypt = require("bcryptjs");

module.exports = class AuthController {
  // página de login
  static login(req, res) {
    res.render("auth/login");
  }

  // enviando infos do form de login para validar com db e autenticar o login
  static async loginPost(req, res) {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      res.render("auth/login", {
        message: "Usuário não encontrado!",
      });

      return;
    }

    // compare password
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      res.render("auth/login", {
        message: "Senha inválida!",
      });

      return;
    }

    // auth user
    req.session.userid = user.id;

    req.flash("message", "Login realizado com sucesso!");

    req.session.save(() => {
      res.redirect("/");
    });
  }


  
  // página de registro
  static register(req, res) {
    res.render("auth/register");
  }

  // post do registro
  static async registerPost(req, res) {
    const { name, email, password, confirmpassword } = req.body;

    // password match validation
    if (password != confirmpassword) {
      // mensagem
      req.flash("message", "As senhas não conferem, tente novamente!");
      res.render("auth/register");

      return;
    }

    // check if user exists
    const checkIfUserExists = await User.findOne({ where: { email: email } });

    if (checkIfUserExists) {
      req.flash("message", "O e-mail já está em uso!");
      res.render("auth/register");

      return;
    }

    // create a password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = {
      name,
      email,
      password: hashedPassword,
    };

    try {
      const createdUser = await User.create(user);

      // initialize session
      req.session.userid = createdUser.id;

      req.flash("message", "Cadstro realizado com sucesso!");

      req.session.save(() => {
        res.redirect("/");
      });
    } catch (err) {
      console.log("Aconteceu um erro:" + err);
    }
  }

  // Finalizar sessão cancelando o session no cookie
  static logout(req, res) {
    req.session.destroy();
    res.redirect("/login");
  }
};
