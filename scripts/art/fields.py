"""
Generates the four 4:5 field-survey placeholder images.

These stand in for real photographs of Yogyakarta transit nodes (trotoar, halte,
penyeberangan, stasiun) that do not exist yet. They are rendered procedurally as
soft, slightly hazy scenes rather than drawn as flat vector art, so they read as
photography at thumbnail size without pretending to be a specific real place.

Palette is taken from the diorama/page tokens so the row sits inside the Fitur
section without clashing.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

W, H = 1000, 1250  # 4:5
OUT = Path(__file__).resolve().parent / "raster"
OUT.mkdir(parents=True, exist_ok=True)


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def sky(img, top, bottom):
    d = ImageDraw.Draw(img)
    for y in range(H):
        d.line([(0, y), (W, y)], fill=lerp(top, bottom, y / H))


def grain(img, amount=7):
    noise = Image.effect_noise((W, H), 22).convert("L")
    return Image.blend(img, Image.merge("RGB", (noise, noise, noise)), amount / 100)


def haze(img, strength=0.16, tint=(223, 234, 243)):
    layer = Image.new("RGB", (W, H), tint)
    return Image.blend(img, layer, strength)


def finish(img, name):
    img = grain(img)
    img = haze(img)
    img = img.filter(ImageFilter.GaussianBlur(0.4))
    img.save(OUT / f"{name}.png")
    print("wrote", (OUT / f"{name}.png").name)


def perspective_slab(d, y_far, y_near, x_far_l, x_far_r, x_near_l, x_near_r, fill):
    d.polygon(
        [(x_far_l, y_far), (x_far_r, y_far), (x_near_r, y_near), (x_near_l, y_near)],
        fill=fill,
    )


# ---------------------------------------------------------------- 1. trotoar
def trotoar():
    """Broken sidewalk receding from the camera — the 'last stretch' problem."""
    img = Image.new("RGB", (W, H), (208, 222, 234))
    sky(img, (206, 224, 238), (231, 238, 243))
    d = ImageDraw.Draw(img)
    rng = random.Random(11)

    horizon = 470

    # distant buildings
    x = -40
    while x < W + 40:
        bw = rng.randint(90, 190)
        bh = rng.randint(90, 240)
        shade = rng.randint(150, 178)
        d.rectangle([x, horizon - bh, x + bw, horizon], fill=(shade, shade - 6, shade - 14))
        for wy in range(horizon - bh + 18, horizon - 20, 34):
            for wx in range(x + 12, x + bw - 16, 30):
                if rng.random() < 0.72:
                    d.rectangle([wx, wy, wx + 13, wy + 18], fill=(198, 210, 220))
        x += bw + rng.randint(6, 22)

    # road surface
    perspective_slab(d, horizon, H, 250, 760, -420, 1420, (86, 88, 92))
    # kerb
    perspective_slab(d, horizon, H, 250, 300, -420, 60, (150, 148, 142))
    # sidewalk slab
    perspective_slab(d, horizon, H, 300, 470, 60, 700, (168, 166, 158))

    # paving joints, converging toward the vanishing point
    for i in range(1, 26):
        t = (i / 26) ** 2.1
        y = horizon + (H - horizon) * t
        span = 0.06 + t * 1.0
        lx = 300 - (300 - 60) * t * 1.02
        rx = 470 + (700 - 470) * t * 1.02
        d.line([(lx, y), (rx, y)], fill=(146, 144, 137), width=max(1, int(1 + span * 3)))

    # the break in the paving: exposed dirt and a missing slab
    d.polygon([(196, 872), (612, 872), (690, 1010), (150, 1010)], fill=(110, 92, 74))
    d.polygon([(150, 1010), (690, 1010), (742, 1128), (96, 1128)], fill=(128, 108, 86))
    for _ in range(320):
        px = rng.randint(110, 720)
        py = rng.randint(880, 1120)
        r = rng.randint(2, 7)
        g = rng.randint(96, 150)
        d.ellipse([px, py, px + r, py + r], fill=(g, g - 16, g - 32))

    # puddle in the gap
    d.ellipse([250, 990, 570, 1064], fill=(120, 138, 150))
    d.ellipse([286, 1000, 520, 1050], fill=(150, 170, 182))

    # a utility pole planted mid-walkway
    d.rectangle([520, 300, 548, 900], fill=(122, 120, 114))
    d.rectangle([520, 300, 530, 900], fill=(146, 144, 138))

    # scrubby weeds at the edge
    for _ in range(90):
        bx = rng.randint(80, 760)
        by = rng.randint(900, 1180)
        h = rng.randint(10, 34)
        d.line([(bx, by), (bx + rng.randint(-7, 7), by - h)], fill=(92, 118, 66), width=2)

    finish(img, "field-1-trotoar")


# ------------------------------------------------------------------ 2. halte
def halte():
    """A bus shelter seen slightly off-axis."""
    img = Image.new("RGB", (W, H), (214, 228, 240))
    sky(img, (200, 220, 236), (233, 240, 245))
    d = ImageDraw.Draw(img)
    rng = random.Random(23)

    horizon = 700

    # tree mass behind
    for _ in range(26):
        cx = rng.randint(-30, W + 30)
        cy = rng.randint(horizon - 250, horizon - 40)
        r = rng.randint(70, 150)
        g = rng.randint(96, 132)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(72, g, 66))

    # pavement
    d.rectangle([0, horizon, W, H], fill=(158, 158, 152))
    d.rectangle([0, horizon, W, horizon + 26], fill=(140, 140, 134))
    for y in range(horizon + 60, H, 92):
        d.line([(0, y), (W, y)], fill=(140, 139, 132), width=3)
    for x in range(60, W, 128):
        d.line([(x, horizon + 26), (x, H)], fill=(142, 141, 134), width=3)

    # tactile paving strip
    for x in range(40, W, 46):
        d.ellipse([x, 1120, x + 22, 1142], fill=(196, 178, 96))

    # shelter: roof, back panel, bench, posts
    d.polygon([(150, 300), (858, 268), (886, 336), (128, 366)], fill=(58, 74, 88))
    d.polygon([(128, 366), (886, 336), (886, 356), (128, 386)], fill=(44, 58, 70))

    d.rectangle([196, 366, 828, 906], fill=(214, 224, 232))  # glazing
    d.rectangle([196, 366, 828, 906], outline=(96, 112, 126), width=6)
    d.line([(512, 366), (512, 906)], fill=(96, 112, 126), width=5)
    # reflection streaks on the glass
    for i in range(6):
        gx = 220 + i * 104
        d.line([(gx, 380), (gx + 60, 890)], fill=(232, 240, 246), width=7)

    # posts
    for px in (188, 820):
        d.rectangle([px, 330, px + 26, 1080], fill=(70, 86, 100))
        d.rectangle([px, 330, px + 9, 1080], fill=(92, 108, 122))

    # bench
    d.rectangle([250, 800, 780, 836], fill=(154, 120, 82))
    d.rectangle([250, 848, 780, 878], fill=(140, 108, 72))
    for bx in (286, 720):
        d.rectangle([bx, 836, bx + 22, 1000], fill=(84, 92, 100))

    # route sign on a pole
    d.rectangle([876, 470, 894, 1030], fill=(96, 104, 112))
    d.rounded_rectangle([812, 396, 986, 486], 10, fill=(31, 101, 146))
    d.rectangle([832, 424, 966, 434], fill=(224, 236, 246))
    d.rectangle([832, 448, 924, 458], fill=(190, 214, 232))

    # shadow under the shelter
    shadow = Image.new("RGB", (W, H), (255, 255, 255))
    sd = ImageDraw.Draw(shadow)
    sd.polygon([(140, 1010), (900, 960), (960, 1080), (90, 1140)], fill=(120, 128, 136))
    shadow = shadow.filter(ImageFilter.GaussianBlur(26))
    img = Image.blend(img, shadow, 0.28)

    finish(img, "field-2-halte")


# ---------------------------------------------------------- 3. penyeberangan
def penyeberangan():
    """A zebra crossing with no refuge or signal protection."""
    img = Image.new("RGB", (W, H), (206, 222, 236))
    sky(img, (198, 218, 235), (230, 238, 244))
    d = ImageDraw.Draw(img)
    rng = random.Random(37)

    horizon = 430

    # far side buildings + shopfronts
    x = -30
    while x < W + 30:
        bw = rng.randint(120, 210)
        bh = rng.randint(110, 210)
        shade = rng.randint(158, 186)
        d.rectangle([x, horizon - bh, x + bw, horizon], fill=(shade, shade - 8, shade - 18))
        d.rectangle([x + 10, horizon - 54, x + bw - 10, horizon - 8], fill=(120, 132, 142))
        x += bw + rng.randint(4, 18)

    # asphalt
    d.rectangle([0, horizon, W, H], fill=(78, 80, 84))
    # far kerb
    d.rectangle([0, horizon, W, horizon + 22], fill=(148, 146, 140))
    # near kerb / sidewalk
    d.rectangle([0, 1150, W, H], fill=(162, 160, 152))
    d.rectangle([0, 1150, W, 1172], fill=(136, 134, 128))

    # zebra bars, widening toward the camera
    for i in range(9):
        t = i / 9
        y_far = horizon + 90 + (1150 - horizon - 90) * (t**1.55)
        y_near = horizon + 90 + (1150 - horizon - 90) * ((t + 0.52 / 9) ** 1.55)
        spread = 0.10 + t * 0.9
        lx = W * 0.30 - W * 0.30 * spread
        rx = W * 0.70 + (W - W * 0.70) * spread
        lx2 = W * 0.30 - W * 0.30 * (spread + 0.09)
        rx2 = W * 0.70 + (W - W * 0.70) * (spread + 0.09)
        wear = rng.randint(196, 232)
        d.polygon(
            [(lx, y_far), (rx, y_far), (rx2, y_near), (lx2, y_near)],
            fill=(wear, wear - 4, wear - 10),
        )

    # worn patches over the paint
    for _ in range(200):
        px = rng.randint(0, W)
        py = rng.randint(horizon + 90, 1140)
        r = rng.randint(6, 26)
        d.ellipse([px, py, px + r, py + int(r * 0.5)], fill=(92, 94, 98))

    # lane divider on the approach
    for y in range(horizon + 40, 1150, 150):
        d.rectangle([W // 2 - 6, y, W // 2 + 6, y + 60], fill=(198, 190, 140))

    # a motorbike waiting on the crossing
    d.ellipse([300, 880, 372, 952], fill=(38, 40, 44))
    d.ellipse([318, 898, 354, 934], fill=(120, 124, 130))
    d.ellipse([560, 880, 632, 952], fill=(38, 40, 44))
    d.ellipse([578, 898, 614, 934], fill=(120, 124, 130))
    d.polygon([(336, 900), (470, 830), (596, 900), (470, 878)], fill=(150, 60, 48))
    d.polygon([(430, 830), (520, 812), (534, 856), (446, 866)], fill=(46, 52, 60))

    # unprotected pole where a signal should be
    d.rectangle([840, 250, 866, 1160], fill=(112, 116, 120))
    d.rectangle([840, 250, 849, 1160], fill=(138, 142, 146))

    finish(img, "field-3-penyeberangan")


# ---------------------------------------------------------------- 4. stasiun
def stasiun():
    """Station frontage with a platform canopy."""
    img = Image.new("RGB", (W, H), (210, 226, 238))
    sky(img, (196, 216, 234), (232, 239, 245))
    d = ImageDraw.Draw(img)
    rng = random.Random(53)

    horizon = 780

    # station building
    d.rectangle([60, 300, 940, horizon], fill=(196, 188, 172))
    d.rectangle([60, 300, 940, 356], fill=(172, 162, 146))
    # cornice
    d.rectangle([40, 288, 960, 312], fill=(206, 198, 182))

    # arched openings
    for i in range(5):
        ax = 118 + i * 164
        d.rounded_rectangle([ax, 470, ax + 116, horizon], 8, fill=(70, 84, 96))
        d.pieslice([ax, 404, ax + 116, 536], 180, 360, fill=(70, 84, 96))
        d.rounded_rectangle([ax + 14, 500, ax + 102, horizon], 6, fill=(96, 112, 126))

    # signage band
    d.rectangle([330, 366, 670, 430], fill=(31, 101, 146))
    d.rectangle([358, 388, 642, 404], fill=(226, 236, 246))

    # canopy over the platform
    d.polygon([(0, 250), (1000, 214), (1000, 292), (0, 330)], fill=(62, 78, 92))
    d.polygon([(0, 330), (1000, 292), (1000, 314), (0, 352)], fill=(46, 60, 72))
    for px in (120, 420, 720, 960):
        d.rectangle([px, 300, px + 22, horizon], fill=(74, 90, 104))

    # platform + yellow safety line
    d.rectangle([0, horizon, W, H], fill=(164, 162, 156))
    d.rectangle([0, horizon, W, horizon + 20], fill=(140, 138, 132))
    d.rectangle([0, 1092, W, 1122], fill=(206, 176, 74))
    for x in range(0, W, 44):
        d.ellipse([x, 1136, x + 24, 1160], fill=(198, 180, 96))

    # rails at the near edge
    d.rectangle([0, 1186, W, H], fill=(104, 92, 78))
    for ry in (1206, 1252):
        d.rectangle([0, ry, W, ry + 12], fill=(150, 148, 142))
    for x in range(-20, W, 96):
        d.rectangle([x, 1192, x + 54, 1272], fill=(88, 72, 58))

    # a couple of waiting figures, blurred like a real snapshot
    people = Image.new("RGB", (W, H), (255, 255, 255))
    pd = ImageDraw.Draw(people)
    for fx, fh, col in ((250, 190, (58, 66, 78)), (330, 176, (92, 74, 68)), (700, 184, (66, 72, 84))):
        top = horizon - fh
        pd.ellipse([fx, top, fx + 42, top + 46], fill=col)
        pd.rounded_rectangle([fx - 4, top + 50, fx + 46, horizon - 10], 14, fill=col)
    people = people.filter(ImageFilter.GaussianBlur(3))
    img = Image.blend(img, people, 0.55)

    finish(img, "field-4-stasiun")


if __name__ == "__main__":
    trotoar()
    halte()
    penyeberangan()
    stasiun()
