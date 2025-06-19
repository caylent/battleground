// This file now exports dynamic models from Payload CMS with static fallback
export { getCachedTextModels, getTextModels, refreshModelsCache, textModels } from './models-dynamic'

// For backward compatibility, also export the original static models
export { textModels as staticTextModels } from './models-static'

// Export types and other model-related exports
export type { ImageModel, TextModel, VideoModel } from './model.type'

// Re-export image and video models from the static file for now
// (these are not yet implemented in the dynamic system)
export { imageModels, videoModels } from './models-static'
