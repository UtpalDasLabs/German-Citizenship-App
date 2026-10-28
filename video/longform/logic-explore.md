---
title: "Try Something New or Stick With Your Favourite? — The Maths of Explore vs Exploit"
series: logic
voice: Rr3HT8xllxaRdjMZxGBa
stability: 1.0
questions: []
summary: "Your favourite restaurant, or the new place next door? Mathematicians call it explore vs exploit, and the answer depends on one thing: how much time you have left. The rule, a trial in Michigan that put it to work, why older people stick to favourites, and how to use it in a new city, a career and a last visit."
sources: ["Multi-armed bandit, explore vs exploit, optimism under uncertainty: https://en.wikipedia.org/wiki/Multi-armed_bandit", "Herbert Robbins (1952), Some aspects of the sequential design of experiments: win-stay, lose-shift", "Bartlett et al., Extracorporeal circulation in neonatal respiratory failure, Pediatrics, October 1985: 12 infants, 1 conventional (died), 11 ECMO (all survived)", "Fung, Carstensen and Lang (2001) and Lang and Carstensen (1998) on older adults' social networks: https://pubmed.ncbi.nlm.nih.gov/9883455/", "Brian Christian, Tom Griffiths: Algorithms to Live By (2016), chapter 2"]
target: about 7 minutes
status: draft 1
---

<!--
Logic to Live By, episode 4. Format: see the top of basic-rights.md.
Delivery: calm and steady (stability 1.0), [warmly] for story peaks, no tag
for plain practical lines. Never [dramatic].
Phrasing: people by place, never nationality generalisations.
The hospital scene stays gentle: machines and a hand on an incubator, no distressed babies.
Script as written: the private repo's series/logic-to-live-by/04-explore-exploit.md.
-->

## Cold open

> SCENE (photo): A restaurant at night; a new place next door.
> omni-hook-two-doors | Your favourite, or the new place? | color key

[calm] Friday night. There's your favourite restaurant, where you know every dish is good. And there's the new place that opened next door. Do you go back to the one you love? Or do you take a chance on something new, and maybe waste your evening?

> SCENE (line): Series card.
> Logic to Live By

[warmly] I'm Utpal, and this is Logic to Live By: simple rules for better decisions.

> SCENE (photo): A clock.
> clock | How much time do you have left? | color key @ how much time

[calm] Computer scientists have a name for this choice, and a surprisingly clear answer. It depends on one thing most of us never think about: how much time you have left.

> SCENE (title): Title card.
> LOGIC TO LIVE BY · EPISODE 4

## Explore or exploit

> SCENE (bandit): Three slot machines, pulls tallied, the best one lights up.

[calm] Mathematicians picture it as a row of slot machines. Each one pays out at a different rate, but you don't know which is best. Every pull is a choice. Play the machine that has paid well so far? Or try another one, to learn something?

> SCENE (list): The two choices.
> bg | slots2
> Explore | Try something new, to learn @ exploring
> Exploit | Use what you already know is good @ exploiting

Trying something new is called exploring. Sticking with what you know is called exploiting, in the plain sense of making use of it.

> SCENE (photo): A market street.
> street | Every new restaurant is one pull of the arm. | color key @ Every new restaurant

[calm] Explore too little, and you may spend your whole life with the second-best option, never knowing. Explore too much, and you never enjoy what you've found. Every new restaurant, job, or holiday spot is one pull of the arm.

## The rule

> SCENE (line): The rule.
> Lots of time ahead: explore. Little time left: exploit.

[calm] Here's the rule. Explore when you have a lot of time ahead of you. Exploit when time is running out.

> SCENE (stat): Moving to a city for ten years.
> bg | city
> 10 | years in a new city @ ten years
> 100s | of good evenings from one great find @ hundreds

[calm] Think about why. A great new discovery pays off every time you go back to it. If you just moved to a city and you'll live there for ten years, finding a great restaurant this month gives you hundreds of good evenings. So try everything.

> SCENE (photo): A suitcase by the door.
> suitcase | Leaving next week? Go where you know. | color key

[calm] But if you're leaving next week, a new discovery has almost no time to pay off. Go to the place you already know is good.

> SCENE (photo): A clock.
> clock2 | Exploring is worth less as time runs out. | color key

The value of exploring isn't fixed. It shrinks as the time ahead of you shrinks.

## Win, stay

