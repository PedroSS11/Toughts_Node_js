const Tought = require("../models/Tought");
const User = require("../models/User");


const { Op }  = require('sequelize')

module.exports = class ToughtController {

  // Mostra todos os pensamentos
  static async showToughts(req, res) {

    let search = ""

    if(req.query.search) {
      search = req.query.search
    }

    let order = 'DESC'

    if(req.query.order === "old") {
      order = "ASC"
    } else {
      order = 'DESC'
    }

    const toughtsData = await Tought.findAll({
      include: User,
      where: {
        title: { [Op.like]: `%${search}%` },
      },
      order: [['createdAt', order]]
    })

    // busca os toughts e o User (nome do usuario no model User) e insere no mesmo array
    const toughts = toughtsData.map((result) => result.get({plain: true}));
  
    let toughtsQty = toughts.length

    if(toughtsQty === 0) {
      toughtsQty = false
    }


    res.render("toughts/home", { toughts, search, toughtsQty });
  }

  // renderiza a dashboard do usuario
  static async dashboard(req, res) {
    const userId = req.session.userid;

    const user = await User.findOne({
      where: {
        id: userId,
      },
      include: Tought,
      plain: true,
    });

    if (!user) {
      res.redirect("toughts/login");
    }

    
    const toughts = user.Toughts.map((result) => result.dataValues)
    console.log(toughts)
    // validação caso não tenha pensamento na dahsboard
    let emptyToughts = true;

    if(toughts.length > 0) {
      emptyToughts = false
    }




    res.render("toughts/dashboard", { toughts, emptyToughts });
  }

  // redireciona para o form de criação de tought
  static createTought(req, res) {
    res.render("toughts/create");
  }

  // Envia e salva o tought na db
  static async createToughtSave(req, res) {
    const tought = {
      title: req.body.title,
      UserId: req.session.userid,
    };

    try {
      // criando tought na db
      await Tought.create(tought);

      req.flash("message", "Pensamento criado com sucesso");
      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (error) {
      console.log("Aconteceu um erro:" + error);
    }
  }

  // excluir tought da db
  static async removeTought(req, res) {
    const id = req.body.id;
    const UserId = req.session.userid;

    try {
      await Tought.destroy({ where: { id: id, UserId: UserId } });
      req.flash("message", "Pensamento removido com sucesso!");
      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (error) {
      console.log("ocorreu um erro" + error);
    }
  }

  // redireciona para form de edição resgatando previamente os dados cadastrados
  static async updateTought(req, res) {
    const id = req.params.id;
    const tought = await Tought.findOne({ where: { id: id }, raw: true });

    res.render("toughts/edit", { tought });
  }

  static async updateToughtSave(req, res) {
    const id = req.body.id;

    const tought = {
      title: req.body.title,
    };

    try {
      // Post do tought atualizado na db
      await Tought.update(tought, { where: { id: id } });

      req.flash("message", "Pensamento atualizado com sucesso!");
      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (error) {
      console.log("ocorreu um erro" + error);
    }
  }
};
