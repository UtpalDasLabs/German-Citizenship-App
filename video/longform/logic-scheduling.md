---
title: "The Talk You Keep Postponing: A Simple Rule for What to Do First"
series: logic
voice: Rr3HT8xllxaRdjMZxGBa
stability: 1.0
questions: []
summary: "Jonas has been avoiding one conversation with his flatmate for nine days. Why do the hard talks wait longest, and is there a smart order for everything on your list? Computer scientists know three rules: earliest due date, shortest job first, and free whoever is blocked. The last one saved NASA's Mars Pathfinder in 1997. How the same rules work on arguments, on big slow goals like the gym or an exam, and on to-do lists."
sources: ["Jackson's rule (earliest due date) and Smith's rule (shortest processing time): https://en.wikipedia.org/wiki/Single-machine_scheduling", "Glenn Reeves, JPL: What really happened on Mars Pathfinder: https://www.cs.cornell.edu/courses/cs614/1999sp/papers/pathfinder.html", "Mars Pathfinder: https://en.wikipedia.org/wiki/Mars_Pathfinder", "E. J. Masicampo, R. F. Baumeister: Consider it done! Plan making can eliminate the cognitive effects of unfulfilled goals, Journal of Personality and Social Psychology 101(4), 2011", "P. Gollwitzer, P. Sheeran: Implementation intentions and goal achievement: a meta-analysis, Advances in Experimental Social Psychology 38, 2006", "Brian Christian, Tom Griffiths: Algorithms to Live By (2016), chapter 5"]
target: about 9 minutes
status: draft 2 (13 Nov 2026, personal-life hook)
---

<!--
Logic to Live By, episode 7, v2 (13 Nov 2026): opens on a relationship problem
(the personal-life hook, docs/PLAYBOOK.md). Jonas and his flatmate Ana, and the
made-up friends Mira and Tom, are illustrations, not true stories.
Delivery: [calm] base, [warmly] at human peaks, never [dramatic].
-->


## Cold open

> SCENE (photo): Jonas and Ana at the kitchen table, an awkward silence.
> omni-flatmates | Nine days. | color key

[calm] Jonas has been avoiding the same conversation with his flatmate for nine days.

[calm] Jonas and Ana have three things between them. The heating bill. Whose turn it is to clean. And a comment Ana made two weeks ago that still stings.

> SCENE (photo): Ana in her room, glancing at the door and her phone.
> omni-ana-waiting | And Ana waits. | color key

[calm] So he does what most of us do. He starts with none of them. Emails. Laundry. A very long walk. And in the next room, Ana waits.

[calm] Why do the hard talks wait the longest? And is there a smart order for everything else on the list? There is. Computer scientists worked it out, and it takes about ten seconds.

> SCENE (line): Series card.
> Logic to Live By

[warmly] I'm Utpal, and this is Logic to Live By: simple rules for better decisions.

> SCENE (title): Title card.
> LOGIC TO LIVE BY · EPISODE 7

[calm] Today: scheduling. Which task first, and why the answer depends on one question: what are you trying to protect?

> SCENE (photo): Jonas at his desk, three sticky notes.
> omni-hook-desk | Which one first? | color key

[calm] Here's something odd. Stress isn't about how much work you have. It's about how much of it is unfinished.

> SCENE (loops): One task not started against twenty with eight done.

[calm] A person with one big thing, not started, can feel more stressed than a person with twenty things who has already done a few of them. The pile isn't the problem. The open loops are.

## The problem

> SCENE (line): One worker.
> One worker. Many jobs. Which order?

[calm] Imagine one worker and a list of jobs. That worker is you, with one pair of hands. The jobs have different lengths and different deadlines.

> SCENE (list): What counts as a bad day.
> The latest task | How late is the worst one? @ the one thing
> The count | How many end up late? @ number of things
> The waiting | Total time spent waiting @ total time

[calm] There is no single best order. It depends on what counts as a bad day. Is it the one thing that ends up latest? The number of things that end up late? Or the total time everything spends waiting? Each of those has its own rule. Let's take the ones that matter.

