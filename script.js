// ========================
// LP Wireframe Tool — Frontend
// ========================

let currentStep = 1;
const totalSteps = 4;

// ステップ間で共有するデータ
const sharedData = {
    researchResult: null,
    literacyResult: null,
    lpDesign: null,
    outputs: null,
};

// --- DOM Elements ---
const progressSteps = document.querySelectorAll(".progress__step");
const progressLines = document.querySelectorAll(".progress__line");
const stepPanels = document.querySelectorAll(".step-panel");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

// --- Step Navigation ---
function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    currentStep = step;

    // Update panels
    stepPanels.forEach((panel, i) => {
        panel.classList.toggle("active", i + 1 === step);
    });

    // Update progress indicators
    progressSteps.forEach((el, i) => {
        const s = i + 1;
        el.classList.remove("active", "done");
        if (s === step) el.classList.add("active");
        else if (s < step) el.classList.add("done");
    });

    progressLines.forEach((line, i) => {
        line.classList.toggle("done", i + 1 < step);
    });

    // Update nav buttons
    btnPrev.style.display = step > 1 ? "inline-flex" : "none";
    btnNext.style.display = step < totalSteps ? "inline-flex" : "none";

    // Disable next if step not completed
    updateNextButton();
}

function updateNextButton() {
    if (currentStep === 1) {
        btnNext.disabled = !sharedData.researchResult;
    } else if (currentStep === 2) {
        btnNext.disabled = !sharedData.literacyResult;
    } else if (currentStep === 3) {
        btnNext.disabled = !sharedData.lpDesign;
    }
    btnNext.style.opacity = btnNext.disabled ? "0.4" : "1";
}

btnPrev.addEventListener("click", () => goToStep(currentStep - 1));
btnNext.addEventListener("click", () => goToStep(currentStep + 1));

// --- API Call Helper ---
async function apiCall(endpoint, body, btn) {
    btn.classList.add("loading");
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "API Error");
        return data.data;
    } catch (err) {
        throw err;
    } finally {
        btn.classList.remove("loading");
    }
}

// --- Result Rendering ---
function renderResearchResult(data, container) {
    let html = `<span class="success-badge">✓ 分析完了</span>`;

    if (data.categories) {
        html += `<div class="result-section"><h4>競合分類</h4>`;
        if (data.categories.direct_competitors?.length) html += `<p><strong>直接競合:</strong> ${data.categories.direct_competitors.join(", ")}</p>`;
        if (data.categories.alternative_solutions?.length) html += `<p><strong>代替手段:</strong> ${data.categories.alternative_solutions.join(", ")}</p>`;
        if (data.categories.substitutes?.length) html += `<p><strong>代替品:</strong> ${data.categories.substitutes.join(", ")}</p>`;
        html += `</div>`;
    }

    if (data.competitor_strengths && data.competitor_strengths.length > 0) {
        html += `<div class="result-section"><h4>競合の強み抽出</h4>`;
        data.competitor_strengths.forEach(c => {
            html += `<div style="background:#f8fafc; padding:10px; margin-bottom:10px; border-radius:6px; border:1px solid #e2e8f0;">`;
            html += `<p style="margin-top:0; color:#0f172a; font-weight:600;">${c.name}</p>`;
            if (c.main_value_proposition) html += `<p style="font-size:13px; margin-bottom:4px;"><strong>提供価値:</strong> ${c.main_value_proposition}</p>`;
            if (c.target_audience) html += `<p style="font-size:13px; margin-bottom:4px;"><strong>ターゲット:</strong> ${c.target_audience}</p>`;
            if (c.positioning_message) html += `<p style="font-size:13px; margin-bottom:4px;"><strong>メッセージ:</strong> ${c.positioning_message}</p>`;
            html += `</div>`;
        });
        html += `</div>`;
    }

    if (data.positioning_gaps) {
        html += `<div class="result-section"><h4>ポジショニングのギャップ</h4><p>${data.positioning_gaps}</p></div>`;
    }

    if (data.differentiation_strategy || data.positioning_statement) {
        html += `<div class="result-section"><h4>自社の戦略 & ステートメント</h4>`;
        if (data.differentiation_strategy) html += `<p><span style="display:inline-block; background:#4A7CFF; color:white; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:bold; margin-bottom:8px;">戦略: ${data.differentiation_strategy}</span></p>`;
        if (data.positioning_statement) html += `<p style="padding-left:10px; border-left:3px solid #cbd5e1; color:#475569; font-style:italic;">${data.positioning_statement}</p>`;
        html += `</div>`;
    }

    if (data.final_output) {
        html += `<div class="result-section"><h4>LP構成に向けた指針</h4>`;
        if (data.final_output.target_audience) html += `<p><strong>ターゲット行動層:</strong> ${data.final_output.target_audience}</p>`;
        if (data.final_output.unique_value_proposition) html += `<p><strong>UVP:</strong> ${data.final_output.unique_value_proposition}</p>`;
        if (data.final_output.differentiation_angle) html += `<p><strong>見せ方の切り口:</strong> ${data.final_output.differentiation_angle}</p>`;
        if (data.final_output.recommended_headline_direction) html += `<p><strong>推奨見出し方向性:</strong> ${data.final_output.recommended_headline_direction}</p>`;
        html += `</div>`;
    }

    container.innerHTML = html;
    container.classList.add("show");
}

