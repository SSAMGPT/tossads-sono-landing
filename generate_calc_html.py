def generate_html(pane_id, base_price, items):
    html = f"""
                    <!-- 가전 선택 및 계산기 UI ({pane_id}) -->
                    <div class="sc-calc-wrap">
                        <div class="sc-brand-filter">
                            <button class="sc-brand-btn active">전체</button>
                            <button class="sc-brand-btn">LG전자</button>
                            <button class="sc-brand-btn">삼성/기타</button>
                        </div>
                        
                        <div class="sc-prod-swiper">
"""
    for item in items:
        html += f"""                            <div class="sc-prod-card" data-name="{item['name']}">
                                <div class="sc-prod-img"><img src="{item['img']}" alt="{item['name']}"></div>
                                <p class="sc-prod-name">{item['short_name']}</p>
                            </div>
"""
    html += f"""                        </div>

                        <!-- 영수증 UI -->
                        <div class="sc-receipt-box">
                            <div class="sc-receipt-header">
                                <span class="sc-receipt-check">✔️</span>
                                <span class="sc-receipt-product">가전을 선택해주세요</span>
                            </div>
                            <div class="sc-receipt-body">
                                <div class="sc-receipt-row">
                                    <span>기본 월 납입금</span>
                                    <span><strong class="sc-r-base">{base_price}</strong>원</span>
                                </div>
                                <div class="sc-receipt-row discount">
                                    <span>제휴카드 최대 혜택</span>
                                    <span><strong>- 24,000</strong>원 <span style="font-size:10px">🔻</span></span>
                                </div>
                                <div class="sc-receipt-divider"></div>
                                <div class="sc-receipt-row total">
                                    <span>최종 체감가</span>
                                    <span>월 <strong class="sc-r-final">{int(base_price.replace(',', '')) - 24000:,.0f}</strong>원</span>
                                </div>
                                <p class="sc-receipt-note">* 전월실적 30만원 이상 충족 시</p>
                            </div>
                        </div>
                        
                        <label class="sc-card-checkbox">
                            <input type="checkbox" class="sc-calc-check">
                            <span class="checkmark"></span>
                            제휴카드 발급 안내 희망 시 체크
                        </label>
                        
                        <a href="#consult" class="sc-cta-btn">이 조건으로 빠른 상담 신청하기</a>
                    </div>
"""
    return html

items_330x2 = [
    {"name": "LG 퓨리케어 공기청정기 (AS305DWWA)", "short_name": "LG 공기청정기", "img": "./img/스마트케어330x2_lg_공기청정기_AS305DWWA.jpg"},
    {"name": "LG 퓨리케어 정수기 (WD220MCB)", "short_name": "LG 정수기", "img": "./img/스마트케어330x2_LG_정수기_WD220MCB.avif"},
    {"name": "SK매직 스스로 직수 정수기 (WPUIAC414SPS)", "short_name": "SK 정수기", "img": "./img/스마트케어330x2_SK_정수기_WPUIAC414SPS.png"}
]

items_330x3 = [
    {"name": "LG 퓨리케어 공기청정기 (AS355NSNA)", "short_name": "LG 공기청정기", "img": "./img/스마트케어330x3_lg_공기청정기_AS355NSNA.jpg"},
    {"name": "LG 디오스 냉장고 (S836MRQ112)", "short_name": "LG 냉장고", "img": "./img/스마트케어330x3_LG_냉장고_S836MRQ112.avif"},
    {"name": "LG 올레드 TV (OLED55B5KNA)", "short_name": "LG TV", "img": "./img/스마트케어330x3_LG_TV_OLED55B5KNA.avif"}
]

items_330x4 = [
    {"name": "LG 트롬 건조기 (Z509MHHF23)", "short_name": "LG 건조기", "img": "./img/스마트케어330x4_LG_건조기_Z509MHHF23.avif"},
    {"name": "LG 디오스 냉장고 (Z509MHHF23)", "short_name": "LG 냉장고", "img": "./img/스마트케어330x4_LG_냉장고_Z509MHHF23.avif"},
    {"name": "LG 코드제로 로봇청소기 (B95AWBH)", "short_name": "LG 로봇청소기", "img": "./img/스마트케어330x4_LG_로봇청소기_B95AWBH.jpg"},
    {"name": "LG 휘센 에어컨 (FQ18HDWHY2)", "short_name": "LG 에어컨", "img": "./img/스마트케어330x4_lg_에어컨_FQ18HDWHY2.jpg"}
]

items_330x6 = [
    {"name": "바디프랜드 안마의자 (BFR-7211)", "short_name": "바디프랜드", "img": "./img/스마트케어330x6_바디프렌드_안마의자_BFR-7211.jpg"},
    {"name": "삼성 비스포크 냉장고 (RM80F91K1XJ)", "short_name": "삼성 냉장고", "img": "./img/스마트케어330x6_삼성_냉장고_RM80F91K1XJ.jfif"},
    {"name": "세라젬 마스터 V6 (MB-1901)", "short_name": "세라젬 V6", "img": "./img/스마트케어330x6_세라젬_안마의자_CGM MB-1901.jpg"},
    {"name": "MacBook Pro M3 (Space Black)", "short_name": "맥북 프로", "img": "./img/스마트케어330x6_애플_노트북_MX2H3KHA(Space Black).png"},
    {"name": "LG 워시타워 (FX25GNR+RD20GNG)", "short_name": "LG 워시타워", "img": "./img/스마트케어330x6_lg_세탁기+건조기_FX25GNR+RD20GNG.jpg"}
]

print(generate_html("330x2", "33,000", items_330x2))
print("===")
print(generate_html("330x3", "49,500", items_330x3))
print("===")
print(generate_html("330x4", "66,000", items_330x4))
print("===")
print(generate_html("330x6", "99,000", items_330x6))
