# Running the Project

Due to browser security restrictions (CORS), you need to run a local web server instead of opening the HTML file directly.

## Option 1: Python (Recommended)

If you have Python installed:

```bash
python3 server.py
```

Then open http://localhost:8000 in your browser.

## Option 2: Python One-liner

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Option 3: Node.js (if you have Node installed)

```bash
npx http-server -p 8000
```

Then open http://localhost:8000 in your browser.

## Option 4: VS Code Live Server

If you're using VS Code, install the "Live Server" extension and right-click on `index.html` → "Open with Live Server"

---

**Why?** Browsers block loading audio files from `file://` URLs due to CORS security policies. A local HTTP server solves this.
