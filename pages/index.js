import Head from "next/head"
import { useState } from "react"
import styles from "./index.module.css"

export default function Home() {
  const [cocktailInput, setCocktailInput] = useState("")
  const [result, setResult] = useState()

  async function onSubmit(event) {
    event.preventDefault()
    try {
      const cocktailSearch = cocktailInput
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
      setResult(data.result)
      // setCocktailInput()
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error)
      alert(error.message)
    }
  }

  function displayResult(result) {
    if (!result) return ""
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
        <div className={styles.result}>
            <ul>{displayResult(result)}</ul>
        </div>
      </main>
    </div>
  )
}
