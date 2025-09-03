import { textModels } from './models';

export const getRequestCost = ({
  modelId,
  inputTokens,
  outputTokens,
}: {
  modelId: string;
  inputTokens: number;
  outputTokens: number;
}) => {
  const model = textModels.find((m) => m.id === modelId);
  if (!model) return Number.NaN;
  if (!(model.inputCostPerToken && model.outputCostPerToken)) return Number.NaN;
  return (
    model.inputCostPerToken * inputTokens +
    model.outputCostPerToken * outputTokens
  );
};
