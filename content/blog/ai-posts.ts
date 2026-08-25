/** Long-form bodies for the AI articles in POSTS.
 *
 * They live here rather than inline in posts.ts because they are full articles (headings,
 * lists, quotes) and would bury the ten seeded stubs the file otherwise holds. Markdown
 * subset: see lib/blog/markdown.tsx.
 *
 * House rules that apply to everything written here: no em dashes, no arrow glyphs, no
 * claims we have not already made elsewhere on the site. Every external statistic and every
 * statute carries a real link, and every one of those links was checked for a 200 before it
 * shipped. On a page whose argument is honesty, a dead citation is worse than no citation. */

export const AI_AGENT_WORKFORCE_POST = `The inbox assistant had drafted your morning replies for two weeks. Nine working days, nine sets of drafts, and every one of them was fine. Around day four you stopped reading them properly, which is not laziness. It is what anybody does with something that has been right nine times.

On the tenth morning it confirmed a Thursday walkthrough to a buyer's agent. You had moved that walkthrough to Friday the previous evening, in a text message, from the car. The assistant read the calendar, and the calendar said Thursday, because the calendar was where the walkthrough had been before you moved it.

The draft went out at 6:40am, in your voice, from your address, and it was polite and well written and completely wrong.

Nothing malfunctioned. The assistant was not confused and did not hallucinate anything. It read what it had access to, did the job it was given, and produced a piece of work indistinguishable in tone from the nine that were correct. That last part is the whole subject of this article, because it is the reason nobody caught it.

[[scene:in-short]]

[[scene:tenth-morning]]

## What an agent workforce actually is, and what it is not

The pitch is easy to say and it is broadly true. Instead of one general chatbot you have to brief every time, you set up several assistants, each pointed at one recurring job, each with access to the systems that job needs. One reads the overnight email and drafts replies. One pulls comps and builds the deck for tomorrow's listing appointment. One watches every open file for the signature nobody chased. They run at the same time, they do not stop at five o'clock, and adding another one is a configuration change rather than a hire.

What that description leaves out is the second half of the sentence, and the second half is where all the money and all the risk are. You have not removed work. You have changed what kind of work it is. Producing has become reviewing, and reviewing four streams of output is a real job with real hours in it, done by you, in the morning, before anything else.

That is not an argument against doing this. It is an argument for knowing what you are buying, and it is the thing every page in this category, including our own, has historically been vague about.

[[scene:not-a-chatbot]]

## Right once and right every time are different products

Here is the distinction that reorganises the whole subject, and it comes from the best public measurement of this that exists.

In June 2024 a team at Sierra and Princeton published a benchmark called tau-bench. It is not a quiz. It puts a language agent into a simulated business with a real database, a set of tools that can change that database, and a written policy it has to follow, and then has a second language model play a customer who wants something. Two domains: a retail one with five hundred customers, a thousand orders and a hundred and fifteen tasks, and an airline one with three hundred flights, two thousand reservations and fifty tasks. At the end of each conversation the benchmark compares the actual state of the database against the one correct outcome. Not the transcript, not the tone. What ended up in the system.

The authors also proposed a measurement that nobody had been using, and it is the important part. Everybody had been reporting whether an agent succeeds at a task. They asked instead how often an agent succeeds at the same task every single time it is attempted, and they named it pass hat k: the chance that all k independent attempts are successful, averaged across tasks.

Read that against your own morning. You do not need an assistant that can draft a good reply. You need one that drafts a good reply on Monday and Tuesday and Wednesday and the Thursday you were in the car.

## What happens when you run the same job twenty times

The best model in that paper solved more than sixty percent of the retail tasks on a single attempt. Run the same tasks eight times each and require all eight to be right, and the paper reports that the figure drops below twenty five percent.

Sit with the shape of that rather than the numbers, because the numbers are from June 2024 and the models have moved since. Something that succeeds most of the time on any given morning succeeds every morning far less often than most of the time, and the gap widens the more mornings you ask about. That is not a flaw anybody introduced. It is what happens when you multiply a probability by itself, and it is the reason a demo is such a poor guide to a purchase. A demo is one attempt. A business is a hundred attempts in a row.

The same paper is worth reading for one more reason: it looked at what the failures actually were. Of thirty six failed runs it examined by hand, the largest group was the agent calling the right kind of tool with the wrong values in it. Not a refusal, not an error message, not an apology. The correct action, confidently, on the wrong record. Which is what happened at 6:40 on the tenth morning.

## Where these systems actually go wrong, and it is mostly not the model

The other paper worth your time is more recent and it is about exactly the thing the service page is selling, which is several agents working at once.

A group at UC Berkeley collected 1,642 annotated execution traces from seven different multi-agent frameworks, built a taxonomy of what went wrong by having six human experts read a hundred and fifty of those traces closely, and then checked that the taxonomy was reliable by having independent annotators apply it and measuring how often they agreed. Their agreement measure came out at 0.88, which is high, and it matters because a taxonomy nobody applies the same way twice is an opinion rather than a finding.

Fourteen distinct failure modes, in three groups. Their headline number is worth knowing before anybody quotes you: across the seven systems they measured a failure rate between 41 percent and 86.7 percent.

[[scene:where-fail]]

The chart is the finding. The largest group is not the model being stupid. It is system design: the job being specified badly, the agent repeating a step it had already done, the agent not knowing when it was finished. Their single most common individual mode, at 15.7 percent of everything, is step repetition. The second is the agent's stated reasoning not matching the action it then took. The third is not recognising the conditions under which it should stop.

None of those are fixed by a better model, and all of them are fixed by somebody thinking harder about the instructions and the checks. The paper's own observation about this is the practical one: the systems in their sample that had explicit verification steps built into them showed fewer failures overall.

## The brief is the product

The tau-bench authors ran one more experiment which almost nobody talks about, and for a reader about to pay for any of this it is the result in either paper that matters most.

They took the written policy out of the agent's instructions and ran everything again. In the simple domain, where the rules are close to common sense, performance fell from 61.2 to 56.8 percent, which is barely anything. In the complicated domain, where the rules are specific and arbitrary in the way real business rules are, it fell from 33.2 to 10.8 percent.

[[scene:rules-removed]]

Take the second pair seriously. Two thirds of what that agent could do came from a written document, not from the model. Which means the thing you are actually buying, when you buy an assistant, is the document: the description of the job, the rules, the exceptions, the things that must never happen. The model is a commodity and it improves every few months without you doing anything. The brief is yours, it is specific to your business, and nobody else can write it.

This is also why the honest version of the sales process is slower than the exciting one. "Tell us the job and we will build the assistant" sounds like a five minute conversation, and it is a two hour one, because most recurring jobs have never been written down and the first hour is spent discovering the exceptions that live only in somebody's head.

[[scene:plate]]

## Why the second assistant costs more than the first

Everything above is about one assistant. Running several is not the same thing repeated, and the difference is worth being clear about because it is the difference the word "workforce" hides.

Two assistants that never touch each other are genuinely just two assistants, and the cost is roughly double the cost of one. That describes a lot of useful setups and there is nothing wrong with it.

But the moment one assistant's output becomes another assistant's input, you have built a system, and the Berkeley taxonomy has a whole category for what goes wrong there: information one agent held and did not pass on, an agent carrying on with an assumption instead of asking, an agent quietly drifting off the task it was given. Almost a third of everything they classified sat in that group. A handover between two pieces of software is not free, and it is exactly the place where an error stops being visible, because the second agent receives a confident summary rather than the thing itself.

The practical rule that falls out of this is dull and it is worth more than any feature list. Keep the assistants independent unless there is a specific reason not to, and where one has to feed another, make the handover something a person can read.

[[scene:agent-path]]

## Where the money actually goes when you run several

The cost of running an agent is not what you would guess, and the tau-bench paper measured it, which almost nobody does.

For each task their best setup handled, the agent cost 38 cents and the simulated customer on the other side cost 23 cents. That is not your price list and it should not be read as one. The number underneath it is the one that transfers: of what the agent cost, the input took 95.9 percent and everything the agent actually wrote took 4.1 percent.

In plain terms, almost the entire running cost of an assistant is it re-reading its own instructions, its tool definitions and the conversation so far, over and over, before every single thing it says. It is not being paid to write. It is being paid to remember.

That has three consequences you can act on. A longer brief costs money every time the assistant runs, so the discipline is a brief that is complete rather than a brief that is long. An assistant that is given access to ten tools it never uses is paying to read the descriptions of ten tools it never uses. And an assistant handling a long conversation gets more expensive with every turn, which is why a job that ends is cheaper than a job that lingers.

[[scene:agent-calculator]]

[[scene:pull-quote]]

## What a person costs, and why you cannot divide by it

Every page in this category eventually reaches for a salary, and ours did too. So here is a real one, from the only source for it that publishes its method.

The United States Bureau of Labor Statistics reports that the median annual wage for [secretaries and administrative assistants was $47,460 in May 2024](https://www.bls.gov/ooh/office-and-administrative-support/secretaries-and-administrative-assistants.htm), which is $22.82 an hour. Median means what the Bureau says it means and it is worth quoting, because half of this category's arithmetic depends on people not knowing: the median wage is the wage at which half the workers in an occupation earned more than that amount and half earned less. For context, [the median for real estate sales agents](https://www.bls.gov/ooh/sales/real-estate-brokers-and-sales-agents.htm) was $56,320 over the same period, and the median for all occupations was $49,500.

Now the part where the arithmetic stops. That $47,460 buys something with properties an assistant does not have. It answers the phone when the caller is upset. It notices that the job it was given last March is no longer the job that needs doing. It can be told once. It can be held responsible. And it is a whole person rather than a set of tasks, so removing four tasks from that job does not remove four quarters of the salary.

There is also a number in the same table that nobody selling this will mention. The Bureau's projection for that occupation between 2024 and 2034 is zero percent growth, a change of minus 12,400 jobs out of roughly three and a half million. Not a collapse. Essentially flat, in the published forecast of the agency whose job is forecasting it.

So this page will not divide one of those numbers by the other. The honest comparison is not assistant against employee, because they are not substitutes. It is your morning with the assistants against your morning without them, which is a question about your own time and not about anybody's salary, and it is the question the calculator above is asking.

## Who is responsible when an assistant is wrong

The email that went out at 6:40 was signed with your name. Everything else follows from that.

This industry is unusual in having already written down what happens when work is delegated, because the delegation of licensed work has been regulated in New York for the better part of a century. It is worth reading two provisions in [the Department of State's own Real Estate License Law booklet](https://dos.ny.gov/real-estate-license-law), because neither is about artificial intelligence and both are about you.

Section 442-c deals with what a salesperson's misconduct means for the broker. A broker is not automatically on the hook for what an associate did. But there are two ways they become so, and the second is the one to read twice: a broker is exposed where they had actual knowledge of the violation, or where they retain the benefits, profits or proceeds of a transaction wrongfully negotiated by their salesperson or employee after notice of the misconduct. Keeping what the conduct earned is the thing that attaches you to the conduct.

Then read Section 440-a, which is the requirement to be licensed at all. It lists who may hold a licence: a person, a co-partnership, a limited liability company, a corporation. That list is a list of parties that can be disciplined, sued and struck off. It is not a list a piece of software is on, and nothing here is a prediction about future law. It is a description of the present one, and the description is that when an assistant working for you says something to a client, there is exactly one licensed party in the conversation and it is you.

## What supervision looks like when the thing you are supervising is software

There is a second document worth borrowing, and this one is borrowed openly as an analogy rather than applied as a rule. It is about supervising people and it says nothing whatever about software.

Section 175.21 of the Secretary of State's regulations defines what supervising a salesperson actually consists of, and rather than leaving it to judgement it writes it down: regular, frequent and consistent personal guidance, instruction, oversight and superintendence, with respect to the brokerage business and all matters relating to it. The next paragraph requires written records of what the salesperson actually did.

Nobody is claiming that provision governs an inbox assistant. What it does is describe, in a document your regulator wrote, the standard this industry already applies to work done in your name by somebody who is not you. Regular. Frequent. Consistent. Written down.

Set that beside four assistants running overnight with nobody reading the output after day four, and you have the honest specification for what running this well requires. Not a dashboard. A habit, with a time in the diary, and a record of what was produced.

[[scene:offer]]

## What it costs, and how long it takes

Nobody can quote this from an article, because three separate things drive the cost and only one of them is the software.

The first is the brief, and it is the slow part. Writing down a job properly, exceptions included, runs to an hour or two per assistant, and it goes faster when a second person keeps pushing back on the first version you offer. The tau-bench ablation is the argument for spending that time rather than skipping it.

The second is access. An assistant that can read your calendar and your CRM is worth several times one that cannot, and the work is connecting it safely: the right permissions, nothing wider than the job needs, and a way to switch it off.

The third is the running cost, which is usage rather than a seat, tracks how much the assistant has to read rather than how much it writes, and is genuinely small per task and genuinely unbounded if nobody watches it.

What we will not print is a per-model price. The published pricing for every major model renders its numbers in JavaScript rather than in the page, so they cannot be read from the source and checked later, and a price that cannot be verified is worse on a page like this than no price at all. What can be said is the shape: the cost per piece of work is in cents rather than dollars, it is dominated by the length of the instructions rather than by the length of the answer, and the honest budget line is the review time above it rather than the compute.

## What it does not do, and should not pretend to

It does not take responsibility. An assistant cannot be told off, cannot learn from being told off in any way that persists unless somebody edits the brief, and cannot be the person a client complains to. Every consequence lands on a licensed human being, and that human being is you.

It does not notice that the job has changed. This is the quietest failure of the four. A person who has been drafting your listing emails for a year will eventually say that the market has moved and the second paragraph now reads badly. An assistant will produce that second paragraph forever, with perfect consistency, until somebody rewrites the brief.

It does not do a job nobody has written down. A vague brief does not produce vague output, which would at least be a visible signal. It produces confident, fluent, plausible output that is subtly not what you wanted, and you find out three weeks later from a client.

It does not remove the reading. Anything that reaches a client should be read by a person first, an assistant that drafts is worth more than one that sends, and the review is not a temporary safety measure for the first month. It is the job now.

And it does not scale the way the word workforce suggests. Four independent assistants are four times the review. Four assistants feeding each other are four times the review plus a category of failure that only exists because they are connected, and the published taxonomy has six named modes inside it.

[[scene:plate-two]]

[[scene:wasted]]

## How to test one assistant before you run four

Do this with one assistant, on one job, before anybody builds you a set of them. It takes an afternoon spread over a fortnight and it will tell you more than any demonstration.

Pick the dullest job you have that repeats, and write the brief before you look at any software. Include the exceptions. If you cannot write it, you have learned the most useful thing available today, which is that the job is not yet delegable to anybody, software or human.

Then run it against work you have already done. Take ten pieces of last month's output that you produced by hand, give the assistant the same inputs, and compare. This is the only honest accuracy test, because you already know the right answer and you are not grading it on how confident it sounds.

Then run the same task ten times and count how many times all ten are right. Not the average. All ten. That is the pass hat k measurement from the research above, done by hand, and it is the single number that predicts whether you will still be reading the output in week six.

Then break it on purpose. Give it an input with a contradiction in it, or a case the brief does not cover, and find out whether it stops and asks or whether it decides. An assistant that decides in the ambiguous cases rather than stopping will go on deciding, and one of those decisions reaches somebody outside your office before you have seen it.

Last, put a time in your diary. Fifteen minutes, the same slot every week, to read a sample of what it produced and check it against what you asked for. If you cannot find that slot for one assistant, you have your answer about four.

## Common questions, answered honestly

### What is an AI agent workforce, in plain terms?

It is a set of AI assistants, each configured for one recurring job and each connected to the systems that job needs. Rather than one general chatbot you brief from scratch every session, you have several that already know your business and their own task, and they run in parallel, on a schedule or a trigger, without you opening anything.

### How is this different from workflow automation?

Workflow automation joins the software you already pay for, so the end of one step is what begins the next, and most of the steps in a good automation carry no judgement in them at all. An agent is what you reach for when a step genuinely needs a decision made from context. Both are often assembled from the same parts, and putting an agent where a simple rule would have done buys unpredictability nobody asked for.

### How is this different from just using ChatGPT?

Three things, and the second is the one that matters most. A general chat session starts empty and cannot reach your systems. An assistant carries a written brief for one job, which the research above suggests is where most of its usable ability comes from. And it runs on a trigger rather than waiting for you to remember it, which is the difference between a tool and a member of staff.

### How many assistants can I actually run at once?

Technically as many as you have jobs for, because they do not queue behind each other. Practically the limit is not the software, it is how many streams of output one person can review before the reviewing stops happening. Most people find that number is smaller than they expected, and the calculator above is there to let you find yours before you commit to it.

### Do I need technical skills?

No, and the skill you do need is not technical. You need to be able to describe a job precisely, including what should happen in the cases that are not the normal case. That is a writing and thinking exercise rather than a software one, and it is the part that cannot be outsourced, because the exceptions live in your head.

### What happens when one of them is wrong?

It produces something wrong that reads exactly like everything it produced when it was right, which is why the answer has to be structural rather than attentive. A build that is serious about this stops and asks rather than guessing on anything ambiguous, keeps a readable record of what it did and why, drafts rather than sends anything client-facing, and has a review step somebody actually performs.

### Is it cheaper than hiring somebody?

That is the wrong comparison and we are not going to make it. The published median wage for an administrative assistant buys accountability, judgement and somebody who notices when the job changes, and an assistant provides none of those. The comparison that is real is your own week with and without, including the review time, which is what the calculator above works out.

### How do I know it is working after the first month?

Not from a dashboard. Count how many pieces of its output you actually read last week and be honest about it, because the review is the control and a review nobody performs is not one. Then take a sample and check it against the brief rather than against your impression, and every quarter re-read the brief itself and ask whether it still describes the job you have now.

## What to do about it

Go and read yesterday's output. Not the summary of it, the actual pieces, all of them, one after the other, with the brief open beside you. It takes twenty minutes and it is the only way to find out whether you have four assistants or four unread inboxes.

Then write one brief for one job, properly, before anybody sells you anything. The research says most of what an assistant can do for you comes out of that document, and the document is the part nobody else can write, and you can write it today for nothing.

The assistants are listed on [the RealtyLT AI page](/ai#agents); what each one is pointed at is set out on the [AI agent workforce page](/services/ai-agent-workforce). Working out which of your recurring jobs are genuinely delegable is what the [AI audit](/services/ai-audit) does: we take one real job, write the brief with you, and build that one first.

The individual jobs are written up on their own: [answering the website at midnight](/blog/ai-chat-assistant-real-estate-website), [picking up the phone at 9:42 on a Sunday](/blog/ai-voice-agent-missed-calls-real-estate), and [the wiring between the tools that makes any of it possible](/blog/workflow-automation-real-estate-business).

Nine good mornings are not a track record. They are nine mornings.

[[scene:funnel]]`;

