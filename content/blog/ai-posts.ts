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

export const CUSTOM_AUTOMATION_POST = `It had run every weekday morning for two years and nobody had thought about it since the week it was built. A record came out of one system, got tidied, got a couple of fields filled in, and landed in another. Somewhere over five hundred mornings in a row, without a single complaint.

Then on a Tuesday a field came back with a value it had never seen before. Not a broken value. A perfectly ordinary new one, added by the company that runs the system, published in their release notes, and entirely within the promise they had made about not breaking anything.

The chain did not stop. It did the thing it had been told to do when it did not recognise something, which was to take the last branch, because that was the sensible thing to do in 2024 when there were only three values and the third one was the rare one.

Nine days later somebody noticed.

Nothing catastrophic happened in those nine days. A few dozen records went to the wrong place and were quietly put right in an afternoon, which is the usual size of this kind of failure and is also why it is worth writing about. The expensive part was not the mistake, it was the nine days, and the nine days happened because the chain had no way of saying that something unfamiliar had turned up.


This article is about the part of a bespoke build that nobody quotes for, and it is not the code. It is the fact that from the moment the thing works, you own it, and everything underneath it belongs to somebody else.

[[scene:in-short]]

## What custom actually means, and when nothing off the shelf will do

Custom is not a level of ambition. It is a description of where a problem sits, and there are exactly four situations where the honest answer is that no product covers it. Three of them are real and the fourth is the one that costs businesses the most money.

[[scene:when-custom]]

One distinction runs under all four, and it is the one a sales conversation blurs, so it is worth setting out on its own. A product solves the version of a problem that enough businesses share for somebody to make a living from it. Everything else is either not a real problem or is real and too rare to be a market. Only the second of those is a case for building, and telling them apart is genuinely hard from the inside, because the thing capping your business always feels like it must be universal.

The most useful question is not whether a tool exists. It is how many other businesses would recognise the description of the step. If the answer is thousands, look harder for a product before you commission anything, because a product with ten thousand customers has already had its awkward edges found by people who were not paying to find them.

## The quote covers the part that ends

Here is the shape of the commercial arrangement, and nothing about it is a trick. A build has a scope, a price and a finish date. What happens after the finish date has none of those three, and that is not dishonesty, it is incompleteness.

[[scene:plate]]

That is not an argument against building anything. It is an argument for reading the quote as what it is, which is the cost of the first stage of something with no last stage.

[[scene:three-costs]]

Of those three, the second catches small businesses hardest, and the polite version of it does not land, so here is the direct one. A bespoke automation is often understood by exactly one person. For a year that is completely fine, and it is fine in the same way that having one set of keys is fine. The cost of that arrangement is not paid continuously. It is paid all at once, on the day you need a change and that person is not available, and the size of the bill at that moment is set by how much of the thing was written down rather than by how well it was built.

There is a cheap fix and it is easy to leave out of a scope, which is a written description of what the chain does, in the language of the business rather than in the language of the software, kept with the thing itself. It costs an hour at the end of a build. It is the difference between a change and a rebuild.

## Everything it stands on belongs to somebody else

The part that surprises people is not that vendors change things. It is how short the promises are when you go and read them, and how honest the vendors are about it.

[[scene:notice]]

Three companies with more to lose from breaking their customers than almost anybody, all publishing what they will actually guarantee, and the longest guarantee on that chart is two years. A brokerage does not think in two year horizons about its own operations. It thinks about the way it has always done things, and that habit is older than any of these policies.

Read the exceptions rather than the numbers, though, because the exceptions are where the honesty is.

[[scene:pull-quote]]

Every clause in that sentence is reasonable. A company should be able to change something to comply with the law or to close a security hole, and nobody would seriously argue otherwise. The third one is the interesting one: a substantial economic or material technical burden is a judgment the vendor makes about its own business, and it is the escape hatch that means twelve months is a policy rather than a contract term you could plan around.

The same clause carries one more thing worth knowing, and it is the one that catches builds most often. The commitment does not apply to anything that has not reached general availability. Plenty of genuinely useful functionality sits in preview for a long time before it is promoted, and building on a preview is building on something whose owner has explicitly promised you nothing.

[Microsoft's modern lifecycle policy](https://learn.microsoft.com/en-us/lifecycle/policies/modern) has the same shape, promising a minimum of twelve months' notice where no successor product is offered, and excluding free services and preview releases from that. [Meta's](https://developers.facebook.com/docs/graph-api/guides/versioning) is the tidiest of the three and the easiest to misread: a Graph API version is guaranteed for two years, but the clock starts on the day the NEXT version ships rather than on the day yours does. Build against a version that is eighteen months old and you have six months, not two years.

## The change that is not a breaking change

There is a shared vocabulary for this, and learning it explains how a build can break on a day when nobody broke anything.

[Semantic versioning](https://semver.org/) is a published convention for numbering releases, and a great deal of software follows it. Its rule is three lines long: increase the major version when you make incompatible API changes, the minor version when you add functionality in a backward compatible manner, and the patch version when you make backward compatible bug fixes. That gives everybody a shared meaning for a number, and it means a responsible vendor can tell you, in advance, when something will hurt.

Now here is the gap, and Stripe documents it more clearly than anybody so it is worth quoting them. In [their API reference](https://docs.stripe.com/api/versioning) they distinguish two kinds of fixed-value field. A closed one has a set of possible values that is fixed and will not grow. An open one can grow, and they say plainly that new values can be added as a backward-compatible change without requiring an API version upgrade. Their advice to developers follows from that: do not assume that the documented values are exhaustive, and write code that handles a value it has never seen.

That is the Tuesday at the top of this page, described by a vendor in advance, in public, as an ordinary thing they will do. Nobody broke a promise. A new value arrived in a field, which was always allowed, and the chain had been written by somebody who assumed the list was finished.

The lesson for anybody commissioning a build is small and specific enough to ask for by name. What does this do when it meets something it does not recognise? There are only two acceptable answers and neither is a guess. It stops and tells somebody, or it sets the thing aside for a person to look at. A chain that quietly picks the nearest option is a chain that will one day pick the wrong one for nine days.

## Who pays when software does not work

There is an old and useful piece of work on this and it comes from the American standards body rather than from anybody in the industry.

[[scene:bearing]]

Read the chart's note for what that estimate does and does not rest on. What matters here is the direction of the split: when software does not work, the great majority of the cost lands on the business using it.

That is true of anything you buy, and it is true twice over for something built for you alone. A product with ten thousand customers has ten thousand people who might hit a fault before you do and a vendor with a commercial reason to fix it. A build with one customer has you, and the fault is found on the day it costs you something.

There is a second reading of that ratio which is worth having in front of you during a quote. The people selling you a build are not the people who will carry most of the cost of it going wrong, and that is not a criticism of anybody's integrity, it is simply where the incidence falls. It is the reason the questions further down this page are all about what happens afterwards rather than about what gets made, and it is the reason a builder who volunteers those answers before being asked is worth more than one who is cheaper.

None of that is a reason not to build. It is a reason to insist the thing tells you loudly when it is unhappy, which costs almost nothing while it is being made and returns more than anything else on this page.

## The number this page will not print

There is one statistic anybody who has read about this will have seen, which is the share of a system's total lifetime cost that goes on maintenance rather than on building it. The usual range quoted is somewhere between sixty and eighty percent, and it is quoted so often that it has the feel of a settled fact.

It is not printed here, and the reason is a check rather than a shrug.

The figure traces back to two places. One is a survey of data processing organisations published in [Communications of the ACM in 1978](https://dl.acm.org/doi/10.1145/359511.359522). The other is an article in IT Professional in 2000. The 1978 paper is certainly real: its catalogue record exists, with a publication date and a reference count. Getting at the paper itself is another matter. The ACM's library sits behind a bot check that no automated request made for this article cleared, in a browser or otherwise, and the publisher's page for the 2000 article answers with an eight kilobyte shell containing none of the article's text, no occurrence of the word maintenance, and no occurrence of the number.

So neither could be read in the original, which means nobody writing this page can tell you what was actually measured, on how many systems, in what industry, in a decade when software was written and deployed in ways that no longer exist. A number nobody can check is not a conservative estimate. It is a rumour with a citation attached.

There is a second thing missing from this page for a related reason, and it is more interesting because the source IS readable. A much reproduced table in software economics shows the relative cost of fixing a defect at each stage of a project, rising steeply the later it is found. It appears in the same standards report the chart above comes from. Its own caption reads Example Only. It is an illustration the report uses to explain the concept, not a measurement of anything, and drawing it would have been a fabrication with a footnote.

What can be said honestly is narrower and it is enough. Maintenance is not a small share of what a build costs over its life, which anybody who has owned one will recognise, and no number worth printing exists for how large a share it is.

## What makes a bespoke build survivable

Five properties, and every one of them is cheap at the beginning and expensive to add later.

It fails loudly. The ending to plan for is not an error, it is silence, and silence is indistinguishable from having nothing to do. Something has to shout, somewhere a person actually looks.

It refuses rather than guesses. When it meets a value, a document or a case it does not recognise, it puts it aside for a person. This is the same principle every other build on this site rests on and it is the one that prevents the expensive class of failure rather than the annoying class.

It is described in your own words. One page, kept with it, saying what it does and why, in the language somebody in your office would use. This is what turns the next change from a rebuild into a change.

It has a named owner. Not a maintainer of the code, a person in your business who would notice it stopping and whose job it is to care. Where there is nobody, there is no build worth making.

And it has a review date. A date in the calendar, once a year, where somebody asks whether this is still worth having. That is the only mechanism that ever retires anything.

[[scene:lifecycle]]

[[scene:changes-calculator]]

## What happens on the day you want to change it

Every conversation about a build is about the first version, and there is nearly always a second version, because businesses move. What the second version costs is decided almost entirely by choices made during the first, and almost none of those choices feel important at the time.

The first is whether the rules live in one place or are scattered through the thing. A chain where the decisions are gathered in one step, written the way a person would write them, can have a rule changed by somebody reading it and editing a line. A chain where the same decision is expressed in four places, slightly differently, cannot be changed at all without somebody rediscovering all four, and rediscovering them takes longer than writing them did.

The second is whether anybody can see what it did. A build that keeps a plain record of every run, what came in, what it decided and what it wrote, can be debugged by anybody. A build with no record has to be reproduced before it can be understood, and reproducing something that only happens when a particular kind of record arrives is most of the work.

The third is the one people find hardest to hear. The more the first version was made to fit exactly how you worked in the month it was written, the more expensive the second version is, because every specific accommodation is a thing the next change has to be careful of. There is a real tension here and it should be said out loud rather than smoothed over: the case for building rather than buying is precisely that it fits you, and fit is also what makes it rigid. The resolution is not to build something generic, which would defeat the point. It is to be specific about the rules and plain about everything else.

None of this is exotic engineering. It is three habits, they cost nothing during a build, and they are the difference between a second version that takes an afternoon and one that gets quoted as a rebuild. Ask for them by name.

## When not to commission one at all

Four situations, and none of them are about the technology being immature.

When the process is still moving. A chain wired to a way of working that is being redesigned spends its life being rewired, and the rewiring is not cheaper than the build was. Wait until the shape has stopped changing, and judge that by whether anybody has moved a step in the last few months rather than by a date.

When you cannot describe it in a paragraph. Not because a builder needs the paragraph, but because being unable to write it means the decision inside it has not been made, and software will make that decision for you by accident and then hide it.

When nobody would notice it stopping. This is the shortest test in this article and it removes more candidates than any of the others. Something nobody would miss for a month is either not worth automating or is worth automating and nobody has been made responsible for it, and both of those are answered before a build rather than by one.

And when the honest reason is that a product exists and you do not like it. Sometimes that is a real reason, because a tool you will not use is worth nothing. More often it is an expensive way to avoid a fortnight of getting used to something.

## How to test a builder before you hire one

Four questions, and the first two are worth more than everything else you could ask.

Ask what it does when it meets something it does not recognise. Listen for whether the answer contains a person. Anything that describes a sensible default is describing the failure at the top of this page, and the follow-up question is what the default was chosen against and who decided.

Ask how you would find out it had stopped. Where the answer is that the missing output would tell you, ask what that output looks like on a quiet week, and watch what happens.

Ask what happens to it if this relationship ends. The answer should involve the thing running somewhere you control, described somewhere you can read, in a form somebody else could take over. Anything that lives only in an account of theirs is a build you are renting.

Ask what they would talk you out of. A builder with nothing on that list has either never seen one of these go wrong or is not going to tell you about it.

[[scene:offer]]

[[scene:plate-two]]

## What it costs, and how long it takes

The build divides into two shapes with very different prices, and which one you have is decided by the systems rather than by the logic.

Where every system involved has a decent published way in, the work runs to days instead of weeks, and a good share of it is agreeing the rules rather than writing anything. That is the boring, good version of this work.

Where something has to read a document, deal with a system that has no proper way in, or wait on an office that is not yours, the price is set by that obstacle and not by the rest. Treat it as its own project with its own shape, and treat any quote offered before the obstacle has been looked at as a guess.

Then there is the running cost, and it has two parts that are usually collapsed into one. The infrastructure is small: this class of thing does not consume much of anything. The ownership is the real number, and this article deliberately does not quote it, because it is your hours and not our invoice. Size it with the calculator above rather than with a guess, and if the answer looks small, that is because it is small per year and permanent.

## What it does not do, and should not pretend to

It does not spare anybody from understanding the work. Automating a step you cannot explain moves the confusion rather than resolving it.

It does not survive a process that keeps changing. A chain wired to a workflow that is redrawn every month spends its life being rewired, and that cost is real and recurring.

It does not take the person out of the steps that need one. Any step that guesses where it ought to have asked is one that will, on some future day, be confidently wrong to a client's face and leave a record of it.

It does not protect you from other people's release schedules. It exposes you to them, permanently, and the exposure is part of what you are buying rather than a risk somebody can price away.

And it does not retire itself. Nothing does. The only mechanism that ever switches one of these off is a date in somebody's calendar and a person willing to ask the question on that date.

[[scene:wasted]]

## Common questions, answered honestly

### What is custom automation, in plain terms?

It is a chain of steps built around how your business actually works, rather than a product you configure. The pieces are ordinary and mostly already exist: reading from one system, checking or enriching something, applying a rule you decided, writing into another system, telling a person when it cannot proceed. What makes it custom is the arrangement and the rule, both of which are yours.

### Why would anybody build this rather than buy something?

Because a product solves the version of a problem enough businesses share to be worth making a living from, and the step capping you is often not that version. The honest sequence is to look hard for a product first, since one with thousands of customers has had its awkward edges found by people who were not paying to find them, and to build only where the search genuinely comes up empty.

### When should I not commission a custom build?

Four cases. The process is still being redesigned. You cannot describe the step in a paragraph, which usually means a decision has not been made. Nobody in the business would notice it stopping. Or a product exists and the real objection is that you would rather not learn it. The third one removes the most candidates and it is the quickest to check.

### What happens when the software it connects to changes?

Usually nothing, occasionally something, and the awkward middle case is a change that is not officially a breaking change at all. Vendors are allowed to add new values to fields without changing an API version, and they say so in their own documentation. That is why the most important thing to specify in any build is what it does when it meets something unfamiliar, and why the only good answers involve stopping and telling somebody.

### Who fixes it when it breaks on a Friday night?

Ask that before you sign anything, because the answer is a commercial arrangement rather than a technical one. What matters more is that most of these failures are not urgent in the way an outage is urgent: the honest requirement is usually that somebody notices within a day, not within an hour. Which is why loud failure is worth more than a fast response.

### Who owns it if we stop working together?

You should, and it should be true rather than promised. That means it runs somewhere you control, using credentials that are yours, and there is a written description of what it does in language somebody else could pick up. A build that lives only inside a supplier's account is a build you are renting, whatever the invoice says.

### How is this different from workflow automation?

The workflow article on this site is about finding the steps worth connecting and what the manual versions cost you. This one is about what happens after one has been built: who owns it, what it stands on, and what it costs every year afterwards. Same components, different question, and the second question is the one that decides whether the first one was worth answering.

### Is it worth it for a one or two person business?

Sometimes, and the deciding factor is not headcount. It is whether the step is frequent, whether the underlying rule has actually been decided, and whether anybody would notice it stopping. A two person business often scores better on the first two than a larger one, because the rule lives in one head and is genuinely consistent, and worse on the third, because there is nobody spare to be the person who notices.

## What to do about it

One page, tonight, and it is not a specification.

At the top, the step you would most like to hand over, written as a paragraph you could give to somebody starting on Monday.

Underneath, every system it would have to touch, by name. Count anything with its own login.

Underneath that, one name: the person who would notice if it silently did nothing tomorrow.

If the middle list is long and the bottom line is empty, you have not found a build yet. You have found something that has to be decided first, and deciding it costs nothing.

[[scene:funnel]]`;

