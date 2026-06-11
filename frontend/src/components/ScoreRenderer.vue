<!--
  ScoreRenderer.vue —— 四声部和弦乐谱渲染组件
  ============================================
  该组件负责将后台传来的和声数据（renderData）渲染为可视化五线谱，
  支持调号、拍号、小节线、播放游标、历史回退点击等交互功能。
  使用 Bravura 音乐字体（SMuFL 标准）绘制音符和符号。
-->

<template>
  <div class="score-container" ref="containerRef">
    <svg :width="Math.max(900, (renderData.nodes && renderData.nodes.length > 0) ? getNodeX(renderData.nodes.length - 1) + layout.nodeSpacing + 50 : 900)" height="300" class="score-svg">
      
      <g transform="translate(0, 25)">
        
        <g class="staff-lines">
          <line v-for="i in 5" :key="'t'+i" x1="40" :y1="30 + i*10" x2="100%" :y2="30 + i*10" stroke="#000" stroke-width="1" />
          <line v-for="i in 5" :key="'b'+i" x1="40" :y1="160 + i*10" x2="100%" :y2="160 + i*10" stroke="#000" stroke-width="1" />
          <line x1="40" y1="40" x2="40" y2="210" stroke="#000" stroke-width="2" />
        </g>
        
        <text x="30" y="210" class="bravura-text" font-size="170" fill="#0">&#xE000;</text>
        <text x="65" y="63" class="bravura-text" font-size="40" dy="6">&#xE050;</text> 
        <text x="65" y="185" class="bravura-text" font-size="40" dy="-4">&#xE062;</text> 

        <g v-for="(sig, i) in renderData.sigs" :key="'sig'+i">
          <text :x="layout.sigStartX + i * layout.sigSpacing" :y="sig.t_y" class="bravura-text" font-size="37" dy="0">{{ getSMuFLChar(sig.sym) }}</text>
          <text :x="layout.sigStartX + i * layout.sigSpacing" :y="sig.b_y" class="bravura-text" font-size="37" dy="0">{{ getSMuFLChar(sig.sym) }}</text>
        </g>

        <g v-if="timeSignature" class="time-signature-layer" 
           :transform="`translate(${layout.sigStartX + (renderData.sigs ? renderData.sigs.length * layout.sigSpacing : 0) + 12}, 0)`">
          
          <text x="0" y="50" class="bravura-text" font-size="42" text-anchor="middle">
            {{ String.fromCharCode(0xE080 + Number(timeSignature.split('/')[0])) }}
          </text>
          <text x="0" y="70" class="bravura-text" font-size="42" text-anchor="middle">
            {{ String.fromCharCode(0xE080 + Number(timeSignature.split('/')[1])) }}
          </text>

          <text x="0" y="180" class="bravura-text" font-size="42" text-anchor="middle">
            {{ String.fromCharCode(0xE080 + Number(timeSignature.split('/')[0])) }}
          </text>
          <text x="0" y="200" class="bravura-text" font-size="42" text-anchor="middle">
            {{ String.fromCharCode(0xE080 + Number(timeSignature.split('/')[1])) }}
          </text>
        </g>

        <!--
          🌟 小节线层
          核心修改：让小节线永远固定落在左侧和弦的一半步长处（保持左侧标准的紧凑距离）。
          这样一来，getNodeX 里额外加的那些大间距留白（如 12px extraBarSpacing），
          就会全部完美地释放在小节线的右侧，形成视觉上"偏向右侧和弦"的高级排版质感！
        -->
        <g class="barlines-layer">
          <template v-for="(node, index) in renderData.nodes" :key="'bar-' + index">
            <line 
              v-if="beatsPerMeasure && (index + 1) % beatsPerMeasure === 0 && index < renderData.nodes.length - 1"
              :x1="getNodeX(index + 1) - layout.nodeSpacing / 2" 
              :y1="40" 
              :x2="getNodeX(index + 1) - layout.nodeSpacing / 2" 
              :y2="210"
              stroke="#000" 
              stroke-width="1.6"
            />
          </template>
        </g>

        <g v-for="(node, index) in renderData.nodes" :key="index" 
          :transform="`translate(${getNodeX(index)}, 0)`"
          :class="{ 'clickable-node': node.type === 'history' }"
          @click="node.type === 'history' ? $emit('rewind', node.original_index) : null">
          
          <rect v-if="node.type === 'history'" x="-25" y="-18" width="50" height="250" rx="8" class="hover-bg" />
          
          <text v-if="node.type === 'history'" x="0" y="-5" text-anchor="middle" font-weight="500" font-family="'Lora', 'Georgia', serif" font-size="16" fill="#E11D48">
            {{ node.chord_display }}
          </text>
          
          <g v-for="note in node.notes" :key="note.v">
            <text :x="note.x" :y="note.y" class="bravura-text" font-size="48" dy="0" :fill="getNodeColor(node.type)">
              &#xE0A4;
            </text>

            <line :x1="note.x + (note.v === 'S' || note.v === 'T' ? 6.5 : -6.5)" :y1="note.y" 
                  :x2="note.x + (note.v === 'S' || note.v === 'T' ? 6.5 : -6.5)" :y2="note.v === 'S' || note.v === 'T' ? note.y - 26 : note.y + 26" 
                  :stroke="getNodeColor(node.type)" stroke-width="1.6" />

            <text v-if="note.acc" :x="note.acc_x" :y="note.y" class="bravura-text" font-size="32" dy="1" fill="#0F172A">
              {{ getSMuFLChar(note.acc) }}
            </text>
            <line v-for="ly in note.ledgers" :key="ly" :x1="note.x - 12" :y1="ly" :x2="note.x + 12" :y2="ly" stroke="#0F172A" stroke-width="1.5" />
          </g>
        </g>

        <g class="playhead-layer" v-if="historyLength > 0 || targetMelodyLength > 0">
          <line :x1="playheadX" y1="-15" :x2="playheadX" y2="240" stroke="#10B981" stroke-width="2" stroke-dasharray="4,2" />
          <polygon :points="`${playheadX-6},-15 ${playheadX+6},-15 ${playheadX},-5`" fill="#10B981" />
        </g>
        
      </g> 
    </svg>
  </div>