function renderLiteracyResult(data, container) {
    let html = `<span class="success-badge">✓ 分析完了</span>`;

    if (data.it_literacy) {
        html += `<div class="result-section"><h4>ITリテラシー: ${data.it_literacy.level || ""}</h4><p>${data.it_literacy.description || ""}</p>`;
        if (data.it_literacy.implications) html += `<p>LP設計への影響: ${data.it_literacy.implications}</p>`;
        html += `</div>`;
    }

    if (data.buying_psychology) {
        html += `<div class="result-section"><h4>購買心理</h4>`;
        if (data.buying_psychology.primary_motivation) html += `<p>主な動機: ${data.buying_psychology.primary_motivation}</p>`;
        if (data.buying_psychology.pain_points) html += `<p>ペイン: ${data.buying_psychology.pain_points.join("、")}</p>`;
        if (data.buying_psychology.objections) html += `<p>反論: ${data.buying_psychology.objections.join("、")}</p>`;
        html += `</div>`;
    }

    if (data.decision_making) {
        html += `<div class="result-section"><h4>意思決定</h4>`;
        if (data.decision_making.process) html += `<p>${data.decision_making.process}</p>`;
        if (data.decision_making.timeline) html += `<p>検討期間: ${data.decision_making.timeline}</p>`;
        html += `</div>`;
    }

    if (data.content_recommendations) {
        html += `<div class="result-section"><h4>コンテンツ提言</h4>`;
        const rec = data.content_recommendations;
        if (rec.tone) html += `<p>トーン: ${rec.tone}</p>`;
        if (rec.cta_approach) html += `<p>CTAアプローチ: ${rec.cta_approach}</p>`;
        html += `</div>`;
    }

    container.innerHTML = html;
    container.classList.add("show");
}

function renderStructureResult(data, container) {
    let html = `<span class="success-badge">✓ 差分分析＆LP案生成完了</span>`;

    // 差分分析の表示
    if (data.diff_analysis) {
        const diff = data.diff_analysis;
        html += `<div class="result-section"><h4>📊 差分分析</h4>`;

        if (diff.keep && diff.keep.length) {
            html += `<p style="color:#34d399;font-weight:600;">🟢 そのまま活かす</p><ul>`;
            diff.keep.forEach(item => {
                html += `<li><strong>${item.element}</strong> — ${item.reason}</li>`;
            });
            html += `</ul>`;
        }

        if (diff.remove && diff.remove.length) {
            html += `<p style="color:#f87171;font-weight:600;">🔴 削るべき箇所</p><ul>`;
            diff.remove.forEach(item => {
                html += `<li><strong>${item.element}</strong> — ${item.reason}</li>`;
            });
            html += `</ul>`;
        }

        if (diff.add && diff.add.length) {
            html += `<p style="color:#fbbf24;font-weight:600;">🟡 追加すべき要素</p><ul>`;
            diff.add.forEach(item => {
                html += `<li><strong>${item.element}</strong> — ${item.reason}`;
                if (item.reference) html += ` (参考: ${item.reference})`;
                html += `</li>`;
            });
            html += `</ul>`;
        }
        html += `</div>`;
    }

    if (data.lp_concept) {
        html += `<div class="result-section"><h4>コンセプト</h4>`;
        if (data.lp_concept.theme) html += `<p>テーマ: ${data.lp_concept.theme}</p>`;
        if (data.lp_concept.overall_tone) html += `<p>トーン: ${data.lp_concept.overall_tone}</p>`;
        if (data.lp_concept.color_scheme) html += `<p>カラー: ${data.lp_concept.color_scheme}</p>`;
        html += `</div>`;
    }

    if (data.sections && data.sections.length) {
        html += `<div class="result-section"><h4>セクション構成 (${data.sections.length}セクション)</h4><ul>`;
        data.sections.forEach(sec => {
            html += `<li><strong>${sec.name}</strong>`;
            if (sec.headline) html += ` — ${sec.headline}`;
            html += `</li>`;
        });
        html += `</ul></div>`;
    }

    container.innerHTML = html;
    container.classList.add("show");
}

