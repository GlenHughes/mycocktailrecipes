import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const cocktailQuery = req.body.cocktail || '';
  if (cocktailQuery.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid cocktail name or ingredients",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(cocktailQuery),
      temperature: 0.5,
      max_tokens: 2048
    });
    const dataWithoutEmpty = completion.data.choices.map((d) => {
      return d !== ""
    })
    console.log(completion.data.choices)
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(cocktails) {
  console.log(cocktails)
  const cocktailPrompt = cocktails.toLowerCase()
  return `Can you list all of the ingredients in "${cocktailPrompt}" cocktail?`
  // return `Can you list all of the ingredients for a ${cocktails} cocktail`;
}
