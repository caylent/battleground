import { makeAssistantToolUI } from '@assistant-ui/react';
import { StatefulImage } from '../stateful-image';

export const ImageTool = makeAssistantToolUI<
  { prompt: string },
  { url: string }
>({
  toolName: 'image_generation',
  render: ({ status, result }) => {
    // Get the current URL origin in a safe, SSR-compatible way
    const origin = window.location.origin;

    const imageUrl = `${origin}/api/${result?.url}`;

    return <StatefulImage alt="Image" src={imageUrl} state={status} />;
  },
});
