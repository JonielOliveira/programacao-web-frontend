import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Olá, mundo!</h1>
        <Button>Me clique</Button>
      </div>
    </main>
  );
}
