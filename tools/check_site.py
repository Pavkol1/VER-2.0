#!/usr/bin/env python3
"""
Stories Hotel — pre-commit site check.

Catches the mistakes that are objectively verifiable and that this repo is
structurally prone to: twenty self-contained pages, each with its own inline
CSS and JS, and an English/Hungarian pair that must stay in step.

It checks facts, never taste. Design quality is the `impeccable` skill's job.

Standard library only, so it runs on the MacBook and the reception PC alike.
Node is used for JavaScript syntax only if it happens to be on PATH; without
it that one check reports itself as skipped rather than silently passing.

    python3 tools/check_site.py            # full report
    python3 tools/check_site.py --quiet    # only problems

Exit code 0 = clean, 1 = problems found.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from collections import Counter
from html.parser import HTMLParser
from xml.etree import ElementTree

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(REPO, "Ver3")
DOMAIN = "https://secrethotel.netlify.app/"

# Void elements never close, so they must not take part in tag balancing.
VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}
# Attributes whose value is a path to a file we ship.
PATH_ATTRS = {"src", "href", "poster", "data-src"}
# Pages deliberately kept out of the index, and therefore out of the sitemap.
EXPECT_NOINDEX = {"404.html", "room-service.html"}


# --------------------------------------------------------------------------
# Parsing
# --------------------------------------------------------------------------

class Page(HTMLParser):
    """One pass over a page, collecting everything the checks need."""

    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path                       # e.g. "hu/rooms.html"
        self.dir = os.path.dirname(path)
        self.ids = []                          # [(id, line)]
        self.refs = []                         # [(url, line, why)]
        self.anchors = []                      # [(target, line)]
        self.aria = []                         # [(attr, token, line)]
        self.labels = []                       # [(for, line)]
        self.scripts = []                      # [(code, line, type)]
        self.unbalanced = []                   # [(tag, line, kind)]
        self.tag_counts = Counter()
        self.lang = None
        self.canonical = None
        self.alternates = []                   # [(hreflang, href)]
        self.robots = None
        self.menu_links = []                   # texts inside <div class="nav-links">
        self.foot_links = []                   # [(text, href)] inside <footer>
        self.lang_switch = set()               # where a language switch was found
        self._stack = []
        self._svg_depth = 0
        self._script = None
        self._capture = None                   # 'menu' | 'foot' | None
        self._text_for = None                  # accumulate <a> text
        self.feed(open(os.path.join(SITE, path), encoding="utf-8").read())
        for tag, line in self._stack:
            self.unbalanced.append((tag, line, "never closed"))

    # -- helpers ----------------------------------------------------------
    def _add_ref(self, url, why):
        if url:
            self.refs.append((url.strip(), self.getpos()[0], why))

    # -- HTMLParser hooks -------------------------------------------------
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        line = self.getpos()[0]

        if tag == "svg":
            self._svg_depth += 1
        if tag == "script":
            self._script = (line, a.get("type", "js"), [])
        if self._svg_depth == 0 and tag not in VOID:
            self._stack.append((tag, line))
        if self._svg_depth == 0:
            self.tag_counts[tag] += 1

        if a.get("id"):
            self.ids.append((a["id"], line))
        if tag == "html" and a.get("lang"):
            self.lang = a["lang"]

        for attr in PATH_ATTRS:
            v = a.get(attr)
            if not v:
                continue
            if attr == "href" and v.startswith("#"):
                self.anchors.append((v[1:], line))
            else:
                self._add_ref(v, attr)
        if a.get("srcset"):
            for part in a["srcset"].split(","):
                self._add_ref(part.strip().split(" ")[0], "srcset")
        if a.get("style") and "url(" in a["style"]:
            for m in re.findall(r"url\(['\"]?([^'\")]+)['\"]?\)", a["style"]):
                self._add_ref(m, "style url()")

        for attr in ("aria-controls", "aria-labelledby", "aria-describedby"):
            if a.get(attr):
                for token in a[attr].split():
                    self.aria.append((attr, token, line))
        if tag == "label" and a.get("for"):
            self.labels.append((a["for"], line))

        if tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        if tag == "link" and a.get("rel") == "alternate" and a.get("hreflang"):
            self.alternates.append((a["hreflang"], a.get("href", "")))
        if tag == "meta" and a.get("name") == "robots":
            self.robots = a.get("content", "")
        # og:image / twitter:image are the only metas that name a file
        if tag == "meta" and a.get("content"):
            key = a.get("property") or a.get("name") or ""
            if key in ("og:image", "twitter:image"):
                self._add_ref(a["content"], key)

        cls = a.get("class") or ""
        if "nav-links" in cls:
            self._capture = "menu"
        if tag == "footer":
            self._capture = "foot"
        if tag == "a" and self._capture:
            self._text_for = [a.get("href", ""), ""]
        # A language switch is any element offering the other language.
        if "lang-toggle" in cls:
            self.lang_switch.add("nav")
        if "mnav-lang" in cls:
            self.lang_switch.add("mobile menu")
        if "foot-lang" in cls:
            self.lang_switch.add("footer")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self._svg_depth and tag == "svg":
            self._svg_depth -= 1

    def handle_endtag(self, tag):
        line = self.getpos()[0]
        if tag == "script" and self._script:
            start, stype, buf = self._script
            self.scripts.append(("".join(buf), start, stype))
            self._script = None
        if tag == "a" and self._text_for is not None:
            href, text = self._text_for
            label = " ".join(text.split())[:40]
            if self._capture == "menu":
                self.menu_links.append(label)
            else:
                self.foot_links.append((label, href))
            self._text_for = None
        if tag in ("nav", "footer", "div") and self._capture == "menu" and tag == "div":
            self._capture = None
        elif tag == "footer" and self._capture == "foot":
            self._capture = None
        if tag == "svg" and self._svg_depth:
            self._svg_depth -= 1
            return
        if self._svg_depth or tag in VOID:
            return
        if self._stack and self._stack[-1][0] == tag:
            self._stack.pop()
        elif any(t == tag for t, _ in self._stack):
            while self._stack and self._stack[-1][0] != tag:
                bad, bl = self._stack.pop()
                self.unbalanced.append((bad, bl, "never closed"))
            self._stack.pop()
        else:
            self.unbalanced.append((tag, line, "stray closing tag"))

    def handle_data(self, data):
        if self._script is not None:
            self._script[2].append(data)
        if self._text_for is not None:
            self._text_for[1] += data


def resolve(url, page_dir):
    """Absolute filesystem path for a local reference, or None if not local."""
    u = url.split("#")[0].split("?")[0].strip()
    if not u:
        return None
    if u.startswith(DOMAIN):
        return os.path.join(SITE, u[len(DOMAIN):])
    if u.startswith(("http://", "https://", "mailto:", "tel:", "data:", "//", "javascript:")):
        return None
    if u.startswith("/"):
        return os.path.join(SITE, u.lstrip("/"))
    return os.path.normpath(os.path.join(SITE, page_dir, u))


def strip_js_comments(code):
    code = re.sub(r"/\*.*?\*/", "", code, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", "", code)


# --------------------------------------------------------------------------
# Checks
# --------------------------------------------------------------------------

def check_references(pages, out):
    """Every local file a page points at must exist."""
    # Frame sequences are built in JS: 'assets/coffee/frame_' + pad(n) + '.webp'
    for p in pages:
        for code, line, _ in p.scripts:
            for base in re.findall(r"['\"]((?:[\w./-]*/)?[\w-]*frame_)['\"]\s*\+", code):
                n = re.search(r"n:\s*(\d+)", code)
                total = int(n.group(1)) if n else 0
                for i in range(1, total + 1):
                    p.refs.append((f"{base}{i:03d}.webp", line, "built in JS"))
    for p in pages:
        for url, line, why in p.refs:
            path = resolve(url, p.dir)
            if path and not os.path.exists(path):
                out(f"{p.path}:{line}  missing file ({why}): {url}")


def check_anchors(pages, out):
    by_path = {p.path: {i for i, _ in p.ids} for p in pages}
    for p in pages:
        own = by_path[p.path]
        for target, line in p.anchors:
            if target and target not in own:
                out(f"{p.path}:{line}  #{target} — no element with that id on this page")
        for url, line, why in p.refs:
            if why != "href" or "#" not in url:
                continue
            file_part, frag = url.split("#", 1)
            if not file_part or not frag:
                continue
            tgt = resolve(file_part, p.dir)
            if not tgt or not os.path.exists(tgt):
                continue
            rel = os.path.relpath(tgt, SITE).replace(os.sep, "/")
            if rel in by_path and frag not in by_path[rel]:
                out(f"{p.path}:{line}  {url} — target page has no id '{frag}'")


def check_ids(pages, out):
    for p in pages:
        seen = Counter(i for i, _ in p.ids)
        for name, n in seen.items():
            if n > 1:
                lines = [str(l) for i, l in p.ids if i == name]
                out(f"{p.path}  id='{name}' used {n}× (lines {', '.join(lines)})")


def check_wiring(pages, out):
    """getElementById, label[for] and aria-* must point at ids that exist."""
    for p in pages:
        own = {i for i, _ in p.ids}
        for code, line, stype in p.scripts:
            if "ld+json" in stype:
                continue
            for name in set(re.findall(r"getElementById\(\s*['\"]([^'\"]+)['\"]", code)):
                if name not in own:
                    out(f"{p.path}:{line}  getElementById('{name}') — no such id")
        for target, line in p.labels:
            if target not in own:
                out(f"{p.path}:{line}  <label for='{target}'> — no such id")
        for attr, token, line in p.aria:
            if token not in own:
                out(f"{p.path}:{line}  {attr}='{token}' — no such id")


def check_structured_data(pages, out):
    for p in pages:
        for code, line, stype in p.scripts:
            if "ld+json" not in stype:
                continue
            try:
                json.loads(code)
            except Exception as e:
                out(f"{p.path}:{line}  invalid JSON-LD: {e}")


def check_balance(pages, out):
    for p in pages:
        for tag, line, kind in p.unbalanced:
            out(f"{p.path}:{line}  <{tag}> {kind}")


def check_dom_safety(pages, out):
    """The project rule: textContent only. Comments mentioning it are fine."""
    for p in pages:
        for code, line, stype in p.scripts:
            if "ld+json" in stype:
                continue
            clean = strip_js_comments(code)
            for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write"):
                if bad in clean:
                    out(f"{p.path}:{line}  {bad} used — the project requires textContent")


def check_js_syntax(pages, out, note):
    if not shutil.which("node"):
        note("JavaScript syntax: skipped (node is not on PATH)")
        return
    # The shared layers are copied verbatim into all twenty pages, so most
    # blocks are byte-identical. Check each distinct block once.
    seen = {}
    spawns = 0
    for p in pages:
        for code, line, stype in p.scripts:
            if "ld+json" in stype or not code.strip():
                continue
            key = hash(code)
            if key in seen:
                if seen[key] is not None:
                    out(f"{p.path}:{line}  JavaScript: {seen[key]}")
                continue
            spawns += 1
            fd, tmp = tempfile.mkstemp(suffix=".js")
            with os.fdopen(fd, "w", encoding="utf-8") as fh:
                fh.write(code)
            r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
            os.unlink(tmp)
            if r.returncode:
                # node reports against the temp file; keep the message, drop the
                # path, and translate its line number back into the page.
                msg, at = "syntax error", ""
                for ln in r.stderr.splitlines():
                    m = re.match(re.escape(tmp) + r":(\d+)", ln.strip())
                    if m:
                        at = f" near page line {line + int(m.group(1)) - 1}"
                    elif re.match(r"^\w*Error: ", ln.strip()):
                        msg = ln.strip()
                seen[key] = f"{msg}{at}"
                out(f"{p.path}:{line}  JavaScript: {msg}{at}")
            else:
                seen[key] = None
    note(f"{spawns} distinct blocks checked")


def check_i18n(pages, out):
    """lang, self-canonical and reciprocal hreflang on every indexable page."""
    for p in pages:
        if p.path in EXPECT_NOINDEX:
            continue
        want_lang = "hu" if p.path.startswith("hu/") else "en"
        if p.lang != want_lang:
            out(f"{p.path}  <html lang='{p.lang}'> — expected '{want_lang}'")
        if not p.canonical:
            out(f"{p.path}  no canonical link")
        else:
            tail = p.canonical.replace(DOMAIN, "/")
            want = "/" + p.path
            if p.path == "index.html":
                want = "/"
            elif p.path == "hu/index.html":
                want = "/hu/"
            if tail.rstrip("/") != want.rstrip("/"):
                out(f"{p.path}  canonical is {tail} — expected {want}")
        codes = {c for c, _ in p.alternates}
        for needed in ("en", "hu", "x-default"):
            if needed not in codes:
                out(f"{p.path}  hreflang missing '{needed}' (has: {sorted(codes) or 'none'})")
        for code, href in p.alternates:
            tgt = resolve(href, p.dir)
            if tgt and not os.path.exists(tgt) and not href.rstrip("/").endswith(("/hu", DOMAIN.rstrip("/"))):
                probe = os.path.join(tgt, "index.html")
                if not os.path.exists(probe):
                    out(f"{p.path}  hreflang='{code}' points at {href} — no such page")


def check_language_parity(pages, out):
    """English and Hungarian must stay the same shape, page for page."""
    en = {p.path: p for p in pages if not p.path.startswith("hu/") and p.path not in EXPECT_NOINDEX}
    hu = {p.path[3:]: p for p in pages if p.path.startswith("hu/")}
    for name in sorted(set(en) - set(hu)):
        out(f"hu/{name} is missing — {name} has no Hungarian equivalent")
    for name in sorted(set(hu) - set(en)):
        out(f"{name} is missing — hu/{name} has no English equivalent")
    for name in sorted(set(en) & set(hu)):
        a, b = en[name], hu[name]
        for tag in ("h1", "h2", "h3", "section", "img", "a", "button", "form", "input"):
            if a.tag_counts[tag] != b.tag_counts[tag]:
                out(f"{name} vs hu/{name}  <{tag}>: {a.tag_counts[tag]} in English, "
                    f"{b.tag_counts[tag]} in Hungarian")


def check_shared_blocks(pages, out):
    """The menu and footer are copied into all twenty pages; they must not drift.

    Only the menu items and footer link texts are compared. Hrefs legitimately
    differ per page (the language switch points at the page you are on), and
    the homepage nav carries the wordmark that subpages draw with the separate
    logo-stage system. Special-purpose surfaces are left out entirely.
    """
    ordinary = [p for p in pages if p.path not in EXPECT_NOINDEX]
    for label, attr, texts_only in (("menu", "menu_links", True),
                                    ("footer", "foot_links", False)):
        shapes = {}
        for p in ordinary:
            links = getattr(p, attr)
            if not links:
                continue
            lang = "hu" if p.path.startswith("hu/") else "en"
            shape = tuple(links) if texts_only else tuple(t for t, _ in links)
            shapes.setdefault(lang, {})[p.path] = shape
        for lang, group in shapes.items():
            counts = Counter(group.values())
            if len(counts) < 2:
                continue
            majority, _ = counts.most_common(1)[0]
            for path, shape in group.items():
                if shape == majority:
                    continue
                extra = [x for x in shape if x not in majority]
                gone = [x for x in majority if x not in shape]
                detail = []
                if extra:
                    detail.append(f"extra {extra}")
                if gone:
                    detail.append(f"missing {gone}")
                out(f"{path}  {label} differs from the other {lang} pages: "
                    f"{'; '.join(detail) or 'different order'}")


def check_language_switch(pages, out):
    """Every page must let a visitor reach the other language from somewhere."""
    for p in pages:
        if p.path in EXPECT_NOINDEX:
            continue
        if not p.lang_switch:
            out(f"{p.path}  offers no way to switch language")


def check_sitemap(pages, out, note):
    sm = os.path.join(SITE, "sitemap.xml")
    if not os.path.exists(sm):
        out("sitemap.xml is missing")
        return
    try:
        root = ElementTree.parse(sm).getroot()
    except Exception as e:
        out(f"sitemap.xml does not parse: {e}")
        return
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = [e.text.strip() for e in root.findall(".//s:loc", ns) if e.text]
    listed = set()
    for loc in locs:
        rel = loc.replace(DOMAIN, "")
        rel = rel or "index.html"
        if rel.endswith("/"):
            rel += "index.html"
        listed.add(rel)
        if not os.path.exists(os.path.join(SITE, rel)):
            out(f"sitemap.xml lists {loc} — no such page")
    for p in pages:
        noindex = "noindex" in (p.robots or "")
        if noindex and p.path in listed:
            out(f"sitemap.xml lists {p.path}, but the page is noindex")
        if not noindex and p.path not in listed and p.path not in EXPECT_NOINDEX:
            out(f"{p.path} is indexable but absent from sitemap.xml")
    for name in sorted(EXPECT_NOINDEX):
        page = next((p for p in pages if p.path == name), None)
        if page and "noindex" not in (page.robots or ""):
            out(f"{name} should carry <meta name='robots' content='noindex'>")
    note(f"sitemap: {len(locs)} URLs")


# --------------------------------------------------------------------------

CHECKS = [
    ("broken references", check_references),
    ("anchors", check_anchors),
    ("duplicate ids", check_ids),
    ("script / label / aria wiring", check_wiring),
    ("structured data", check_structured_data),
    ("tag balance", check_balance),
    ("DOM safety (no innerHTML)", check_dom_safety),
    ("JavaScript syntax", check_js_syntax),
    ("language metadata", check_i18n),
    ("English / Hungarian parity", check_language_parity),
    ("shared menu + footer", check_shared_blocks),
    ("language switch reachable", check_language_switch),
    ("sitemap", check_sitemap),
]


def main():
    ap = argparse.ArgumentParser(description="Pre-commit check for the Stories site.")
    ap.add_argument("--quiet", action="store_true", help="print problems only")
    args = ap.parse_args()

    if not os.path.isdir(SITE):
        print(f"Ver3 not found at {SITE}")
        return 2

    paths = sorted(f for f in os.listdir(SITE) if f.endswith(".html"))
    hu_dir = os.path.join(SITE, "hu")
    if os.path.isdir(hu_dir):
        paths += sorted("hu/" + f for f in os.listdir(hu_dir) if f.endswith(".html"))
    pages = [Page(p) for p in paths]

    if not args.quiet:
        print(f"Stories site check — {len(pages)} pages under Ver3/\n")

    total = 0
    for title, fn in CHECKS:
        found = []
        notes = []
        if fn in (check_js_syntax, check_sitemap):
            fn(pages, found.append, notes.append)
        else:
            fn(pages, found.append)
        total += len(found)
        if found:
            print(f"  {title.upper()} — {len(found)} problem(s)")
            for f in found:
                print(f"      {f}")
            print()
        elif not args.quiet:
            tail = f"  ({notes[0]})" if notes else ""
            print(f"  ok   {title}{tail}")

    if total:
        print(f"\n{total} problem(s) found.")
        return 1
    if not args.quiet:
        print("\nAll checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
