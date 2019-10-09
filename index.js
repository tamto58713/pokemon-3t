const express = require('express')
const bodyParser = require("body-parser")
const shortid = require('shortid')
const favicon = require('express-favicon')

const app = express()

const port = process.env.PORT || 8080
const pokemon = require("./pokemon").pokemon
const db = require("./db")

const formatUrl = (num) => {
    if (num >= 100)
        return num.toString()
    if (num >= 10)
        return "0" + num
    return "00" + num
}

app.set("view engine", "pug")
app.set("views", "views")
app.use(express.static('public'))
app.use(favicon(__dirname + '/public/images/favicon.ico'))
app.use(bodyParser())

let listPokemon = []
let currentUser = {name: ""}
for (let i = 0; i < 809; i++) {
    let poke = {
        ...pokemon[i],
        imageUrl: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/" + formatUrl(i + 1) + ".png"
    }
    listPokemon.push(poke)
}


app.get("/", (req, res) => {
    res.render("", { listPokemon, formatUrl, currentUser, title: "Pokedex" })
})

app.get("/pokemon/:id", (req, res) => {
    const id = req.params.id
    let pokemon = listPokemon.filter(pokemon => {
        return pokemon.id == id
    })[0]
    res.render("pokedex/detail", { pokemon, title: "Pokemon" })
})

let errs = []
app.get("/login", (req, res) => {
    if (currentUser.name.length > 0) {
        res.redirect("/")
        return
    }
    res.render("auth/login", {errs: [], user: {userName: "", password: ""}, title: "Login"})
})

app.post("/login", (req, res) => {
    const userName = req.body.userName.toLocaleLowerCase()

    const password = req.body.password
    
    const user = db.get("users").find({userName}).value()
    
    if (!user) {
        errs.push("Username isn't exist!");
        res.render('auth/login', {errs, user: {name: "", passwod: ""}})
        return;
    }

    if (userName !== user.userName || password !== user.password) {
        errs.push("Wrong UserName or Password");
        res.render('auth/login', {errs, user: {userName, password}})
        return;
    }
    currentUser = {name: user.fullName}
    res.redirect("/")
})

let errsReg = [false, false, false, false, false]
app.get("/register", (req, res) => {
    if (currentUser.name.length > 0) {
        res.redirect("/")
        return
    }
    res.render("auth/register", {user: {name: "", userName: "", email: "", password: "", rePassword: ""}, errsReg, title: "Register"})
})

const check = (name, userName, email, password, rePassword) => {

    if (name.trim().length === 0)
        errsReg[0] = true
    else
        errsReg[0] = false
    let user = db.get("users").find({userName}).value()

    if (!user)
        errsReg[1] = false
    else
        errsReg[1] = true

    user = db.get("users").find({email}).value()

    if (user)
        errsReg[2] = true
    else
        errsReg[2] = false

    if (password.length < 8)
        errsReg[3] = true
    else if (rePassword !== password) {
        errsReg[3] = false
        errsReg[4] = true
    }

    else {
        errsReg[3] = false
        errsReg[4] = false
    }

    if (errsReg[0] || errsReg[1] || errsReg[2] || errsReg[3] || errsReg[4])
       return false
    return true


}

const register = async (name, userName, email, password) => {
    const low = require('lowdb')    
    const FileAsync = require('lowdb/adapters/FileAsync')
    const adapter = new FileAsync('db.json')
    const db = await low(adapter)

    db.get("users").push( {
        id: shortid.generate(),
        firstName: name.slice(0, name.indexOf(" ")),
        lastName: name.slice(name.indexOf(" "), name.length),
        fullName: name,
        userName,
        email,
        password
    }).write()  
}
app.post("/register", (req, res) => {
    const name = req.body.name
    const userName = req.body.userName
    const email = req.body.email
    const password = req.body.password
    const rePassword = req.body.rePassword

    if (!check(name, userName, email, password, rePassword)) {
        res.render("auth/register", {errsReg, user: {name, userName, email, password: "", rePassword: ""}})
        return;
    }
    register(name, userName, email, password)
    res.redirect("/login")
    return;
})

app.post("/logout", (req, res) => {
    currentUser = {name: ""}
    res.redirect("/")
})
app.listen(port, () => console.log(`App listening on port ${port}`))