export const AI_AUDIT_POST = `The list had eleven things on it and it took about twenty minutes to write, which should have been the first clue that writing it was not the hard part.

Answer the phone at night. Stop retyping the same details into two systems. Chase the signatures. Reply to the portal enquiries faster. Get the market note out without a Sunday evening disappearing into it. Every one of them a real irritation, every one of them something a machine could plausibly do, and every one of them written down by somebody who runs the business and knows what actually happens in it.

The hour that followed did not add anything to the list. It crossed four things off it.

Two went because they happen a handful of times a year, and a job that runs four times a year fails without anybody noticing until a client notices. One went because the rule behind it turned out not to exist: three people in the office did it three different ways and all three thought theirs was the policy. And one went because a wrong answer would have gone out in writing, to a buyer, with somebody's name on the bottom of it.

That hour was the product. The list was free.

[[scene:in-short]]

## What an audit is actually for, and it is not the list

There is a version of this service, sold everywhere, that is a discovery meeting with a document attached. Somebody asks what your business does, writes the answers down in a tidier order than you gave them, and returns a deck of opportunities. It is not dishonest. It is just that you already had that information, and what you did not have was permission to remove things from it.

An audit worth money has one property: parts of the list come back shorter than they went in, and each removal has a reason beside it that you can apply again next year without anybody's help.

[[scene:deliverable]]

Why removal is worth more than addition is a thing about small businesses that is easy to say and hard to believe until it has happened to you. Nobody is short of ideas about what to automate. Everybody is short of whatever stops a plausible idea, and a plausible idea that gets built becomes a permanent obligation: something that runs, that somebody has to understand, that breaks quietly in a year when a system it depends on changes underneath it.

Crossing four things off a list of eleven does not save you eleven builds. It saves you four builds, four maintenance obligations and four quiet failures, and it does it before any money has moved.

## The part that is already free, and is not repeated here

Before the questions in this article are any use, somebody has to write down how one real job actually runs, in the order it happened, including the steps that only exist because a system does not do something it was bought to do.

That work is described in detail in [the workflow automation article on this site](/blog/workflow-automation-real-estate-business), which walks through doing it with a piece of paper and no help from anybody, and there is no point in this page saying it again in different words. Go and read that if you have not mapped anything yet, then come back.

What follows starts one step later. You have a list of candidates. Everything below is about what to do with a list, which is a different problem from producing one, and it is where an outside eye is genuinely worth something, because the person who wrote the list is the person least able to remove things from it.

## You are almost certainly not behind

Something has to be said before any of the ranking makes sense, because the feeling that everybody else has already done this is doing a lot of quiet damage to how these decisions get made.

The Census Bureau ran a technology module on the 2018 Annual Business Survey and published the results with a team of economists from the Bureau, from Stanford and from Toronto. It is worth knowing how that instrument differs from the surveys these numbers usually come from. The sample was over 850,000 firms across every private non-farm sector, answering is required by law rather than optional, and about two thirds of the firms in it had fewer than ten employees. The Bureau also publishes [the technology module's own tables](https://www.census.gov/data/tables/2018/econ/abs/2018-abs-digital-technology-module.html), which the paper notes are uncorrected for sample weights and should therefore be read as a lower bound. The authors are explicit about why that matters: privately funded technology surveys, they write, suffer from low response rates and significant selection bias, which limits how far their findings generalise.

[[scene:adoption]]

[[scene:plate]]

Two readings of that chart, and the second one is the useful one.

The first is the obvious comfort. If you have not built anything yet, you are not the last one. The distance between having your information in a computer, which is nearly everybody, and using anything on that list of nine technologies, which was one firm in ten, is enormous, and it was measured on a sample large enough that it is not an artefact of who chose to answer.

The second reading is the one that changes behaviour. A field where one firm in ten has adopted anything is a field with no settled playbook. There is no consensus about what a small business should build first, because not enough small businesses have built anything for a consensus to exist. Which means the confident answers you are being given about what to do first are not summaries of what worked. They are guesses, sold with conviction, and the correct posture toward all of them, including the ones on this page, is to ask what they rest on.

Treat all of it as a fact about how new this still is rather than as a description of the market this week, for the reason the chart's own note gives.

## The three questions that do the cutting

Here is the whole method, and it is deliberately small enough to remember without a document.

[[scene:subtractions]]

Take them one at a time, because each removes a different kind of candidate and the third removes the most.

The frequency question is not really about the saving. It is about detection. Everything anybody builds has a day when it stops working, usually because something it depends on changed and nobody sent a letter. A job that runs several times a week announces its own failure inside a few days, because somebody is waiting for the output. A job that runs quarterly fails in March and is discovered in June by a person who is annoyed. The saving on the quarterly one may be larger and it is still the worse candidate.

The rule question quietly turns into a management problem, and it is the most useful thing an outsider can force. Asking three people how something gets decided, separately, and getting three answers is not a sign that anybody is doing it wrong. It is a sign that a decision was never made and everyone filled the gap sensibly. Building software over the top of that does not resolve it. It freezes whichever version the person writing the specification happened to hear, and then removes everybody's ability to notice.

The consequence question gets skipped, and the reason it gets skipped is that it feels pessimistic in a conversation that is going well. It is also the only one whose answer does not improve as the software improves. Where a wrong answer lands is a fact about your business, not about a model.

The framework the American standards body publishes for managing risk in AI systems makes the same point in a much drier voice, and it is worth quoting for what it puts on the list of options.

[[scene:pull-quote]]

[The AI Risk Management Framework](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf), published by the National Institute of Standards and Technology, is voluntary and is aimed at organisations far larger than a brokerage. It is still worth ten minutes, because it was written by people with nothing to sell, and what it keeps saying is what vendors never say. Its management function opens by requiring a determination as to whether the system achieves its intended purposes and stated objectives and whether its development or deployment should proceed. Its list of risk responses runs: mitigating, transferring, avoiding, or accepting. Avoiding is on the list.

It is also honest about its own limits in a way worth copying. It says plainly that while it can be used to prioritise risk, it does not prescribe risk tolerance, and that the level of risk which is acceptable is highly contextual and specific to the application. There is no universal answer to how careful to be. There is only your business, and what happens in it when something is wrong.

## What should not be automated in a property business

Generic versions of this advice exist and they are worthless, because the categories they warn about are ones nobody was going to automate anyway. This is the specific version for this trade.

[[scene:do-not]]

The first of those three deserves an extra sentence because it gets built most often. A model asked about a property will produce an answer about the property. It will produce a plausible square footage, a plausible tax figure, a plausible school assignment. The failure is not that it invents things in an obvious way, it is that the answer arrives in the right format and at roughly the right size, which is exactly the shape of thing nobody checks.

The correct build for that class of question exists and it is smaller than the one people ask for. It fetches the value from the record that governs it, and where there is no record it says so, out loud, rather than filling the gap. Anything with a document or a data component on this site rests on that same principle: a system may report what a source says, and it may say it does not know. It may not produce the answer itself.

There is a fourth thing to leave alone, not on the list above because it is not really a candidate, and it should be said anyway. Anything you would be embarrassed to tell a client was automated. That is not a legal test and it is not a technical one. It is a good instinct, it is available for free, and it costs nothing to apply before any of the other three.

## Why ranking by the average outcome gets it wrong

Suppose the list is now short and honest. The natural next move is to estimate what each survivor is worth, put them in order of that, and start at the top. That instinct is wrong, and not as a matter of taste.

Two researchers at Oxford assembled what they describe as the largest academic dataset of its kind: 1,471 information technology projects, worth 241 billion dollars, drawn from private-sector records, from published national audit reports in the United States and the United Kingdom, and from federal budget filings. Then they looked at how the cost overruns were actually distributed rather than at the average of them.

[[scene:outcomes]]

The middle of that distribution is boring, which is the point. Ordinary projects come in a few percent over, sometimes under, and if that were the whole story an average would be a perfectly good planning tool. What the authors find instead is a right hand tail far too heavy for that. Seventeen percent of the sample sits out there, against under one percent for a distribution where an average would be safe to reason with.

The practical translation for a business with five candidates on a shortlist is short. The number you would write beside each one is its typical outcome, and typical is not what you are exposed to. You are exposed to the tail, and the tail is not a bigger version of the middle. It is a different thing that happens for different reasons.

Which changes the sorting rule. Sort by how contained the worst case is rather than by how good the expected case is. A candidate with a modest payback whose failure means somebody redoes it by hand for a fortnight beats a candidate with triple the payback and a failure nobody can describe. That is not caution for its own sake, it is what the shape of the data says.

Do not carry those percentages home, and the chart's own note says so: the median project in that sample was planned at three point three million dollars, which is not a category anything a small business commissions belongs to. It is the shape that transfers.

## The failure rate nobody can give you

At about this point somebody asks what proportion of these projects fail, and there is an answer in wide circulation. It should not be used, and the reason is specific rather than a general grumble about statistics.

The figure comes from a report published annually by a private research firm and sold rather than published, and the specific complaint the academic literature makes about it is that its underlying data has never been opened to independent inspection. Two researchers at Vrije Universiteit Amsterdam, whose paper carries that affiliation on its own byline, did the next best thing: they took the report's own published definitions of a successful and a challenged project, applied those definitions to their own data of [5,457 forecasts across 1,211 real projects](https://www.cs.vu.nl/~x/chaos/chaos.pdf), and looked at what came out.

Their conclusion, in their own words, is that the definitions have four major problems: they are misleading, one-sided, they pervert the estimation practice, and they result in meaningless figures. The mechanism is not subtle. Those definitions score a project purely on how far it deviated from its original estimate, so coming in under budget counts against you the same way as going over, and a well run organisation whose forecasts were independently checked and were genuinely accurate still scored a 35 percent success rate under them. Worse, an organisation the researchers examined had adopted those definitions internally and had thereby trained its own managers to inflate every budget request, which made the forecasts far less accurate while making the success rate look better.

So the honest position, and this article will hold it rather than reach for a number anyway, is that nobody can tell you what share of automation projects fail. The most widely quoted attempt measures something else and the alternatives are marketing. That is the same answer this site has had to give about data broker figures and about response rates for cold outreach, and it comes from the same reasoning: a figure whose method nobody can inspect is not a cautious figure or an optimistic one, it is not a figure.

What can be said is what the Oxford work does support, which is about the shape rather than the rate. Most of these come in near their estimate and a minority go badly wrong, and no average describes both.

## What the order actually gets sorted by

With the failure rate refused and the average demoted, there is still a list and it still needs an order. Here is what it gets sorted by, in the order the criteria get applied.

First, containment. What happens when this one is wrong, and who finds out. Everything that survived the third question is already inside a boundary, and within that boundary you want the ones whose failure is visible and cheap ahead of the ones whose failure is invisible and awkward.

Second, whether the rule is settled. Not whether it is simple, whether it is decided. A settled complicated rule is a better candidate than an unsettled simple one, because the unsettled one is a management job wearing a technical costume and it will come back later as a technical failure.

Third, and only third, the size of the thing. Every other version of this exercise starts here, and it belongs at the end, because it is the criterion that produces the most confident wrong answers. The largest saving on a list is very often the item with the most judgment in it, which is precisely why a person is still doing it.

[[scene:audit-path]]

[[scene:shortlist-calculator]]

## How to run one yourself, without us

Four things, and none of them require anybody to be paid.

Write the list without editing. Every candidate you can name, in the order they occur to you, including the ones you know are silly. Editing while writing is how the interesting-but-wrong candidate survives, because it sounds better than the boring one and you never wrote the boring one down.

Ask the rule question out loud, to three people, separately. Not in a meeting. The answers diverging is the finding, and it will not happen in a room where everybody can hear each other agree.

Put the consequence question against every line, in writing, before you let yourself think about the benefits. In that order specifically, because the reverse does not work: once a benefit has been said aloud, the consequence question stops being asked seriously.

Then put the list away for a fortnight and read it again. Half of what looked urgent will have solved itself, moved, or turned out to be a symptom of something else, and you will have found that out for nothing.

[[scene:offer]]

[[scene:plate-two]]

## What it costs, and how long it takes

The audit itself is short and it is deliberately priced so that a no costs you almost nothing. It is an hour, done with you rather than at you, and the written version comes back afterwards. The reason it is an hour rather than a week is that the questions above are quick and the answers are already in your head. The expensive part of a long engagement is somebody learning your business, and you already know your business.

What actually varies is what happens next, and it varies by a factor nobody can quote in advance, because it depends on which candidate survived. Connecting two systems that both have a decent way in is days. Something that has to read documents, or has to deal with an office that is not yours, is a different order of work, and the honest answer to how much is that it is a different conversation with its own scope.

The cost that appears in neither half is the one this article keeps returning to. Anything built is a thing somebody now owns. Budget for it being looked at rather than only for it being made, and where nobody would notice it stopping, that is a reason to reconsider the candidate rather than a reason to add a monitoring line to the quote.

## What an audit does not do

It does not decide for you. It removes candidates and explains why, and what the business does about the survivors is a decision with your name on it.

It does not see what nobody will say. Everything below the surface of the account has to be volunteered, and an hour with a stranger is not always when that happens.

It does not produce a saving. Every hour identified is an hour you then have to choose to spend on something else, and businesses that do not make that choice deliberately find the hour absorbed within a month.

It does not stay true. The list has a shelf life measured in months, because your systems, your staff and your volume all move.

And nobody has to buy it. Everything in this article can be done by the person running the business, in an evening, with a piece of paper. What buying it gets you is somebody with no attachment to the list doing the crossing off.

[[scene:wasted]]

## Common questions, answered honestly

### What is an AI audit, in plain terms?

It is a short, structured look at how your business actually runs, done to work out which repetitive parts of it are worth automating and, just as importantly, which are not. The output is a written account of the work, a shortlist in a defensible order, the list of things you have decided not to build, and one small automation actually running. The last two are what distinguish it from a sales meeting.

### Can I not just do this myself?

Yes, and you should do the first half yourself regardless. Writing down how one job really runs, and listing everything you would automate, costs nothing and nobody can do it better than the person running the business. What is genuinely harder alone is the crossing off, because everything on that list is there for a reason you agree with, and the value of an outside pair of eyes is that they have no attachment to any of it.

### How is this different from workflow automation?

Workflow automation is the building. An audit is the deciding, and it happens first. The workflow article on this site covers mapping a single job and finding the steps worth connecting, which is where most people should start. This one is about what to do when you already have more candidates than budget, which is a different problem with a different method: subtraction rather than ranking.

### What do I actually get at the end?

Four things. A written account of how the work runs today, including the parts nobody had written down. A shortlist in an order, with the reason for each position beside it. The list of candidates that were removed and why, which is the part you will reuse. And one automation built and running, so the exercise ends in something real.

### Do I need to know anything about AI beforehand?

No, and knowing a great deal about it is a mild disadvantage. The questions that decide this are about your business: how often something happens, whether the rule behind it is settled, and where a wrong answer would end up. Somebody who has read widely about what the technology can do tends to sort by capability, and capability is the least important of the three.

### What should a small business automate first?

Whatever survives the three questions and has the most contained failure, which is usually something unglamorous. The reason this article will not name a specific first thing is that the survey evidence says a settled answer does not exist yet: one firm in ten had adopted anything at all in the largest measurement available, which is not enough for anybody to have learned what works in general. Anybody giving you a confident universal answer is guessing.

### How do you decide what not to automate?

Three tests, applied in order. It happens too rarely for anybody to notice it breaking. The rule behind it is not actually settled, which usually shows up as three people describing it three ways. Or a wrong answer would reach a client before a person saw it. Any one of those is enough on its own, and the third removes the most.

### Is an hour really enough?

For the deciding, usually yes, because the information is already in your head and the questions are short. It is not enough to design anything, and designing is not what the hour is for. If an hour turns into a proposal for a six month programme, the hour was a sales call.

## What to do about it

Do the cheap half tonight.

One sheet of paper, everything you would automate if the budget were not a question, written without stopping to judge any of it. Then one line against each: if this were wrong, who finds out, and when.

Cross off every line where the honest answer is a client. Cross off every line where the honest answer is nobody.

What is left is usually two or three things, and it is now a shortlist rather than a wish. That is the entire exercise, it cost you an evening, and the only thing anybody else can add to it is the willingness to cross off one more.

[[scene:funnel]]`;

export const AI_CLONE_POST = `On Tuesday afternoon fourteen short videos went out, one to each person who had asked about the new listing on the ridge. Every one of them opened with that person's name. Every one of them was in your face and your voice, standing in a room you have been in, saying things you would say.

You were at a closing in Poughkeepsie for most of the afternoon and you have not watched any of them.

Nothing went wrong. That is worth sitting with for a second, because the thing that makes this topic difficult is not the disaster, it is the ordinary Tuesday. Fourteen statements were published in your name, to fourteen people who now believe you said them, and the only person who could have caught a wrong one was in a title company's conference room signing things.

This article is about what a digital twin is allowed to do, which turns out to be a much more useful question than what it is able to do. The ability is not in doubt any more. Whether a particular use of somebody's face is lawful, whether the viewer has to be told, and who is left holding it when a sentence is wrong, are all questions with actual answers, and most of them are shorter than you would expect.

[[scene:in-short]]

## What a digital twin actually is, and the line everything rests on

A digital twin is two separate things sold as one word. There is a model of a face, built from a recording of somebody sitting still and talking, that can afterwards be made to say new words. And there is a model of a voice, built the same way from speech, that can afterwards read a script that person never read. Both are ordinary technology now, both are available to anybody, and neither is interesting on its own.

What is interesting is the second word. A twin of WHOM.

Almost every difficult question in this subject collapses into that one, and it separates cleanly into four cases that behave completely differently in law and in practice. Confusing them is how a business acquires a problem it cannot buy its way out of, because the cheap version and the illegal version look identical from the outside and come out of exactly the same software.

[[scene:two-halves]]

## New York's answer is a statute, and it is a criminal one

This is not a doctrine that grew up quietly in the courts and has to be inferred from a line of cases. It is [Civil Rights Law section 50](https://www.nysenate.gov/legislation/laws/CVR/50), the whole of it fits in a single sentence, and that sentence is short enough to read in a breath.

[[scene:pull-quote]]

[[scene:plate]]

Three words in that sentence do the work, and every summary of it softens at least one of them.

The consent has to be WRITTEN. Not implied by a working relationship, not implied by somebody having been happy about it last year, not implied by an email that says sure. A written permission is the only kind this section recognises, and the reason that matters for a twin is that a twin is a thing you keep. Permission given for one video is not permission for a model that can make a thousand.

The consent has to be obtained FIRST. You do not get to let the video go out on Tuesday and have the paperwork catch up on Friday, because the offence is complete at the moment of the use.

And the section is CRIMINAL. It says guilty of a misdemeanour, which is not how most people picture a marketing dispute. The civil half sits next door in [section 51](https://www.nysenate.gov/legislation/laws/CVR/51), which lets the person go to the supreme court of this state for an injunction and for damages, and adds that where the use was knowing, the jury in its discretion may award exemplary damages. Knowing is not a hard standard to meet when the whole product is a deliberate reproduction of a specific person.

Two practical readings for somebody running a brokerage. If the face is yours, this section is a paperwork exercise you do once and file, and the paperwork is worth having anyway because it forces the questions about scope that nobody asks otherwise. If the face belongs to anybody else in your office, it is the same exercise with a second signature on it, and it should say what happens to the model when they leave, because section 50 does not stop applying on the day somebody changes firms.

Nothing in this article is legal advice, and this is exactly the paragraph to take to somebody whose advice it is.

## What happens to a likeness after the person has died

The assumption is that death ends it. In New York the opposite is closer to true, and the statute that says so is recent enough to be easy to have missed.

[Civil Rights Law section 50-f](https://www.nysenate.gov/legislation/laws/CVR/50-F) has been in force since 2020, on the version history its own page carries, and is titled, plainly, right of publicity. It creates a property right in a deceased personality's name, voice, signature, photograph and likeness, defining a deceased personality as a person domiciled in this state at death whose likeness had commercial value at the time of, or because of, their death. And it does something the older sections never had to: it defines the thing this article is about.

A digital replica, in the statute's own words, is a newly created, computer generated, highly realistic electronic representation that is readily identifiable as the voice or visual likeness of an individual, embodied in a sound recording, image, audiovisual work or transmission, in which either the individual did not actually perform, or did perform but the fundamental character of the performance has been materially altered. That is a careful definition and the second half is the part people miss. Altering what somebody actually said, past the point where it is still their performance, is inside the definition as surely as inventing it from nothing.

The mechanics are worth knowing even if you never touch them, because they show what a mature version of this looks like. The rights are property, so they pass by will or by the intestacy rules, and they can be sold and licensed. Anybody claiming to hold them can register that claim with the secretary of state on a public register, and the statute adds that a successor who has not registered cannot sue over a use that happened before they did. Damages start at two thousand dollars or the actual loss, whichever is greater, plus profits, with punitive damages available. And the right runs out forty years after the death.

There are broad exemptions, and they are the reason a documentary or a satire is not caught: works of political or newsworthy value, parody, satire, commentary, criticism, biographical work with some degree of fictionalisation. What is not exempted is the case that would tempt a business, which is using a likeness to sell something.

So the honest summary for a brokerage is short. A dead person's face is not free, in this state it is somebody's property for forty years, there is a register you could check, and none of that is a project you want to be near.

## The federal rule that covers businesses and does not yet cover people

There is a federal rule about impersonation and it is newer than most of the software. It is also narrower than almost everybody assumes, and the gap is worth knowing precisely rather than roughly.

[16 CFR part 461](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-461) took effect in March 2024, under the title Rule on Impersonation of Government and Businesses. It has three short sections. It makes it an unfair or deceptive act to materially and falsely pose as a government entity or officer, or as a business or officer of one, in or affecting commerce, and equally to materially misrepresent affiliation with, endorsement by or sponsorship by either. Its definitions section is where the reach is: officer includes executives, officials, employees, and agents.

Read that against your own trade for a moment. A video that appears to be an agent of a brokerage, made by somebody who is not, is already within the plain words of this rule, because an agent of a business is an officer of it for these purposes.

What the rule does not cover is an individual, and that is not an oversight. On the same day the final rule was published, the Commission published a [supplementary notice of proposed rulemaking](https://www.federalregister.gov/documents/2024/03/01/2024-03793/trade-regulation-rule-on-impersonation-of-government-and-businesses) proposing to add exactly that. The proposal would rename the rule to cover individuals, define an individual as a person, entity or party, whether real or fictitious, other than a business or government, and add a new section making it a violation to materially and falsely pose as an individual in or affecting commerce.

The second half of that proposal is the one this business has to read carefully, because it is about us rather than about you. The Commission also proposed a means and instrumentalities section: that it would be a violation to provide goods or services with knowledge or reason to know that those goods or services will be used to impersonate. A rule in those terms would put the people who build a likeness inside the same rule as the people who publish one, and the standard is not intent, it is reason to know.

One thing has to be said plainly because it is the sort of claim that ages badly on a website. As of this writing, that proposal is still a proposal. The text in force at [16 CFR part 461](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-461) today is the three sections about government and businesses, and it has no section 461.4 in it. That was checked against the Code of Federal Regulations itself rather than against an article about it, and it is the kind of thing that could change between this being written and you reading it.

## Nobody can reliably tell, and that is measured rather than assumed

There is a comfortable belief in this industry that a client would know. It is the belief a great deal of the informal ethics of AI video quietly rests on, and unlike most of what gets said in this area it has actually been tested.

Two researchers at Lancaster University and the University of California, Berkeley ran a set of perceptual studies with real participants and published them in the Proceedings of the National Academy of Sciences in 2022. They took four hundred synthesised faces and matched each one to a real photograph of a similar person, then asked people to sort them.

[[scene:tell-apart]]

The result is not that people are bad at this. It is that there is nothing there to be good at. The trained group had been shown what to look for and were told after every single answer whether they had got it right, which is about as favourable a condition as anybody could set up, and they ended the session no better than they started it. The paper attributes that to some of the synthetic faces simply containing no perceptible artefact to find.

The natural response is that a machine should do the checking instead. That has been tested too, at a scale no individual company could manage.

In 2020, Facebook AI built and released a dataset of over one hundred thousand video clips made from three thousand four hundred and twenty six paid actors, and ran a public competition on it. The dataset is worth a sentence of its own for a reason that belongs on this page: the authors record that all recorded subjects agreed to participate in and have their likenesses modified during the construction of it, and note in the same paper that many previously released datasets in this field did not guarantee that. Two thousand one hundred and fourteen teams entered.

[[scene:detector]]

The organisers explain why they report precision rather than accuracy, and their reason is the useful part for a business. In realistic distributions, they write, the ratio of faked videos to real ones may be less than one in a million. When almost everything is genuine, a detector that is very accurate still produces far more false alarms than real catches, because there is so much more innocent material for it to be wrong about. That is a permanent property of the arithmetic rather than a temporary weakness in the models.

Put the two studies together and one conclusion falls out that nothing since has softened. Neither the audience nor the software can be relied upon to work out what a video is. Which leaves exactly one party who reliably knows.

## So the telling has to come from you

Once you accept that the viewer cannot tell, the disclosure question stops being a matter of taste and starts being the only mechanism there is. The good news is that it is cheap. The interesting news is that there is a technical standard for the durable version of it, and reading what that standard says about itself is more instructive than reading anything written about it.

The Coalition for Content Provenance and Authenticity publishes an open [technical specification](https://c2pa.org/specifications/specifications/2.1/specs/C2PA_Specification.html) for attaching signed, tamper evident provenance to a media file. It is a serious piece of engineering with serious companies behind it, and the useful thing about reading the document itself is how carefully it describes its own limits.

[[scene:credentials]]

The sentence quoted in the middle of that scene is from the specification's own scope section, and it is worth noticing what a standards body chooses to refuse. It will not tell you whether provenance data is good or bad. It will tell you whether the assertions in it are correctly formed and have not been tampered with, and it says elsewhere that the basis for any trust decision is the identity of whoever signed.

That is a standard describing its own limits accurately, and it is the reason the technical answer and the practical answer are different. The technical answer is a credential that only works if somebody chooses to inspect it. The practical answer is a sentence at the start of the video in which a person says, in their own words, that this was recorded once and assembled by software. It costs four seconds, it cannot be stripped, and it converts the entire problem from something a viewer might discover into something you told them.

## What we will and will not build

Everything above is about the world. This section is about us, and it is the one thing on this page that needs no citation because it is a commitment rather than a claim.

[[scene:promise]]

The /ai page already says that we do not build agents that pretend to be a specific human being, and that was written about voice on a telephone. It applies with more force to a face. A likeness of the person who sat in front of the camera and agreed in writing is a tool. A likeness of anybody else is the thing four separate bodies of law are pointed at, and no amount of the client being a good one moves that answer.

What that means concretely is a short list of things that are not negotiable, and the useful way to read it is as an order rather than as a policy. Each step below only makes sense if the one before it happened, which is why the ones at the end are the ones that get skipped.

[[scene:consent-path]]

## What a twin honestly does for a brokerage

Strip out the excitement and there are three real jobs, and all three are smaller and more specific than the pitch.

It removes the recording session from things that were always scripted anyway. A market note, a new listing walkthrough, a short explanation of what happens after an offer is accepted. These are things where the words matter and the performance does not, which is exactly the case where a twin loses nothing.

It makes an individually addressed version affordable. Not better than a personal video, just possible at a count where a personal video is not. This is the honest version of the pitch: fourteen people get something with their own name in it instead of one blast, and the alternative was never fourteen real recordings, it was one email.

And it gets a face onto material that would otherwise have been text. A page of written follow up and a person saying the same words are not equally likely to be read. That is why so many agents intend to record more than they do.

What none of those three needs is for anybody to be deceived. Every one of them survives being labelled, which is a good test of whether a use is a legitimate one: if telling the viewer would ruin it, the use was never about saving you a recording session.

## The cost nobody quotes, which is watching them

Here is the part that does not appear in any pitch, and it is the reason the fourteen videos at the top of this page are the story rather than an anecdote.

A twin does not reduce the amount of judgment a business has to apply. It moves that judgment from before the recording to after it. When you record something yourself, the checking happens automatically, because you cannot say a sentence without hearing it. When a script is generated and a model reads it, nothing about the process forces anybody to listen to the result, and the volume that makes the thing worth having is precisely the volume that makes reviewing it feel disproportionate.

[[scene:videos-calculator]]

What actually happens to that number is quieter than a refusal. The reviewing gets done for the first fortnight, then it gets done sometimes, then somebody says the last forty were all fine. Nobody ever decided to stop.

The fix is not technology and it is not a bigger budget. It is naming a person and a moment. Somebody watches, before it sends. Where no one has been given that duty by name, the honest response is to produce fewer videos rather than to pretend the watching is happening.

## What nobody has measured, and what this page will not print because of it

Every article about personalised video carries a number about how much better it performs. This one does not, and the absence is deliberate enough to be worth explaining.

The figures in circulation for what a personalised or AI generated video does to a reply rate, a click rate or a conversion rate come, without exception among the ones that could be traced, from companies that sell video software, and none of them states a sample, a method or a control. That is the same pattern as the data broker figures another article on this site had to refuse, and the same answer applies: a number with no method behind it is not a small number, it is not a number.

There is a second gap and it is more specific. The perceptual research quoted above measures whether people can sort synthetic faces from real ones. It does not measure whether your own clients, who have met you, would recognise a video of you as synthetic. Familiarity is a different task and it might cut either way. Nobody has published it, so this page says nothing about it.

And there is a third thing this article deliberately does not describe, which is how any particular avatar is produced, what software makes it, or how convincing the result is. Those are questions about a specific build rather than about the subject, and an article that answered them would be a product sheet wearing an argument.

## How to test one before you commission it

Four questions, none of them technical, and the first two are about paper.

Ask to see the consent document. Not a description of it, the document. It should name the person, say what may be made from the recording, say how long that permission lasts, and say what happens when they revoke it. If the answer is that consent is handled in the terms of service of a tool, that is not a consent document, that is a company protecting itself.

Ask what happens when somebody leaves. A brokerage that builds twins of four agents has built four assets that belong to four people, and two of those people will work somewhere else within a few years. The right answer involves deletion and it involves somebody being responsible for it.

Ask who decides what it is allowed to say. Watch for whether the answer describes a person or a prompt. Both are real answers, but only one of them is a person, and the sentences that get a brokerage in trouble are about schools, boundaries, taxes and permits rather than about anything the model would consider risky.

Ask how the viewer finds out. The correct answer is a sentence in the video. Anything about metadata or credentials as the primary mechanism is a description of something no viewer will ever see.

[[scene:offer]]

[[scene:plate-two]]

## What it costs, and how long it takes

This divides into a part that is easy to quote and a part that decides whether the money was well spent, and only the first part ever appears in a proposal.

The predictable half is the recording session and the model. It is a short session, it happens once, and the ongoing cost is a per minute or per video charge from whichever platform renders the result. Vendor prices in this category move quickly and are quoted per product tier, so no figure is printed here, and what actually drives yours is volume and length rather than anything clever.

The unpredictable half is everything either side of it. Deciding what the twin may say, writing the script boundaries so they hold up when a listing has something unusual about it, and building the review step into the day so it survives month three. That work is a conversation rather than a build, and it decides whether you end up with a library of useful videos or a library nobody has watched.

The recurring cost that is genuinely easy to underestimate is attention, and the calculator above is the honest way to size it. Everything else in this topic scales with volume and gets cheaper. That one scales with volume and does not.

## What it does not do, and should not pretend to

It does not make you present. A twin can deliver information and it cannot notice that somebody is worried, which is most of what an agent is actually for in the moments that matter.

It does not speak for anybody who has not agreed in writing. That is a legal boundary in this state before it is a policy of ours, and the statute attached to it is a criminal one.

It does not decide what is safe to say. That list has to exist before anything is recorded, and writing it is a job for a person who has been in the transactions.

It does not remove the need for somebody to watch what goes out. It increases that need, because it increases the volume, and a build that is working perfectly goes wrong here more often than it goes wrong anywhere else.

And it does not stay honest by itself. A twin used with a sentence of disclosure is a tool. The same twin without that sentence is the same object doing something else entirely, and nothing in the software knows the difference.

[[scene:wasted]]

## Common questions, answered honestly

### What is an AI clone for a real estate agent?

It is a model of your face and a model of your voice, built from a recording of you, that can afterwards deliver new scripts as video without you being in front of a camera. It exists to remove the recording session from material that was always going to be scripted anyway. What it does not do is give you a second person: everything it says still has to be decided, bounded and checked by you.

### Is it legal to use an AI video of myself in my marketing?

Yes, and the paperwork is worth doing properly anyway. New York Civil Rights Law section 50 requires written consent obtained in advance before a living person's likeness or voice is used for advertising or trade, and when the person is you that is a document you sign once. Do it properly rather than informally, because a consent for one video is not a consent for a model that can produce a thousand, and the useful part of the exercise is being forced to write down what may be made.

### Do I have to tell people the video was made with AI?

Treat it as required regardless of what any particular rule says today, because the research is clear that the viewer cannot work it out. A single spoken sentence at the start costs four seconds and converts something a person could discover into something you told them. There are technical provenance standards for marking a file as machine generated, and they are useful, but they are not a substitute: no client is going to inspect a credential.

### Can I use a video of an agent after they have left my brokerage?

Ask, and get the answer in writing before you need it. Their likeness is theirs, not the firm's, and section 50 keeps applying after they change firms. The practical version is that the consent document should have said what happens on departure, and if it did not, the safe assumption is that the permission ended with the relationship.

### What about a testimonial in a client's voice or face?

A real client, recorded with their written permission, is ordinary marketing. A synthesised version of a client, or words they did not say assembled into their voice, is not a grey area in this state. The digital replica definition in section 50-f explicitly covers materially altering a performance somebody actually gave, so editing what they said into something better is inside the same territory as inventing it.

### Will my clients be able to tell it is not really me?

Assume not. In published research, 315 people sorting synthetic faces from real ones averaged 48.2 percent against a 50 percent coin flip, and 219 people who were trained and told the answer after every attempt reached 59.0 percent and got no better with practice. Those were still images of strangers rather than video of somebody familiar, so the transfer is not exact, and there is no published measurement of the familiar case. Plan for the version where nobody notices.

### Who owns the model of my face and my voice?

You should, and it should say so in writing before the recording happens. The three things to have in the document are that the likeness and voice model are yours, that they are not licensed to anybody else or reused on other people's content, and that they are deleted on request. A vendor unwilling to write those three lines down has told you something useful.

### Is this worth it for a one or two person brokerage?

Sometimes, and the test is not size. It is whether you already have material that is scripted, repeated and currently not being recorded because the recording is the bottleneck. If the honest answer is that you would not have made these videos at all, a twin is worth considering. If the answer is that you would have recorded them yourself and just have not, the twin is being asked to solve a discipline problem, which is not what it is.

## What to do about it

Take twenty minutes before you take a camera.

Write down the three things you would put on video every week if recording cost nothing. Then write, beside each one, the single sentence in it that would be expensive to get wrong. A tax figure, a school, a boundary, a timeline, a condition of the property.

That second column is the actual specification for the build, and it is the part no vendor will write for you. It says which sentences a script may generate freely, which ones have to come from a source rather than from a model, and which ones a person has to approve before anything sends.

Then decide who watches. Not whether. Who.

[[scene:funnel]]`;

