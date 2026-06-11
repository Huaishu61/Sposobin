<template>
  <div class="chord-system-container">
    <div v-if="type === 'diatonic' && hasDiatonic" class="modern-panel">
      <h3 class="panel-header">自然音阶系统 (Diatonic)</h3>
      <div v-for="(chords, title) in categories.diatonic" :key="title" class="category-row">
        <div class="cat-title">{{ title }}</div>
        <div class="chord-grid-layout">
          <button v-for="c in chords" :key="c" @click="$emit('chord-select', c)" class="modern-chord-btn">
            <span class="chord-badge">
              <span :class="['chord-core', { 'is-minor': isMinor(parseChord(c).core) }]">
                {{ parseChord(c).core }}
              </span>
              <span v-if="parseChord(c).superText" class="chord-super">{{ parseChord(c).superText }}</span>
              <span v-if="parseChord(c).subText" class="chord-sub">{{ parseChord(c).subText }}</span>
              <span v-if="parseChord(c).topNum || parseChord(c).bottomNum" class="chord-stack">
                <span class="stack-top">{{ parseChord(c).topNum }}</span>
                <span class="stack-bottom">{{ parseChord(c).bottomNum }}</span>
              </span>
              <span v-if="parseChord(c).secondary" class="chord-secondary">{{ parseChord(c).secondary }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="type === 'chromatic' && hasChromatic" class="modern-panel chromatic-panel">
      <h3 class="panel-header chromatic-header">离调与变音体系 (Chromatic)</h3>
      <div v-for="(chords, title) in categories.chromatic" :key="title" class="category-row">
        <div class="cat-title">{{ title }}</div>
        <div class="chord-grid-layout">
          <button v-for="c in chords" :key="c" @click="$emit('chord-select', c)" class="modern-chord-btn chromatic-btn">
            <span class="chord-badge">
              <span :class="['chord-core', { 'is-minor': isMinor(parseChord(c).core) }]">
                {{ parseChord(c).core }}
              </span>
              <span v-if="parseChord(c).superText" class="chord-super">{{ parseChord(c).superText }}</span>
              <span v-if="parseChord(c).subText" class="chord-sub">{{ parseChord(c).subText }}</span>
              <span v-if="parseChord(c).topNum || parseChord(c).bottomNum" class="chord-stack">
                <span class="stack-top">{{ parseChord(c).topNum }}</span>
                <span class="stack-bottom">{{ parseChord(c).bottomNum }}</span>
              </span>
              <span v-if="parseChord(c).secondary" class="chord-secondary">{{ parseChord(c).secondary }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  categories: Object, type: String, mode: String, targetMelody: Array, history: Array, pendingNote: Number
});
defineEmits(['chord-select']);

const hasDiatonic = computed(() => Object.keys(props.categories?.diatonic || {}).length > 0);
const hasChromatic = computed(() => Object.keys(props.categories?.chromatic || {}).length > 0);

// 判断是否为小调性质，以便在前端进行额外的字体和色彩微调
function isMinor(coreStr) {
  const firstChar = coreStr.charAt(0);
  // 如果首字母是小写，或者包含了小调副功能标记
  return (firstChar >= 'a' && firstChar <= 'z') || coreStr.includes('vii') || coreStr.includes('ii');
}

// 🎼 核心算法：将不规范的后端文本切片为完美的音乐符号排版矩阵
function parseChord(chordStr) {
  let s = chordStr;
  let secondary = '';
  
  // 1. 离调切片
  if (s.includes('/')) {
    const parts = s.split('/');
    s = parts[0];
    secondary = '/' + parts[1];
  }
  
  let core = '';
  let superText = '';
  let subText = '';
  let topNum = '';
  let bottomNum = '';
  
  // 2. 规整拉丁 unicode
  s = s.replace('ᵥᵢᵢ', 'vii').replace('ᵢᵢ', 'ii');
  
  // 3. 抽取功能核心词根
  if (s.startsWith('DTiii')) { core = 'DTiii'; s = s.slice(5); }
  else if (s.startsWith('Dvii')) { core = 'Dvii'; s = s.slice(4); }
  else if (s.startsWith('Sii')) { core = 'Sii'; s = s.slice(3); }
  else if (s.startsWith('sii')) { core = 'sii'; s = s.slice(3); }
  else if (s.startsWith('DD')) { core = 'DD'; s = s.slice(2); }
  else if (s.startsWith('VI_阻碍')) { core = 'VI'; superText = '阻碍'; s = ''; }
  else if (s.startsWith('VI')) { core = 'VI'; s = s.slice(2); }
  else if (s.startsWith('VII')) { core = 'VII'; s = s.slice(3); }
  else if (s.startsWith('It')) { core = 'It'; s = s.slice(2); }
  else if (s.startsWith('Ger')) { core = 'Ger'; s = s.slice(3); }
  else if (s.startsWith('Fr')) { core = 'Fr'; s = s.slice(2); }
  else if (s.startsWith('N')) { core = 'N'; s = s.slice(1); }
  else if (s.startsWith('K')) { core = 'K'; s = s.slice(1); }
  else if (s.startsWith('♭VI')) { core = '♭VI'; s = s.slice(3); }
  else if (s.startsWith('♭VII')) { core = '♭VII'; s = s.slice(4); }
  else if (s.startsWith('T')) { core = 'T'; s = s.slice(1); }
  else if (s.startsWith('t')) { core = 't'; s = s.slice(1); }
  else if (s.startsWith('S')) { core = 'S'; s = s.slice(1); }
  else if (s.startsWith('s')) { core = 's'; s = s.slice(1); }
  else if (s.startsWith('D')) { core = 'D'; s = s.slice(1); }
  else { core = s; s = ''; }
  
  // 4. 提取汉字/变音标记上标
  if (s.includes('不完全')) { superText = '不完全'; s = s.replace('不完全', ''); }
  if (s.includes('双三')) { superText = '双三'; s = s.replace('双双', '').replace('双三', ''); }
  if (s.includes('⁺⁶')) { superText = '+6'; s = s.replace('⁺⁶', ''); }
  
  // 5. 组装标准低音数字数字堆叠堆
  if (s.includes('₆₄') || s.includes('64')) { topNum = '6'; bottomNum = '4'; }
  else if (s.includes('₅₆') || s.includes('56')) { topNum = '6'; bottomNum = '5'; }
  else if (s.includes('₃₄') || s.includes('34')) { topNum = '4'; bottomNum = '3'; }
  else if (s.includes('₇⁶') || s.includes('76')) { topNum = '6'; bottomNum = '7'; }
  else if (s.includes('₆') || s.includes('6')) { subText = '6'; }
  else if (s.includes('₇') || s.includes('7')) { subText = '7'; }
  else if (s.includes('₂') || s.includes('2')) { subText = '2'; }
  else if (s.includes('₉♭')) { subText = '9'; superText = '♭'; }
  else if (s.includes('₉')) { subText = '9'; }
  
  return { core, superText, subText, topNum, bottomNum, secondary };
}
</script>

<style scoped>
.chord-grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
  gap: 6px;
  width: 100%;
}
@media screen and (max-width: 1200px) {
  .chord-grid-layout {
    grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
  }
}
</style>