## Rule one

> SCENE (edf): Tasks sort themselves by due date.

[calm] Rule one. If you want to keep your worst delay as small as possible, do the task due soonest first. Always. It does not matter how long each one takes. It sounds too simple to be a theorem. It is one. Sorted by deadline, no other order can make your latest task less late.

> SCENE (line): Rent form before essay.
> Rent form (Tue) before the essay (Fri). @ So for Jonas

[calm] So for Jonas, the rent form, due Tuesday, goes before the essay, due Friday. Even if the essay feels bigger and scarier.

> SCENE (line): Rule one, with people.
> Rule one: the talk with a date comes first. @ Rule one

[calm] Rule one: whatever has a real date goes first. The bill is due Friday. So that talk happens now, not after the feelings.

## Rule two

> SCENE (spt): The same two jobs in two orders.

[calm] Rule two. Maybe deadlines don't matter and you simply want the list to shrink. Fewer things hanging over you. Then do the quickest task first. Say you have a job that takes one hour, and one that takes five. Do the long one first, and the short one waits five hours. Do the short one first, and the long one waits only one. Over a whole list, quick wins first gives the least total waiting.

> SCENE (photo): Jonas calls the dentist.
> omni-dentist | Two minutes. Top of the list. | color key

[warmly] That is why, for Jonas, calling the dentist takes two minutes and goes at the very top. Everyone's waiting time drops at once, including his own worry.

> SCENE (line): Quick wins close loops.
> Quick wins close the most loops, the fastest. @ Remember

[warmly] Remember: stress is unfinished work. Quick wins close the most loops the fastest.

> SCENE (line): Weight by length.
> Importance divided by length. @ And if some tasks

[calm] And if some tasks matter more than others, divide importance by length. Do the most important-per-minute job first.

> SCENE (line): Rule two, with people.
> Rule two: small and quick, today. @ Rule two

[calm] Rule two: small and quick, today. "Sorry, I was short with you this morning." Ten seconds, and a loop closes.

## The story

> SCENE (place): Mars, 1997.
> sojourner | MARS, JULY 1997 | NASA's Pathfinder lander

[warmly] In July 1997, NASA's Pathfinder landed on Mars. Days later, the computer on board began restarting itself. Over and over. The mission was in danger, and the engineers on Earth were nearly two hundred million kilometres away.

> SCENE (inversion): High, medium and low priority tasks sharing one lock.

[calm] The cause was a scheduling problem. A low-priority task was holding a shared resource that an important task needed. A medium-priority task kept interrupting the low one, so it could never finish and let go. The important task just waited. The system noticed it was stuck, and rebooted.

[calm] Computer scientists call this priority inversion. The most urgent job ends up waiting behind the least urgent one.

> SCENE (photo): The landing site panorama.
> pano | Fixed with a patch sent to Mars. | color key @ patch

[calm] The fix was a rule, sent up to Mars as a software patch: if a low task holds something a high task needs, let the low task borrow the high priority until it is done. Pathfinder carried on, and finished its mission.

> SCENE (line): Rule three, with people.
> Rule three: free the blocker. @ Rule three

[calm] Rule three: free the blocker. If Ana is waiting for his answer about the weekend, and he keeps delaying, he is the low-priority job holding the lock.

> SCENE (photo): Jonas answers Ana's message.
> omni-reply | Answer, even with "I need until tomorrow." | color key

[calm] Everything she plans is stuck behind him. Answer, even with "I need until tomorrow."

## Where it breaks

> SCENE (line): Switching costs time.
> Switching isn't free. @ These rules have limits

[calm] These rules have limits. One. Switching isn't free.

> SCENE (photo): Jonas jumping between laptop, phone and notebook.
> omni-switching | Jumping between tasks eats the day. | color key

[calm] A computer loses time every time it changes task, and so do you. If you jump between three things every few minutes, you spend the day getting back up to speed.

> SCENE (line): Busy, but less done.
> Multitasking feels busy and gets less done. @ That is why

