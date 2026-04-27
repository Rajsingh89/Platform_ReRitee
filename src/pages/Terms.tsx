import { Navbar } from "../components/layout/Navbar";

export const Terms = () => {
  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground font-sans selection:bg-universe-highlight/30 transition-colors duration-300">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-2 text-universe-foreground">Terms of Service</h1>
        <p className="text-universe-muted mb-12">Last updated: October 24, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8 text-universe-muted">
          <section>
            <h3 className="text-universe-foreground font-bold text-xl mb-4">1. Acceptance of Terms</h3>
            <p>By accessing and using ReRitee, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h3 className="text-universe-foreground font-bold text-xl mb-4">2. Content Ownership</h3>
            <p>You retain all rights and ownership of your content. ReRitee does not claim any ownership rights in your text, files, images, photos, video, sounds, musical works, works of authorship, or any other materials.</p>
          </section>

          <section>
            <h3 className="text-universe-foreground font-bold text-xl mb-4">3. User Conduct</h3>
            <p>You agree not to use the service to post or transmit any material which is or may be infringing on a third party's rights, including intellectual property rights, or which is illegal, offensive, or defamatory.</p>
          </section>
        </div>
      </main>
    </div>
  );
};
