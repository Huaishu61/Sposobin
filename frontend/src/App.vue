<template>
  <div class="app-container flex-workspace-mode">
    <header class="app-header">
      <div class="logo-area">
        <h1>Sposobin Engine <span class="badge">V1.3</span></h1>
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

      <div class="top-right-actions">
        <button @click="showDonateModal = true" class="modern-btn btn-success donate-btn">
          <span class="icon">🔋</span> 帮服务器续命一天
        </button>
        <button @click="showUpdateReportModal = true" class="modern-btn btn-primary update-top-btn">
          <span class="icon">🚀</span> 历史更新公告
        </button>
        <button @click="openGeneralFeedbackModal" class="modern-btn btn-danger feedback-top-btn">
          <span class="icon">💬</span> 反馈问题
        </button>
      </div>
    </header>

    <div class="workspace-main-grid" :style="{ pointerEvents: isProcessing ? 'none' : 'auto', opacity: isProcessing ? 0.75 : 1 }">
      <aside class="workspace-wing left-wing">
        <ChordSelector 
          type="diatonic"
          :categories="store.categories"
          :mode="store.mode"
          :target-melody="store.target_melody"
          :history="store.history"
          :pending-note="store.pending_note"
          @chord-select="sendAction"
        />
      </aside>

      <main class="workspace-center-stack">
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

              <input type="radio" id="mode-bass" value="BASS" v-model="store.mode" @change="resetState">
              <label for="mode-bass">低音题模式</label>
              
              <input type="radio" id="mode-compose" value="COMPOSE" v-model="store.mode" @change="resetState">
              <label for="mode-compose">旋律写作模式</label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">全局调性 (Key)</label>
            <select v-model="store.key_name" @change="resetState" class="modern-select">
              <option v-for="key in keys" :key="key" :value="key">{{ key }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">全局拍号 (Meter)</label>
            <select v-model="store.time_signature" @change="resetState" class="modern-select">
              <option value="4/4">4/4 拍 </option>
              <option value="3/4">3/4 拍 </option>
              <option value="2/4">2/4 拍 </option>
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
              <button @click="exportMusicXML" class="modern-btn btn-primary" :disabled="store.history.length === 0" style="background: #7C3AED;">
                <span class="icon">🎼</span> 导出 MusicXML
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
            :time-signature="store.time_signature" @rewind="rewindTo"
          />
        </section>

        <div v-if="isCategoriesEmpty" class="global-empty-indicator glass-card">
          <div class="empty-icon">🧩</div>
          <h3>{{ getPromptText() }}</h3>
        </div>
      </main>

      <aside class="workspace-wing right-wing">
        <ChordSelector 
          type="chromatic"
          :categories="store.categories"
          :mode="store.mode"
          :target-melody="store.target_melody"
          :history="store.history"
          :pending-note="store.pending_note"
          @chord-select="sendAction"
        />
      </aside>
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
        <div class="help-window" style="width: 650px;" @click.stop>
          <div class="help-header" style="background: linear-gradient(135deg, #0284C7, #0EA5E9); color: white;">
            <h3 style="color: white; display: flex; align-items: center; gap: 8px;">🚀 Sposobin 写作台 · 版本发布说明</h3>
            <button class="close-help-btn" style="color: rgba(255,255,255,0.8);" @click="closeUpdateReportModal">✕</button>
          </div>
          
          <div class="help-body" style="gap: 16px; max-height: 65vh; overflow-y: auto; padding-right: 12px;">
            
            <div class="version-block" style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; background: #F0F9FF; border-left: 4px solid #0EA5E9; margin-bottom: 16px;">
              <h4 style="margin: 0 0 12px 0; color: #0369A1; font-size: 15px; display: flex; align-items: center; justify-content: space-between;">
                <span>🔥 V1.3.0 音频引擎物理级控流重构与自适应乐谱排版系统</span>
                <span style="font-size: 11px; background: #0EA5E9; color: white; padding: 2px 8px; border-radius: 99px;">2026年6月12日 04:04</span>
              </h4>
              <div class="update-section">
                <h5 style="margin: 0 0 6px 0; color: #0f172a; font-size: 13px;">🛠️ 音频引擎与控制流缺陷修复 (Audio Engine & Control Flow Bugfixes)</h5>
                <ul style="margin: 0 0 12px 0; padding-left: 20px; font-size: 12px; color: #334155; line-height: 1.7;">
                  <li><b>修复了基于相位调制的变调杂音问题：</b> 弃用了 <code>.toFrequency()</code> 浮点频率映射算法，该算法在多声部并发采样时引发数字插值失真，产生非预期的电子音色。现已统一采用标准音名字符串驱动采样器。</li>
                  <li><b>修复了首次触发时的卡顿与吞音问题：</b> 原有逻辑在点击和弦时瞬时初始化采样器，导致本地 <code>.mp3</code> 缓冲区未就绪，首个和弦无法发声。修复方案为：将音频资源预加载前置于页面 <code>onMounted</code> 生命周期。</li>
                  <li><b>修复了高频交互下的音频交叠问题：</b> 废弃了向未来时间轴无序排程的 <code>triggerAttackRelease</code> 方案。新方案采用 <code>triggerAttack</code> 自由流模型，并在新和弦触发的微秒级时间窗口内，以 <code>0.05秒</code> 快速包络强制终止前序音符释放，消除声音堆叠混叠。</li>
                  <li><b>修复了序列回放导致的线程劫持与界面锁死问题：</b> 根除了因后台递归状态机无法中断，导致“试听序列”功能长时间劫持UI线程的严重缺陷。通过引入 <code>isPlaying</code> 状态锁并重构回放调度逻辑，现支持一键紧急终止。</li>
                  <li><b>修复了并发交互引发的状态错位问题：</b> 针对试听过程中，通过两侧面板推进和弦、触发断点回退或清空画布等操作导致的游标与音频同步异常，实现了前级交互总线的无条件线程销毁(硬熔断)机制。</li>
                  <li><b>修复了未定义变量导致的运行时中断：</b> 补充了缺失的局部变量声明，解决了系统频繁抛出 <code>ReferenceError: playbackTimeouts is not defined</code>，从而阻断和弦数据同步的问题。</li>
                </ul>

                <h5 style="margin: 0 0 6px 0; color: #0f172a; font-size: 13px;">📐 出版级乐谱排版优化 (Professional Engraving Refinements)</h5>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #334155; line-height: 1.7;">
                  <li><b>修复了复杂调号下的元素遮挡问题：</b> 废弃了固定 <code>layout.firstNodeX</code> 参数，建立了“谱号-调号-拍号-首和弦”全链路动态排版模型。创新性地引入了控制区域右边界至首和弦距离恒为标准步长 <code>1/1.7</code> 的黄金几何分割比，确保视觉清晰。</li>
                  <li><b>实现了SMuFL标准拍号渲染：</b> 移除了网页无衬线体数字，全面采用符合国际音乐印刷规范的 <b>Bravura</b> 专用字体，通过高位Unicode字符动态抓取并渲染垂直堆叠的拍号符号。</li>
                  <li><b>实现了自适应非对称小节线跨度：</b> 封装了全新的 <code>getNodeX(index)</code> 动态位移函数，使得跨越小节线的和弦组在视觉上自动生成 <code>16px</code> 的呼吸过渡区。播放高亮游标已实现自动变速对齐，杜绝了视觉漂移。</li>
                  <li><b>优化了小节线右侧紧凑依附的对齐逻辑：</b> 摒弃了均匀对齐算法，重构线段几何模型，使小节线在视觉上与右侧强拍首和弦保持恒定紧凑，将额外空间释放给前一乐句尾部，复现了传统出版物的空间美学。</li>
                  <li><b>修复了空白待定区域的休止符显示问题：</b> 移除了高低音题模式下，未填充声部区域密集显示的黑色四分休止符(<code>𝄽</code>)。现统一替换为带符干的完整四分音符，渲染为半透明浅灰色(<code>#CBD5E1</code>)，作为后续四部和声谱写的底稿参考。</li>
                </ul>
              </div>
            </div>

            <div class="version-block" style="border-bottom: 1px dashed #CBD5E1; margin-bottom: 16px; padding-bottom: 16px; padding-top: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #475569; font-size: 14px;">🛠️ V1.2.1 动态规划与声部进行重构</h4>
              <div class="update-section">
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                  <li><b>全局动态规划回溯预测：</b> 为旋律模式引入前瞻性动态规划算法。在候选和弦生成阶段预判并重排历史路径，解决了局部贪心算法导致的远期连接失败问题。</li>
                  <li><b>经典进行线性锁优化：</b> 针对 Sᵢᵢ₆-T₆-Sᵢᵢ 等典型经过与辅助进行，优化了内声部线性平稳锁的容忍度，支持纯四度隐蔽跳进。同时，解除了次中音与低音同度进行(Unison)及主六和弦重复三音的底层排斥约束，实现了古典和声特例的最优平滑连接。</li>
                </ul>
              </div>
            </div>

            <div class="version-block" style="border-bottom: 1px dashed #CBD5E1; margin-bottom: 16px; padding-bottom: 16px;">
              <h4 style="margin: 0 0 10px 0; color: #64748B; font-size: 14px;">🛠️ V1.2 核心渲染与交互优化</h4>
              <div class="update-section">
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #64748B; line-height: 1.7;">
                  <li><b>声部进行规则严格化：</b> 强化了“四部同向”与“声部超越”的检测惩罚机制，确保生成结果严格遵循传统四部和声写作规范。</li>
                  <li><b>音频调度与请求节流：</b> 引入了交互防抖机制，并重构了Web Audio API的释放逻辑(下发 <code>releaseAll()</code> 状态)，解决了高频交互下的音频堆叠与状态错位问题。</li>
                  <li><b>副下属体系与前端排版：</b> 全面打通了副下属功能组的动态推演逻辑。重构了界面面板，并优化了Lora字体排版参数与Bravura乐谱渲染库的SVG对齐精度。</li>
                </ul>
              </div>
            </div>

            <div class="version-block" style="border-bottom: 1px dashed #CBD5E1; margin-bottom: 16px; padding-bottom: 16px;">
              <h4 style="margin: 0 0 10px 0; color: #64748B; font-size: 14px;">🧩 V1.1 和声语汇扩充与连通性修复</h4>
              <div class="update-section">
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #64748B; line-height: 1.7;">
                  <li><b>异常阻断修复：</b> 修复了S₆-D₆、T₆-N₆等经典进行中的路径阻断问题，并优化了经过与辅助四六和弦的推导逻辑。</li>
                  <li><b>离调与通路补全：</b> 完善了离调和声网络，补全了至那不勒斯六和弦(N₆)的路径，并打通了DTᵢᵢᵢ→D/VI、Sᵢᵢ→DD、TS_VI→D/II等关键功能组图连接。</li>
                  <li><b>和弦结构扩充：</b> 修正了增六和弦(⁺⁶)的低音限制，新增属七附加六度音(D₇⁶)支持，并修复了部分导七转位(如Dᵥᵢᵢ₃₄的下属特性)的后续连接死锁。</li>
                </ul>
              </div>
            </div>

            <div class="version-block">
              <h4 style="margin: 0 0 8px 0; color: #94A3B8; font-size: 14px;">🏗️ V1.0 引擎底层架构建立</h4>
              <div class="update-section">
                <p style="margin: 0; font-size: 13px; color: #94A3B8;">基于 Python (FastAPI) + Vue 的前后端分离架构；实装基于有向无环图(DAG)的全局寻优核心算法与连通性探针；提供自由推演、旋律配和声(Soprano)及指定和声序列三种标准工作台模式。</p>
              </div>
            </div>

          </div>
          
          <div class="help-footer">
            <button class="modern-btn btn-primary" style="background: #0EA5E9; width: 100%;" @click="closeUpdateReportModal">确认，进入工作台</button>
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
  time_signature: "4/4", // 🌟 新增：全局初始化拍号，默认设置为 4/4 拍
  target_melody: [],
  history: [],
  pending_note: null,
  renderData: { sigs: [], nodes: [] },
  categories: { diatonic: {}, chromatic: {} },
  playbackIndex: null,
  debug_message: null
});
const isPlaying = ref(false); // 🌟 精准新增：控制全局完整回放的状态锁
// ⚡ V1.2 物理级高频防抖锁
const isProcessing = ref(false);

