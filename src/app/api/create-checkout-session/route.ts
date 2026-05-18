import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { verifyOrigin } from "@/lib/csrf";

const CHECKOUT_RATE_MAX = 5;
const CHECKOUT_RATE_WINDOW_MS = 60_000;
const checkoutCounters = new Map<string, { count: number; resetAt: number }>();
function checkCheckoutRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = checkoutCounters.get(ip);
  if (!entry || entry.resetAt < now) {
    checkoutCounters.set(ip, { count: 1, resetAt: now + CHECKOUT_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= CHECKOUT_RATE_MAX) return false;
  entry.count++;
  return true;
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

// AUDIT-005: Zod validation schema
const CheckoutSchema = z.object({
  priceId: z.string().trim().min(1, "Price ID is required").regex(/^price_/, "Invalid Stripe price ID"),
  mode: z.enum(["subscription", "payment"]).default("subscription"),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "local";
  if (!checkCheckoutRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests — try again in a minute" }, { status: 429 });
  }

  // AUDIT-008: CSRF origin check
  const csrfError = verifyOrigin(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }

  try {
    const stripe = getStripe();
    const rawBody = await request.json();

    const parsed = CheckoutSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const { priceId, mode } = parsed.data;

    const session = await getServerSession();

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: mode,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || request.headers.get("origin")}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || request.headers.get("origin")}/pricing`,
      customer_email: session?.user?.email || undefined,
      metadata: {
        userId: (session?.user as Record<string, unknown> | undefined)?.id as string || "",
        priceId: priceId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}