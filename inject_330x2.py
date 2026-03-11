import re

with open("index.html", "r") as f:
    html = f.read()

with open("calc_html.txt", "r") as f:
    blocks = f.read().split("===")

html = re.sub(r'(<div class="sc-tab-pane active" id="sc-pane-330x2">[\s\S]*?<div class="sc-refund-box">[\s\S]*?</div>)', r'\1' + blocks[0], html, count=1)

with open("index.html", "w") as f:
    f.write(html)
print("Fixed 330x2")