function renderError(error, container) {
    container.innerHTML = `<span class="error-badge">✗ エラー: ${error}</span>`;
    container.classList.add("show");
}

// --- Step 1: ポジショニング分析 ---
document.getElementById("btn-research").addEventListener("click", async () => {
    const btn = document.getElementById("btn-research");
    const result = document.getElementById("result-research");

    const industry = document.getElementById("industry").value.trim();
    const serviceName = document.getElementById("serviceName").value.trim();
    const competitors = document.getElementById("competitors").value.trim();

    if (!industry || !serviceName) {
        renderError("業界名とサービス名を入力してください", result);
        return;
    }

    try {
        const data = await apiCall("/api/research", { industry, serviceName, competitors }, btn);
        sharedData.researchResult = data;
        renderResearchResult(data, result);
        updateNextButton();
    } catch (err) {
        renderError(err.message, result);
    }
});

// --- Step 2: リテラシー分析 ---
document.getElementById("btn-literacy").addEventListener("click", async () => {
    const btn = document.getElementById("btn-literacy");
    const result = document.getElementById("result-literacy");

    const industry = document.getElementById("industry").value.trim();
    const targetAudience = document.getElementById("targetAudience").value.trim();
    const serviceType = document.getElementById("serviceType").value.trim();

    if (!targetAudience || !serviceType) {
        renderError("ターゲット層とサービスの種類を入力してください", result);
        return;
    }

    try {
        const data = await apiCall("/api/literacy", { industry, targetAudience, serviceType }, btn);
        sharedData.literacyResult = data;
        renderLiteracyResult(data, result);
        updateNextButton();
    } catch (err) {
        renderError(err.message, result);
    }
});

// --- Step 3: LP差分分析＆設計 ---
document.getElementById("btn-structure").addEventListener("click", async () => {
    const btn = document.getElementById("btn-structure");
    const result = document.getElementById("result-structure");

    const serviceName = document.getElementById("serviceName").value.trim();
    const serviceDescription = document.getElementById("serviceDescription").value.trim();
    const targetAction = document.getElementById("targetAction").value.trim();
    const existingLpInfo = document.getElementById("existingLpInfo").value.trim();

    if (!serviceDescription || !targetAction) {
        renderError("サービス説明と期待するアクションを入力してください", result);
        return;
    }

    if (!sharedData.researchResult || !sharedData.literacyResult) {
        renderError("先にStep 1とStep 2を完了してください", result);
        return;
    }

    try {
        const data = await apiCall("/api/structure", {
            researchResult: sharedData.researchResult,
            literacyResult: sharedData.literacyResult,
            existingLpInfo,
            serviceName,
            serviceDescription,
            targetAction,
        }, btn);
        sharedData.lpDesign = data;
        renderStructureResult(data, result);
        updateNextButton();
    } catch (err) {
        renderError(err.message, result);
    }
});

// --- Step 4: 生成 ---
document.getElementById("btn-generate").addEventListener("click", async () => {
    const btn = document.getElementById("btn-generate");

    if (!sharedData.lpDesign) {
        alert("先にStep 3まで完了してください");
        return;
    }

    try {
        const data = await apiCall("/api/generate", { lpDesign: sharedData.lpDesign }, btn);
        sharedData.outputs = data;

        // Show preview
        const preview = document.getElementById("output-preview");
        preview.style.display = "block";

        const iframe = document.getElementById("preview-iframe");
        iframe.src = data.wireframe.path;

        document.getElementById("link-wireframe").href = data.wireframe.path;
        document.getElementById("link-mock").href = data.mock.path;
    } catch (err) {
        alert("生成エラー: " + err.message);
    }
});

// --- Preview Tabs ---
document.querySelectorAll(".preview-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".preview-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const iframe = document.getElementById("preview-iframe");
        const target = tab.dataset.target;
        if (target === "wireframe" && sharedData.outputs) {
            iframe.src = sharedData.outputs.wireframe.path;
        } else if (target === "mock" && sharedData.outputs) {
            iframe.src = sharedData.outputs.mock.path;
        }
    });
});

// --- Initialize ---
goToStep(1);
