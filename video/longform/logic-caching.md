---
title: "Why Friendships Fade Without a Fight: What Computers Know About Keeping Things Close"
series: logic
voice: Rr3HT8xllxaRdjMZxGBa
stability: 1.0
questions: []
summary: "No fight, no reason: a friendship just drifts. Computers have the same problem when their fast memory is full, and in 1966 an IBM engineer, László Bélády, worked out the perfect rule for what to keep close. The simple version, keep what you used last, explains the pile of clothes on your chair, a filing system from Tokyo, and why friendships fade, and how a ten-second message pulls one back."
sources: ["L. A. Belady: A study of replacement algorithms for a virtual-storage computer, IBM Systems Journal 5(2), 1966: https://doi.org/10.1147/sj.52.0078", "Cache replacement policies (Bélády's algorithm, least recently used): https://en.wikipedia.org/wiki/Cache_replacement_policies", "Yukio Noguchi's filing system (Chō seiri-hō, 1993): https://en.wikipedia.org/wiki/Yukio_Noguchi", "Brian Christian, Tom Griffiths: Algorithms to Live By (2016), chapter 4"]
target: about 6 minutes
status: draft 2 (13 Nov 2026, personal-life hook)
---

<!--
Logic to Live By, episode 6. Format: see the top of basic-rights.md.
Delivery: calm and steady (stability 1.0), [warmly] for story peaks, no tag
for plain practical lines. Never [dramatic].
Phrasing: people by place, never nationality generalisations.
Pictures (re-cut 30 Oct): show what each sentence says. 3D Maya for story,
2D explainers for every idea, stock only when literal.
Re-script 13 Nov 2026: opens on a friendship that faded (personal-life hook, docs/PLAYBOOK.md); the chair is the "by the way". Maya and Jule are made-up.
-->

## Cold open

> SCENE (photo): Maya scrolling her chat list at midnight.
> omni-phone-scroll | Fourteen months. | color key

[calm] Maya is scrolling through her chat list at midnight when she reaches the very bottom. Jule. Her best friend since school. The last message between them is fourteen months old.

> SCENE (line): No fight.
> No fight. No reason. They just drifted.

[calm] There was no fight. No reason. They just drifted. And Maya feels a small, sharp pang, the one that says: you let something good slip.

> SCENE (line): There is a reason.
> The same reason as the pile of clothes on your chair.

[calm] There is a reason it happens, and it is the same reason there is a pile of clothes on your chair. To see why, look at something that has nothing to do with friends.

> SCENE (photo): A chair with a pile of clothes on it.
> omni-hook-chair | The chair. Everyone has one. | color key
> omni-chair-mum |  | color @ Someone has probably told you

[calm] There's a chair in your bedroom. It isn't for sitting. It holds the jeans you wore yesterday, the jumper from Sunday, the shirt you might wear again tomorrow. Someone has probably told you to tidy it. But that pile is doing exactly what every computer on earth does, billions of times a second.

> SCENE (line): Series card.
> Logic to Live By

[warmly] I'm Utpal, and this is Logic to Live By: simple rules for better decisions.

> SCENE (photo): A wardrobe, doors open.
> wardrobe | What do you keep close? | color key
> omni-chair-grab |  | color @ and why friendships

[calm] Today: caching. How to decide what to keep within reach, what to put away, and why friendships fade without anyone deciding.

> SCENE (title): Title card.
> LOGIC TO LIVE BY · EPISODE 6

## The problem

> SCENE (deskloft): A small desk next to a big loft; a stopwatch times a trip to each.

[calm] Every home has the same problem. The space close to you is small: a desk, a bedside table, the front of a drawer. The space far away is big, but slow: the loft, the cellar, the back of the wardrobe.

> SCENE (deskfull): A new thing arrives at the full desk.

[calm] So the real question is: when the close space is full, and you need room for something new, what do you move away?

> SCENE (deskcache): The same desk and loft, relabelled cache and disk.

Computers face this question all the time. The memory right next to the processor is tiny but very fast. The disk is huge but slow. That small, fast space is called a cache. And choosing what to throw out of it decides how fast your computer feels.

## The story

> SCENE (place): IBM Research, New York, 1966.
> lab | NEW YORK, USA | IBM Research, 1966

[warmly] In 1966, an engineer at IBM named László Bélády published a study of exactly this question.

> SCENE (rulesrace): Three rules race on the same requests, counting trips to the loft.

[calm] He tested different rules for what a computer should throw out of its fast memory, when room was needed. Throw out something at random. Throw out whatever came in first. Throw out whatever was used longest ago.

> SCENE (futurerule): Each thing shows when it is needed next; the furthest goes.

[warmly] And he found the perfect rule. Throw out the thing you will need again furthest in the future. If you won't need it for a year, it can go to the loft.

> SCENE (photo): Maya puzzled at her wardrobe.
> omni-wardrobe-puzzled | One problem: nobody knows the future. | color key

[calm] There's just one problem. Nobody knows the future. Not you, and not a computer.

> SCENE (lru): Items on a shelf; the one used longest ago slides off.

