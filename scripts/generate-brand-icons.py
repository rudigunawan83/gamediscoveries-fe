from pathlib import Path

from PIL import Image

assets = Path(
    r"C:\Users\user\.cursor\projects\c-Users-user-Documents-Private-gamediscoveries\assets"
)
public = Path(
    r"C:\Users\user\Documents\Private\gamediscoveries\gamediscoveries-fe\public"
)
icons_dir = public / "icons"
images_dir = public / "images"
icons_dir.mkdir(parents=True, exist_ok=True)
images_dir.mkdir(parents=True, exist_ok=True)

app_icon = Image.open(assets / "gamediscoveries-app-icon-512.jpg").convert("RGBA")
mark = Image.open(assets / "gamediscoveries-mark.jpg").convert("RGBA")

app_icon.resize((512, 512), Image.Resampling.LANCZOS).save(
    icons_dir / "icon-512.png", optimize=True
)
mark.resize((512, 512), Image.Resampling.LANCZOS).save(
    images_dir / "logo-mark.png", optimize=True
)

for size in (192, 96, 48, 32, 16):
    app_icon.resize((size, size), Image.Resampling.LANCZOS).save(
        icons_dir / f"icon-{size}.png", optimize=True
    )

app_icon.save(
    public / "favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)
app_icon.resize((180, 180), Image.Resampling.LANCZOS).save(
    icons_dir / "apple-touch-icon.png", optimize=True
)

print("ok", sorted(p.name for p in icons_dir.iterdir()))
