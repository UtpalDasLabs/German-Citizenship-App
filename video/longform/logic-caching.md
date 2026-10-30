---
title: "The Pile on Your Chair Is an Algorithm — What Computers Know About Keeping Things Close"
series: logic
voice: Rr3HT8xllxaRdjMZxGBa
stability: 1.0
questions: []
summary: "The chair in your bedroom with a pile of clothes on it is doing what every computer does billions of times a second: keeping what you just used within reach. In 1966 an IBM engineer, László Bélády, worked out the perfect rule for what to keep close. The simple rule 'throw out what you used longest ago' turns out to come close to it. How to use it with your wardrobe, your desk and your kitchen."
sources: ["L. A. Belady: A study of replacement algorithms for a virtual-storage computer, IBM Systems Journal 5(2), 1966: https://doi.org/10.1147/sj.52.0078", "Cache replacement policies (Bélády's algorithm, least recently used): https://en.wikipedia.org/wiki/Cache_replacement_policies", "Yukio Noguchi's filing system (Chō seiri-hō, 1993): https://en.wikipedia.org/wiki/Yukio_Noguchi", "Brian Christian, Tom Griffiths: Algorithms to Live By (2016), chapter 4"]
target: about 6 minutes
status: draft 1
---

<!--
Logic to Live By, episode 6. Format: see the top of basic-rights.md.
Delivery: calm and steady (stability 1.0), [warmly] for story peaks, no tag
for plain practical lines. Never [dramatic].
Phrasing: people by place, never nationality generalisations.
Pictures: photos/clips to be sourced (Gemini key missing on 30 Oct, so no
omni hero clips yet; hook clip "omni-hook-chair" planned when the key is back).
-->

## Cold open

> SCENE (photo): A chair with a pile of clothes on it.
> omni-hook-chair | The chair. Everyone has one. | color key
> laundry |  | color @ Someone has probably told you

[calm] There's a chair in your bedroom. It isn't for sitting. It holds the jeans you wore yesterday, the jumper from Sunday, the shirt you might wear again tomorrow. Someone has probably told you to tidy it. But that pile is doing exactly what every computer on earth does, billions of times a second.

> SCENE (line): Series card.
> Logic to Live By

[warmly] I'm Utpal, and this is Logic to Live By: simple rules for better decisions.

> SCENE (photo): A wardrobe, doors open.
> wardrobe | What do you keep close? | color key
> bookshelf |  | color @ and why the pile

[calm] Today: caching. How to decide what to keep within reach, what to put away, and why the pile on your chair is smarter than it looks.

> SCENE (title): Title card.
> LOGIC TO LIVE BY · EPISODE 6

## The problem

> SCENE (photo): A small desk; shelves behind.
> shelves | Close space is small. Far space is slow. | color key
> attic |  | color @ The space far away

[calm] Every home has the same problem. The space close to you is small: a desk, a bedside table, the front of a drawer. The space far away is big, but slow: the loft, the cellar, the back of the wardrobe.

> SCENE (line): The question.
> When the close space is full, what goes?

[calm] So the real question is: when the close space is full, and you need room for something new, what do you move away?

> SCENE (photo): A computer chip.
> chip | Computers face this every second. | color key
> servers |  | color @ The disk is huge

Computers face this question all the time. The memory right next to the processor is tiny but very fast. The disk is huge but slow. That small, fast space is called a cache. And choosing what to throw out of it decides how fast your computer feels.

## The story

> SCENE (place): IBM Research, New York, 1966.
> lab | NEW YORK, USA | IBM Research, 1966

[warmly] In 1966, an engineer at IBM named László Bélády published a study of exactly this question.

> SCENE (photo): Old computer tape drives.
> tapes | Which page should leave the fast memory? | color key

[calm] He tested different rules for what a computer should throw out of its fast memory, when room was needed. Throw out something at random. Throw out whatever came in first. Throw out whatever was used longest ago.

> SCENE (line): The perfect rule.
> Throw out what you'll need again furthest in the future.

[warmly] And he found the perfect rule. Throw out the thing you will need again furthest in the future. If you won't need it for a year, it can go to the loft.

> SCENE (photo): A crystal ball, or fog.
> fog | One problem: nobody knows the future. | color key

[calm] There's just one problem. Nobody knows the future. Not you, and not a computer.

