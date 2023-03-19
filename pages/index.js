import Head from "next/head"
import { useEffect, useState } from "react"
import styles from "./index.module.css"

/**
 * 
 * @param {object} row 
 * @param {number} delay 
 */
async function delayedShowRowData(data, delay = 500) {
  return new Promise((res, rej) => {
    return setTimeout(() => {
      res(data)
    }, delay)
  })
} 

function getRecipeIngredients(recipe) {
  const splitRecipes = recipe.split("\n")
  return splitRecipes
}


export default function Home() {
  const [display, setDisplay] = useState("none")
  const [cocktailInput, setCocktailInput] = useState("")
  const [result, setResult] = useState()
  
  async function onSubmit(event) {
    event.preventDefault()
    try {
      const cocktailSearch = cocktailInput
      if (!!cocktailSearch) setResult("")
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cocktail: cocktailSearch }),
      })
      
      const data = await response.json()
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`)
      }
      console.log(data)
      const recipes = getRecipeIngredients(data.result)
      if (!recipes) {
        throw Error("Unable to parse recipe results")
      }

      console.log(recipes)
      setResult(recipes)
      setDisplay("block")
      setCocktailInput(cocktailSearch)
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error("error", error)
      alert(error.message)
    }
  }

  function displayResult(result) {
    if (!result) return "Searching..."
    if (typeof result === "string") {
      result = result.split("\n")

    }
    if (!result) return "<li>500 error</li>"
    return result.filter(rItem => rItem !== "").map((r) => {
      return <li>{r.replace("-", "")}</li>
    })  
  }

  return (
    <div>
      <Head>
        <title>MyCocktailRecipe</title>
        {/* <link rel="icon" href="/dog.png" /> */}
      </Head>

      <main className={styles.main}>
        <h1>MyCocktailRecipes.com</h1>
        <p>Enter cocktail name for a recipe or ingredients for ideas</p>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="cocktail"
            placeholder="i.e. Mojito, Sex on the beach or Peach, Vodka"
            value={cocktailInput}
            onChange={(e) => setCocktailInput(e.target.value)}
          />
          <input type="submit" value="Generate" />
        </form>
        <div className={styles.result} style={{ display }}>
          <h3 className="recipe">Recipe</h3>
          <ul>{displayResult(result)}</ul>
        </div>
      </main>
    </div>
  )
}
