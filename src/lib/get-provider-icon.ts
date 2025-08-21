export const getProviderIcon = (provider?: string): string => {
  switch (provider) {
    case 'Anthropic':
      return '/anthropic.png';
    case 'Cohere':
      return '/cohere.svg';
    case 'Amazon':
      return '/aws.svg';
    case 'Meta':
      return '/meta.svg';
    case 'Deepseek':
      return '/deepseek.svg';
    case 'Mistral AI':
      return '/mistral.svg';
    case 'Stability AI':
      return '/stability.png';
    case 'Nvidia':
      return '/nvidia.svg';
    case 'OpenAI':
      return '/openai.webp';
    case 'AI21':
      return '/ai21.png';
    case 'Luma Labs':
      return '/luma-labs.svg';
    case 'Writer':
      return '/writer.svg';
    default:
      return '/default.svg';
  }
};
