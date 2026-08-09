// TEMPORARY — remove after diagnosing the Resend env var mismatch.
// Reports shape (not full value) of sensitive env vars so we can compare
// what Vercel's runtime actually has against what's expected, without
// exposing the full secret over the network.
export async function GET() {
  const key = process.env.RESEND_API_KEY ?? "";
  const from = process.env.RESEND_FROM ?? "";

  return Response.json({
    RESEND_API_KEY: {
      present: !!process.env.RESEND_API_KEY,
      length: key.length,
      prefix: key.slice(0, 6),
      suffix: key.slice(-4),
    },
    RESEND_FROM: {
      present: !!process.env.RESEND_FROM,
      value: from,
    },
  });
}
