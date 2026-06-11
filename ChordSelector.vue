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
              <span v-if="parseChord(c).degree" class="chord-degree-sub">{{ parseChord(c).degree }}</span>
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
              <span v-if="parseChord(c).degree" class="chord-degree-sub">{{ parseChord(c).degree }}</span>
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

// 🌟 核心增补：智能提取当前面板是处于大调还是小调环境，用来控制 TS / tS 的大小写性质
const isMinorKey = computed(() => {
  const diatonicKeys = Object.keys(props.categories?.diatonic || {});
  const mainKey = diatonicKeys.find(k => k.includes('主功能组'));
  const mainGroup = mainKey ? props.categories.diatonic[mainKey] : [];
  return mainGroup.includes('t') || mainGroup.includes('t不完全');
});

function isMinor(coreStr) {
  const firstChar = coreStr.charAt(0);
  return firstChar === 't' || (firstChar >= 'a' && firstChar <= 'z');
}

// 🎼 工业出版级斯波索宾排版切片机
function parseChord(chordStr) {
  let s = chordStr;
  let secondary = '';
  
  if (s.includes('/')) {
    const parts = s.split('/');
    s = parts[0];
    secondary = '/' + parts[1];
  }
  
  let core = '';
  let degree = ''; 
  let superText = '';
  let subText = '';
  let topNum = '';
  let bottomNum = '';
  
  s = s.replace('ᵥᵢᵢ', 'vii').replace('ᵢᵢ', 'ii');
  
  // 🌟 A. 抢先拦截并剥离 VI 级和弦，将其完美重塑为双功能混合特征符号 (TS_VI / tS_VI)
  if (s.startsWith('VI_阻碍')) { 
    core = isMinorKey.value ? 'tS' : 'TS'; 
    degree = 'VI'; 
    superText = '阻碍'; 
    s = ''; 
  }
  else if (s.startsWith('VI')) { 
    core = isMinorKey.value ? 'tS' : 'TS'; 
    degree = 'VI'; 
    s = s.slice(2); 
  }
  else if (s.startsWith('♭VI')) { 
    core = '♭' + (isMinorKey.value ? 'tS' : 'TS'); 
    degree = 'VI'; 
    s = s.slice(3); 
  }
  // B. 剥离其他标准级数码
  else if (s.includes('vii') || s.includes('VII')) {
    degree = 'VII';
    s = s.replace('vii', '').replace('VII', '');
  } else if (s.includes('ii') || s.includes('II')) {
    if (s.includes('iii') || s.includes('III')) {
      degree = 'III';
      s = s.replace('iii', '').replace('III', '');
    } else {
      degree = 'II';
      s = s.replace('ii', '').replace('II', '');
    }
  }
  
  // C. 抽取纯净功能核心词根
  if (core !== '') { /* 已被上方 VI 拦截处理 */ }
  else if (s.startsWith('DT')) { core = 'DT'; s = s.slice(2); }
  else if (s.startsWith('♭VII')) { core = '♭VII'; s = s.slice(4); }
  else if (s.startsWith('VII')) { core = 'VII'; s = s.slice(3); }
  else if (s.startsWith('DD')) { core = 'DD'; s = s.slice(2); }
  else if (s.startsWith('It')) { core = 'It'; s = s.slice(2); }
  else if (s.startsWith('Ger')) { core = 'Ger'; s = s.slice(3); }
  else if (s.startsWith('Fr')) { core = 'Fr'; s = s.slice(2); }
  else if (s.startsWith('N')) { core = 'N'; s = s.slice(1); }
  else if (s.startsWith('K')) { core = 'K'; s = s.slice(1); }
  else if (s.startsWith('T')) { core = 'T'; s = s.slice(1); }
  else if (s.startsWith('t')) { core = 't'; s = s.slice(1); }
  else if (s.startsWith('S')) { core = 'S'; s = s.slice(1); }
  else if (s.startsWith('s')) { core = 's'; s = s.slice(1); }
  else if (s.startsWith('D')) { core = 'D'; s = s.slice(1); }
  else { core = s; s = ''; }
  
  if (s.includes('不完全')) { superText = '不完全'; s = s.replace('不完全', ''); }
  if (s.includes('双三')) { superText = '双三'; s = s.replace('双三', ''); }
  if (s.includes('⁺⁶')) { superText = '+6'; s = s.replace('⁺⁶', ''); }
  
  if (s.includes('₆₄') || s.includes('64')) { topNum = '6'; bottomNum = '4'; }
  else if (s.includes('₅₆') || s.includes('56')) { topNum = '6'; bottomNum = '5'; }
  else if (s.includes('₃₄') || s.includes('34')) { topNum = '4'; bottomNum = '3'; }
  else if (s.includes('₇⁶') || s.includes('76')) { topNum = '6'; bottomNum = '7'; }
  else if (s.includes('₆') || s.includes('6')) { subText = '6'; }
  else if (s.includes('₇') || s.includes('7')) { subText = '7'; }
  else if (s.includes('₂') || s.includes('2')) { subText = '2'; }
  else if (s.includes('₉♭')) { subText = '9'; superText = '♭'; }
  else if (s.includes('₉')) { subText = '9'; }
  
  return { core, degree, superText, subText, topNum, bottomNum, secondary };
}
</script>

<style scoped>
.chord-grid-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
}
</style>