export const CRM_SYNC_POST = `In March a woman asked your website what her house was worth. She typed her name the way she says it out loud, so the record in your CRM says Kathy Brown.

In June she rang the office about a different house. Whoever picked up did everything right: took the details, typed them in properly, spelled the name the way it appears on a deed. Katherine Brown. A work email rather than the personal one, and the mobile she actually answers.

In August she listed with you. In September she went under contract.

And on the Tuesday three days before her closing, an automated email went out asking Kathy whether she was still thinking about selling this year.

Nothing broke. Every part of that ran exactly the way it was built to run. Your website did its job, the person who answered the phone did theirs, and the campaign that sent the email was pointed at exactly the segment it was supposed to be pointed at. The system was working. It just did not know that the two women in it were one woman.

[[scene:in-short]]

## Why there are two of her, and it is not carelessness

A contact record is created by whichever system meets somebody first. Your website makes one when a form is submitted. Your phone system makes one when a number it does not recognise rings in. The portal makes one when a lead is bought. The open house sheet makes one on Monday morning when somebody types up the clipboard. Every one of those routes is doing the correct thing, and none of them can see the others.

That is the whole mechanism, and it matters because the usual explanation is wrong. Duplicate records are almost never the product of somebody being sloppy. They are the product of two systems being separately right about the same human being, at two different moments, using whatever she told each of them at the time. She was in a hurry in March and typed the short version of her name. In June she was talking to a person and gave the formal version, because that is what you give a person who is writing something down.

The reason this is worth understanding rather than just fixing is that it tells you what the fix has to be. If the problem were carelessness, the answer would be training. It is not carelessness, so the answer is not training. The answer is a rule about identity that lives somewhere outside all of those systems and is applied every time any of them creates a record.

[[scene:two-of-her]]

## What the same person means to a computer

You looked at those two records and knew instantly. A computer does not have the thing you just used. What it has is two strings, and a way of asking how similar they are.

This is the part of the subject that has actually been studied, and it has a name that nobody in software sales ever uses: record linkage. The clearest published overview is [by William Winkler of the United States Census Bureau](https://www.census.gov/content/dam/Census/library/working-papers/2006/adrm/rrs2006-02.pdf), written for the Bureau's own research report series, because the Census has the hardest version of this problem in the country and has been working on it since the 1950s. It is worth reading the whole thing if you ever have an afternoon, and one paragraph in it is worth reading now.

Winkler is describing what counts as a "typographical error" between two records that genuinely belong to the same person, and he gives four examples of first name pairs: Bill and William, Mr and William, William and James, William and Willam. Look at the third one. William and James are not a misspelling of each other. They are different names, and the paper counts the pair anyway, because the definition it is working to is any difference in the way corresponding fields are written between two records that are in fact a match. Middle names get used as first names. People go by their second name for forty years. The record is not wrong; it just does not look like the other one.

How often does that happen? Winkler cites his own earlier measurement: even high quality files might contain more than 20 percent error in first name pairs and more than 10 percent error in last name pairs among pairs that are true matches. Read that twice, because it is the number that decides everything downstream. In a file that somebody had already taken care over, one in five pairs of records that describe the same person disagreed about her first name.

[[scene:surnames]]

## A name is not an identifier, and this is how far from one it is

The other half of the problem is the opposite of the first. Names disagree when they should agree, and they also agree when they mean nothing at all.

The Census Bureau publishes the count of every surname that occurred at least 100 times in the 2010 Census: 162,253 of them. Brown was carried by 1,437,026 people. So a matching rule that treats a surname as evidence is not wrong, exactly, but it is worth almost nothing on its own, and it is worth a wildly different amount depending on which surname it is. Winkler makes the same point with two examples of his own, noting that a relatively rarer last name string such as Zabrinsky has more distinguishing power than a string such as Smith.

There is a second, duller constraint that shapes every real system. You cannot compare every record against every other record. Ten thousand contacts is fifty million pairs, and the overwhelming majority of them are two people who have nothing to do with each other. The standard answer, which Winkler credits to Newcombe in 1962, is called blocking: only bother comparing pairs that already agree on something, such as a surname or a date of birth. It is a good answer and it has a cost that is built into it. Any true match whose blocking field is wrong on one side will never be looked at, because the two records were never in the same pile.

[[scene:plate]]

## Somebody solved this properly, and the answer has three outcomes

In 1969 Ivan Fellegi and Alan Sunter published a formal mathematical model for ideas Howard Newcombe had introduced ten years earlier, and it is still the model underneath every serious matching system in the world. Winkler's overview restates it, and the restatement is the part a business owner should actually read.

You take a pair of records and you look at the pattern of what agrees and what does not: same last name, different first name, same street number, no email on one side. Then you ask a ratio. How likely is that exact pattern among pairs that really are the same person, against how likely it is among pairs that really are not? A high ratio means the agreements are the kind that only matches produce. A low one means they are the kind that strangers produce by coincidence.

Then comes the decision rule, and it is quoted here almost exactly as Winkler writes it. If the ratio is above an upper threshold, designate the pair a match. If it is between the two thresholds, designate it a possible match and hold it for clerical review. If it is below the lower threshold, designate it a nonmatch.

[[scene:three-answers]]

## The third answer is a person, and it is the one nobody sells you

Almost every product in this category describes two outcomes: it finds duplicates, or it does not. The model that actually works has three, and the middle one is a queue of pairs that a human being looks at. Winkler's own name for that band is the no-decision region.

The reason it exists is the sentence right underneath the rule, and it is the honest centre of this whole article. The two thresholds are set from error bounds you choose in advance, on false matches and on false nonmatches. You get to pick how often the system is allowed to merge two people who are not the same person, and how often it is allowed to leave one person sitting in the database twice. You do not get to pick zero for both. Moving one threshold to make one of those numbers smaller makes the other one bigger, and the only place the pressure can go instead is into the middle band, which is a person's afternoon.

That is not a limitation of the software you were quoted. It is a property of the problem, published in 1969, and any vendor whose answer to "how accurate is your deduplication" is a single percentage has either not read this or is hoping you have not.

What it looks like at scale is worth seeing, because the trade is real and so is the payoff. Winkler records what the computerised procedures did to one of the largest matching operations ever run in the United States, the 1990 Decennial Census: they reduced the need for clerks and field follow-up from an estimated 3,000 individuals over 3 months to 200 individuals over 6 weeks.

[[scene:census-clerks]]

And then he says why the 200 were still needed, which is the part that never gets quoted. Both first name and age were missing from a small proportion of the Census forms and the survey forms being matched against them. Not wrong. Missing. There is no algorithm for a blank field, there was not one in 1990 and there is not one now, and the strongest matching system ever built for the American population still ended with two hundred people in a room deciding.

## What a sync is actually made of

Strip the word "sync" off it and there are only three questions, and every argument you will ever have about a CRM integration is one of them wearing a costume.

Which record is this. That is the whole of the section above, and it is settled before anything else can happen, because a piece of information cannot be written to a contact until somebody has decided which contact it belongs to.

Which fields move. Your phone system knows a call happened, its length and its outcome. Your CRM has somewhere to put a call, and it also has thirty other fields the phone system has never heard of. Somebody has to sit down and say that this field over here becomes that field over there, and that the ones with no partner stay where they are.

Which direction. A field can be written one way, written the other way, or written both ways, and the third of those is the only one that deserves the name two-way sync, and it is the one that creates every hard problem in the rest of this article.

[[scene:sync-path]]

## The field that gets erased

Here is a failure that looks like data loss and is actually a design decision somebody made without noticing.

The web has two ways of changing something that already exists, and they are not variations on a theme. The older one is a replace, and [the specification for it](https://www.rfc-editor.org/rfc/rfc9110.html#name-put) says that the sender is requesting that the stored version be replaced. [The other one](https://www.rfc-editor.org/rfc/rfc5789.html), defined in 2010 in a document whose introduction says in its first paragraph that a new method was necessary to improve interoperability and prevent errors, sends a set of instructions describing how the thing currently stored should be modified to produce a new version.

In plain terms: one of them says "here is the contact, make it look like this", and the other says "change these two fields and leave everything else alone".

If your sync uses the first one and the sending system has an empty box where the receiving system has a mobile number somebody typed in by hand two years ago, the mobile number is gone. Nobody deleted it. The sending system simply described the whole contact, and in its description that field was empty, and the receiving system did what it was asked. This is the single most common way a sync destroys information, and the tell is always the same: the missing data is missing from exactly the fields the other system does not have.

The specification for the second method has a rule about this that is worth holding a vendor to. The server must apply the entire set of changes atomically and must never provide a partially modified representation, and if the whole patch cannot be applied then it must apply none of it. All of it or none of it. A half-updated contact is not a smaller version of a successful update. It is a record in a state that was never intended by anybody, and the standard says it must not be allowed to exist.

## The same update, arriving twice

Networks fail in the middle. That is not an edge case, it is a Tuesday, and every sync you will ever own has to decide what to do about it.

[The current HTTP specification](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods) has a precise word for the property that decides the answer. A request method is idempotent if the intended effect on the server of multiple identical requests is the same as the effect of a single one. The specification is explicit about why it bothers to define this: idempotent requests can be repeated automatically if a communication failure happens before the sender learns whether the first one worked.

Apply that to your contact record and it stops being computer science. "Set this contact's stage to Under Contract" is idempotent. Send it five times and the stage is Under Contract. "Add a note to this contact" is not. Send it five times and there are five notes, and the person who opens that record on Thursday sees the same message from you five times and draws a conclusion about you.

The specification also says what a careful system does about it: a client should not automatically retry a request that is not idempotent unless it has some way of knowing that the request is safe to repeat, or some way of detecting that the original never landed. And then it says, drily, that some clients take a riskier approach and attempt to guess when an automatic retry is possible. That sentence describes a large amount of the integration software currently running inside small businesses, and the symptom is duplicate activity on a contact record rather than an error anybody sees.

## When both sides changed at once

The last hard problem is the one with the best name. You open the contact in the CRM and change the phone number. At the same moment an automation, acting on what it read a second earlier, writes the whole contact back. Your change is gone, no error was raised, and nothing anywhere records that there was ever a disagreement.

The specification calls this [the lost update problem](https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match), names it in exactly those words, and describes the mechanism that exists to prevent it: a conditional request. The sender includes a marker for the version it last saw, and the receiving system is required not to perform the change if that marker no longer matches, refusing with a status code that exists for nothing else. The specification for partial updates goes further, warning that collisions between two of them can be more dangerous than collisions between two replaces, because some kinds of change need to start from a known base point or they will corrupt what they are changing.

None of that is exotic. All of it is thirty years old, written down, free to read, and absent from most small business integrations, because the cheap way to build a sync is to write the newest thing you have and not ask what was there before. That is a choice with a name, last write wins, and it is a perfectly respectable choice for some fields and a disaster for others. The point is that somebody has to make it deliberately, field by field, and be able to tell you what they picked.

[[scene:crm-calculator]]

[[scene:pull-quote]]

## Which side is right, and why somebody has to say it out loud

Every two way sync eventually receives two different answers to the same question and has to pick one. There is no clever way out of this and there is no default that is correct for every field, so the build either contains a decision or it contains an accident.

A rule that works for a lot of small businesses is that the most recently changed value wins for anything factual, such as a phone number or an address, and the CRM wins for anything about the relationship, such as the stage of the deal or the owner of the contact. A rule that works for others is that anything a human being typed beats anything a machine wrote, always, on the grounds that the human was looking at the person while they typed it.

Neither is right. What matters is that your rule is written down somewhere you can read it, that it was chosen by somebody who understood what each field is for, and that you can find out what it is without opening a support ticket. The service page for this says plainly that the sync does not decide which side is right and that the conflict rules get agreed when it is built. That is not a caveat. It is the most important half hour of the project.

## What the identity field actually is, in your CRM

There is a specific thing to go and check, and it is checkable today, for free, in about ten minutes.

Somewhere in your setup there is one field that decides whether an incoming record is a new person or an existing one. [HubSpot's own developer documentation](https://developers.hubspot.com/docs/guides/api/crm/objects/contacts) is unusually direct about this. Its combined create-and-update endpoint asks you to name the property you are identifying people by, and it says that you can use email or a custom unique identifier property, and that following the request, if the contacts already exist they will be updated, and if the contacts do not exist they will be created. One field, nominated by whoever built your integration, and every duplicate you have ever had is downstream of it.

The same page carries a warning that most people find out about by hitting it. Partial upserts are not supported when using email as the identifying property for contacts, which means that on that path you are back to describing the whole contact, which is the erasing behaviour two sections up.

And it documents what survives a merge, which is the detail that tells you the vendors have thought about this harder than the resellers have. When two contacts are combined, the loser's email address does not evaporate; it is kept as an additional email on the surviving record, and those additional addresses are still unique identifiers, so no other contact can take them. Your database remembers that Kathy existed. It has to, because the next time a message comes in from that address, something has to know where to put it.

[[scene:offer]]

## What it costs, and how long it takes

This article will not quote you a number, and not out of coyness. Four things drive the cost and none of them can be guessed from a distance: how many systems have to be joined, whether each of them exposes an interface a program can actually use, how many fields have to be mapped by hand rather than by name, and whether the records already in there have to be reconciled before anything is switched on. The fourth moves the total more than the other three and it is never in the quote.

The shape of it can be described without a number. A single pair of systems with a clear identity field and a dozen mapped fields is a small piece of work measured in days. A business with an old CRM, a newer CRM nobody finished migrating to, a phone system and a portal feed is a different project, and the connecting is the smaller half of it. Most of the time goes on somebody sitting with you over a list of fields and asking what each one is for, which is slow because half the answers turn out to be "I think that was Dave's".

Then there is the recurring cost, which is a person's attention. A sync is software, it will break the week a vendor renames a field, and something has to notice. And the middle band from the matching model never goes away: if you want fewer wrong merges, more pairs land in front of a human, and that is a standing few minutes a week rather than a one-off.

Here is the number we cannot give you, and it is the one you actually asked for. How many duplicates are in your database right now. Figures for this circulate constantly and every one traced back to a company that sells data cleaning software, quoting its own customers, with no published sample and no method. There is no independent study of duplicate rates in small business CRMs, in this industry or any other. The calculator above therefore asks you for the inputs rather than assuming them, and the honest first step of any real project is measuring your own file instead of accepting somebody's average.

## What it does not do, and should not pretend to

It does not clean what is already in there. Keeping two systems in step from today onward and reconciling nine years of accumulated records are two different jobs with two different price tags, and a sync switched on over an unreconciled database will faithfully propagate every mess in it to a second system.

It does not remove the human decision. That is the entire point of the three way rule, and any build that reports a hundred percent automatic resolution has quietly widened its match threshold and is merging people. The failure mode of an over-eager deduplicator is worse than the one it fixes: two separated records are an embarrassment, and two people fused into one is a stranger reading somebody else's conversation history.

It does not open a system that will not open. Most modern CRMs expose an interface built for exactly this, and a platform that does not is not going to be talked round. Screen scraping something with no interface is not a sync, it is a liability with a schedule.

It does not make anybody use the CRM. A record that is finally true is worth nothing at all if the appointment still lives on a sticky note, and there is no integration that can reach into a notebook.

And it will not tell you which of the two records is the real one, in the cases that matter. It will tell you they are probably the same person. Which email she reads, which number she answers, and which of the two histories is the one you should have in front of you before you ring her: that is judgement, and it belongs to whoever knows her.

[[scene:plate-two]]

[[scene:wasted]]

## How to find out how bad yours is, in twenty minutes

Nobody needs a consultant for the first pass, and you should do this before anybody quotes you, because the quote is worth more when you have the answer.

Take the last ten deals you closed. For each of those people, search your CRM for the surname on its own, then the first name on its own, then the email domain. Count the records that come back and are plainly the same human being. Ten is a small sample and it is not meant to be a statistic; it is meant to tell you whether the answer is roughly zero or roughly everywhere, and that is the only resolution the decision needs.

Then do the same for yourself. Put your own name into your CRM, your marketing tool, and your phone system in turn, and see what each of them thinks it knows about you. People are startled by this one, because your own record is the one you can audit instantly.

Third, find out what your automated messages are addressed off. Open the last one that went out and look at whether the name in the greeting comes from a field a person typed or a field a form captured. Kathy is in that email because of which field somebody chose, and that choice was made once, quickly, by whoever set it up.

Last, ask whoever built your current integration one question: what happens if the same webhook arrives twice. If the answer is a shrug, you have learned something more useful than any audit, and it cost you a sentence.

## Common questions, answered honestly

### What is two-way CRM sync, in plain terms?

It means information travels in both directions between your CRM and the other systems you use. Activity from calls, texts, bookings and automations writes into the CRM, and changes made inside the CRM flow back out to the systems that act on them. One-way sync means one of the two sides is always working from a copy that is out of date, and it is usually the side doing the automated messaging.

### How is this different from workflow automation?

Workflow automation is about work moving between systems: a form is submitted, so a task is created and a reply goes out. Sync is about one fact being true in more than one place at the same time. The tooling underneath is often identical and the question being answered is not, so a business can have either one without the other. A business with beautiful automation and no sync sends perfectly timed messages to the wrong version of a person.

### Will it create duplicate contacts?

A correctly built sync exists to prevent them, using a nominated identity field and a matching rule agreed when it is built, so an inbound record matching an existing contact updates that contact rather than creating a second one. What no honest build will promise is that the matching is never wrong in either direction, because the published model that everything in this field rests on says you choose between two kinds of error and cannot have zero of both.

### Does it work with Follow Up Boss, kvCORE or HubSpot?

Yes, along with most CRMs that expose a documented interface for software to use. The orchestration sits outside the CRM rather than being a fixed integration, so the answer is not limited to a supported list. The right question to ask about any specific platform is narrower than "is it supported": ask which field identifies a person, whether updates can change named fields rather than replacing the whole record, and whether the same message arriving twice creates one thing or two.

### What happens to the data that is already in there?

Nothing, until somebody decides what should happen. Reconciling an existing database is a separate exercise from syncing it forward, and doing them in the wrong order is how a project doubles in cost. The sensible sequence is to measure what is in there, agree the identity rule, reconcile the obvious matches, put the genuinely ambiguous pairs in front of a person, and only then switch the ongoing sync on.

### Can it merge records automatically?

Some of them, and the share depends on a threshold somebody sets. That threshold is the honest conversation to have before the build starts, because it is the dial between a system that leaves work for you and a system that occasionally fuses two people together. The safe default on a first build is to automate only the pairs that are not in any doubt, put everything else in a review queue, and widen it later once you have watched what the queue actually contains.

### Is this worth it for a one-person business?

Often more than for a large one, and for a reason that has nothing to do with efficiency. In a big office a duplicate is caught because several people touch a record. On your own you are the only person who would ever notice, you are noticing while doing something else, and the message that goes to the wrong version of somebody goes out under your own name.

### How do I know it is working after it goes live?

Watch the review queue rather than the dashboard. A queue that is empty in week one usually means the matching is too confident rather than that your data is clean, and a queue nobody opens is the same as no matching at all. The other check takes a minute: pick a contact, change one field in each system in turn, and see what the other side says afterwards.

## What to do about it

Search your own name in your own CRM. That is the whole assignment, it costs nothing, and it settles in one screen an argument that people have in meetings for months.

If more than one of you comes back, you already know what the automated message going out on Tuesday is addressed to. And you know something else, which is that it was never a discipline problem, because nobody typed anything wrong. Two systems were separately right about the same person, and nothing in the building had the job of noticing.

The pieces are drawn on [the RealtyLT AI page](/ai#crmsync); what writes back to what is set out on the [two-way CRM sync page](/services/crm-sync). Should you prefer somebody to go through your fields alongside you and say honestly which parts of this are a week and which are an afternoon, the [AI audit](/services/ai-audit) is exactly that hour.

The other half of this story is the systems doing the writing: [what happens when the phone rings and nobody picks up](/blog/ai-voice-agent-missed-calls-real-estate), [what a website conversation at midnight produces](/blog/ai-chat-assistant-real-estate-website), and [the busywork the wiring between them removes](/blog/workflow-automation-real-estate-business).

Katherine is one person. Your database is entitled to know that.

[[scene:funnel]]`;

