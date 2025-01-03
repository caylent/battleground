import { TextModelId } from "./model.type";
import { textModels } from "./models";

export const getRequestCost = ({
  modelId,
  inputTokens,
  outputTokens,
}: {
  modelId: TextModelId;
  inputTokens: number;
  outputTokens: number;
}) => {
  const model = textModels.find((m) => m.id === modelId);
  if (!model) return NaN;
  if (!model.inputCostPerToken || !model.outputCostPerToken) return NaN;
  return model.inputCostPerToken * inputTokens + model.outputCostPerToken * outputTokens;
};
