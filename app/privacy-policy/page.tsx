import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What RealtyLT collects when you contact us, chat, or save homes on this site, who processes it, the advertising and mapping cookies involved, and how to have your information removed.",
};

const UPDATED = "August 26, 2026";

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
          <strong className="text-ink">Saved homes and saved searches.</strong> If you are not
          signed in, these stay in your own browser&rsquo;s storage on your device. If you create an
          account and sign in, they are saved to your account on our servers so they follow you
          between devices, and we can see them.
        </p>
        <p>
          <strong className="text-ink">Account information.</strong> If you create an account, we
          store your email address and the sign-in records needed to keep the account secure.
        </p>
        <p>
          <strong className="text-ink">Chat assistant conversations.</strong> Messages you send to
          the chat assistant, and its replies, are processed and stored so we can answer you and
          follow up. If you give your name, phone number, or email in the chat, that is stored with
          the conversation and reaches us the same way a form submission does.
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

      <Section title="Cookies, advertising and analytics">
        <p>
          <strong className="text-ink">Google Ads.</strong> This site loads Google&rsquo;s tag
          (gtag.js) so we can measure which advertising brings people here. When you complete an
          action such as submitting a form or tapping our phone number, a conversion event is sent
          to Google. Google may set and read cookies or similar identifiers on your device for this,
          and may use that data under its own privacy policy. We do not receive a list of who you
          are from Google; we see counts and campaign performance.
        </p>
        <p>
          <strong className="text-ink">Site analytics (PostHog).</strong> We use PostHog to
          understand how the site is used: which pages people visit, what they click, and session
          replays that show how a visit unfolded. Anything you type into a form is masked in
          replays before it ever leaves your browser. This data is collected under our own
          first-party setup, is not shared with advertisers, and is used only to make the site
          work better.
        </p>
        <p>
          <strong className="text-ink">Google Maps.</strong> Pages with a map load Google Maps,
          which contacts Google&rsquo;s servers and is covered by Google&rsquo;s terms and privacy
          policy.
        </p>
        <p>
          <strong className="text-ink">Your controls.</strong> You can block or clear cookies in
          your browser settings, use a private window, or opt out of personalised Google advertising
          through Google&rsquo;s own ad settings. The site works without them.
        </p>
      </Section>

      <Section title="Who else handles your information">
        <p>
          We use a small number of service providers to run the site. They process information on
          our behalf, under our instructions, and not for their own marketing:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>our website hosting provider, which serves these pages and keeps server logs;</li>
          <li>
            our database and account provider, which stores form submissions, accounts, and saved
            homes and searches;
          </li>
          <li>
            our automation provider, which carries chat messages and routes new inquiries to us;
          </li>
          <li>Google, for the mapping and advertising measurement described above;</li>
          <li>our CRM at app.realtylt.com, where our team works your inquiry.</li>
        </ul>
        <p>
          We may also disclose information where the law requires it, or where it is necessary to
          establish or defend a legal claim.
        </p>
      </Section>

      <Section title="Calls and text messages">
        <p>
          If you give us your phone number, you are asking us to get back to you, and we may call or
          text you about your inquiry. We may also send you updates you asked for, such as listing
          alerts. Message and data rates may apply, message frequency varies, and consent to
          marketing messages is never a condition of buying or selling a home with us. Reply STOP to
          any text to stop receiving them, or HELP for help. You can also ask us to stop at{" "}
          {SITE.email} or {SITE.phone}.
        </p>
      </Section>

      <Section title="Data retention and your choices">
        <p>
          We keep inquiry records as long as needed to serve you and to meet legal and brokerage
          record-keeping requirements. New York requires real estate records to be kept for three
          years, so we may need to retain a record of a transaction even after you ask us to stop
          contacting you.
        </p>
        <p>
          You may ask us at any time to see, correct, or delete the contact information you
          submitted, by emailing {SITE.email}. If you have an account, ask us and we will delete it
          along with the homes and searches saved to it. You can clear favorites and searches saved
          on your own device by clearing your browser&rsquo;s site data.
        </p>
      </Section>

      <Section title="How we protect information">
        <p>
          The site is served over HTTPS, form submissions travel encrypted, and access to inquiry
          records is limited to our team. No website can promise perfect security, and we will not
          pretend otherwise, but if a breach affecting your information happens we will notify you
          as New York law requires.
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
