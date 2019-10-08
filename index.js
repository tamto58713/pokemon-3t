const express = require('express')
const fetch = require("node-fetch")
const app = express()

const port = process.env.PORT || 8080
let listPokemon = [""]

const Pokedex = require('pokedex')
const pokedex = new Pokedex()

const formatUrl = (num) => {
    if (num > 100)
        return num.toString()
    if (num > 10)
        return "0" + num
    return "00" + num
}
app.get("/", (req, res) => {
        for (let i = 1; i <= 807; i++) {
            let pokemon = {
                ...pokedex.pokemon(i), 
                imageURL: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/" + formatUrl(i) + ".png"
            }
            listPokemon.push(pokemon)
        }
    res.send("ihi")

})

app.listen(port, () => console.log(`App listening on port ${port}`))