</template>

<script setup>
/**
 * ScoreRenderer.vue —— 四声部和弦乐谱渲染组件（组合式 API）
 * =========================================================
 * 功能：
 *   - 将后台生成的 renderData 渲染为高音/低音双谱表五线谱
 *   - 支持调号（升降号）、拍号、小节线等乐谱基本元素
 *   - 支持播放游标随 playbackIndex 移动，并自动滚动视图
 *   - 历史节点可点击，点击后触发 "rewind" 事件回退到指定步数
 */

import { computed, ref, watch, nextTick } from 'vue';

// ============================================================
// 1. 属性定义（Props）
// ============================================================

/** 组件接收的所有属性 */
const props = defineProps({
  /** 渲染数据：包含调号数组(sigs)、和声节点数组(nodes)等 */
  renderData: Object,
  /** 已弹奏历史节点数量（用于游标回退定位） */
  historyLength: Number,
  /** 目标旋律节点数量 */
  targetMelodyLength: Number,
  /** 当前播放到的索引位置（若为 null 则游标停在末尾） */
  playbackIndex: Number,
  /** 全局拍号字符串，格式如 "4/4"、"3/4"、"2/4" 等 */
  timeSignature: {
    type: String,
    default: '4/4'
  }
});

// ============================================================
// 2. 计算属性
// ============================================================

/**
 * 每小节包含的拍数（即每小节几个和弦/节点）
 * 从拍号字符串中解析分子部分得出
 * 如 "4/4" → 4 拍，"3/4" → 3 拍，"6/8" → 6 拍
 */
const beatsPerMeasure = computed(() => {
  if (!props.timeSignature) return 4;
  return parseInt(props.timeSignature.split('/')[0]) || 4;
});

// ============================================================
// 3. 事件与模板引用
// ============================================================

/** 组件向外发射的事件 */
const emit = defineEmits(['rewind']);

/** 滚动容器的模板引用 */
const containerRef = ref(null);

// ============================================================
// 4. 画布布局参数
// ============================================================

/**
 * 乐谱画布的核心布局参数（响应式计算）
 *
 * 布局结构（从左到右）：
 * 谱号 → 调号（多个升降号） → 拍号 → 和声节点（等距排列）
 */
const layout = computed(() => {
  const sigCount = props.renderData?.sigs?.length || 0;

  const sigStartX = 92;     // 第一个升降号落脚的 X 坐标
  const sigSpacing = 11;    // Bravura 字体下每个升降号紧凑排布的间距
  const nodeSpacing = 55;   // 两组和弦之间的水平跨度间距（步长）

  // 1. 计算调号线结束时的绝对 X 坐标位置
  const keySigEnd = sigStartX + (sigCount * sigSpacing);

  // 2. 计算拍号所占用的绝对物理宽度
  // 在 template 中，Bravura 拍号在 keySigEnd 基础上向右 translate 了 12px，
  // 并且文本是居中对齐（text-anchor="middle"），所以它会向左蔓延 12px，向右蔓延 12px。
  // 这意味着拍号的右边缘，刚好精准落在 keySigEnd + 24px 的地方！
  const timeSigWidth = props.timeSignature ? 24 : 0;

  // 🌟 3. 核心修改：遵循正统乐谱排版规范
  // 第一组和弦和拍号（右边缘）之间的间距，动态绑定为两组和弦间距（nodeSpacing）的二分之一！
  // 如果当前题目没有拍号，则给一个标准的基础和弦留白（15px）
  const paddingAfterControls = props.timeSignature ? (nodeSpacing / 1.7) : 15;

  // 4. 全动态矩阵推导：第一组和弦的绝对起点 X 坐标
  // 完美形成了链条：调号终点 ➔ 拍号物理宽度 ➔ 严格二分之一的和弦步长留白
  const firstNodeX = keySigEnd + timeSigWidth + paddingAfterControls;

  return {
    sigStartX,
    sigSpacing,
    firstNodeX,
    nodeSpacing
  };
});