export const INVOICING_POST = `You sent the buyer to a brokerage two states away in February. It was a good referral, the arrangement was ordinary and lawful, and both of you signed something.

Their deal closed in July.

Nothing happened at your end in July, or in August, and the reason is worth being precise about, because it is not that anybody behaved badly. The event that created the charge happened in a building you have never been to, in a file you cannot see, and the only person who knew about it had a closing of their own to get through that afternoon. Telling you was nobody's job. There was no invoice sitting unpaid in anybody's system, because there was no invoice.

That is the shape of the money problem in this business, and it is close to the opposite of the problem the standard advice about invoicing is written to solve. The standard advice is about the last mile: send it sooner, chase it politely, escalate on a schedule. All of that is real and this article gets to it. But the expensive part in a brokerage happens four months earlier, when something you should have charged for occurred somewhere you were not looking.

[[scene:in-short]]

## What counts as an invoice in a brokerage, and what does not

Before any of the usual advice applies, it is worth separating the money that behaves like an invoice from the money that does not, because a great deal of software is sold on the assumption that all of it does.

Four kinds of money come into a business like this one, and the distinctions between them are not accounting pedantry. They arrive by different mechanisms, they fail in different ways, and only two of them are improved by anything a reminder sequence does. Getting them mixed up is how a brokerage ends up paying for software aimed at the wrong half of its own cash flow.

[[scene:what-is-an-invoice]]

## What this article refuses to tell you about your commission

Here is the refusal, stated in the open rather than buried, because a business owner opening a page about invoicing will look for their commission first.

This article does not describe how a commission is documented, requested or disbursed at a closing. Not because it is unimportant, but because it varies by state, by whether there is an attorney at the table, by which closing agent is running it and by what your brokerage agreement says. The federal statutes that govern a settlement are quoted further down this page, and what they cover is the disclosure a buyer receives and the payments businesses may make to each other. None of them describes how a brokerage gets paid its own commission. Any version of that paragraph we could have written would have been a plausible generalisation, and a plausible generalisation about how your largest payment arrives is worse than nothing.

What can be established, and what the rest of this article is built on, is narrower and more useful than a generalisation would have been. Federal law states clearly who you are allowed to pay and be paid by in a transaction with a mortgage on it. Federal regulation states exactly when money that has reached your bank becomes money you can spend. And New York statute states what you may add to a price when somebody pays you by card. Those three are checkable, they are the same for everybody in this state, and each one has a real consequence for how a brokerage should run.

## The law that decides who you may pay and who may pay you

The Real Estate Settlement Procedures Act is best known for the disclosures a buyer signs at a closing. Its eighth section is not about disclosure at all. It is about payments between businesses, and it is the law that decides which of your arrangements are ordinary commerce and which are a crime.

[12 U.S.C. 2607](https://www.law.cornell.edu/uscode/text/12/2607) has two prohibitions and they are worth reading in the order the statute puts them. Subsection (a) says that no person shall give and no person shall accept any fee, kickback, or thing of value pursuant to any agreement or understanding, oral or otherwise, that business incident to or a part of a real estate settlement service involving a federally related mortgage loan shall be referred to any person. Subsection (b) covers splitting.

[[scene:pull-quote]]

[[scene:plate]]

Two things about those sentences matter more than the summaries of them do.

The first is the scope. Both prohibitions attach to a transaction involving a federally related mortgage loan, and that term is defined in [12 U.S.C. 2602](https://www.law.cornell.edu/uscode/text/12/2602) as, broadly, a loan secured by a lien on residential property for one to four families where the lender is federally insured or regulated, or the loan is federally assisted, or it is intended to be sold to one of the named secondary market institutions. That definition reaches most ordinary purchase mortgages and it does not reach a cash sale, which is a distinction worth holding rather than assuming either way.

The second is the exception list, and one item on it is the reason the story at the top of this page describes a lawful arrangement rather than an unlawful one. Subsection (c)(3) permits payments pursuant to cooperative brokerage and referral arrangements or agreements between real estate agents and brokers. Congress named your trade specifically. A referral fee from one brokerage to another is not the thing this statute exists to stop, and the same subsection separately permits a bona fide salary or compensation or other payment for goods or facilities actually furnished or for services actually performed.

Put those together and a usable rule falls out, one that a person running a brokerage can apply without a lawyer in the room. Money moving between licensed real estate brokers under a referral arrangement is contemplated by the statute. Money moving to anybody else has to be buying something that was actually furnished or actually performed, and the phrase "actually performed" is doing real work: the statute is not interested in what the invoice says the payment was for.

The penalties are not theoretical either. Subsection (d) provides for a fine of not more than $10,000 or imprisonment for not more than one year, or both, and separately makes violators jointly and severally liable to the person charged for the settlement service in an amount equal to three times the amount of any charge paid for that service. Nothing in this article is legal advice, and this is exactly the paragraph to take to somebody whose advice it is.

One more piece of the same statute is worth knowing because it explains why the money side of a transaction feels invisible from a brokerage's desk. [12 U.S.C. 2603](https://www.law.cornell.edu/uscode/text/12/2603) requires the Bureau to publish a single integrated disclosure for mortgage loan transactions, and says that such forms shall conspicuously and clearly itemize all charges imposed upon the borrower and all charges imposed upon the seller in connection with the settlement. The charges get itemised. They get itemised on a form somebody else prepares, in a process somebody else runs, and that is a perfectly sensible arrangement which happens to mean that the paperwork proving what you are owed is not paperwork you produced.

## Paid is three different days, and only one of them is yours

Ask anybody in a small business when they got paid and they will name the day the money appeared. There are actually three days in that sentence and they can be a week apart.

There is the day the other side says they sent it. There is the day it reaches your bank. And there is the day your bank lets you use it, which is the only one of the three that matters if you have people to pay on Friday.

That third day is not a matter of your bank's mood. It is regulated. [Regulation CC](https://www.law.cornell.edu/cfr/text/12/229.12) sets the outside limits, and the limits are more interesting than the averages.

For an electronic payment, which covers a wire and an ACH credit, the rule at [229.10(b)](https://www.law.cornell.edu/cfr/text/12/229.10) is that the bank shall make the funds available for withdrawal not later than the business day after the banking day on which the bank received the payment. There is a definition attached to "received" that is worth reading twice: the payment is received when the bank has both payment in actually and finally collected funds and the information on the account and amount to be credited. The clock starts when the receiving bank has both halves, not when somebody at the other end pressed send.

For a local cheque, 229.12(b) gives the second business day following the banking day of deposit. And then there is the exception a brokerage runs into as a matter of routine.

[[scene:availability]]

[229.13(b)](https://www.law.cornell.edu/cfr/text/12/229.13) says that the availability schedules do not apply to the aggregate amount of deposits by one or more cheques to the extent that the aggregate is in excess of $6,725 on any one banking day. And 229.13(h) allows the bank, where an exception applies, to extend the schedule by a reasonable period, which the same subsection then defines as up to five business days for the class of cheque covered by 229.12(b).

Look at the last cheque your business deposited and ask whether it was above six thousand seven hundred and twenty five dollars. If it was, the two day schedule was never the one that applied to the whole of it, and the outside limit on the part above that figure is the second business day plus up to five more.

There is nothing sinister in that. Banks carry the risk on a cheque until it clears and the regulation is what balances that risk against your access to your own money. The practical consequence is simply that a brokerage which pays people out of an amount it received by cheque is exposed to a schedule it did not set and may not have read.

## What each rail costs, and what you are allowed to pass on

Four rails carry the money in a small property business, and which one a given payment arrives on is chosen by whoever is sending it rather than by whoever is waiting for it.

[[scene:rails]]

The one with a rule attached that is specific to this state is the card. New York [General Business Law 518](https://www.nysenate.gov/legislation/laws/GBS/518), in the version in force since the 2024 amendment, requires that a seller imposing a surcharge on a customer who elects to use a credit card shall clearly and conspicuously post the total price for using a credit card, inclusive of the surcharge. It then adds the cap: any such surcharge may not exceed the amount of the surcharge charged to the business by the credit card company for such credit card use, and the final sales price inclusive of the surcharge shall not amount to a price greater than the posted price.

Two practical readings of that. You may not round up. Whatever the processor charges you is the ceiling on what you may add, so a flat three percent applied because it is a round number is a problem if your actual cost is lower. And the obligation is about posting: the price a customer sees has to be the total they will pay by card. The statute also expressly preserves two tier pricing, which it defines as posting two prices where the credit card price, inclusive of any surcharge, sits alongside the cash price. Violations carry a civil penalty of up to five hundred dollars each.

The other rail worth a second look is ACH, because the ceiling on what a single same day payment can carry has moved twice, and the second move is recent enough that a lot of habits predate it.

[[scene:same-day]]

## The payment instruction that was not from your client

This is the paragraph in this article with the highest cost attached and the least to do with software you would buy.

The FBI's Internet Crime Complaint Center publishes an annual report of what was reported to it. The [2024 edition](https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf) records 859,532 complaints and $16.6 billion in reported losses, with 256,256 of those complaints reporting an actual loss and an average reported loss of $19,372. Business email compromise, which is the category a diverted payment instruction falls into, accounts for 21,442 complaints and $2,770,151,146.

There is a definitional point here that is easy to get wrong and worth getting right, because it changes what the numbers mean. The report has a crime type called Real Estate, and its own glossary defines that as loss of funds from a real estate investment or fraud involving rental or timeshare property. A spoofed instruction to wire closing funds to the wrong account is not counted there. The report's own worked example of exactly that scenario, where buyers received a spoofed email purporting to come from their agents asking them to wire funds to finalise the closing, sits under business email compromise. So the honest summary is that this category contains the property version of the crime and does not report it separately, and anybody quoting you a real estate specific figure from this report has taken it from the wrong table.

[[scene:kill-chain]]

The operational lesson is small, free and entirely about people. A change to payment instructions arriving by email is not a change to payment instructions. It is a request to change them, and it is verified by telephoning a number you already had before the message arrived, never a number in it. That rule costs nothing, it is not a product, and no piece of software this or any company sells is a substitute for it.

## What a payments build can honestly do in a brokerage

Strip out everything that is really about a plumber invoicing for a boiler and four things remain, and only one of them is the reminder sequence.

It can go and ask. This is the one that is worth the most and gets built the least: a standing job that asks, on a schedule, whether the events that create your charges have happened yet. Referrals you sent out, transactions somebody else is closing, work that gets billed when something lands. Nobody at the other end has any reason to remember, and the asking is cheap and unlimited and does not get embarrassed.

It can raise the charge against the agreement rather than against a conversation. What makes a referral fee collectable is the document you both signed, and the invoice that quotes it will be paid by somebody who was not part of the exchange that produced it.

It can chase, politely and on a fixed schedule, which is the ordinary part and is genuinely useful for the ordinary invoices. There is no shame in it being the boring half.

And it can reconcile, which is the step that turns everything above from a record of what you asked for into a record of what you actually have.

[[scene:the-chase]]

[[scene:money-path]]

## Why the chasing is the small half

It is worth being blunt about this because it is where the category sells itself and it is not where the money is.

A reminder sequence works on invoices that exist. It sends them earlier than a person would, it sends the second and third messages a person finds uncomfortable, and it keeps a timestamped record of both. For rental fees, management charges and any work you bill directly, that is a real improvement and it costs almost nothing to set up.

It does nothing whatsoever about a charge that was never raised, and it cannot, because there is nothing in the system to remind anybody about. The unraised charge is invisible to every dashboard by construction, and it is invisible in a specific and cruel way: your accounts receivable report will look excellent, because everything in it is being handled beautifully. What is missing is not late. It is absent.

That asymmetry decides what to ask a vendor before anything else, and it is not about how the reminders are worded. Ask what causes an invoice to come into existence at all, and whether the cause is an event or a person remembering.

[[scene:events-calculator]]

## How to test one before you buy it

Four questions, none of them technical.

Ask what creates an invoice. Watch carefully for whether the answer is a person marking something complete. If it is, then the automation begins after the hard part is over, and the demonstration you are watching starts at the wrong place.

Ask what happens when a payment arrives that does not match anything. A part payment, a payment with no reference, two invoices settled in one transfer. Every one of those is ordinary rather than exotic, and the answer tells you whether anybody who built the product has ever sat down with a live bank statement.

Ask how it decides something was paid. If any part of that answer involves reading a message from the person who owes you, that is the wrong answer, and it is worth asking twice because the first answer is often about the bank feed and the second one is about the email.

Ask what it does about the money that is not yours. The correct answer is that it does not touch it, and a product that is enthusiastic about integrating with a client account is a product to think slowly about.

[[scene:offer]]

[[scene:plate-two]]

## What it costs, and how long it takes

This one divides cleanly into two halves with completely different prices, and the halves get sold as one thing.

The ordinary invoicing half is short and cheap. Your accounting package probably issues invoices and sends reminders already, and the work is connecting it to whatever creates the charge and agreeing the wording and the timings. That is days rather than weeks, and a meaningful share of it is deciding rather than building.

The other half is the asking, and its price is set entirely by who you have to ask and how they answer. A handful of brokerages you deal with constantly, all of whom reply to a text, is one project. Two management companies with portals, an attorney's office that works by email and a title company that answers the phone is a different one, and the price sits in getting hold of them rather than in the logic of it.

Recurring cost is small on this topic because the volume is low. These are not high frequency messages, a business raises and chases a small number of charges a month rather than hundreds, and the ongoing bill reflects that.

The part with a genuine ongoing cost is the reconciliation, and the cost is attention rather than money. Somebody has to look at the exceptions the matching could not resolve, and if nobody is named for that job it will not be done, and everything above it becomes decoration.

## What it does not do, and should not pretend to

It does not collect a debt. After the sequence has run, a business that will not pay is a conversation and possibly a lawyer, and the value of the automation at that point is the record of what was sent and when.

It does not tell you that an event happened. It can ask, repeatedly and cheaply, and asking is not the same as knowing. Anybody can decline to answer and some people will.

It does not make a payment arrive sooner than the rail allows. Availability is set by regulation and by your bank's own policy within it, and no amount of software moves a cheque through the system faster.

It does not touch money that is not yours. Client money is governed by rules specific to your state and your licence, and this article deliberately does not summarise them.

And it does not know whether a payment instruction is genuine. That is a human control with a telephone in it, and treating it as a software feature is how the expensive version of this goes wrong.

[[scene:wasted]]

## Common questions, answered honestly

### What does invoicing automation actually do for a brokerage?

Two separate things that get sold as one. The first is ordinary: it issues invoices for the work you bill directly, sends the reminders on a schedule so the awkward second and third ones actually go, and keeps a record. The second is the one worth paying for here, and it is a standing job that asks other people's offices whether the events you get paid on have happened yet, so that a charge gets raised while everybody still remembers the transaction.

### Does this handle my commission?

This article does not claim to, and any product that claims to should be asked to explain exactly how, in your state, with your closing agent. A commission comes out of a closing that somebody else runs on a date the transaction sets, which is a different mechanism from an invoice you send and follow up. What automation can do around it is track that the transaction happened and reconcile what arrived against what you expected.

### Can I charge clients a card fee?

In New York you may, within a rule. The statute requires you to post the total price including the surcharge, clearly and conspicuously, and it caps the surcharge at what the card company actually charged your business for that card use. A flat percentage chosen because it is a round number can exceed your real cost, and the same statute preserves two tier pricing, which is posting a cash price and a card price side by side. Violations carry a civil penalty of up to five hundred dollars each.

### Why did the money arrive on Monday and clear on Thursday?

Because availability is regulated separately from arrival. For an electronic payment the outside limit is the business day after your bank has both the funds and the instructions. For a cheque it is the second business day, except that the schedule stops applying to the amount above $6,725 deposited in one banking day, and where the bank invokes that exception it may extend the schedule by up to five further business days. Your bank's own policy sits inside those limits and is worth asking for in writing.

### Should I be paying people by ACH instead of by cheque?

Ask your bank three questions before deciding: whether they offer same day origination on your account, what the daily cut-off time is, and what each payment costs. The rail itself has carried up to a million dollars per payment since 2022 under Nacha's rules, which is enough for almost anything a brokerage sends out, but whether it is available to you at that limit and at what price is a matter of your bank rather than the network.

### Somebody emailed asking us to update their bank details. What now?

Telephone them on a number you already had before that email existed, and confirm it with a person. Not the number in the message, not a number in the signature, and not a number you found by searching for the company this afternoon. This is the single control that matters and it works whether or not you ever automate anything.

### Is it worth this for a one or two person brokerage?

The reminder half, probably not, because at that size you know every invoice you have out and sending it yourself takes minutes. The asking half is worth it at any size, because it does not scale with how big you are, it scales with how many arrangements you are a party to, and that number is not a function of headcount.

### What is the first thing to fix?

The list. Before any software, write down every arrangement where somebody else's event is what pays you, and how you would find out that the event happened. Making that list is the part of this topic that needs no budget at all, and it takes an afternoon.

## What to do about it

Take twenty minutes and one sheet of paper.

Down the left, write every kind of money that comes into the business. Not the amounts, the kinds. Commission, referral fees you are owed, referral fees you owe, rentals, management, anything billed separately.

Down the right, write how you find out that each one has become due. Some will say a system tells us. Some will say the closing happens and we know. And at least one is going to say, if you are honest about it, that somebody usually mentions it.

That last line is where the money is, and the fix for it does not start with buying anything. It starts with deciding whose job it is to ask, and how often.

[[scene:funnel]]`;

