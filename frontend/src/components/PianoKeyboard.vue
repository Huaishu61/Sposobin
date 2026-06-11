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
    
    <div v-if="mode === 'SOPRANO' || mode === 'BASS'" class="soprano-input-area">
      <input type="text" v-model="textInput" class="modern-input" placeholder="点击键盘或直接键入序列 (高音如C5, 低音如C3)" />
      <button @click="triggerPathSearch" class="modern-btn btn-primary">⚡ 运行全局 DAG 寻优</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({ mode: String });
const emit = defineEmits(['note-click', 'submit-soprano']);
const textInput = ref("");

// 🌟 改用 computed，根据当前模式动态映射键盘音区
const pianoKeys = computed(() => {
  const keys = [];
  // 低音题为 36(C2)-64(E4)，高音题为 57(A3)-84(C6)
  const start = props.mode === 'BASS' ? 36 : 57;
  const end = props.mode === 'BASS' ? 64 : 84;
  let whiteIndex = 0;
  
  for (let m = start; m <= end; m++) {
    const isBlack = ![0, 2, 4, 5, 7, 9, 11].includes(m % 12);
    if (isBlack) {
      keys.push({ midi: m, isBlack: true, x: whiteIndex * 26 - 8 });
    } else {
      keys.push({ midi: m, isBlack: false, x: whiteIndex * 26, label: m % 12 === 0 ? `C${Math.floor(m/12)-1}` : '' });
      whiteIndex++;
    }
  }
  return keys;
});

function handleKeyClick(midi) {
  emit('note-click', midi);
  if (props.mode === 'SOPRANO' || props.mode === 'BASS') {
    const names = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
    textInput.value += (textInput.value ? " " : "") + `${names[midi%12]}${Math.floor(midi/12)-1}`;
  }
}

function parseMelodyStr(text) {
  const names = { 'C':0, 'C#':1, 'Db':1, 'D':2, 'D#':3, 'Eb':3, 'E':4, 'F':5, 'F#':6, 'Gb':6, 'G':7, 'G#':8, 'Ab':8, 'A':9, 'A#':10, 'Bb':10, 'B':11 };
  const tokens = text.trim().split(/\s+/);
  const res = [];
  for(let t of tokens) {
    let match = t.match(/^([A-G][b#]?)(-?\d)$/);
    if(match) {
      let pc = names[match[1]];
      let oct = parseInt(match[2]);
      if(pc !== undefined && !isNaN(oct)) res.push((oct+1)*12 + pc);
    }
  }
  return res;
}

function triggerPathSearch() {
  const parsed = parseMelodyStr(textInput.value);
  if(parsed.length === 0) {
    alert("请输入有效的序列！(高音格式如: C5 Eb5 G5，低音格式如: C3 G2 E3)");
    return;
  }
  emit('submit-soprano', parsed);
}
</script>