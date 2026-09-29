import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-5xl md:text-6xl">
        Deze shot <em className="text-ember-soft">bestaat niet</em>
      </h1>
      <p className="mt-4 max-w-md text-mist">De pagina die je zoekt is verplaatst of heeft nooit bestaan.</p>
      <LinkButton href="/" className="mt-8">
        Terug naar home
      </LinkButton>
    </div>
  );
}
