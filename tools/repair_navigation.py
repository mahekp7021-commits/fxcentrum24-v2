from pathlib import Path
import re
import os

ROOT = Path(__file__).resolve().parents[1]

ROUTES = {
    'Forex': 'markets/forex.html',
    'Commodities': 'markets/commodities.html',
    'Indices': 'markets/indices.html',
    'Shares CFDs': 'markets/shares-cfds.html',
    'Cryptocurrency': 'markets/cryptocurrency.html',
    'MT4': 'platforms/metatrader-4.html',
    'MT5': 'platforms/metatrader-5.html',
    'MetaTrader 4': 'platforms/metatrader-4.html',
    'MetaTrader 5': 'platforms/metatrader-5.html',
    'WebTrader': 'platforms/webtrader.html',
    'Standard': 'accounts/standard.html',
    'Premium': 'accounts/premium.html',
    'Professional': 'accounts/professional.html',
    'Live Markets': 'tools/live-markets.html',
    'Economic Calendar': 'tools/economic-calendar.html',
    'About Us': 'company/about.html',
    'Contact Us': 'company/contact.html',
    'Benefits': 'company/benefits.html',
    'Partnership': 'partnership/index.html',
    'Partnership Page': 'partnership/index.html',
    'Open Account': 'trading/account-opening.html',
    'Open Account Now': 'trading/account-opening.html',
    'Explore All Markets': 'tools/live-markets.html',
    'View All Markets': 'tools/live-markets.html',
    'Account Types': 'trading/account-types.html',
    'Trading Conditions': 'trading/trading-conditions.html',
    'Platforms': 'trading/platforms.html',
    'How to Start': 'trading/how-to-start.html',
}

FRAGMENTS = {
    'markets': 'tools/live-markets.html',
    'accounts': 'trading/account-types.html',
    'conditions': 'trading/trading-conditions.html',
    'platforms': 'trading/platforms.html',
    'steps': 'trading/how-to-start.html',
    'calendar': 'tools/economic-calendar.html',
    'about': 'company/about.html',
    'contact': 'company/contact.html',
    'benefits': 'company/benefits.html',
    'partner': 'partnership/index.html',
    'open-account': 'trading/account-opening.html',
}

SOCIALS = {'facebook', 'x', 'linkedin', 'youtube', 'instagram'}


def page_base(path: Path) -> Path:
    # sections/*.html is dynamically injected into index.html, so its URLs resolve
    # from the homepage document, not from /sections/.
    return ROOT if path.as_posix().startswith('sections/') else path.parent


def route_for(path: Path, target: str) -> str:
    value = os.path.relpath(ROOT / target, page_base(path)).replace('\\', '/')
    return value if value.startswith('.') else './' + value


def visible_text(html_fragment: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', html_fragment)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def repair_anchor(match: re.Match[str], path: Path) -> str:
    whole = match.group(0)
    attrs = match.group('attrs')
    body = match.group('body')
    text = visible_text(body)
    label = text.lower()
    href_match = re.search(r'href\s*=\s*(["\'])(.*?)\1', attrs, re.I | re.S)
    href = href_match.group(2).strip() if href_match else ''
    aria_match = re.search(r'aria-label\s*=\s*(["\'])(.*?)\1', attrs, re.I | re.S)
    aria = aria_match.group(2).strip() if aria_match else ''
    class_match = re.search(r'class\s*=\s*(["\'])(.*?)\1', attrs, re.I | re.S)
    classes = class_match.group(2).lower() if class_match else ''

    normalized_label = re.sub(r'\s+', ' ', (aria or text)).strip().lower()

    # Login must disappear entirely from navigation/anchors.
    if normalized_label == 'login' or 'btn-login' in classes or 'login.html' in href.lower():
        return ''

    # Explicitly prevent placeholder social links from jumping to top.
    if href == '#' and normalized_label in SOCIALS:
        attrs = re.sub(r'href\s*=\s*(["\']).*?\1', '', attrs, count=1, flags=re.I | re.S).rstrip()
        if 'aria-disabled=' not in attrs.lower():
            attrs += ' aria-disabled="true" tabindex="-1"'
        return f'<a{attrs}>{body}</a>'

    target = None
    if re.search(r'(^|/)terms\.html$', href, re.I):
        target = 'legal/terms-and-conditions.html'
    elif re.search(r'(^|/)privacy\.html$', href, re.I):
        target = 'legal/privacy-policy.html'
    elif normalized_label in {k.lower() for k in ROUTES}:
        for key, value in ROUTES.items():
            if normalized_label == key.lower():
                target = value
                break
    elif href.startswith('#'):
        target = FRAGMENTS.get(href[1:].lower())

    # Brand/home links.
    if href == '#top':
        target = 'index.html'

    if target and (href.startswith('#') or href in {'', 'terms.html', 'privacy.html'} or href.endswith('/terms.html') or href.endswith('/privacy.html')):
        new_href = route_for(path, target)
        if href_match:
            attrs = re.sub(r'href\s*=\s*(["\']).*?\1', f'href="{new_href}"', attrs, count=1, flags=re.I | re.S)
        else:
            attrs = f'{attrs} href="{new_href}"'
        return f'<a{attrs}>{body}</a>'

    return whole


ANCHOR_RE = re.compile(r'<a\b(?P<attrs>[^>]*)>(?P<body>.*?)</a>', re.I | re.S)

changed = []
for path in sorted(ROOT.rglob('*.html')):
    original = path.read_text(encoding='utf-8')
    text = ANCHOR_RE.sub(lambda m: repair_anchor(m, path), original)

    if path.as_posix() == 'sections/accounts.html':
        # The three visible homepage account cards are intentionally mapped to the
        # three public account groups.
        text = text.replace('href="#open-account" class="fx-account-learn"', 'href="./accounts/standard.html" class="fx-account-learn"', 1)
        text = text.replace('href="#open-account" class="fx-account-learn"', 'href="./accounts/premium.html" class="fx-account-learn"', 1)
        text = text.replace('href="#open-account" class="fx-account-learn"', 'href="./accounts/professional.html" class="fx-account-learn"', 1)
        text = text.replace('href="#partner" class="fx-partnership-button"', 'href="./partnership/account-opening.html" class="fx-partnership-button"')

    if path.as_posix() == 'sections/platforms.html':
        text = text.replace('href="#platforms">Compare Platforms', 'href="./trading/platforms.html">Compare Platforms')
        text = text.replace('href="#platforms">\n          <span class="download-icon">▣</span>', 'href="./platforms/metatrader-4.html">\n          <span class="download-icon">▣</span>')
        text = text.replace('href="#platforms">\n          <span class="download-icon play">▶</span>', 'href="./platforms/metatrader-5.html">\n          <span class="download-icon play">▶</span>')
        text = text.replace('href="#platforms">\n          <span class="download-icon">↗</span>', 'href="./platforms/webtrader.html">\n          <span class="download-icon">↗</span>')
        text = text.replace('href="#open-account">Open Account Now', 'href="./trading/account-opening.html">Open Account Now')

    if text != original:
        path.write_text(text, encoding='utf-8')
        changed.append(path.as_posix())

print('Navigation repair changed', len(changed), 'HTML files')
for item in changed:
    print(item)
