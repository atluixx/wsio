import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const planType = (body.planType || "starter").toLowerCase();
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

    if (secretKey && !secretKey.startsWith("sk_test_mock")) {
      const successUrl = `${appUrl}/dashboard?payment=success&plan=${planType}`;
      const cancelUrl = `${appUrl}/pricing?canceled=true`;

      const envPriceId = planType === "diamond" ? process.env.STRIPE_DIAMOND_PRICE_ID : process.env.STRIPE_STARTER_PRICE_ID;

      const params = new URLSearchParams({
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        "metadata[plan_type]": planType,
      });

      if (envPriceId && envPriceId.startsWith("price_")) {
        params.append("line_items[0][price]", envPriceId);
        params.append("line_items[0][quantity]", "1");
      } else {
        const unitAmount = planType === "diamond" ? "900" : "300";
        params.append("line_items[0][price_data][currency]", "eur");
        params.append("line_items[0][price_data][product_data][name]", `wsio ${planType.toUpperCase()} Subscription`);
        params.append("line_items[0][price_data][product_data][tax_code]", "txcd_10103100");
        params.append("line_items[0][price_data][unit_amount]", unitAmount);
        params.append("line_items[0][price_data][recurring][interval]", "month");
        params.append("line_items[0][quantity]", "1");
      }

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
      url: `${appUrl}/dashboard?payment=success&plan=${planType}&mock=true`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 });
  }
}
