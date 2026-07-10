import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How RealtyLT collects, uses, and protects your information.",
};

const UPDATED = "July 10, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-stone">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 lg:px-0">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-river">Legal</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">Privacy Policy</h1>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-stone">Last updated: {UPDATED}</p>

      <Section title="Who we are">
        <p>
          This website is operated by {SITE.legalName} (&ldquo;RealtyLT&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;), a real estate practice located at {SITE.address.street},{" "}
          {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}. You can reach us
          at {SITE.phone} or {SITE.email}. {SITE.disclaimer}
        </p>
      </Section>

      <Section title="Information we collect">
        <p>
          <strong className="text-ink">Information you give us.</strong> When you submit a contact,
          home-value, cash-offer, lender-connect, or listing-alert form, we collect what you enter:
          typically your name, email address, phone number, property address, the reason for your
          inquiry, and your message.
        </p>
        <p>
          <strong className="text-ink">Information stored on your device.</strong> Saved homes and
          saved searches are stored in your browser&rsquo;s local storage on your own device. They
          are not transmitted to us unless you explicitly request email alerts.
        </p>
        <p>
          <strong className="text-ink">Technical information.</strong> Like most websites, our
          hosting infrastructure records standard server logs (IP address, browser type, pages
          requested, timestamps) for security and operations.
        </p>
      </Section>

      <Section title="How we use your information">
        <p>We use the information you submit to:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>respond to your inquiry and provide the service you asked for;</li>
          <li>prepare valuations, cash offers, and property information you request;</li>
          <li>send listing alerts you have opted into;</li>
          <li>keep records our brokerage and licensing obligations require.</li>
        </ul>
        <p>
          Form submissions are delivered to our customer relationship management (CRM) system at
          app.realtylt.com so we can follow up. We do not sell your personal information, and we do
          not share it with third parties for their own marketing.
        </p>
      </Section>

      <Section title="Listing data">
        <p>
          Listing content on this site is provided by One Key MLS via authorized data feeds, is
          deemed reliable but not guaranteed accurate, and is displayed for consumers&rsquo;
          personal, non-commercial use to identify prospective properties. Listing data is subject
          to the MLS&rsquo;s own terms.
        </p>
      </Section>

      <Section title="Cookies and analytics">
        <p>
          This site works without advertising cookies. If we add analytics, it will be configured
          to avoid collecting more than aggregate usage information, and this policy will be
          updated.
        </p>
      </Section>

      <Section title="Data retention and your choices">
        <p>
          We keep inquiry records as long as needed to serve you and to meet legal and brokerage
          record-keeping requirements. You may ask us at any time to correct or delete the contact
          information you submitted by emailing {SITE.email}. You can clear device-saved favorites
          and searches yourself by clearing your browser&rsquo;s site data.
        </p>
      </Section>

      <Section title="Children">
        <p>
          This site is intended for adults. We do not knowingly collect personal information from
          children under 13.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we change this policy, we will post the updated version here with a new &ldquo;last
          updated&rdquo; date. Material changes will be noted prominently.
        </p>
      </Section>

      <Section title="Fair housing">
        <p>
          We comply with the federal Fair Housing Act and New York State fair housing law. See the
          Fair Housing Notice linked at the top of every page.
        </p>
      </Section>
    </article>
  );
}
