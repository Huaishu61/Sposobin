<template>
  <section class="categories-panel">
    <div v-if="isEmpty" class="empty-state-msg glass-card">
      <div class="empty-icon">🧩</div>
      <h3>{{ getPromptText() }}</h3>
    </div>

    <div class="panels-grid" v-else>
      <div class="left-panel modern-panel" v-if="hasDiatonic">
        <h3 class="panel-header">自然音阶系统 (Diatonic)</h3>
        <div v-for="(chords, title) in categories.diatonic" :key="title" class="category-row">
          <div class="cat-title">{{ title }}</div>
          <div class="chord-btn-group">
            <button v-for="c in chords" :key="c" @click="$emit('chord-select', c)" class="modern-chord-btn">{{ c }}</button>
          </div>
        </div>
      </div>
      
      <div class="right-panel modern-panel" v-if="hasChromatic">
        <h3 class="panel-header" style="color: #8B5CF6;">离调与半音体系 (Chromatic)</h3>
        <div v-for="(chords, title) in categories.tonicization" :key="title" class="category-row">
          <div class="cat-title">{{ title }}</div>
          <div class="chord-btn-group">
            <button v-for="c in chords" :key="c" @click="$emit('chord-select', c)" class="modern-chord-btn tonic-btn">{{ c }}</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  categories: Object, mode: String, targetMelody: Array, history: Array, pendingNote: Number
});
defineEmits(['chord-select']);

const hasDiatonic = computed(() => Object.keys(props.categories.diatonic || {}).length > 0);
const hasChromatic = computed(() => Object.keys(props.categories.tonicization || {}).length > 0);
const isEmpty = computed(() => !hasDiatonic.value && !hasChromatic.value);

function getPromptText() {
  if (props.mode === 'SOPRANO') return props.targetMelody.length > 0 ? '路径穷尽或前方发生法则锁死' : '等待输入旋律序列';
  if (props.mode === 'COMPOSE') return props.pendingNote ? '计算可行声部连接中...' : '请在上方键盘选定下一步旋律音';
  return '引擎正在进行通路剪枝校验...';
}
</script>