export const GEO_LANDING_PAGES_POST = `You serve nine towns and you rank in one of them, which is the one your office sits in. Somebody points out that you could have a page for each of the other eight by Friday, and they are right, because a machine will write eight pages about eight towns in the time it takes to make coffee.

So the pages get made. Then, a few weeks later, you open two of them side by side to check something, and you read them properly for the first time.

Page four and page five have the same four paragraphs in the same order. The same sentence about the character of the housing stock. The same promise about local expertise. The same three questions and the same three answers underneath them. The only thing that changed between the two is the name of the town, and it changed six times.

Nobody did anything wrong here. Every one of those pages is grammatical, on brand and technically correct. And a person who lives in either of those towns would put the page down after two sentences, which is the same conclusion a search engine is going to reach by a different route.

[[scene:in-short]]

## Why a page and not a profile

It is worth being clear about what this is for, because the obvious alternative is free and most agents should do that one first.

The short list of businesses at the top of a local search, the one with the map above it, ranks businesses rather than pages, and one of the three inputs Google publishes for it is how far the searcher is standing from your front door. That is a physical fact about your office and no amount of work moves it. Which means there is a hard edge to it: past a certain distance you are competing against somebody who is simply closer, and they win.

A page has no such input. An ordinary indexable page about the work you do in a particular place competes on what is written on it, which is why one page per area is the oldest tactic in local marketing and why every agency in the world offers it. It is also the reason this article exists, because the tactic has a well-known failure mode with a name, and the name is in Google's published policy rather than in somebody's blog post.

There is a second reason worth naming and it is newer. A growing share of these questions never reach a list of links at all: somebody asks an assistant which agents work in a particular town and gets a paragraph back. What gets quoted in that paragraph is text that answers a question directly on a page that is genuinely about the thing. The same writing that makes an area page worth reading is the writing that makes it quotable, which is convenient, and it is the only part of this whole subject where the two audiences want exactly the same thing.

## What Google's spam policy actually names

Most of what is written about location pages cites a Google policy that has since been rewritten. The current [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) name this tactic in two separate entries, and the second one did not exist when most of the advice you will find was published.

The first is doorway abuse. The policy defines it as sites or pages created to rank for specific, similar search queries, which lead users to intermediate pages that are not as useful as the final destination. Among its own examples is having multiple domain names or pages targeted at specific regions or cities that funnel users to one page. Read the mechanism rather than the label: the thing being described is a page that catches a query and passes the person along to somewhere else. The offence is the handover.

The second is scaled content abuse, defined as many pages generated for the primary purpose of manipulating search rankings and not helping users. Its examples include creating many pages where the content makes little or no sense to a reader but contains search keywords, and stitching or combining content from different web pages without adding value. Here the offence is not the number of pages. It is what is on them at that number.

Both entries are worth reading in full, because between them they put four questions to anybody who is about to build a set of these.

[[scene:two-names]]

## The example that is about the thing we sell

There is a sentence in the scaled content entry that anybody selling this service should be made to read out loud. The first illustration Google gives is using generative AI tools or other similar tools to generate many pages without adding value for users.

That is not a description of a hypothetical bad actor. It is a description of the cheap version of this exact product, and there is a version of ours that would fit it perfectly: hand over a list of towns, generate a page for each, publish. If somebody offers you that, the policy has already named it, and the fact that the pages were written by a good model rather than a bad one changes nothing, because the phrase in the policy is not about how the words were produced. It is about whether anything was added.

Google has said the same thing in plainer language elsewhere. Its guidance on helpful content is explicit that using automation is not the problem in itself, and the questions it tells creators to ask themselves are about the output rather than the tool. That is the honest position, and it is also ours: a draft written in ninety seconds is fine. A page published in ninety seconds is not, and the difference between them is a person who knows the place reading it before it goes live.

[[scene:plate]]

## What separates a real area page from a doorway

Google publishes a self-assessment for exactly this question and almost nobody in this category has read it. Its [guidance on creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) is a list of questions to ask about your own work, and three of them land directly on area pages.

The first is whether the content clearly demonstrates first-hand expertise and a depth of knowledge, and the example Google gives inside the brackets is expertise that comes from having actually used a product or service, or visiting a place. Visiting a place. It is the whole test, sitting in a parenthesis, and it cannot be written around, because what is being asked for is not a style of prose. It is a fact about whether you have been there.

The second is a pair of warning signs: whether you are producing lots of content on many different topics in the hope that some of it might perform well, and whether you are using extensive automation to produce content on many topics. Answer yes to either and the document's own conclusion is that you are making search-engine-first content. Note what the suggested remedy is not. It is not better writing.

The third is the one that quietly explains why every thin location page in this industry looks the same. The list asks whether you are writing to a particular word count because you have heard Google has a preferred one, and then answers itself in a bracket: no, we do not. Somewhere a long time ago a number got into circulation and the whole category has been padding to reach it since.

[[scene:the-test]]

## Repetition is measurable, and somebody measured it

There is a temptation to treat all of this as a matter of taste, as if the difference between a real page and a doorway were something only a human editor could feel. It is not. Sameness is one of the cheapest properties in the world for a machine to measure, and there is a paper that shows how cheap.

In 2006 four researchers, three of them at Microsoft Research and one at UCLA, took a crawl of 105 million pages, drew a uniform random sample of 17,168 English pages out of it, and classified every one of them by hand as spam or not spam. That sample is the foundation of everything else in the [paper](https://www.ambuehler.ethz.ch/CDstore/www2006/devel-www2006.ecs.soton.ac.uk/programme/files/pdf/3052.pdf): 2,364 of the pages, 13.8%, were judged to be spam.

Then they went looking for properties that predicted it, and one of the properties is the interesting one here. They compressed every page and measured the compression ratio, on the reasoning that a page which says the same thing repeatedly compresses better than a page that does not. Among pages that compressed to a quarter of their size or better, 70% were judged spam.

The honest limits are large and worth stating before anybody quotes this at a client. This is the web of two decades ago. Spam is what four researchers judged it to be. The measurement is about repetition inside one page, and a set of near-identical town pages is repetition across pages, which is a different measurement that nobody has published a figure for. And a perfectly good page with a large navigation, a footer and a repeated call to action compresses well too, which is exactly why the authors test ten different content heuristics and treat this as one of them rather than as a rule.

What survives all of that is the cheapness. You do not need a language model to notice that eight pages are the same page. You need a compression library and a few seconds.

[[scene:redundancy]]

## What actually goes on a page that is about somewhere

The useful question is not what to avoid. It is what a page has on it that a template cannot produce, and the answer is short enough to be uncomfortable, because everything on the list has to come from you.

It has the work you actually did there. A closing on a named street, a rental you managed, a listing that sat and then did not, a buyer who wanted one thing and bought another. Specific, checkable, and about a real transaction rather than about your general enthusiasm for the area. This is the material that does not exist for a town you have never worked in, which is why the honest version of this project starts with a list of areas that is shorter than the one you wanted.

It has the questions people actually ask about that place, answered in the first sentence rather than in the fourth paragraph. What the taxes are like compared to the next town. Whether the trains are any good. Which streets flood. What the difference is between the village and the town of the same name, which in this valley is a real question with a real answer and one that catches people out.

It has something a person who lives there would recognise. Not scenery. The thing everybody who lives there knows and nobody writes down: where the traffic actually backs up, which side of the road the good light is on in the afternoon, what happens to the main street in the third week of September.

And it has one way to get in touch that belongs to you. A form on your own page rather than a link into somebody else's directory, so that the person who read all of that arrives in your records rather than in a list you rent back later.

[[scene:page-path]]

[[scene:geo-calculator]]

## The part that is regulated, and it is not the search engine

Everything above is a commercial question. This section is not, and it is the one nobody selling area pages will raise with you.

An area page is an advertisement, and it is an advertisement about a community rather than about a house. The regulations under the Fair Housing Act are specific about both halves of that, and they are older than any of this technology.

The rule on advertising is [24 CFR 100.75](https://www.law.cornell.edu/cfr/text/24/100.75). Its second paragraph is broader than most people expect: the prohibitions apply to all written or oral notices or statements by a person engaged in the sale or rental of a dwelling, and written notices and statements are defined to include any applications, flyers, brochures, deeds, signs, banners, posters, billboards or any documents used with respect to the sale or rental of a dwelling. There is no list of technologies in that sentence and there does not need to be one. A page on your website is a document used with respect to the sale of dwellings.

Then comes the paragraph that is precisely about this service. Among the practices the rule names as prohibited is selecting media or locations for advertising the sale or rental of dwellings which deny particular segments of the housing market information about housing opportunities because of race, colour, religion, sex, handicap, familial status or national origin. Read that beside a decision about which eight towns get a page and which four do not. Nobody is suggesting that choosing where to advertise is unlawful. What the rule says is that the choice is a regulated act, which is a different and more uncomfortable statement, and it means the reason for the list has to be a business reason you could say out loud.

The second rule is about what the page says. [24 CFR 100.70](https://www.law.cornell.edu/cfr/text/24/100.70) covers what are generally referred to as unlawful steering practices, and two of its examples are written as if somebody had an area page open. It names discouraging any person from inspecting, purchasing or renting a dwelling because of the race, colour, religion, sex, handicap, familial status or national origin of persons in a community, neighbourhood or development. And it names discouraging the purchase or rental of a dwelling by exaggerating drawbacks or failing to inform any person of desirable features of a dwelling or of a community, neighbourhood or development.

Sit with the second one, because it is not the one people expect. Failing to inform. A set of pages where four towns get eight hundred enthusiastic words and two towns get two hundred flat ones is a set of pages that describes some communities as more desirable than others, and it did that through effort rather than through a sentence anybody wrote.

[[scene:complaints]]

[[scene:pull-quote]]

## What an area page may and may not say

The practical line is easier to hold than the regulation makes it sound, and it comes down to what the sentence is about.

Write about the housing and the transaction. Prices, taxes, inventory, how long things sit, what the commute costs in time, what a survey usually turns up on older properties in that part of the county, what you have actually sold there. Every one of those is a fact about property, it is checkable, and it is what somebody reading an agent's area page came for.

Do not write about the people. This is the whole line and it is simpler than the alternatives people reach for. Descriptions of who lives somewhere, who a place is suited to, what kind of family would be comfortable, which community a neighbourhood belongs to: none of that is about the housing, all of it is about the residents, and it is the exact territory the steering rule covers.

Two habits deserve naming because they are so common they read as neutral. School ratings pasted onto every page are a proxy that correlates strongly with things the Act protects, and if you publish them you have made a statement about desirability using somebody else's numbers. Crime data is the same shape and worse, because the summaries are usually unsourced. If a reader wants either, they can get both from the primary source in less time than it takes you to write a paragraph, and the honest move is to say where to look rather than to characterise a community.

And treat the areas evenly. Not identically, because identical is the failure this whole article is about, but evenly: comparable effort, comparable honesty about the drawbacks, comparable enthusiasm where it is earned. The rule about failing to inform is a rule about the shape of the whole set rather than about any one page in it, and the shape of the set is a thing only you can see.

## What it costs, and how long it takes

The software is not the line that matters here. What the bill tracks is how much of the material has to be extracted from you, because you are the only place it exists.

An agent with a tidy record of what they have closed, where, and for whom is a fast project: the facts are already written down and the work is turning them into pages that answer questions. An agent whose knowledge of six towns lives entirely in their head is a slower one, and most of that time is a conversation rather than a keyboard. That conversation is worth having whether or not any pages come out of it, which is the second-best argument for doing this at all.

There is a smaller ongoing cost that everybody forgets to budget for, which is going back. The proof on these pages ages: the closing was three years ago, the listing sold, the tax figure moved, the shop you mentioned closed. Most of them need a short sitting once a year, the ones that earn their keep need more than that, and a set of area pages nobody revisits becomes a public record of when you stopped paying attention.

The one thing we will not quote is a traffic estimate, and it is worth saying why rather than leaving a gap. Nobody publishes the number of people searching for your service in your particular town with a stated method; the figures that circulate come from tools that estimate them and do not show their working. Every article in this category leans on those numbers. This one refuses them, which makes it less impressive and more useful.

[[scene:plate-two]]

[[scene:offer]]

## What it does not do, and should not pretend to

It does not rank a place you do not work. There is nothing true to put on that page, both a reader and a search engine notice, and the pages you cannot fill are the ones that make the whole set look like a template.

It does not put you into an AI answer on request. Nobody controls what an assistant quotes and anybody who says otherwise is describing an experiment rather than a product. Writing a page that answers questions directly makes it quotable. That is the only lever there is, and it is not a guarantee.

It does not replace the rest of local search. A page for each area is one surface. The Business Profile, the reviews and the mentions on other people's websites are another, they are decided by different machinery, and the profile is usually the cheaper thing to fix first.

It does not survive being left alone. Every fact on these pages has a date attached whether or not you print one, and the difference between a page that earns attention for years and a page that quietly embarrasses you is somebody going back to it.

And it does not make the list of towns longer than it is. This is the one people find hardest, because the whole appeal of the tactic is scale. The number of areas you can write honestly about is a fact about your career so far, and no tool changes it.

[[scene:wasted]]

## How to test whether a page is about anywhere, in twenty minutes

Four checks. All of them are free, none of them need a tool, and any page in this industry can be run through them tonight.

Delete the town name from the page, everywhere it appears, and read what is left. If you cannot tell which town it was about, you have your answer, and so does everybody else. This is the single most useful thing in this article and it takes ninety seconds per page.

Open two of your pages side by side and read the first paragraph of each out loud, one after the other. Sameness is much easier to hear than to see, which is why proofreading them one at a time never catches it.

Count the checkable facts on the page: a street, a price, a date, a number, a name of something that exists. Then count the sentences that could have been written by somebody who has never been there. A page where the second number is larger than the first is a page you have not written yet.

Then hand it to somebody who lives there and watch their face. Not for approval, for recognition. The moment worth waiting for is the small one where they say that is true, or better, where they correct you, because a correction means the page was specific enough to be wrong, and specific enough to be wrong is the whole bar.

## Common questions, answered honestly

### What are GEO or area landing pages, in plain terms?

They are ordinary pages on your own website, one for each place you work, written so that somebody searching for your service in that place finds a page that is genuinely about it rather than a page listing every town you cover. GEO now carries a second meaning as well, generative engine optimisation, which is the practice of writing pages that an AI assistant can quote when it answers a question. In practice the two want the same thing: direct answers to real questions, on a page that has something on it only somebody who works there would know.

### How is this different from local SEO?

They compete on different surfaces and are decided by different things. Local SEO is about your Business Profile and the short list of businesses at the top of a nearby search, where Google publishes three inputs and one of them is how far away the searcher is. Area pages are ordinary web pages competing on what is written on them, which is why they can reach places your profile cannot. Most businesses should finish the profile first, because it is cheaper, faster and does not carry the risk described in the rest of this article.

### Are location pages considered doorway pages by Google?

They are if they behave like doorways. The policy defines doorway abuse as pages created to rank for specific, similar queries which lead users to intermediate pages that are not as useful as the final destination, and it names pages targeted at specific regions or cities that funnel users to one page. A page that answers the question it was found for, on its own, is not doing that. A page whose only purpose is to catch the query and push the reader somewhere else is, whatever it looks like.

### Is it against the rules to use AI to write them?

Not in itself, and Google says so directly in its guidance on helpful content, which frames automation as a question about the output rather than about the tool. What is named in the spam policy is using generative AI tools to generate many pages without adding value for users. The distinction is whether anything was added between the draft and the publication, and in practice that means a person who knows the place read it and changed it. A page nobody read is the case the policy is describing.

### How many pages should I have?

As many as you have something true to say about, which is almost always fewer than the list you started with. There is no threshold at which a set of pages becomes spam and no number that makes it safe. The calculator above is deliberately built on the only two things anybody can honestly supply, which are how many areas are on your list and how many of them you have actually worked in.

### Can I write a page for a town I want to work in but have not yet?

You can, and it will be the weakest page in the set, and it is worth being deliberate about it rather than pretending otherwise. If you do, write it as what it is: a page about that market from somebody who works one town over, with the facts you can genuinely stand behind and no invented familiarity. That is a defensible page. A page claiming years of local expertise you do not have is not, and it is the kind of claim a person who lives there will spot in a sentence.

### What about fair housing? Is any of this risky?

The advertising rules apply to a web page exactly as they apply to a flyer, and the regulation is explicit that written statements include any documents used with respect to the sale of a dwelling. Two things follow. Write about the housing and the transaction, not about who lives somewhere or who a place would suit. And treat your areas evenly, because the rules name both selecting where to advertise in a way that denies parts of the market information, and discouraging somebody by failing to inform them of the desirable features of a neighbourhood. Uneven effort across a set of area pages is a real exposure and it is invisible from inside any single page.

### Will this get me quoted in ChatGPT or an AI answer?

Sometimes, and nobody can promise it. What gets quoted is a passage that answers a question directly, in plain language, on a page an assistant can read. That means a real question as a heading and the answer in the sentence underneath it, rather than three paragraphs of positioning followed by the fact. It is worth doing because the same format is the one that works for a human being in a hurry, which means nothing here asks you to write worse in order to be quoted more.

## What to do about it

Take the list of areas you want pages for and put a mark next to every one where you can name a street you have worked on. Not a town you have driven through. A street.

That shorter list is the project. It is probably half of what you wrote down, and it beats the long version outright, because every page on it can carry something checkable and every page you left off would have been the one that made a reader stop trusting the rest.

Then take the two pages you already have that you are least sure about, delete every mention of the town from both, and read what remains. If the two documents are now the same document, you have learned the whole of this article in four minutes, and you have also found the first two pages worth rewriting.

[[scene:funnel]]`;

