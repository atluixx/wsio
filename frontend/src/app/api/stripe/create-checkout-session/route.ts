import { NextResponse } from "next/server";

const PRICE_IDS: Record<string, string> = {
  starter: "price_1U4kYRRX4Fmw6LMasPdixrK5",
  diamond: "price_1U4kYyRX4Fmw6LMam5E8B9kl",
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const planType = (body.planType || "starter").toLowerCase();
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

    if (secretKey && !secretKey.startsWith("sk_test_mock")) {
      const priceId = PRICE_IDS[planType] || PRICE_IDS["starter"];
      const successUrl = `${appUrl}/dashboard?payment=success&plan=${planType}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${appUrl}/pricing?canceled=true`;

      const params = new URLSearchParams({
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "metadata[plan_type]": planType,
      });

      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        return NextResponse.json({ url: data.url });
      } else if (data.error?.message) {
        return NextResponse.json({ error: data.error.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      url: `${appUrl}/dashboard?payment=success&plan=${planType}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 });
  }
}
