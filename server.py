# -*- coding: utf-8 -*-
"""
Serveur local Design MH (sans dépendance).
Lancer :  python server.py
Puis ouvrir :  http://localhost:8000        (site public)
               http://localhost:8000/admin.html  (back-office)

IMPORTANT : changez le mot de passe MOT_DE_PASSE ci-dessous avant toute mise en ligne.
Ce serveur est prévu pour un usage LOCAL. Pour un site public en ligne,
il faudra un hébergement + une authentification renforcée.
"""
import os, json, base64, re, time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data.json")
IMG = os.path.join(ROOT, "images")
MOT_DE_PASSE = "designmh2026"   # <-- À CHANGER
PORT = 8000

os.makedirs(IMG, exist_ok=True)

EXT_OK = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}


class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _auth_ok(self):
        return self.headers.get("X-Auth", "") == MOT_DE_PASSE

    def do_GET(self):
        if self.path.split("?")[0] == "/api/data":
            try:
                with open(DATA, encoding="utf-8") as f:
                    self._json(200, json.load(f))
            except Exception as e:
                self._json(500, {"error": str(e)})
            return
        return super().do_GET()

    def do_POST(self):
        path = self.path.split("?")[0]
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b""
        if not self._auth_ok():
            return self._json(401, {"error": "Mot de passe incorrect"})
        try:
            payload = json.loads(raw.decode("utf-8")) if raw else {}
        except Exception:
            return self._json(400, {"error": "JSON invalide"})

        if path == "/api/data":
            # sauvegarde de secours puis écriture
            try:
                if os.path.exists(DATA):
                    with open(DATA, encoding="utf-8") as f:
                        bak = f.read()
                    with open(os.path.join(ROOT, "data.backup.json"), "w", encoding="utf-8") as f:
                        f.write(bak)
                with open(DATA, "w", encoding="utf-8") as f:
                    json.dump(payload, f, ensure_ascii=False, indent=2)
                return self._json(200, {"ok": True})
            except Exception as e:
                return self._json(500, {"error": str(e)})

        if path == "/api/upload":
            durl = payload.get("dataUrl", "")
            m = re.match(r"data:([^;]+);base64,(.*)$", durl, re.S)
            if not m:
                return self._json(400, {"error": "Image invalide"})
            mime, b64 = m.group(1), m.group(2)
            ext = EXT_OK.get(mime.lower())
            if not ext:
                return self._json(400, {"error": "Format non supporté"})
            base = re.sub(r"[^a-zA-Z0-9_-]", "-", os.path.splitext(payload.get("name", "img"))[0])[:40] or "img"
            fname = "up-%s-%d.%s" % (base, int(time.time() * 1000) % 1000000, ext)
            try:
                with open(os.path.join(IMG, fname), "wb") as f:
                    f.write(base64.b64decode(b64))
                return self._json(200, {"path": "images/" + fname})
            except Exception as e:
                return self._json(500, {"error": str(e)})

        return self._json(404, {"error": "Route inconnue"})

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    print("Design MH — serveur sur http://localhost:%d" % PORT)
    print("  Site   : http://localhost:%d/" % PORT)
    print("  Admin  : http://localhost:%d/admin.html" % PORT)
    print("  Mot de passe admin : %s  (à changer dans server.py)" % MOT_DE_PASSE)
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
