import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the JS for the CTA
# Search for JS related to floatingCTA.classList.remove('is-minimized') and replace x: '-50%'
js_target = r"gsap\.to\(floatingCTA, \{ width: '90%', x: '-50%', padding: '0 1\.5rem', borderRadius: '50px', duration: 0\.6, ease: 'elastic\.out\(1, 0\.75\)' \}\);"
js_replacement = "gsap.to(floatingCTA, { width: 'calc(100% - 2rem)', padding: '0 1.5rem', borderRadius: '32px', duration: 0.6, ease: 'elastic.out(1, 0.75)' });"
html = re.sub(js_target, js_replacement, html)

js_target_2 = r"gsap\.to\(floatingCTA, \{ width: '60px', x: 'calc\(50vw - 40px\)', padding: '0', borderRadius: '30px', duration: 0\.6, ease: 'elastic\.out\(1, 0\.75\)' \}\);"
js_replacement_2 = "gsap.to(floatingCTA, { width: '64px', padding: '0', borderRadius: '32px', duration: 0.6, ease: 'elastic.out(1, 0.75)' });"
html = re.sub(js_target_2, js_replacement_2, html)

# Fix the shortProdName target in JS
html = html.replace("floatingCTA.querySelector('.f-cta-prod').textContent = shortProdName;", "floatingCTA.querySelector('.f-cta-prod-name').textContent = shortProdName;")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Fix CSS
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css_replacement = """/* Floating Action Button (CTA) */
.floating-cta {
    position: fixed;
    bottom: -100px;
    right: 1.5rem;
    left: auto;
    margin: 0;
    width: calc(100% - 3rem);
    max-width: 400px;
    height: 64px;
    background: #ff1f5d;
    color: #fff;
    z-index: 9999;
    padding: 0 1.5rem;
    border-radius: 32px;
    box-shadow: 0 10px 30px rgba(255, 31, 93, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-decoration: none;
    transition: bottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s;
    opacity: 0;
    pointer-events: none;
}

.f-cta-toggle-btn {
    position: absolute;
    top: -46px;
    right: 0;
    left: auto;
    background: #ff1f5d;
    border: none;
    color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    z-index: 10;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
}

.f-cta-toggle-btn:hover {
    transform: scale(1.1);
    background: #f01450;
}

.floating-cta.is-minimized {
    padding: 0;
    justify-content: center;
    cursor: pointer;
}

.floating-cta.is-minimized .f-cta-info,
.floating-cta.is-minimized .f-cta-action span {
    display: none;
}

.floating-cta.is-minimized .f-cta-toggle-btn {
    top: -46px;
    right: 0;
    transform: none;
    background: #ff1f5d;
    color: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    width: 36px;
    height: 36px;
}"""

css = re.sub(
    r'/\* Floating Action Button \(CTA\) \*/.*?\.floating-cta\.is-minimized \.f-cta-toggle-btn \{.*?\}',
    css_replacement,
    css,
    flags=re.DOTALL
)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Done")
