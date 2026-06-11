<template>
  <section class="chord-panel">
    <div v-if="isEmpty" class="empty-state">
      <p class="empty-title">{{ emptyTitle }}</p>
    </div>

    <div v-else class="panel-content">
      <div v-if="hasDiatonic" class="panel-group">
        <h4 class="group-title">自然音体系</h4>
        <div v-for="(chords, title) in store.categories.diatonic" :key="title" class="category">
          <div class="category-label">{{ title }}</div>
          <div class="chord-grid">
            <button 
              v-for="c in chords" 
              :key="c" 
              @click="$emit('select-chord', c)" 
              class="chord-btn"
            >
              <template v-if="typeof fmt(c) === 'object'">
                {{ fmt(c).base }}<span class="chord-sup">{{ fmt(c).sup }}</span>
              </template>
              <template v-else>
                {{ fmt(c) }}
              </template>
            </button>
          </div>
        </div>
      </div>

      <div v-if="hasTonicization" class="panel-group">
        <h4 class="group-title tonic">变化音体系</h4>
        <div v-for="(chords, title) in store.categories.tonicization" :key="title" class="category">
          <div class="category-label">{{ title }}</div>
          <div class="chord-grid">
            <button 
              v-for="c in chords" 
              :key="c" 
              @click="$emit('select-chord', c)" 
              :class="['chord-btn', 'tonic', { 'secondary-dominant': title.includes('级副属和弦') }]"
            >
              <template v-if="typeof fmt(c) === 'object'">
                {{ fmt(c).base }}<span class="chord-sup">{{ fmt(c).sup }}</span>
              </template>
              <template v-else>
                {{ fmt(c) }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { store } from '../../engine/store.js';
import { formatChordName } from '../../engine/utils/formatter.js';

function fmt(c) {
  return formatChordName(c);
}

const isEmpty = computed(() =>
  Object.keys(store.categories.diatonic).length === 0 &&
  Object.keys(store.categories.tonicization).length === 0
);

const hasDiatonic = computed(() => Object.keys(store.categories.diatonic).length > 0);
const hasTonicization = computed(() => Object.keys(store.categories.tonicization).length > 0);

const emptyTitle = computed(() => {
  if (store.replacement_index !== null) {
    return '请选择替换和弦';
  }
  if (store.mode === 'SOPRANO') {
    return store.target_melody.length > 0 ? '无可用路径' : '等待旋律确认中';
  }
  if (store.mode === 'BASS') {
    return store.target_bass.length > 0 ? '无可用路径' : '等待低音确认中';
  }
  if (store.mode === 'COMPOSE') return '请选定旋律音';
  return '无可用和弦';
});

defineEmits(['select-chord']);
</script>

<style scoped>
.chord-panel {
  border-left: 2px solid #ccc;
  border-radius: 0;
  background: #fff;
  padding: 12px;
  height: 460px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.empty-title {
  font-size: 0.9375rem;
  font-weight: 400;
  margin: 0;
  color: #333;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-title {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 4px;
  border-bottom: 1px solid #ccc;
}

.group-title.tonic {
  color: #333;
}

.category {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
}

.chord-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chord-btn {
  color: #000;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 4px 6px;
  font-size: 1rem;
  font-weight: normal;
  font-family: 'LCBSposobin', 'Outfit', sans-serif;
  transition: background .15s;
  line-height: 1;
}

.chord-btn:hover {
  background: #f0f0f0;
}

.chord-btn.tonic {
  color: #333;
}

.chord-btn.tonic:hover {
  background: #f5f5f5;
}

.chord-btn.secondary-dominant {
  font-size: 1.5rem;
}

.chord-sup {
  font-size: 0.65em;
  vertical-align: super;
  margin-left: 1px;
}

/* thin scrollbar */
.chord-panel::-webkit-scrollbar {
  width: 3px;
}

.chord-panel::-webkit-scrollbar-track {
  background: transparent;
}

.chord-panel::-webkit-scrollbar-thumb {
  background: #000;
  border-radius: 0;
}
</style>
