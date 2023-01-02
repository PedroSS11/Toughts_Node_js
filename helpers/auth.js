

// checa se existe um usuário logado na session
module.exports.checkAuth = function(req, res, next) {

    const userId = req.session.userid

    if(!userId) {
        res.redirect('/login')

    }

    next()
}