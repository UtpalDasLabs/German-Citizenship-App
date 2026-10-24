---
title: "Try Again, but Wait Longer — Why Retrying Faster Makes It Worse"
series: logic
voice: Rr3HT8xllxaRdjMZxGBa
stability: 1.0
questions: []
summary: "Your appointment page will not load, the hotline will not answer, the application gets no reply. Trying again sooner feels like trying harder, and in October 1986 that instinct made the internet a thousand times slower. The rule that fixed it has three parts: double, cap, jitter. And a fourth: know when to stop."
sources: ["Van Jacobson, Michael J. Karels: Congestion Avoidance and Control, SIGCOMM '88 (October 1986: LBL to UC Berkeley, 400 yards and two hops, throughput 32 Kbit/s to 40 bit/s): https://dl.acm.org/doi/10.1145/52324.52356", "Congestive collapse, and retransmissions making overload worse: https://en.wikipedia.org/wiki/Network_congestion", "IEEE 802.3 binary exponential backoff, truncated after 10 doublings (1023 slot times): https://en.wikipedia.org/wiki/Exponential_backoff", "RFC 6298, Computing TCP's Retransmission Timer (doubling, 1 s floor, 60 s ceiling): https://www.rfc-editor.org/rfc/rfc6298", "Norman Abramson, The ALOHA System (1970), pure ALOHA ceiling 1/(2e) = 18.4%: https://en.wikipedia.org/wiki/ALOHAnet", "Brian Christian, Tom Griffiths: Algorithms to Live By (2016), chapter 10, Networking"]
target: about 6 minutes
status: draft 1
---

<!--
Logic to Live By, episode 3. Format: see the top of basic-rights.md.
Delivery: calm and steady (stability 1.0), [warmly] for story peaks, no tag
for plain practical lines. Never [dramatic].
Phrasing: people by place, never nationality generalisations. "They".
Facts: every number below is in the front matter's sources. The 1986 figures
are Jacobson & Karels' own wording (32 Kbit/s to 40 bit/s, factor of a
thousand, LBL to UC Berkeley, 400 yards, two IMP hops).
-->

## Cold open

> SCENE (photo): A phone refreshing at seven in the morning; a waiting room; the city at seven.
> phone-refresh |  | color
> waiting-room | 7:00 | color @ seven in the morning
> crowd-queue | Everyone at once. | color key @ everyone else

[calm] Seven in the morning. You want an appointment at the Bürgeramt. The slots open now. You refresh. Nothing. You refresh again, faster. Nothing. And everyone else in the city is doing exactly the same thing.

> SCENE (backoff): pressure

[calm] Retrying faster feels like trying harder. In a system that is already full, it is the opposite. It is adding to the problem. And in October 1986, that instinct nearly killed the internet.

> SCENE (photo): Notes, a sketch, a desk.
> sketch | Logic to Live By | color key

[warmly] I'm Utpal, and this is Logic to Live By: simple rules for better decisions.

> SCENE (title): Title card.
> LOGIC TO LIVE BY · EPISODE 3

[calm] In this video: what happened in 1986, the three-part rule that fixed it, and the point where you should stop trying.

## October 1986

> SCENE (backoff): map

[calm] Berkeley, California, October 1986. Two buildings, four hundred yards apart: Lawrence Berkeley Laboratory, and the University of California. On the young internet, they were two hops from each other.

> SCENE (photo): Server racks; network equipment.
> server-racks |  | color

> SCENE (photo): Network lights; cables; a router.
> network-lights | 32 kbit/s | color
> fiber-cables | 40 bit/s | color @ forty bits

[calm] The link between them carried thirty-two kilobits a second, about the speed of a bad phone line today. Then, over a few hours, it fell to forty bits a second.

> SCENE (backoff): throughput

[calm] Forty bits a second. A thousand times slower. Nothing had been switched off. The network was strangling itself with its own traffic.

> SCENE (backoff): storm

[calm] Here is how. A packet goes missing. Both ends send it again, immediately. The routers are already full, so the new copies are dropped as well. So both ends send those again. More packets, more loss, more packets. The panic was the problem.