const showUpdateReportModal = ref(false);
const showDonateModal = ref(false);
const showHelpModal = ref(false);
const currentHelpMode = ref("FREE");

// 🌟 新增 BASS 到已读向导列表
const seenModes = reactive({ FREE: false, SOPRANO: false, BASS: false, COMPOSE: false });
const generalFeedbackModalOpen = ref(false);
const generalFeedbackText = ref("");
const issueSourceInput = ref("");
const generalFeedbackEmail = ref("");
const issueEmailInput = ref("");

const isCategoriesEmpty = computed(() => {
  const dLen = Object.keys(store.categories?.diatonic || {}).length;
  const cLen = Object.keys(store.categories?.chromatic || {}).length;
  return dLen === 0 && cLen === 0;
});

const isUnsolvableDAGErr = computed(() => {
  return store.debug_message && store.debug_message.includes("=== 启动 DAG 连通性诊断探针 ===");
});

// 🌟 为 BASS 模式编写专属新手指引
const modeHelpData = {
  FREE: { title: "🎵 自由模式", rules: ["1. 自由选择两翼面板的可行和弦。", "2. 系统将实时运算最优声部进行。", "3. 点击五线谱节点即可精准回退状态。"] },
  SOPRANO: { title: "⚡ 高音题模式", rules: ["1. 输入高音旋律序列并运行 DAG 寻优。", "2. 左右两侧面板将精细过滤符合法则的级进和弦。", "3. 顺次点击推进，直至乐谱拼装完成。"] },
  BASS: { title: "🎼 低音题模式", rules: ["1. 输入低音旋律序列 (C2-E4) 并运行 DAG 寻优。", "2. 引擎会根据低音限制计算合法和弦，并内置美学评分机制。", "3. 它将努力为您创作出一条具备起伏且与低音反向对流的女高音旋律线！"] },
  COMPOSE: { title: "🎹 旋律写作模式", rules: ["1. 弹奏一个旋律音高。", "2. 左右两侧面板将计算并点亮功能。"] }
};

