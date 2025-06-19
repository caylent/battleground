import configPromise from '@payload-config'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import { TextModelConfig } from '../model/model-configs'
import { TextModel } from '../model/model.type'

export interface PayloadTextModel {
  id: string
  name: string
  provider: string
  modelId: string
  region?: string
  inputCostPerToken?: number
  outputCostPerToken?: number
  inputModalities: string[]
  outputModalities: string[]
  systemPromptSupport: boolean
  isActive: boolean
  config: {
    systemPrompt?: string
    maxTokens: {
      min: number
      max: number
      default: number
      value: number
    }
    temperature: {
      min: number
      max: number
      default: number
      value: number
    }
    topP: {
      min: number
      max: number
      default: number
      value: number
    }
    reasoning: {
      enabled: boolean
      budgetTokens: {
        min: number
        max: number
        default: number
        value: number
      }
    }
  }
}

export async function getTextModelsFromPayload(): Promise<TextModel[]> {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    
    const result = await payload.find({
      collection: 'text-models',
      where: {
        isActive: {
          equals: true,
        },
      },
    })

    return result.docs.map((doc: any): TextModel => ({
      provider: doc.provider,
      id: doc.modelId,
      name: doc.name,
      region: doc.region,
      inputCostPerToken: doc.inputCostPerToken,
      outputCostPerToken: doc.outputCostPerToken,
      inputModalities: doc.inputModalities,
      outputModalities: doc.outputModalities,
      systemPromptSupport: doc.systemPromptSupport,
      config: doc.config as TextModelConfig,
    }))
  } catch (error) {
    console.error('Failed to fetch models from Payload CMS:', error)
    // Return empty array - fallback will be handled in models.ts
    return []
  }
}

export async function syncModelToPayload(model: TextModel): Promise<void> {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    
    // Check if model already exists
    const existing = await payload.find({
      collection: 'text-models',
      where: {
        modelId: {
          equals: model.id,
        },
      },
    })

    const modelData = {
      name: model.name,
      provider: model.provider,
      modelId: model.id,
      region: model.region,
      inputCostPerToken: model.inputCostPerToken,
      outputCostPerToken: model.outputCostPerToken,
      inputModalities: model.inputModalities,
      outputModalities: model.outputModalities,
      systemPromptSupport: model.systemPromptSupport,
      isActive: true,
      config: model.config,
    }

    if (existing.docs.length > 0) {
      // Update existing
      await payload.update({
        collection: 'text-models',
        id: existing.docs[0].id,
        data: modelData,
      })
    } else {
      // Create new
      await payload.create({
        collection: 'text-models',
        data: modelData,
      })
    }
  } catch (error) {
    console.error('Failed to sync model to Payload CMS:', error)
  }
}