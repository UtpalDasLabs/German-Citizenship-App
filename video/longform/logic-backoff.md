---
title: "Try Again, but Wait Longer — The Smartest Way to Retry Anything"
series: logic
voice: Rr3HT8xllxaRdjMZxGBa
stability: 1.0
questions: []
summary: "The hotline is busy, the email gets no answer, a friend cancels again. When should you try again? A network in Hawaii in 1971 found the answer computers still use today: exponential backoff. How it works, when it breaks, and how to use it with hotlines, job applications and people."
sources: ["ALOHAnet, University of Hawaii, Norman Abramson and Franklin Kuo, first unit in operation June 1971: https://en.wikipedia.org/wiki/ALOHAnet", "IEEE Milestone, ALOHAnet: https://ieeemilestones.ethw.org/Milestones:ALOHANET_(aka_ALOHA_System)", "Ethernet, Xerox PARC: https://en.wikipedia.org/wiki/Ethernet", "Binary exponential backoff, capped at 10 doublings, dropped after 16 attempts: https://en.wikipedia.org/wiki/Exponential_backoff", "Brian Christian, Tom Griffiths: Algorithms to Live By (2016), chapter 10"]
target: about 7 minutes
status: draft 1
---

## Cold open

> SCENE (photo): Redialling at the kitchen table; a call centre; an old phone.
> omni-hook-redial | Busy. Busy. Busy. | color key
> switchboard |  | color @ Thousands of other people
> crowd |  | color @ at exactly the same moment

[calm] You call the hotline. Busy. You call again straight away. Busy. And again. Busy. Thousands of other people are doing exactly the same thing, at exactly the same moment. So everyone keeps hitting a wall that all of you are building together.

> SCENE (line): Series card.
> Logic to Live By

[warmly] I'm Utpal, and this is Logic to Live By: simple rules for better decisions.

> SCENE (photo): Network cables.
> cables | How often should you try again? | color key @ It decides
> phone2 |  | color @ hotlines
> letters |  | color @ job applications
> friends |  | color @ people who keep

[calm] Today's rule comes from the way computers talk to each other. It decides how often to try again when something fails. And it works on hotlines, job applications, and even on people who keep letting you down.

> SCENE (title): Title card.
> LOGIC TO LIVE BY · EPISODE 3

## Hawaii, 1971

> SCENE (photo): Oahu; Norman Abramson; the ALOHAnet room in 1971.
> hawaii | Hawaii, 1971 | color key
> abramson | Norman Abramson | color @ led by Norman
> aloha1971 | ALOHAnet: islands linked by radio | color key @ They called it

[warmly] In June 1971, a team at the University of Hawaii, led by Norman Abramson, switched on a new kind of network. They called it ALOHAnet. Its job was to connect computer terminals on different islands to one central computer, using cheap radios instead of expensive cables.

> SCENE (collide): Two messages collide over the sea; then random waits, and both get through.

[calm] But there was a problem. All the terminals shared one radio channel. If two of them sent a message at the same moment, the messages collided, and both were lost.

[calm] The team's answer was simple. If your message doesn't get through, don't send it again immediately. Wait a random moment, then try. Because if both senders retried at once, they would collide again. And again. Forever.

> SCENE (photo): Network cables in an office.
> alto | California, a few years later | color key
> cables2 | Ethernet | color key @ They called it Ethernet
> clock | Each time it fails, the wait doubles. | color key @ Each time a message fails

[calm] A few years later, engineers at Xerox in California built on that idea for a network inside the office. They called it Ethernet. And they added one more twist, the one that matters most to us. Each time a message fails, the wait doubles.

## The rule

> SCENE (backoff): Tries on a timeline; each wait twice the last.

[calm] Here's the rule. It's called exponential backoff. Fail once? Wait a moment, and try again. Fail twice? Wait twice as long. Three times? Twice as long again. One, two, four, eight, sixteen.

> SCENE (stat): Ethernet's limits.
> bg | cables3
> 10 | collisions: then it stops doubling @ After ten
> 16 | attempts: then it gives up @ After sixteen

Ethernet still does this today. After each collision, a network card waits up to twice as long as the time before, picked at random. After ten collisions, it stops doubling. After sixteen, it gives up on that message.

> SCENE (photo): A crowded street from above.
> crowd2 | Randomness, and patience that grows. | color key

[calm] Two ideas are hiding in there. First, randomness, so that people who failed together don't try again together. Second, patience that grows. The more often something has failed, the less likely it is that the problem goes away in the next second.

## Why it works

> SCENE (photo): Traffic in a jam.
> traffic | Five failures in a row are information. | color key @ Five failures

[calm] Think about what a failure tells you. One failure might be bad luck. Five failures in a row are information. Something bigger is going on: the line is overloaded, the person is busy, the timing is wrong.

> SCENE (jam): Everyone retrying at once jams the line; backing off at random lets them through.

[calm] If you keep trying at the same rate, you ignore that information. And when everyone does it, the overload never clears. Backing off gives the problem room to solve itself.

> SCENE (photo): A door, slightly open.
> door | It never shuts the door. It only stops you banging on it. | color key @ never shuts

[warmly] And notice what the rule doesn't say. It doesn't say give up. You keep trying. You just try less often. Exponential backoff never shuts the door completely. It only stops you from banging on it.

## Where it breaks

> SCENE (list): Two exceptions.
> bg | calendar
> A hard deadline | Use the time you have, then stop @ A hard deadline
> A fixed schedule | Learn the pattern, call on time @ fixed schedule

[calm] There are two times when the rule needs a change. One. A hard deadline. If the office closes at four, doubling your wait until tomorrow doesn't help. Use the time you have, then stop.

Two. Things with a fixed schedule. If appointments are released every Monday at eight, the best moment to call is Monday at eight, not a random one. Learn the pattern first. Backoff is for when you don't know it.

## Three everyday uses

> SCENE (photo): A phone on a desk.
> omni-quarter-past | Busy? 2 minutes, then 5, then 15. | color key

The hotline. If it's busy, don't redial ten times in a minute. Try again in two minutes, then five, then fifteen. And if everyone calls at nine, you can call at a quarter past twelve.

> SCENE (photo): A letter box; a laptop.
> omni-follow-up | Follow up: a week, two weeks, a month. | color key

Job applications, or any message that gets no answer. Follow up after a week. If there's still nothing, after two weeks. Then a month. You stay on their radar without becoming the person they avoid.

> SCENE (photo): Friends at a café table.
> omni-friend-later | Forgive fast. Then back off. | color key @ Forgive quickly

[warmly] And people. A friend cancels on you. Do you cut them off? Or do you keep making plans every weekend? Backoff suggests a middle way. Forgive quickly the first time. If it happens again, wait a bit longer before the next invitation. And again, longer still. You never close the door. But your time goes where it's valued.

## The takeaway

> SCENE (photo): A clock.
> clock3 | Try again, but wait longer. | color key

[calm] When something fails, try again, but wait longer. Add a little randomness, so you're not retrying with the crowd. And let your patience grow with every failure, not your frustration.

> SCENE (line): The key line.
> Never give up. Just try less often.

[calm] Never give up. Just try less often.

> SCENE (photo): a restaurant at night.
> restaurant | Next: your favourite, or somewhere new? | color key @ Next time

[calm] This idea comes from the book Algorithms to Live By, by Brian Christian and Tom Griffiths. The link is in the description. Next time on Logic to Live By: your favourite restaurant, or somewhere new? The maths of when to explore and when to stick with what you know.

> SCENE (end): Closing card.
