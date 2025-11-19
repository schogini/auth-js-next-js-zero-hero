export default function MembersPage() {
  return (
    <div className="bg-slate-100 p-8 rounded-lg border border-slate-200">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Members Only Area
      </h1>
      <p className="text-lg mb-4">
        If you are reading this, you have access to our secret content!
      </p>
      <div className="bg-white p-4 rounded shadow text-blue-700">
        <h2 className="font-bold">Secret Data:</h2>
        <ul className="list-disc list-inside mt-2">
          <li>User ID: ???</li>
          <li>Session Token: ???</li>
        </ul>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        (In Lab 1, this page is currently unsecured and visible to everyone.)
      </p>
    </div>
  );
}
