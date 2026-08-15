// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await verifyClerkRequest(request);
    if (!event) {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const {
          id,
          email_addresses,
          primary_email_address_id,
          first_name,
          last_name,
          username,
          image_url,
        } = event.data;

        // Resolve primary email (handles Google OAuth email payloads)
        const primaryEmailObj = email_addresses?.find(
          (e: any) => e.id === primary_email_address_id
        );
        const email =
          primaryEmailObj?.email_address ??
          email_addresses?.[0]?.email_address ??
          "";

        // Handle Google OAuth names (fallback to username or Email prefix)
        const fullName = `${first_name ?? ""} ${last_name ?? ""}`.trim();
        const name =
          fullName ||
          username ||
          (email ? email.split("@")[0] : "Google User");

        // Strip trailing slash from issuer domain to prevent tokenIdentifier mismatch
        const rawIssuer =
          process.env.CLERK_JWT_ISSUER_DOMAIN! ||
          `https://${process.env.CLERK_HOSTNAME}`;
        const cleanIssuer = rawIssuer.replace(/\/$/, "");
        const tokenIdentifier = `${cleanIssuer}|${id}`;

        await ctx.runMutation(internal.users.upsertFromWebhook, {
          clerkUserId: id,
          tokenIdentifier,
          name,
          email,
        });
        break;
      }

      case "user.deleted": {
        const { id } = event.data;
        if (id) {
          await ctx.runMutation(internal.users.deleteFromWebhook, {
            clerkUserId: id,
          });
        }
        break;
      }
    }

    return new Response(null, { status: 200 });
  }),
});

async function verifyClerkRequest(req: Request) {
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) return null;

  const payload = await req.text();
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) return null;

  const wh = new Webhook(webhookSecret);
  try {
    return wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as any;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return null;
  }
}

export default http;