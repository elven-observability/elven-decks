#!/usr/bin/env python3
"""Maintainer helper: pip install fonttools brotli, then run after sync:assets.
Converts licensed Fontsource WOFF2 faces to TrueType for OOXML embedding.
End users do not need Python or font conversion tools.
"""
import hashlib
import json
from pathlib import Path
from fontTools.ttLib import TTFont
root = Path(__file__).resolve().parent.parent / "skill" / "themes" / "fonts"
faces = ["inter-latin-400-normal", "inter-latin-700-normal", "inter-latin-400-italic", "inter-latin-700-italic", "ibm-plex-mono-latin-400-normal", "ibm-plex-mono-latin-700-normal"]
records = []
for name in faces:
    source = root / (name + ".woff2")
    target = root / (name + ".ttf")
    font = TTFont(source)
    font.flavor = None
    font.save(target)
    records.append({"source": source.name, "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(), "file": target.name, "sha256": hashlib.sha256(target.read_bytes()).hexdigest()})
(root / "embedded-fonts.json").write_text(json.dumps(records, indent=2) + "\n")
print("Prepared embedded TrueType fonts with source checksums")
