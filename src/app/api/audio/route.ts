import {
  PollyClient,
  SynthesizeSpeechCommand,
  type VoiceId,
} from '@aws-sdk/client-polly';
import { NextResponse } from 'next/server';

// Hard coded to us-east-1 until generative vocies are available in other regions
const pollyClient = new PollyClient({
  region: 'us-east-1',
});

export async function POST(req: Request) {
  const { message, voiceId } = (await req.json()) as {
    voiceId: VoiceId;
    message: string;
  };

  try {
    const pollyRes = await pollyClient.send(
      new SynthesizeSpeechCommand({
        VoiceId: voiceId,
        Text: message,
        Engine: 'generative',
        OutputFormat: 'mp3',
        TextType: 'text',
      })
    );

    return new NextResponse(pollyRes.AudioStream?.transformToWebStream(), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      { status: err.httpStatusCode }
    );
  }
}
