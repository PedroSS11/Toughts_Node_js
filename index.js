const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

// Import Routes
const toughtsRoutes = require('./routes/toughtsRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()

const conn = require('./db/conn')


// !MODELS
const Tought = require('./models/Tought')
const User = require('./models/User')

// import controller showTought para definir a rota / para os pensamentos por padrão
const ToughtController = require('./controllers/ToughtController')


//* Configurando o Handlebars
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

//* Receber respostas do body
app.use(
    express.urlencoded({
        extended: true
    })
)
app.use(express.json())


//* Session save middleware
app.use(
    session({
        name:"session",
        secret: "nosso_secret",
        resave: false,
        saveUninitialized: false,
        store: new FileStore({
            logFn: function () {},
            path: require('path').join(require('os').tmpdir(), 'sessions')
        }),
        cookie: {
            secure: false,
            maxAge: 360000,
            expires: new Date(Date.now() + 360000),
            httpOnly: true
        }
    }),
)


//* flash messages
app.use(flash())

//* public path
app.use(express.static('public'))

//* set session to response
app.use((req, res, next) => {
    if(req.session.userid){
        res.locals.session = req.session
    }

    next()

})


//* Routes
app.use('/toughts', toughtsRoutes)
app.use('/', authRoutes)

// Main Route
app.get('/', ToughtController.showToughts)

conn
    .sync()
    .then(() => {
        app.listen(3000)
    }).catch((err) => console.log(err))