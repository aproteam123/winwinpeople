import pymupdf

pdf_path = "제품설명-규소 종합-260702.pdf"
doc = pymupdf.open(pdf_path)

with open("extracted_text.txt", "w", encoding="utf-8") as f:
    f.write("=== TEXT FROM PDF ===\n")
    for i in range(len(doc)):
        text = doc[i].get_text()
        if text.strip():
            f.write(f"\n--- Page {i+1} ---\n")
            f.write(text.strip() + "\n")
