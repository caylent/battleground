import { CollectionConfig } from 'payload'

export const TextModels: CollectionConfig = {
  slug: 'text-models',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      options: [
        { label: 'Amazon', value: 'Amazon' },
        { label: 'Anthropic', value: 'Anthropic' },
        { label: 'Deepseek', value: 'Deepseek' },
        { label: 'Cohere', value: 'Cohere' },
        { label: 'Meta', value: 'Meta' },
        { label: 'Mistral', value: 'Mistral' },
        { label: 'Nvidia', value: 'Nvidia' },
        { label: 'OpenAI', value: 'OpenAI' },
        { label: 'AI21', value: 'AI21' },
        { label: 'Writer', value: 'Writer' },
      ],
    },
    {
      name: 'modelId',
      type: 'text',
      required: true,
      label: 'Model ID',
    },
    {
      name: 'region',
      type: 'text',
      label: 'Region',
      admin: {
        description: 'Optional region specification (e.g., us-east-1, us-west-2)',
      },
    },
    {
      name: 'inputCostPerToken',
      type: 'number',
      label: 'Input Cost Per Token',
      admin: {
        description: 'Cost per input token in dollars',
      },
    },
    {
      name: 'outputCostPerToken',
      type: 'number',
      label: 'Output Cost Per Token',
      admin: {
        description: 'Cost per output token in dollars',
      },
    },
    {
      name: 'inputModalities',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'TEXT', value: 'TEXT' },
        { label: 'IMAGE', value: 'IMAGE' },
        { label: 'VIDEO', value: 'VIDEO' },
        { label: 'AUDIO', value: 'AUDIO' },
      ],
    },
    {
      name: 'outputModalities',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'TEXT', value: 'TEXT' },
        { label: 'IMAGE', value: 'IMAGE' },
        { label: 'VIDEO', value: 'VIDEO' },
        { label: 'AUDIO', value: 'AUDIO' },
      ],
    },
    {
      name: 'systemPromptSupport',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this model is active and available for use',
      },
    },
    // Model configuration fields
    {
      name: 'config',
      type: 'group',
      fields: [
        {
          name: 'systemPrompt',
          type: 'text',
          label: 'Default System Prompt',
        },
        {
          name: 'maxTokens',
          type: 'group',
          fields: [
            {
              name: 'min',
              type: 'number',
              defaultValue: 1,
            },
            {
              name: 'max',
              type: 'number',
              defaultValue: 4096,
            },
            {
              name: 'default',
              type: 'number',
              defaultValue: 1024,
            },
            {
              name: 'value',
              type: 'number',
              defaultValue: 1024,
            },
          ],
        },
        {
          name: 'temperature',
          type: 'group',
          fields: [
            {
              name: 'min',
              type: 'number',
              defaultValue: 0,
            },
            {
              name: 'max',
              type: 'number',
              defaultValue: 1,
            },
            {
              name: 'default',
              type: 'number',
              defaultValue: 0.7,
            },
            {
              name: 'value',
              type: 'number',
              defaultValue: 0.7,
            },
          ],
        },
        {
          name: 'topP',
          type: 'group',
          fields: [
            {
              name: 'min',
              type: 'number',
              defaultValue: 0,
            },
            {
              name: 'max',
              type: 'number',
              defaultValue: 1,
            },
            {
              name: 'default',
              type: 'number',
              defaultValue: 0.9,
            },
            {
              name: 'value',
              type: 'number',
              defaultValue: 0.9,
            },
          ],
        },
        {
          name: 'reasoning',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'budgetTokens',
              type: 'group',
              fields: [
                {
                  name: 'min',
                  type: 'number',
                  defaultValue: 0,
                },
                {
                  name: 'max',
                  type: 'number',
                  defaultValue: 4096,
                },
                {
                  name: 'default',
                  type: 'number',
                  defaultValue: 1024,
                },
                {
                  name: 'value',
                  type: 'number',
                  defaultValue: 1024,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}