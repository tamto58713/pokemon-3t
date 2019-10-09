const express = require('express')
const fetch = require("node-fetch")
const app = express()

const port = process.env.PORT || 8080
let pokemon = require("./db").pokemon


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

let listPokemon = []
for (let i = 0; i < 809; i++) {
    let poke = {
        ...pokemon[i],
        imageUrl: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/" + formatUrl(i + 1) + ".png"
    }
    listPokemon.push(poke)
}


app.get("/", (req, res) => {
    for (let i = 0; i < 809; i++) {
        let poke = {
            ...pokemon[i],
            imageUrl: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/" + formatUrl(i + 1) + ".png"
        }
        listPokemon.push(poke)
    }
    res.render("", { listPokemon, formatUrl: formatUrl })

})

app.get("/:id", (req, res) => {
    const id = req.params.id
    let pokemon = listPokemon.filter(pokemon => {
        return pokemon.id == id
    })[0]
    res.render("pokedex/detail", { pokemon })
})

app.listen(port, () => console.log(`App listening on port ${port}`))