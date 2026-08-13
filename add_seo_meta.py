#!/usr/bin/env python3
"""Add SEO meta tags (description, keywords, Open Graph, twitter) to each page head."""
import os, glob, re

ROOT = os.path.dirname(os.path.abspath(__file__))

META = {
    "index.html": {
        "title": "ATELIER - The Armor of Reality | Luxury Minimalist Fashion",
        "desc": "ATELIER is a luxury minimalist fashion brand. Discover timeless pieces crafted for modern elegance — knitwear, tailoring, outerwear and accessories from the Fall 2026 collection.",
        "og_title": "ATELIER - The Armor of Reality",
        "og_image": "assets/hero-1.webp",
        "og_type": "website",
    },
    "shop.html": {
        "title": "Shop - ATELIER | Our Products",
        "desc": "Browse the full ATELIER collection: tailored wool blazers, cashmere overcoats, silk gowns and everyday essentials. Free shipping on every order.",
        "og_title": "Shop - ATELIER",
        "og_image": "assets/product-hero.webp",
        "og_type": "website",
    },
    "about.html": {
        "title": "About Us - ATELIER",
        "desc": "Learn about ATELIER — a brand born from the contrast between urban life and natural elegance, dedicated to timeless, minimal luxury.",
        "og_title": "About Us - ATELIER",
        "og_image": "assets/collection-1.webp",
        "og_type": "website",
    },
    "blog.html": {
        "title": "The Edit - ATELIER Blog",
        "desc": "Read ATELIER's editorial on curating a timeless wardrobe, the art of minimalism, and styling essentials for everyday elegance.",
        "og_title": "The Edit - ATELIER Blog",
        "og_image": "assets/blog-1.webp",
        "og_type": "website",
    },
    "detailproduct.html": {
        "title": "Product Detail - ATELIER",
        "desc": "Shop this piece from ATELIER — minimal luxury fashion with sustainable sourcing and hand-finished details.",
        "og_title": "Product Detail - ATELIER",
        "og_image": "assets/gown-main.webp",
        "og_type": "product",
    },
    "cart.html": {
        "title": "Your Cart - ATELIER",
        "desc": "Review your ATELIER bag. Complimentary shipping and luxe packaging on every order.",
        "og_title": "Your Cart - ATELIER",
        "og_image": "assets/product-hero.webp",
        "og_type": "website",
    },
    "favourite.html": {
        "title": "Saved - ATELIER",
        "desc": "Your saved pieces at ATELIER — timeless essentials curated for your wardrobe.",
        "og_title": "Saved - ATELIER",
        "og_image": "assets/new-in-1.webp",
        "og_type": "website",
    },
    "checkout.html": {
        "title": "Checkout - ATELIER",
        "desc": "Complete your ATELIER order — complimentary shipping and luxe packaging included.",
        "og_title": "Checkout - ATELIER",
        "og_image": "assets/product-hero.webp",
        "og_type": "website",
    },
    "login.html": {
        "title": "Sign In - ATELIER",
        "desc": "Sign in to your ATELIER account to manage orders and saved pieces.",
        "og_title": "Sign In - ATELIER",
        "og_image": "assets/hero-1.webp",
        "og_type": "website",
    },
    "account.html": {
        "title": "My Account - ATELIER",
        "desc": "Manage your ATELIER account, orders, and saved pieces.",
        "og_title": "My Account - ATELIER",
        "og_image": "assets/hero-1.webp",
        "og_type": "website",
    },
    "order-success.html": {
        "title": "Order Confirmed - ATELIER",
        "desc": "Thank you for shopping with ATELIER. Your order has been confirmed.",
        "og_title": "Order Confirmed - ATELIER",
        "og_image": "assets/product-hero.webp",
        "og_type": "website",
    },
}

for f in glob.glob(ROOT + "/*.html"):
    name = os.path.basename(f)
    if name not in META:
        continue
    m = META[name]
    html = open(f, encoding="utf-8").read()

    # update <title> if present
    html = re.sub(r"(<title>)(.*?)(</title>)", rf"\g<1>{m['title']}\g<3>", html, count=1, flags=re.S)

    # remove existing meta description / og to avoid duplicates
    html = re.sub(r'<meta[^>]*property="og:[^"]*"[^>]*/?>\n?', "", html)
    html = re.sub(r'<meta[^>]*name="description"[^>]*/?>\n?', "", html)

    seo = (
        f'  <meta name="description" content="{m["desc"]}">\n'
        f'  <meta name="keywords" content="ATELIER, luxury fashion, minimalist clothing, tailoring, knitwear, outerwear, sustainable fashion, Fall 2026">\n'
        f'  <meta property="og:title" content="{m["og_title"]}">\n'
        f'  <meta property="og:description" content="{m["desc"]}">\n'
        f'  <meta property="og:image" content="https://ngh1aa.github.io/Atelier/{m["og_image"]}">\n'
        f'  <meta property="og:type" content="{m["og_type"]}">\n'
        f'  <meta property="og:url" content="https://ngh1aa.github.io/Atelier/{name}">\n'
        f'  <meta name="twitter:card" content="summary_large_image">\n'
        f'  <meta name="twitter:title" content="{m["og_title"]}">\n'
        f'  <meta name="twitter:description" content="{m["desc"]}">\n'
        f'  <meta name="twitter:image" content="https://ngh1aa.github.io/Atelier/{m["og_image"]}">\n'
    )
    # insert after first <title>...</title>
    html = re.sub(r"(</title>)", r"\g<1>\n" + seo, html, count=1)
    open(f, "w", encoding="utf-8").write(html)
    print("SEO meta added:", name)
