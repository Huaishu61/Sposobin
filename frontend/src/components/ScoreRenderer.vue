<template>
  <div class="score-container" ref="containerRef">
    <svg :width="Math.max(900, renderData.nodes.length * 85 + 160)" height="270" class="score-svg">
      
      <g class="staff-lines">
        <!-- 五线谱-->
        <line v-for="i in 5" :key="'t'+i" x1="40" :y1="30 + i*10" x2="100%" :y2="30 + i*10" stroke="#000" stroke-width="1" />
        <line v-for="i in 5" :key="'b'+i" x1="40" :y1="160 + i*10" x2="100%" :y2="160 + i*10" stroke="#000" stroke-width="1" />
       <!-- 左侧竖线-->
        <line x1="40" y1="40" x2="40" y2="210" stroke="#000" stroke-width="2" />
      </g>
      <!-- 花括号 -->
      <text x="30" y="210" class="bravura-text" font-size="170" fill="#0">&#xE000;</text>
      <!-- 谱号 -->
      <text x="65" y="63" class="bravura-text" font-size="40" dy="6">&#xE050;</text> 
      <text x="65" y="185" class="bravura-text" font-size="40" dy="-4">&#xE062;</text> 
      <!-- 调号 -->
      <g v-for="(sig, i) in renderData.sigs" :key="'sig'+i">
        <text :x="90 + i * 10" :y="sig.t_y" class="bravura-text" font-size="37" dy="0">{{ getSMuFLChar(sig.sym) }}</text>
        <text :x="90 + i * 10" :y="sig.b_y" class="bravura-text" font-size="37" dy="0">{{ getSMuFLChar(sig.sym) }}</text>
      </g>

      <g v-for="(node, index) in renderData.nodes" :key="index" 
         :transform="`translate(${105 + (renderData.sigs.length * 12) + index * 85}, 0)`"
         :class="{ 'clickable-node': node.type === 'history' }"
         @click="node.type === 'history' ? $emit('rewind', node.original_index) : null">
        
        <rect v-if="node.type === 'history'" x="-25" y="10" width="50" height="220" rx="8" class="hover-bg" />
        <text v-if="node.type === 'history'" x="0" y="15" text-anchor="middle" font-weight="bold" font-family="Georgia, serif" font-size="16" fill="#E11D48">
          {{ node.chord_display }}
        </text>
        <!-- 音符 -->
        <g v-for="note in node.notes" :key="note.v">
          <text :x="note.x" :y="note.y" class="bravura-text" font-size="48" dy="0" :fill="getNodeColor(node.type)">
            {{ node.type === 'target' ? '𝄽' : '&#xE0A4;' }}
          </text>
          
          <line v-if="node.type !== 'target'"
                :x1="note.x + (note.v === 'S' || note.v === 'T' ? 6.5 : -6.5)" :y1="note.y" 
                :x2="note.x + (note.v === 'S' || note.v === 'T' ? 6.5 : -6.5)" :y2="note.v === 'S' || note.v === 'T' ? note.y - 26 : note.y + 26" 
                :stroke="getNodeColor(node.type)" stroke-width="1.6" />

          <text v-if="note.acc" :x="note.acc_x" :y="note.y" class="bravura-text" font-size="32" dy="1" fill="#0F172A">
            {{ getSMuFLChar(note.acc) }}
          </text>

          <line v-for="ly in note.ledgers" :key="ly" :x1="note.x - 12" :y1="ly" :x2="note.x + 12" :y2="ly" stroke="#0F172A" stroke-width="1.5" />
        </g>
      </g>

      <g class="playhead-layer" v-if="historyLength > 0 || targetMelodyLength > 0">
        <line :x1="playheadX" y1="20" :x2="playheadX" y2="240" stroke="#10B981" stroke-width="2" stroke-dasharray="4,2" />
        <polygon :points="`${playheadX-6},20 ${playheadX+6},20 ${playheadX},30`" fill="#10B981" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';

const props = defineProps({
  renderData: Object,
  historyLength: Number,
  targetMelodyLength: Number,
  playbackIndex: Number
});

const emit = defineEmits(['rewind']);
const containerRef = ref(null);

// 将文本升降号安全映射至 SMuFL 字体物理字符
function getSMuFLChar(sym) {
  if (!sym) return '';
  if (sym === '♭' || sym === '♭') return '\uE260';  // Flat
  if (sym === '♮') return '\uE261';  // Natural
  if (sym === '♯' || sym === '#') return '\uE262';  // Sharp
  if (sym === 'x') return '\uE263';  // Double Sharp
  if (sym === '♭♭') return '\uE264'; // Double Flat
  return sym;
}

function getNodeColor(type) {
  if (type === 'history') return '#0F172A';
  if (type === 'pending') return '#F59E0B'; // 写作模式中的亮黄色探针
  return '#CBD5E1';
}

const playheadX = computed(() => {
  const spacing = 85;
  const startX = 105 + (props.renderData.sigs.length * 12);
  if (props.playbackIndex !== null) return startX + props.playbackIndex * spacing;
  return startX + Math.max(0, props.historyLength - 1) * spacing;
});

// 自适应水平滚动条追踪
watch(playheadX, async (newX) => {
  await nextTick();
  if (!containerRef.value) return;
  const container = containerRef.value;
  const offset = newX - container.clientWidth * 0.382;
  container.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
});
</script>

<style scoped>
/* 注入 Bravura 矢量音乐字体 */
@font-face {
  font-family: 'Bravura';
  src: url('../assets/Bravura.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}

.bravura-text {
  font-family: 'Bravura', sans-serif;
  dominant-baseline: central;
  text-anchor: middle;
  user-select: none;
}

.score-container {
  overflow-x: auto;
  overflow-y: hidden;
  background: #ffffff;
  border-radius: 8px;
  padding: 10px 0;
}
.hover-bg {
  fill: transparent;
  transition: fill 0.2s;
}
.clickable-node:hover .hover-bg {
  fill: rgba(14, 165, 233, 0.06);
  cursor: pointer;
}
</style>