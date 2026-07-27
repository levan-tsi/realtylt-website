import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "DMCA & Terms of Service",
  description:
    "Terms of use for realtylt.com, our DMCA copyright takedown process, how MLS listing data is handled, and our fair housing commitment.",
};

const UPDATED = "July 27, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-stone">{children}</div>
    </section>
  );
}

export default function DmcaTermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 lg:px-0">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-river">Legal</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
        DMCA &amp; Terms of Service
      </h1>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-stone">Last updated: {UPDATED}</p>

      <Section title="Acceptance of terms">
        <p>
          By using realtylt.com (the &ldquo;Site&rdquo;), operated by {SITE.legalName}{" "}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to these terms. If you do not agree,
          please do not use the Site.
        </p>
      </Section>

      <Section title="Use of the site">
        <p>
          The Site and its listing content are provided for consumers&rsquo; personal,
          non-commercial use to identify prospective properties they may be interested in
          purchasing or renting. You agree not to scrape, harvest, republish, or resell Site
          content; not to use the Site for any unlawful purpose; and not to interfere with its
          operation.
        </p>
      </Section>

      <Section title="Your account">
        <p>
          You can use most of this Site without an account. If you create one to save homes and
          searches, you are responsible for keeping your sign-in details to yourself and for what
          happens under your account. Tell us at {SITE.email} if you think someone else has access.
          You can ask us to delete your account at any time, and we may suspend or remove an account
          that is being used to break these terms.
        </p>
      </Section>

      <Section title="Contacting you">
        <p>
          When you submit a form, use the chat assistant, or otherwise give us your phone number or
          email, you are asking us to respond, and you agree we may reply by phone, text, or email
          about that inquiry. Message and data rates may apply and message frequency varies. Reply
          STOP to any text to stop receiving them. Agreeing to marketing messages is never a
          condition of buying or selling a home with us. How we handle that information is set out
          in our Privacy Policy.
        </p>
      </Section>

      <Section title="The chat assistant">
        <p>
          The chat assistant on this Site is automated. It can be wrong, it does not give legal,
          tax, financial, or appraisal advice, and nothing it says is an offer or a binding
          commitment by us. Please confirm anything that matters with a person before acting on it.
        </p>
      </Section>

      <Section title="Listing information; no warranty">
        <p>
          Property information is provided by One Key MLS and other sources, is deemed reliable but
          is <strong className="text-ink">not guaranteed accurate</strong>, and may change without
          notice. Nothing on the Site is a substitute for a professional inspection, appraisal,
          survey, or legal advice. Valuations and calculator results are estimates only and do not
          constitute an offer, appraisal, or lending commitment. THE SITE IS PROVIDED &ldquo;AS
          IS&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          The RealtyLT name, logo, site design, and original content are our property or used with
          permission. Photography credits for licensed images are maintained in our records. MLS
          content remains the property of its respective owners.
        </p>
      </Section>

      <Section title="DMCA copyright policy">
        <p>
          We respect the intellectual property of others. If you believe content on this Site
          infringes your copyright, send a written notice under the Digital Millennium Copyright
          Act (17 U.S.C. § 512) to our designated agent:
        </p>
        <p className="rounded-2xl bg-mist px-4 py-3 font-mono text-sm text-ink">
          DMCA Agent: {SITE.legalName}
          <br />
          {SITE.address.street}, {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
          <br />
          {SITE.email} · {SITE.phone}
        </p>
        <p>Your notice must include:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>identification of the copyrighted work claimed to be infringed;</li>
          <li>the URL or location of the allegedly infringing material;</li>
          <li>your name, address, telephone number, and email address;</li>
          <li>
            a statement that you have a good-faith belief the use is not authorized by the
            copyright owner, its agent, or the law;
          </li>
          <li>
            a statement, under penalty of perjury, that the information in your notice is accurate
            and that you are the copyright owner or authorized to act on the owner&rsquo;s behalf;
          </li>
          <li>your physical or electronic signature.</li>
        </ul>
        <p>
          We will remove or disable access to material identified in a valid notice and may
          terminate repeat infringers&rsquo; access. If you believe material was removed by mistake,
          you may submit a counter-notification with the elements required by § 512(g).
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, {SITE.legalName} is not liable for indirect,
          incidental, or consequential damages arising from use of the Site. Our total liability
          for any claim relating to the Site will not exceed one hundred U.S. dollars.
        </p>
      </Section>

      <Section title="Fair housing and equal opportunity">
        <p>
          We are committed to the letter and spirit of U.S. and New York fair housing law. All
          properties are offered without regard to race, color, religion, sex, disability, familial
          status, national origin, or any other protected class.
        </p>
      </Section>

      <Section title="Governing law; changes">
        <p>
          These terms are governed by the laws of the State of New York. We may update these terms
          by posting a revised version here; continued use of the Site after changes constitutes
          acceptance. Questions: {SITE.email}.
        </p>
      </Section>
    </article>
  );
}
