import { makeAssistantToolUI } from '@assistant-ui/react';
import type {
  ImageGenerationToolInput,
  ImageGenerationToolOutput,
} from '@/tools/image-tool';
import { StatefulImage } from '../stateful-image';

export const ImageTool = makeAssistantToolUI<
  ImageGenerationToolInput,
  ImageGenerationToolOutput
>({
  toolName: 'image_generation',
  render: ({ status, result }) => {
    return (
      <StatefulImage
        alt="Image"
        src={`/api/attachments?filename=${result?.fileName}`}
        state={status}
      />
    );
  },
});