> SCENE (line): When everyone retries at once, the retries are the emergency.
> When everyone retries at once, the retries are the emergency.

## The rule

> SCENE (backoff): ruleintro

[calm] Two researchers at Berkeley, Van Jacobson and Michael Karels, worked out what to change. Their answer is in every phone and laptop you own, and it has three parts.

> SCENE (backoff): double

[calm] One: **double** the wait. Try again after one second. If that fails, after two. Then four, eight, sixteen, thirty-two.

> SCENE (backoff): cap

[calm] Two: **cap** it. Somewhere around a minute, stop doubling. Otherwise a bad hour becomes a bad day, and a service that recovers in ten seconds is still being ignored by everything that decided to wait an hour.

> SCENE (backoff): jitter

[calm] Three: add **randomness**. If a thousand devices all wait the same eight seconds, they all come back at the same instant. So each one picks a random moment inside its window. Spread out, they fit. Together, they collide again.

> SCENE (line): Double. Cap. Jitter.
> Double. Cap. Jitter.

## Why it works

> SCENE (overlay): aloha — a radio mast against the sky; the shared channel, drawn.
> radio-mast

[calm] This is not only about computers. In 1970, a network in Hawaii let every radio send whenever it liked. Its ceiling was eighteen percent of capacity. The rest was lost to collisions: two senders talking over each other, then both repeating themselves.

> SCENE (backoff): herd

[calm] Waiting a little, and at random, is what turns that noise back into a conversation. The same is true at the Bürgeramt at seven in the morning. Everyone refreshes at the same second, the server slows down, and the spike grows.

> SCENE (backoff): loop

[calm] The crowd is not unlucky. The crowd is the problem. A retry that ignores everyone else is a vote for the next crash.

## Where it breaks

> SCENE (backoff): failure

[calm] There is a catch, and it is a large one. Waiting longer only helps if the thing you are waiting for might come back.

> SCENE (backoff): deadend

[calm] If the number is disconnected, or the job is filled, or the person has moved on, a longer wait is just a slower no.

> SCENE (backoff): gate

[calm] So before the next try, ask one question: has anything changed since the last one? If the answer is no, more waiting will not change it either.

> SCENE (backoff): attempts

[calm] That gives you a stop rule. Three tries, with a growing gap between them. Then stop. Not because you gave up, but because you have learned the answer is probably no. It is the 37 percent rule's quieter cousin: know when to stop looking.

> SCENE (overlay): followup — a phone face down on a table; the message that names the next try.
> phone-down

[calm] And one thing for the human version. The other side cannot see your backoff. If you go quiet for a week, it looks like you lost interest. So say it out loud: I will follow up next week. Then the waiting is part of the message, not a silence.

## Three everyday uses

> SCENE (overlay): calls — a call centre; the calls, counted.
> call-centre

[calm] The hotline. Calling twenty times in ten minutes does not get you through faster. It adds you to the pile. Call, wait, call again later: the queue is the same queue.

> SCENE (overlay): apply — a laptop with a letter; the follow-up rhythm.
> laptop-apply

[calm] The application. One follow-up after a week, one more after two weeks, then stop. That rhythm is not politeness. It is the same curve the internet uses.

> SCENE (overlay): convo — two people talking, seen from a distance; the gap that helps.
> conversation

[calm] The difficult conversation. Asking again tomorrow, and again the day after, rarely helps. Asking once more after a real gap, with something new to say, does.

## The takeaway

> SCENE (backoff): recap

[calm] So when something fails: wait longer each time, not less. Cap the wait, so you do not disappear for a day. Spread your attempts, so you are not the whole herd. And stop at three, unless something has changed.

> SCENE (photo): An open book on a table.
> open-book | Algorithms to Live By · Brian Christian & Tom Griffiths | color @ Algorithms

[calm] This idea comes from the book Algorithms to Live By, by Brian Christian and Tom Griffiths. The link is in the description.

> SCENE (overlay): next — the question after this one.
> corridor

[calm] Next time on Logic to Live By: why a crowd of smart people can all be wrong together.

> SCENE (end): Closing card.