export const AI_SCHEDULING_POST = `The showing was for eleven on Saturday and it was not your listing. Three people had to be willing for it to happen at all: you, the agent who holds the listing, and whoever has to be out of the house that morning. Two of the three do not work for you and had not been asked yet.

You sent the request on Thursday afternoon. On Thursday evening you told the buyer that Saturday at eleven was confirmed, and you were not being careless when you said it. You had proposed a time, nobody had objected to it, and there it was in bold on your own calendar looking exactly like every appointment that has ever happened.

At twenty past nine on Saturday morning the listing agent replied. The property is tenant occupied and the tenant is entitled to notice.

So you rang a buyer who was already in the car, and you were the person who had told them it was settled. Nothing in that story is a booking failure. The appointment was booked. It was booked by one of the three people whose agreement it needed, and that one was you.

[[scene:in-short]]

## What a scheduling problem is, once the calendar is not yours

There is a version of this business where scheduling really is a calendar problem. You hold the listing, you meet people at your own office, and the only two diaries that have to agree are yours and theirs. For that version, software solved this years ago, and this article has nothing to tell you that a booking link would not.

Then there is the other version, and it is the one this article is about. A buyer wants to see a house that belongs to somebody else's client. An inspector needs two hours inside a property that is occupied. A closing needs an attorney, a lender and a title company in the same hour. In every one of those, the appointment does not exist until people you have never met agree to it, and not one of them has given you access to their calendar.

That difference is not a matter of degree. It changes what the software is actually doing. When the only calendar involved is yours, a scheduling system reads a fact and writes a fact: you are free at two, so two is now taken. When other people are involved, the same system can read one fact and then has to send a message and wait, which is a completely different kind of operation with a completely different failure mode. Reading a calendar cannot fail halfway. Asking somebody a question can fail in a great many ways, and from your side they are indistinguishable, because every one of them looks like nothing happening.

So the unit of this article is not the appointment. It is the agreement you do not have yet, and the whole argument is that a business which does not track those separately from the ones it does have will eventually tell a client something that is not true.

[[scene:not-the-booking]]

## The part nobody automates is the part that is other people

There is one study of a real scheduling assistant, running for real people, that published what actually went wrong. It is the most useful document in this whole subject and it is not from a vendor.

Between April and August 2016, a team at Microsoft Research ran a system called Calendar.help as an open deployment. Subscribers copied an email assistant into their scheduling threads and the assistant took over: it proposed times from the subscriber's calendar, negotiated with the invitees, and put the meeting in. Their [paper](https://arxiv.org/abs/1703.08428) reports 178 participants, 1,981 invitees, 1,626 meetings and 15,659 emails, and it publishes the reasons the machine had to give up and hand a request to a trained human being, which is the part of this subject nothing else we could find puts a number on.

The three commonest reasons are, in order, that an attendee replied in a way the system did not expect, that none of the offered times worked for everybody, and that an attendee never replied at all. Those are 32, 27 and 26 percent of the escalations. They are not three findings. They are one finding written three ways, and the finding is that the difficulty lives on the other side of the conversation.

[[scene:escalations]]

The reason to sit with that chart rather than nod at it is the population underneath it. In the same study, 84 percent of the requests were meetings between two people, and only 15 percent had three or more attendees, with eleven as the largest. That is the easy version of this problem, and the table above is what the easy version looks like. A Saturday showing on somebody else's occupied listing is a three or four party appointment before anybody has thought about it.

[[scene:ceiling]]

Read that chart carefully, because there is an honest reading and a flattering one and the difference matters. The 39 percent is not the share that no human touched. The authors describe their system in tiers, where the first tier is software and the second is a person doing one small, tightly defined task, and the 39 percent covers both. What it measures is the share of requests that never needed the expensive, skilled scheduler. That is a genuinely good result and it is a long way from nobody being involved.

## Who has to say yes before a showing is real

How hard an appointment is to arrange tracks the number of separate permissions it needs, and that number is the thing least likely to be written down anywhere at the moment somebody agrees to it. It is worth counting them deliberately, because they are not all people and they do not all fail the same way. Three of the four below can say no to you. The fourth cannot say anything at all, and being silent is precisely how it stays off the list.

[[scene:who-agrees]]

[[scene:plate]]

## The standard already has a word for an appointment nobody agreed to

Everything your calendar does when it sends an invitation is defined in a published internet standard, and the standard is unusually blunt about the thing this article is about.

The protocol is called iTIP, and it is [RFC 5546](https://www.rfc-editor.org/rfc/rfc5546.txt). It divides everybody into an organiser, who owns the event, and attendees, who do not. An attendee cannot change the master copy of the appointment. What an attendee can do is reply, and the reply carries a single value that says where they stand, which the specification calls PARTSTAT, short for participation status.

The sentence worth knowing is this one, from section 2.1.1: when an organiser issues the initial object, attendee status is typically unknown, and the organiser specifies this by setting the participation status to NEEDS-ACTION. Each attendee then changes their own status to something else as part of a reply sent back to the organiser.

In other words, the protocol written so that different calendaring systems can schedule with each other starts every single invitation in a state that means nobody has answered, and the only thing that moves it out of that state is a message coming back. Not time passing. Not the absence of an objection. Not the appointment being written in bold. A reply, from that person, arriving.

[[scene:states]]

There is one more method in the same specification that is worth knowing by name, because it describes what the listing agent in the opening story was actually doing. The standard calls it COUNTER, and its own table describes it as used by an attendee to negotiate a change, giving the request to change a proposed event time as the example. A counter is not a rejection and it is not an acceptance. It is a third thing, and a system that has no place to put it will file it as one of the other two.

## Moving the time throws away every yes you had

This is the least obvious thing in either specification, and it is the strongest practical argument on this page.

There is a second specification, [RFC 6638](https://www.rfc-editor.org/rfc/rfc6638.txt), which defines how a calendar server does scheduling automatically on your behalf. Section 3.2.8 sets out what a server has to do when the appointment moves, and it is not a suggestion.

[[scene:pull-quote]]

Read that in plain language. If the start time, the end time or the duration of an appointment changes, every attendee's answer is deleted and set back to unanswered, on every affected occurrence, and it applies to everybody except the organiser. The standard treats a rescheduled appointment as a new question, because that is what it is. Nobody agreed to Saturday at two. They agreed to Saturday at eleven, and Saturday at eleven no longer exists.

That has a consequence for how you run a week, and it holds whether or not any software is involved. Every time you move an appointment involving other people, you are spending all of their agreements at once and you have to buy them back. A build that moves an appointment and does not re-ask is not saving anybody a message. It is carrying forward a set of confirmations that the standard, and common sense, both say are void.

## Your own system knows whether the message arrived

Here is a small thing that turns out to be worth a great deal, and it is not on anybody's feature list.

The same CalDAV specification defines a delivery status that gets attached to each attendee on the appointment, saying what happened to the message the server sent them. There are eight published codes, and the reason there are eight rather than two is that the standard takes seriously how many different ways a message can fail to reach a calendar. They collapse into three states a person can act on.

[[scene:delivery]]

None of those eight, including the good one, tells you that the person is coming. Delivered is a fact about a server. Accepted is a fact about a person. They are two different columns and a great deal of the trouble in this subject comes from reading the first one and feeling reassured about the second.

## What a scheduling layer can honestly do across calendars it does not own

Strip away everything a demonstration shows you and there are four things worth paying for here, and only one of them involves reading your calendar.

It can propose without promising. That sounds like a small distinction and it is the whole article: the message that goes to your buyer when a request is raised either says a time or it says a request has gone in, and those two messages produce completely different Saturdays.

It can hold your own side properly. Your calendar is the one thing in this whole exchange that your software genuinely controls, so the moment a proposal is live it should be blocked, and the moment it dies it should be released. Getting the first half right and the second half wrong is how a diary fills up with appointments that never happened.

It can chase, and then stop. An unanswered request needs a second message and then it needs a decision from a person, and the decision is a real product feature rather than an admission of defeat.

And it can re-ask when the time moves, for the reason the specification gives above.

There is one more thing worth knowing about, because a major vendor already returns it and you will not see it in a demonstration. Microsoft's Graph API has a call named [findMeetingTimes](https://learn.microsoft.com/en-us/graph/api/user-findmeetingtimes?view=graph-rest-1.0) which suggests times based on organiser and attendee availability, and every suggestion it returns comes with a number attached. The [documentation for that field](https://learn.microsoft.com/en-us/graph/api/resources/meetingtimesuggestion?view=graph-rest-1.0) describes it as a percentage that represents the likelhood of all the attendees attending, spelled exactly like that on the page. There is a matching input, minimumAttendeePercentage, described as the minimum required confidence for a time slot to be returned at all.

So one of the two calendar platforms this product connects to will hand a scheduling system a confidence figure for every time it proposes. Whatever is built on top of that is free to throw the number away and print the time on its own, which is what has happened any time you are shown a list of times with nothing attached to them. The same page carries a caveat worth quoting too, which is that the suggestion algorithm undergoes fine-tuning from time to time and that identical inputs may produce different results over time. That is a vendor telling you, in its own reference documentation, that this is a judgement rather than a lookup.

[[scene:the-request]]

[[scene:sched-path]]

## Why offering a slot you cannot hold is worse than offering nothing

The instinct when a scheduling system feels slow is to make it more decisive, and the instinct is wrong, because the two failures are not symmetrical.

An appointment you did not offer costs a message. The buyer waits until Friday morning and then hears a time, and the only thing they have lost is a day of not knowing. That is a real cost and it is small, and it is entirely recoverable by saying, on Thursday, that you are waiting on the listing side.

An appointment you offered and then withdrew costs something you cannot get back with a message. The buyer arranged their Saturday around it. They may have told somebody else they were busy. And the specific thing they learn is not that the listing agent was slow, because they were not there for that part. What they learn is that when you say a thing is confirmed, it may or may not be.

So the truthful build is sometimes slower than the untruthful one, and a demonstration flatters the untruthful one. Answering in four seconds with a time looks better on a screen recording than answering in four seconds with a request. The first is measurably quicker and the second is accurate, and no amount of footage will ever make that difference visible to somebody watching a demo.

[[scene:yes-calculator]]

## How to test one before you buy it

Four questions, and none of them needs anything technical.

Ask them to show you what the person on the other end receives before anybody has agreed. Not after. If the message that goes out when a request is raised contains a time and no qualification, that is the product, and no setting later in the flow will undo it.

Ask what happens to your own calendar while a proposal is outstanding, and then ask what happens to it when the proposal dies. Both halves. A system that blocks and never releases will look immaculate for a fortnight and then start telling people you are busy on days you are free.

Ask what it does with a counter. Somebody has replied that eleven is impossible but two might work, in a text message, in lower case, with no punctuation. That reply is neither a yes nor a no, and the chart on this page says some version of it was the single biggest reason a real scheduling agent had to call in a person. Watch where it lands.

Ask how you find out that an invitation was never delivered. There is a real answer to this and it is in the standard, so a vendor who has built on a calendar server will recognise the question.

[[scene:offer]]

[[scene:plate-two]]

## What it costs, and how long it takes

The software is the smaller line here and it is not the thing that moves the number. What moves it is how many different kinds of counterparty you have to reach and how each of them prefers to be reached. One brokerage sets up showings with the same handful of offices, by text, and every one of them replies the same day. Another deals with a rotating cast of listing agents, a property manager who only reads email, a management company with a portal and two sellers who like to be telephoned. Those are different projects, and the difference is in the reaching rather than in the calendar.

The recurring cost that scales is messaging, and this topic generates more of it than you would guess. A single appointment can produce a request out, a chase, a counter coming back, a confirmation to the other office and a note to your own client, and every one of those is metered separately. Ask about that line per message rather than per month, because it is the one that grows as the business does.

Setup is short and the decisions are not. The four that take the time are which appointment types you actually run, what access constraint each of them carries, how long you are willing to keep your own calendar blocked waiting for an answer that has not come, and what should happen when that time runs out. None of the four is a configuration screen. They are policies, you are already applying them informally today, and writing them down has value whether or not any software ever arrives.

The line that never appears on a quote is the habit change underneath all of it. Anything can only report who has confirmed if somebody put the confirmation into it, so the first month is mostly people learning to forward the text message instead of remembering it. That part is unglamorous and free, and a brokerage that does it will get a useful answer out of whatever it buys afterwards.

## What it does not do, and should not pretend to

It does not make anybody reply. That is the whole of the chart earlier on this page in one sentence. The three largest reasons a real scheduling agent had to hand a meeting to a person were all somebody else not answering, or answering awkwardly, and no amount of software on your side changes what happens on theirs.

It does not read a calendar it has not been given. The only availability it can see is yours. Everybody else's is a message, and every product that talks about live availability across parties is talking about your side of it.

It does not decide which appointments are worth having. A system that sets up appointments faster will set up more of them, and if nothing sits between the request and the calendar, that is a fuller week rather than a better one.

It does not know that the tenant has a notice period unless somebody has told it. Access constraints are not published anywhere a machine can read them, and a build that offers times without them will keep proposing eleven on Saturday until a person types the rule in.

And it inherits whatever your own diary already gets wrong. Availability that exists only in somebody's head is invisible to it, so a calendar that gets overridden regularly will produce proposals that have to be withdrawn, and they will now be withdrawn in front of another office rather than quietly between the two of you.

[[scene:wasted]]

## Common questions, answered honestly

### What is AI scheduling, in plain terms?

It is software that takes a request for an appointment, works out what has to be true for it to happen, proposes times to the people whose agreement it needs, keeps track of who has actually replied, blocks your own calendar while it waits, and tells everybody once when it is settled. The intelligent part is narrow: understanding a request that arrives as three lines of lower case text, and keeping one negotiation straight across several threads at once. Everything underneath that is unremarkable record keeping, which is what you want it to be, because record keeping behaves the same on a bad Saturday as on a quiet Tuesday.

### How is this different from AI appointment booking?

Booking is about getting one person from interested to a time they have written down, and about whether they turn up. That has real evidence behind it and it is written up separately on this site. Scheduling, as used here, starts at the point where a time has been proposed and asks who has agreed to it. The two overlap in the easy case, where the only two people involved are you and them. They come apart the moment an appointment needs a permission from somebody who is not in the conversation, which covers every showing on a listing somebody else holds.

### Can it stop a double booking?

It can stop one kind and not the other. It can stop your own calendar being offered twice, because your calendar is the one it can read and write, and holding a slot the instant a proposal goes live is what makes that reliable. It cannot stop the listing side promising the same two o'clock to somebody else, because it has no visibility of their diary and no authority over it. Any product that says double booking cannot happen is describing the first kind and letting you hear the second.

### What happens when somebody replies "maybe"?

That is the interesting question and it is worth asking a vendor before you buy. There is a standard answer available: the calendar specifications carry a tentative state alongside yes and no, and a system can hold a proposal there without rounding it up. What you are checking is whether the product has anywhere to put an answer that is not a decision, because that answer is going to arrive constantly.

### Does moving an appointment need everybody to confirm again?

Yes, and this is not our opinion. The specification that governs how calendar servers do scheduling requires that any change to the start time, end time or duration resets every attendee's participation status to needs action. The agreement was to a specific time. Change the time and there is no agreement, only the appearance of one, and a build that carries the old confirmations forward is carrying forward something the standard says has been cleared.

### How does it know when I am free?

It reads your calendar, which is the ordinary part. Two things are worth checking beyond that. The first is what level of access it is asking for, and this site answers that question in detail on the appointment booking article rather than repeating it here. The second is whether it has permission to write as well as read, because reading alone cannot reserve anything, and a proposal that has not been reserved is still available to whoever asks next.

### What if the other agent never answers at all?

Then at some point a person has to decide, and the useful question is when and who. A reasonable build sends the request, sends one chase, and then puts it in front of somebody with the whole history attached and a client who is still waiting. What you do not want is a system that chases indefinitely, because the queue grows quietly and the person actually waiting is your buyer, who is hearing nothing.

### Is any of this different for a closing?

It is the same problem with more parties and a much higher cost of being wrong, and it is not scheduled by whoever asks first. Nothing in this article suggests automating it. What does transfer is the discipline: know which of the people involved have actually confirmed, in writing, and treat a moved date as a new question rather than an amendment.

## What to do about it

Do this tonight and it takes about fifteen minutes.

Open the next two weeks of your calendar and pick out every appointment that needs somebody outside your own office. For each one, write down how many people had to agree, and then write down how many of those agreements you could actually produce if somebody asked you to. Not remember. Produce, as a message with a time on it.

The distance between those two columns is your exposure, written in your own hand, and it doubles as the list of calls worth making tomorrow morning. A brokerage with no distance between them is already doing the expensive part manually and has nothing to buy from anybody. A brokerage with a distance has just located the Saturday that is going to go wrong, with a week still left in which to stop it.

[[scene:funnel]]`;

