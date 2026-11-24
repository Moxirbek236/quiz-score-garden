"""Flowgorithm uslubidagi blok-sxemalarni SVG qilib public/flowgorithm/ ga yozadi.
Ishga tushirish: python3 scripts/gen-flowcharts.py"""
from html import escape
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "flowgorithm"

SCHEMES = {
    "b1": ["Main", "Declare a, b, c As Integer", "Input a", "Input b", "c = a + b * 2", "Output c", "End"],
    "b2": ["Main", "Declare x, y As Integer", "Input x", "y = x * x - 1", "x = y + 2", "Output x", "Output y", "End"],
    "b3": ["Main", "Declare n, a, b As Integer", "Input n", "a = n div 10", "b = n mod 10", "n = b * 10 + a", "Output n", "End"],
    "c1": ["Main", "Declare r, S As Real", "S = pi * r * r", "Output S", "End"],
    "c2": ["Main", "Declare a, b As Integer", "Input a", "Input b", "c = a + b", "Output c", "End"],
    "c3": ["Main", "Declare a, S As Integer", "Input a", "S = a + a", "Output S", "End"],
}

W, NODE_W, NODE_H, GAP, SKEW = 340, 240, 38, 26, 14
CX = W // 2

def kind(label):
    if label in ("Main", "End"):
        return "oval"
    if label.startswith(("Input", "Output")):
        return "io"
    return "box"

FILL = {"oval": "#e5e7eb", "io": "#dbeafe", "box": "#fef3c7"}

def svg(labels):
    h = 20 + len(labels) * NODE_H + (len(labels) - 1) * GAP + 20
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" width="{W}" height="{h}" '
             f'font-family="Consolas, Menlo, monospace" font-size="14" role="img" aria-label="Blok-sxema">',
             '<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
             'orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#374151"/></marker></defs>',
             f'<rect width="{W}" height="{h}" rx="12" fill="#ffffff"/>']
    y = 20
    for i, label in enumerate(labels):
        k, x0 = kind(label), CX - NODE_W // 2
        if k == "oval":
            parts.append(f'<rect x="{x0}" y="{y}" width="{NODE_W}" height="{NODE_H}" rx="{NODE_H // 2}" fill="{FILL[k]}" stroke="#374151" stroke-width="1.5"/>')
        elif k == "box":
            parts.append(f'<rect x="{x0}" y="{y}" width="{NODE_W}" height="{NODE_H}" fill="{FILL[k]}" stroke="#374151" stroke-width="1.5"/>')
        else:
            pts = f"{x0 + SKEW},{y} {x0 + NODE_W},{y} {x0 + NODE_W - SKEW},{y + NODE_H} {x0},{y + NODE_H}"
            parts.append(f'<polygon points="{pts}" fill="{FILL[k]}" stroke="#374151" stroke-width="1.5"/>')
        parts.append(f'<text x="{CX}" y="{y + NODE_H / 2 + 5}" text-anchor="middle" fill="#111827">{escape(label)}</text>')
        if i < len(labels) - 1:
            parts.append(f'<line x1="{CX}" y1="{y + NODE_H}" x2="{CX}" y2="{y + NODE_H + GAP}" stroke="#374151" stroke-width="1.5" marker-end="url(#a)"/>')
        y += NODE_H + GAP
    parts.append("</svg>")
    return "\n".join(parts)

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, labels in SCHEMES.items():
        (OUT / f"{name}.svg").write_text(svg(labels), encoding="utf-8")
        print("yozildi:", name)