export const LOCAL_SEO_POST = `On a Tuesday in February a woman sat in her car outside a school with eleven minutes to fill. Her sister had sold a house badly the year before, and that morning, in the way people actually decide things, she had decided she was going to get this right. She typed four words into her phone.

Three businesses came back, with a small map above them and a row of stars under each name. She read them for about as long as it takes to read three names, tapped the second one, and left a voicemail.

You were not on that screen. You have never known this happened and there is nowhere you could go to find out. It is not a lost lead, because it never became a lead. Nothing arrived in the CRM because nothing was sent. The most ordinary way a stranger picks an agent produced no record of you at all.

The part worth knowing is that the order she saw was neither an accident nor a secret. Google publishes what decides it, in a paragraph almost nobody in this industry has read, and one of the three things it names is a fact about you that no amount of money or effort will change.

[[scene:in-short]]

## The search that already happened, and why you cannot see it

Every other way a client finds you leaves a trace. A referral comes with a name attached. A portal inquiry arrives with a timestamp. Even the person who does nothing at all with your open house has stood in a room you were in.

Local search leaves nothing. A person types a phrase into a phone, three businesses appear, they choose one, and the two they did not choose are never told. There is no impression count on a search you lost, no notification, no weekly digest of the times your name was not in the list. This is the only meaningful channel in the business where the failures are completely silent, and silence is why it is so easy to believe nothing is happening.

Something is happening. What you can see of it is one screen: the Business Profile's own performance report, which tells you how many people rang from the listing, how many asked for directions, how many tapped through to the website, and which searches surfaced you. It is not the whole picture and it is not a ranking report. It is the only genuinely first-party number in this entire subject, it is free, and in most small businesses nobody has opened it in a year.

It is worth separating two things that get called the same name. There is the map pack, which is the short list of businesses with the map above it, and there is the ordinary run of blue links underneath. They are ranked by different machinery and they are won in different ways. This article is about the first one, because it sits above everything else and because the person in the car never scrolled far enough to reach the second.

## What Google actually publishes about this

Most of what is written about local rankings is somebody's inference from watching results move. The document underneath it is short, public and free, and it is worth reading rather than reading about.

Google's [page on improving your local ranking](https://support.google.com/business/answer/7091) opens the section on ranking with a warning rather than a technique. There is no way to request or pay for a better local ranking on Google, it says, and it says the algorithm details are kept confidential to make the ranking system as fair as possible for everyone. Anybody offering to place you is either selling something that does not exist or selling something Google would suspend you for.

Then comes the sentence the whole industry is built on top of. Local results, the page says, are mainly based on relevance, distance and popularity. Underneath, the three subheadings read Relevance, Distance and Prominence, and the third one has quietly changed names between the summary and the detail. That is a small thing, but it is the kind of small thing worth noticing on a page this heavily quoted, because the word people repeat is prominence and the word in the sentence is popularity, and neither one is defined anywhere with a number.

Relevance is described as how well a Business Profile matches what someone is searching for, and the advice for improving it is to provide complete and detailed business information. Distance is how far each business is from the customer who is searching, and when the customer has not said where they are, Google uses what it already knows about their location. Prominence is how well known a business is, and the page says it is based on information like how many websites link to your business and how many reviews you have.

That is the whole published model. Three inputs, no weights, no thresholds, and one sentence saying the details are deliberately withheld.

[[scene:ranking-factors]]

## The input you cannot do anything about

Distance is the one that changes how you should think about all of this, and it is the one nobody selling local search wants to dwell on.

Your presence on the map has a shape. It is roughly centred on the address you verified, it fades as you move away from it, and it is competing against a different set of businesses in every direction. The person in the car was ranked against whoever was near that school. Fifteen minutes north, the same search produces a different three, and one of them may well be somebody you have beaten on service every time you have met them.

Google's [guidelines for representing your business](https://support.google.com/business/answer/3038177) put a number on the outer edge of this, and it is the only number in the whole subject that is stated plainly. The boundaries of a profile's overall service area, the guidelines say, should not extend farther than about two hours of driving time from where the business is based. That is generous, and it is also a hard statement that a service area is not a marketing decision. It is a description of where you are.

So there is a limit built into this work, and it is honest to say it early. Local search will help you win the ground around you. It will not put you on the map in a town twenty-five minutes away where somebody else's office actually sits, because the thing being ranked is a business with an address and the address is one of the three inputs. That is a real gap, and the answer to it is a different surface entirely, which is an indexable page for each area you genuinely serve. That has its own rules, its own risks and its own article.

[[scene:plate]]

## Why the top of a very short list is worth more than it should be

There is an assumption underneath everything written about ranking, which is that being first is worth more than being third for the sensible reason that people compare the options and the first one is usually the best. It is worth knowing that somebody tested that, and that it is only partly true.

A group at Cornell put 22 people in front of Google with an eye tracker running, and put a proxy between them and the search engine that could quietly rewrite the results page. Sixteen of them produced usable data. Some got Google's ordering untouched, some got the top two results swapped, and some got the whole page reversed. Nobody was told, and the paper records that when asked afterwards, none of the subjects had suspected any manipulation. A separate panel of judges then rated the results by how promising each one looked, without knowing what anybody had clicked.

The [paper](https://www.cs.cornell.edu/people/tj/publications/joachims_etal_05a.pdf), published in 2005, reports the result as counts because the counts are small, and they are worth reading in that form. When the reader clicked exactly one of the top two links and the judges had rated the first one better, the click went to the top link nineteen times out of twenty, which is what you would hope. When the judges had rated the second one better, the click still went to the top link five times out of seven. And in the group where the pair had been secretly swapped, so the link on top was there for no reason at all, the click still went to the top link ten times out of seventeen.

The authors call this a trust bias and their conclusion is a single sentence: users have substantial trust in the search engine's ability to estimate the relevance of a page, which influences their clicking behaviour. Read that beside a list of three businesses on a phone. Some share of the first business's calls are arriving because it is first, and that share is not earned in any sense a person would recognise as merit. It is an inheritance.

[[scene:trust-bias]]

## What prominence is made of, and what it is not

Here the industry consensus and the document disagree with each other, and there is no polite way to put it, particularly since this website was on the wrong side of the disagreement until this article was written.

Ask anybody what moves the map pack and you will get three things: a complete profile, consistent name, address and phone details everywhere you appear online, and recent reviews. The middle item is the one that funds an entire category of software. It is not in Google's document. What the document names under prominence is how many websites link to your business and how many reviews you have.

That does not make directory tidying worthless. A phone number that is wrong in four places is wrong for the people who ring it, which is reason enough, and links and directory entries are not always separable. It does mean that a plan built mostly on submitting your details to ninety directories is a plan built on something the ranking document does not mention, while the two things it does mention are the two that are hardest to buy: somebody else choosing to link to you, and clients choosing to write about you.

That is an uncomfortable answer for a service page and it is the true one. The prominence half of local search is mostly a consequence of being genuinely present somewhere, and the work that produces it looks like sponsoring the thing your town does in September, being the person a local reporter calls, and asking every single client for a review rather than the pleased ones. Software can keep all of that current. It cannot manufacture any of it.

## The profile rules that decide whether you can have one at all

Before ranking is worth thinking about, there is a shorter question that most agents have never checked, which is whether the profile they have is one they are allowed to have.

The same guidelines document names this business explicitly. Doctors, dentists, lawyers, financial planners and insurance or real estate agents are all listed together as individual practitioners, which is the category that gets a profile of its own. In the next breath the guidelines say that sales associates or lead generation agents for corporations are not individual practitioners and are not eligible for a Business Profile at all. Where you sit between those two sentences is a question about how you actually work rather than about what your card says.

The rest of the rules are the sort that get broken by somebody being clever. A practitioner is told not to hold several profiles to cover different specialisations. Where several public-facing practitioners share a location, the organisation gets its own profile and the practitioner's profile should be titled with only the practitioner's name, not the brokerage's. A solo practitioner at a branded location is told it is best to share the organisation's profile rather than start a competing one. And an address has to be an address: a rented mailing address you do not operate from is a virtual office and is not eligible, while a desk in a co-working space needs signage, staff during business hours and the ability to receive customers.

None of this is exotic and all of it is enforced by suspension rather than by a warning letter. A profile that disappears takes its reviews and its position with it, and the appeal is a form.

[[scene:profile-rules]]

## What local SEO actually does, week to week

Under the category name it is four unglamorous jobs, and the AI part is not the clever part. It is the part that does not get bored.

The first job is finishing the profile, which almost nobody has. Categories, every service written out, the service area drawn honestly, the hours including the strange ones, the address, the attributes, real photographs of a real place. Google's own advice for the relevance half is simply to provide complete and detailed information, which is an unsatisfying instruction precisely because there is no trick in it.

The second is keeping it true, which is where this decays. Businesses change quietly. A number moves, a service stops, an office is left, a holiday changes the hours, and none of those events tell the profile about themselves. A profile is at its most accurate on the day somebody fills it in and gets worse every day after that.

The third is feeding the two inputs the document actually names, which means a steady flow of reviews and the slow accumulation of other people's pages mentioning yours. The fourth is reading the report: how many calls, how many direction requests, which searches, this month against last. That last one is the difference between a service you can judge and a service you have to trust.

[[scene:the-work]]

[[scene:local-calculator]]

[[scene:pull-quote]]

## What renting the same attention costs

The obvious alternative to all of this is to buy the position, and the honest comparison is not that ads are bad. It is that almost nobody has measured what their ads are actually adding, and the one organisation that ran the experiment properly got an answer that surprised everybody.

In March 2012 eBay stopped bidding on search queries containing its own name on two search engines, while continuing to buy exactly the same terms on a third. That third one is the control, which is the whole point: without it you are comparing this month against last month and calling seasonality a result. Three economists then wrote up what happened in a [working paper](https://www.nber.org/system/files/working_papers/w20171/w20171.pdf) that was later published in Econometrica.

The naive comparison, before and after, said click volume was 5.6% lower once the ads stopped. Measured against the platform where the ads kept running, only 0.529% of the click traffic was actually lost, so 99.5% of it was retained. The people were still coming. They were simply arriving through the unpaid result sitting directly underneath the advert instead of through the advert.

The paper then does the same thing to the return on investment, and this is the number worth carrying out of it. Using ordinary regression on the observational data, the return came out at over 4,100% without controls and over 1,400% with time and geographic controls. Using the experiment, it came out at negative 63%, with a confidence interval that rejects the possibility of the channel yielding positive returns at all.

Be careful with this. It is eBay, a name tens of millions of people type deliberately, and the queries were ones containing that name. Nobody is typing your name, which is exactly why the brand-keyword half does not transfer. What does transfer is the shape of the mistake: the traffic that substitutes most cleanly for paid clicks is the traffic that was coming anyway, and no amount of dashboard staring will reveal that, because the dashboard is built from the observational data that produced the 4,100%.

[[scene:paid-search]]

## What it costs, and how long it takes

The first month is mostly repair, and repair is priced by how wrong things currently are. A single profile that is two thirds filled in, one address, one set of hours and a handful of reviews is a short piece of work. Three agents, an office profile and two practitioner profiles that disagree with each other, a phone number that changed in 2023 and a service area drawn around a wish is a longer one, and most of the time in it goes on finding out what is true rather than on typing it in.

After that the cost is a monthly rhythm rather than a project, and what drives it is how many surfaces have to stay current and how much of the review asking you want handled rather than remembered. There is no software licence here that dwarfs the rest. The recurring number tracks attention.

The honest answer on time is that the two halves move at different speeds. Fixing a profile changes what people see immediately, because the profile is a record rather than a ranking, and an accurate record with real photographs and current hours converts better on the day it goes up. Position is slower and it is not promised by anybody, including us, for the reason printed at the top of Google's own page.

There is one cost that never appears on a quote and it is the one that decides the outcome. Reviews arrive because somebody asks, every time, including on the deals that went sideways. If nobody in the business is willing to do that, the plan is missing one of the two inputs Google actually names, and no amount of profile maintenance replaces it.

[[scene:offer]]

[[scene:plate-two]]

## What it does not do, and should not pretend to

It does not buy a position, and this is not a disclaimer, it is a quotation. Google's page says in bold that there is no way to request or pay for a better local ranking. Any proposal that includes a promised position is either untrue or is describing something that will get the profile suspended.

It does not move you closer to anybody. Distance is one of the three published inputs and it is a physical fact. A business on the eastern edge of a county will lose searches on the western edge to somebody who is simply standing there, and the correct response to that is a different tactic rather than a better profile.

It does not survive a business that will not ask for reviews. Reviews are one of two things named in the ranking document, they cannot be bought without breaking policy, and the asking has to be systematic to produce a recent history rather than a cluster from 2023.

It does not fix a business that is hard to reach. A profile is a promise about hours, a phone that gets answered and an address a person can arrive at. Winning the search and then missing the call is an expensive way to fail, and the guidelines are explicit that a practitioner should be contactable at the verified location during the hours stated.

And it does not stay done. Everything above decays, quietly, in the direction of being wrong, and a profile nobody maintains is a profile slowly becoming a liability rather than an asset.

[[scene:wasted]]

## How to find out where you actually stand, in ten minutes

All of this is checkable tonight, for nothing, and the checking is more useful than any report anybody will sell you.

Open a browser you are not signed into, on a phone that is not yours if you can borrow one, and search the phrase a stranger would use for your service in the town you want to work in. Not your name. Write down the three businesses that come back. Do it again standing somewhere else in your market and write down the three that come back there. The difference between the two lists is distance doing its work, and it is the single most useful thing you will learn all week.

Then open your own Business Profile and read the performance screen. Calls, direction requests, website taps, and the searches that surfaced you, this month against a year ago. If you have never seen it, the number will either be higher than you expected, which means something is already working, or close to nothing, which means the listing is not finished.

Then go through the profile as if you were an inspector rather than the owner. Is the primary category the one a stranger would choose. Are all of your services written out. Are the hours right this week. Is the address one you actually sit in. Is the most recent review from this quarter or from two years ago.

Finally, count the reviews and count the closings you had last year, and put the two numbers beside each other. Most agents in this business are asking a small fraction of their clients, usually the ones who were already delighted, and the gap between those two numbers is the clearest picture of the prominence half you will ever get.

## Common questions, answered honestly

### What is local SEO for a real estate agent, in plain terms?

It is the work of being the business that comes up when somebody nearby searches for what you do. Most of it is not writing. It is a Google Business Profile that is complete, correctly categorised and actually true, a steady flow of recent reviews, other people's websites mentioning yours, and real pages for the places and services you cover. The AI part is maintenance rather than magic: keeping the profile current, keeping the review requests going out, and watching what the profile's own report says, which are the three things that stop happening the moment a human gets busy.

### How is this different from getting my website to rank?

They are two different competitions and they are decided by different things. The map pack ranks businesses, and the inputs Google publishes for it are relevance, distance and popularity, one of which is where the searcher is standing. The blue links below it rank pages, and distance is not one of the inputs in the same way. Practically, that means your website can be excellent and you can still be missing from the short list at the top, and your profile can be perfect and your website can still be invisible for everything except your own name. Most agents need both. Finishing the listing is normally the smaller job of the two.

### How do I get into the map pack?

Nobody can tell you how, because Google says out loud that it keeps the details confidential and that there is no way to request or pay for a place. What is known is the list of inputs it publishes. Finish the profile so relevance has something to work with, accept that distance is fixed, and work on the two things named under prominence, which are reviews and other websites linking to yours. Anybody giving you a more specific recipe than that is describing their own inference and should say so.

### How long does it take?

The accuracy half changes the day you do it: a finished profile with the right categories, real photographs and current hours is immediately more convincing to the person reading it, whatever it does to position. The position half is slow and is not guaranteed by anybody. The honest framing is that you are not buying a date, you are removing the reasons you are currently not eligible for a place, and then continuing to be the sort of business that accumulates reviews and mentions.

### Can I rank in a town my office is not in?

In the map pack, not really, and the reason is the distance input rather than any failing on your part. The other route is a normal web page, on your own site, covering what you have genuinely done in that town, because a page is judged by what is written on it. That is a separate piece of work carrying a separate risk, since a set of thin pages with the town name swapped is something Google's spam policy names specifically. Our article on area pages covers it properly instead of glossing it here.

### Do citations and directory listings still matter?

They matter for being correct and they are not what Google's ranking page names. That page lists links from other websites and reviews under prominence, and does not mention directory consistency at all. Keeping your details right everywhere is still worth doing, because a wrong phone number is a wrong phone number, and because some of those entries are links. What is not defensible is a plan whose main activity is submitting your details to a long list of directories while the two published inputs go untouched.

### Is this better than running Google ads?

They do different jobs and the honest comparison needs a measurement most people have never made. Ads deliver traffic the day you turn them on and nothing the day you turn them off. A ranking arrives slowly and keeps working. What the eBay experiment shows is not that ads do not work, it is that the returns most businesses believe they are getting come from observational data that overstates them by an enormous factor, and the only way to find out what yours are worth is to turn them off in one place and leave them on in another.

### Can anybody guarantee me a position?

No, and the sentence to quote back is Google's own: there is no way to request or pay for a better local ranking on Google. What can be guaranteed is the work. A finished profile, a review request that actually goes out every time, the mentions that come from being present somewhere, and a report you can read every month. Position is the outcome of those, not a product anybody can sell you.

## What to do about it

Go and be the woman in the car for ten minutes.

Borrow a phone, stand somewhere in your market that is not your office, and run the search a stranger would run. Look at the three names that come back and at how little information she had to choose between them. Then open your own profile beside it and see whether the thing she would have read is finished, current and honest.

If your name is in the three, the work is to stay there, which is duller and more important than getting there. If it is not, you now know something you did not know this morning, and it is not that you are worse than the second business she called. It is that a screen you have never opened is answering a question about you, over and over, to people you will never meet, and nobody has been checking the answer.

[[scene:funnel]]`;

export const AI_APPOINTMENT_BOOKING_POST = `On a Sunday evening in June somebody messaged about a house on Delavan. They wanted to see it. You were at dinner, you saw the message at nine, and you did the right thing: you called back first thing on Monday and had a good conversation.

Then the two of you looked for a time. Your Tuesday was gone, Wednesday they were away, Thursday you had a closing, and the first slot that worked for both of you cleanly was the following week. Thursday the ninth, half past six. You wrote it down. They sounded delighted.

Nine days later you drove out, put the lights on, and waited twenty minutes on the porch with the front door open.

Nothing about that story is a failure of service. You answered, you were pleasant, you were flexible, and you lost the afternoon anyway. In the CRM it will be logged as an appointment, and if anybody counts appointments this month it will be counted.

The part worth knowing is that this outcome was more likely than you think on the day you agreed to it, and that the reason has been measured. Not by anybody in real estate.

[[scene:in-short]]

## The gap nobody measures, because it does not look like a loss

Every business with a calendar in it tracks two things: how many inquiries came in, and how much work came out. Almost nobody tracks the distance between them, which is the number of days between the moment somebody asked for your time and the moment that time actually arrives.

That number has a name in the scheduling literature, lead time, and there is a study that measures what it does. Michael McMullen and Peter Netland pulled every appointment out of the scheduling database at the University of Virginia Eye Clinic for a twelve month period, 51,529 of them, and sorted them by how far in advance each had been booked. Their [paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC4370946/) reports two clinics separately, one run by residents and one by faculty. Across the whole year the resident clinic missed 21.7% of its appointments and the faculty clinic 6.6%, which is a useful reminder before any of the rest of it: the level is a property of who your customers are.

Both curves point the same way and neither is subtle. In the resident clinic, appointments made nought to two weeks ahead were missed 9.1% of the time and appointments made six months ahead were missed 38.3% of the time. In the faculty clinic, whose patients miss far fewer appointments to begin with, the same comparison runs from 2.4% to 6.9%. The authors also ran the arithmetic the other way and estimated that if every appointment in the resident clinic had been booked within two weeks, the overall no-show rate would fall by nearly sixty percent.

A patient is not a buyer and an eye clinic is not a brokerage, and the percentages above are not a benchmark for anything you do. The direction is what should worry you, because the direction is a property of people rather than of ophthalmology, and because the most natural, most polite, most accommodating thing you do all week is push an appointment out until it suits everybody.

[[scene:lead-time]]

## Why distance kills an appointment

The chart measures the effect and does not explain it, so it is worth being honest about which parts of the explanation are evidenced and which are just how people work. The first reason below is the one the data supports directly. The other three are mechanisms, offered as mechanisms.

What they have in common is that none of them is about the person being unreliable, which matters because the instinct after an empty afternoon is to decide something about the character of the people who did not come. They were not being rude. They made a plan while they were motivated, the plan sat outside for a week and a half, and the weather got to it.

[[scene:why-they-drop]]

[[scene:plate]]

## The second half, which is the reminder

Of those four, exactly one can be fixed by software on its own, and it happens to be the one with the best evidence behind it anywhere in this article.

In 2007 four researchers at Sir Run Run Shaw Hospital in Hangzhou took 1,859 people with booked appointments at a health check-up centre and randomly assigned them into three groups. One group got a text message 72 hours before their appointment. One got a phone call at the same interval, with the same content. The third got nothing, which was the normal practice. 1,848 of them were analysed.

The [result](https://pmc.ncbi.nlm.nih.gov/articles/PMC2170466/) is one of the plainest numbers in this whole series. Attendance was 80.5% with no reminder, 87.5% with a text and 88.3% with a call. Both reminder groups beat the control by a margin the paper reports as statistically significant, and the difference between the text and the call was not significant at all. The text cost less: 0.31 Yuan per person who turned up against 0.48 for the phone calls.

Read that as a shape rather than as a promise. Nobody has run this trial on people going to look at a house, the population in Hangzhou had already paid for the appointment they were being reminded about, and 2007 was a different century for text messaging. What survives the translation is the least glamorous sentence in this article. One reminder, sent automatically, is the highest return per unit of effort of anything on this page, and it is also the first thing people switch off because it feels like nagging.

[[scene:reminders]]

## What AI appointment booking actually does

Under the category name it is four small things in a row, and only the last one has a trial behind it.

It answers immediately, which is the part that gets sold. It offers times, which is where the real judgement lives, because a system that lists a fortnight of availability has handed the reader the choice that the evidence above says will hurt them. It writes the slot down in both places. And then it reminds.

Notice what is not on that list. It does not persuade, it does not qualify, and it does not have a personality. The value is not in any single step but in the fact that all four happen every time, at nine on a Sunday evening as reliably as at eleven on a Tuesday morning, which is the one thing a person with a phone and a full week genuinely cannot do.

[[scene:four-moves]]

[[scene:the-booking]]

## What reading your calendar should actually mean

Every product in this category says it reads your calendar. That sentence covers two quite different levels of access and it is worth knowing which one you are being asked for, because one of them is a great deal more intrusive than the other and most buyers never ask.

The narrow version is a free and busy query. Google's Calendar API has a specific endpoint for it, and the [documentation](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query) describes exactly what comes back: it returns free and busy information for a set of calendars, and each calendar's answer is a list of the time ranges during which it should be regarded as busy. That is all. Not the titles, not the attendees, not the notes, not the address of the appraisal you are driving to. A wall of blocks.

The wide version is full read access to the events themselves, which some products want because it lets them do cleverer things, and which means the vendor's systems can see who you are meeting and what about. That may be a perfectly reasonable trade. It is not a reasonable thing to agree to without noticing, particularly in a business where a calendar entry can reveal that a client is selling before anybody else knows it.

There is a second half to this that nobody markets, and it is the writing rather than the reading. A system that can only read is a system that cannot hold a slot, which means two people asking at the same time can be offered the same six thirty. The slot has to be written the moment somebody takes it, not at the end of the conversation and not in a nightly sync.

## What a booking is, technically, and why most of them are not one

Here is a distinction that sounds pedantic and is the difference between an appointment that happens and one that does not.

When a booking system tells you it has confirmed the appointment, it has done one of three things. It may have sent a text message that contains a date and a time, which is a sentence. It may have attached a calendar file, which is a document. Or it may have sent an actual invitation, which is a transaction with a reply.

The format underneath all of this is iCalendar, defined in [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html), and the specification is unusually clear about the difference. A calendar object carries a property called METHOD, and the standard says that if that property is absent then a scheduling transaction must not be assumed, and the object is merely being used to transport a snapshot of some calendar information without the intention of conveying a scheduling semantic. In plainer words: an attachment with no method on it is a picture of an appointment. It may land nicely on a phone and it may not, and nothing comes back to tell you either way.

The same specification defines an alarm component, which is the reminder that lives on their device rather than on your server. It costs nothing, it does not depend on a text message arriving, and it fires whether or not your system is having a good day.

So the question to ask a vendor is not whether it sends a confirmation. It is whether the person on the other end gets something their calendar treats as an invitation, with an alarm attached, and whether you find out when they accept it. The three answers are visibly different on a phone, and one of them is a booking.

[[scene:booking-path]]

[[scene:booking-calculator]]

[[scene:pull-quote]]

## What to do about the ones who still do not turn up

Even with the shortest lead times and the best reminders, some proportion of appointments will not happen, and the difference between businesses is almost entirely in what happens in the following hour rather than in the rate itself.

The hour after is the whole opportunity. Somebody who missed a six thirty is, at seven, aware they have missed it and mildly embarrassed about it, and a short message offering a new time with no reproach anywhere in it is the cheapest recovery available to you. Leave it until the next morning and you are competing with everything else in their inbox and with their own reluctance to reopen the subject.

Write the message so it assumes something got in the way, because usually something did. Two lines, one new time, and nothing that requires an apology to answer. Any system that can book can also do this, and most of the ones on the market do not, because the feature nobody demos is the recovery.

Then count them. Not to punish anybody, and not as a metric anybody is judged on, but because a business that does not know its own attendance rate has no way to tell whether any of this worked. The number you want is simple: of the last twenty appointments you agreed, how many happened. Almost nobody in this industry can answer that from memory, and the answer is usually a few points worse than the guess.

## How to test one before you buy it

Four questions, and every one of them can be answered inside a demo without knowing anything technical.

Book yourself an appointment from your own phone, in front of them. Watch what arrives. If it is a text message with a time in it, that is a sentence, not an invitation. Open whatever it sends and see whether your own calendar offers you the option to accept it and whether it sets a reminder by itself.

Ask which times it offered you, and why those. If it offered you the next ten openings in a list, ask what happens if you change it to offer the soonest two. A product that cannot answer that has not thought about the only part of this that the research is actually about.

Ask what access it needs to your calendar, in the vendor's own words, and whether free and busy access is enough. If the answer is that it needs to read the events themselves, ask what it does with them and where those events are stored. There may be a perfectly good answer. There should be an answer.

Ask what happens when two people take the same slot within a minute of each other, and then ask them to demonstrate it. This is the failure that embarrasses you in front of a client rather than in front of a log file, and the honest vendors will already have a story about the time it happened to them.

[[scene:offer]]

[[scene:plate-two]]

## What it costs, and how long it takes

The software is the smaller line and it is not usually the thing that decides the bill. What decides the bill is how many places have to agree about your availability. One calendar and one channel is a short project. Three agents, two shared calendars, a portal that also takes bookings and a phone line that books through the voice agent is a different exercise, and most of the work in it is not the building.

The recurring cost that does scale is messaging, because confirmations and reminders go by text and text messages are billed one at a time. It is a small number per appointment and it is the one line on the invoice that grows when things go well, which is the right shape for a cost to have.

Setup is short for the same reason it is short on any of these: the machinery is standard and the decisions are not. The decisions that take the time are what the appointment types actually are, how long each one really needs including the drive, what hours you are honestly willing to be booked into, and what the system should do when somebody asks for a Sunday. Every one of those is a question about your business, and every one of them will still be true if you never automate anything.

The cost nobody puts on a quote is the discipline of keeping the calendar true. A booking system is only as good as the availability it can see, and a business where half the commitments live in somebody's head will get exactly the reliability that implies. That is not a reason to skip it. It is the first month of work, and it is worth doing whether the software arrives or not.

## What it does not do, and should not pretend to

It does not make anybody turn up. Reminders are the most reliable thing anybody has measured for attendance and they are still only reminders. Somewhere in your year is a person who confirmed twice and went to the beach.

It does not decide who is worth an appointment. This is the limit that costs real money and it is worth sitting with, because a system that fills your week faster will fill it with whoever asked. Booking speed and lead quality are separate problems with separate answers, and putting a booking assistant in front of an unfiltered inbox turns a quiet Saturday into a busy one without turning it into a better one.

It does not create time. If the week is genuinely full, the honest output is a longer lead time or a refusal, and both of those are worse than they sound given everything above. The uncomfortable version of this article's argument is that some inquiries are better served by somebody saying, plainly, that the soonest real slot is a fortnight away and asking whether that still works.

It does not run the appointment. It gets two people to the same address at the same time with the address written down. What happens in the next forty minutes is the part nobody has automated and the part you are actually paid for.

And it does not repair a calendar you do not trust. If you already override the calendar three times a week because it is wrong, a machine reading it will be wrong three times a week too, in public, to strangers.

[[scene:failure-modes]]

## Common questions, answered honestly

### What is AI appointment booking, in plain terms?

It is software that answers a request for your time straight away, offers times that are genuinely free by reading your calendar, writes the chosen slot onto both calendars while the conversation is still happening, and then sends the confirmation and the reminder. The AI part is only the conversation: understanding a message written the way people actually write, and holding a short exchange about times without sounding like a form. The booking underneath it is ordinary and unglamorous software, which is a good thing, because ordinary software is the kind that runs at nine on a Sunday.

### How is this different from sending somebody a booking link?

A booking link, of the kind most calendar products now offer, moves the work to the other person. They open a page, look at a grid of times, and choose one. That is a genuine improvement on phone tag, and it is also where a share of people quietly stop, because opening a link and reading a grid is a task and answering a message is not. What changes here is that the times arrive inside the conversation the person is already in, in the thread they were already typing in, and the answer is a word rather than a form. The two also fail differently, which is the more useful distinction. A link cannot notice that somebody asked for a Saturday you do not work. A conversation can notice, and can say so, and can offer the nearest thing you do have.

### Will it reduce no-shows?

Two parts of it will, and it is worth knowing which. The reminder is the part with real evidence: a randomised trial of 1,848 appointments found attendance of 80.5% with no reminder against 87.5% with a single text sent three days ahead. The other part is less obvious and possibly larger, which is that booking inside the first conversation tends to produce a much shorter gap between the ask and the appointment, and shorter gaps are associated with far better attendance in the clinic study above. Neither of those figures is from real estate, and anybody quoting you a no-show reduction for your business is quoting you a number nobody has measured.

### How does it know when I am free?

It queries your calendar. There are two levels of access and the difference matters: a free and busy query returns only the time ranges you are busy, with none of the contents, while full access lets a system read the events themselves. Ask which one a vendor wants. For pure booking, free and busy plus permission to create an event is enough, and anything beyond that should come with a reason.

### Can it book on the phone as well as by text?

Yes, and it is the same booking layer underneath. A caller can be booked mid-conversation by the voice agent exactly as a website visitor can be booked mid-chat, which matters mostly because it means one calendar rather than two and no chance of the two channels selling the same six thirty.

### What if somebody wants a time I do not have?

Then it should say so and offer the nearest alternatives, which is the boring correct answer, and it should never offer a slot you have blocked out. The more interesting question is what you want it to do with a request for a Sunday, or for eight in the morning, and that is a decision about your life rather than a setting. Decide it deliberately, because a booking system will enforce whatever you tell it with a consistency you would never manage yourself.

### Is a shorter lead time always better?

Not always, and the study is about attendance rather than about revenue. An appointment two days out is more likely to happen and it also gives somebody less time to arrange finance, get a partner to come, or organise childcare, and for some appointments those things matter more than attendance does. The finding is not that everything should be tomorrow. It is that the fortnight you drifted into because it suited the calendar has a cost, and now you know roughly which direction that cost runs in.

## What to do about it

Do the count, tonight, on paper. It takes ten minutes and it costs nothing.

Open your calendar and scroll back through the last twenty appointments you agreed with somebody outside the business. For each one write two numbers: how many days there were between the conversation and the slot, and whether it happened. Then work out the median of the first column and the share of the second.

That pair of numbers is the whole of this article in your own handwriting. If the median is under three days you are already doing the important thing and you do not need us. If it is nine, you now know what the empty porch on the ninth was, and it was not the person who did not come.

[[scene:funnel]]`;

