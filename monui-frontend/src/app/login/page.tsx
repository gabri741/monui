import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { Toaster } from "sonner"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Toaster position="top-center" richColors closeButton />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-2xl font-bold mb-6 text-center">M O N U I</h1>
        <LoginForm />
      </div>
    </div>
  )
}
