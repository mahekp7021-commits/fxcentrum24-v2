# FXCentrum24 Homepage — production-ready front-end

This package recreates the supplied FXCentrum24 homepage direction:
- Dark navy / electric-blue / red visual system
- Sticky header with working desktop dropdown menus
- Mobile navigation
- Animated hero globe fallback
- Hero video slot: `assets/hero/hero-video.mp4`
- Market asset slots: `assets/markets/`
- Responsive desktop / tablet / mobile layouts
- TradingView live EUR/USD chart
- Scroll reveal animations
- Platform device mockups
- Account cards, partnership banner, trust strip and footer

## Asset replacement
Put the final AI-generated files in:
- `assets/hero/hero-video.mp4`
- `assets/hero/hero-poster.webp`
- `assets/markets/forex.webp`
- `assets/markets/gold.webp`
- `assets/markets/indices.webp`
- `assets/markets/shares.webp`
- `assets/markets/crypto.webp`

Then update the corresponding `.asset-img` CSS backgrounds if you want the generated artwork to be used instead of the current CSS placeholders.

## Live chart
The homepage uses the TradingView embed for `FX:EURUSD`. This gives the chart its real market feed where the selected instrument/feed supports real-time data.

For a fully branded production implementation, the next phase should replace the demo ticker values with the broker's authorised market-data API/WebSocket and wire all CTA links to the client's actual account/login endpoints.

## Files
- `index.html`
- `styles.css`
- `script.js`
