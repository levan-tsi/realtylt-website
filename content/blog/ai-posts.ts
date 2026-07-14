/** Long-form bodies for the two AI articles in POSTS.
 *
 * They live here rather than inline in posts.ts because they are full articles (headings,
 * lists, quotes) and would bury the ten seeded stubs the file otherwise holds. Markdown
 * subset: see lib/blog/markdown.tsx.
 *
 * House rules that apply to everything written here: no em dashes, no arrow glyphs, no
 * claims we have not already made elsewhere on the site. */

export const AI_CHAT_ASSISTANT_POST = `Someone found your listing at twenty to midnight. They were on a phone, in bed, three tabs deep, comparing your Beacon colonial against two others. They had one question: would the seller look at a contingent offer.

There was a contact form. They filled it in, or more likely they did not, and they went to sleep.

You saw it at 8am. You called at 9. By then they had asked the same question on two other sites, and one of them had already answered.

That gap, the one between when people actually look and when we actually answer, is the most expensive thing in this business, and almost nobody measures it.

## The number everyone quotes, and what it really means

Roughly 78% of leads close with whoever responds first. It gets repeated so often that it has stopped landing.

What it means in practice is smaller and more brutal than it sounds. It does not mean the fastest agent is the best agent. It means that being first buys you the conversation, and the conversation is the only thing that has ever sold a house. Everything you are good at happens after somebody picks up.

So the question is not whether you are a better agent than the one who answered at 11:41pm. You probably are. The question is whether you were in the room.

## What an AI chat assistant actually does

Strip away the marketing and it is a text conversation on your own website, answered by a language model, connected to the systems that make the answer true.

The version we run does four things:

1. **It answers immediately, at any hour.** Not a canned reply. An actual answer to the actual question.
2. **It searches the live MLS.** Ask it for three bedrooms under $600k in Beacon and it queries the MLS Grid feed and tells you what is genuinely active right now, not what was active when somebody last exported a spreadsheet.
3. **It moves to a channel people open.** Matching listings go out by text. People read texts. People do not read the fourth email from an agent they have never met.
4. **It captures what it learns.** Name, number, price band, area, timeline, and the transcript, all written to the CRM so your callback starts from what they said rather than from a blank record.

The last one is the one people underrate. A lead that arrives with a transcript attached is a completely different object from a lead that arrives as a name and an email address. You already know what they want before you dial.

## What it does not do, and should not pretend to

This is the part most vendors skip, so let us be plain about it.

It does not close. It does not read a room, it does not know when a seller is lying about their timeline, and it has no instinct for what is really going on in a divorce sale. Those are the reasons you have a job.

It does not know things it cannot verify. If a buyer asks whether the seller will take a contingency, the honest answer is that nobody knows until it is asked, and the assistant should say so and book you a call. An AI that invents an answer to look competent is worse than no AI at all, because you will find out about the invention from a furious client.

And it does not pretend to be a person. Ours introduces itself as an assistant. In practice, nobody minds. What people mind is waiting.

> The measure of an AI assistant is not how human it sounds. It is whether the answer was correct, whether it was immediate, and whether a real person showed up when it mattered.

## The honest objections

**"It will annoy my visitors."** A bad one will. A pop-up that fires two seconds after landing and demands a phone number before it has been useful is an ad wearing a chat widget's clothes. The one worth running answers a question first and asks for a number once it has earned it.

**"My leads want a human."** They do, eventually. What they want right now, at 11:40pm, is to know whether the taxes on that house are five thousand or fifteen. An assistant that answers that and then books them a call with you is not standing between you and the client. It is the reason there is a client.

**"I already have a chatbot."** If it is a decision tree with four buttons, you have a menu, not an assistant. The difference is whether it can answer a question nobody scripted in advance.

## Where it goes wrong

Three failure modes, all avoidable, all common:

- **It is not connected to anything.** An assistant with no MLS access can only talk in generalities, and a visitor works that out in about one question.
- **The handoff is a dead end.** It qualifies a hot lead beautifully and then drops them into an inbox nobody watches. The value was never the captured email. It was the booked appointment.
- **Nobody reads the transcripts.** They are the most useful sales material you will ever own, because they are a record of the exact questions your market is asking, in their own words. Most people never open them.

## What to do about it

If you would rather see one working than read about it, ours is live on [the RealtyLT AI page](/ai#chat), and you can talk to it right now. Ask it something hard. It will either answer, or tell you it cannot and offer to book a call, and both of those are the correct behaviour.

The full breakdown of how it is built, what it connects to, and what it does with the leads it captures is on the [AI chat assistant page](/services/ai-chat-assistant).

The buyer at 11:40pm is not coming back tomorrow to check whether you replied. They are going to be at somebody's open house on Saturday. The only real question is whose.`;