> SCENE (lru): Items on a shelf; the one used longest ago slides off.

[calm] But decades of tests since then have shown something useful. The rule "throw out what was used longest ago" comes surprisingly close to the perfect one. Computer scientists call it least recently used. The past is the best guess we have about the future. What you used an hour ago, you'll probably use again soon. What you haven't touched in a year, you probably won't.

> SCENE (stat): Why it works.
> bg | chip2
> 1966 | the year Bélády compared the rules @ nineteen sixty-six
> Billions | of times a second, your phone uses a version of it @ billions of times a second

[calm] Versions of that rule still run inside your phone and your laptop today, billions of times a second.

## The rule

> SCENE (list): The rule.
> bg | wardrobe2
> Just used | Keep it close @ What you just used
> Not touched in a long time | Move it away @ What you haven't touched

[calm] So here's the rule. When space is short, keep close what you used most recently. Move away what you haven't touched for the longest time.

> SCENE (photo): The clothes on the chair again.
> omni-chair-cache | The chair is a cache. | color key @ The chair is
> drying |  | color @ sorted by least recently used

[warmly] Which brings us back to the chair. The clothes on top are the ones you wore most recently, the ones you're most likely to wear again. The chair is a cache. And the pile is sorted by least recently used, without you even trying.

## A filing system from Tokyo

> SCENE (place): Tokyo.
> tokyo | TOKYO, JAPAN | Yukio Noguchi, economist

[calm] An economist in Tokyo, Yukio Noguchi, built a whole filing system on this idea in the nineteen-nineties.

> SCENE (photo): A row of envelopes or files on a shelf.
> envelopes | New and used files go on the left. | color key
> documents |  | color @ every time you use one

[calm] Every document goes into an envelope. The envelopes stand in one row on a shelf. A new one goes on the far left. And every time you use one, you put it back on the far left too.

> SCENE (photo): A shelf with files.
> files3 | No labels, no sorting. It just works. | color key

[calm] No categories, no labels to keep up. Over time, the files you use often stay on the left, and the ones you never touch drift to the right, ready to be archived. It's least recently used, done by hand.

## Where it breaks

> SCENE (list): When to break the rule.
> bg | cellar
> Rare but urgent | Passport, first aid kit: a fixed place @ Rare but urgent
> Seasons | Winter coats: plan ahead @ Seasons
> Too much stuff | No rule fixes that @ too much stuff

[calm] The rule has limits. Some things are rarely used, but urgent when you need them. Your passport, the first aid kit, the torch. Give those a fixed place, however long ago you touched them.

Seasons break it too. In March, the winter coat was used recently, but you won't need it again until November. Here you know the future, so use it.

And if you simply have too much stuff, no rule will fix that. A cache works because it's small.

## Three everyday uses

> SCENE (photo): A wardrobe.
> wardrobe3 | Wardrobe: put worn things back on the left. | color key

The wardrobe. Hang what you've just worn at one end. After a few months, look at the other end. That's what you can give away.

> SCENE (photo): A tidy desk with a few papers.
> desk3 | Desk: keep what you used this week. | color key
> typewriter |  | color @ Everything else goes

The desk. Keep on it only what you used this week. Everything else goes to a drawer, and the drawer's oldest papers go to a box.

> SCENE (photo): A kitchen counter.
> kitchen | Kitchen: the counter is your cache. | color key
> pot |  | color @ The bread machine

[calm] The kitchen. The counter is your cache. The kettle and the knife you use every day earn their place. The bread machine you used once at Christmas belongs in the cupboard.

## The takeaway

> SCENE (photo): A chair with clothes.
> omni-chair-end | It's not a mess. It's a cache. | color key

[calm] Keep close what you used last. Put away what you haven't touched in longest. You don't need to know the future. The recent past is a very good guess.

> SCENE (line): The key line.
> Keep close what you used last.

[warmly] So the pile on your chair isn't laziness. It's one of the oldest tricks in computing.

> SCENE (photo): A to-do list on a desk.
> todo | Next: which task first? | color key @ Next time

[calm] This idea comes from the book Algorithms to Live By, by Brian Christian and Tom Griffiths. The link is in the description. Next time on Logic to Live By: which task first? What computers know about deadlines, and why doing everything at once is the slowest way.

> SCENE (end): Closing card.
