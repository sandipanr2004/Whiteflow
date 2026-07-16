import { Cpu, Lock, Sparkles, Zap } from 'lucide-react'

export function Features() {
    return (
        <section className="overflow-hidden py-16 md:py-32 bg-background text-foreground">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">


                <div className="relative mx-auto flex flex-wrap justify-center gap-6 sm:gap-12">
                    <div className="flex items-center gap-2">
                        <Zap className="size-5 text-[var(--color-yellow)]" />
                        <h3 className="text-base font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-anton)' }}>Faaast</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Cpu className="size-5 text-[var(--color-yellow)]" />
                        <h3 className="text-base font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-anton)' }}>Powerful</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock className="size-5 text-[var(--color-yellow)]" />
                        <h3 className="text-base font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-anton)' }}>Security</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-[var(--color-yellow)]" />
                        <h3 className="text-base font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-anton)' }}>AI Powered</h3>
                    </div>
                </div>
            </div>
        </section>
    )
}
