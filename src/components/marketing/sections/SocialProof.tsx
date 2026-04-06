import { ScrollReveal } from '@/components/marketing/ScrollReveal';

export function SocialProof() {
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
            <div>
              <p className="text-2xl font-semibold text-foreground font-[family-name:var(--font-display)]">1,200+</p>
              <p className="text-xs text-muted-foreground mt-0.5">freelancers &amp; teams</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-muted-foreground/15" />
            <div>
              <p className="text-2xl font-semibold text-foreground font-[family-name:var(--font-display)]">45,000+</p>
              <p className="text-xs text-muted-foreground mt-0.5">deadlines tracked</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-muted-foreground/15" />
            <div>
              <p className="text-2xl font-semibold text-foreground font-[family-name:var(--font-display)]">4.9/5</p>
              <p className="text-xs text-muted-foreground mt-0.5">rated by freelancers who switched</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