export const REVIEW_AUTOMATION_POST = `Last Tuesday a woman in Beacon stood in her kitchen with a phone in one hand and two names on the screen. Both had been recommended by somebody she trusted. She had about ten minutes before she had to leave for the pool.

She tapped the first name. Twelve reviews, every single one of them five stars, and the most recent was from 2023.

She tapped the second. Thirty one reviews, an average of 4.6, the newest written eight days ago, and a three star from March with four lines underneath it from the agent explaining what had gone wrong with the appraisal and what he had done about it.

She called the second one.

The first agent will never find out that this happened. There is no notification for it and no line in any report. Nothing in the CRM records that a Tuesday evening in August went somewhere else on the strength of a date.

[[scene:in-short]]

## The number this is usually sold on, and why it is not in here

Seventy three percent of customers read reviews before they book. If you have been sold a reputation product in the last five years you have seen that figure on a slide, and until recently it was on our own service page, which is how this article started. It is unsourced, this article does not use it, and the paragraphs below are what happened when we went looking for the document behind it.

So we went hunting for the survey it is supposed to have come from. One survey in this field repeats every year, publishes its sample and its method on the same page as its findings, and is what almost everybody in the category is quietly paraphrasing: BrightLocal's Local Consumer Review Survey. The 2026 edition was run on a representative panel of 1,002 US adult consumers through SurveyMonkey, roughly a quarter of them in each of four age bands from eighteen to over sixty, and it says so on the page.

Seventy three is not a figure in it. What is in it is 97% who say they read reviews for local businesses at all, and 41% who say they always do when they are browsing. Neither of those is 73%, and neither of them is the claim the unsourced figure is usually pinned to.

It has been taken off that page, and it is not going to be propped up here either. Everything below rests on figures that are actually in the published survey, quoted alongside the question they answered, and on one piece of academic work where the thing measured was money rather than opinion.

One thing has to be said out loud about the survey before it is used. BrightLocal sells review software. A company with a commercial interest in the answer ran the questions, and the answers are what a panel says it does rather than what anybody was observed doing. Both of those are real limits and neither is a reason to throw it away, because the alternative on offer is a figure with no sample, no method and no document at all. Read it as a direction and not as a decimal.

[[scene:thresholds]]

## What a stranger actually does with your profile

Nobody reads your reviews. They scan them, once, for a few seconds, on a phone, usually while doing something else, and then they either call you or they do not.

That scan has a shape, and it is not the one most businesses optimise for. Almost everybody who worries about reviews is worrying about the average. The average is the least interesting thing on the page after the first two seconds, because everybody in your market has a good one. What separates two agents with 4.7 stars is everything underneath the number.

The woman in the kitchen never articulated any of this. She did not think, this profile is stale. She thought, without words, that one of these two people is busy right now and the other one might have retired. That impression came from a date, and it was formed before she read a single sentence.

[[scene:profile-scan]]

## What one extra star was worth, in the only study that measured money

Opinion surveys tell you what people say. There is one well known piece of work that measured what actually happened to a business's revenue when its rating changed, and it is worth reading properly because both its finding and its caveats are useful.

Michael Luca, then at Harvard Business School, matched Yelp's reviews to the revenue records that the Washington State Department of Revenue holds for every restaurant in Seattle, from January 2003 to October 2009. That is 3,582 restaurants across the period, about 1,587 open in any given quarter, measured against tax filings rather than against anybody's self-report. His [working paper](https://www.hbs.edu/ris/Publication%20Files/12-016_a7e4a5a2-03f9-490d-b093-8f951238dba2.pdf) reports that a one-star increase is associated with a 5.4% increase in revenue.

The clever part is what he did next, and it is the reason the number can be treated as a cause rather than a coincidence. Yelp displays a restaurant's rating rounded to the nearest half star. Two restaurants whose true averages sit a hair either side of a rounding threshold have almost identical reviews and are shown different ratings. Comparing those two groups isolates the effect of the displayed rating from everything else about the restaurant, and on that comparison an exogenous one-star improvement leads to roughly a 9% increase in revenue.

Two more findings are worth carrying away. The effect appears among independent restaurants and is statistically insignificant and close to zero for chains, because a brand name already answers the question that reviews answer. And the market response is largest when a restaurant has many reviews, which is a technical way of saying that a rating built on more reviews is believed more.

[[scene:yelp-lift]]

## Why the ask does not happen

Every business owner already knows they should ask. Nobody needs persuading. The ask still does not happen, and the reasons are worth naming because two of the three are solvable and one is not.

The first is timing, and it is almost the whole problem. The moment somebody is most willing to say something nice about you is the day the thing finished, and that is also the day you are least likely to be at a desk. By the time there is a quiet Friday afternoon to catch up on it, the closing is nine days old and the person has moved on to the next chapter of their life. Asking late does not produce a worse review. It produces no review, which is worse.

The second is that asking is genuinely awkward, in a way that is hard to admit to. You have just been paid a large sum of money by somebody you like, and the next thing out of your mouth is a favour. Most people would rather do almost anything else, so they intend to do it later, and later is a place where reviews go to die.

The third is fear, and it is the one that produces the actual misconduct in this category. If you ask everybody, some of them will say something you would rather they did not. That fear is where review gating comes from, and the survey above is the best argument against it: only 10% of that panel said they would use nothing below five stars, while 68% said four or better was enough. The room between four and five is where almost every real business lives, and it is much larger than the fear suggests.

[[scene:plate]]

## What review automation actually does

Underneath the category name it is a small and unglamorous piece of plumbing, and the shortest honest description is that it removes the two solvable reasons above and does nothing at all about the third.

Something in your systems already knows when a job is finished. A file moves to closed, a status changes, a calendar event ends. That event, rather than a person's memory, is what starts the message. The message goes out the same day, in your name, in a few sentences that sound like you rather than like a survey vendor, and it asks one question that takes a customer four seconds to answer.

Whatever comes back, the same Google link goes out. That is the sentence the rest of this article is about, and it is worth being blunt about how much of this industry does the opposite.

What the answer changes is what happens on your side of the wall. A rough score pushes the score, the words and the customer's name to you immediately, which is the difference between hearing about a problem while there is still an afternoon to fix it and reading about it on a Tuesday in a public place.

[[scene:three-moves]]

[[scene:the-ask]]

## The line you may not cross, and exactly where it is

Review gating is the practice of surveying customers first and only sending the public review link to the ones who answered well. It is sold as catching problems early, it is extremely common, and it is the specific thing the rules are about.

Google's [contribution policy](https://support.google.com/contributionpolicy/answer/7400114) has a section listing what merchants may not do. Two of its entries are the ones that matter here. The first is offering incentives, and the policy spells out the currency: payment, discounts, free goods or services, in exchange for posting a review, revising one, or removing a negative one. The second is a single sentence, and it is the whole argument: discourage or prohibit negative reviews, or selectively solicit positive reviews from customers.

Read that sentence twice, because most gating products are described in language designed to make it sound like something else. Sending the survey to everyone and the link to the fives is selective solicitation. The survey is not what the rule is about. The link is.

There are two more prohibitions in the same section that almost nobody mentions, and both of them cover practices that get taught as good practice. Merchants should not require or pressure people to write a review while they are on the premises, which covers the tablet at the closing table. And merchants should not request that specific content be included, with the policy giving as its own examples asking staff to solicit a certain number of reviews, or to solicit reviews mentioning a particular staff member. If you have ever been told to ask clients to mention the town you want to rank for, that is the sentence it collides with.

The permission side of the policy is one line long: solicit or encourage content that represents a genuine experience, without offering incentives and without attempting to influence the rating or the contents of the review. Everything legitimate in this category lives inside that sentence, and it is roomier than it sounds, because asking everybody at the right moment is exactly what it allows.

[[scene:gating-line]]

## The federal half, which is about your own website

The Google rules govern what happens on Google. There is a second rule that governs what you do with the reviews afterwards, on your own site, and it arrived recently enough that a lot of website widgets predate it.

The Federal Trade Commission's rule on consumer reviews and testimonials took effect in 2024. The part that applies here is [16 CFR 465.7](https://www.law.cornell.edu/cfr/text/16/465.7), on review suppression. Its second paragraph makes it an unfair or deceptive practice for a business to materially misrepresent, expressly or by implication, that the reviews displayed in a section of its own website dedicated to reviews represent most or all of the reviews submitted, when reviews are being suppressed based on their rating or their negative sentiment.

The load-bearing word is misrepresent. The rule does not require you to publish everything. It has an explicit carve-out for withholding reviews on criteria applied equally to all of them regardless of sentiment, and it lists what those criteria can be: confidential commercial information, defamatory or abusive or obscene content, somebody else's personal information, discriminatory content, content that is clearly false or misleading, a review the seller reasonably believes is fake, or a review wholly unrelated to what the business sells.

What that means in practice is small and specific. A block on your website labelled as a selection of recent reviews is honest. The same block, unlabelled, sitting under a heading that implies it is your reviews, while a filter quietly holds back everything under four stars, is the thing the paragraph describes. The label is the whole difference, and it costs four words.

Nothing in this section is a legal opinion, and a rule you can read for yourself in four minutes is not a reason to skip asking a lawyer about your own set-up. It is here because it is checkable, the text is one click away, and a vendor who cannot tell you which of these two paragraphs their widget sits inside has not read either of them.

[[scene:review-calculator]]

[[scene:pull-quote]]

## What to do when the review is genuinely bad

Sooner or later somebody writes something unfair, or something fair that you wish they had said to your face. This is the moment the whole strategy is actually tested, and there is an industry that will take your money to make it disappear.

Start with the arithmetic, because it is calming. A single one star review inside a page of thirty is a rounding error on your average and a large asset in your credibility, and the survey above is the reason: 68% of that panel wanted four stars or better and only 10% insisted on five. The review that hurts is not the bad one. It is the bad one with nothing under it.

Answer it in public, once, short, and without arguing. Say what happened, say what you have changed, and offer to talk offline. You are not writing to the person who left it, who has usually stopped reading. You are writing to the next forty people who will scroll past it, and they are looking for exactly one thing: whether you are the kind of business that gets defensive.

Then fix the thing underneath it if there is one. If three people in a year mention the same lender, that is not a review problem.

The one route worth knowing about is that platforms will remove content that breaks their own rules, which is a narrow door: a review from somebody who was never a customer, a competitor, a personal attack. A review that is merely wrong about you is not in that category and no amount of paying somebody will make it so.

## How to test one before you buy it

Four questions, and you can ask all of them in a demo without knowing anything technical. The first two are about the rules and the second two are about whether it will actually run.

Show me the message that goes to somebody who scores you a two. Do not accept a description of it. Ask to see the actual outgoing message on a screen, and check that the review link is in it. If the link is missing, or if it is replaced by a form that comes back to the business, you are looking at the gated version whatever the sales page calls it.

Show me what the website widget does with a three star review. Then ask what the block is labelled on the page. Those two answers together tell you which side of 465.7 the product is sitting on, and the second one is usually the one nobody has thought about.

What starts the ask, exactly. If the answer is a manual upload or a list somebody pastes in weekly, you have bought a mail merge and you will stop using it in six weeks. The value of this whole category is that a real event in a system you already use starts the message without anybody deciding to.

What happens to the reply. Somebody replies to your review request, because people do. Ask where that message lands, and what happens if the reply arrives on a Sunday. A product that sends beautifully and drops the answers is a product that will embarrass you in front of a client.

[[scene:offer]]

## What it costs, and how long it takes

We do not print a figure for this, and the reason is the one that keeps a figure off every other page in this series: what it costs depends on what has to be connected to what. What can be said is where the money actually goes, and it is not where most people expect.

The software is the cheap part. What actually recurs is the messaging: the ask goes out as a text, carriers charge for texts, and so the bill rises and falls with how many jobs you finished last month. Nothing else on it moves. A quiet month is a cheap month, which is an unusual and rather pleasant property for a marketing line to have.

The setup is short, and the reason is that this is the least complicated automation in the category: one trigger, one message, one link, one alert. The work is not building it, it is deciding two things. What event counts as finished, which is a genuine business question and usually takes longer to settle than the build. And what the message actually says, which has to sound like you rather than like a survey vendor, and which is the difference between a message people answer and one they delete.

The cost that never appears on any quote is the replying. Budget fifteen minutes a week for it, permanently, in your own name. If nobody in the business is going to do that, the honest advice is to not switch the asking on, because a growing pile of unanswered reviews is a worse profile than a small quiet one.

## What it does not do, and should not pretend to

It does not choose who gets asked. Everybody does, whatever they scored, and if that sentence makes you uncomfortable then the discomfort is worth sitting with rather than engineering around. It is also, on this page's own evidence, the version that works better.

It does not make anybody leave a review. It removes the forgetting and the friction and the four-day delay. The customer still has to want to, and a good share of them will not, which is why the calculator above asks you for that share rather than telling you one.

It does not remove a review, and it does not know a person who can. A published review belongs to the person who wrote it and to the platform it sits on. The only two things that ever change it are you answering it and you fixing what caused it, and the second one occasionally makes somebody edit their own review, which is the only version of removal worth having.

It does not present a selection as the whole picture. Reviews pulled through to your own website are labelled as a selection of recent ones, because that is what they are and because of the paragraph above.

And it does not fix the service. A steady flow of honest reviews of an experience people did not enjoy is simply a faster and more public way of finding that out. That is not a defect in the tool. For some businesses it is the most valuable thing the tool will ever do, and it is also the reason to start with one trigger rather than switching it on across everything in one afternoon.

[[scene:failure-modes]]

## Common questions, answered honestly

### What is review automation, in plain terms?

It is a small piece of software that watches for the moment a job is finished in a system you already use, and sends that customer a short message asking how it went, with a direct link to your public review page. Everybody gets the same link whatever they answer. If the answer is a low score, you personally get told at the same moment, with their words and their name, so you can call them the same day. That is the whole product. It is not clever and it does not need to be, because the problem it solves is consistency rather than difficulty.

### Is this different from the review tool my CRM already has?

Probably not in what it does, and quite possibly in whether it is allowed. Most CRMs now ship something that texts a customer at the end of a job, and the mechanics are the same everywhere: a trigger, a message, a link. There is very little proprietary technology in this category and a great deal of variation in what the default settings do. So the two questions worth asking about whichever one you already own are the ones in the testing section above. Does somebody who scores you a two still get the public review link, or a private form that comes back to the business. And what does the website widget do with a three star review, and how is that block labelled. If the tool you already pay for passes both, use it and spend the money somewhere else.

### Is it against Google's rules to automate review requests?

No. Automating when the ask happens is not something the policy speaks about at all, and the permission it does grant is to solicit content that reflects a genuine experience without incentives and without influencing the rating or the content. What is against the rules is offering anything in exchange, only asking the people you expect to be kind, pressuring somebody to write one on the spot, or asking them to include particular content. A product that automates the first thing is fine. A product that automates the second is a compliance problem running on a schedule.

### What is review gating, and where exactly is the line?

Gating is surveying customers first and sending the public review link only to the ones who answered well. The line is not whether you survey people, and it is not whether the score changes what you do. The line is whether the unhappy customer still gets the link. Screening feedback so you can fix things is normal and sensible. Screening who is allowed to review you is what Google's policy lists under selectively soliciting positive reviews. If you want a single test: if two customers answer differently and get different links, you are on the wrong side of it.

### Can I get a bad review taken down?

Usually not, and the effort is better spent elsewhere. Platforms remove content that breaks their own rules, which covers a review from somebody who was never a customer, a personal attack, or content that is plainly not about the business. A review that is merely unflattering, or unfair in your view, is not in that category, and the services that offer to make one disappear are mostly selling you the appeal you could file yourself. The reliable move is the public reply, and it works on the audience that matters, which is everybody who reads the review afterwards.

### Do I have to put my Google reviews on my own website?

You do not have to, and if you do there is one rule worth knowing. Under 16 CFR 465.7 it is the misrepresentation that matters, not the selection: a block of reviews that implies it represents most or all of what customers submitted, while quietly holding back the low ones, is the thing the rule describes. The same block, labelled as a selection of recent reviews, is honest. Label it and the question goes away.

### How many reviews do I actually need?

More than most people have and fewer than most people fear. In the survey above, 47% said they would not use a business with fewer than twenty, and only 9% were willing to use one with five or fewer, which makes twenty a real threshold rather than a target somebody invented. After that the count matters less than the dates. A business with thirty reviews and four written this quarter reads as busy; a business with two hundred and none since last year reads as a business that used to be busy, and that impression is formed in about two seconds.

## What to do about it

Do the thing the woman in the kitchen did, tonight, to yourself. It costs nothing and takes ninety seconds.

Open your own Google profile on a phone, signed out, the way a stranger arrives at it. Do not look at the star rating. Look at the date on the newest review, and count how many of them were written in the last three months. Then scroll to the worst one on the first screen and see whether anybody ever answered it.

Whatever you find is what a stranger found last Tuesday, and it is the honest starting point. If the newest one is from 2023, you do not have a review problem. You have an asking problem, and it has been quietly costing you the ten-minute decisions you never hear about.

[[scene:funnel]]`;

