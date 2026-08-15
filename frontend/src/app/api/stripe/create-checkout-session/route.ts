import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const planType = (body.planType || "starter").toLowerCase();
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

    if (secretKey) {
      const priceAmount = planType === "diamond" ? "1200" : "400";
      const successUrl = `${appUrl}/dashboard?payment=success&plan=${planType}`;
      const cancelUrl = `${appUrl}/pricing?canceled=true`;

      const params = new URLSearchParams({
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": `wsio ${planType.toUpperCase()} Plan`,
        "line_items[0][price_data][unit_amount]": priceAmount,
        "line_items[0][price_data][recurring][interval]": "month",
        "line_items[0][quantity]": "1",
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

    // Mock fallback URL for sandbox / local testing
    return NextResponse.json({
      url: `${appUrl}/dashboard?payment=success&plan=${planType}&mock=true`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 });
  }
}
