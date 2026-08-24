"use client";

import { useId, useState } from "react";
import { PRESS } from "@/components/ui/Button";
import { LeadForm } from "./LeadForm";
import { LeadSheet } from "./LeadSheet";

/**
 * The "send it in writing instead" door on /connect.
 *
 * THE GAP IT CLOSES. /connect's body offered one way in: the Gmail booking grid. A visitor who
 * does not want to pick a slot out of someone else's calendar got a phone number, an email address
 * and a scroll to the footer. The owner asked for a popup form as the equal alternative, and the
 * page's own copy was already inviting it — "Would rather not pick a slot? Call or text and we'll
 * find a time" names the moment and then does not offer a control.
 *
 * BUILT OUT OF TWO THINGS THAT ALREADY EXISTED, deliberately.
 *
 *  · LeadSheet is the listing pages' modal shell, lifted out of ListingLeadCTAs so both callers
 *    share one. Focus trap, Escape, focus restored to this button on close, body-scroll lock,
 *    backdrop-mousedown to dismiss, portalled to <body>. Centred, not origin-aware: a modal is
 *    anchored to the viewport, not to its trigger. Enter is opacity + scale(0.98) over 300ms on
 *    the site's ease-out; the backdrop fades in 200ms, so the surface arrives after the dimming
 *    starts rather than with it.
 *
 *  · LeadForm is the SAME component the footer runs. That is the whole point of doing it this way:
 *    the consent contract is not re-implemented here, so it cannot drift from the one the owner
 *    decided twice. One required box, validated in JavaScript, no `required` attribute on the
 *    input, a visible role="alert" error in the place the form already shows errors, and the box
 *    scrolled into view and focused when it is the reason the submit failed. If that contract ever
 *    changes it changes in one file, and this modal changes with it.
 *
 * redirectOnSuccess is off. LeadForm's own note gives the rule: a redirect is wrong for a form
 * someone opened mid-page, because navigating away to say "thanks" loses their place for our
 * convenience. The sheet shows its success panel and the visitor closes it when they are ready.
 */
export function ConnectFormModal() {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-ink px-5 text-sm font-bold uppercase tracking-[0.12em] text-ink ${PRESS} hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`}
      >
        {/* Not "Send us a message": that is the FOOTER form's button, it is on this page too, and
            two buttons with one label is a page where a screen reader's button list says the same
            thing twice about two different controls. "instead" also ties this to the sentence
            directly above it, which is the sentence that makes someone want it. */}
        Message us instead
      </button>

      {open && (
        <LeadSheet titleId={titleId} onClose={() => setOpen(false)}>
          <div className="px-6 pb-7 pt-9 sm:px-8">
            <h2 id={titleId} className="t-h3">
              Tell us what you need
            </h2>
            <p className="t-small mt-2 text-stone">
              We read every message and answer seven days a week. No slot to pick.
            </p>
            <div className="mt-6">
              {/* NOT `compact`. That prop hides the message box, and on a form headed "Tell us
                  what you need" the message box is the form — the whole reason someone chooses
                  this over the booking grid is that they have something to say that a calendar
                  slot cannot hold. `stack` keeps the fields in one column, which is what a
                  max-w-md sheet wants at 320 as much as at 1440. */}
              <LeadForm
                stack
                fullWidthSubmit
                source="connect-modal"
                submitLabel="Send Message"
                successTitle="Message sent."
                successBody="Thanks. We usually reply within the hour, seven days a week."
              />
            </div>
          </div>
        </LeadSheet>
      )}
    </>
  );
}