export const AI_CHAT_ASSISTANT_POST = `Someone found your listing at twenty to midnight. They were on a phone, in bed, three tabs deep, comparing your Beacon colonial against two others. They had one question: would the seller look at a contingent offer.

There was a contact form. They filled it in, or more likely they did not, and they went to sleep.

You saw it at 8am. You called at 9. By then they had asked the same question on two other sites, and one of them had already answered.

That gap, the one between when people actually look and when we actually answer, is the most expensive thing in this business, and almost nobody measures it.

[[scene:in-short]]

[[scene:reel]]

## The number everyone quotes, and where it actually comes from

Seventy eight percent of customers buy from whoever answers first. You have seen it on a slide, probably more than once, and it is the number this entire category is sold on.

We went looking for the study behind it, because a claim doing that much work should have a document under it. There is not one that anybody can produce. It is attributed on hundreds of pages to a survey with no published report, no stated sample, and no methodology, and every citation leads to another article citing a third. None of that proves the figure is wrong. It does mean nobody quoting it knows whether it is right, and a number nobody can check is a slogan wearing a percentage sign.

So this article does not use it. What follows rests on a different piece of work, one where the sample size, the industries and the definitions are all published and can be argued with.

[[scene:response-curve]]

Look at what the chart is counting, because it is not sales. It counts whether the firm ever got into a real exchange with somebody who could decide anything. That is a much lower bar than closing and a far higher one than a reply landing in an inbox, and it is precisely the bar your contact form is failing at twenty to midnight.

That is a smaller claim than the slide makes and a more useful one. It does not say the fastest agent is the best agent, and it does not say speed closes deals. It says being first buys you the conversation, and the conversation is the only thing that has ever sold a house. Everything you are actually good at happens after somebody picks up.

So the question is not whether you are a better agent than the one who answered at 11:41pm. You probably are. The question is whether you were in the room.

[[scene:response-gap]]

[[scene:leads-calculator]]

## What an AI chat assistant actually does

Strip away the marketing and it is a text conversation on your own website, answered by a language model, connected to the systems that make the answer true.

The version we run does four things:

[[scene:four-moves]]

The last one is the one people underrate. A lead that arrives with a transcript attached is a completely different object from a lead that arrives as a name and an email address. You already know what they want before you dial.

[[scene:plate]]

## What makes an answer true, which is the whole job

Every vendor in this category will tell you their assistant is trained on your data. Ask what that sentence means and the answers split into two groups that have almost nothing to do with each other.

The first group means the assistant was shown your website. Somebody pointed a crawler at your pages, the text got chopped up and stored, and when a visitor asks a question the system finds the paragraphs that look most similar and asks a language model to write an answer out of them. That works for what your website already says. It is a better search box, and a better search box is genuinely worth having.

It also cannot tell you whether 14 Willow Street is still available, because your website is a copy of the truth taken at some point in the past, and the question is about right now.

The second group means the assistant is connected to the systems that hold the live answer, and calls them while the person is waiting. Asked about availability it queries the feed and reads back what the feed says this minute. Asked about taxes it reads the field, or says it does not have it. The difference between the two groups is not model quality and it is not prompt writing. It is whether anything on the other end is actually live.

That distinction matters more here than in almost any other industry, because our facts move faster than our web pages. A listing goes to contingent on a Tuesday afternoon. A price drops on Friday. An open house gets cancelled because of weather. Every one of those events makes a website-trained assistant confidently wrong, and confidently wrong at eleven at night with nobody watching is exactly the failure that costs you a client rather than a lead.

There is a second half to it, and it is the harder half: what happens when the system does not have the answer. A model asked a question it cannot ground will produce something plausible, because producing something plausible is what it does. The fix is not a cleverer model. It is a rule that when a lookup returns nothing, the assistant says it does not know and offers you instead. That behaviour has to be built and it has to be tested, and it is the single most valuable thing in any of this. When you are testing one, ask it something it cannot possibly know and watch what it does. That answer tells you more than an hour of demo.

## The part nobody selling you a chat widget mentions

Three things that never come up in a sales call and are all yours to live with afterwards. None of this is legal advice, and the first one is a statute from a state you probably do not work in, which is the point.

**Do not let it pretend to be a person, and understand why that is a rule and not a preference.** California has had a bot disclosure law since 2019. Under [Business and Professions Code section 17941](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=17941), it is unlawful "to use a bot to communicate or interact with another person in California online, with the intent to mislead the other person about its artificial identity" in order to "incentivize a purchase or sale of goods or services in a commercial transaction". The escape hatch is one sentence long and it is free: "A person using a bot shall not be liable under this section if the person discloses that it is a bot." The disclosure has to be "clear, conspicuous, and reasonably designed to inform".

Read the definitions before you decide it does not apply to you. The chapter defines an online platform as a site with ten million or more unique monthly United States visitors, and that number is what most summaries of this law report. But the prohibition in 17941 is not written against platforms. It is written against any person using a bot online, and "online" is defined as any public facing website. Whether that reaches a brokerage in the Hudson Valley whose visitor is in Los Angeles is a question for an actual lawyer, and we are not one. What is not in doubt is that the compliant behaviour and the decent behaviour are the same behaviour, it costs one sentence, and nobody has ever lost a client because a chat window said it was an assistant.

**It is going to cost you page speed, and page speed is a number Google publishes.** A chat widget is third party JavaScript that loads on every page of your site. Google's own [Core Web Vitals thresholds](https://web.dev/articles/vitals) say that "to provide a good user experience, pages should have a INP of 200 milliseconds or less" and that largest contentful paint "should occur within 2.5 seconds of when the page first starts loading". A heavy widget eats into both, on the mobile phones where most of your traffic already is.

**Somebody has to be able to use it with akeyboard.** The Web Content Accessibility Guidelines have a criterion at level A called [No Keyboard Trap](https://www.w3.org/TR/WCAG22/), and it says that if focus can be moved into a component with a keyboard "then focus can be moved away from that component using only a keyboard interface". Chat widgets fail this constantly: the bubble opens, the focus goes in, and it never comes out. For a visitor using a screen reader that is not an annoyance, it is the end of their visit to your website. Given what this industry is regulated on, a front door some people cannot get out of is a bad thing to have bolted onto every page.

None of the three needs a vendor, a meeting or a budget to look into. Here is how to check each one yourself, on whatever is answering on your site tonight.

[[scene:self-checks]]

## What it costs, and how long it takes

There is no price on this page and there is not going to be, because the number is decided by things nobody can see from here. Three of them, and only one is the software.

The first is what it is allowed to look at. An assistant answering out of your website content is a small project measured in days. An assistant that answers questions about live inventory has to be connected to the feed that holds it, and that is a data project with its own rules, its own refresh behaviour and its own failure modes. Anybody quoting you before they have asked which of those you want has quoted you a template.

The second is what happens after the conversation ends. A transcript that lands in an inbox is worth a fraction of a transcript that lands on the right contact record in the CRM you already use, with the lead scored and the appointment on the calendar. That plumbing is usually the larger half of the build and it is the half people forget to ask about, because it is invisible in a demo.

The third is the running cost, and it is honestly small. Each conversation costs a few cents of model usage. What is not free is the reading: somebody has to go through what people actually asked, once a week at first, because the questions your visitors ask are the single best piece of market research you will ever be handed, and because that is how you find the answer it got wrong before a client does.

On timing, the honest shape is that a useful version answering from your own content can be live in about a week, a connected version takes longer and the delay is almost never the assistant, and the first month is worth more than the build. That is the month you find out what people are asking at eleven at night, which nobody could have told you in advance.

## How to test one before you buy it

Take this to any vendor, including us. Five questions, and you can ask all of them inside a demo window without anybody's permission.

Ask it something it cannot know. Make up an address on a real street and ask what the taxes are. What you want back is an admission that it has no way to confirm that, and an offer of a person. If it produces a number, you have just watched it invent one, and it will do that to a client on a Tuesday.

Ask it something that changed this week. A price cut, a status change, anything with a date on it. This is the question that separates an assistant reading a copy of your website from one reading the feed.

Ask it something a competitor's buyer would ask. Then look at where the answer came from, and whether you are comfortable with that being said in your name to somebody you have never met.

Try to break the handoff. Say you want to speak to a person. Say it rudely. The assistant's job at that moment is to stop selling and get out of the way, and a surprising number of them argue.

Then close the laptop and open your phone. Load the page on mobile data rather than the office wifi, and count the seconds before you can type. Most of these are demoed on a desktop over a fast connection, and almost none of your buyers are.

[[scene:offer]]

## What it does not do, and should not pretend to

This is the part most vendors skip, so let us be plain about it.

It does not close. It does not read a room, it does not know when a seller is lying about their timeline, and it has no instinct for what is really going on in a divorce sale. Those are the reasons you have a job.

It does not know things it cannot verify. If a buyer asks whether the seller will take a contingency, the honest answer is that nobody knows until it is asked, and the assistant should say so and book you a call. An AI that invents an answer to look competent is worse than no AI at all, because you will find out about the invention from a furious client.

And it does not pretend to be a person. Ours introduces itself as an assistant. In practice, nobody minds. What people mind is waiting.

[[scene:pull-quote]]

[[scene:teardown]]

## Common questions, answered honestly

### What is an AI chat assistant for a real estate website, in plain terms?

A text conversation on your own site, answered by a language model that is wired to the systems holding the real answers. Somebody types a question the way they would ask you, it answers in sentences rather than menus, it looks things up rather than guessing, and when it reaches the end of what it can confirm it books time with you instead. The part that makes it worth having is not that it talks. It is that it is awake at eleven at night and it is connected to something true.

### How is it different from the chatbot I already have?

If yours is a decision tree with four buttons, you have a menu. The difference is whether it can answer a question nobody scripted in advance, and whether the answer comes from live data or from a page written eight months ago. Ask yours something specific about a listing. If it offers you a phone number and a contact form, you have a form with a friendlier shape.

### Will it annoy my visitors?

A bad one will. A pop-up that fires two seconds after landing and demands a phone number before it has been useful is an advert in a chat widget's clothes. The one worth running answers a question first and asks for a number once it has earned it. The measurable version of that question is your own bounce rate before and after, which you should look at rather than guess about.

### My leads want a human, not a bot

They do, eventually. What they want at 11:40pm is to know whether the taxes on that house are five thousand or fifteen. An assistant that answers that and then books them a call with you is not standing between you and the client. It is the reason there is a client. What people object to is not being helped by software, it is being trapped by it, and those are different products.

### Does it work on the MLS, or only on what my website already says?

Both exist and they are not the same purchase. An assistant reading your website can only tell somebody what your website already told them, which is a better search box. An assistant connected to the feed can answer about status, price and availability as they stand this minute. Ask any vendor which one they are selling, and ask them what happens the afternoon a listing goes contingent.

### Do I have to tell people it is an AI?

Say yes and stop thinking about it. There are statutes in this area, at least one of them makes disclosure the thing that keeps you out of trouble, and the rules will not be fewer next year. Beyond the law it is simply the right call: an assistant that introduces itself costs you nothing, and being caught pretending costs you the only thing you actually sell.

### What happens when it gets something wrong?

Somebody has to be reading. Set it up so every conversation is stored and so you or somebody on your team reads the week's transcripts, at least at first. A wrong answer that nobody reads is a wrong answer it will give again on Thursday, and the person who finds it for you will be a client.

## Where it goes wrong

Three failure modes, all avoidable, all common:

[[scene:failure-modes]]

[[scene:system-diagram]]

## What to do about it

If you would rather see one working than read about it, ours is live on [the RealtyLT AI page](/ai#chat), and you can talk to it right now. Ask it something hard. It will either answer, or tell you it cannot and offer to book a call, and both of those are the correct behaviour.

Then go and do the same thing to your own site, because that is the free half of this and nobody needs to sell you anything for it. Open it on your phone, at night, in bed, the way the person comparing your Beacon colonial against two others did. Ask it the question they asked. Count how many taps it takes to get an answer, and notice whether you ever get one or just get asked for your email address.

The build itself, and what happens to a lead in the minutes after the conversation ends, is written out on the [AI chat assistant page](/services/ai-chat-assistant).

[[scene:funnel]]`;

