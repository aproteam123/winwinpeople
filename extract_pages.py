import fitz
import os

pdf_path = "제품설명-규소 종합-260702.pdf"
output_dir = "image/extracted"

os.makedirs(output_dir, exist_ok=True)

keywords_map = {
    "graph_age": ["연령", "감소", "나이", "40세"],
    "body_parts": ["신체", "부위", "뇌", "혈관"],
    "process": ["제조", "공정도", "1650"],
    "certificate": ["시험성적서", "무독성", "한국식품과학연구원"],
    "oil": ["참기름", "지방", "유화"],
    "nail": ["못", "항산화", "녹슬"],
    "tea": ["녹차", "찬물", "침투"],
    "tomato": ["농약", "토마토", "쌀", "세척"],
    "oxygen": ["활성산소", "매커니즘", "환원"],
    "bone": ["골밀도", "뼈"],
    "hair_elasticity": ["모발", "탄력", "윤기"],
    "scalp": ["두피", "머리숱", "탈모"],
    "psoriasis": ["건선", "아토피", "피부"]
}

doc = fitz.open(pdf_path)

found_keys = set()

for i in range(len(doc)):
    page = doc[i]
    text = page.get_text()
    
    for key, words in keywords_map.items():
        if key in found_keys:
            continue
            
        for word in words:
            if word in text:
                pix = page.get_pixmap(dpi=150)
                pix.save(os.path.join(output_dir, f"{key}.png"))
                found_keys.add(key)
                print(f"Found {key} on page {i+1}")
                break

print("Extraction complete.")
print("Missing:", set(keywords_map.keys()) - found_keys)