export const DATA_ENRICHMENT_POST = `You ran the pass because two thirds of the database had no phone number in it. That is a real problem and enrichment is a real answer to it, and by the afternoon most of those blanks were full.

Somewhere in the middle of the file is a woman you sold a house to three years ago. She gave you that number herself, standing in her own kitchen, and you have texted her on it since.

Her record now has a different number in it.

Nobody decided that. The pass filled in what was empty, and where a field was not empty it wrote anyway, because that is what the default was and nobody was asked. There is nothing in the row that says what used to be there, nothing that says where the new one came from, and nothing that says when either of them was true.

The blanks getting filled is the part everybody talks about. The overwrite is the part nobody mentions, and it is the more expensive half.

[[scene:in-short]]

[[scene:not-the-neighbours]]

## What data enrichment actually is, and what it is not

Three articles on this site are neighbours to this one and one of them is very close indeed, so it is worth drawing the lines before anything else.

Data enrichment is the pass that completes and corrects records you already hold. A contact came in with a first name and an email and no phone. Another has a mailing address and no idea which property behind it they own. A third is the same person as a record you took two years ago under a different email. Enrichment sends what you have to an outside provider and writes back what comes home: a number, an email, the property detail behind the address, a merge.

Two words in that description are doing all the work, and almost nothing written about this subject examines either of them. "Corrects" assumes the outside answer is better than yours. "Writes back" assumes there was nothing there.

The narrow thing worth understanding is that enrichment is not a lookup and it is not a fix. It is the arrival of an assertion from a company you have never spoken to, about a person you have, into a system where it will be indistinguishable from something you knew.

## What comes back is a claim rather than a fact

Think about what actually has to happen for a phone number to appear in that column.

You send an identifier: a name, an address, an email. Somebody else's system then decides which of its own records describes the same human being, on partial information, with no way to ask anybody. Then it returns the value it holds against whichever record it picked.

So the number in your CRM is the end of a chain of at least two guesses: this record is about your person, and this number belongs to that record. Neither guess is shown to you. What arrives is a bare string in a field, formatted exactly like the numbers your clients typed in themselves.

That matching problem has its own long piece on this site, [the one about keeping two systems in step](/blog/crm-sync-real-estate-duplicate-contact-records), and it is worth reading because the published model for it has a third outcome that most builds throw away. One difference changes the whole picture here. In a sync, both systems belong to you and you can open both. In an enrichment response the other system is a black box, and the threshold it used, the fields it weighed and the confidence it settled on are all facts about a company you are merely a customer of.

[[scene:what-a-field-asserts]]

[[scene:plate]]

## Where an appended field actually comes from

There is one primary document on this and it has held up for twelve years because of how it was made.

In December 2012 the Federal Trade Commission issued compulsory orders under section 6(b) of the FTC Act to nine named data brokers, requiring them to file special reports on where their data comes from, what they do with it and what rights consumers have over it. The resulting report, [Data Brokers: A Call for Transparency and Accountability](https://www.ftc.gov/system/files/documents/reports/data-brokers-call-transparency-accountability-report-federal-trade-commission-may-2014/140527databrokerreport.pdf), was published in May 2014 and covers their practices from January 2010. Nine companies, named, under compulsion, describing themselves to a regulator. There is nothing else like it in this subject and everything written since leans on it.

[[scene:broker-sources]]

The finding that reorganises how you should think about an enrichment response is the middle bar. These are not nine companies each independently observing the world. They are, to a substantial degree, one market trading the same records among themselves, and the Commission states the consequence plainly: the nine "obtain most of their data from other data brokers rather than directly from an original source", and one of them draws consumers' contact information "from twenty different sources".

That is the honest picture behind the field in your CRM. Not a company that knows something about your client, but the last company in a queue, passing on what it was passed.

[[scene:pull-quote]]

Read that as a statement about you rather than about consumers. If the person the record is about cannot retrace it, neither can you, and you are the one who is going to be asked.

## Observation and inference arrive in the same column

The same report describes two different kinds of content in these files, and it is the distinction that should change what you do with the output.

There is raw data, which the report describes as things "such as a person's name, address, home ownership status, or age". And there is derived data, "which they infer about consumers". The report gives its own examples of how inference works: a data broker "might infer that an individual with a boating license has an interest in boating, that a consumer has a technology interest based on the purchase of a 'Wired' magazine subscription, or that a consumer who has bought two Ford cars has loyalty to that brand".

Those are marketing categories rather than contact details, and it would be a mistake to say your appended phone number is an inference. What is not a mistake, and is the point, is that both kinds of value come back through the same interface, in the same shape, with no marking to say which is which. A file that contains observations and guesses in the same schema, sold through one API, will land both of them in your database as facts, because a field has no way of holding the difference.

The practical version of this is a question with a short answer, and it is worth putting in writing to whoever supplies you: for each field you buy, is this something the source observed or something the source concluded. A provider who can answer that field by field is telling you a great deal about how carefully the product was built.

## The same file, sold under three different names

There is a second finding in that report, about what the same nine companies sell, and it is the one that connects this subject to the law.

[[scene:product-lines]]

One set of underlying records, three shopfronts. The identity check and the marketing list and the people search page are built out of the same material, and what separates them is the purpose the buyer had.

American law works the same way round, and this is where this article stops and hands you to a different one. Two federal statutes decide what may be done with contact information about a person, they turn on where it came from and on what you intend it for rather than on which fields are in the file, and the liability lands on the buyer rather than on the seller. All of that is worked through at length in [the article on skip tracing](/blog/skip-tracing-real-estate-legal-owner-phone-numbers), including the questions to put to any provider in writing, and none of it is repeated here.

What belongs in this article is the narrower half: the same data, relabelled at the point of sale, and a label that is a fact about the transaction rather than about the record.

## Nobody has published an honest decay rate, and we went and looked

Every page selling this quotes a figure for how fast contact data goes bad. Thirty percent a year is the usual one. We did not want to assert that those figures are unsourced, because asserting a reason without checking it is a mistake this project has made before, so this round the trail got followed.

Here is where it goes.

The most prominent recent version of the thirty percent claim is a press release from a company that sells contact data, carried on a newspaper's website under a notice stating that it is "press release content distributed by XPR Media" and that the paper's editorial staff "were not involved in the creation of this content". No sample, no method, no population.

Below that are vendor blog posts. Data quality companies and enrichment providers, each stating a rate, none stating what was measured or on how many records. The most useful thing on any of them is not a statistic: one recommends taking a random sample of a hundred to two hundred of your own oldest contacts and verifying them by hand, which is the correct answer and is the one thing on the page that nobody is charging for.

Below those are the aggregator pages, which cite each other and eventually cite a benchmark attributed to a marketing research publisher whose original study is not linked from any of them.

And the spread is the finding. On the pages we opened, the same claim about the same thing is quoted at thirty percent, at twenty two and a half percent, at twenty to thirty percent, and, for email addresses specifically, at up to seventy. Those are not measurements that disagree with each other. They are a number that has come loose from whatever produced it and is now being cited by people who are citing each other.

So there is no decay rate in this article, none in the calculator, and none on our service page. There is something better, which is the reason a rate cannot be a single number in the first place.

## A rate is a property of the people, not of the data

Contact details do not rot on their own. They stop being true when something happens to a person: a move, a job change, a marriage, a new phone, a business closing. So the speed at which a field goes wrong is the speed at which that thing happens to the people in your database, and different people are not the same.

Which means the useful question was never how fast data decays. It is what sits underneath a particular field, and how often that thing changes for the particular people you hold. One government survey measures exactly that shape, for exactly one field, and the field is employment.

[[scene:tenure]]

[The Bureau of Labor Statistics release for January 2024](https://www.bls.gov/news.release/tenure.nr0.htm) puts the overall figure at "3.9 years", the lowest since 2002. The chart above is Table 1 of the same release, and the spread across it is the whole argument.

Now put both of those people in one database with a work email address each, and run a single percentage across the pair of them. Whatever that percentage is, it is wrong about both of them in opposite directions, and it will be quoted as though it described the database.

Which is why the number worth having is not a benchmark at all. Take two hundred records at random from the part of your database you would really work, and check them by hand. It takes an afternoon, it costs nothing, and what comes out is measured on your own people in your own market at their own ages, which is the only version of this figure anybody can defend.

## What to do when two sources disagree

This is the question the whole subject turns on, so it is worth being concrete about it.

A pass runs. For a given contact, your record says one thing and the response says another. There are four possible behaviours and every build has one of them. Find out which before a pass runs, not afterwards.

The first is that the newest value wins, where newest means the value that arrived most recently rather than the value that most recently became true. A number your client confirmed to you last month gets replaced by a number a provider has held since some date nobody recorded, purely because the query happened today.

It is worth seeing how that behaviour is presented by the software, because it tells you which way the tooling leans. [HubSpot's documentation for importing records](https://knowledge.hubspot.com/import-and-export/import-objects) describes protecting what you already hold as something you switch on. There is an advanced option called Prevent property overwrite, which the page explains as: "if you're updating existing records, prevent the import from overwriting records' existing property values for the row". When it is selected for a property, "the import will update the property for new records and existing records that have never had a value for the property. It won't update the property for existing records that have a value or had a value in the past, even if currently empty."

What matters there is the shape and not the detail. On one major CRM, per property, at import time, keeping your own value is a checkbox. That is one platform and not a survey of the field, and it is exactly why the four choices below are worth settling in writing before a pass runs instead of discovering afterwards which one you got.

The second is that yours wins and the response is discarded. Safe, and it quietly turns enrichment into a fill-the-blanks exercise, which is often exactly what you wanted and should be a decision rather than an accident.

The third is that both are kept, in separate fields, with the outside one clearly marked as a suggestion. This is the one that costs least to be wrong about, and it costs one extra column.

The fourth is a review queue: disagreements go to a short list and a person settles them. That is right when the field matters and the volume is small, and it is worth knowing that it is the same shape as the clerical review step in the published record-linkage model that the CRM sync article covers, which exists for exactly this reason.

Whichever you pick, one habit does more than the choice itself. Write down, on every enriched row, where the value came from and when it was written. Not in a log somewhere. In the record, beside the value, where the person about to dial it can see it. That single column is the difference between "I do not know where that number came from" and a one sentence answer, and it costs nothing on the day the build is done.

[[scene:plate-two]]

## The one law that describes this is about whoever holds the data

There is one place where a legislature has written down what happens when a business is holding something wrong about a person, and it is not a federal statute and it probably does not apply to you. It is worth knowing anyway, because it says whose problem this is.

California's consumer privacy law, at [Civil Code 1798.106](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.106), gives a consumer "the right to request a business that maintains inaccurate personal information about the consumer to correct that inaccurate personal information, taking into account the nature of the personal information and the purposes of the processing". A business receiving such a request "shall use commercially reasonable efforts to correct the inaccurate personal information as directed by the consumer".

Read who that is addressed to. Not the data broker. The business that maintains the information, which in the scenario at the top of this article is you.

Whether it applies to you specifically is a separate question, and the thresholds are published, so it takes a minute rather than a lawyer. The same law defines a covered business at [Civil Code 1798.140](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140) as one doing business in California that also meets one of three: annual gross revenues over twenty five million dollars, or annually buying, selling or sharing the personal information of a hundred thousand or more consumers or households, or deriving half or more of its revenue from selling or sharing personal information. Read those three against your own year and you will know where you stand.

So this is not a compliance obligation for most readers of this page. It is a description of the right shape, written by people who thought hard about it, and it says two things worth adopting whether or not anybody is making you. The duty attaches to whoever holds the record rather than to whoever supplied it. And answering it requires knowing where a value came from, which is the column this article keeps coming back to.

The same FTC report is blunt about how rarely that is possible today. Of the nine companies studied, it found that "only two of the data brokers allow consumers to correct their personal information for marketing purposes". The report's sentence does not make its denominator explicit, so it is quoted rather than drawn as a chart, and the direction of it is not in doubt.

## What New York's law actually covers, and it is not this

People reach for New York's SHIELD Act here, and it is worth saying plainly why it does not cover most of what an enrichment pass adds.

The [New York Attorney General's own description](https://ag.ny.gov/resources/organizations/data-breach-reporting/shield-act) of the law it enforces says the Act requires "any person or business that maintains private information to adopt administrative, technical, and physical safeguards", with no revenue threshold attached, which is a genuinely wide obligation. But "private information" is a defined and narrow term. On the Attorney General's page, it means personal information combined with a Social Security number, a driver's licence number, or an account number with its security code, and the Act extended it to biometric information and to a username or email address together with a password.

A telephone number is not on that list. A mailing address is not on that list. An email address on its own is not on that list.

So the New York statute people mention in this context is about security and breach notification for a specific set of high risk identifiers, and it is mostly not about the fields enrichment appends. That is a checked absence rather than an omission, and it is here because the alternative is a page implying a duty that does not exist.

We could not read the statute text itself. The New York Senate's website refuses programmatic requests, so nothing in this article is asserted from the statute, only from the Attorney General's published summary of it, and that distinction is deliberate.

[[scene:enrich-path]]

[[scene:overwrite-calculator]]

## What it costs, and how long it takes

The largest line on this bill is not ours and never passes through us. A supplier charges for each record it is asked about, so that part of the spend rises directly with how many rows you hand over.

Which makes the first cost decision the one nobody treats as a decision: how many records to run. The default is the whole database, because it is one click. The number worth having instead is the count of rows somebody in your business would actually call this quarter, and producing it is an hour of thinking rather than a purchase. Whatever it comes to is the honest size of the job, and the gap between it and the whole database is money about to be spent making people reachable that nobody was going to reach.

The second thing to settle before signing is whether the charge lands on every record you submit or only on the ones that come back with something. That distinction changes the arithmetic completely, and in an area where not much resolves, the first arrangement can spend a budget and leave you with almost nothing to show for it.

What we would build around that is the smaller half and it is where the value is. Deciding which records qualify. Writing the source and the date onto every enriched row. Making the disagreement behaviour explicit rather than inherited. Putting the flagged rows somewhere a person will look. Every one of those is cheap and dull, and they get skipped because nobody puts them on the list at the beginning.

On time, running a pass is fast. What takes the time is the conversation about the four disagreement behaviours above and about which fields you actually want touched, and that conversation is worth having before the first record moves, because retrofitting provenance onto a database that has already been enriched twice is a genuinely miserable job. If your contact records already carry a source and a date, this is straightforward. If they do not, adding that column is the project, and the enrichment is the easy part bolted on afterwards.

## What it does not do, and should not pretend to

It does not verify a person. What verification establishes, on our own page and on every provider page we have read, is that a number is well formed, is in service and is not a duplicate. Those are useful checks and none of them is the check people assume, which is that this number reaches this person. Our own service page uses the word "verified" and this is the sentence that qualifies it.

It does not tell you how old a value is unless the provider is asked for it and passes it through. Freshness is the single most useful attribute an appended field could carry, and it is worth asking for by name, because a response that does not carry it looks exactly like one that does.

It does not promise a match, and a rate quoted before anybody has seen your list is a rate about somebody else. How much resolves varies with the town, with how thin the county file is behind a given address, and with how recently anybody moved. Two hundred of your own rows, run as a sample, settles the question for your own book in half a day.

It does not make a record legal to contact. Do-not-call registrations and consent rules attach to the call rather than to the data, they are not affected by how the number was obtained, and they are covered in detail in [the article on reactivating an old database](/blog/database-reactivation-old-real-estate-leads) and in the skip tracing article above.

It does not tell you anybody wants to hear from you. A complete record is a reachable record. Interest is a different question, it is not in any file anybody can sell you, and a pass that makes four thousand people reachable has not produced four thousand conversations or any evidence about whether they would be welcome.

And it does not clean up after itself. If a pass writes a value that turns out to be wrong, the wrongness is now yours, sitting in your system of record with your business's authority behind it, and the provider's involvement ended at the response.

[[scene:wasted]]

[[scene:offer]]

## How to find out what your last pass actually did

Twenty minutes, on the database you already have. No tool and no subscription.

1. **Open five contacts you personally remember.** People you have spoken to. Not the first five, and not the ones you have been working this week.

2. **For each one, ask where the phone number came from.** Not whether it is right. Where it came from. If the record cannot tell you, you have already found the finding, and you have found it on the five people you know best.

3. **Look for a date beside any enriched value.** Anything at all: an appended-on date, a source field, a note. If there is nothing, then every value in the database is the same age as every other value, which is to say unknown.

4. **Find a contact you know moved.** Somebody who sold and left the area. Look at what the record says now, and decide whether the record knows they moved or is quietly still describing the person who lived there.

5. **Sort by the phone column and look at the gaps.** Count how many rows are empty. That number is the actual size of the problem enrichment solves, and it is worth holding next to the number you were about to send.

6. **Ring one number that you did not put there yourself.** Not to sell anything. Just to find out who answers. One call tells you more about your own data than any report, and if the answer surprises you, that is the finding.

7. **Ask whoever ran the last pass what the overwrite setting was.** Not what should have happened. What the setting was, per field. If nobody can answer, treat that as an open question rather than as a reassurance.

## Common questions, answered honestly

### What is data enrichment, in plain terms?

It is a pass over contact records you already hold, which sends what you know to an outside provider and writes back what it holds: a missing phone number or email, the property detail behind an address, a merge of two records that turn out to be one person. It is sold as completing your database. What it actually does is add somebody else's assertions to your database, which is a genuinely useful thing and is not the same thing.

### How is enrichment different from skip tracing?

One begins at an address and works towards a stranger. The other begins at somebody already sitting in your database and completes what you hold about them. The suppliers overlap and the technology is the same. What separates them is whether there was ever a relationship, that is the half carrying the legal weight, and it is set out in the [skip tracing article](/blog/skip-tracing-real-estate-legal-owner-phone-numbers) rather than here.

### Will enrichment overwrite the data I already have?

That depends on how the pass is configured, and it is worth establishing rather than assuming. On HubSpot, for instance, not overwriting a value you already hold is a per-property checkbox selected at import time, which tells you which way the tooling leans. Decide it deliberately: fill blanks only, keep both values in separate fields, or send disagreements to a person. Whichever you choose, insist that the previous value, the source and the date are written to the record, because without those there is no way back from a bad pass.

### How accurate is appended contact data?

Nobody can tell you before running your list, and the figures that circulate do not survive being followed, which is worked through above. What you can do is measure it: take two hundred records where you already know the answer, run them, and count how many agree, disagree and come back empty. That takes an afternoon and it is a number about your own market rather than somebody's benchmark.

### How fast does contact data go stale?

There is no published rate worth quoting. The circulating figures range from twenty two to seventy percent for the same claim and trace back to press releases and vendor pages rather than to a study. What is knowable is the mechanism: a field stops being true when something happens to a person, so the rate is a property of the people in your database rather than of the data, and it will be different for a first time buyer in her twenties and a couple downsizing in their sixties.

### Does an enriched list mean I can call it?

No, and the two questions are entirely separate. Whether a record is reachable is a data question. Whether you may contact it is a rules question with dates and registries in it, and the answer does not change because the number was appended rather than volunteered. Both of the neighbouring articles on this site cover that ground properly.

### What should I ask a provider before signing?

Five short questions. Does the charge land on every record submitted or only on the ones that resolve. Does the response carry a date or an age for each value. For each field, is it observed or inferred. If a person tells you never to contact them again, what changes in your system. And will you run two hundred records from my own area before I commit to anything. Written answers to all five tell you what kind of company you are dealing with. A rate card tells you nothing.

### What is the one thing that makes all of this manageable?

A source column and a date column on every contact record, filled in from the day the record is created, whether the value came from a form on your website, a conversation, or a pass. It costs nothing to add before you have data and it is close to impossible to reconstruct afterwards. Every hard question in this article becomes easy once those two columns exist.

## What to do about it

Nothing in this article argues against enrichment. Two thirds of a database with no phone number in it is a real problem, and there is no version of solving it that does not involve buying somebody else's assertions.

What it argues is that the assertion should arrive wearing a label. Where it came from. When. What it landed on. Those three facts turn an appended value from something you have to trust into something you can weigh, and they cost one afternoon of build time to capture and are unrecoverable once a pass has run without them.

This sits beside everything else we build, on [the RealtyLT AI page](/ai#enrich); what actually gets appended and checked is on the [data enrichment page](/services/data-enrichment). If you would rather somebody looked at what your existing records already say about themselves before anything is bought, that is the [AI audit](/services/ai-audit).

A fuller database is easy. A database that can tell you where it got something is the one worth having.

[[scene:funnel]]
`;

