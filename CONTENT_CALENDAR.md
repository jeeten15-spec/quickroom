# QuickRoom content calendar (every two weeks)

Permanent playbook for SEO pages that attract **VPN, finance, dating, iGaming, and utility** buyers in the **USA, UK, Canada, and Western Europe**. Refresh this file when you add or retire a seasonal article.

## Cadence

- **Every 14 days:** scan `frontend/src/seasonal-calendar.js`, publish or update anything whose `writeFrom` date has passed, and bump `updatedAt` on live seasonal posts.
- **Four weeks before** a sports final, festival, or civic event: ship a witty article that uses the search phrases in `keywords`, in **English, French, and Spanish**.
- Keep QuickRoom honest: 18+ only, no K–12, rooms expire, ads stay off Create/Join and off the live transcript. Do **not** restore Monetag OnClick / pop-under.

## Seasonal bid calendar

| Window | Push these commercial themes | Why |
| --- | --- | --- |
| **Oct–Dec** | Finance, gifts, VPN “travel/privacy,” insurance | Advertiser bids jump (holidays, year-end money, travel). |
| **Jan** | Diets, finance resets, dating | CPM dips then recovers; New Year intent is high. |
| **Sports seasons / elections / crypto rallies** | Supporting watch-party, family-peace, and “don’t turn WhatsApp into a war room” pages | Fast-moving intent; spin pages quickly, then update the same URL rather than spawning duplicates. |

## Live URLs (this cycle)

English hubs: `/blog`, `/blog/seasonal-group-chat-calendar`.  
French: `/fr/blog`. Spanish: `/es/blog`.

When you add a new event pack, add the EN/FR/ES slugs to `frontend/src/lang.js` triplets and `frontend/src/related.js`.
