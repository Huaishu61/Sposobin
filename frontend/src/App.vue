<template>
  <div class="app-container">
    <header class="app-header">
      <div class="top-right-actions">
        <button @click="showDonateModal = true" class="modern-btn btn-success donate-btn">
          <span class="icon">🔋</span> 帮服务器续命一天
        </button>
        <button @click="showUpdateReportModal = true" class="modern-btn btn-primary update-top-btn">
          <span class="icon">🚀</span> 更新公告
        </button>
        <button @click="openGeneralFeedbackModal" class="modern-btn btn-danger feedback-top-btn">
          <span class="icon">💬</span> 反馈问题
        </button>
      </div>

      <div class="logo-area">
        <h1>Sposobin Engine <span class="badge">1.1 Pro</span></h1>
        <p class="subtitle">斯波索宾四部和声写作台</p>
        
        <div class="author-credits">
          <img src="https://github.com/Huaishu61.png" alt="青槐树的诗" class="github-avatar" />
          作者：<span class="author-name">青槐树的诗</span>
          <span class="divider">|</span>
          <a href="https://space.bilibili.com/381857406" target="_blank" class="author-link bilibili-link">
            <span class="link-icon">📺</span> B站主页
          </a>
          <span class="divider">|</span>
          <a href="https://github.com/Huaishu61" target="_blank" class="author-link github-link">
            <span class="link-icon">🐙</span> GitHub
          </a>
          <span class="divider">|</span>
          <span class="author-link qq-link">
            <span class="link-icon">👥</span> QQ群：850900762
          </span>
        </div>
      </div>
    </header>

    <div class="main-layout">
      <section class="control-panel glass-card">
        <div class="form-group">
          <label class="form-label">
            工作模式 (App Mode)
            <button @click="openHelpModal" class="help-trigger-btn" title="查看当前工作模式引导说明">❓</button>
          </label>
          <div class="segmented-control">
            <input type="radio" id="mode-free" value="FREE" v-model="store.mode" @change="resetState">
            <label for="mode-free">自由模式</label>
            <input type="radio" id="mode-soprano" value="SOPRANO" v-model="store.mode" @change="resetState">
            <label for="mode-soprano">高音题模式</label>
            <input type="radio" id="mode-compose" value="COMPOSE" v-model="store.mode" @change="resetState">
            <label for="mode-compose">旋律写作模式</label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">全局调性 (Tonality)</label>
          <select v-model="store.key_name" @change="resetState" class="modern-select" :disabled="store.mode !== 'FREE'">
            <option v-for="key in keys" :key="key" :value="key">{{ key }}</option>
          </select>
        </div>
      </section>

      <transition name="fade">
        <PianoKeyboard 
          v-if="store.mode !== 'FREE'" 
          :mode="store.mode"
          @note-click="onPianoNoteInput"
          @submit-soprano="startSopranoMode"
        />
      </transition>

      <section class="score-section glass-card">
        <div class="toolbar">
          <div class="btn-group">
            <button @click="playSequence" class="modern-btn btn-success">
              <span class="icon">▶</span> 试听序列
            </button>
            <button @click="resetState" class="modern-btn btn-danger">
              <span class="icon">🗑️</span> 清空画板
            </button>
          </div>
          <div class="hint-text">
            <span>💡 提示：点击五线谱上的和弦可将其 <b>断点回退</b></span>
          </div>
        </div>
        <ScoreRenderer 
          :render-data="store.renderData"
          :history-length="store.history.length"
          :target-melody-length="store.target_melody.length"
          :playback-index="store.playbackIndex"
          @rewind="rewindTo"
        />
      </section>

      <ChordSelector 
        :categories="store.categories"
        :mode="store.mode"
        :target-melody="store.target_melody"
        :history="store.history"
        :pending-note="store.pending_note"
        @chord-select="sendAction"
      />
    </div>

    <transition name="modal">
      <div v-if="showDonateModal" class="help-overlay" @click="showDonateModal = false">
        <div class="help-window" style="width: 450px;" @click.stop>
          <div class="help-header" style="background: linear-gradient(135deg, #10B981, #059669); color: white;">
            <h3 style="color: white; display: flex; align-items: center; gap: 8px;">🔋 帮服务器续命一天</h3>
            <button class="close-help-btn" style="color: rgba(255,255,255,0.8);" @click="showDonateModal = false">✕</button>
          </div>
          <div class="help-body" style="text-align: center; gap: 16px;">
            <p class="update-text" style="font-size: 15px;">“一块钱！一块钱————”</p>
            <div style="display: flex; justify-content: center; margin-top: 10px;">
              <div style="width: 200px; padding: 15px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
                <h4 style="margin-bottom: 12px; color: #10B981; font-size: 16px;">微信赞赏</h4>
                <div style="width: 100%; aspect-ratio: 1; background: #E2E8F0; display: flex; align-items: center; justify-content: center; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
                  <img src="@/assets/code.png" alt="微信赞赏码" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showUpdateReportModal" class="help-overlay" @click="closeUpdateReportModal">
        <div class="help-window" style="width: 560px;" @click.stop>
          <div class="help-header" style="background: linear-gradient(135deg, #0284C7, #0EA5E9); color: white;">
            <h3 style="color: white; display: flex; align-items: center; gap: 8px;">🚀 斯波索宾和声写作台 · 1.1 升级报告</h3>
            <button class="close-help-btn" style="color: rgba(255,255,255,0.8);" @click="closeUpdateReportModal">✕</button>
          </div>
          <div class="help-body" style="gap: 16px; max-height: 65vh; overflow-y: auto;">
             <div class="update-section">
              <h4 class="update-section-title" style="color: #F59E0B;">🚀 Bravura SMuFL 引擎重构</h4>
              <p class="update-text">本次更新引入了 Steinberg 旗舰级开源音乐字体 Bravura，实现了专业出版物级别的矢量五线谱渲染。</p>
            </div>
          </div>
          <div class="help-footer">
            <button class="modern-btn btn-primary" style="background: #0EA5E9; width: 100%;" @click="closeUpdateReportModal">我知道了，开启和声推演</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showHelpModal" class="help-overlay" @click="showHelpModal = false">
        <div class="help-window" @click.stop>
          <div class="help-header">
            <h3>{{ modeHelpData[currentHelpMode]?.title }}</h3>
            <button class="close-help-btn" @click="showHelpModal = false">✕</button>
          </div>
          <div class="help-body">
            <div v-for="(rule, idx) in modeHelpData[currentHelpMode]?.rules" :key="idx" class="help-rule-line">
              {{ rule }}
            </div>
          </div>
          <div class="help-footer">
            <button class="modern-btn btn-primary" @click="showHelpModal = false">开始使用</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="generalFeedbackModalOpen" class="help-overlay" @click="generalFeedbackModalOpen = false">
        <div class="help-window" style="width: 520px;" @click.stop>
          <div class="help-header" style="background: #FEF2F2;">
            <h3 style="color: #DC2626;">💬 反馈当前和声级进与系统问题</h3>
            <button class="close-help-btn" @click="generalFeedbackModalOpen = false">✕</button>
          </div>
          <div class="help-body" style="gap: 12px;">
            <div class="snapshot-preview font-mono">
              <div>当前调性: {{ store.key_name }} ({{ store.mode }})</div>
              <div>当前录入音数: {{ store.target_melody.length }} 个</div>
              <div>当前历史步数: {{ store.history.length }} 步</div>
            </div>
            <label class="form-label" style="margin-top: 8px;">您的联系邮箱（必填）：</label>
            <input type="email" v-model="generalFeedbackEmail" class="modern-input" style="border-color: #FCA5A5;" />
            <label class="form-label" style="margin-top: 4px;">问题或教材错题出处：</label>
            <input type="text" v-model="generalFeedbackText" class="modern-input" style="border-color: #FCA5A5;" />
          </div>
          <div class="help-footer" style="background: #FEF2F2;">
            <button class="modern-btn btn-primary" style="background: #EF4444;" @click="submitGeneralFeedback">提交数据快照</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="store.debug_message" class="terminal-overlay" @click="closeDebugModal">
        <div class="terminal-window" @click.stop>
          <div class="terminal-header">
            <div class="mac-dots">
              <span class="dot red" @click="closeDebugModal"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="terminal-title">bash - DAG_Debugger - 80x24</div>
          </div>
          <div class="terminal-body">
            <pre>{{ store.debug_message }}</pre>
            <div v-if="isUnsolvableDAGErr" class="terminal-feedback-box">
              <div class="t-feedback-title">🔍 侦测到连通性死胡同！</div>
              <div class="t-feedback-form-stacked">
                <input type="email" v-model="issueEmailInput" placeholder="联系邮箱" class="t-feedback-input" />
                <input type="text" v-model="issueSourceInput" placeholder="题目出处" class="t-feedback-input" />
                <button @click="submitUnsolvableIssue" class="t-feedback-btn">一键提交后台</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch } from 'vue';
