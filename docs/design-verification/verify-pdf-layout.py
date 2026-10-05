"""Check generated report fixtures using Poppler's real PDF word coordinates.

Run after render-pdf-fixtures.mjs. Requires pdftotext on PATH; no Python packages.
"""
import json
import re
import subprocess
import tempfile
from pathlib import Path
import xml.etree.ElementTree as ET

folder = Path(__file__).resolve().parent
fixtures = [
    ("vessel-report-long-rows.pdf", "Barcode", "V", 72),
    ("activity-report-long-rows.pdf", "Notes", "A", 44),
    ("activity-report-long-note.pdf", "Notes", "NOTE", 60),
]
results = []
namespace = {"h": "http://www.w3.org/1999/xhtml"}
with tempfile.TemporaryDirectory(prefix="vitros-pdf-") as temporary:
    for filename, heading, prefix, count in fixtures:
        output = Path(temporary) / f"{filename}.html"
        subprocess.run(["pdftotext", "-bbox", str(folder / filename), str(output)], check=True)
        pages = ET.parse(output).getroot().findall(".//h:page", namespace)
        all_text = []
        gaps = []
        for index, page in enumerate(pages, 1):
            words = page.findall("h:word", namespace)
            text = " ".join(word.text or "" for word in words)
            all_text.append(text)
            footer = [word for word in words if float(word.attrib["yMin"]) > 540]
            body = [word for word in words if float(word.attrib["yMin"]) <= 540]
            footer_text = " ".join(word.text or "" for word in footer)
            assert "VitrOS" in footer_text, (filename, index, "missing footer")
            assert f"{index} / {len(pages)}" in footer_text, (filename, index, "page number")
            assert heading in text, (filename, index, "missing table heading")
            assert all(0 <= float(word.attrib["xMin"]) < float(word.attrib["xMax"]) <= float(page.attrib["width"]) and 0 <= float(word.attrib["yMin"]) < float(word.attrib["yMax"]) <= float(page.attrib["height"]) for word in words), (filename, index, "off-page text")
            gap = min(float(word.attrib["yMin"]) for word in footer) - max(float(word.attrib["yMax"]) for word in body)
            assert gap >= 15, (filename, index, "body/footer overlap", gap)
            gaps.append(round(gap, 2))
        text = " ".join(all_text)
        for index in range(1, count + 1):
            assert f"{prefix}{index:03}" in text, (filename, index, "missing record or note segment")
        if prefix == "NOTE":
            # PDF word extraction may split these markers at a hyphenated line end.
            compact_text = re.sub(r"[\s_-]", "", text)
            assert "LONGNOTESTART" in compact_text and "LONGNOTEEND" in compact_text
        results.append({"fixture": filename, "pages": len(pages), "expected_records_or_note_segments": count, "all_markers_present": True, "table_headings_and_numbered_footers_on_every_page": True, "off_page_words": 0, "minimum_body_footer_gap_pt": min(gaps)})

(folder / "pdf-layout-verification.json").write_text(json.dumps(results, indent=2) + "\n")
print(json.dumps(results, indent=2))
