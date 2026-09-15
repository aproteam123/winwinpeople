import pymupdf
import os

pdf_path = "제품설명-규소 종합-260702.pdf"
doc = pymupdf.open(pdf_path)

output_dir = "image/extracted"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Pages to extract (0-indexed)
pages_to_extract = {
    29: "doctors.png",
    42: "case_cove.png",
    44: "case_seoul.png",
    45: "case_busan.png",
    46: "case_gwangju.png",
    47: "case_jecheon.png",
    48: "case_ansan.png",
    49: "case_saudi.png"
}

for page_num, filename in pages_to_extract.items():
    page = doc[page_num]
    # For cases, we crop out the top header if possible, or just extract the full page.
    # Let's extract full page at high resolution.
    zoom = 2.0
    mat = pymupdf.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    
    out_path = os.path.join(output_dir, filename)
    pix.save(out_path)
    print(f"Saved {out_path}")

print("Extraction complete.")
