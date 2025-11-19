export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-4xl font-bold text-slate-800">Welcome to Lab 1</h1>
      <p className="text-xl text-slate-600">
        This is a public landing page. Anyone can see this.
      </p>
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <strong>Current Status:</strong> No Authentication implemented.
      </div>
    </div>
  );
}
