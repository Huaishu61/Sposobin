<template>
  <!-- 乐谱渲染容器：包含横向滚动支持 -->
  <div class="score-container" ref="scoreContainerRef">
    <!-- SVG 画布：宽度根据音符数量动态计算，最低 900px -->
    <svg :width="Math.max(750, renderData.nodes.length * NOTE_SPACING + START_X + 60)"
         height="270" class="score-svg"
         @click="store.replacement_index !== null ? enterReplaceMode(null) : null"
         :style="store.replacement_index !== null ? 'cursor: default;' : ''">

      
      <!-- 谱线系统：高音谱表（5条）+ 低音谱表（5条） -->
      <g class="staff-lines">
        <!-- 高音谱表五线谱，Y 坐标从 TREBLE_TOP(30) 开始，每条间隔 10px -->
        <line v-for="i in 5" :key="'t'+i" x1="35" :y1="STAFF.TREBLE_TOP + i*10" x2="100%" :y2="STAFF.TREBLE_TOP + i*10" 
              :stroke="COLORS.STAFF" stroke-width="1" />
        <!-- 低音谱表五线谱，Y 坐标从 BASS_TOP(160) 开始 -->
        <line v-for="i in 5" :key="'b'+i" x1="35" :y1="STAFF.BASS_TOP + i*10" x2="100%" :y2="STAFF.BASS_TOP + i*10" 
              :stroke="COLORS.STAFF" stroke-width="1" />
      </g>

      <!-- 左侧竖线：连接高低音谱表，与大谱表左端对齐 -->
      <line x1="35" :y1="STAFF.TREBLE_TOP + 10" x2="35" :y2="STAFF.BASS_TOP + 50" 
            :stroke="COLORS.STAFF" stroke-width="1" />

      <!-- 花括号（连谱号）：Bravura 字体 U+E000 -->
      <text x="25" y="210" font-size="170" 
            :fill="COLORS.STAFF" font-family="'Bravura'" dominant-baseline="central" text-anchor="middle">&#xE000;</text>
      
      <!-- 高音谱号（G 谱号）：Bravura U+E050 -->
      <text x="55" y="70" font-size="44" :fill="COLORS.STAFF" font-family="'Bravura'"
            dominant-baseline="central" text-anchor="middle">&#xE050;</text>
      <!-- 低音谱号（F 谱号）：Bravura U+E062 -->
      <text x="55" y="180" font-size="40" :fill="COLORS.STAFF" font-family="'Bravura'"
            dominant-baseline="central" text-anchor="middle">&#xE062;</text>

      <!-- 调号：根据当前调性显示升号或降号，上下谱表同步显示 -->
      <g v-for="(sig, i) in keySignatures" :key="'sig'+i">
        <!-- 高音谱表调号 -->
        <text :x="80 + i * SIG_SPACING" :y="sig.t_y" :dy="getAccDy(sig.sym)" font-size="34" 
              :fill="COLORS.ACCIDENTAL" font-family="'Bravura'" dominant-baseline="central" text-anchor="middle">{{ sig.sym }}</text>
        <!-- 低音谱表调号 -->
        <text :x="80 + i * SIG_SPACING" :y="sig.b_y" :dy="getAccDy(sig.sym)" font-size="34" 
              :fill="COLORS.ACCIDENTAL" font-family="'Bravura'" dominant-baseline="central" text-anchor="middle">{{ sig.sym }}</text>
      </g>

      <!-- 音符节点：每个和弦一个节点，包含四声部音符 -->
      <g v-for="(node, index) in renderData.nodes" :key="index"
         :transform="`translate(${START_X + keySignatures.length * SIG_SPACING + index * NOTE_SPACING}, 0)`"
         :class="{ 'clickable-node': node.type === 'history' }"
         @click.stop="node.type === 'history' ? enterReplaceMode(node.original_index) : null">

        <!-- 可点击背景区：仅历史和弦显示 -->
        <rect v-if="node.type === 'history'" x="-25" y="10" width="50" height="250" rx="8" :class="node.isGhost ? 'ghost-bg' : 'hover-bg'" />
        <!-- 和弦名称：显示在谱表下方 -->
        <text v-if="node.type === 'history'" x="0" y="260" text-anchor="middle" font-weight="normal"
              font-family="'LCBSposobin'" font-size="22" :fill="node.isGhost ? '#666' : '#000'">
          <template v-if="typeof node.chord_display === 'object'">
            <tspan>{{ node.chord_display.base }}</tspan>
            <tspan font-size="14" dy="-8" dx="2">{{ node.chord_display.sup }}</tspan>
          </template>
          <template v-else>
            {{ node.chord_display }}
          </template>
        </text>

        <!-- 四声部音符：S(女高)、A(女低)、T(男高)、B(男低) -->
        <g v-for="note in node.notes" :key="note.v">
          <!-- 全音符符头：Bravura U+E0A2，空心椭圆 -->
          <text :x="note.x" :y="note.y" font-size="40" font-family="'Bravura'" text-anchor="middle"
                dominant-baseline="central"
                 :fill="node.isGhost ? '#888' : (node.type === 'history' ? '#000' : (node.type === 'pending' ? '#666' : '#999'))"
                 :stroke="node.type === 'pending' ? '#666' : 'none'"
                :stroke-width="node.type === 'pending' ? '1' : '0'">&#xE0A2;</text>
          <!-- 临时升降号 -->
          <text v-if="note.acc" :x="note.acc_x" :y="note.y" :dy="getAccDy(note.acc)" font-size="34"
                :fill="node.isGhost ? '#888' : (node.type === 'history' ? '#000' : (node.type === 'pending' ? '#666' : '#999'))" font-family="'Bravura'" dominant-baseline="central">{{ note.acc }}</text>
          <!-- 加线 -->
          <line v-for="ly in note.ledgers" :key="ly" :x1="note.x - 15" :y1="ly" :x2="note.x + 15" :y2="ly"
                :stroke="node.isGhost ? '#bbb' : (node.type === 'target' ? '#999' : '#000')" stroke-width="1.5" />
        </g>
      </g>

      <!-- 播放头：半透明矩形背景 -->
      <g class="playhead-layer" v-if="store.history.length > 0 || store.target_melody.length > 0 || store.pending_note || store.replacement_index !== null">
        <rect :x="playheadX - 25" y="10" width="50" height="250" rx="8" fill="rgba(0, 0, 0, 0.04)" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { store, syncState } from '../../engine/store.js';
