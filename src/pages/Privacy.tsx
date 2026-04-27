import { Navbar } from "../components/layout/Navbar";

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground font-sans selection:bg-universe-highlight/30 transition-colors duration-300">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-2 text-universe-foreground">Privacy Policy</h1>
        <p className="text-universe-muted mb-12">Last updated: October 24, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8 text-universe-muted">
          <p>Your privacy is critically important to us. At ReRitee, we have a few fundamental principles:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We don’t ask you for personal information unless we truly need it.</li>
            <li>We don’t share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
            <li>We don’t store personal information on our servers unless required for the on-going operation of one of our services.</li>
          </ul>

          <section>
            <h3 className="text-universe-foreground font-bold text-xl mb-4">Data Collection</h3>
            <p>Like most website operators, ReRitee collects non-personally-identifying information of the sort that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request.</p>
          </section>
        </div>
      </main>
    </div>
  );
};