/**
 * 播放游标的水平位置
 * 🌟 核心同步：彻底对接上面算出的自适应 getNodeX 函数，确保任何时候游标与符头绝对重合
 */
const playheadX = computed(() => {
  if (props.playbackIndex !== null && props.playbackIndex !== undefined) {
    return getNodeX(props.playbackIndex);
  }
  return getNodeX(Math.max(0, props.historyLength - 1));
});

// ============================================================
// 5. 工具函数
// ============================================================

/**
 * 将音乐符号名称转换为 SMuFL 字体对应的 Unicode 字符
 *
 * @param {string} sym - 符号名称，如 "♭"、"♯"、"#"、"x"、"♭♭" 等
 * @returns {string} SMuFL 字体对应的 Unicode 字符编码
 */
function getSMuFLChar(sym) {
  if (!sym) return '';
  if (sym === '♭') return '\uE260';   // 降号 (Flat)
  if (sym === '♮') return '\uE261';   // 还原号 (Natural)
  if (sym === '♯' || sym === '#') return '\uE262';  // 升号 (Sharp)
  if (sym === 'x') return '\uE263';    // 重升号 (Double Sharp)
  if (sym === '♭♭') return '\uE264';  // 重降号 (Double Flat)
  return sym;
}

/**
 * 根据节点类型返回对应的 SVG 填充颜色
 *
 * @param {string} type - 节点类型："history"（已弹奏）、"pending"（待弹奏）、其他（目标提示）
 * @returns {string} 十六进制颜色值
 */
function getNodeColor(type) {
  if (type === 'history') return '#0F172A';   // 深灰/黑色 — 已弹奏历史
  if (type === 'pending') return '#F59E0B';   // 琥珀色 — 待弹奏提示
  return '#CBD5E1';                            // 浅灰 — 目标参考
}
/**
 * 🌟 核心新增：全自适应 X 轴坐标计算函数
 * 自动根据当前和弦前面跨过的小节线数量，在几何上拉大有小节线处的间距
 */
function getNodeX(index) {
  const { firstNodeX, nodeSpacing } = layout.value;
  
  // 1. 算出当前和弦索引（从0开始）前面，已经完整经历过了几个小节线
  const barCount = Math.floor(index / beatsPerMeasure.value);
  
  // 🌟 核心调整参数：有小节线的地方，你想让两组和弦之间额外“多空出”多少像素？
  // 默认设置为 16 像素，你可以根据视觉体验随时在这里拨动这个数字！
  const extraBarSpacing = 12; 
  
  // 2. 最终坐标 = 初始起点 + 标准等距步长 + 小节线累积留白加成
  return firstNodeX + index * nodeSpacing + (barCount * extraBarSpacing);
}
// ============================================================
// 6. 副作用（Side Effects）
// ============================================================

/**
 * 监听播放游标位置变化，自动滚动容器使游标保持在黄金分割比位置
 *
 * 使用 0.382（黄金分割比的小值）作为偏移系数，
 * 让游标大约位于容器左侧 38.2% 的位置，提供更好的视觉预览空间
 */
watch(playheadX, async (newX) => {
  await nextTick();
  if (!containerRef.value) return;
  const container = containerRef.value;
  const offset = newX - container.clientWidth * 0.382;
  container.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
});
</script>

<style scoped>
/*
 * ============================================================
 * Bravura 音乐字体样式
 * 用于渲染 SMuFL 标准音符、谱号、升降号等音乐符号
 * ============================================================
 */
.bravura-text {
  font-family: 'Bravura', sans-serif; /* 使用 Bravura 音乐字体 */
  dominant-baseline: central;          /* 垂直居中基线对齐 */
  text-anchor: middle;                 /* 水平居中对齐 */
  user-select: none;                   /* 禁止文本选中，避免干扰交互 */
}

/*
 * ============================================================
 * 五线谱滚动容器
 * ============================================================
 */
.score-container {
  overflow-x: auto;   /* 水平方向可滚动（应对超宽乐谱） */
  overflow-y: hidden; /* 垂直方向禁止滚动 */
  background: #ffffff; /* 白色背景，模拟纸质乐谱 */
  border-radius: 8px;  /* 圆角 */
  padding: 10px 0;     /* 上下内边距 */
}

/*
 * ============================================================
 * 节点悬浮高亮背景
 * ============================================================
 */
.hover-bg {
  fill: transparent;              /* 默认透明（不可见） */
  transition: fill 0.2s;          /* 颜色过渡动画，0.2 秒完成 */
}

/*
 * ============================================================
 * 可点击节点的悬浮效果
 * ============================================================
 */
.clickable-node:hover .hover-bg {
  fill: rgba(14, 165, 233, 0.06); /* 浅蓝色半透明背景，提示可点击 */
  cursor: pointer;                 /* 手型光标 */
}
</style>