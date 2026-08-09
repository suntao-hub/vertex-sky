export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-9 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-2xl">
          ✉️
        </div>
        <h1 className="mb-2 text-xl font-semibold text-slate-900">Check your email</h1>
        <p className="mb-6 text-sm leading-relaxed text-slate-500">
          A sign-in link is on its way. Click it to access Vertex Sky. The link expires shortly.
        </p>
        <a href="/sign-in" className="text-sm font-medium text-sky-700 hover:text-sky-800">
          ← Back to sign in
        </a>
      </div>
    </div>
  );
}
