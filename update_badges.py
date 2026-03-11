import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target_start = html.find('<div class="benefit-3d-wrap"')
target_end = html.find('</div>\n            </div>\n\n        </div>\n    </section>')

if target_start == -1 or target_end == -1:
    print("Could not find benefit-3d-wrap")
else:
    # Need to isolate specifically the wrap including style 
    end_of_style = html.find('</style>', target_start) + 8
    target_end2 = html.find('</div>', end_of_style) + 6
    if target_end2 < target_end:
        # include the disclaimer div as well
        pass

replacement = """<div class="benefit-3d-wrap" style="position: relative; width: 100%; max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; align-items: center;">
                        
                        <!-- Floating Badges and Character Container -->
                        <div style="position: relative; width: 100%; aspect-ratio: 1/1; display: flex; justify-content: center; align-items: center; margin-bottom: 2rem;">
                            <!-- Character Image -->
                            <img src="./img/benefits_char.png" alt="Benefits Character" style="width: 70%; height: auto; object-fit: contain; z-index: 2; animation: float3d 4s ease-in-out infinite;">
                            
                            <!-- Top Badge -->
                            <div style="position: absolute; top: -5%; left: 50%; transform: translateX(-50%); z-index: 3;">
                                <div class="slam-anim" style="animation-delay: 0.2s;">
                                    <div class="ios-bubble from-them float-1" style="--bg-color: #ff1f5d; background: var(--bg-color); color: #fff;">
                                        💸 만기 시 전액 환급
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Left Badge -->
                            <div style="position: absolute; top: 40%; left: -6%; z-index: 3;">
                                <div class="slam-anim" style="animation-delay: 0.8s;">
                                    <div class="ios-bubble from-me float-2" style="--bg-color: #1a8fe3; background: var(--bg-color); color: #fff;">
                                        🏨 리조트 객실 우대
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Right Badge -->
                            <div style="position: absolute; top: 30%; right: -6%; z-index: 1;">
                                <div class="slam-anim" style="animation-delay: 1.4s;">
                                    <div class="ios-bubble from-them float-3" style="--bg-color: #7c3aed; background: var(--bg-color); color: #fff;">
                                        🚢 해외여행 전환
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Bottom Badge -->
                            <div style="position: absolute; bottom: 0%; left: 50%; transform: translateX(-50%); z-index: 3;">
                                <div class="slam-anim" style="animation-delay: 2.0s;">
                                    <div class="ios-bubble from-me float-4" style="--bg-color: #ffffff; background: var(--bg-color); color: #1d1d1f; border-top: 1px solid rgba(0,0,0,0.05);">
                                        🕊️ 프리미엄 상조
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Disclaimer -->
                        <div style="background: rgba(255, 31, 93, 0.1); border-radius: 50px; padding: 12px 20px; display: inline-flex; align-items: center; justify-content: center; color: #ff1f5d; font-weight: 700; font-size: 14px; border: 1px solid rgba(255, 31, 93, 0.2); word-break: keep-all; text-align: center;">
                            💡 여러 구좌 가입 시 혜택을 각각 쪼개서 선택 가능!
                        </div>
                    </div>
                    
                    <style>
                        @keyframes float3d {
                            0% { transform: translateY(0) rotate(0deg); }
                            50% { transform: translateY(-10px) rotate(1deg); }
                            100% { transform: translateY(0) rotate(0deg); }
                        }
                        @keyframes floatBadge1 { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }
                        @keyframes floatBadge2 { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
                        @keyframes floatBadge3 { 0% { transform: translateY(0); } 100% { transform: translateY(8px); } }
                        @keyframes floatBadge4 { 0% { transform: translateY(0); } 100% { transform: translateY(6px); } }
                        
                        .float-1 { animation: floatBadge1 3.5s ease-in-out infinite alternate; }
                        .float-2 { animation: floatBadge2 4s ease-in-out infinite alternate-reverse; }
                        .float-3 { animation: floatBadge3 3.8s ease-in-out infinite alternate; }
                        .float-4 { animation: floatBadge4 4.2s ease-in-out infinite alternate-reverse; }

                        .slam-anim {
                            opacity: 0;
                            animation: slam 1.2s cubic-bezier(.17, .89, .32, 1.28) forwards;
                        }

                        @keyframes slam {
                            0% {
                                transform: scale3d(0.5, 0.5, 0.5) translate3d(0, 30px, 0);
                                opacity: 0;
                            }
                            50% {
                                transform: scale3d(1.1, 1.1, 1.1) translate3d(0, -5px, 0);
                                opacity: 1;
                            }
                            100% {
                                transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
                                opacity: 1;
                            }
                        }

                        .ios-bubble {
                            position: relative;
                            padding: 10px 20px;
                            font-weight: 800;
                            font-size: 14px;
                            border-radius: 25px;
                            white-space: nowrap;
                            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                        }

                        .ios-bubble.from-me::before {
                            content: "";
                            position: absolute;
                            z-index: -1;
                            bottom: -2px;
                            right: -7px;
                            height: 20px;
                            border-right: 20px solid var(--bg-color);
                            border-bottom-left-radius: 16px 14px;
                            transform: translate(0, -2px);
                        }
                        .ios-bubble.from-me::after {
                            content: "";
                            position: absolute;
                            z-index: 1;
                            bottom: -2px;
                            right: -56px;
                            width: 26px;
                            height: 20px;
                            background: #000;
                            border-bottom-left-radius: 10px;
                            transform: translate(-30px, -2px);
                        }

                        .ios-bubble.from-them::before {
                            content: "";
                            position: absolute;
                            z-index: -1;
                            bottom: -2px;
                            left: -7px;
                            height: 20px;
                            border-left: 20px solid var(--bg-color);
                            border-bottom-right-radius: 16px 14px;
                            transform: translate(0, -2px);
                        }
                        .ios-bubble.from-them::after {
                            content: "";
                            position: absolute;
                            z-index: 1;
                            bottom: -2px;
                            left: 4px;
                            width: 26px;
                            height: 20px;
                            background: #000;
                            border-bottom-right-radius: 10px;
                            transform: translate(-30px, -2px);
                        }
                    </style>
                </div>"""

# Replace in index.html exactly between target_start and the end of the style block.
import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = re.sub(r'<div class="benefit-3d-wrap".*?</style>\n                </div>', replacement, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Done")
