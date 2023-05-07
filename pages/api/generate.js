import { Configuration, OpenAIApi } from "openai"
import { cache } from "./cache"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration)

function generatePrompt(cocktails) {
  console.log(`Generate prompt from: ${cocktails}`)
  const cocktailPrompt = cocktails.toLowerCase()
  return `Can you list all of the ingredients with measurements in "${cocktailPrompt}" cocktail as UK metrics?`
}

async function getQueryResults(query) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: generatePrompt(query),
    temperature: 0.5,
    max_tokens: 2048
  });
  return completion.data.choices[0].text
}

function extractQuery(body) {
  const { cocktail } = body
  if (cocktail.trim().length === 0) {
    console.error(`Invalid cocktail query: ${cocktail}`)
    res.status(400).json({
      error: {
        message: "Please enter a valid cocktail name or ingredients",
      }
    })
    return
  }
  return cocktail
}

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    })
    return
  }

  const cocktailQuery = extractQuery(req.body)
  try {
    const result = await cache(cocktailQuery, getQueryResults)
    res.status(200).json({ result })
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`)
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      })
    }
  }
}