import * as Tone from 'tone';
import PianoKeyboard from './components/PianoKeyboard.vue';
import ScoreRenderer from './components/ScoreRenderer.vue';
import ChordSelector from './components/ChordSelector.vue';

const keys = [
  "C 大调 (C Major)", "G 大调 (G Major)", "D 大调 (D Major)", "A 大调 (A Major)", "E 大调 (E Major)", "B 大调 (B Major)", "F# 大调 (F# Major)",
  "F 大调 (F Major)", "Bb 大调 (Bb Major)", "Eb 大调 (Eb Major)", "Ab 大调 (Ab Major)", "Db 大调 (Db Major)", "Gb 大调 (Gb Major)",
  "a 小调 (a minor)", "e 小调 (e minor)", "b 小调 (b minor)", "f# 小调 (f# minor)", "c# 小调 (c# minor)", "g# 小调 (g# minor)", "d# 小调 (d# minor)",
  "d 小调 (d minor)", "g 小调 (g minor)", "c 小调 (c minor)", "f 小调 (f minor)", "bb 小调 (bb minor)", "eb 小调 (eb minor)"
];

const store = reactive({
  mode: "FREE",
  key_name: "C 大调 (C Major)",
  target_melody: [],
  history: [],
  pending_note: null,
  renderData: { sigs: [], nodes: [] },
  categories: { diatonic: {}, tonicization: {} },
  playbackIndex: null,
  debug_message: null
});

