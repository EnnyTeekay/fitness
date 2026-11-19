# SweatsApp — simple HTML version

Plain files you can open and edit in VS Code (or any code editor). No installs, no build step.

```
index.html        For You page
coach.html        For Coaches page
gym.html          For Gyms page
css/styles.css    All styling (colours, sizes, spacing, fonts)
js/script.js      Menus, scroll effects, section navigator and waitlist form
images/           Every photo and logo used on the site
favicon.png       Browser tab icon
```

## The code is fully readable
Every file is formatted with one tag per line (index.html ≈ 1,240 lines, coach.html ≈ 1,320,
gym.html ≈ 1,310, css/styles.css ≈ 5,850, js/script.js ≈ 220). Nothing is hidden or loaded from
elsewhere except the Google fonts.

Where to find things (use Ctrl/Cmd + F in VS Code):
- Page headline: search `<h1`
- Section photos: search `images/`
- Workout boxes (At home, In the gym...): search `workout-place`
- FAQs: search `<details`
- Footer and social links: search `site-footer`
- Page colours: in css/styles.css search `.user-theme`, `.coach-theme`, `.gym-theme`
- Workout box colours: in css/styles.css search `--workout-home`

## Edit
1. Open this folder in VS Code (File → Open Folder).
2. Change words directly in the `.html` files. Change colours in `css/styles.css`
   (search for `.user-theme`, `.coach-theme` or `.gym-theme`).
3. Swap a photo: put the new file in `images/` and change the matching `src="images/..."`.
4. Preview: install the "Live Server" extension in VS Code, right-click `index.html` → "Open with Live Server".

## Waitlist
The forms save emails to your SweatsApp waitlist and email team@sweats.app for every signup.
They send to the address at the top of `js/script.js` (`WAITLIST_ENDPOINT`).
Leave that address unchanged when you host on GitHub Pages or Vercel. It points at the Lovable site,
which only runs the sign-up service in the background, so keep it published even if visitors use your own host.
Duplicate emails show "You have already joined the waitlist".

## Deploy with GitHub Pages
1. Create a new repository on github.com and upload the contents of this folder (index.html at the top level).
2. Repository → Settings → Pages → Source: "Deploy from a branch" → branch `main`, folder `/ (root)` → Save.
3. Your site appears at `https://<your-username>.github.io/<repo-name>/` within a minute or two.
4. Custom domain (Namecheap): in Settings → Pages add `sweats.app`, then at Namecheap → Advanced DNS add
   A records `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 and a CNAME `www` → `<your-username>.github.io`.
   (Remove the Lovable A records for sweats.app if you switch to GitHub Pages.)

## Deploy with Vercel
1. vercel.com → Add New → Project → import the GitHub repository above (or drag this folder in).
2. Framework preset: "Other". No build command. Output directory: leave empty.
3. Deploy, then add `sweats.app` under Project → Settings → Domains and follow the DNS steps shown.