[calm] But decades of tests since then have shown something useful. The rule "throw out what was used longest ago" comes surprisingly close to the perfect one. Computer scientists call it least recently used. The past is the best guess we have about the future. What you used an hour ago, you'll probably use again soon. What you haven't touched in a year, you probably won't.

> SCENE (stat): Why it works.
> 1966 | the year Bélády compared the rules @ nineteen sixty-six
> Billions | of times a second, your phone uses a version of it @ billions of times a second

[calm] Versions of that rule still run inside your phone and your laptop today, billions of times a second.

## The rule

> SCENE (list): The rule.
> Just used | Keep it close @ What you just used
> Not touched in a long time | Move it away @ What you haven't touched

[calm] So here's the rule. When space is short, keep close what you used most recently. Move away what you haven't touched for the longest time.

> SCENE (photo): The clothes on the chair again.
> omni-chair-cache | The chair is a cache. | color key @ The chair is

[warmly] Which brings us back to the chair. The clothes on top are the ones you wore most recently, the ones you're most likely to wear again. The chair is a cache. And the pile is sorted by least recently used, without you even trying.

## A filing system from Tokyo

> SCENE (place): Tokyo.
> tokyo | TOKYO, JAPAN | Yukio Noguchi, economist

[calm] An economist in Tokyo, Yukio Noguchi, built a whole filing system on this idea in the nineteen-nineties.

> SCENE (noguchi): A row of envelopes; a used one jumps back to the far left.

[calm] Every document goes into an envelope. The envelopes stand in one row on a shelf. A new one goes on the far left. And every time you use one, you put it back on the far left too.

> SCENE (noguchi2): The same row, faster; the right end drifts to the archive.

[calm] No categories, no labels to keep up. Over time, the files you use often stay on the left, and the ones you never touch drift to the right, ready to be archived. It's least recently used, done by hand.

## Why friendships fade

> SCENE (noguchi2): Friends as envelopes: a message sends one to the left, silence lets it drift right.

[calm] Now think of your friends as envelopes on that shelf. Every time you talk to someone, they jump to the far left. Every week you do not, they drift one step to the right.

> SCENE (line): No fight needed.
> Nobody decides to lose a friend. @ Nobody decides

[warmly] Nobody decides to lose a friend. There is no fight, no moment. The friendship just drifts, one quiet week at a time, towards the right end of the shelf. And the right end is where things get archived.

> SCENE (list): The fix.
> Use it | It goes back to the left @ Use it
> Ten seconds counts | A photo, a voice note, "saw this, thought of you" @ A ten-second message

[calm] The fix is the same as on the shelf. Use it, and it goes back to the left. A ten-second message counts: a photo, a voice note, "I saw this and thought of you". Not a big gesture. A small one, soon.

> SCENE (list): A weekly rule.
> Once a week | Look at the bottom of your chat list @ Once a week
> Message the longest-waiting | Not the one you feel best about @ Message whoever

[calm] Here is a rule for it. Once a week, look at the people at the bottom of your chat list. Message whoever has been there the longest.

> SCENE (photo): Maya records a voice note, then laughs at the reply.
> omni-friend-voice | Eleven seconds. | color key

[warmly] Maya sends Jule a voice note. Eleven seconds. "I found our old school photo. I miss you." Four minutes later Jule answers, laughing: "I was just about to message you!" They talk for an hour.

> SCENE (line): Eleven seconds.
> Fourteen months of drifting. Eleven seconds to pull it back.

[calm] Fourteen months of drifting. Eleven seconds to pull it back. The friendship was never the heavy part. The silence was.

## Where it breaks

> SCENE (list): When to break the rule.
> Rare but urgent | Passport, first aid kit: a fixed place @ Rare but urgent
> Seasons | Winter coats: plan ahead @ Seasons
> Too much stuff | No rule fixes that @ too much stuff

[calm] The rule has limits. Some things are rarely used, but urgent when you need them. Your passport, the first aid kit, the torch. Give those a fixed place, however long ago you touched them.

Seasons break it too. In March, the winter coat was used recently, but you won't need it again until November. Here you know the future, so use it.

And if you simply have too much stuff, no rule will fix that. A cache works because it's small.

> SCENE (line): Same for people.
> A cache works because it is small. @ The same goes for people

[calm] The same goes for people. The friend who lives far away, who would drop everything for you, gets a fixed place: a call every birthday. And nobody can keep two hundred people close. A cache works because it is small. Choose who goes on your shelf.

## Three everyday uses

> SCENE (photo): A wardrobe.
> wardrobe3 | Wardrobe: put worn things back on the left. | color key

The wardrobe. Hang what you've just worn at one end. After a few months, look at the other end. That's what you can give away.

> SCENE (photo): A tidy desk with a few papers.
> desk3 | Desk: keep what you used this week. | color key

The desk. Keep on it only what you used this week. Everything else goes to a drawer, and the drawer's oldest papers go to a box.

> SCENE (photo): A kitchen counter.
> kitchen | Kitchen: the counter is your cache. | color key

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

[calm] This idea comes from the book Algorithms to Live By, by Brian Christian and Tom Griffiths. The link is in the description. Next time on Logic to Live By: the talk you keep postponing, and which task to do first.

> SCENE (end): Closing card.
