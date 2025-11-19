"use client"
 
import { useFormState } from "react-dom"
import { authenticate, authenticateGithub } from "@/lib/actions"
 
export default function SignInPage() {
  // useFormState allows us to see the error message returned by the server action
  const [errorMessage, dispatch] = useFormState(authenticate, undefined)
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Sign in to Lab 6
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            This is a custom Tailwind page
          </p>
        </div>
 
        {/* GitHub Button */}
        <form action={authenticateGithub}>
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 rounded-md bg-[#24292F] px-4 py-3 text-sm font-semibold text-white hover:bg-[#24292F]/90 focus:outline-none focus:ring-2 focus:ring-[#24292F]/50 focus:ring-offset-2"
            >
              {/* Simple Github Icon SVG */}
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Sign in with GitHub
            </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Credentials Form */}
        <form action={dispatch} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                name="email"
                type="email"
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="admin@example.com"
              />
            </div>
          </div>
 
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                name="password"
                type="password"
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="password"
              />
            </div>
          </div>
 
          {/* Error Message Display */}
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && (
              <p className="text-sm text-red-500 font-bold">
                ❌ {errorMessage}
              </p>
            )}
          </div>
 
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in with Credentials
          </button>
        </form>
      </div>
    </div>
  )
}