[calm] That is why multitasking feels busy and gets less done.

> SCENE (line): Unknown length.
> You rarely know how long it takes. @ Two

[calm] Two. You rarely know how long a task will take. When you can't tell, guess quickly and do the quick-looking ones first.

> SCENE (line): Urgent versus important.
> Urgent is not the same as important. @ Three

[calm] Three. Don't mix up urgent with important. Rule one is about deadlines. If the hard thing has no deadline, give it a deadline yourself, or it will be stuck behind the Mars problem forever.

> SCENE (photo): Jonas starts an evening study session.
> omni-study | The gym. An exam in a year. | color key

[warmly] And four, the big one. Goals that take months. The gym. An exam in a year.

> SCENE (line): Exactly wrong.
> Rule one says: do it last. Exactly wrong. @ Rule one says

[warmly] Rule one says: do it last, it's due last. That's exactly wrong. Nothing ever forces you to start, the loop stays open for months, and it nags you the whole time.

> SCENE (sessions): A year-long goal as weekly sessions.

[calm] So don't schedule the goal. Schedule the session. "Study" has no deadline. "Tuesday, six o'clock, forty-five minutes" does. Now it competes with everything else, and when you finish it, you close a loop. You get a tick this week, long before the result shows. A big goal stops being one huge unfinished thing, and becomes a row of small finished ones.

## Three everyday uses

> SCENE (line): A to-do list.
> A due date on every item. Sort by date. @ A to-do list

[calm] A to-do list. Put a due date on every item. Sort by date. That is rule one, and it is already most of the work.

> SCENE (line): Email.
> Two minutes? Answer now. @ Email

[calm] Email. Anything you can answer in two minutes, answer now. Rule two. The rest waits for a block of time.

> SCENE (line): A chore chart.
> Someone blocked? Do that one first. @ And a shared

[calm] And a shared chore chart, at home or at work. If someone is blocked because of a task nobody has touched, move that one first. That's Pathfinder's fix in a flat.

## Two old friends

> SCENE (photo): Two old friends on a Sunday walk.
> omni-walk | Two friends. Two years of silence. | color key

[warmly] Picture two old friends, Mira and Tom. A small row over money, two years ago. Neither called. Each waited for the other.

> SCENE (line): Five words.
> "I miss our Sunday walks." @ Then one evening

[warmly] Then one evening Mira sends five words: "I miss our Sunday walks." Tom answers in a minute. "Same. Saturday?"

> SCENE (line): The waiting.
> The conversation was never the heavy part. The waiting was. @ The conversation

[calm] Two years of carrying it. One minute to put it down. The conversation was never the heavy part. The waiting was.

## The takeaway

> SCENE (line): The three rules.
> Soonest deadline. Quickest win. Free the blocker. @ Soonest deadline

[calm] Soonest deadline first, if lateness is the danger. Quickest first, if waiting is the problem. And always free whoever is stuck behind you. For the big, slow goals, give every week its own small deadline.

> SCENE (photo): Jonas and Ana at the kitchen table with tea, laughing with relief.
> omni-talk | Twenty minutes. Two mugs of tea. | color key

[warmly] And Jonas and Ana? On Thursday evening he knocked on her door and said, "Can we talk about the heating bill? And I'm sorry about last week." Twenty minutes. Two mugs of tea. The loop he had carried for nine days was closed.

> SCENE (photo): Jonas, calm, on Thursday evening.
> omni-ending | Because he stopped losing the first hour. | color key

[warmly] Jonas rings the dentist, sends the rent form, and then writes the essay on Thursday evening, calmly.

> SCENE (line): Not more time.
> Not more time. He stopped losing the first hour. @ Not because

[warmly] Not because he got more time. Because he stopped losing the first hour.

> SCENE (line): The key line.
> Soonest deadline. Quickest win. Free the blocker.

[calm] This idea comes from the book Algorithms to Live By, by Brian Christian and Tom Griffiths. The link is in the description. Next time on Logic to Live By: four years together. Should you stay? The logic of money and time already spent.

> SCENE (end): Closing card.
