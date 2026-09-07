from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root = Path("qa-artifacts/v14-whole-site")
files = [
    "home-1363-top.png",
    "shop-1363-top.png",
    "pdp-1363-top.png",
    "collections-1363-top.png",
    "house-1363-top.png",
    "services-1363-top.png",
    "cart-1363-top.png",
    "checkout-1363-top.png",
    "contact-1363-top.png",
    "login-1363-top.png",
    "privacy-1363-top.png",
    "order-1363-top.png",
]

thumb_w, thumb_h = 545, 374
label_h = 32
cols = 3
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * thumb_w, rows * (thumb_h + label_h)), "white")
draw = ImageDraw.Draw(sheet)

for index, name in enumerate(files):
    path = root / name
    if not path.exists():
        raise SystemExit(f"missing screenshot for contact sheet: {path}")
    with Image.open(path) as source:
        image = source.convert("RGB")
        image = ImageOps.fit(image, (thumb_w, thumb_h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.0))
        x = (index % cols) * thumb_w
        y = (index // cols) * (thumb_h + label_h)
        sheet.paste(image, (x, y))
        label = name.replace("-1363-top.png", "").replace("-", " ").upper()
        draw.text((x + 10, y + thumb_h + 8), label, fill="black")

out = root / "v14-cross-page-contact-sheet.jpg"
sheet.save(out, "JPEG", quality=88, optimize=True)
print(out)
