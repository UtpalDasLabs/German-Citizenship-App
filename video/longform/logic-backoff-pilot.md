---
title: "PILOT · Try Again, but Wait Longer — The Smartest Way to Retry Anything"
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
> redial | Busy. Busy. Busy. | color key
> switchboard |  | color @ Thousands of other people
> crowd |  | color @ at exactly the same moment

[calm] You call the hotline. Busy. You call again straight away. Busy. And again. Busy. Thousands of other people are doing exactly the same thing, at exactly the same moment. So everyone keeps hitting a wall that all of you are building together.

> SCENE (photo): Hands sketching.
> sketch | Logic to Live By | color key

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

> SCENE (end): Closing card.