// UI 状态
const showUpdateReportModal = ref(false);
const showDonateModal = ref(false);
const showHelpModal = ref(false);
const currentHelpMode = ref("FREE");
const seenModes = reactive({ FREE: false, SOPRANO: false, COMPOSE: false });
const generalFeedbackModalOpen = ref(false);
const generalFeedbackText = ref("");
const issueSourceInput = ref("");
const generalFeedbackEmail = ref("");
const issueEmailInput = ref("");

const isUnsolvableDAGErr = computed(() => {
  return store.debug_message && store.debug_message.includes("=== 启动 DAG 连通性诊断探针 ===");
});

const modeHelpData = {
  FREE: { title: "🎵 自由模式", rules: ["1. 任意切换左侧全局调性。", "2. 点击下方功能按钮生成和声。", "3. 在五线谱点击和弦可断点回退。"] },
  SOPRANO: { title: "⚡ 高音题模式", rules: ["1. 输入音高文本或弹奏。", "2. 点击生成推演路径。", "3. 根据候选按钮前进。"] },
  COMPOSE: { title: "🎹 旋律写作模式", rules: ["1. 先选定旋律音高。", "2. 下方按钮自动过滤合法和弦。", "3. 固化和声并等待下一步。"] }
};

let mainLimiter = null;
let globalSynth = null;

function initAudioEngine() {
  if (!mainLimiter) mainLimiter = new Tone.Limiter(-1).toDestination();
  if (!globalSynth) {
    globalSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "custom", partials: [1, 0.4, 0.2] },
      envelope: { attack: 0.04, decay: 0.1, sustain: 0.8, release: 1.2 },
      volume: -12
    }).connect(mainLimiter);
  }
}

// 🌟 修复后的核心同步逻辑：加入报错提醒
async function syncBackend(action_chord = null) {
  store.debug_message = null;
  try {
    const res = await fetch("/api/sync_state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: store.mode,
        key_name: store.key_name,
        target_melody: store.target_melody,
        history: store.history,
        pending_note: store.pending_note,
        action_chord: action_chord
      })
    });
    
    if (!res.ok) throw new Error("Server responded with " + res.status);
    
    const data = await res.json();
    Object.assign(store, data);
    
    if (action_chord && store.history.length > 0) {
      playSingleChord(store.history[store.history.length - 1].voices);
    }
  } catch (e) {
    console.error(e);
    // 🌟 加回了警报！
    alert("无法连通 Python 算法内核！\n请确保后端服务 (uvicorn app:app) 已启动，并且 vite.config.js 配置了正确的 /api 代理。");
  }
}