import { KEY_REGISTRY, spell_midi } from '../../engine/tonality/index.js';
import { PITCH_Y } from '../../engine/data/index.js';
import { formatChordName } from '../../engine/utils/formatter.js';

// ============ 常量定义 ============
/** 和弦横向间距：每个和弦占 85 像素 */
const NOTE_SPACING = 85;
  /** 音符起始 X 坐标：谱号、调号之后的位置 */
  const START_X = 115;
/** 调号间距：每个升降号间隔 14 像素 */
const SIG_SPACING = 10;

/** 谱表 Y 坐标配置 */
const STAFF = {
  /** 高音谱表顶部 Y 坐标（第一线） */
  TREBLE_TOP: 30,
  /** 低音谱表顶部 Y 坐标（第一线） */
  BASS_TOP: 160,
};

/** 颜色配置 */
const COLORS = {
  /** 谱线、谱号、花括号颜色 */
  STAFF: '#000',
  /** 调号、临时升降号颜色 */
  ACCIDENTAL: '#000',
};

/** 声部顺序：[声部名, 是否低音谱表] */
const VOICE_ORDER = [['S', false], ['A', false], ['T', true], ['B', true]];

/** 调号位置表：升/降号在高音/低音谱表上的 Y 坐标 */
const SIG_POSITIONS = {
  sharp: { treble: [40, 55, 35, 50, 65, 45, 60], bass: [180, 195, 175, 190, 205, 185, 200] },
  flat: { treble: [60, 45, 65, 50, 70, 55, 75], bass: [200, 185, 205, 190, 210, 195, 215] },
};

/** 调号变音顺序：标准五度圈顺序，对应音级索引 */
const KEY_SIG_ORDERS = {
  /** 升号顺序：F(3), C(0), G(4), D(1), A(5), E(2), B(6) */
  sharp: [3, 0, 4, 1, 5, 2, 6],
  /** 降号顺序：B(6), E(2), A(5), D(1), G(4), C(0), F(3) */
  flat: [6, 2, 5, 1, 4, 0, 3],
};

/** 临时变音记号映射：Bravura SMuFL 编码 */
const ACC_MAP = { "-2": "\uE264", "-1": "\uE260", "0": "\uE261", "1": "\uE262", "2": "\uE263" };
/** 调号符号映射 */
const SIG_SYMBOLS = { sharp: "\uE262", flat: "\uE260" };

