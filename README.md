# ZSF Logo Research — online survey

Two pieces:

- **`index.html`** — the survey page (hosted free on GitHub Pages)
- **`Code.gs`** — a tiny Google Apps Script that receives each response, adds a row to a Google Sheet, and saves the drawing as a PNG in Google Drive

Respondents don't need any account. Only you see the answers.

---

## 1. Set up the Google Sheet (≈5 min)

1. Create a new Google Sheet, e.g. "ZSF Logo Research – Responses".
2. **Extensions → Apps Script**. Delete what's there and paste in all of `Code.gs`. Save.
3. **Deploy → New deployment** → click the gear → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**, then **Authorize access** and allow it.
   (Google shows an "unverified app" warning because it's your own script — click *Advanced → Go to … (unsafe)*. It only touches this sheet and the drawings folder it creates.)
5. Copy the **Web app URL** (ends in `/exec`). Open it in a browser — you should see `"ZSF survey receiver is running."`

## 2. Connect the page

Open `index.html`, find this line near the top, and paste your URL in:

```js
const SUBMIT_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";
```

## 3. Put it on GitHub Pages

1. Create a new repo (e.g. `zsf-survey`) and upload `index.html` **and the `images` folder** (the shape examples live there).
2. Repo **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. After a minute your link is `https://<your-username>.github.io/zsf-survey/`.

## 4. Test it

Submit one test response from your phone. Check that:
- a **Responses** tab appears in the Sheet with your answers, and
- a Drive folder **"ZSF Logo Research – Drawings"** has the PNG (linked from the row).

Delete the test row/file afterwards.

---

### Notes

- **Changing `Code.gs` later?** Use **Deploy → Manage deployments → Edit → Version: New version**. That keeps the same URL. ("New deployment" gives a new URL you'd have to paste in again.)
- **Collecting the paper sheets too?** Type them into the same Sheet so everything is in one place; scan the drawings into the Drive folder.
- **Closing the survey:** in Apps Script, Deploy → Manage deployments → Archive. The page will stop saving responses.
- The page can't confirm Google actually saved a response (a browser limitation with Apps Script), so do the test in step 4.