export const AI_VOICE_AGENTS_POST = `The phone rang at 9:42 on a Sunday evening. Somebody had been on your listing for eleven minutes, got as far as the taxes, and wanted a person.

You were at dinner. Four rings, then your voicemail, then the small silence where somebody decides what to do next.

They did not leave a message. Almost nobody does. They went back to the results page and called the next number on it.

That is the whole problem, and it is not really a lost lead. It is a lost conversation, which is the only place a lead has ever turned into anything.

[[scene:in-short]]

[[scene:reel]]

## What a missed call actually costs

Nobody has published a study of how fast real estate agents answer their phones. What has been published is the next best thing, and it is worth reading properly rather than quoting.

In 2011, Harvard Business Review reported an audit of 2,241 US companies. The researchers submitted a test inquiry through each company's own website and timed how long the reply took.

[[scene:response-audit]]

Twenty three percent of them never replied at all. Among the ones that answered inside the thirty day window, the average took 42 hours.

Two honest notes before that number gets used for anything. It is cross-industry research from 2011, not a real estate study from this year, and the inquiries were web forms rather than phone calls. What carries over is not the percentage. It is the shape: a large group answers quickly, a large group never answers, and the average sits in days rather than minutes.

The same researchers ran a second study, this one across [1.25 million sales leads](https://hbr.org/2011/03/the-short-life-of-online-sales-leads) at 29 business-to-consumer and 13 business-to-business companies. Firms that tried to make contact within an hour were nearly seven times likelier to qualify a lead than firms that waited one more hour, and more than sixty times likelier than firms that waited a day.

The definition is the part everyone skips over. They counted a lead as qualified when it produced "a meaningful conversation with a key decision maker". Not an email opened. Not a form completed. A conversation, with the person who decides. That is exactly what your 9:42 call was, seen from the other end, which is why this research applies more directly to a ringing phone than to most of the things it gets quoted about.

[[scene:plate]]

## Why nobody leaves the voicemail

Ask anyone what they do when a business does not pick up and you get the same answer, usually with a slightly embarrassed shrug. They hang up and try somebody else.

It is not rudeness and it is not impatience. Leaving a voicemail is a commitment to wait, made by a person who has four more numbers on the screen in front of them and no particular reason to prefer yours. It also hands the next move to you, and they have no way of knowing whether you check.

So what you receive is not "a lead could not reach me". It is nothing at all. There is no artifact. It shows up as a missed call, which looks identical to a wrong number, and by Tuesday it is gone.

That is the specific reason a phone gap is worse than an inbox gap. An unanswered email is still sitting there in the morning with somebody's name on it, and you can still be the one who replies. An unanswered call left no name, no number that is worth ringing because they are already talking to somebody else, and no record that anything happened.

[[scene:calls-calculator]]

## What an AI voice agent actually does

Stripped of the marketing, it is a voice on the phone that can hold a real conversation, wired to the systems that make its answers true. Ours runs on Vapi.

[[scene:four-moves]]

The fourth one is the one people underrate. When you ring back, you are not opening with "how can I help". You already know they got as far as the taxes, that they asked twice about the septic, and that they used the word soon. On the phone that is worth more than it is anywhere else, because you can hear how somebody answers a question they have already answered once, and whether the second version is the same.

## The same agent, pointed the other way

Everything above is about the call you did not take. The bigger half of this is the call nobody made.

Most leads never phone you at all. They fill in a form at nine at night, or they arrive from a portal or an ad, and then they sit in a list waiting for somebody to notice them. The standard answer to that is a follow-up task, which gets done tomorrow, or on Thursday, or never.

The second of the four moves above is that other direction, and it earns more than the one line it gets there. It is not only the automatic call either. You can point it at somebody and tell it to dial, and you can point it at a list.

[[scene:outbound]]

The last of those is the one to be careful with, and it is worth saying plainly rather than selling. Calling a hundred people at once is the same act whether a person does it or software does, and the rules do not soften because the dialing got cheaper. You still need a reason to be calling each of them, you still have to honor do-not-call and the calling windows, and the agent still has to say what it is when somebody picks up. Volume is exactly where outbound stops being useful and starts being a complaint, so the list you call should be people who asked to hear from you about that thing. The legal section below is about outbound at least as much as it is about recording.

## The one thing that decides whether it works

Text chat forgives a pause. A typing indicator is a promise that something is coming, and two seconds of it costs nothing.

A phone call has no typing indicator. There is only silence, and silence means one of three things to the person holding the handset: the line dropped, the other person is thinking, or nobody is there. Callers resolve that ambiguity in well under a second, and they resolve it badly.

How far under a second is worth seeing, because it is smaller than almost anybody guesses.

[[scene:turn-gap]]

So latency is not a specification on a phone agent. It is the product. The gap between a caller finishing their sentence and the agent starting its answer is the entire difference between "somebody at the office picked up" and "I got one of those robots". That is why this stack is built around sub-second response rather than around a longer feature list.

Two related things get forgotten, and between them they cost more calls than anything in a brochure.

**People interrupt.** Real phone conversations are full of overlap. Somebody starts answering before you have finished the question, you stop talking, and neither of you thinks about it afterwards. An agent that cannot be cut off mid-sentence talks over a human being instead, and being talked over by a machine is the precise moment people hang up.

**Turns are short.** On the phone a person says four words and waits. "Is it still available." An agent tuned to write paragraphs answers a four-word question with a speech, and the caller does exactly what you would do.

[[scene:pull-quote]]

[[scene:teardown]]

## What it does not do, and should not pretend to

This is the part vendors skip, so here it is plainly.

It does not close, and on the phone the reason is specific. Half of what a good agent hears in a first call is not in the words: the pause before an answer, the second voice in the background saying something you were not meant to catch, the cheerfulness that is covering something. A transcript records none of that, and a model reading the transcript cannot miss it, because it was never there.

It does not know what it cannot verify. Asked whether the boiler was replaced or whether the seller would take less, the correct behaviour is to say plainly that it does not know and put a call on your calendar. A voice that invents an answer to sound competent is worse than no answer at all, and worse on the phone than anywhere else, because the caller has no way to check it and every reason to believe a confident voice.

It does not pretend to be a person. Ours introduces itself as an assistant. In practice nobody minds. What people mind is nobody picking up.

And it does not replace ringing back the people who matter. If the caller is a past client, or your seller's neighbor, or anybody whose relationship is the actual asset, the agent's job is to hold the door open for twenty minutes. It is not to be the relationship.

## The legal part nobody sells you

Nobody selling phone AI opens with this, which is a decent reason to read it here. None of it is legal advice and all of it moves. The point is to know that the questions exist, because the person selling you the agent is not going to raise them.

**An AI voice is not a loophole.** In a declaratory ruling adopted on February 2, 2024 and released six days later, the Federal Communications Commission confirmed that calls made with AI-generated voices are ["artificial" for the purposes of the Telephone Consumer Protection Act](https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf). In practice that means the rules already governing prerecorded outbound calls, getting consent, identifying who is calling, and honoring an opt-out, apply in exactly the same way when the voice is generated. Dialing people with an AI sits inside the existing rules rather than around them.

**Recording is a state question, and New York is not the strict one.** Under [New York Penal Law section 250.00](https://www.nysenate.gov/legislation/laws/PEN/250.00), recording counts as eavesdropping only when it is done "without the consent of at least one party thereto, by a person not present thereat". If you are on the call, you are that party, so in New York you may record your own calls without asking the other side. California is the other kind of state: [Penal Code section 632](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=632) makes it an offense to record a confidential communication without the consent of all parties, and several other states take the same approach. Before you lean on any of this, check the rule in the state your caller is actually sitting in, because the lists of these that circulate online go stale and none of them are the statute. If you list in the Hudson Valley and take a call from somebody in Los Angeles, assume the stricter rule.

[[scene:vendor-questions]]

**Some states already require the disclosure you should be making anyway.** California requires that a person called be told when a prerecorded message uses an artificial voice, defined as a voice generated or significantly altered by artificial intelligence. That is [Assembly Bill 2905](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB2905), chaptered in September 2024.

Our position is simpler than the map. The agent says that it is an assistant and that the call is recorded, at the start of the call rather than in a rushed sentence at the end. Not because a statute in another state says so, but because there is no version of this where being told costs you more than being found out.

And if you are running outbound at any volume, have your own attorney read the script once. It is an hour, and it is the cheapest hour in the whole project.

[[scene:offer]]

[[scene:call-path]]

## Where it goes wrong

Three failure modes. None of them are the technology, which is exactly why they are the common ones.

[[scene:failure-modes]]

## Common questions, answered honestly

### Will callers know they are talking to an AI?

Yes, because it tells them. It introduces itself as an assistant at the start of the call. In practice the objection is far smaller than people expect: callers care enormously that somebody picked up at nine on a Sunday and answered the question, and very little about who. What we will not build is an agent that pretends to be a particular human being.

### What happens when it cannot answer something?

It says so plainly and books time with you instead of guessing. It will not invent a price, a legal position, or a fact about a property. Anything it cannot verify turns into a booked call, which is both the honest outcome and the higher-converting one.

### Can it replace an inside sales agent?

It replaces the mechanical half of the role: answering every call, dialing new leads within seconds, [qualifying](/services/lead-qualification) on budget, area and timeline, and booking the appointment. It does not replace an experienced agent at a listing appointment. Most teams run the AI as first contact and keep people for the conversations where judgment and relationship decide the outcome.

### Does it work with my calendar and my CRM?

Yes. It reads your live availability, so it only ever offers a time you actually have, and it writes the transcript, the qualification and the outcome back to your CRM. The [appointment booking](/services/ai-appointment-booking) side is the same machinery. It plugs into what you already run rather than adding one more thing to check.

### Is it legal to have an AI make outbound calls?

The same rules that govern your own outbound calling apply: you need consent to call, you have to honor do-not-call requests, and the agent identifies itself as an AI assistant. The FCC settled the underlying question in February 2024 by ruling that an AI-generated voice counts as an artificial voice under the TCPA, so nothing about using one relaxes the rules you were already under. We configure calling windows and opt-outs to match, and every call is logged so the record exists.

## What to do about it

There is a test for this that takes ninety seconds and costs nothing, and it is worth doing before you spend a dollar with anybody, us included. Borrow a phone your office does not have saved, ring your own number on a Sunday evening, and sit through the whole thing the way a stranger would. Count the rings. Listen to what your voicemail actually says, all the way to the beep. Then decide whether that is the first thing you want somebody standing outside your listing to hear.

Most people who do that come away having learned something they did not want to know, which is the point. You can hear the alternative on [the RealtyLT AI page](/ai#voice). The [AI voice agents page](/services/ai-voice-agents) has the rest of it: what the agent is wired to, and what it does with a call once it has taken one.

The same argument at the other end of the day is on the [website chat side](/blog/ai-chat-assistant-real-estate-website), where the buyer messaging you at 11:40pm never picks up the phone at all.

[[scene:funnel]]`;

export const DATABASE_REACTIVATION_POST = `In the spring of 2023 somebody filled in the home valuation form on your website. They wanted a number. You called twice, they said they were still thinking about it, and the thread went quiet the way most threads go quiet.

They are still in your CRM. Their number still works. Nobody has dialed it since.

Last year they sold that house. Somebody else listed it.

Nothing was neglected in that story, which is exactly what makes it expensive. No ball was dropped and nobody was lazy. It is that following up with a person who said not right now, three years later, in the one month it stopped being not right now, is not a thing a human being is built to do.

[[scene:in-short]]

[[scene:reel]]

## What is actually sitting in that database

Everybody says the money is in the database. Almost nobody says what the money is made of, so here is the honest version.

The National Association of REALTORS surveys recent buyers and sellers every year and asks, among a hundred other things, how they found the agent they hired. The most recent generational cut of that survey is worth looking at properly, because the two biggest answers are not marketing.

[[scene:agent-source]]

Two thirds of sellers hired somebody who was already known to them: referred by a friend, a neighbor or a relative, or an agent they had worked with before. Four percent found their agent on a website.

Read the small bars too, because they are the honest half. Four percent of sellers hired an agent who had contacted them directly. Cold outreach is not what fills a listing calendar, and this piece is not going to pretend otherwise.

What that leaves is an interesting middle. The people sitting in your CRM are not strangers and they are not friends. They are the group that raised a hand once, at a moment when the answer turned out to be later. They already know your name, they contacted you first, and they are the only group anywhere near the top of that chart that you actually hold a list of.

[[scene:plate]]

## Why nobody works it

Ask an agent when they last went through their old leads properly and you get a wince.

It is not laziness and it is not a discipline problem. It is that the work is genuinely awful. Three hundred conversations to find four people whose life has changed, most of them going to voicemail, a few of them annoyed, and the majority of the ones who do answer saying no for the second time. The reward for doing it properly is getting to do it again next quarter.

There is a quieter trap in it too. Human follow-up dies at the second attempt, because a third starts to feel like pestering. But the person who did not pick up at two on a Tuesday was driving, not deciding, and the difference between those two is invisible from your end. So the list gets a burst of attention in a slow month, produces nothing that week, and gets closed again.

Meanwhile the contacts in it keep aging in two directions at once. Some are drifting further out of reach. Some are quietly becoming ready. Nobody is watching which.

## What database reactivation actually does

[[scene:four-moves]]

The last one is the part that decides whether any of it was worth doing. An appointment that arrives with the reply attached is a different object from an appointment that arrives as a name and a time. You already know there is a house to sell, and you already know they said so themselves.

## The part nobody selling you this will mention

Reactivation is the one AI use case in real estate where the technology is the easy half and the rules are the hard half. Everything above this line is a build problem, and it is a solved one. Everything below it is the reason a large share of these campaigns should never have been sent at all.

I am not a lawyer and none of what follows is legal advice. Read it instead as the list of things you are entitled to ask about before anybody sends a message with your name on it, ourselves included. There are three of them, they are all answerable from your own records in an afternoon, and a vendor who cannot answer all three has told you something important.

**There is a clock on your old lead, and it is shorter than you think.** Federal rules exempt calls to somebody you have an established business relationship with from the national do-not-call registry. That exemption is defined with dates in it. Under [47 CFR 64.1200(f)(5)](https://www.law.cornell.edu/cfr/text/47/64.1200), the relationship runs from "the subscriber's purchase or transaction with the entity within the eighteen (18) months immediately preceding the date of the telephone call or on the basis of the subscriber's inquiry or application regarding products or services offered by the entity within the three months immediately preceding the date of the call". A closed deal buys you eighteen months. A form fill buys you three. Your 2023 lead ran out of both a long time ago, and if that number is on the registry, warmth is not a defense.

**An automated call or text is a separate question with a stricter answer.** The do-not-call registry is one rule. Using an autodialer or an artificial voice is another one entirely, and clearing the first does not clear the second. The same regulation, at paragraph (a)(2), bars a telemarketing call or text to a mobile number placed with "an automatic telephone dialing system or an artificial or prerecorded voice" unless you have the prior express written consent of the person you are calling. Written consent is defined narrowly: a signed agreement, with a clear and conspicuous disclosure that the person is authorizing automated calls, and a statement that agreeing is not a condition of buying anything. An electronic signature counts. A checkbox on an IDX registration page that said "by registering you agree to be contacted" almost certainly does not.

**A no has to be easy, and it has to stick.** The rules were tightened here recently and the current version is unusually specific. A person can revoke consent "by using any reasonable method", and stop, quit, end, revoke, opt out, cancel and unsubscribe are all listed as reasonable by definition. If somebody replies with different words, you have to treat that as an opt-out too. And the request "must be honored within a reasonable time not to exceed ten business days from receipt". You cannot make people use one specific channel to get out.

[[scene:consent-check]]

Every one of those is checkable in an afternoon, and the answers live in your own systems: the form your leads filled in, the dates on the records, and whatever your CRM does with the word stop. If a vendor cannot tell you how their campaign handles all three, the campaign is not ready to send.

Once you know how much of that list you are actually allowed to contact, the rest is arithmetic, and it is arithmetic nobody can do for you.

[[scene:list-calculator]]

## What it costs when it goes wrong

We do not publish a price for this and I am not going to invent one here, because it depends entirely on the size and state of the list. What is worth publishing is the other side of the ledger, because it is a fixed number and almost nobody quotes it.

The Telephone Consumer Protection Act carries a private right of action. Under [47 U.S.C. 227(b)(3)](https://www.law.cornell.edu/uscode/text/47/227), a person can recover their actual loss "or to receive $500 in damages for each such violation, whichever is greater", and a court that finds the violation was willful or knowing may treble it. Per message. There is a whole plaintiff's bar that does nothing else, and a list of thirty thousand contacts is a large multiplier attached to a small mistake.

While we are here: you will see agents quote a figure of sixteen thousand dollars per text. That number is real but it belongs to a different statute, the Federal Trade Commission's civil penalties, not to the TCPA claim an individual can bring against you. The TCPA number is five hundred, and five hundred multiplied by a list is the number that should worry you.

The second cost is less dramatic and far more likely, and it has a threshold you can actually look up. Send messages people did not want and some of them reply stop, which is their right and takes one word. Twilio, whose pipes a great many of these campaigns run through, publishes where that becomes a problem: an opt-out rate ["under 1% is considered healthy; over 3% may lead to carrier filtering"](https://www.twilio.com/docs/messaging/features/twilio-health-score-for-messaging). Filtering is not a bounce. Your messages to real clients simply stop arriving, silently, with no error, and you find out a fortnight later when somebody mentions they never got your text about the inspection.

Both of those costs are avoidable, and both of them are avoided in the same place: before the first message goes out, not after the first complaint.

## What to ask before you let anybody text that list

Everything above is theory until you are sitting across from somebody who wants the export. Four questions separate the people who have done this properly from the people who are about to use your database as their sandbox, and none of them require you to know anything technical.

Show me the consent evidence for one specific record. Pick a name yourself, at random, and ask what date that person gave permission, through what form, and where that date is stored. If the answer is a general assurance about the CRM rather than a date on a screen, nothing has been checked and the first message is a guess.

What happens to a message that would land at nine at night. You want to hear a rule that is enforced by the system, not a promise about scheduling discipline. Ask what happens when somebody replies at 9:40pm, too, because the answer to that one is usually more revealing.

Show me a real opt-out, end to end. Have somebody send stop from a phone in the room, and then try to send that number another message. If the second message goes out, the suppression list is decoration. This takes four minutes and almost nobody asks for it.

Whose number is it. If the campaign runs from a number the vendor owns, then the replies, the reputation attached to it and the ability to keep using it all belong to the vendor, and moving to anybody else means starting again. That is not a reason to say no. It is a reason to know before you sign rather than after.

[[scene:offer]]

[[scene:pull-quote]]

[[scene:teardown]]

## What it does not do, and should not pretend to

It does not manufacture intent. Most of that list is going to say no again, because most of them meant it. What reactivation changes is that somebody finally asked, and that the small number whose circumstances moved get found in the same week they moved rather than eighteen months later. Anybody quoting you a conversion rate on a cold database before they have seen the database is quoting you a number they made up.

It does not fix a list that has no consent behind it. If the records do not carry a date and a source, the honest first project is not a campaign, it is a cleanup.

It is not a subscription, and you should be suspicious of anybody who sells it as one. A database is finite. You work it once, you find the people whose situation changed, and then the same list is a year away from being worth working again. Vendors in this category run out of inventory and quietly pivot the client onto something else, and the ones who are straight with you say so at the start. Reactivation is a harvest, not a lead source, and it does not replace generating new business.

It does not replace you calling the people who actually matter. Your past clients, the neighbor who sold with you in 2019, anybody whose relationship is the real asset: those calls are yours. A machine reintroducing itself to somebody who came to your daughter's christening is worse than no contact at all.

It also does not survive being run twice in a row. The first pass takes the accumulated years off the list, and whatever it finds is genuinely there. The second pass, three months later, is fishing in a pond somebody already emptied, and the temptation at that point is to widen the definition of who counts as a lead until there is a list again. That is the moment a reactivation campaign quietly turns into cold outreach, with none of the consent behind it that made the first one defensible.

And it does not close. It finds the conversation. Everything that happens after somebody says yes to a Thursday is the reason you have a job.

[[scene:revival-path]]

## Where it goes wrong

[[scene:failure-modes]]

## Common questions, answered honestly

### Do old real estate leads actually convert?

Some of them do, and that is the whole business case rather than a sales line. A person who said not right now two years ago was giving you a timeline, and that timeline has since run out. The job is finding the small share whose circumstances changed, which is exactly the kind of patient, repetitive work software does well and people do not.

### Is it not annoying to text people who went quiet years ago?

It is, if the opener is generic. The difference between reactivation and a blast is whether the first message references what that specific person actually asked about, asks a real question, and takes no for an answer the first time. It also matters enormously that the person hears from you rather than from a stranger, which is why the consent and identification questions above are not paperwork. They are the reason the message lands as a follow-up instead of as spam.

### How does it decide who is worth calling?

It reads intent from what the person says back: whether the move is still on, whether the timeline shifted, whether there is now a house to sell. Everybody in scope gets an attempt. Only the ones showing real intent reach your calendar.

### Can I just do this myself with a mail merge?

You can, and for a list of two hundred you probably should. The reason it stops working is volume and follow-through, not sophistication. A merge sends one message. What actually produces appointments is the second and third exchange, held at the hour the person happens to reply, across a few thousand contacts, without anybody getting bored. That is the part that is hard to staff and easy to automate.

### What happens to the people who say no?

They get recorded as a no, with whatever reason they gave, and they are not contacted again by the campaign. That is not only politeness. A no with a reason attached is the most useful thing the whole exercise produces, because it tells you which part of your list is genuinely dead and which part is just early.

## What to do about it

Start with one record instead of with a campaign, and do it before you talk to a vendor. Open your CRM, sort by oldest, and find your own version of the person who asked what their house was worth in the spring of 2023. Then look at what you are actually holding: is there a date on the record, is there a source, and is there anything anywhere that says how that person agreed you could contact them. Four minutes on one record will tell you which of the two projects in this article you are really looking at, a campaign or a cleanup, and no consultant can tell you that faster than your own database can.

The system is laid out on [the RealtyLT AI page](/ai#reactivation), and the [database reactivation page](/services/database-reactivation) sets out what it reads, what it sends, and what happens to a reply once somebody sends one.

Two earlier moments in the same story are written out elsewhere: [the missed call at 9:42 on a Sunday](/blog/ai-voice-agent-missed-calls-real-estate) is this problem before the lead ever goes cold, and [the buyer messaging your website at 11:40pm](/blog/ai-chat-assistant-real-estate-website) is where the record you just opened came from in the first place.

[[scene:funnel]]`;