> SCENE (line): Win-stay, lose-shift.
> Win: stay. Lose: shift.

[calm] There's a simple starting point too. In 1952, the mathematician Herbert Robbins described a strategy called win-stay, lose-shift. Pick an option. If it works, keep using it. If it fails, switch to another.

> SCENE (photo): A plate at a restaurant.
> dinner | One bad evening shouldn't end it. | color key

[calm] It's not perfect. One bad evening at a great restaurant shouldn't end the relationship. But it beats choosing at random, and it's a fair way to begin.

> SCENE (photo): A door, slightly open.
> path-dawn | Be optimistic about what you don't know yet. | color key @ be optimistic
> road-wind |  | color @ could be great

Later, mathematicians found better methods. One of the best is simple to say: be optimistic about what you don't know yet. An option you've hardly tried could be great, so give it the benefit of the doubt, until the evidence says otherwise.

## Michigan, the 1980s

> SCENE (photo): A hospital corridor.
> hospital | Every patient is a pull of the arm. | color key

[calm] The same question matters far beyond restaurants. In medicine, every patient in a trial is a pull of the arm. Give a treatment to learn about it, or give the one that already seems to work?

> SCENE (place): Ann Arbor.
> ann-arbor | ANN ARBOR, MICHIGAN | the early 1980s

[warmly] In the early 1980s, a team at the University of Michigan, led by Robert Bartlett, was testing a new machine for newborn babies whose lungs were failing. It took over the work of the lungs, so they could rest and heal. The babies in the study were so ill that most were expected to die with the usual treatment.

> SCENE (photo): A heart-lung machine; an incubator.
> ecmo | Play the winner | color key @ play-the-winner
> incubator |  | color @ Every time a treatment worked

[calm] Instead of splitting the babies half and half, the team used a play-the-winner design. Every time a treatment worked, the chances rose that the next baby would get it too.

> SCENE (stat): The 1985 result.
> bg | incubator2
> 11 of 11 | survived with the new machine @ all eleven survived
> 1985 | published in Pediatrics @ published

[calm] The first baby given the usual treatment died. The next eleven were given the new machine, and all eleven survived. They published the result in 1985. The trial is still argued about today, and doctors ran bigger trials afterwards. But it showed the idea clearly: you can keep learning, and still give most people the option that's doing best.

## Why older people stick to favourites

> SCENE (photo): An older couple at a café.
> omni-older-couple | Fewer casual friends. As many close ones. | color key @ fewer casual friends

[calm] This rule explains something about growing older. Studies led by the psychologist Laura Carstensen at Stanford found that older people have fewer casual friends, but about as many close ones as younger people. And they're mostly happy with that.

> SCENE (photo): Friends laughing at a table.
> friends | Young people explore. Older people enjoy. Both are right. | color key @ Young people should explore

[calm] It's easy to see that as getting set in their ways. The maths says something kinder. With less time ahead, exploring pays off less, so you spend your time on the people you already know are good for you. Young people should explore. Older people should enjoy what they've found. Both are doing it right.

## Three everyday uses

> SCENE (photo): A city street, new arrivals.
> arrival | New city? Say yes to everything. | color key
> city-night |  | color @ new cafés

A new city. In your first months, say yes to everything: new cafés, new routes, new people. That's when discoveries pay off longest.

> SCENE (photo): An office.
> office | Early career: try. Later: build. | color key

Your career. Early on, try different roles and teams, even sideways moves. Later, build on what you're best at.

> SCENE (photo): A café you love.
> omni-last-visit | A last visit? Order the dish you know. | color key

[warmly] And a last visit. If you're leaving a place, or seeing a friend for the last time in a while, don't experiment. Go back to the café you love. Order the dish you know.

## The takeaway

> SCENE (horizon): A lifetime of evenings: new places early, favourites late.

[calm] So the question isn't "new or familiar?" It's "how long do I have?" A lot of time ahead: explore. Not much time left: enjoy the best you've found.

> SCENE (line): The key line.
> Explore early. Enjoy late.

[calm] Explore early. Enjoy late.

> SCENE (photo): a messy desk.
> desk | Next: why a messy desk can be smart. | color key @ Next time

[calm] This idea comes from the book Algorithms to Live By, by Brian Christian and Tom Griffiths. The link is in the description. Next time on Logic to Live By: why a messy desk can be smart, and when tidying up is a waste of time.

> SCENE (end): Closing card.
