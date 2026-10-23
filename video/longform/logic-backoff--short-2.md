---
title: "The fix for retrying has three words: double, cap, jitter."
series: logic
voice: Rr3HT8xllxaRdjMZxGBa
stability: 1.0
media: logic-backoff
hook: "The fix for retrying has three words: double, cap, jitter."
parent: "Try Again, but Wait Longer — Why Retrying Faster Makes It Worse"
questions: []
---

<!-- Short 2 of logic-backoff, written by scripts/series-shorts.mjs from logic-backoff.shorts.json. Edit those, not this. -->

## Short

> SCENE (backoff): double

[calm] The internet's fix for retrying is three words. Double, cap, jitter.

[calm] One: **double** the wait. Try again after one second. If that fails, after two. Then four, eight, sixteen, thirty-two.

> SCENE (backoff): cap

[calm] Two: **cap** it. Somewhere around a minute, stop doubling. Otherwise a bad hour becomes a bad day, and a service that recovers in ten seconds is still being ignored by everything that decided to wait an hour.

> SCENE (backoff): jitter

[calm] Three: add **randomness**. If a thousand devices all wait the same eight seconds, they all come back at the same instant. So each one picks a random moment inside its window. Spread out, they fit. Together, they collide again.

[calm] The full story is in the video on this channel.