export const WORKFLOW_AUTOMATION_POST = `Ask an agent what they do all day and they will tell you they sell houses.

Then get them to write down every step of one deal, from the first inquiry to the closing table, and hand them a highlighter for anything that involves typing something into a system that another system already knows. The page turns yellow.

That yellow is the busywork tax. It is not one big thing. It is forty small ones, each of which takes ninety seconds, and none of which feels worth automating on its own.

## What it actually looks like

Here is a real chain, the kind that exists in almost every real estate business, written out honestly:

1. A lead fills in a form at 11pm.
2. It lands in an inbox.
3. In the morning, somebody reads it.
4. They type the name, email, and phone into the CRM.
5. They do not notice this person is already in the CRM, so now there are two of them.
6. They write a reply.
7. They set a reminder to follow up.
8. Three days later the reminder fires and they cannot remember who this was, so they read the original email again.

Eight steps. Maybe twelve minutes of human attention, spread across three days, most of it spent reloading context that was already written down somewhere.

Now do that forty times a month.

## The three lies we tell ourselves about it

**"It only takes a minute."** It takes a minute forty times a month, which is an afternoon, which is a listing appointment you did not go on.

**"I would rather do it myself so I know it is done right."** Usually true, and also how the tax gets paid forever. The answer is not to trust a system blindly. It is to build one you can watch.

**"It is not worth automating something this small."** Individually, correct. The point is that these steps form a chain, and chains are exactly what automation is good at. You are not automating step four. You are automating one through eight.

## What automation actually is, without the jargon

It is plumbing between the tools you already pay for.

Your CRM holds the contact. Your calendar holds the time. Your email holds the conversation. Your forms hold the intake. Your documents hold the deal. All five of them know things the other four need, and the way that information currently travels between them is a human being with a mouse.

Tools like [n8n, Make, and Zapier](/services/workflow-automation) connect them, so that finishing one step starts the next. Put a language model in the middle and it can also make the small judgment calls that used to need a person: is this the same Sarah Miller who inquired in March, is this lead actually hot, does this message need a human.

That same chain, rebuilt:

1. The form is submitted at 11pm.
2. It is matched against the existing CRM records and updates the right one instead of creating a second.
3. The phone number is validated and the address resolved.
4. A text goes out within seconds, and it is a real reply, not an autoresponder.
5. The lead is scored on what they actually said, and routed accordingly.
6. A task lands on the right person's calendar with the context attached.

Nobody woke up. Nobody typed. The lead was answered while they were still on the site.

## How to find your own version of this

You do not need a consultant for the first pass. You need a piece of paper and an honest hour.

- **Follow one real job, end to end.** Not the ideal version. The one that actually happened last week, including the part where somebody had to chase a signature twice.
- **Write down every step, including the ones that feel too small to write down.** Those are the ones.
- **Mark every step where information moves between two systems by hand.** That is your list.
- **Mark every step that only happens if somebody remembers.** That is your risk.
- **Rank by how often it happens, not by how annoying it is.** The most irritating task is rarely the most expensive one. The expensive one is the boring thing you do fifty times a month without noticing.

Most people are surprised twice: first by how long the list is, and then by how boring the top of it is.

> The task worth automating first is almost never the one that sounds impressive. It is the one you have done so many times that you stopped seeing it.

## What to be careful about

Automation you cannot see is automation you cannot trust. There is a real failure mode where a broken chain quietly stops firing and nobody notices for a fortnight, because nothing visibly broke. It just went quiet.

So, three rules, learned the hard way:

- **Every run gets logged.** If you cannot answer "did it run, and what did it do", you have built a black box.
- **Failures shout.** A step that fails should alert somebody, not disappear.
- **Anything genuinely ambiguous stops and asks.** A system that guesses when it should have asked will eventually guess wrong in front of a client.

## The part nobody tells you

The hours you get back are real, but they are not the main thing.

The main thing is that the mistakes stop. The lead that never got called. The deadline that slipped because it lived on page nine of a PDF. The follow-up that fired at someone who already went under contract with a competitor, which is the most humiliating email in this industry.

Those are not time problems. They are the cost of a system that depends on a person remembering, at the end of a long day, to do something small.

If you want to know which of your own steps is worth fixing first, that is exactly what the [AI audit](/services/ai-audit) is for: we follow the work, rank what each fix is worth, and build the first one. The rest of the stack is written up on the [workflow automation page](/services/workflow-automation).

The tax is not going to itemise itself.`;
