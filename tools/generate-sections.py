#!/usr/bin/env python3
"""Generate per-section static HTML pages from site/data/sections.json

Creates site/<category>.html for each category found in the manifest.
"""
import json
from pathlib import Path
import html

ROOT = Path(__file__).resolve().parents[1] / 'site'
DATA = ROOT / 'data' / 'sections.json'

NAV_LINKS = [
  ('frack-county', 'Frack County'),
  ('dnc', 'Democratic National Convention'),
  ('weld-county', 'Weld County Documentary Project'),
  ('patriotism', 'Patriotism'),
  ('portraits', 'Portraits'),
  ('misc', 'Misc Work'),
  ('student-work', 'Student Work'),
]

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{title} — Karl Dukstein</title>
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <div class="brand">KARL DUKSTEIN</div>
      <nav class="main-nav">
        <button class="menu-toggle" aria-label="Open menu">☰</button>
        <ul class="nav-list">
          <li><a href="/about.html">About</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <aside class="site-sidebar">
    <div class="sidebar-inner">
      <div class="brand">KARL DUKSTEIN</div>
      <nav class="main-nav">
        <ul class="nav-list">
{nav_links}
        </ul>
      </nav>
    </div>
  </aside>

  <main>
    <section class="hero" id="hero">
      {hero_html}
      <div class="hero-overlay">
        <h1>{title}</h1>
      </div>
    </section>

    <div class="container">
      <section class="section">
        <h2>{title}</h2>
        <div class="grid" data-section="{key}"></div>
        <nav class="pagination" aria-label="Pagination"></nav>
      </section>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container">
      <div>© KARL DUKSTEIN • <a href="/contact.html">Contact</a></div>
    </div>
  </footer>

  <div id="lightbox" class="lightbox" aria-hidden="true">
    <button class="lb-close" aria-label="Close">✕</button>
    <button class="lb-prev" aria-label="Previous">◀</button>
    <div class="lb-image-wrap"><img class="lb-image" src="" alt=""></div>
    <div class="lb-counter"></div>
    <button class="lb-next" aria-label="Next">▶</button>
  </div>

  <script src="/assets/js/lightbox.js" defer></script>
  <script src="/assets/js/main.js" defer></script>
</body>
</html>
"""


def make_nav_links():
    out = []
    for key, label in NAV_LINKS:
        out.append(f'          <li><a href="/{key}.html">{html.escape(label)}</a></li>')
    return "\n".join(out)


def pick_hero(items):
    # return HTML for hero picture if available
    if not items:
        return ''
    hero = next((it for it in items if it.get('hero')), items[0])
    if not hero:
        return ''
    # prefer webp source if present
    src = ''
    if hero.get('full_webp'):
        src = f'<source srcset="/{html.escape(hero["full_webp"])}" type="image/webp">\n'
    if hero.get('full_jpg'):
        src += f'<img src="/{html.escape(hero["full_jpg"])}" alt="{html.escape(hero.get("alt",""))}" loading="lazy">'
    elif hero.get('full_webp'):
        src += f'<img src="/{html.escape(hero["full_webp"])}" alt="{html.escape(hero.get("alt",""))}" loading="lazy">'
    return src


def main():
    with open(DATA, 'r', encoding='utf-8') as f:
        data = json.load(f)

    nav_links = make_nav_links()

    for key in data.keys():
        # use label from NAV_LINKS mapping if present, otherwise friendly title
        label = dict(NAV_LINKS).get(key, key.replace('-', ' ').title())
        hero_html = pick_hero(data.get(key, []))
        out = TEMPLATE.format(title=html.escape(label), hero_html=hero_html or '', key=html.escape(key), nav_links=nav_links)
        path = ROOT / f"{key}.html"
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(out)
        print('Wrote', path)


if __name__ == '__main__':
    main()
