import { AppShell } from "@/components/letty/app-shell"

export default function Page() {
  return (
    // Changed "p-4" to "p-0 md:p-4"
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted p-0 md:p-4">
      <AppShell />
    </div>
  )
}