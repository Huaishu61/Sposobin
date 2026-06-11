<template>
  <div class="score-container" ref="containerRef">
    <svg :width="Math.max(900, layout.firstNodeX + renderData.nodes.length * layout.nodeSpacing + 50)" height="300" class="score-svg">
      
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

        <g v-for="(node, index) in renderData.nodes" :key="index" 
           :transform="`translate(${layout.firstNodeX + index * layout.nodeSpacing}, 0)`"
           :class="{ 'clickable-node': node.type === 'history' }"
           @click="node.type === 'history' ? $emit('rewind', node.original_index) : null">
          
          <rect v-if="node.type === 'history'" x="-25" y="-18" width="50" height="250" rx="8" class="hover-bg" />
          
          <text v-if="node.type === 'history'" x="0" y="-5" text-anchor="middle" font-weight="500" font-family="'Lora', 'Georgia', serif" font-size="16" fill="#E11D48">
            {{ node.chord_display }}
          </text>
          
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
          <line :x1="playheadX" y1="-15" :x2="playheadX" y2="240" stroke="#10B981" stroke-width="2" stroke-dasharray="4,2" />
          <polygon :points="`${playheadX-6},-15 ${playheadX+6},-15 ${playheadX},-5`" fill="#10B981" />
        </g>
        
      </g> </svg>
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

// 🌟 核心：统一的物理画布矩阵参数
const layout = computed(() => {
  const sigCount = props.renderData?.sigs?.length || 0;
  
  const clefWidth = 30;     // 谱号占据的估计宽度
  const sigStartX = 92;     // 第一个升降号落脚的 X 坐标
  const sigSpacing = 11;    // Bravura 字体下每个升降号紧凑排布的间距
  const paddingAfterSig = 30; // 调号写完之后，距离第一个和声节点的安全空隙
  const nodeSpacing = 85;   // 每个和弦之间的跨度保持 85

  // 动态计算第一个音符应该渲染在哪
  const firstNodeX = sigCount > 0 
    ? sigStartX + (sigCount * sigSpacing) + paddingAfterSig 
    : sigStartX + paddingAfterSig - 10; // 无调号时给个好看的默认紧凑值

  return {
    sigStartX,
    sigSpacing,
    firstNodeX,
    nodeSpacing
  };
});

// 🌟 修正游标的定位逻辑，也跟动态起点绑定
const playheadX = computed(() => {
  const { firstNodeX, nodeSpacing } = layout.value;
  if (props.playbackIndex !== null) {
    return firstNodeX + props.playbackIndex * nodeSpacing;
  }
  return firstNodeX + Math.max(0, props.historyLength - 1) * nodeSpacing;
});

function getSMuFLChar(sym) {
  if (!sym) return '';
  if (sym === '♭') return '\uE260';  
  if (sym === '♮') return '\uE261';  
  if (sym === '♯' || sym === '#') return '\uE262';  
  if (sym === 'x') return '\uE263';  
  if (sym === '♭♭') return '\uE264'; 
  return sym;
}

function getNodeColor(type) {
  if (type === 'history') return '#0F172A';
  if (type === 'pending') return '#F59E0B'; 
  return '#CBD5E1';
}

watch(playheadX, async (newX) => {
  await nextTick();
  if (!containerRef.value) return;
  const container = containerRef.value;
  const offset = newX - container.clientWidth * 0.382;
  container.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
});
</script>

<style scoped>
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