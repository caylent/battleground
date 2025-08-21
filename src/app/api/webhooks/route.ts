import type { UserJSON, WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

// this is a public endpoint that will be called by a Clerk webhook when a user is created
// it will attempt to submit the user information to a hubspot form
export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!(svix_id && svix_timestamp && svix_signature)) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response('Error occured', {
      status: 400,
    });
  }

  if (evt.type === 'user.created') {
    const user = payload.data as UserJSON;
    return submitHubspotForm(user);
  }

  return new Response('', { status: 200 });
}

function submitHubspotForm(user: UserJSON) {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formId = process.env.HUBSPOT_FORM_ID;

  if (!(formId || portalId)) {
    throw new Error(
      'Please add HUBSPOT_PORTAL_ID and HUBSPOT_FORM_ID from Hubspot to .env or .env.local'
    );
  }

  const primaryEmail = user.email_addresses.find(
    (email) => email.id === user.primary_email_address_id
  );

  // exclude users from the Caylent team
  if (primaryEmail?.email_address.endsWith('@caylent.com')) {
    return new Response('', { status: 200 });
  }

  const formData = {
    fields: [
      {
        objectTypeId: '0-1',
        name: 'email',
        value: primaryEmail?.email_address,
      },
      {
        objectTypeId: '0-1',
        name: 'firstname',
        value: user.first_name,
      },
      {
        objectTypeId: '0-1',
        name: 'lastname',
        value: user.last_name,
      },
    ],
  };

  return fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }
  );
}
