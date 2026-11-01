---
title: "1971: the network that learned to wait"
series: logic
voice: Rr3HT8xllxaRdjMZxGBa
stability: 1.0
media: logic-backoff
hook: "1971: the network that learned to wait"
parent: "Try Again, but Wait Longer — The Smartest Way to Retry Anything"
questions: []
---

<!-- Short 2 of logic-backoff, written by scripts/series-shorts.mjs from logic-backoff.shorts.json. Edit those, not this. -->

## Short

> SCENE (collide): Two messages collide over the sea; then random waits, and both get through.

[calm] In 1971, a radio network in Hawaii found the smartest way to try again.

[calm] But there was a problem. All the terminals shared one radio channel. If two of them sent a message at the same moment, the messages collided, and both were lost.

[calm] The team's answer was simple. If your message doesn't get through, don't send it again immediately. Wait a random moment, then try. Because if both senders retried at once, they would collide again. And again. Forever.

> SCENE (backoff): Tries on a timeline; each wait twice the last.

[calm] Here's the rule. It's called exponential backoff. Fail once? Wait a moment, and try again. Fail twice? Wait twice as long. Three times? Twice as long again. One, two, four, eight, sixteen.

[calm] The full story is in the video on this channel.
