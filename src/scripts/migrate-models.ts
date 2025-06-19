#!/usr/bin/env npx ts-node

import configPromise from '@payload-config'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import { textModels } from '../lib/model/models-static'

async function migrateModels() {
  console.log('Starting model migration to Payload CMS...')

  try {
    const payload = await getPayloadHMR({ config: configPromise })
    
    let created = 0
    let updated = 0
    let failed = 0

    for (const model of textModels) {
      try {
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
          updated++
          console.log(`✓ Updated: ${model.name}`)
        } else {
          // Create new
          await payload.create({
            collection: 'text-models',
            data: modelData,
          })
          created++
          console.log(`✓ Created: ${model.name}`)
        }
      } catch (error) {
        failed++
        console.error(`✗ Failed to migrate ${model.name}:`, error)
      }
    }

    console.log('\n--- Migration Summary ---')
    console.log(`Created: ${created}`)
    console.log(`Updated: ${updated}`)
    console.log(`Failed: ${failed}`)
    console.log(`Total processed: ${textModels.length}`)
    
    if (failed === 0) {
      console.log('✅ Migration completed successfully!')
    } else {
      console.log('⚠️  Migration completed with some failures.')
    }

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

// Run migration if called directly
if (require.main === module) {
  migrateModels()
}

export { migrateModels }
