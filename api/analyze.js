import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { analyzeReviews, analyzeImage } from '../src/lib/ai.js'
import formidable from 'formidable'
import fs from 'fs/promises'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const contentType = req.headers['content-type'] || ''
    console.log('Content-Type:', contentType)

    let reviews = null
    let imageData = null
    let context = ''

    // Handle multipart file upload
    if (contentType.includes('multipart/form-data')) {
      const form = formidable({ multiples: false })
      const [fields, files] = await form.parse(req)

      context = fields.context?.[0] || ''
      const uploadedFile = files.file?.[0]

      if (uploadedFile) {
        const buffer = await fs.readFile(uploadedFile.filepath)
        imageData = buffer.toString('base64')
        console.log('Image received, size:', imageData.length)
      }
    } else {
      // Handle JSON input
      const body = req.body || {}
      reviews = body.reviews
      context = body.context || ''
    }

    // Validation
    if (!reviews && !imageData) {
      return res.status(400).json({
        error: 'Missing input: provide "reviews" or upload an image',
      })
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return res.status(500).json({
        error: 'API key not configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY in environment variables.',
      })
    }

    console.log('API key available:', apiKey ? 'SET' : 'NOT SET')

    // Call AI functions
    let insight
    if (reviews) {
      console.log('Analyzing reviews...')
      insight = await analyzeReviews(apiKey, reviews)
    } else {
      console.log('Analyzing image...')
      insight = await analyzeImage(apiKey, imageData, context)
    }

    return res.status(200).json(insight)
  } catch (error) {
    console.error('API ERROR:', error)

    let errorMessage = error.message || 'Internal server error'
    let statusCode = error.status || 500

    if (error.status === 429 || error.status === 403) {
      errorMessage = 'Rate limit exceeded. Please try again in a few minutes.'
      statusCode = error.status
    }

    return res.status(statusCode).json({
      error: errorMessage,
    })
  }
}
