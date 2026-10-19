# The Pace Project Goa — Run Club website

Community website for **The Pace Project Goa**, a South Goa run club founded in October 2025 by Alex C
([@thepaceprojectgoa](https://www.instagram.com/thepaceprojectgoa/)).

Tagline: **Run. Connect. Repeat.**

## What's on the site

- Dark (black / red) and light (white / red) themes. Follows the system preference, remembers your choice.
- Live countdown to the next Sunday sunrise run (6:00 AM IST), with a "we're running right now" state.
- What the club does: Sunday community runs, long runs, beach HIIT, HYROX training, race prep, hikes.
- Run Rave: the signature run-plus-DJ-truck event, including the upcoming Winter Rave Run × Iron Bunker.
- Events calendar with upcoming / past filters, compiled from the club's Instagram and Endorfin listings.
- Routes and pace groups, plus a pace calculator with Riegel projections across 5K, 10K, half and full.
- Live Instagram embeds from the club's feed, community voices, partners.
- FAQ and three ways to join: the club form, Endorfin RSVP, Instagram DM. Contact form runs on Netlify Forms.

## Stack

Plain HTML, CSS and JavaScript. No build step. Fonts from Google Fonts (Bebas Neue, Manrope).

```
index.html        page
css/styles.css    theme tokens, layout, components
js/main.js        theme toggle, countdown, filters, pace calculator, embeds, form
assets/           logo, favicon, social image
netlify.toml      publish dir and headers
```

## Run locally

Any static server works:

```bash
npx serve .
```

## Deploy

The site is deployed on Netlify from this repo. Pushing to `main` redeploys.

## Sources

Club details come from the club's public Instagram profile and posts, the founder's profile, and the
club's Endorfin listing. Race dates for HYROX and I-Run Goa come from the organisers' public pages.
This is a fan-built community site and is not affiliated with HYROX, Procam or Endorfin.