export const LEAD_QUALIFICATION_POST = `Open your CRM tomorrow morning and you will see a list. It is sorted by when each name arrived, because arrival time is the only thing the software knows for certain about any of them.

Three of those names came in yesterday. On screen they are identical: a name, an email address, a phone number, and the words buyer inquiry.

One is pre-approved, has their own house under contract, and is free on Thursday. One signed a twelve month lease in September. The third asked what their house is worth because they have been offered a job in another state and have to be out by spring.

You will find out which is which some time next week, if you get that far down the list.

[[scene:in-short]]

[[scene:reel]]

## What the list is actually sorted by

There is a comfortable assumption underneath every CRM, which is that the leads in it are roughly interchangeable and that working them in order is therefore fair. It is not fair. It is just arbitrary, and arbitrary is expensive when the underlying population is as spread out as this one.

The National Association of REALTORS asks recent sellers how urgent their sale was. Not how urgent it felt to their agent. How urgent it was.

[[scene:urgency]]

Fifteen percent needed to sell as quickly as possible. Forty three percent were in no hurry at all and waited for the right offer. Those two groups submit the same form, tick the same box, and arrive in your inbox looking exactly alike.

That spread is the entire argument. If everybody were equally ready, the order of your morning would not matter and none of this would be worth building. They are not, the difference is large, and it is invisible in the place you are currently looking for it.

[[scene:plate]]

## What a form cannot tell you, and a conversation can

The same NAR research measures how the process actually runs. Buyers searched for a median of ten weeks and looked at a median of seven homes. They searched for a median of two weeks before contacting an agent at all, which means by the time a form arrives, that person has already been at this for a fortnight and has already decided you were worth writing to.

The most useful exhibit in the whole report is the one nobody quotes. Exhibit 1-16 asks buyers the primary reason for the timing of their purchase. The largest answer, at 43 percent, is "it was just the right time, was ready to buy a home", which tells you nothing at all and cannot be checked by anybody. The second largest, at 23 percent, is "did not have much choice, had to purchase".

Read those two next to each other and the job becomes clear. Nearly a quarter of buyers were moved by something that happened to them: a lease, a job, a marriage, a death, a divorce. That is a fact with a date attached, and unlike a preference, it is something a person will tell you in the first two minutes of a real conversation. Qualification is not psychology. It is finding out whether the timing is a wish or an appointment.

## What lead qualification actually does

[[scene:what-it-does]]

The fourth one is the whole point and it is smaller than it sounds. Nothing here makes a lead better. It changes the order you meet them in, and the order is the part you were previously leaving to a timestamp.

## The three signals, and what they sound like

Every scoring system in this business measures the same three things, because they are the three that predict. What separates a useful one from a decorative one is whether it reads them out of sentences or out of checkboxes.

[[scene:three-signals]]

A note on the third one, because it is the one people get wrong. A date on its own is weak. Anybody will type spring into a form. A date with a REASON attached is the strongest signal there is, because the reason is what makes the date real: the lease ends, the job starts, the closing is booked. When somebody volunteers the reason, they have told you they are not browsing.

None of those three signals arrive in the form. Somebody has to go and find them, one lead at a time, and that is a job with a number on it.

[[scene:triage-calculator]]

[[scene:pull-quote]]

[[scene:teardown]]

## The part that can get you in trouble

Here is the section that nobody selling lead scoring will raise with you, and it is the reason to read this rather than a feature list.

A score decides who gets a person and who gets an automated follow-up. That is a professional service, delivered differently to different people, by a system, at scale, with no human looking at any individual decision. There is a body of law about exactly that, it is older than any of this software, and it does not contain a software exemption.

The Fair Housing Act makes it unlawful, at [42 U.S.C. 3604](https://www.law.cornell.edu/uscode/text/42/3604), to publish any statement about the sale of a dwelling "that indicates any preference, limitation, or discrimination" on a protected basis, and to represent to somebody, because of a protected characteristic, "that any dwelling is not available for inspection, sale, or rental when such dwelling is in fact so available". Nothing in either sentence cares whether the representation was made by a person or by a routing rule.

If you are a REALTOR the bar is higher and broader. [Article 10 of the Code of Ethics](https://www.nar.realtor/about-nar/governing-documents/code-of-ethics/2025-code-of-ethics-standards-of-practice) says plainly that REALTORS "shall not deny equal professional services to any person for reasons of race, color, religion, sex, disability, familial status, national origin, sexual orientation, or gender identity". Note the last two. Article 10 covers two categories the federal statute does not, so a system built to the floor of federal law is not automatically built to the standard you actually agreed to.

None of that makes scoring wrong. It makes a particular kind of scoring wrong, and the line is clean enough to hold in your head.

[[scene:fair-play]]

The third one is the one worth writing on the wall. Qualification is allowed to change the order of YOUR day. It is never allowed to change what somebody else is permitted to see, ask, or be shown. The moment a low score results in fewer listings, a slower answer to a direct question, or a person who can never reach a human being, you have stopped ranking your own time and started rationing access to housing, and those are different activities with very different consequences.

The practical protection is boring and it works: every score has to point at a sentence somebody actually wrote. If you cannot open a lead and see the words that produced the number, you cannot explain it to a client, you cannot correct it when it is wrong, and you certainly cannot defend it to anybody else.

## Checking the inputs is not the whole job

Traceable inputs protect you from the obvious failure, which is a system reading something it should never have been shown. They do not protect you from the quiet one, where every input is innocent and the output still lands unevenly.

The clearest official statement of that problem is about a different technology, and it is worth reading anyway. In April 2024 the Office of Fair Housing and Equal Opportunity published [guidance on how the Fair Housing Act applies to housing advertising delivered through digital platforms](https://archives.hud.gov/news/2024/FHEO_Guidance_on_Advertising_through_Digital_Platforms.pdf), and specifically to the case where an algorithm rather than a person decides who gets shown what. Two sentences in it should stop anybody who is about to rank leads with software.

The first describes how the harm happens. Discriminatory delivery, HUD writes, "can happen without the advertiser's direction or knowledge, and can even frustrate an advertiser's intention that an ad be distributed more broadly". Nobody chose it, and somebody's stated intention was overridden by the machinery underneath it.

The second is a list of what that costs, and the first item is the one that maps onto a lead score. Among the ways ad targeting risks violating the Act, HUD names "denying consumers information about housing opportunities".

Now read those beside a scoring model. It is also optimising, also on data produced by a market with its own history sitting inside it, and nobody has to type a protected characteristic anywhere for the output to correlate with one.

Be careful how far that carries, because it is guidance about advertising. It says nothing about CRMs, nothing about lead scoring, and nothing about a real estate agent ordering their own call list, and it is not authority for anything in this article. What transfers is the mechanism, which is the same mechanism, and one recommendation, which costs nothing: "Monitor outcomes of advertising campaigns for housing-related ads, to the extent possible, to identify and mitigate discriminatory outcomes."

Outcomes. Not inputs. In practice that is a report almost nobody runs: take the leads your system scored low last quarter and check what they actually received. Did they get answers, did they get listings, could they reach a person. If the low-scored group got less of your TIME, the ranking did its job. If they got less of your SERVICE, it stopped being a ranking, and no audit of the inputs would ever have told you.

[[scene:offer]]

## What it costs, and what the number really depends on

There is no price on this page, and for scoring there are three things that move it. Only one of them is software.

The first is whether you have any sentences at all. This reads conversations, so a business whose leads arrive as a name, an email address and the words buyer inquiry has handed it nothing to read. That business is not buying a scoring project. It is buying whatever produces a conversation first, and a vendor who sells it scoring instead has sold it a sort order on an empty column. This is far and away the most common reason an estimate turns out to be wrong.

The second is what your CRM will let anybody write back to it. Putting a number and its reason onto a contact record is a field update in some systems, an integration project in others, and in one or two well-known ones it is a support ticket and a fortnight. Settle that before anybody quotes you, because it decides whether this is days or weeks and it has nothing to do with the model.

The third is the one people leave out of the budget entirely: somebody has to check whether the scores were any good. Ranking drifts, quietly, and nothing in the system will raise its hand. Once a quarter, an hour, reading the transcripts under the ten highest and the ten lowest and asking whether the order matched what really happened. Pay for that hour or you will spend a year with a number everybody trusts and nobody has tested.

On timing, the honest shape is this. Where the conversations already exist, scoring is usually live in days, because the difficult parts are reading and routing rather than arithmetic. Where they do not, the first project is the conversation, and that is a longer answer than anybody wants at the point they are asking about scoring.

## What it does not do, and should not pretend to

It is not a prediction about a person. It is a guess about a date, made from limited evidence, and it will be wrong regularly. Somebody who says they are twelve months out will call you in March because their landlord sold the building. That is not a scoring failure. It is what happens when the input is a plan and plans change.

It does not replace reading. The score is a sort order, not a summary. An agent who calls the top of the list without opening the transcript underneath it has bought a slightly faster way to be unprepared.

It does not work on nothing. A lead who filled in a form, said no more, and never replied has given the system a name and an email address, which is exactly what it has given you. There is no model that extracts intent from silence, and any vendor implying otherwise is describing a guess with a confidence interval printed on it.

And it does not decide anything. Every hot lead is a suggestion that you call somebody. Every low score is a suggestion about the order of your afternoon. Nobody is refused, nothing is closed off, and if the system is ever doing more than suggesting, it has been built wrong.

[[scene:routing-path]]

## Where it goes wrong

[[scene:failure-modes]]

## Common questions, answered honestly

### How does AI qualify a real estate lead?

It reads the actual conversation instead of the form, and scores what it finds on three things: intent, budget and timeline. Whether they are pre-approved, whether they have a house to sell, and when they need to move. Those three predict who transacts soon, and none of them appear on a contact form.

### What is lead scoring, in plain terms?

Ranking your leads by how likely they are to transact soon, so that your best hours go to the people closest to doing something. Without it, the ordering of your day is set by the order things arrived in, which is effectively random with respect to anything you care about.

### Does a low score mean the lead gets dropped?

No, and a system that drops them is the broken version. A low score means the lead goes to a follow-up track instead of your call list. Most leads are not ready today and some of them are ready in six months, and the point of scoring is to stop those two groups getting identical treatment. Everybody still gets answers, still gets listings, and can still reach a person.

### Can the score be wrong?

Regularly, and in both directions. A cautious person underplays their timeline and scores low. Somebody who talks a good game scores high and never moves. Treat the ranking as a sort order that saves you from starting at a random point, not as a verdict, and read the transcript before you dial either way.

### Is it legal to score and route leads with software?

Scoring your own time is not the risk. The risk is scoring on anything that stands in for who a person is rather than what they said, and then delivering a different level of service on the back of it. Keep the inputs to the plans people describe, keep every score traceable to their own words, and never let the ranking change what anybody is allowed to see or ask. That is the same standard you are already held to in person.

## What to do about it

Measure your own baseline first, because you cannot tell whether scoring helped if you never wrote down where you started. Take the last ten leads in your CRM and, against each name, answer the three questions from further up this page: are they pre-approved, is there a house to sell, and when do they have to move. Do not go hunting. Answer only from what is already on the record.

The number that matters is how many of the ten you could answer at all. In most pipelines it is one or two, and the useful part is not the score. It is discovering that on eight of them you are ranking your Tuesday on a name, an email address and a timestamp, which is the same as not ranking it.

There is a walkthrough of the whole thing on [the RealtyLT AI page](/ai#qualify). The [lead qualification page](/services/lead-qualification) sets out exactly what gets read, what gets scored, and where each band of leads is routed.

None of this has anything to score unless a conversation happened first. [The 11:40pm website conversation](/blog/ai-chat-assistant-real-estate-website) and [the 9:42 Sunday phone call](/blog/ai-voice-agent-missed-calls-real-estate) are where the sentences come from, and [the leads already sitting in your CRM](/blog/database-reactivation-old-real-estate-leads) are the ones nobody has scored at all.

[[scene:funnel]]`;

export const WORKFLOW_AUTOMATION_POST = `Ask an agent what they do all day and they will tell you they sell houses.

Then get them to write down every step of one deal, from the first inquiry to the closing table, and hand them a highlighter for anything that involves typing something into a system that another system already knows. The page turns yellow.

That yellow is the busywork tax. It is not one big thing. It is forty small ones, each of which takes about ninety seconds, and none of which feels worth automating on its own.

Ninety seconds is also not what any of them cost.

[[scene:in-short]]

[[scene:reel]]

## What ninety seconds actually costs

In 2005 three researchers at the Donald Bren School of Information and Computer Science, University of California, Irvine published the results of shadowing twenty four information workers at their desks with a stopwatch. Seven managers, nine analysts, eight developers. Each one was formally observed and timed for three and a half days, an average of twenty five hours and forty two minutes per person, more than seven hundred hours of observation in total, with every action noted to the second.

It is not a survey of how busy people feel. It is a timed log of what they actually did, and it is still the clearest measurement anybody has published of the thing this article is about.

They found that people spent an average of eleven minutes and four seconds on one piece of work before switching to something else or being interrupted, and that fifty seven percent of those stretches ended in an interruption rather than in a decision to stop. Then they measured the part almost nobody measures: how long it took to come back.

[[scene:fragmented]]

Put the middle bar next to the ninety seconds. The typing is not the cost. The cost is that a ninety second job pulls you out of something, and the something takes an average of twenty five minutes and twenty six seconds to get back to.

The third bar is the one that should worry a real estate business in particular, because it is the shape of every step in your week that only happens when somebody remembers. Work that people picked back up themselves resumed in twenty one minutes and twenty eight seconds. Work that waited for somebody else to prompt the return sat for sixty one minutes and thirty seven seconds, nearly three times as long.

One caution about that study, because it is the honest way to use it. Those were desk workers at a technology company, in one field study, and none of them were selling houses. It tells you what interruption does to knowledge work. It does not tell you what your own week looks like, and anybody who converts it into a dollar figure for your business has stopped citing it and started decorating with it.

## What it actually looks like

Here is a real chain, the kind that exists in almost every real estate business, written out honestly:

1. A lead fills in a form at 11:47pm.
2. It lands in an inbox.
3. In the morning, somebody reads it.
4. They type the name, email, and phone into the CRM.
5. They do not notice this person is already in the CRM, so now there are two of them.
6. They write a reply.
7. They set a reminder to follow up.
8. Three days later the reminder fires and they cannot remember who this was, so they read the original email again.

Eight steps. Maybe twelve minutes of human attention, spread across three days, most of it spent reloading context that was already written down somewhere. Step eight is the twenty five minutes in miniature, three days late.

Now do that forty times a month.

[[scene:three-lies]]

[[scene:plate]]

## What automation actually is, without the jargon

It is plumbing between the tools you already pay for.

Your CRM holds the contact. Your calendar holds the time. Your email holds the conversation. Your forms hold the intake. Your documents hold the deal. All five of them know things the other four need, and the way that information currently travels between them is a human being with a mouse.

Tools like [n8n, Make, and Zapier](/services/workflow-automation) connect them, so that finishing one step starts the next. Put a language model in the middle and it can also make the small judgment calls that used to need a person: is this the same Sarah Miller who inquired in March, is this lead actually hot, does this message need a human being rather than a template.

[[scene:rebuilt]]

Nobody woke up. Nobody typed. The lead was answered while they were still on the site, the second record was never created, and the reminder in step seven was never needed, because the task arrived with the context already attached to it.

## How to find your own version of this

You do not need a consultant for the first pass. You need a piece of paper and an honest hour.

[[scene:audit]]

Then rank it, because the order you do them in matters more than the list does. Sort by two things and ignore everything else: how often the step happens, and how little judgment it needs. The top of that list is always something dull and frequent, a field being copied from one system into another twenty times a week, and it is worth more than the impressive-sounding thing at the bottom that happens twice a month and needs somebody to think.

Most people get this backwards, and it is an expensive way round. The interesting problem is the one with judgment in it, so that is the one they want to automate first, and it is the one most likely to be wrong in front of a client. Start with the boring repetitive hop that nobody will miss, watch it run for a fortnight, and let the trust be earned by something whose failure costs an apology rather than a deal.

There is a third column worth adding while you have the page out: who notices when this step does not happen. If the answer is nobody, you have found something more useful than a time saving. You have found a step that has probably already been skipped, more than once, and nobody knows which deals it was skipped on.

When you have that list in front of you, the arithmetic is the easy part.

[[scene:busywork-calculator]]

[[scene:pull-quote]]

## The failure nobody warns you about

Automation you cannot see is automation you cannot trust, and the failure is never the one people brace for. Nothing explodes. A chain quietly stops firing and nobody notices for a fortnight, because nothing visibly broke. It just went quiet.

The platforms are more candid about this in their documentation than any vendor will be in a sales call. [Zapier's own help pages](https://help.zapier.com/hc/en-us/articles/14167175792909-Decide-how-your-Zap-handles-errors-with-advanced-settings) state that by default it "automatically pauses a Zap if it hits an error 95% or more percent of the times that it has run in the last 7 days", and its [run status reference](https://help.zapier.com/hc/en-us/articles/20505304170637-Review-run-statuses-in-Zap-workflows) adds that a chain erroring repeatedly "will automatically turn off".

That is a sensible default and it is not the interesting part. Read the threshold the other way round. A chain that fails nineteen times out of twenty gets switched off, and you find out, because the work visibly stops. A chain that fails one time in twenty stays on, stays green, and is doing exactly what it looks like it is doing ninety five percent of the time. Over forty leads a month that is two people who wrote to you and got nothing, every month, and there is nothing in the system whose job it is to tell you their names.

The same asymmetry is in the tools that do it properly. [n8n documents an error workflow](https://docs.n8n.io/flow-logic/error-handling/) that begins with an Error Trigger and runs when an execution fails, so a failure can send a message to a person instead of landing in a log. It is one setting per chain. Almost nobody sets it, because on the day you build a chain it works, and a thing that works does not feel like it needs a smoke alarm.

[[scene:silence]]

[[scene:plate-two]]

[[scene:offer]]

## What it costs, and how long it takes

There is no honest price on this page, because the number depends on three things nobody can guess from an article: how many systems the chain has to touch, whether those systems have a usable interface for software to talk to, and how many steps need a judgment rather than a field copy. Anybody who quotes you before asking all three is quoting a template.

What can be said honestly is the shape of it. The platforms themselves are the cheap part and are billed by how often your chains run, so a small business pays a subscription rather than a project. Simple chains, like intake and an instant reply, are typically live in days. Multi-system workflows with real branching take longer, and the slow part is almost never the building. It is mapping what your business actually does today, which is the hour with the piece of paper, done properly and with somebody arguing with you about it.

The recurring cost people forget is ownership. A chain is software. It will break the day a vendor renames a field, and somebody has to be the person who notices. Budget for that, or the chain quietly becomes one of the mistakes it was built to remove.

## The first month, and the two things to do in it

Nearly every chain that dies quietly dies in its first four weeks, and it dies because the go-live was treated as the finish. Two habits in that first month are worth more than anything you can specify beforehand, and both are free.

The first is to open the run history in week one and read it, line by line, for one chain. Not to check whether it worked. To check whether what it did matches what you thought you asked for. This is the week you discover that a duplicate record is being created rather than matched, or that the reply going out in your name says something you would never say, or that the step you assumed ran on every lead is only running on the ones that came through the website. None of that shows up as a failure. It shows up as a green run doing the wrong thing politely.

The second is to break it on purpose. Put a deliberately bad value into one chain, or switch off a credential for ten minutes, and then sit and wait to find out whether anybody is actually told. If nothing arrives, you have learned the most important fact about your own system before it mattered, and you have learned it on a test record instead of on a client. That is the whole argument of the section above, run once, in the only way that proves it.

After the first month, put a repeating reminder in your own calendar to open the run history once a quarter. It takes ten minutes and it is the difference between a system you own and a system that owns a corner of your business without telling you what it is doing in there.

## What it does not do, and should not pretend to

It does not fix a bad process. If the manual version of the job loses leads, the automated version loses them faster, at three in the morning, with a log entry saying it worked. Wiring makes a process consistent, and consistency is only an improvement when the process was right.

It does not remove judgment. Every chain worth building has a step where a person would have paused, and the correct behaviour at that step is to stop and ask rather than to guess. A system that guesses when it should have asked will eventually guess wrong in front of a client, in writing, at a time of its own choosing.

It is mostly not artificial intelligence, whatever it gets sold as. Four of the six hops in the diagram above are a field moving from one place to another with no cleverness in them at all, and they are more reliable for it. A model earns its place at the one or two steps that genuinely need a decision. A build that puts a language model in front of a step which was really an if statement has bought unpredictability it did not need and cannot debug.

And it does not hand you back a day. It hands back an afternoon a month and removes a category of mistake. That is a smaller and duller claim than the one usually made for this, and it is the one that survives contact with a real business.

[[scene:failure-modes]]

## Common questions, answered honestly

### What is workflow automation, in plain terms?

It is connecting the software you already use so that finishing one step automatically starts the next. Instead of a person copying a lead from a form into a CRM, writing a reply, and setting a reminder, the whole chain fires by itself the moment the form is submitted.

### What is the difference between n8n, Make, and Zapier?

They all wire apps together and they differ in depth. Zapier is the simplest and the most limited. Make handles branching and more complicated logic. n8n is self-hostable and the most flexible, which matters when a workflow needs custom code or the data has to stay in your own environment. The right answer is decided by the workflow, not by a preference, and it is worth asking anybody who tells you otherwise why.

### Do I have to replace the software I already use?

No, and that is the point of it. Automation sits between your existing tools and connects them. Your CRM, your calendar and your inbox stay exactly where they are, which is also why this is usually the cheapest improvement available to a small business: nothing has to be migrated.

### What happens when an automation breaks?

It should alert, log what failed and why, and not silently drop the work. That is a build decision rather than something you get for free: the platforms will retry and will eventually switch a chain off, but only a chain that was built with an error path tells a human being. Chains should also be versioned so a bad change can be rolled back, and any step needing real judgment should be built to stop and ask.

### How long does it take to automate a workflow?

Simple chains, like intake and an instant reply, are typically live in days. Multi-system workflows with real branching take longer, mostly because mapping what your business actually does today is the slow part, not the building.

### Is any of this worth it for a one-person business?

Often more, not less. A one-person business has no one to absorb the busywork, so every manual step is taken out of the only calendar there is. Start with a single chain at the top of the frequency list rather than a platform, and judge it after a month against how many times you touched that job by hand.

## What to do about it

Go and get the highlighter. One deal, from the first inquiry to the closing table, every step written down in the order it really happens, and a mark against anything where a person types in something another system already knows. Nobody has to approve it, it costs an hour, and at the end of it you are holding the only document that makes any of the rest of this decidable. Until that page exists, every quote you are given is a guess about a business the person quoting has not seen.

You can see the wiring on [the RealtyLT AI page](/ai#workflow), and what gets connected to what is on the [workflow automation page](/services/workflow-automation). If you would rather somebody sat through that hour with you, that is exactly what the [AI audit](/services/ai-audit) is: we follow one real job, rank what each fix is worth, and build the first one.

Three of the hops are written out at length on their own: [the 11:40pm website conversation](/blog/ai-chat-assistant-real-estate-website), [the 9:42 Sunday phone call](/blog/ai-voice-agent-missed-calls-real-estate), and [scoring the lead once it arrives](/blog/ai-lead-qualification-real-estate-scoring).

The tax is not going to itemise itself.

[[scene:funnel]]`;