let mainLimiter = null;
let globalSynth = null;
let playbackTimeouts = []; // 🌟 核心修复：加上这一行，把存放定时器的数组声明出来！
// 🌟 替换后的本地大钢琴物理采样初始化函数
function initAudioEngine() {
  if (!mainLimiter) mainLimiter = new Tone.Limiter(-1).toDestination();
  if (!globalSynth) {
    // 调用本地托管的 Salamander 真实钢琴采样，彻底消除跨国网络卡死和电音感
    globalSynth = new Tone.Sampler({
      urls: {
        "C2": "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        "A2": "A2.mp3",
        "C3": "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        "A3": "A3.mp3",
        "C4": "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        "A4": "A4.mp3",
        "C5": "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        "A5": "A5.mp3",
        "C6": "C6.mp3"
      },
      // 🌟 核心修改点：直接指向本地 public 映射出来的绝对根路径
      baseUrl: "/audio/salamander/", 
      release: 1.5, // 琴键松开后的自然尾音延续
      volume: -2
    }).connect(mainLimiter);
  }
}

async function syncBackend(action_chord = null) {
  // ⚡ 网络请求节流拦截
  if (isProcessing.value) return;
  isProcessing.value = true;

  store.debug_message = null;
  try {
    const res = await fetch("/api/sync_state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: store.mode,
        key_name: store.key_name,
        time_signature: store.time_signature, // 🌟 新增：让 Python 后端也能感知到当前小节拍号
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
    alert("无法连通 Python 算法内核！\n请确保后端服务 (uvicorn app:app) 已启动，并且本地代理通畅。");
  } finally {
    isProcessing.value = false;
  }
}

// 单次推进试听（加入物理硬制音机制，彻底消灭疯狂连点时的杂音浆糊）
async function playSingleChord(voices) {
  await Tone.start();
  initAudioEngine();
  await Tone.loaded(); // 🌟 强力保证本地缓存完全就绪
  
  if (globalSynth) {
    // 🌟 绝招 1：利用微秒级级联包络，模拟真实钢琴消音器瞬间压住琴弦
    globalSynth.release = 0.05; // 1. 临时改为极短制音（0.05秒）
    globalSynth.releaseAll();   // 2. 瞬间闷死所有正在轰鸣的旧残音
    globalSynth.release = 1.5;  // 3. 瞬间恢复新音符的自然 1.5 秒呼吸延音
  }
  
  const notes = Object.values(voices).map(midi => Tone.Frequency(midi, "midi").toNote());
  
  // 🌟 绝招 2：改用 triggerAttack 自由发声！
  // 不往未来时间轴硬塞“释放排程”，让它自然流淌，等到下一次点击时被上面的消音器干净利落地捂死
  globalSynth.triggerAttack(notes);
}
// 🌟 新增函数：强行制音并掐断后台梦游的定时器（直接粘帖在 playSequence 的上方）
function stopSequence() {
  playbackTimeouts.forEach(clearTimeout);
  playbackTimeouts = [];
  store.playbackIndex = null;
  isPlaying.value = false; // 播放状态解锁
}
// 🌟 替换：完美 Legato 连奏无缝回放系统（带有一键正反转拦截开关）
async function playSequence() {
  if (store.history.length === 0) return;
  
  // 🌟 核心拦截：如果当前正在播放，用户再次点击此按钮，说明想“停下它”
  // 我们直接调用上面刚写好的 stopSequence() 掐断它，然后直接 return 退出
  if (isPlaying.value) {
    stopSequence();
    return;
  }
  
  stopSequence(); // 先确保上一轮的定时器清理干净
  await Tone.start();
  initAudioEngine();
  await Tone.loaded();

  isPlaying.value = true; // 状态上锁
  const intervalMs = 1000; 
  let currentIndex = 0;

  function playStep() {
    // 安全熔断：如果播放中途用户强行叫停（isPlaying 变假）或者放完了，立刻退出
    if (!isPlaying.value || currentIndex >= store.history.length) {
      store.playbackIndex = null;
      isPlaying.value = false;
      return;
    }

    // 精准联动你的五线谱绿色高亮游标
    store.playbackIndex = currentIndex;
    
    const item = store.history[currentIndex];
    const notes = Object.values(item.voices).map(midi => Tone.Frequency(midi, "midi").toNote());
    const isLast = currentIndex === store.history.length - 1;

    if (globalSynth) {
      globalSynth.release = 0.05;
      globalSynth.releaseAll();
      globalSynth.release = 1.5; 
    }

    if (globalSynth) {
      globalSynth.triggerAttack(notes);
    }

    currentIndex++;
    
    if (isLast) {
      const tLast = setTimeout(() => {
        if (globalSynth) {
          globalSynth.release = 1.5;
          globalSynth.releaseAll();
        }
        store.playbackIndex = null;
        isPlaying.value = false; // 曲终播放完毕，自动解锁
      }, intervalMs * 2.5);
      playbackTimeouts.push(tLast);
    } else {
      const tNext = setTimeout(playStep, intervalMs);
      playbackTimeouts.push(tNext);
    }
  }

  // 鸣枪起跑
  playStep();
}

async function exportMusicXML() {
  if (store.history.length === 0) return;
  
  try {
    const res = await fetch("/api/export_musicxml", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: store.mode,
        key_name: store.key_name,
        time_signature: store.time_signature, // 🌟 新增：使导出的 XML 乐谱小节线拍号不写死为 4/4
        target_melody: store.target_melody,
        history: store.history,
        pending_note: store.pending_note
      })
    });
    
    if (!res.ok) throw new Error("后端导出失败");
    const data = await res.json();
    
    const blob = new Blob([data.xml], { type: "application/vnd.recordare.musicxml+xml" });
    const url = window.URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    
    const cleanKeyName = store.key_name.replace(/\s+/g, '_');
    downloadAnchor.download = `Sposobin_Harmony_${cleanKeyName}.xml`;
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(downloadAnchor);
  } catch (e) {
    console.error(e);
    alert("❌ 乐谱导出失败：请检查 Python 后端服务是否正常运行。");
  }
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

