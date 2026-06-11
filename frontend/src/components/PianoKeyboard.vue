<template>
  <section class="soprano-panel glass-card highlight-border">
    <div class="piano-wrapper">
      <div class="piano">
        <div v-for="note in pianoKeys" :key="note.midi" 
             :class="['piano-key', note.isBlack ? 'black' : 'white']"
             :style="{ left: note.x + 'px' }"
             @click="handleKeyClick(note.midi)">
          <span v-if="note.label" class="key-label">{{ note.label }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="mode === 'SOPRANO'" class="soprano-input-area">
      <input type="text" v-model="textInput" class="modern-input" placeholder="点击键盘或直接键入序列: C5 Eb5 G5" />
      <button @click="triggerPathSearch" class="modern-btn btn-primary">⚡ 运行全局 DAG 寻优</button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({ mode: String });
const emit = defineEmits(['note-click', 'submit-soprano']);
const textInput = ref("");

// 快速构建 57 至 84 物理键盘映射
const pianoKeys = [];
let whiteIndex = 0;
for (let m = 57; m <= 84; m++) {
  const isBlack = ![0, 2, 4, 5, 7, 9, 11].includes(m % 12);
  if (isBlack) {
    pianoKeys.push({ midi: m, isBlack: true, x: whiteIndex * 26 - 8 });
  } else {
    pianoKeys.push({ midi: m, isBlack: false, x: whiteIndex * 26, label: m % 12 === 0 ? `C${Math.floor(m/12)-1}` : '' });
    whiteIndex++;
  }
}

function handleKeyClick(midi) {
  emit('note-click', midi);
  if (props.mode === 'SOPRANO') {
    const names = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    textInput.value += (textInput.value ? " " : "") + `${names[midi%12]}${Math.floor(midi/12)-1}`;
  }
}

function parseMelodyStr(text) {
  const names = { 'C':0, 'D':2, 'E':4, 'F':5, 'G':7, 'A':9, 'B':11 };
  const tokens = text.match(/([A-Ga-g])(bb|b|♭|##|x|#|♯)?\s*(\d)/g);
  if (!tokens) return [];
  return tokens.map(t => {
    const m = t.match(/([A-Ga-g])(bb|b|♭|##|x|#|♯)?\s*(\d)/);
    let alt = 0;
    if (m[2]) {
      if (['#', '♯'].includes(m[2])) alt = 1;
      else if (['b', '♭'].includes(m[2])) alt = -1;
      else if (m[2] === 'x') alt = 2;
    }
    return (parseInt(m[3]) + 1) * 12 + names[m[1].toUpperCase()] + alt;
  });
}

function triggerPathSearch() {
  const sequence = parseMelodyStr(textInput.value);
  emit('submit-soprano', sequence);
}
</script>