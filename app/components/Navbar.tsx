import Link from "next/link";
import { auth, signOut } from "@/auth"; // Import from our config

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-slate-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">Auth.js Lab 2</div>
        
        <div className="flex gap-4 items-center">
          <Link href="/" className="hover:text-blue-400">Home</Link>
          <Link href="/members" className="hover:text-blue-400">Members</Link>
          
          {session && session.user ? (
            <div className="flex gap-4 items-center border-l pl-4 border-slate-600">
              <span className="text-sm text-slate-300">Hi, {session.user.name}</span>
              {/* Server Action to Sign Out */}
              <form
                action={async () => {
                  "use server"
                  await signOut()
                }}
              >
                <button type="submit" className="bg-red-600 text-sm px-3 py-1 rounded hover:bg-red-700">
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <Link href="/api/auth/signin" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
