import OpenAI from 'openai';

function getOpenAIClient(apiKey) {
  const key = apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: key,
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:5173',
      'X-OpenRouter-Title': 'ReviewLens AI',
    },
  });
}

const systemPrompt = `
You are ReviewLens AI — an assistant that analyzes user reviews 
to produce concise, actionable UX insights.

Focus on:
- usability
- accessibility
- visual hierarchy
- performance issues
- clarity of UI elements

Output MUST be strict JSON with:
{
  "summary": "...",
  "findings": "...",
  "checklist": "..."
}

Do not include anything outside JSON.
`;

const reviewPrompt = `
You are a UX analyst AI.

Analyze the following user reviews and evaluate user experience quality.

Return STRICT JSON:
{
  "ux_score": number (0-100),
  "sentiment": {
    "positive": percentage,
    "negative": percentage
  },
  "issues": [array of UX problems],
  "insight": "explanation",
  "recommendations": [array of suggestions]
}

Focus on:
- usability
- performance
- UI clarity
- user satisfaction

User Reviews:
"""
{{INPUT}}
"""

Do not include anything outside JSON.
`;

const fallbackModels = [
  'openrouter/free',
  'google/gemma-7b-it:free',
  'nousresearch/hermes-2-pro-llama-3-8b:free',
];

async function createWithFallback(client, baseBody, models = fallbackModels) {
  let lastError = null

  for (const model of models) {
    try {
      return await client.chat.completions.create({ ...baseBody, model })
    } catch (error) {
      const status = error.status || error.code || error?.error?.code
      if (status === 429 || status === 403) {
        console.log(`Model ${model} failed with ${status}, trying next model...`)
        lastError = error
        continue
      }
      throw error
    }
  }

  throw lastError
}

export async function analyzeReviews(apiKey, reviews) {
  if (!reviews || reviews.trim() === '') {
    throw new Error('Reviews text is missing')
  }

  console.log('Analyzing reviews with OpenRouter API...')
  console.log('Reviews length:', reviews.length)

  const client = getOpenAIClient(apiKey)

  const baseBody = {
    messages: [
      { role: 'system', content: 'You are a UX analyst AI.' },
      {
        role: 'user',
        content: reviewPrompt.replace('{{INPUT}}', reviews),
      },
    ],
    temperature: 0.15,
    max_tokens: 1000,
  }

  const makeRequest = async (retries = 3) => {
    try {
      return await createWithFallback(client, baseBody)
    } catch (error) {
      if ((error.status === 429 || error.status === 403) && retries > 0) {
        console.log(`Rate limited during fallback, retrying in 5 seconds... (${retries} retries left)`)
        await new Promise(resolve => setTimeout(resolve, 5000))
        return makeRequest(retries - 1)
      }
      throw error
    }
  }

  try {
    const completion = await makeRequest()

    const content = completion.choices?.[0]?.message?.content || ''

    if (!content) {
      throw new Error('No content in AI response')
    }

    let parsed = null

    try {
      parsed = JSON.parse(content)
    } catch {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
        } catch {
          parsed = null
        }
      }
    }

    if (!parsed) {
      return { raw: content }
    }

    return parsed
  } catch (error) {
    console.error('Reviews analysis error:', error)
    throw error
  }
}

export async function analyzeImage(apiKey, imageBase64, context = "") {
  if (!imageBase64) {
    throw new Error("Image data is missing");
  }

  console.log("Analyzing image with OpenRouter API...");
  console.log("Image data length:", imageBase64.length);

  const client = getOpenAIClient(apiKey)

  const body = {
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze the following UI screenshot and return the requested JSON. ${
              context ? `Context: ${context}` : ""
            }`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageData}`,
            },
          },
        ],
      },
    ],
    temperature: 0.15,
    max_tokens: 800,
  };

  const makeRequest = async (retries = 3) => {
    try {
      return await createWithFallback(client, body)
    } catch (error) {
      if ((error.status === 429 || error.status === 403) && retries > 0) {
        console.log(`Rate limited during fallback, retrying in 5 seconds... (${retries} retries left)`)
        await new Promise(resolve => setTimeout(resolve, 5000))
        return makeRequest(retries - 1)
      }
      throw error
    }
  }

  try {
    const completion = await makeRequest()
    const content = completion.choices?.[0]?.message?.content || ""

    if (!content) {
      throw new Error("No content in AI response")
    }

    let parsed = null

    try {
      parsed = JSON.parse(content)
    } catch {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
        } catch {
          parsed = null
        }
      }
    }

    if (!parsed) {
      return { raw: content }
    }

    return {
      summary: parsed.summary || "",
      findings: parsed.findings || "",
      checklist: parsed.checklist || "",
    }
  } catch (error) {
    console.error("Image analysis error:", error)
    throw error
  }
}