// 播放与交互逻辑
async function playSingleChord(voices) {
  await Tone.start();
  initAudioEngine();
  const freqs = Object.values(voices).map(midi => Tone.Frequency(midi, "midi").toFrequency());
  globalSynth.triggerAttackRelease(freqs, "2n");
}

async function playSequence() {
  if (store.history.length === 0) return;
  await Tone.start();
  initAudioEngine();
  const now = Tone.now();
  const duration = 0.9;
  
  store.history.forEach((item, index) => {
    const freqs = Object.values(item.voices).map(midi => Tone.Frequency(midi, "midi").toFrequency());
    globalSynth.triggerAttackRelease(freqs, "4n", now + index * duration);
    setTimeout(() => { store.playbackIndex = index; }, index * duration * 1000);
  });
  setTimeout(() => { store.playbackIndex = null; }, store.history.length * duration * 1000);
}

function onPianoNoteInput(midi) {
  if (store.mode === 'COMPOSE') {
    store.pending_note = midi;
    syncBackend();
  }
}

function startSopranoMode(melodySequence) {
  store.target_melody = melodySequence;
  if (store.target_melody.length > 0) syncBackend();
}

function sendAction(chord) { syncBackend(chord); }
function rewindTo(index) { store.history = store.history.slice(0, index + 1); store.pending_note = null; syncBackend(); }
function resetState() { store.history = []; store.target_melody = []; store.pending_note = null; store.playbackIndex = null; store.debug_message = null; syncBackend(); }

// 弹窗辅助函数
function openHelpModal() { currentHelpMode.value = store.mode; showHelpModal.value = true; }
function closeUpdateReportModal() {
  showUpdateReportModal.value = false;
  if (!seenModes[store.mode]) {
    currentHelpMode.value = store.mode;
    showHelpModal.value = true;
    seenModes[store.mode] = true;
  }
}
function openGeneralFeedbackModal() { generalFeedbackText.value = ""; generalFeedbackEmail.value = ""; generalFeedbackModalOpen.value = true; }
function closeDebugModal() { store.debug_message = null; }
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

async function postIssueToBackend(sourceInfo) {
  try {
    const res = await fetch("/api/submit_issue", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: store.mode, key_name: store.key_name, target_melody: store.target_melody, history: store.history, source_info: sourceInfo })
    });
    const data = await res.json();
    alert(`上报成功: ${data.message}`);
  } catch (e) { alert("上报数据失败，请确认后端服务运行正常。"); }
}

function submitUnsolvableIssue() {
  const email = issueEmailInput.value.trim();
  const source = issueSourceInput.value.trim();
  if (!email || !isValidEmail(email)) { alert("❌ 格式错误：请输入正确的邮箱！"); return; }
  if (!source) { alert("❌ 提报拒绝：请填写题目出处！"); return; }
  postIssueToBackend(`[联系人: ${email}] | [断链错题] ${source}`);
  issueSourceInput.value = ""; issueEmailInput.value = ""; store.debug_message = null; 
}

function submitGeneralFeedback() {
  const email = generalFeedbackEmail.value.trim();
  const text = generalFeedbackText.value.trim();
  if (!email || !isValidEmail(email)) { alert("❌ 格式错误：请输入正确的邮箱！"); return; }
  if (!text) { alert("❌ 提报拒绝：反馈内容不能为空！"); return; }
  postIssueToBackend(`[联系人: ${email}] | [功能反馈] ${text}`);
  generalFeedbackModalOpen.value = false;
}

watch(() => store.mode, (newMode) => {
  if (!seenModes[newMode] && !showUpdateReportModal.value) {
    currentHelpMode.value = newMode;
    showHelpModal.value = true;
    seenModes[newMode] = true;
  }
});

onMounted(() => {
  document.title = "Sposobin Engine 1.1 Pro";
  const hasSeenUpdate = localStorage.getItem("seenUpdateReport1.1");
  if (!hasSeenUpdate) {
    showUpdateReportModal.value = true;
    localStorage.setItem("seenUpdateReport1.1", "true");
  }
  syncBackend();
});
</script>

<style>
@import url('./App.css'); 
</style>