import { getTextModelsFromPayload } from '../services/payload-models'
import { TextModel } from './model.type'
import { textModels as staticTextModels } from './models-static'

// Cache for models to avoid frequent API calls
let modelsCache: TextModel[] | null = null
let cacheExpiry: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getTextModels(): Promise<TextModel[]> {
  // Check cache first
  if (modelsCache && Date.now() < cacheExpiry) {
    return modelsCache
  }

  try {
    // Try to fetch from Payload CMS
    const dynamicModels = await getTextModelsFromPayload()
    
    if (dynamicModels.length > 0) {
      // Use dynamic models from CMS
      modelsCache = dynamicModels
      cacheExpiry = Date.now() + CACHE_DURATION
      return dynamicModels
    } else {
      // Fallback to static models if no dynamic models found
      console.log('No dynamic models found, using static models as fallback')
      modelsCache = staticTextModels
      cacheExpiry = Date.now() + CACHE_DURATION
      return staticTextModels
    }
  } catch (error) {
    console.error('Error fetching dynamic models, using static fallback:', error)
    // Fallback to static models on error
    modelsCache = staticTextModels
    cacheExpiry = Date.now() + CACHE_DURATION
    return staticTextModels
  }
}

// Synchronous version for compatibility - will use cached version or static fallback
export const textModels: TextModel[] = staticTextModels

// Function to refresh the cache
export function refreshModelsCache(): void {
  modelsCache = null
  cacheExpiry = 0
}

// Function to get cached models synchronously
export function getCachedTextModels(): TextModel[] {
  return modelsCache || staticTextModels
}