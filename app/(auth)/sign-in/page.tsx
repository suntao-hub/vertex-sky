import Link from "next/link";
import { signIn } from "@/lib/auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-9 shadow-sm">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-sm font-bold text-white">
            VS
          </div>
          <span className="text-lg font-semibold text-slate-900">Vertex Sky</span>
        </Link>

        <h1 className="mb-1 text-xl font-semibold text-slate-900">Sign in</h1>
        <p className="mb-7 text-sm text-slate-500">
          Enter your email — we&apos;ll send you a magic link.
        </p>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            That email isn&apos;t authorized, or the link expired. Try again.
          </p>
        )}

        <form
          action={async (formData: FormData) => {
            "use server";
            await signIn("resend", { email: formData.get("email"), redirectTo: "/sites" });
          }}
        >
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Email address</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="mb-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Send magic link
          </button>
        </form>
      </div>
    </div>
  );
}