function sendAction(chord) { 
  stopSequence(); // 🌟 新增：点击两侧面板和弦推进时，立刻掐死后台回放
  syncBackend(chord); 
}

function rewindTo(index) { 
  stopSequence(); // 🌟 新增：点击历史节点断点回退时，立刻掐死后台回放
  store.history = store.history.slice(0, index + 1); 
  store.pending_note = null; 
  syncBackend(); 
}

function resetState() { 
  stopSequence(); // 🌟 新增：点击清空画板时，立刻掐死后台回放
  store.history = []; 
  store.target_melody = []; 
  store.pending_note = null; 
  store.playbackIndex = null; 
  store.debug_message = null; 
  syncBackend(); 
}

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

function getPromptText() {
  if (store.mode === 'SOPRANO' || store.mode === 'BASS') return store.target_melody.length > 0 ? '路径穷尽或前方发生法则锁死' : '等待输入旋律序列';
  if (store.mode === 'COMPOSE') return store.pending_note ? '计算可行声部连接中...' : '请在上方键盘选定下一步旋律音';
  return '引擎正在进行通路剪枝排查...';
}

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
  initAudioEngine();
  document.title = "Sposobin Engine V1.3";
  const hasSeenUpdate = localStorage.getItem("seenUpdateReport1.2");
  if (!hasSeenUpdate) {
    showUpdateReportModal.value = true;
    localStorage.setItem("seenUpdateReport1.2", "true");
  }
  syncBackend();
});
</script>

<style>
@import url('./App.css'); 
</style>