// ============ 响应式引用 ============
/** 乐谱容器 DOM 引用，用于滚动控制 */
const scoreContainerRef = ref(null);

// ============ 计算属性 ============
/**
 * 当前调性信息
 * 从 KEY_REGISTRY 获取，并附加当前应用模式
 */
const keyInfo = computed(() => {
  const ki = { ...KEY_REGISTRY[store.key_name] };
  ki.app_mode = store.mode;
  return ki;
});

/**
 * 调号列表
 * 根据当前调性的升降号数量和类型，生成调号渲染数据
 * 每个调号包含：符号(sym)、高音谱表Y(t_y)、低音谱表Y(b_y)
 */
const keySignatures = computed(() => {
  const { sigs: count, sig_type: type } = keyInfo.value;
  if (count === 0 || type === 'none') return [];
  const positions = SIG_POSITIONS[type];
  const symbol = SIG_SYMBOLS[type];
  return Array.from({ length: count }, (_, i) => ({
    sym: symbol,
    t_y: positions.treble[i],
    b_y: positions.bass[i],
  }));
});

/**
 * 调号变音映射表
 * 记录每个音级（0-6）被调号改变的音高偏移量：
 * - 0: 无变化
 * - 1: 升半音（升号调）
 * - -1: 降半音（降号调）
 */
const keySigAlts = computed(() => {
  const { sigs: count, sig_type: type } = keyInfo.value;
  const alts = Array(7).fill(0);
  if (type === 'sharp' || type === 'flat') {
    const order = KEY_SIG_ORDERS[type];
    for (let i = 0; i < count; i++) alts[order[i]] = type === 'sharp' ? 1 : -1;
  }
  return alts;
});

/**
 * 历史和弦节点列表
 * 遍历 store.history，为每个和弦生成渲染数据：
 * 1. 使用 spell_midi 将 MIDI 转换为音符名、音级、变音、八度
 * 2. 查表 PITCH_Y 获取 SVG Y 坐标
 * 3. 检测小二度碰撞（同和弦内两音相差小二度时右移音符）
 * 4. 对比调号/running_accidentals 决定是否需要临时变音记号
 * 5. 计算加线（超出谱表的音符）
 * 
 * @returns {Array} 每个元素包含：type, chord_display, notes[], original_index
 */
const historyNodes = computed(() => {
  const ki = keyInfo.value;
  const alts = keySigAlts.value;
  /** 跨小节运行的临时变音状态：key -> alteration，用于判断同一小节内后续同音名是否需要重复变音 */
  const running = {};

  return store.history.map((item, index) => {
    const { chord, voices } = item;
    const isGhost = store.replacement_index !== null && index >= store.replacement_index;
    const node = { type: 'history', chord_display: formatChordName(chord), notes: [], original_index: index, isGhost };

    // 第一步：拼写所有声部的音符信息
    const spells = {};
    VOICE_ORDER.forEach(([v, isBass]) => {
      spells[v] = spell_midi(voices[v], ki, chord);
    });

    // 第二步：计算每个声部的 Y 坐标（查表 PITCH_Y）
    const yPositions = {};
    VOICE_ORDER.forEach(([v, isBass]) => {
      const [letter, , , octave] = spells[v];
      yPositions[v] = PITCH_Y[`${letter}${octave}${isBass ? '_bass' : ''}`];
    });

    // 计算同度偏移：同一 Y 上的声部按 SATB 优先级排名，依次右移
    const voiceRanks = {};
    const yToVoices = {};
    VOICE_ORDER.forEach(([v]) => {
      const y = yPositions[v];
      if (y == null) return;
      if (!yToVoices[y]) yToVoices[y] = [];
      yToVoices[y].push(v);
    });
    Object.values(yToVoices).forEach(group => {
      group.sort((a, b) => {
        const idxA = VOICE_ORDER.findIndex(([vv]) => vv === a);
        const idxB = VOICE_ORDER.findIndex(([vv]) => vv === b);
        return idxA - idxB;
      });
      group.forEach((v, rank) => { voiceRanks[v] = rank; });
    });

    // 第三步：确定哪些声部需要绘制临时变音记号
    // 规则：当前变音 ≠ 调号变音 且 ≠ 本小节前面出现过的同音名变音
    const drawnAcc = {};
    VOICE_ORDER.forEach(([v, isBass]) => {
      const [, step, alt] = spells[v];
      const y = yPositions[v];
      if (y == null) return;
      // 键格式：谱表(0/1)_八度_音级
      const key = `${isBass ? 1 : 0}_${spells[v][3]}_${step}`;
      const curr = running[key] !== undefined ? running[key] : alts[step];
      if (alt !== curr) drawnAcc[v] = { y, alt, key };
    });

    // 第四步：构建每个声部的渲染数据
    VOICE_ORDER.forEach(([v, isBass]) => {
      const y = yPositions[v];
      if (y == null) return;

      // 检测小二度碰撞：同和弦内两音相差小二度（Y 差 = 5px）时右移
      const shifted = Object.entries(yPositions).some(
        ([ov, oy]) => ov !== v && oy != null && oy - y === 5
      );
      const unisonShift = (voiceRanks[v] || 0) * 16;
      const x = unisonShift + (shifted ? 16 : 0);

      // 计算临时变音记号的位置
      let acc = '';
      let accX = 0;
      if (drawnAcc[v]) {
        const { alt, key } = drawnAcc[v];
        acc = ACC_MAP[String(alt)] || '';
        running[key] = alt; // 更新本小节运行状态
        // 默认偏移：右移音符时 -3，否则 -18
        accX = shifted ? -3 : -18;
        // 避让检测：如果上方有其他变音记号，额外左移避免重叠
        const hasAbove = Object.entries(drawnAcc).some(
          ([ov, o]) => ov !== v && o.y < y && y - o.y <= 11
        );
        if (!shifted && hasAbove) accX = -28;
      }

      node.notes.push({ v, y, x, acc, acc_x: accX, ledgers: calcLedgers(y, isBass), is_bass: isBass });
    });

    return node;
  });
});

