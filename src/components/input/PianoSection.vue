<template>
  <section class="piano-section">
    <div class="piano-wrapper" ref="wrapperRef">
      <div class="piano">
        <div 
          v-for="note in pianoKeys" 
          :key="note.midi"
          :class="['piano-key', note.isBlack ? 'black' : 'white', { 'disabled': isKeyDisabled(note.midi) }]"
          :style="{ left: note.x + 'px' }"
          @click="handleClick(note.midi)"
        >
          <span v-if="note.label" class="key-label">{{ note.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { store } from '../../engine/store.js';
import { usePiano } from '../../composables/usePiano.js';

const { keys: pianoKeys } = usePiano();
const wrapperRef = ref(null);

const emit = defineEmits(['piano-click']);

onMounted(() => {
  if (window.innerWidth < 650 && wrapperRef.value) {
    const wrapper = wrapperRef.value;
    const piano = wrapper.querySelector('.piano');
    if (piano) {
      wrapper.scrollLeft = (piano.offsetWidth - wrapper.clientWidth) / 2;
    }
  }
});

function isKeyDisabled(midi) {
  // FREE 模式全部禁用
  if (store.mode === 'FREE') return true;
  // SOPRANO/BASS 生成后全部禁用
  if ((store.mode === 'SOPRANO' || store.mode === 'BASS') && store.history.length > 0) return true;
  // SOPRANO/COMPOSE 模式下超出范围的键禁用
  if ((store.mode === 'SOPRANO' || store.mode === 'COMPOSE') && (midi < 57 || midi > 84)) return true;
  // BASS 模式下超出低音范围的键禁用
  if (store.mode === 'BASS' && (midi < 36 || midi > 64)) return true;
  return false;
}

function handleClick(midi) {
  if (isKeyDisabled(midi)) return;
  emit('piano-click', midi);
}
</script>

<style scoped>
.piano-section {
  background: #fff;
  padding: 12px 0;
  display: flex;
  align-items: center;
}

.piano-wrapper {
  background: #fff;
  padding: 8px;
  overflow-x: auto;
}

/* thin horizontal scrollbar */
.piano-wrapper::-webkit-scrollbar {
  height: 3px;
}

.piano-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.piano-wrapper::-webkit-scrollbar-thumb {
  background: #000;
  border-radius: 0;
}

.piano {
  position: relative;
  height: 100px;
  width: 754px;
}

.piano-key {
  position: absolute;
  cursor: pointer;
  border: 1px solid #000;
  border-radius: 0 0 2px 2px;
  transition: background .1s;
  box-sizing: border-box;
}

.piano-key.white {
  width: 26px;
  height: 100px;
  background: #fff;
  z-index: 1;
}

.piano-key.white:hover {
  background: #f0f0f0;
}

.piano-key.black {
  width: 16px;
  height: 60px;
  background: #000;
  z-index: 2;
}

.piano-key.black:hover {
  background: #333;
}

/* 禁用状态：白键灰色边框，黑键灰色填充+边框 */
.piano-key.disabled.white {
  border-color: #ccc;
  cursor: not-allowed;
  pointer-events: none;
}

.piano-key.disabled.black {
  background: #999;
  border-color: #999;
  cursor: not-allowed;
  pointer-events: none;
}

.key-label {
  position: absolute;
  bottom: 4px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 9px;
  color: #666;
  font-weight: 600;
}
</style>
