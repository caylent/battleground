import { BedrockAgentClient, ListPromptsCommand } from "@aws-sdk/client-bedrock-agent";

export const revalidate = 0;

const client = new BedrockAgentClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export async function GET() {
  // TODO: add pagination if needed
  const response = await client.send(new ListPromptsCommand({ maxResults: 100 }));
  return Response.json(response.promptSummaries);
}
