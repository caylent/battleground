import { SparklesIcon } from 'lucide-react';
import { Amazon } from './amazon';
import { Anthropic } from './anthropic';
import { Cohere } from './cohere';
import { Deepseek } from './deepseek';
import { Meta } from './meta';
import { Mistral } from './mistral';
import { OpenAI } from './openai';
import { Writer } from './writer';

export const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'OpenAI':
      return <OpenAI className="fill-black dark:fill-white" />;
    case 'Amazon':
      return <Amazon className="fill-black dark:fill-white" />;
    case 'Meta':
      return <Meta />;
    case 'Anthropic':
      return <Anthropic className="fill-black dark:fill-white" />;
    case 'Deepseek':
      return <Deepseek />;
    case 'Mistral':
      return <Mistral />;
    case 'Writer':
      return <Writer className="fill-black" />;
    case 'Cohere':
      return <Cohere />;
    default:
      return <SparklesIcon />;
  }
};
