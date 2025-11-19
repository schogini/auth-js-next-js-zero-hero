import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Auth.js Labs</div>
        <div className="space-x-6">
          <Link href="/" className="hover:text-blue-400 transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-blue-400 transition">
            About
          </Link>
          <Link 
            href="/members" 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
          >
            Members Only
          </Link>
        </div>
      </div>
    </nav>
  );
}
