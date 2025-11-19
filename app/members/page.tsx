import { auth } from "@/auth";

export default async function MembersPage() {
  const session = await auth();

  return (
    <div className="bg-white border p-8 rounded shadow-lg">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Access Granted</h1>
      <p className="mb-6 text-gray-600">
        Welcome to the private members area.
      </p>

      <div className="bg-slate-100 p-4 rounded border font-mono text-sm">
        <h3 className="font-bold text-slate-700 border-b border-slate-300 mb-2 pb-1">Current Session Data:</h3>
        <pre className="text-blue-700">{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}
