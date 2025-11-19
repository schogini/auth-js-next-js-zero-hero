import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();

  // 1. Check if logged in
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // 2. Check for Role
  if (session.user.role !== "admin") {
    return (
      <div className="p-8 bg-red-50 text-red-800 border border-red-200 rounded">
        <h1 className="text-3xl font-bold">403 Forbidden</h1>
        <p>You are logged in as a <strong>{session.user.role}</strong>.</p>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-purple-50 border border-purple-200 rounded">
      <h1 className="text-3xl font-bold text-purple-900 mb-4">Admin Dashboard</h1>
      <p className="text-lg">Welcome, Master Administrator.</p>
      <div className="mt-4 p-4 bg-white rounded shadow">
        <p className="text-blue-700">Only users with <code>role: 'admin'</code> can see this.</p>
      </div>
    </div>
  );
}