/**
 * 虚影音符（待输入/目标旋律）
 * 显示在历史和弦之后，提示用户下一步：
 * - pending：当前等待输入的旋律音（黄色问号）
 * - target：高音题模式下尚未填充的目标旋律（虚线轮廓）
 */
const ghostNotes = computed(() => {
  const ki = keyInfo.value;
  const notes = [];

  // 待输入音符（自由模式/旋律写作模式）
  if (store.pending_note !== null) {
    const [letter, step, alt, octave] = spell_midi(store.pending_note, ki, '');
    const y = PITCH_Y[`${letter}${octave}`] || 90;
    const keyAlt = keySigAlts.value[step];
    const acc = alt !== keyAlt ? (ACC_MAP[String(alt)] || '') : '';
    const accX = acc ? -18 : 0;
    notes.push({
      type: 'pending', chord_display: '?',
      notes: [{ v: 'S', y, x: 0, acc, acc_x: accX, ledgers: calcLedgers(y, false), is_bass: false }],
    });
  }
  // 高音题模式下，显示剩余未填充的目标旋律
  else if (store.target_melody?.length > 0 && store.mode === 'SOPRANO' && store.history.length < store.target_melody.length) {
    for (let i = store.history.length; i < store.target_melody.length; i++) {
      const [letter, step, alt, octave] = spell_midi(store.target_melody[i], ki, '');
      const y = PITCH_Y[`${letter}${octave}`] || 90;
      const keyAlt = keySigAlts.value[step];
      const acc = alt !== keyAlt ? (ACC_MAP[String(alt)] || '') : '';
      const accX = acc ? -18 : 0;
      notes.push({
        type: 'target', chord_display: '',
        notes: [{ v: 'S', y, x: 0, acc, acc_x: accX, ledgers: calcLedgers(y, false), is_bass: false }],
      });
    }
  }
  // 低音题模式下，显示剩余未填充的目标低音旋律
  else if (store.target_bass?.length > 0 && store.mode === 'BASS' && store.history.length < store.target_bass.length) {
    for (let i = store.history.length; i < store.target_bass.length; i++) {
      const [letter, step, alt, octave] = spell_midi(store.target_bass[i], ki, '');
      const y = PITCH_Y[`${letter}${octave}_bass`] || 210;
      const keyAlt = keySigAlts.value[step];
      const acc = alt !== keyAlt ? (ACC_MAP[String(alt)] || '') : '';
      const accX = acc ? -18 : 0;
      notes.push({
        type: 'target', chord_display: '',
        notes: [{ v: 'B', y, x: 0, acc, acc_x: accX, ledgers: calcLedgers(y, true), is_bass: true }],
      });
    }
  }

  return notes;
});

/**
 * 最终渲染数据
 * 汇总调号和所有音符节点（历史 + 虚影）
 */
const renderData = computed(() => ({
  sigs: keySignatures.value,
  nodes: [...historyNodes.value, ...ghostNotes.value],
}));