export const DOCUMENT_PROCESSING_POST = `The rider came in on a Sunday evening as a photograph. Somebody had put the page on a kitchen table and held a phone over it, so the top edge of the paper is wider than the bottom edge, there is a shadow across the lower third, and the whole thing is very slightly out of focus in one corner.

Two of the printed lines have been struck through and rewritten by hand, and there are initials in the margin beside each change. One of the changes is a date.

You forwarded it. The reader pulled out every date on the page and wrote them where they were supposed to go, and one of them landed on your calendar with a reminder attached. Everybody stopped thinking about it, which is exactly what the system is for.

Three weeks later somebody asks whether that contingency has expired, and it turns out there are two defensible answers, and they are not the same day.

Nothing malfunctioned. The characters were read correctly, the handwriting was read correctly, the date on the calendar is the date on the page. What went wrong is not on the page at all, and that is what this article is about.

[[scene:in-short]]

[[scene:not-the-work]]

## What document processing actually is, and why the reading is the easy half

Three articles on this site sit near this one, and it is worth putting them out of the way first, because most of what people assume this subject is turns out to belong to one of them.

Document processing, described plainly, is turning a page into fields. A purchase agreement, a disclosure, a lease or an addendum goes in, and what comes out is a set of named values: these are the parties, this is the price, these are the dates, this signature block is empty. The output is data rather than a document, which is the point of it, because a date sitting in a field can be put on a calendar and a date sitting in a PDF cannot.

That description makes it sound like one job. It is at least four, they fail differently, and only the first two are what anybody demonstrates.

The first is finding the writing. On a page, ink is just dark pixels, and before anything can be read something has to decide which clumps of dark pixels are words and where each one starts and stops.

The second is reading it: turning those pixels into characters.

The third is deciding what each piece of text is for. This string is a heading, this one is a label, this one is the value that belongs to that label. A form is not a paragraph, and the meaning is carried by the layout as much as by the words.

The fourth does not look like part of the job at all, and it is where this article ends up. A value can be correct, correctly labelled, correctly filed, and still be the wrong answer, because what it counts from is not printed anywhere on the page.

## The original is not a document, it is a photograph of one

Every demonstration of this technology uses a clean, born digital PDF, and on a clean born digital PDF the first two problems barely exist: the text is already text and the software can simply ask for it. That is a real and common case and if all your paperwork is like that, most of what follows is easier for you than it is for other people.

It usually is not like that, and the reason is that real estate paperwork has a long life outside computers before anybody asks software to read it. Four things happen to it on the way, and each one takes something away.

[[scene:unreliable-original]]

[[scene:plate]]

## What was actually measured, on forms that look like yours

There is a published measurement of this, on real scanned forms rather than on clean ones, and it is worth reading carefully because the two halves of it point in opposite directions.

In 2019 three researchers at EPFL and Istanbul Technical University published [FUNSD](https://arxiv.org/abs/1905.13538), a dataset built specifically to test form understanding on bad originals. Their description of it is one sentence: "The dataset comprises 199 real, fully annotated, scanned forms. The documents are noisy and vary widely in appearance."

Where those forms came from matters more than the number 199. They are drawn from a large collection of business documents from the nineteen eighties and nineties which, in the authors' own words, "have a low resolution of around 100 dpi" and "are also of low quality with various types of noise added by successive scanning and printing procedures". So the corpus is not a stress test somebody built by degrading good scans. It is what happens to paperwork when it lives in the world.

There is a detail in how they built it that is worth having. They started from 25,000 images in the form category, and: "We discarded unreadable and similar forms, resulting in 3,200 eligible documents, out of which we randomly sampled 199 to annotate." Two things were thrown out together there, the unreadable and the near duplicates, and the paper does not separate them, so it would be wrong to say that most of the 25,000 could not be read. What can be said is that a research team looking for scanned forms good enough to annotate by hand kept about one in eight of what they had.

[[scene:reading]]

Nothing about that second bar is a failure of reading. It is a failure of finding, and the finding happens first, so everything downstream works from a partial transcript without being told which parts are missing.

Be concrete about what that means on a contract. Suppose the printed clauses are located and read cleanly, and two lines written into a margin are not located at all. What comes out is not a document with two gaps in it. It is a document that looks complete, because those two lines never became text, and a value that never became text cannot be noticed as absent by anything further down the chain.

That is the difference between a file and a photograph, and it is why the first question to ask about any of this is what your originals actually are.

## Finding a word and knowing what it is for are two different problems

The same paper measured two harder things, and they are the half that should change how you buy this.

The authors also measured two harder tasks. One is labelling: given a piece of text on a form, is it a question, an answer, a header or none of those. The other is linking: given an answer, which question does it belong to. That second one is what actually produces a field. "Closing date" is a label and "March 14" is a value, and the only thing that makes them a fact is the line drawn between them.

[[scene:understanding]]

Read the second bar again, and then read the condition the authors attach to both of them: "Note that we test the algorithms by assuming that we know the optimal word grouping, word location, and textual content. In this way, we only assess the specific task."

Both numbers were produced with the reading already done perfectly. The hard part is not the part that looks hard.

It is worth being precise about what that second task is in your own paperwork, because it is the thing you thought you were buying. A label sits somewhere on the page and a value sits somewhere else, and neither is a fact until something draws a line between the two. On a page where the label is three inches from the value, or where one label governs a column of four values, or where a value sits in a box belonging to the addendum rather than to the paragraph above it, that line is a judgement about layout. Layout is the property of a document that survives copying worst, which is why this is the step that degrades first on a photograph.

## A person is not perfect at this either, and somebody published the number

There is a person standing behind every argument about automating paperwork, on both sides of it, and that person never misreads anything. Somebody has measured them.

[DocVQA](https://arxiv.org/abs/2007.00398), published by researchers at IIIT Hyderabad and the Computer Vision Center in Barcelona, is a set of 50,000 questions asked about 12,767 document images, drawn from "6,071 industry documents" dating from as early as 1900 to as recent as 2018, and including "typewritten, printed, handwritten and born-digital text". The questions are the ordinary ones: what is the total, what is the date on this document, who is this letter addressed to.

Then they had people answer them.

[[scene:human-ceiling]]

Now read that first bar against the thing it is really competing with, because there are two candidates and only one of them is honest. The first is a careful reading, done once, by somebody with the file open and nothing else on, which is roughly the condition those volunteers were in. The second is the fourth read of the day, at ten past five, of a page two people have already looked at. Your process runs on the second one.

So the useful question is never whether a document reader is right every time. It is which values it handles better than a tired person, which ones it handles worse, and what it does with the ones it cannot settle. Those are three different questions and only the third is a build decision.

And it means something uncomfortable about the process you have now. Anything that depends on nobody ever misreading a date is already failing at some rate, today, with no software involved at all, and nobody in your business has ever measured that rate either.

## The date is not the deadline

Everything so far has been about getting a value off a page. This is the part where a value that came off the page perfectly turns out to be the wrong answer, and it is the part our own service page did not say enough about.

Take the plainest possible field: a deadline expressed as a number of days. Three business days. A machine reads "three business days" with complete accuracy. To put a date on your calendar it now needs two things that are not written next to those words: what the count starts from, and what a day is.

Neither of those is a trick question, and in the one part of a real estate transaction where the federal government has written the rules down, both have published answers that surprise people.

The mortgage disclosure rules in [Regulation Z at 12 CFR 1026.19](https://www.law.cornell.edu/cfr/text/12/1026.19) run several deadlines through a real estate closing. The lender must "ensure that the consumer receives the disclosures required under paragraph (f)(1)(i) of this section no later than three business days before consummation". For certain transactions the creditor must deliver early estimates "not later than the seventh business day before consummation of the transaction", and if a figure becomes inaccurate, "the consumer must receive the corrected disclosures no later than three business days before consummation".

Those are the lender's obligations rather than yours, and nothing here is advice about how to meet them. They are quoted because they are the clearest published example of the thing this whole topic turns on: a deadline written on a document whose meaning lives somewhere else.

[[scene:pull-quote]]

## The same three words mean two different things in one regulation

Here is the part that is genuinely startling the first time you read it, and it is sitting in the definitions section, [12 CFR 1026.2](https://www.law.cornell.edu/cfr/text/12/1026.2).

"Business day means a day on which the creditor's offices are open to the public for carrying on substantially all of its business functions."

That is the general definition, and it depends on a fact about a particular company's opening hours. Then the same paragraph continues: "However, for purposes of rescission under 1026.15 and 1026.23, and for purposes of 1026.19(a)(1)(ii), 1026.19(a)(2), 1026.19(e)(1)(iii)(B), 1026.19(e)(1)(iv), 1026.19(e)(2)(i)(A), 1026.19(e)(4)(ii), 1026.19(f)(1)(ii), 1026.19(f)(1)(iii), 1026.20(e)(5), 1026.31, and 1026.46(d)(4), the term means all calendar days except Sundays and the legal public holidays specified in 5 U.S.C. 6103(a)".

One phrase, two meanings, and which one applies is decided by a list of paragraph numbers. Under the second definition a Saturday counts, Sunday does not, and the eleven days named in [5 U.S.C. 6103](https://www.law.cornell.edu/uscode/text/5/6103) do not. Under the first, a Saturday probably does not count and a company holiday might not either.

Now put a document reader in front of a page that says "three business days". It can read those words at any accuracy you like. It cannot know which of those two definitions the drafter had in mind, because that information was never on the page. Somebody has to decide, once, in writing, what rule your system applies, and that decision is a piece of your business rather than a setting in a piece of software.

The same section carries a second one of these, and it is the reason for the line held on its own above. Consummation is not closing. It is defined as the moment the buyer becomes contractually obligated on the credit transaction, which is a different event from the day everybody signs the deed and gets the keys, and in some states it falls on a different date. A reader that finds "closing date" on a page and treats it as consummation has made a substitution nobody asked it to make, and it will not tell you it did.

## A wrong date costs more than a missing one

This is the asymmetry that should decide how the whole thing is built.

A missing value is loud. The field is empty, somebody notices, somebody opens the document. It costs a few minutes and it costs them at a moment when they are paying attention.

A wrong value is silent, and it is worse than silent, because it is now wearing your system's authority. It is on the calendar. It has a reminder attached. Everybody downstream treats it as settled, and the specific thing that will not happen is anybody going back to the page, because the reason the system exists is so that nobody has to.

That has a direct consequence for how a document reader should behave, and the incentive runs against it. A reader that returns an answer for every field looks better in a demonstration and is worse in a business. What you want is a reader that abstains, that says nothing rather than guessing, and that puts the abstentions somewhere a person will actually look. Our own service page has said for a while that anything it is not confident about goes to a human rather than being filed quietly, and that is the right design. This article is the argument for why, and the argument is arithmetic rather than caution: a blank costs minutes, a confident wrong date costs a deal.

[[scene:doc-path]]

## What the extracted copy is, and what it is not

One more thing that is worth knowing before you build any of this, because it decides what you have to keep.

American law is comfortable with electronic records. [15 U.S.C. 7001](https://www.law.cornell.edu/uscode/text/15/7001), the ESIGN Act, opens by saying that "a signature, contract, or other record relating to such transaction may not be denied legal effect, validity, or enforceability solely because it is in electronic form". That settles the old anxiety about whether a digitally signed contract counts, and it is not the half that decides what you have to keep.

The half worth knowing is the retention rule at 7001(d). Where a law requires that a contract be retained, the requirement is met by keeping an electronic record which "accurately reflects the information set forth in the contract or other record" and which "remains accessible to all persons who are entitled to access by statute, regulation, or rule of law, for the period required by such statute, regulation, or rule of law, in a form that is capable of being accurately reproduced for later reference, whether by transmission, printing, or otherwise".

Read what that asks for. Not the facts from the contract. The information as set forth in it, reproducible later.

A row of extracted fields is not that. It is a reading of the document, made by a particular system, on a particular day, and it drops everything the reader did not think to look for: the strike through, the initials in the margin, the handwritten note at the bottom that changes what a printed clause means. Extraction is a convenience layer over a document that has to keep existing, and any build that treats the fields as the record has quietly thrown away the thing the fields were about.

The practical version of this is dull and cheap. Keep the original, keep it findable, and store with every extracted value which document it came from and which page. That last habit costs nothing at build time and is the difference between a disagreement that takes ninety seconds to settle and one that takes an afternoon.

[[scene:check-calculator]]

[[scene:plate-two]]

## What it costs, and how long it takes

No price is quoted here, and the reason is that the software is the smallest of the three things you would be paying for.

The first is the reading itself, which is charged by the page by whichever engine sits underneath, and it is the cheap part and the part that scales predictably. The second is the setup, and it is priced per DOCUMENT TYPE rather than per document: a purchase agreement, a disclosure form, a lease and an addendum are four different sets of expectations about where things are and what they mean, and adding the fourth one is not much cheaper than adding the first. The third does not look like a cost at all, which is why it is the one that gets left out, and it is deciding what the values mean. What a deadline counts from. Which calendar rule applies. Which of two contradictory pages wins. Those are conversations rather than configuration, they are the ones that decide whether the output is trustworthy, and they take longer than the build.

Two things move the bill more than anything else. One is whether your originals are files or photographs of paper, which is worth finding out before anybody quotes you rather than after. The other is how many document types you genuinely need, as opposed to how many you can name, and it is worth writing the two lists down separately before anybody quotes.

On time, a single document type with clean originals and one place for the output to go is a short piece of work. What extends it has nothing to do with reading or with page counts. It is discovering, in week two, that there is nowhere for the output to land: no field in the CRM, no calendar anybody shares, no agreed owner for the exceptions. If those already exist, this moves quickly. If they do not, what you have bought is a systems project wearing a document reader's clothes, and that is worth knowing on day one rather than in week two.

## What it does not do, and should not pretend to

It does not guarantee a date, and no honest version of this ever will. Misreading a line on a scanned rider is the failure mode of the whole category, which is why anything the system is not confident about should be flagged for a person rather than filed silently. That is a design choice you should confirm is being made, not something you get automatically.

It does not know what a value means. It reads what the page says. What the page says is a number of days, and turning that into a date on a calendar requires a rule about counting that lives in your business and not in the document. If nobody has written that rule down, the software has invented one on your behalf.

It does not replace the document. The extracted fields are a reading, the original is the record, and the retention rule quoted above asks for something that accurately reflects the contract rather than a summary of it. Any build that deletes the source once the fields are populated has destroyed the only thing that can settle an argument.

It does not give a legal opinion, and it should not. It surfaces what a document says and what is missing from it, so somebody qualified can act on that. The distance between "the page says thirty days" and "your contingency expires on the fourteenth" contains at least one legal judgement and it is not the software's to make.

It does not fix a document. A missing signature is found, not solved. Chasing it is a person's work. The whole benefit is that the gap is found on the day the document arrives instead of the week it matters, which is a narrower promise than this category normally makes and is the one that survives a real transaction.

And it does not measure its own reliability in any way you can bank. Every one of these tools will show you a confidence score. That number was produced by a model about its own output, on some distribution of documents, and it is not a probability that the value is correct on your paperwork. Ask what it was measured on and what threshold the build uses. A vendor who can answer that in two sentences is telling you something good about themselves.

[[scene:wasted]]

[[scene:offer]]

## How to test a document reader on ten of your own files

This takes an afternoon, needs no subscription, and will tell you more than any demonstration.

1. **Pull ten real files, not ten good ones.** Include the two that were a mess. Include the one where the addendum arrived as a photograph. A reader is only as useful as its behaviour on your worst week, and your worst week is not going to be in anybody's sample pack.

2. **Write down the five values you actually want.** Before you look at any output. Five, by name. This is harder than it sounds and it is the most valuable ten minutes of the exercise, because at least one of the five will turn out not to be printed on the page at all.

3. **For each of the five, write where it comes from.** A fixed box on a standard form is one thing. A number written into a blank is another. A value that has to be derived from a date plus a counting rule is a third, and that third kind is where every expensive mistake in this subject lives.

4. **Run the ten and score by value, not by document.** Fifty values. Mark each one right, wrong or missing. Keep wrong and missing in separate columns, because they are different failures and only one of them is dangerous.

5. **Count the wrongs that would have been believed.** Of the ones it got wrong, how many looked plausible enough that nobody would have questioned them. That is the real error rate for your purposes. It is a subset of the raw wrong count, so it is smaller, and whether it comes out at zero on fifty values is the thing you are actually measuring.

6. **Take the ugliest page and make it uglier.** Photograph the printout at an angle, in poor light. Run it again. What you are looking for is not whether the score drops, because it will. You are looking at what the system does when it drops: does it go quiet, or does it keep answering.

7. **Ask what happens to a low confidence value.** Where does it go, who sees it, and what does the queue look like on a Friday. If the answer is that it gets written anyway with a flag, you have learned the most important thing about the build, and you have learned it before it is running your calendar.

## Common questions, answered honestly

### What is document processing in real estate, in plain terms?

It is software that reads transaction paperwork and turns it into fields. A contract, disclosure, lease or addendum goes in, and the parties, prices, dates and missing signatures come out as structured data that can be written to a CRM, a transaction folder and a calendar, rather than staying inside a PDF that somebody has to open. The reading is the visible half. The half that decides whether it is worth having is what happens to the values it is not sure about.

### Can AI read a scanned contract, or a photograph of one?

Usually yes for the printed text, often yes for handwriting, and the accuracy depends far more on the page than on the software. The published measurement on real scanned forms above is the honest picture: on documents at around a hundred dots per inch with real scanning noise, a commercial engine recovered the characters nearly exactly when it was told where the words were, and lost about a quarter of them when it had to find them itself. A born digital PDF is a much easier case than either, because the text is already text.

### What happens when it gets something wrong?

That depends entirely on how it was built, and it is the question to ask first. The behaviour you want is abstention: a value the system is not confident about is left blank and put in front of a person, rather than written with a flag that nobody reads. A blank field is noticed. A wrong date that looks right is not, and it inherits the authority of your calendar, which is what makes it the expensive failure rather than the annoying one.

### How is this different from workflow automation?

[Workflow automation](/blog/workflow-automation-real-estate-business) is about steps of work a person used to do by hand, and its argument is what an interruption costs. This is about one value on one page and whether the claim made about it is true. The same engineers build both, using much the same parts, and they solve different problems. A document reader with nowhere to send its output is a common and expensive way of finding out that you needed the other one first.

### Does it replace a transaction coordinator?

No, and the reason is in the section above about what a date means. It removes the re-keying and it surfaces the deadlines and the gaps on the day a document arrives. What it does not do is decide what a deadline counts from, chase a missing signature, or notice that the other side has gone quiet. The mechanical part of that job is what this touches. The part that is judgement, chasing and relationship is not.

### Is the extracted data the legal record?

No. The retention rule in the ESIGN Act asks for a record that accurately reflects the information set forth in the contract and can be accurately reproduced later, and a row of fields is a reading of the document rather than the document. Keep the original, keep it findable, and store the source document and page number alongside every extracted value. That last part is a five minute decision at build time and it is what makes a disagreement quick to settle.

### Can it read handwriting?

Often, and the honest answer has a shape to it. Printed and typed text is the reliable case. Neat handwriting in a box designed for it is usually fine. What is genuinely hard is exactly what matters most in real estate paperwork: a figure written over a struck through one, a date altered in a margin, initials that are not meant to be legible even to a person. Those are the marks that carry the most meaning and the least information, so they are the ones a build should be designed to flag rather than to guess at.

### What should I ask a vendor before I buy one?

Five short questions, all with short answers. What does the confidence score mean and what was it measured on. What does the system do when it falls below the threshold, and where does that value go. Does it store which document and which page each value came from. How many document types are included and what does adding one cost. And what happens on a photograph of a page rather than a PDF. Somebody who answers all five in plain sentences is worth taking seriously. Somebody who offers to show you a demonstration instead has answered a sixth question you did not ask.

## What to do about it

There is one piece of homework under all of this and it is not a software decision.

Somewhere in your business there is a set of counting rules. Which day a period starts on. Whether Saturday counts. What happens when a deadline lands on a holiday. Which of two contradictory pages wins. Those rules are what turn an extracted value into a deadline, and the test of whether they exist is simple: can you point at where they are written down. If the answer is that a particular person knows, you cannot automate this and you also cannot train anybody into it, and those are the same problem wearing different clothes.

Writing them down is free, it takes an afternoon, and it is worth doing whether or not you ever buy any of this.

Where this sits among everything else we build is on [the RealtyLT AI page](/ai#docs); the fields it pulls and the places it writes them are on the [document processing page](/services/document-processing). If you would rather have somebody go through one real file with you and mark up which values are printed, which are handwritten and which are derived, that is the [AI audit](/services/ai-audit).

The paperwork is not going to get cleaner. The rules about what its dates mean are the part you can fix this week.

[[scene:funnel]]
`;

export const MARKETING_AUTOMATION_POST = `The market note went out on a Tuesday morning to fourteen hundred people, and it was a decent piece of work. Median price in three towns, what had actually closed against what had been asked, and two sentences at the bottom in your own voice about the inspection that had fallen through on Elm.

Nobody complained. Five people pressed one button, which is a different thing from complaining, because pressing it takes under a second and produces no conversation and you never hear about it.

The following month's note went to the same fourteen hundred people. Your software reported that it had been sent to fourteen hundred people, because that is what your software can see. Some number smaller than fourteen hundred received it, and a smaller number than that ever saw it in the place where a person actually reads things.

You did not find out. There is nothing to find out with. The gap between what you sent and what was read is the subject of this article, and almost nothing written about marketing automation is about it at all.

[[scene:in-short]]

[[scene:not-the-others]]

## What marketing automation actually is, once you take the busywork out of it

Three articles on this site are next door to this one and between them they have taken most of the obvious ground, which is useful, because what is left is the part that actually decides whether any of this works.

Marketing automation, described plainly, is a standing instruction about people you are not currently talking to. Not a task that runs itself, and not a message you decide to send. It is a rule you wrote once about who should hear from you, what they should hear, and when, which then runs for years without anybody looking at it.

That is worth saying slowly because it changes what the risks are. A workflow that copies a name into a second system either works or does not, and you find out on the day. A rule about who deserves a message from you keeps running while the people it describes change, and you find out never.

[[scene:four-decisions]]

The fourth card is the whole article. The first three are decisions you make; the fourth is a decision made about you, on the basis of the first three, by an organisation that will not tell you the result.

## The law that governs your email does not require permission

Start with the legal position, because most people have it backwards and the correction is genuinely useful.

Almost everybody assumes American email marketing law works like a consent regime: you may not email somebody unless they agreed. That is the European position and it is not the American one. The [CAN-SPAM Act at 15 U.S.C. 7704](https://www.law.cornell.edu/uscode/text/15/7704) sets conditions on the message rather than on the relationship, and there is no clause anywhere in it requiring prior permission to send a commercial message.

What it does require is worth knowing precisely, because three of the four requirements are things a normal marketing tool does not do for you automatically.

The message must contain "a functioning return electronic mail address or other Internet-based mechanism, clearly and conspicuously displayed" that a recipient can use to ask not to receive future messages, and that mechanism must remain "capable of receiving such messages or communications for no less than 30 days after the transmission of the original message". So an unsubscribe link that dies when a campaign is archived is not a technicality, it is the thing the statute names.

Once somebody uses it, [section 7704(a)(4)](https://www.law.cornell.edu/uscode/text/15/7704) gives you a deadline: it becomes unlawful for the sender to send them a further commercial message in the scope of that request "more than 10 business days after the receipt of such request". Ten business days is roughly a fortnight, and it is generous by the standards of anything else in this area, which is exactly why people trip over it. A fortnight is long enough for a sequence somebody is already inside to fire once more.

And [section 7704(a)(5)](https://www.law.cornell.edu/uscode/text/15/7704) requires three things in the message itself: "clear and conspicuous identification that the message is an advertisement or solicitation", clear notice of the opportunity to decline further messages, and "a valid physical postal address of the sender". A real street address, in the footer, of a real place.

There is a rule underneath the statute that is more practical than the statute, and it is the one to check your own tooling against. Under [16 CFR 316.5](https://www.law.cornell.edu/cfr/text/16/316.5), neither a sender nor anybody acting for them "may require that any recipient pay any fee, provide any information other than the recipient's electronic mail address and opt-out preferences, or take any other steps except sending a reply electronic mail message or visiting a single Internet Web page" in order to opt out or to have that opt out honoured.

Read that against the last preference centre you were sent to. A single web page. No login. No survey about why you are leaving. No account.

## Whether your market note is an advertisement is decided by its subject line

There is one more piece of the rule that matters specifically to the way real estate agents write, and it is not the part anybody quotes.

The obligations above attach to a "commercial electronic mail message", and the natural instinct is to think a market update is not one. It contains data. It is useful. It is not selling anything. But the FTC's rule at [16 CFR 316.3](https://www.law.cornell.edu/cfr/text/16/316.3) sets out how the primary purpose of a mixed message is decided, and the test is not what you intended.

Where a message carries both promotional content and other content, the primary purpose is deemed commercial if "a recipient reasonably interpreting the subject line of the electronic mail message would likely conclude that the message contains the commercial advertisement or promotion of a commercial product or service", or if the transactional or relationship content does not appear "in whole or in substantial part, at the beginning of the body of the message".

The subject line. A stranger's reading of it. That is the test.

So a genuinely useful market note with a subject line about the market is one thing, and the same note with a subject line about booking a valuation is another, and the difference is decided by somebody who has never met you. The practical upshot is simple and it is not a burden: put the physical address and the unsubscribe in everything, and stop trying to work out which of your emails count.

[[scene:plate]]

## The companies that actually decide whether your mail arrives

Now the part that actually governs your business, and it is not a law at all.

Between your sending tool and the person you are writing to sits a mailbox provider. Two of them, Google and Yahoo, publish the rules they apply to incoming mail in plain English on a public page, which is more than most parties to your business do. They have no agreement with you, you are not their customer, and there is no appeal. The proportion of your own list sitting behind those two is a thing you can count in an afternoon, and it is worth counting before you decide how much of this applies to you.

You have no way to appeal, no support line, and no notification. The whole relationship is one way, it is governed by a document on a help site, and the document is not long.

[[scene:email-path]]

## The requirement everybody files under bulk sending, and where it actually sits

Google's page for [email sender guidelines](https://support.google.com/a/answer/81126) splits into two lists, and the split is the single most misreported thing in this entire subject. There is a section headed "Requirements for all senders", and a separate one for senders of "5,000 or more messages per day".

The whole thing is widely referred to as the bulk sender requirements, and if that is the phrase you have heard then the natural conclusion is that a small business is exempt from all of it. Go and look at which list the important items are actually in. Under "Requirements for all senders": set up SPF or DKIM authentication for your sending domains, ensure valid forward and reverse DNS records, use a TLS connection, format messages according to RFC 5322, and "keep spam rates reported in Postmaster Tools below 0.3%".

The 0.3 percent is in the all senders list. A one person brokerage sending twice a month is inside it.

The larger list adds the things that genuinely are about volume: SPF and DKIM together rather than either, a published DMARC policy, alignment between the domain in your From header and the authenticated domain, and one-click unsubscribe. Yahoo's [sender best practices](https://senders.yahooinc.com/best-practices/) states the same requirements in its own words, with two details Google's page does not spell out: "honor unsubscribes within 2 days", and an unsubscribe process that is obvious, visible and "doesn't require users to log in".

[[scene:deadlines]]

The regulator is not the binding constraint here and it has not been for some time. One more line from Google's own page is worth sitting with, and notice who is giving it: not a party whose revenue rises with the size of your list. "Consider unsubscribing recipients who don't open or read your messages."

## What SPF, DKIM and DMARC assert, in their own words

Those three acronyms are sold as a deliverability package, and every provider will offer to set them up for you, which is worth paying for. What is worth understanding is what each one actually claims, because their own specifications are unusually clear about it and the clarity is not flattering to the way they are marketed.

SPF is [RFC 7208](https://www.rfc-editor.org/rfc/rfc7208.txt), and its abstract says what it is for: existing protocols "place no restriction on what a sending host can use as the MAIL FROM of a message", and SPF is the mechanism by which a domain owner "can explicitly authorize the hosts that are allowed to use their domain names, and a receiving host can check such authorization". It authorises machines. It says nothing about the message.

DKIM is [RFC 6376](https://www.rfc-editor.org/rfc/rfc6376.txt), and it "permits a person, role, or organization that owns the signing domain to claim some responsibility for a message by associating the domain with the message". Claim responsibility. Not vouch for, not certify, not recommend. It is a signature, and a signature on a bad letter is still a signature.

DMARC is [RFC 7489](https://www.rfc-editor.org/rfc/rfc7489.txt), which ties the two together and tells a receiver what to do when neither passes. Its abstract contains one sentence that ought to be printed on every deliverability invoice ever issued.

[[scene:pull-quote]]

That is the specification saying, in its own summary, that doing all of this correctly buys you nothing in the way of preferential treatment. What it buys is the absence of a penalty, and the ability of a receiver to tell the difference between you and somebody forging your domain.

Which means all three of these are necessary and none of them is the work. They establish who is speaking. Whether what you said was wanted is a completely separate judgement, made afterwards, on evidence you supply every time you send.

## What one-click unsubscribe actually is, and why it protects you

One-click unsubscribe is the thing in the bulk sender list that sounds like a concession to the recipient, and it is worth understanding because it is not one. It is the mechanism that protects your reputation from the people who want to leave.

It has its own specification, [RFC 8058](https://www.rfc-editor.org/rfc/rfc8058.txt), and the reasoning is written down in the introduction rather than left to be inferred. The problem it solves is technical: anti-spam software often fetches every link in a message's headers automatically, so a plain unsubscribe link in a header could be triggered by a machine rather than a person. Senders responded by putting a confirmation page behind it, "and that makes the unsubscription process more complex than a single click".

Then the specification explains why that mattered, and this is the sentence to take away:

> Operators of broadcast marketing lists tend to be primarily concerned about deliverability of their mail... Hence, the mailers want to make it as easy as possible for recipients to unsubscribe; if an unsubscription process is too difficult, the recipient's alternative is to report mail from the sender as junk until the mail no longer arrives.

That is an internet standards document stating the business case for a frictionless exit, on the sender's behalf. Every extra step between somebody deciding to leave and being gone is a step during which their alternative is the button that costs you three tenths of a percent.

There is one detail with a practical consequence. Section 4 of the same document requires that the message carry a valid DKIM signature covering the unsubscribe headers, and says that without it "the mail receiver SHOULD NOT offer a one-click unsubscribe for that message". So the authentication work in the previous section is not a separate project from the unsubscribe work. Get the signature wrong and the safest exit route is quietly not offered to your recipients at all.

## Three tenths of one percent, and why you cannot work out your own

Here is the number, and here is the reason you cannot check yourself against it.

Both providers publish the same ceiling. Yahoo puts it as a heading: "Keep your spam rate below 0.3%". Google puts it in the all senders list. On a list of a thousand people that is three complaints. Not three unsubscribes, which are a healthy sign and cost you nothing. Three people pressing the button that says this should not be here.

[[scene:complaint-calculator]]

Now the honest part, and it is the reason the calculator above computes a ceiling rather than a rate.

Yahoo states how the figure is derived: "Spam rate is calculated in our system based on mail delivered to the inbox, keep this in mind when referencing." Read that carefully. The denominator is not what you sent. It is what they delivered to an inbox. Mail that was rejected or filtered before arriving is not in the bottom of that fraction.

That has an uncomfortable consequence. As your reputation falls, more of your mail is filtered, which shrinks the denominator, which raises the rate computed from the complaints you still receive. The measurement moves against you at exactly the moment you would want it to be stable, and there is no version of the arithmetic you can do at your own end that reproduces it.

Google publishes yours to you through Postmaster Tools, which is free and takes about ten minutes to set up if you control your sending domain's DNS. That is the most concretely useful thing in this article. It is also, for a sender without an enterprise deliverability contract, the only measurement of their own reputation available to them anywhere, which makes it worth ten minutes whatever else you take from this.

## What an open actually measures

The other half of the reporting problem is the number everybody does look at.

An open is not an event. Nobody tells your software that a message was read. What happens is that the message contains a small image hosted on the sender's server, and if the recipient's mail client fetches that image, the fetch is recorded and reported to you as an open. That mechanism has two well known failure modes in opposite directions: clients that block remote images never register an open for a message somebody read carefully, and clients that fetch images automatically register one for a message somebody deleted from the preview pane.

That much is widely understood. What is less widely understood is what else is in there, and there is a measurement of it.

[[scene:tracking]]

Read the chart with the note under it, because the authors are careful about what they are and are not claiming. What survives the caveats is the mechanism rather than the rate. A commercial email is a page, and that page loads resources from other companies. How many of those a sender put there deliberately is exactly what the researchers could not resolve, and they listed it as an open question at the end of their own paper: when a sender sets up a campaign with a mailing list manager, is the tracking disclosed to the sender at all.

Be careful about what that does and does not license you to say. The same paper reports that the majority of the address leaks it found, 62 percent by its own heuristics, were intentional on the sender's part, so this is not a story in which senders are uniformly innocent. What it is is a strong argument for finding out which case you are in, and that takes ten minutes rather than a project. Send yourself a campaign, open it in a browser with the developer tools showing, and read the list of domains the message contacts. It is your list, going to those companies, with your name on it, and right now you probably do not know whether it is three or thirty.

[[scene:plate-two]]

## Why the second campaign is harder than the first

There is a mechanism running underneath all of this that explains why people's experience of marketing automation gets worse rather than better, and it is not fatigue and it is not the copy going stale.

Everything in the sections above compounds in one direction. The judgement a mailbox provider makes about your next message is formed from how people reacted to your last one. So the first send to a list that has never heard from you is the easiest one you will ever do, and every send after it is graded against a record you are writing as you go.

Three consequences follow, and none of them are obvious from inside a dashboard.

The first is that mistakes are paid for later and somewhere else. A badly aimed send in March does not cost you March. It costs you a fraction of the delivery of the April message, to the people who were pleased to hear from you, and nothing in your reporting will connect the two events.

The second is that adding people to a list is not free even when they never respond. Every address that did not want the message is a source of the evidence that grades you, and the ones who never open anything are the ones most likely to eventually press the wrong button.

The third is the one that changes behaviour, and it is why the close of this article is what it is. The cheapest lever available to you is not better writing, a better subject line or a better tool. It is a shorter list, because a shorter list of people who want the message improves the one input you actually control, and it improves it on every future send rather than on this one.

## What it costs and how long it takes

There is no price on this page, and the reason is that the expensive part of this one is not software at all.

Three things are being paid for. The sending platform is a subscription priced per contact by whoever you use, and it is the smallest number in the project by a distance. Then the configuration: audiences, triggers, delays, suppression rules, and the joins to wherever your contact data actually lives. Then the item nobody quotes, which is getting your sending domain into a state where the three records above are correct and the address in your From line is aligned with them.

That third part is where the time goes when it goes badly. If your domain's DNS is somewhere you control and nobody has set up anything unusual, it is an afternoon. If your mail has historically gone out from three different tools under two different subdomains configured by people who have left, it becomes an archaeology project, and the honest sequencing is to finish it before writing a single campaign rather than after.

The other real cost is a person. Audiences rot, and they rot silently, so somebody has to own the rules and look at them on a schedule. That is not a big job and it is nobody's job by default, which is how a segment defined once outlives everybody's memory of what it was for.

Before spending anything, run the audit below. It is free, it takes an afternoon, and it settles the only question that decides the shape of the project, which is whether your domain is already in good order or has been quietly accumulating configuration for six years.

## What it does not do, and should not pretend to

It does not create demand. Every mechanism described here assumes somebody who already has a reason to hear from you. A cadence does not turn a person who is not moving into a person who is, and pointing one at people who never asked is a different activity with a different risk profile.

It does not get your mail delivered. Authentication removes a reason to reject you. Delivery is a judgement made by somebody else on the basis of how the people you sent to reacted last time, and the only lever you have on it is who you send to and how often.

It does not tell you whether anybody read anything. Opens are a proxy with known failure modes in both directions and clicks are a proxy for interest in one link. Neither is a measurement of attention, and a dashboard built out of them can look healthy while the mail is being filtered.

It does not fix a message that should not be sent. Behaviour triggers change when something arrives, not whether it should. A poorly judged email delivered at the perfect moment is a poorly judged email that arrives faster, and relevance in the timing does not buy forgiveness for the content.

It does not survive being aimed at everybody. This is the limit that costs the most and the one people resist, because a bigger list looks like a bigger asset. Every send to somebody who did not want it is evidence handed to a filtering system, it is scored against your domain, and the damage lands on the next message you send to the people who did want it.

[[scene:wasted]]

[[scene:offer]]

## How to audit your own sending in an afternoon

Nothing here needs a consultant and none of it needs access to anything you do not already have.

1. **Find out what your domain publishes about itself.** Your SPF, DKIM and DMARC records are public DNS entries and anybody can read them, including you. If nobody in your business knows whether they exist, that is the finding, and it is the one to fix first because everything else depends on it.

2. **Check the From line against them.** Both providers require the domain in your From header to be aligned with the domain that authenticated the message. If your mail says it is from you but is signed by your mailing tool's own domain, you are failing a published requirement that you can see.

3. **Set up Google Postmaster Tools.** It is free, it requires a DNS record, and it will show you the one number in this article you cannot otherwise obtain, which is your own spam rate as Google computes it.

4. **Send yourself a campaign and try to unsubscribe from it.** Time it. Count the pages. If it asks you to log in, asks you why, or takes more than one page, it does not meet the rule at 16 CFR 316.5 and it is also quietly converting people who would have left politely into people who press the other button.

5. **Open the same message with developer tools on.** Look at the list of domains it contacts. Decide whether you are comfortable with it. There is no right answer here and there is definitely a wrong one, which is not knowing.

6. **Open your largest audience and scroll to the bottom of it.** Read the last twenty names. If you recognise somebody who bought through you, somebody who told you they were staying put, or somebody who is now a competitor, your audience rule has no exit condition and it has not had one for a while.

7. **Count your sends over the last ninety days.** Not campaigns. Messages that left the building, including every automated one. Count it before you guess it. It is the input with the largest effect on everything above, and it is the one people carry the vaguest idea of.

## Common questions, answered honestly

### What is real estate marketing automation, in plain terms?

It is a standing instruction about people you are not currently talking to: a rule, written once, about who hears from you, what they hear and when. The software part is a scheduler and a mail sender. The part that decides whether it works is the audience rule, because that rule keeps running for years against a database of people whose circumstances keep changing.

### Do I need permission to email somebody in the United States?

Not under the federal statute, which is the thing that surprises people. CAN-SPAM regulates the message: it must identify itself as an advertisement, carry a real postal address, and offer a working exit that survives at least thirty days, with the opt out honoured within ten business days. Permission is required in practice for a different reason. Mailbox providers judge you on how the people you email react, and mail to people who did not ask is what generates the reactions that get you filtered.

### How is this different from workflow automation?

Workflow automation is about work: a step somebody used to do by hand now happening on its own, and you find out on the day if it breaks. This is about judgement at scale: who deserves a message, what it says, when it lands. They are usually built with the same tools and they fail in completely different ways, which is why [the workflow article](/blog/workflow-automation-real-estate-business) is a separate read rather than a section of this one.

### Is this the same as reactivating an old database?

No, and the difference is the consent question. Reactivating a list of people who contacted you years ago and went quiet raises questions about permission that has gone stale, and those rules have dates in them. [That article](/blog/database-reactivation-old-real-estate-leads) covers them properly. This one assumes current permission and asks a harder question about what you do with it week after week.

### Will automated marketing annoy my leads?

Some of them, and the number that matters is much smaller than the number who are annoyed. Both major providers publish the same ceiling of three tenths of one percent for how often people may report you as spam, which on a list of a thousand is three people. Unsubscribes are not the problem and are a sign of a healthy list. The button next to it is the problem, and irrelevance is what makes people press it.

### Why did my open rate drop?

Possibly because fewer people opened it, and possibly for two reasons that have nothing to do with your writing. An open is recorded when a mail client fetches a tracking image, so clients that block or proxy remote images distort the count in both directions and the mix of clients on your list changes over time. And separately, if more of your mail is being filtered, fewer people are being given the chance to open it at all. Your spam rate in Postmaster Tools is a better health signal than your open rate, and unlike the open rate it is measured by the party whose opinion decides whether your mail arrives.

### How often should I send?

There is no published number for this that is worth quoting, and any article that gives you one has made it up. What is defensible is the direction: every send is evidence handed to a filtering system, so the cost of one more message is not zero even when nobody replies. Send to fewer people more carefully and the frequency question mostly answers itself.

### What is the one thing to fix first?

Whatever your sending domain currently publishes about itself. Not the copy, not the cadence, not the segments. If your authentication is wrong or your From line is not aligned with it, you are failing a requirement that both major providers have published in plain English, and every improvement you make above that layer is being applied to mail that may not arrive.

## What to do about it

The uncomfortable idea in this article is that the most effective thing available to you is to send less.

That runs against how this category is sold, because a platform priced per contact has no reason to suggest a smaller list, and a dashboard built on sends and opens will always reward more of both. But the mechanism is not in dispute and it is published by the people who run it. Your ability to reach the people who want to hear from you is a function of how the people who did not want to hear from you reacted. There is no other input you control.

[[scene:funnel]]
`;

