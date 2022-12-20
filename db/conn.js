const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('toughts', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

try {
    sequelize.authenticate()
    console.log("Conectado com sucesso!")
} catch (err) {
    console.log(`NÃO FOI POSSÍVEL CONECTAR => ${err}`)
}

module.exports = sequelize