/**
 * 播放头 X 坐标
 * 根据当前播放位置或历史长度计算：
 * - 播放中：跟随 playbackIndex
 * - 未播放：始终指向下一个待输入位置
 */
const playheadX = computed(() => {
  const startX = START_X + keySignatures.value.length * SIG_SPACING;
  if (store.playbackIndex !== null) return startX + store.playbackIndex * NOTE_SPACING;
  // 替换模式下，光标在替换位置
  if (store.replacement_index !== null) return startX + store.replacement_index * NOTE_SPACING;
  const idx = store.history.length;
  if (store.target_melody.length > 0 && idx < store.target_melody.length) return startX + idx * NOTE_SPACING;
  if (store.target_bass.length > 0 && idx < store.target_bass.length) return startX + idx * NOTE_SPACING;
  return startX + store.history.length * NOTE_SPACING;
});

// ============ 监听器 ============
/**
 * 播放头位置变化时自动滚动
 * 使用黄金分割比例（0.382）定位播放头在视口中的位置
 */
watch(playheadX, async (newX) => {
  await nextTick();
  if (!scoreContainerRef.value) return;
  const container = scoreContainerRef.value;
  const offset = container.clientWidth * 0.382;
  const target = newX - offset;
  container.scrollTo({ left: target > 0 ? target : 0, behavior: 'smooth' });
});

// ============ 工具函数 ============
/**
 * 计算加线位置
 * 当音符超出谱表范围时，需要绘制辅助短线：
 * - 高音谱表：Y > 90（下加线）或 Y < 30（上加线）
 * - 低音谱表：Y < 160（上加线）或 Y > 220（下加线）
 * @param {number} y - 音符 Y 坐标
 * @param {boolean} isBass - 是否在低音谱表
 * @returns {number[]} 加线 Y 坐标数组
 */
function calcLedgers(y, isBass) {
  const ledgers = [];
  if (!isBass) {
    if (y >= 90) for (let ly = 90; ly <= y; ly += 10) ledgers.push(ly);
    if (y <= 30) for (let ly = 30; ly >= y; ly -= 10) ledgers.push(ly);
  } else {
    if (y <= 160) for (let ly = 160; ly >= y; ly -= 10) ledgers.push(ly);
    if (y >= 220) for (let ly = 220; ly <= y; ly += 10) ledgers.push(ly);
  }
  return ledgers;
}

/**
 * 获取变音记号的垂直微调偏移
 * @param {string} sym - 变音记号 Bravura 字符
 * @returns {number} dy 偏移量（像素）
 */
function getAccDy(sym) {
  return 0;
}

/**
 * 进入替换模式：将指定历史节点设为可替换目标
 * 被替换位置及之后的节点会显示为灰色 ghost
 * @param {number|null} index - 目标节点索引，null 表示取消替换
 */
function enterReplaceMode(index) {
  if (index === null || store.replacement_index === index) {
    // null 或再次点击同一节点则取消替换
    store.replacement_index = null;
    store.pending_note = null;
  } else {
    store.replacement_index = index;
    // COMPOSE 模式下，设置 pending_note 为对应位置的旋律音
    if (store.mode === 'COMPOSE' && store.target_melody[index] !== undefined) {
      store.pending_note = store.target_melody[index];
    }
  }
  syncState();
}
</script>

<style scoped>
/* 乐谱容器 */
.score-container {
  -webkit-user-select: none;
  user-select: none;
  background: #fff;
  overflow: auto hidden;
}

/* thin horizontal scrollbar */
.score-container::-webkit-scrollbar {
  height: 3px;
}

.score-container::-webkit-scrollbar-track {
  background: transparent;
}

.score-container::-webkit-scrollbar-thumb {
  background: #000;
  border-radius: 0;
}

/* SVG 画布 */
.score-svg {
  display: block;
}

/* 可点击节点：历史和弦 */
.clickable-node {
  cursor: pointer;
}

/* 悬浮背景：默认透明 */
.clickable-node .hover-bg {
  fill: transparent;
  transition: all 0.2s;
}

/* ghost 节点背景 */
.clickable-node .ghost-bg {
  fill: transparent;
  transition: all 0.2s;
}

/* 悬浮背景：鼠标悬停时显示淡灰 */
.clickable-node:hover .hover-bg,
.clickable-node:hover .ghost-bg {
  fill: rgba(0, 0, 0, 0.04);
}


</style>