export const SKIP_TRACING_POST = `The list arrived on a Monday and it was a good one. Three hundred and twelve properties in a single town, every one of them owned by somebody who does not live there, and for a little over half of them a mobile phone number sitting in the next column along.

You worked down it the way anybody would. No answer. No answer. A voicemail. A man who was perfectly pleasant and said no. Then a woman picked up on the fourth ring, listened to the first two sentences, and asked a question in the middle of an ordinary reply.

"Can I ask where you got this number?"

You did not know. Not in the sense of not remembering, in the sense that there was nobody in the chain you could have asked. It came off the list. The list came out of a tool. The tool got it from somewhere. You said something about public records, which was probably half true, and she thanked you and hung up, and the call had been over for some time before the phone went down.

That question is the subject of this article. Not because it is awkward, although it is. Because it is the same question two federal statutes ask, and they ask it of you rather than of the tool.

[[scene:in-short]]

[[scene:where-from]]

## What skip tracing is, and why it is a chain rather than a lookup

Skip tracing is old and it has a plain meaning. It is the work of finding somebody who cannot be reached at the address you have for them. The name comes from debt collection, where the person had skipped, and the tracer's job was to find where they had gone. In real estate it does something narrower and less dramatic: you have a property, you want to speak to whoever owns it, and the public record gives you a name and a mailing address that may be years out of date and almost never gives you a telephone number.

The modern version is sold as a lookup. You put an address in and a name, a phone number and an email address come out, and the whole thing takes under a second, which makes it feel like consulting a directory. It is not a directory. Underneath, it is a chain of joins between files that were each assembled for their own reasons: a deed office, a credit bureau's identity records, a telephone carrier's assignments, an aggregator that bought some of them and licensed the rest.

Two things follow from that shape, and both of them matter more than the accuracy question everybody asks first.

The first is that the answer is a guess with a confidence attached, and the confidence is invisible. Every join in that chain is a decision about whether two records describe the same person, and those decisions are made by a system that has never met either of them. We have written about the arithmetic of that decision at length in [the article on two way CRM sync](/blog/crm-sync-real-estate-duplicate-contact-records), because it is the same problem, and the thing worth carrying over here is that a system tuned to return an answer for as many rows as possible is tuned to merge more aggressively, and merging more aggressively means more of the answers are the wrong person.

The second is that every link in that chain is a place where somebody, at some point, had to have a reason to release the information. The law that governs that is not the law everybody in this trade talks about. It is not about the call at all. It is about the acquisition.

## The record is not stale because anybody was careless

Before the law, the reason the trade exists, because it is worth being precise about what is actually broken.

The county knows who owns the house because somebody recorded a deed. That record is durable and it is nobody's job to keep it current beyond ownership: it tells you who holds title, and if the owner moved out of state years ago the roll may still carry the mailing address they gave at closing. Nothing about that is a failure. It is a record of a transaction, not a record of a person.

Meanwhile the person moved.

[[scene:movers]]

The chart is the finding, and it is the first bar rather than the total. Most people who change address do not go far. They stay in the same county, which produces the hardest version of this problem: the record is wrong, the person is still local, and there are other people in the same county with the same surname. Think about what that does to a matching system. The candidate and the target now agree on surname, on county and on a good deal else, which is a great deal of agreement without any of it being evidence that they are the same person.

There is a second thing in that chart, and it is in the note under it. A move breaks an address. It does not automatically break a phone number, and the reason is worth stating carefully because the usual explanation is wrong.

People say numbers survive a move because numbers are portable. That is not what portability means. The regulatory definition at [47 CFR 52.21(m)](https://www.law.cornell.edu/cfr/text/47/52.21) is that number portability is "the ability of users of telecommunications services to retain, at the same location, existing telecommunications numbers without impairment of quality, reliability, or convenience when switching from one telecommunications carrier to another". At the same location. Portability is about changing carrier, not about changing address.

The actual reason is simpler and it is a fact about mobile service rather than about the rules: a mobile number was never attached to a building in the first place, so moving out of one does not disturb it. Which means the mailing address on the tax roll and the phone number in the enrichment file go wrong for completely different reasons, at completely different rates, and a provider quoting you one accuracy figure covering both is quoting a number that does not describe anything.

[[scene:plate]]

## Where the number came from decides what you may do with it

Here is the reframe that reorganises the whole subject, and it is why the legality question everybody asks has the wrong shape.

The question usually gets put as "is skip tracing legal", and the answer that comes back is usually "yes, it uses public records". That was the answer on our own service page until this article was researched, and both halves of the exchange are doing something unhelpful. Skip tracing is not one act, so it does not have one legality. It is an acquisition followed by a use, and American law treats those as separate questions with separate rules and separate people liable.

The acquisition is governed by rules about where the underlying information came from and what purpose it was released under. The use is governed by rules about consent and about calling. Almost everything written for real estate agents about this is about the second half, and almost nothing is about the first, which is unfortunate, because the first half is where the liquidated damages are and it is the half a tool cannot handle for you.

Two federal statutes govern the acquisition side. Neither of them is mentioned on a single competitor page we could find.

## The statute nobody selling this will name

The [Driver's Privacy Protection Act](https://www.law.cornell.edu/uscode/text/18/2721), 18 U.S.C. 2721 to 2725, exists because state motor vehicle departments were selling their files. It applies to personal information that came out of a motor vehicle record, and the definition of personal information at [18 U.S.C. 2725(3)](https://www.law.cornell.edu/uscode/text/18/2725) is deliberately wide. It "means information that identifies an individual, including an individual's photograph, social security number, driver identification number, name, address (but not the 5-digit zip code), telephone number, and medical or disability information".

Name. Address. Telephone number. Those are the three fields a skip trace returns.

The structure of the statute is the part worth understanding, because it is the opposite of how most people assume privacy law works. It does not list forbidden uses. It lists the permitted ones, fourteen of them, and everything not on the list is not permitted. [Section 2722(a)](https://www.law.cornell.edu/uscode/text/18/2722) then makes the consequence explicit: "It shall be unlawful for any person knowingly to obtain or disclose personal information, from a motor vehicle record, for any use not permitted under section 2721(b) of this title."

Read the list and three of the fourteen look, at a glance, as though they might cover a prospecting call. None of them does.

[[scene:three-exceptions]]

The teeth are in [section 2724](https://www.law.cornell.edu/uscode/text/18/2724), and this is the one figure in this article that is fixed by Congress rather than estimated by anybody. A person who knowingly obtains, discloses or uses that information for a purpose the chapter does not permit "shall be liable to the individual to whom the information pertains, who may bring a civil action in a United States district court". The court may award "actual damages, but not less than liquidated damages in the amount of $2,500", plus punitive damages on proof of willful or reckless disregard, plus attorneys' fees.

Note what that sentence does and does not say. It is a private right of action, brought by the individual, not a regulator's fine. The floor is per person, not per call. And a court "may" award it, which is not the same as "will", so this is an exposure rather than an invoice. Those distinctions matter and they are the reason the figure at the top of this page is written as a floor for one person rather than as a total for a list.

None of this means a traced number came out of a motor vehicle record. We have no way of knowing what share of them did, and the honest position is that nobody outside the compilers does. What it means is that if any link in the chain behind your list touched one, the obligation attaches to whoever obtained it, and the length of the chain is not a defence. Which brings us to the clause the trade points at.

## What a licence actually buys, and it is not a new permission

If you have ever asked a data provider about this you will have been told, quite correctly, that licensed private investigators have access under the DPPA. That is true. [Section 2721(b)(8)](https://www.law.cornell.edu/uscode/text/18/2721) permits disclosure "For use by any licensed private investigative agency or licensed security service for any purpose permitted under this subsection."

Read the last seven words again.

[[scene:pull-quote]]

The clause is a loop. It says that a licensed agency may use the information for a purpose that the same subsection already permits. It does not add a fifteenth purpose called investigation. So the licence answers the question of who may act. The question of what for is still open, and it has to be closed by finding a purpose somewhere else on the same list of fourteen.

That is not a technicality and it is not a gotcha. It is the whole design. A licence is an accountability mechanism: it means there is a regulator, a record and something to lose. It was never intended to be a key, and reading it as one turns an answer about who may act into an answer about what for, which are the two halves the statute deliberately keeps apart.

There is a practical consequence and it is a good one. [Section 2721(c)](https://www.law.cornell.edu/uscode/text/18/2721) requires that any authorised recipient who resells or rediscloses this information "must keep for a period of 5 years records identifying each person or entity that receives information and the permitted purpose for which the information will be used and must make such records available to the motor vehicle department upon request."

Somebody wrote down a purpose. It exists. You are entitled to ask your provider what purpose your account was established under, and a provider who cannot answer that in a business day is telling you something useful about themselves.

[[scene:plate-two]]

## The second statute turns on your purpose, not on the data

The [Fair Credit Reporting Act](https://www.law.cornell.edu/uscode/text/15/1681b) is the other one, and it works in a way that surprises almost everybody, including people who have dealt with it before.

Most people assume the FCRA covers credit reports, meaning documents with credit scores in them, and that a name and a phone number is obviously not one of those. That is not how the definition is built. Under [15 U.S.C. 1681a(d)(1)](https://www.law.cornell.edu/uscode/text/15/1681a) a consumer report is any communication by a consumer reporting agency of information "bearing on a consumer's credit worthiness, credit standing, credit capacity, character, general reputation, personal characteristics, or mode of living which is used or expected to be used or collected in whole or in part for the purpose of serving as a factor in establishing the consumer's eligibility for" credit, insurance, employment, or any other purpose authorised by section 1681b.

The operative words are "which is used or expected to be used". The status is conferred by the purpose, not by the fields. The same file can be an ordinary commercial record in one transaction and a consumer report in the next, and what moves it across the line is what the person receiving it intends to do with it.

That has a specific consequence for real estate that is worth stating plainly, because it is the boundary that decides whether this whole subject is simple or complicated for you.

Building a list of owners in order to introduce yourself and ask whether they are thinking of selling is not, on its face, an eligibility determination. Nobody is being approved or declined for anything. But the moment a list is filtered or ranked by something that bears on a person's financial standing, and the filtering decides who gets an offer and who does not, the purpose has changed shape and the question is no longer rhetorical. Equity position, lien status, distress signals and the phrase "financially motivated seller" all live very close to that line.

[15 U.S.C. 1681b(f)](https://www.law.cornell.edu/uscode/text/15/1681b) is the prohibition and it is short: "A person shall not use or obtain a consumer report for any purpose unless (1) the consumer report is obtained for a purpose for which the consumer report is authorized to be furnished under this section; and (2) the purpose is certified in accordance with section 1681e of this title by a prospective user of the report through a general or specific certification."

Look at the permissible purposes at [1681b(a)(3)](https://www.law.cornell.edu/uscode/text/15/1681b) and the one a business would reach for is (F)(i): a legitimate business need for the information "in connection with a business transaction that is initiated by the consumer". That phrase is the whole answer, and it is the reason cold prospecting does not fit. A person who has never heard of you has not initiated anything.

We are not your lawyers and this article cannot be legal advice for your business. What it can do is tell you the two questions to put in writing to any provider, because both of them have short answers that a serious company will give you: which permitted purpose is our account established under, and does anything you supply us derive from a consumer reporting agency.

## Two hundred and fifty four million standing refusals

Now the use side, briefly, because most of it belongs to a different article on this site.

If you are working an old database of people who once contacted you, the rules about consent windows, autodialers and revocation are the subject of [the piece on database reactivation](/blog/database-reactivation-old-real-estate-leads), which carries the regulations and the dates in them and will not be repeated here. That article is about permission that may have gone stale. This one is about the situation where there was never any permission at all, and there is one thing about that situation which the other article does not cover.

The National Do Not Call Registry is a list of numbers whose owners have said, in advance and in writing, that they do not want telemarketing calls. The [Federal Trade Commission's Data Book for 2024](https://www.ftc.gov/system/files/ftc_gov/pdf/DNC-Data-Book-2024.pdf) states its size directly: "As of September 30, 2024, there were 254 million active registrations."

That is not a count of people, and the Commission says why in the same document: active registrations are those a consumer has placed and not deleted, the FTC removes numbers that have been disconnected and reassigned, and "numbers that have been disconnected but not reassigned remain on the registry". One person can register several numbers. So treat it as an order of magnitude rather than a headcount, and the order of magnitude is the point.

A traced number is a number you have never spoken to. You have no idea whether it is on that list until you check, and checking is a mechanical step that costs almost nothing and is skipped constantly.

[[scene:complaints]]

The chart is deliberately not the one everybody draws. The conversation about unwanted calls is almost entirely a conversation about robots, and the second bar is three quarters of a million complaints in one year about a human being dialling. That is what a prospecting list is. It is not a robocall problem, it is not somebody else's problem, and the people making those complaints were, in every case, doing exactly what the registry told them to do.

[[scene:plate-three]]

## The number itself does not stay still

There is one more thing about a traced number that nobody selling you one will bring up, and it is not about the law.

Telephone numbers get recycled. A person cancels a line, the number goes back into a pool, and after a waiting period the carrier assigns it to somebody new. The Federal Communications Commission built a national database to deal with the consequences of this, and the [order that created it](https://docs.fcc.gov/public/attachments/FCC-18-177A1.pdf) explains the mechanism in a sentence: "Once a consumer disconnects a number, he or she might not update all parties who have called in the past. When the old number is eventually reassigned, callers may inadvertently reach the new consumer who now has the reassigned number."

The same order carries a scale figure, and the honest way to quote it is with the Commission's own footnote attached. The text says "Approximately 35 million numbers are disconnected and made available for reassignment to new consumers each year". The footnote says where that came from and then, remarkably, undercuts it: the figure is an average of the North American Numbering Plan Administrator's utilisation reports for 2013 to 2016, and "while a number of parties have cited this figure, we note that at least one party has questioned whether the figure accurately reflects the volume of number reassignments. In the Reassigned Numbers NOI we sought comment on whether this number accurately reflects the volume of number reassignments, but received no other credible estimate."

That is a regulator publishing a number, saying somebody has challenged it, and saying nobody offered anything better. It is a more useful thing to know than the number itself, and it is the reason this article puts it in a paragraph rather than in a chart. A figure the publishing body has flagged as contested is not a measurement, and drawing a bar for it would turn a caveat into a fact.

What you can take from it is the direction. Numbers move between people, at a scale nobody disputes is large, and the enrichment file that told you this number belongs to that owner was assembled at a moment that has already passed. So a stranger answering and telling you it is the wrong person is not the vendor failing. It is the arrangement behaving exactly as everybody involved has described it.

[[scene:trace-path]]

## What a trace is actually made of

The diagram above is the honest version of the pipeline, and the two hops that decide whether any of this is safe are the fourth and the fifth. Everything else is engineering.

Our own service page described this in four steps until this article was written, and all four are on the left of that diagram: pull the properties, resolve the owner, append a number, clean the file. Those steps are real, they work, and they are not where anything goes wrong. What was missing was any account of where the appended number came from and under what purpose it was released, which is precisely the pair of facts the two statutes above turn on. It has a fifth step now, and that is what this article changed about the way we describe our own work.

Put them in the build and they cost you almost nothing. A source field on every enriched row. A purpose recorded once, at the account level, in writing, from the provider. A suppression list that is checked before the file is handed to anything that dials. None of that is difficult and none of it is expensive. It is only ever skipped because nobody asked for it at the start, and retrofitting it onto a database whose rows arrived from four places over six years is a genuinely miserable job.

[[scene:trace-calculator]]

## What it costs and how long it takes

No figure is quoted here, and the reason is specific to this service: the dominant cost is a per record charge paid to somebody else, so most of what you would spend never passes through us at all.

Three things are being paid for. Enrichment is priced per record by whichever provider you use, and it is the only part that scales with volume. The pipeline pulls the properties, runs them through, validates and deduplicates what comes back, writes it where it needs to go and enforces the suppression check. And then the item almost nobody budgets for, which is the fields and the habit around them: a source and a date on every row, a purpose on file, an owned suppression list, and a person responsible for all three.

Two things drive the enrichment bill and neither is ours to negotiate. One is how many properties you run. The other is whether you are charged for attempts or for successes, which varies by provider and is a question with a one word answer that you should ask before signing rather than discover on an invoice: if it is attempts, a low resolve rate in your area spends money without producing anything. The second slider in the calculator is yours to fill in rather than ours to assert, and the most valuable half hour available before you sign anything is asking a provider to run two hundred addresses from your own farm and report what came back.

On time, the build is not the long pole. Pulling, enriching and cleaning is a well understood piece of work. What takes the time is the part that is a conversation rather than a configuration: deciding what your suppression rules are, agreeing where the source and purpose fields live, and getting a written answer out of the provider about the two questions in the section above. Businesses that already have a clean CRM move quickly. Businesses whose contact records arrived from four places over six years find that this project turns into a data cleanup, which is a real cost and is better discovered before the work starts than after.

The one honest way to size any of it is the audit further down this page. It takes twenty minutes, it costs nothing, and it will tell you which of those two situations you are in.

## What it does not do, and should not pretend to

It does not give you a match rate in advance. Rates vary by area, by how much public record sits behind a property and by how long ago the owner acquired it. Figures do circulate, and we went and followed them rather than asserting that they cannot be sourced. What is out there is bands rather than measurements, usually 70 to 90 percent, and the pages carrying them are companies that sell skip tracing, pages ranking those companies, or in one case a skip-tracing company publishing a ranking of its own category with itself in it. One of them credits a trade association study by name and links to no report. None of them states a sample.

There is a second number under those bands and it is the one worth carrying away, because a vendor put it on its own page: a phone hit rate and a connect rate are different quantities, and the second is much lower than the first. A match rate tells you how often a number came back. It does not tell you how often the number reached the person, and those two get quoted interchangeably. Your own provider can measure both for your own area in an afternoon, and that measurement is worth more than any band.

It does not tell you the number is current. Enrichment reports the best answer in the file at the moment it is asked. Whether that number still reaches that person is a separate fact that nobody in the chain has checked, which is the reassignment problem above and is not something better software fixes.

It does not resolve a legal question about your own use. The two statutes in this article attach to the person who obtains and uses the information. A provider's terms of service allocate risk between you and them; they do not answer the question a court would ask, which is what purpose you had.

It does not confer permission to call. That is a separate body of rules with its own dates and its own private right of action, and honouring a do not call registration is a step in your process rather than a property of the data. It stays your obligation regardless of what the list cost.

It does not produce a reason for anybody to sell. Everything in this article is about reaching a person. A traced number carries no information whatsoever about whether that household is thinking of moving. Whatever signal there was came from the public record you started with, and if the pipeline does not carry it forward alongside the number then it has been thrown away, which is worth checking on your own output rather than assuming either way.

[[scene:wasted]]

[[scene:offer]]

## How to audit your own list in twenty minutes

Nothing here needs a tool, a consultant or a new subscription. Do it on the list you already have.

1. **Pick one row at random.** Not the first one, not one you remember. Scroll and stop. This matters, because a list is only as defensible as its worst row and the worst row is never at the top.

2. **Ask where that number came from.** Not "from public records". Which file, supplied by whom, under which account. If the answer takes longer than a business day to arrive, you have learned the important thing already.

3. **Ask what purpose the account was established under.** Providers who resell information covered by the DPPA are required to keep exactly this, for five years. It is a normal question with a normal answer and asking it is not an accusation.

4. **Ask whether anything they supply derives from a consumer reporting agency.** This is a yes or no question and it changes what you are allowed to do with the file. A vendor who does not understand the question is answering it.

5. **Look for the source and date fields in your own CRM.** Open a contact that came off a purchased or traced list and one that came off your own website form. If the record does not tell you which is which, then your consent position for the whole database is currently unknowable, and that is a bigger problem than any list.

6. **Find your suppression list and find out who owns it.** Not the CRM's built in unsubscribe flag. The list of people who have said no to your business, in any channel, held somewhere that survives changing software. If nobody owns it, nobody is maintaining it.

7. **Ring one number yourself and listen for the question.** The one at the top of this article. If you cannot answer it in a sentence you would be comfortable having read back to you, that is the actual finding, and it is worth more than the rest of the audit put together.

## Common questions, answered honestly

### What is skip tracing in real estate, in plain terms?

It is the work of turning a property into a person you can contact. Public records tell you who owns a house and where they get their post; they almost never tell you a phone number. Skip tracing is the set of joins between other files that produces a current telephone number and email address for that owner. In prospecting it is what turns a map into a list you can work.

### Is skip tracing legal?

The honest answer is that it is not one thing, so it does not have one answer. Looking up a deed or a tax roll is unambiguously fine; those records are public because a legislature said so. The part that carries rules is the appended contact information, and the two statutes that govern it are the Driver's Privacy Protection Act, which permits release of motor vehicle record information only for listed purposes, and the Fair Credit Reporting Act, which turns on what you use the information for rather than on what it contains. Both attach to the person obtaining and using the data. Neither is answered by a provider's terms of service, and this article is not legal advice for your business.

### Can I call a number I got from skip tracing?

Getting a number and being allowed to ring it are separate questions with separate rules. Checking the national do not call registry before you dial is a mechanical step and it is not optional. The consent rules for calls and texts, including what an established business relationship is worth and how long it lasts, are covered in detail in [our article on database reactivation](/blog/database-reactivation-old-real-estate-leads). The short version for this article is that a traced number is the case with the least protection available to you, because there is no prior relationship of any kind to rely on.

### How accurate is automated skip tracing?

Figures circulate, and we followed them: they are bands of roughly 70 to 90 percent, published by companies that sell the service or by pages ranking those companies, and none of the ones we opened states a sample. So there is no independent measurement to quote and we are not going to invent one. What is measurable is your own resolve rate in your own area, which a provider can produce by running a sample from your farm. Two things are worth understanding about accuracy here. A wrong number and a missing number are different failures, and the second is much cheaper than the first. And because a matching system decides between merging and leaving alone by where a threshold sits, moving that threshold to return an answer for more rows necessarily returns the wrong person for more of them, so a headline match rate that sounds impressive may be describing a file with more wrong people in it rather than fewer.

### How is this different from buying a lead list?

A purchased list was assembled on some date nobody tells you and sold to everybody who paid for it, which means the households on it can be worked by several people who have no idea about each other. A trace runs on demand for the area you are working now. The difference that matters here is not freshness though: it is that building the list yourself makes you the person who obtained the information, so every question in this article becomes yours to answer and yours to be able to answer.

### What is the difference between skip tracing and data enrichment?

Skip tracing starts from a property and works towards a person who has never contacted you. Data enrichment starts from a person who is already in your database, usually because they contacted you, and fills in what you do not know about them. They use overlapping technology and they sit in completely different places legally, because one of them has a prior relationship behind it and the other has nothing at all.

### Does a licensed provider make this safe?

It makes it accountable, which is not the same thing and is still worth having. A licence means there is a regulator, a record and something to lose. What it does not do is create a permitted purpose that the statute does not list, because the clause that grants investigators access grants it only for purposes already permitted elsewhere in the same subsection. Ask the licensing question and then ask the purpose question, in that order, and do not let the first answer stand in for the second.

### What should I ask a provider before I sign anything?

Four questions, all short, all answerable. Which permitted purpose is our account established under. Does anything you supply derive from a consumer reporting agency. What is the measured resolve rate on two hundred addresses from our own area. And what happens on your side when somebody asks not to be contacted again. A company that answers all four in writing in a business day is a different proposition from one that sends a brochure.

## What to do about it

Everything in this article comes back to one sentence you should be able to say without hesitating, to a stranger, on a Tuesday morning, about any row on any list in your business.

It is not a legal formula and nobody is asking for one. It runs something like: this came from a provider we have a written agreement with, under a purpose they have on file, and we checked it against the do not call registry before I rang you. Every part of that is arrangeable, none of it is expensive, and all of it has to be arranged before the first call rather than after the first complaint.

[[scene:funnel]]
`;

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

