import { c as createOpenAICompatible } from "../_libs/ai-sdk__openai-compatible.mjs";
function createLovableAiGatewayProvider(apiKey) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey }
  });
}
export {
  createLovableAiGatewayProvider as c
};
