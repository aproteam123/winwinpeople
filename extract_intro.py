import fitz
import os

pdf_path = "C:\\Users\\HP\\Music\\winwin_project\\제품설명-규소 종합-260702.pdf"
output_dir = "C:\\Users\\HP\\Music\\winwin_project\\image\\extracted\\"

doc = fitz.open(pdf_path)

# Extract first 5 pages to see which one is the intro
for i in range(5):
    page = doc[i]
    pix = page.get_pixmap(dpi=150)
    output_path = os.path.join(output_dir, f"page_{i+1}.png")
    pix.save(output_path)
    print(f"Saved {output_path}")

doc.close()