In June 2024 a team at Sierra published a benchmark called tau-bench. It is not a quiz. It puts a language agent into a simulated business with a real database, a set of tools that can change that database, and a written policy it has to follow, and then has a second language model play a customer who wants something. Two domains: a retail one with five hundred customers, a thousand orders and a hundred and fifteen tasks, and an airline one with three hundred flights, two thousand reservations and fifty tasks. At the end of each conversation the benchmark compares the actual state of the database against the one correct outcome. Not the transcript, not the tone. What ended up in the system.

The authors also proposed a measurement that nobody had been using, and it is the important part. Everybody had been reporting whether an agent succeeds at a task. They asked instead how often an agent succeeds at the same task every single time it is attempted, and they named it pass hat k: the chance that all k independent attempts are successful, averaged across tasks.

Read that against your own morning. You do not need an assistant that can draft a good reply. You need one that drafts a good reply on Monday and Tuesday and Wednesday and the Thursday you were in the car.

## What happens when you run the same job twenty times

The best model in that paper solved more than sixty percent of the retail tasks on a single attempt. Run the same tasks eight times each and require all eight to be right, and the paper reports that the figure drops below twenty five percent.

Sit with the shape of that rather than the numbers, because the numbers are from June 2024 and the models have moved since. Something that succeeds most of the time on any given morning succeeds every morning far less often than most of the time, and the gap widens the more mornings you ask about. That is not a flaw anybody introduced. It is what happens when you multiply a probability by itself, and it is the reason a demo is such a poor guide to a purchase. A demo is one attempt. A business is a hundred attempts in a row.

The same paper is worth reading for one more reason: it looked at what the failures actually were. Of thirty six failed runs it examined by hand, the largest group was the agent calling the right kind of tool with the wrong values in it. Not a refusal, not an error message, not an apology. The correct action, confidently, on the wrong record. Which is what happened at 6:40 on the tenth morning.

## Where these systems actually go wrong, and it is mostly not the model

The other paper worth your time is more recent and it is about exactly the thing the service page is selling, which is several agents working at once.

A group at UC Berkeley collected 1,642 annotated execution traces from seven different multi-agent frameworks, built a taxonomy of what went wrong by having six human experts read a hundred and fifty traces closely, and then checked that the taxonomy was reliable by having independent annotators apply it and measuring how often they agreed. Their agreement measure came out at 0.88, which is high, and it matters because a taxonomy nobody applies the same way twice is an opinion rather than a finding.

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

This industry is unusual in having already written down what happens when work is delegated, because delegating licensed work is already a regulated activity in New York. It is worth reading two provisions in [the Department of State's own Real Estate License Law booklet](https://dos.ny.gov/real-estate-license-law), because neither is about artificial intelligence and both are about you.

Section 442-c deals with what a salesperson's misconduct means for the broker. A broker is not automatically on the hook for what an associate did. But there are two ways they become so, and the second is the one to read twice: a broker is exposed where they had actual knowledge of the violation, or where they retain the benefits, profits or proceeds of a transaction wrongfully negotiated by their salesperson or employee after notice of the misconduct. Keeping what the conduct earned is the thing that attaches you to the conduct.

Then read Section 440-a, which is the requirement to be licensed at all. It lists who may hold a licence: a person, a co-partnership, a limited liability company, a corporation. That list is a list of parties that can be disciplined, sued and struck off. It is not a list a piece of software is on, and nothing here is a prediction about future law. It is a description of the present one, and the description is that when an assistant working for you says something to a client, there is exactly one licensed party in the conversation and it is you.

## What supervision looks like when the thing you are supervising is software

There is a second document worth borrowing, and this one is borrowed openly as an analogy rather than applied as a rule. It is about supervising people and it says nothing whatever about software.

Section 175.21 of the Secretary of State's regulations defines what supervising a salesperson actually consists of, and rather than leaving it to judgement it writes it down: regular, frequent and consistent personal guidance, instruction, oversight and superintendence, with respect to the brokerage business and all matters relating to it. The next paragraph requires written records of what the salesperson actually did.

Nobody is claiming that provision governs an inbox assistant. What it does is describe, in a document your regulator wrote, the standard this industry already applies to work done in your name by somebody who is not you. Regular. Frequent. Consistent. Written down.

Set that beside four assistants running overnight with nobody reading the output after day four, and you have the honest specification for what running this well requires. Not a dashboard. A habit, with a time in the diary, and a record of what was produced.

[[scene:plate-two]]

[[scene:offer]]

## What it costs, and how long it takes

Nobody can quote this from an article, because three separate things drive the cost and only one of them is the software.

The first is the brief, and it is the slow part. Writing down a job properly, exceptions included, is a sitting rather than a message, and it goes faster when a second person keeps pushing back on the first version you offer. The tau-bench ablation is the argument for spending that time rather than skipping it.

The second is access. An assistant that can read your calendar and your CRM is worth several times one that cannot, and the work is connecting it safely: the right permissions, nothing wider than the job needs, and a way to switch it off.

The third is the running cost, which is usage rather than a seat, tracks how much the assistant has to read rather than how much it writes, and is genuinely small per task and genuinely unbounded if nobody watches it.

What this page will not print is a per-model price, and the reason is not that the numbers are hidden. They are published, they are readable, and you can look them up in a minute. It is that they are quoted per million tokens, which means nothing until somebody knows how many tokens your job takes; that they change several times a year; and that which model sits behind an assistant is a build decision that can be changed without anything visible happening at your end. A figure typed into an article would be stale before the article was, and it would not have answered the question you asked. What can be said is the shape: the cost per piece of work is in cents rather than dollars, it is driven by the length of the instructions rather than the length of the answer, and the honest budget line is the review time above it rather than the compute.

## What it does not do, and should not pretend to

It does not take responsibility. An assistant cannot be told off, cannot learn from being told off in any way that persists unless somebody edits the brief, and cannot be the person a client complains to. Every consequence lands on a licensed human being, and that human being is you.

It does not notice that the job has changed. This is the quietest failure of the four. A person who has been drafting your listing emails for a year will eventually say that the market has moved and the second paragraph now reads badly. An assistant will produce that second paragraph forever, with perfect consistency, until somebody rewrites the brief.

It does not do a job nobody has written down. A vague brief does not produce vague output, which would at least be a visible signal. It produces confident, fluent, plausible output that is subtly not what you wanted, and you find out three weeks later from a client.

It does not remove the reading. Anything that reaches a client should be read by a person first, an assistant that drafts is worth more than one that sends, and the review is not a temporary safety measure for the first month. It is the job now.

And it does not scale the way the word workforce suggests. Four independent assistants are four times the review. Four assistants feeding each other are four times the review plus a category of failure that only exists because they are connected, and the published taxonomy has six named modes inside it.

[[scene:wasted]]

## How to test one assistant before you run four

Do this with one assistant, on one job, before anybody builds you a set of them. It runs over a couple of weeks, it costs you nothing but attention, and it will tell you more than any demonstration.

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

Technically as many as you have jobs for, because they do not queue behind each other. Practically the limit is not the software, it is how many streams of output one person can review before the reviewing stops happening. It is a number worth working out rather than assuming, and the calculator above is there to let you find yours before you commit to it.

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

There is a second, duller constraint that shapes every real system. You cannot compare every record against every other record. Ten thousand contacts is just under fifty million pairs, and the overwhelming majority of them are two people who have nothing to do with each other. The standard answer, which Winkler credits to Newcombe in 1962, is called blocking: only bother comparing pairs that already agree on something, such as a surname or a date of birth. It is a good answer and it has a cost that is built into it. Any true match whose blocking field is wrong on one side will never be looked at, because the two records were never in the same pile.

[[scene:plate]]

## Somebody solved this properly, and the answer has three outcomes

In 1969 Fellegi and Sunter published a formal mathematical model for ideas Newcombe had introduced ten years earlier, and it is still the model underneath every serious matching system in the world. Winkler's overview restates it, and the restatement is the part a business owner should actually read.

You take a pair of records and you look at the pattern of what agrees and what does not: same last name, different first name, same street number, no email on one side. Then you ask a ratio. How likely is that exact pattern among pairs that really are the same person, against how likely it is among pairs that really are not? A high ratio means the agreements are the kind that only matches produce. A low one means they are the kind that strangers produce by coincidence.

Then comes the decision rule, and it is quoted here almost exactly as Winkler writes it. If the ratio is above an upper threshold, designate the pair a match. If it is between the two thresholds, designate it a possible match and hold it for clerical review. If it is below the lower threshold, designate it a nonmatch.

[[scene:three-answers]]

## The third answer is a person, and it is the one nobody sells you

Almost every product in this category describes two outcomes: it finds duplicates, or it does not. The model that actually works has three, and the middle one is a queue of pairs that a human being looks at. Winkler's own name for that band is the no-decision region.

The reason it exists is the sentence right underneath the rule, and it is the honest centre of this whole article. The two thresholds are set from error bounds you choose in advance, on false matches and on false nonmatches. You get to pick how often the system is allowed to merge two people who are not the same person, and how often it is allowed to leave one person sitting in the database twice. You do not get to pick zero for both. Moving one threshold to make one of those numbers smaller makes the other one bigger, and the only place the pressure can go instead is into the middle band, which is a person's afternoon.

That is not a limitation of the software you were quoted. It is a property of the problem, published in 1969, and any vendor whose answer to "how accurate is your deduplication" is a single percentage has either not read this or is hoping you have not.

What it looks like at scale is worth seeing, because the trade is real and so is the payoff. Winkler records what the computerised procedures did to what he calls a very large 1990 Decennial Census application: they reduced the need for clerks and field follow-up from an estimated 3,000 individuals over 3 months to 200 individuals over 6 weeks.

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

The same page carries a warning that most people find out about by hitting it. Partial upserts are not supported when using email as the identifying property for contacts, and the documented remedy is to identify people by a custom property of your own instead. Which is worth knowing before the build rather than after, because the path that does not support a partial update is the path where you end up describing the whole contact, and that is the erasing behaviour two sections up.

And it documents what survives a merge, which is the detail that tells you the vendors have thought about this harder than the resellers have. When two contacts are combined, the loser's email address does not evaporate; it is kept as an additional email on the surviving record, and those additional addresses are still unique identifiers, so no other contact can take them. Your database remembers that Kathy existed. It has to, because the next time a message comes in from that address, something has to know where to put it.

[[scene:offer]]

## What it costs, and how long it takes

This article will not quote you a number, and not out of coyness. Four things drive the cost and none of them can be guessed from a distance: how many systems have to be joined, whether each of them exposes an interface a program can actually use, how many fields have to be mapped by hand rather than by name, and whether the records already in there have to be reconciled before anything is switched on. The fourth moves the total more than the other three and it is never in the quote.

The shape of it can be described without a number. A single pair of systems with a clear identity field and a dozen mapped fields is a small piece of work measured in days. A business with an old CRM, a newer CRM nobody finished migrating to, a phone system and a portal feed is a different project, and the connecting is the smaller half of it. Most of the time goes on somebody sitting with you over a list of fields and asking what each one is for, which is slow because half the answers turn out to be "I think that was Dave's".

Then there is the recurring cost, which is a person's attention. A sync is software, it will break the week a vendor renames a field, and something has to notice. And the middle band from the matching model never goes away: if you want fewer wrong merges, more pairs land in front of a human, and that is a standing item on somebody's week rather than a one-off.

Here is the number we cannot give you, and it is the one you actually asked for. How many duplicates are in your database right now. Figures for this circulate constantly, usually in a band somewhere between ten and forty percent, and the ones we followed led either to a company that sells deduplication software quoting its own customers or to an analyst rule of thumb with no report behind it. Not one of them states a sample or a method, which is the same shape as every figure this website has had to retract. The calculator above therefore asks you for the inputs rather than assuming them, and the honest first step of any real project is measuring your own file instead of accepting somebody's average.

[[scene:plate-two]]

## What it does not do, and should not pretend to

It does not clean what is already in there. Keeping two systems in step from today onward and reconciling nine years of accumulated records are two different jobs with two different price tags, and a sync switched on over an unreconciled database will faithfully propagate every mess in it to a second system.

It does not remove the human decision. That is the entire point of the three way rule, and any build that reports a hundred percent automatic resolution has quietly widened its match threshold and is merging people. The failure mode of an over-eager deduplicator is worse than the one it fixes: two separated records are an embarrassment, and two people fused into one is a stranger reading somebody else's conversation history.

It does not open a system that will not open. Most modern CRMs expose an interface built for exactly this, and a platform that does not is not going to be talked round. Screen scraping something with no interface is not a sync, it is a liability with a schedule.

It does not make anybody use the CRM. A record that is finally true is worth nothing at all if the appointment still lives on a sticky note, and there is no integration that can reach into a notebook.

And it will not tell you which of the two records is the real one, in the cases that matter. It will tell you they are probably the same person. Which email she reads, which number she answers, and which of the two histories is the one you should have in front of you before you ring her: that is judgement, and it belongs to whoever knows her.

[[scene:wasted]]

## How to find out how bad yours is, in twenty minutes

Nobody needs a consultant for the first pass, and you should do this before anybody quotes you, because the quote is worth more when you have the answer.

Take the last ten deals you closed. For each of those people, search your CRM for the surname on its own, then the first name on its own, then the email domain. Count the records that come back and are plainly the same human being. Ten is a small sample and it is not meant to be a statistic; it is meant to tell you whether the answer is roughly zero or roughly everywhere, and that is the only resolution the decision needs.

Then do the same for yourself. Put your own name into your CRM, your marketing tool, and your phone system in turn, and see what each of them thinks it knows about you. Your own record is the one you can audit instantly and argue with nobody about, which is what makes it the useful place to start.

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
