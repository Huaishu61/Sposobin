<template>
  <div class="workspace">
    <AppHeader 
      @mode-change="handleModeChange" 
    />

    <div class="main-layout">
      <div class="left-area">
        <section class="score-section">
          <div class="toolbar">
            <select :value="store.key_name" @change="handleKeyChange" class="key-select">
              <option v-for="key in keys" :key="key" :value="key">{{ key }}</option>
            </select>
            <div class="toolbar-actions">
              <button 
                @click="handlePlaySequence" 
                class="btn" 
                :class="{ active: isPlaying }"
                :disabled="store.history.length === 0"
              >
                {{ isPlaying ? '停止' : '试听' }}
              </button>
              <button @click="handleReset" class="btn">清空</button>
              <template v-if="store.mode === 'SOPRANO'">
                <button
                  @click="handleUndoNote"
                  class="btn btn-undo"
                  :disabled="store.target_melody.length === 0 || store.history.length > 0"
                  title="撤销最后一个音"
                >
                  ←
                </button>
                <button
                  @click="handleStartSoprano"
                  class="btn btn-generate"
                  :disabled="store.target_melody.length === 0"
                >
                  确认并生成
                </button>
              </template>
              <template v-if="store.mode === 'BASS'">
                <button
                  @click="handleUndoBass"
                  class="btn btn-undo"
                  :disabled="store.target_bass.length === 0 || store.history.length > 0"
                  title="撤销最后一个音"
                >
                  ←
                </button>
                <button
                  @click="handleStartBass"
                  class="btn btn-generate"
                  :disabled="store.target_bass.length === 0"
                >
                  确认并生成
                </button>
              </template>
              <button @click="showAboutModal()" class="btn btn-help">?</button>
            </div>
          </div>

          <ScoreRenderer />
        </section>

        <PianoSection
          @piano-click="handlePianoClick"
        />
      </div>

      <div class="right-area">
        <ChordPalette @select-chord="handleSelectChord" />
      </div>
    </div>

    <AboutModal 
      :visible="showAboutModalFlag" 
      :initial-mode="store.mode"
      @close="closeAboutModal" 
    />
    <DebugTerminal @close="store.debug_message = null" />

    <div class="mobile-footer">
      <div class="author-line">
        <span class="author-label">作者：</span>
        <a href="https://space.bilibili.com/381857406" target="_blank" class="author-link">青槐树的诗</a>
        <a href="https://space.bilibili.com/5915081" target="_blank" class="author-link">肥皂Fince</a>
      </div>
      <a href="https://github.com/Fince10086/Sposobin" target="_blank" class="author-link">Github</a>
      <span class="author-text">QQ群：850900762</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { store, syncState, resetState, transposeState } from '../engine/store.js';
import { KEY_REGISTRY } from '../engine/tonality/index.js';
import { useAudio } from '../composables/useAudio.js';
import { usePlayback } from '../composables/usePlayback.js';

import AppHeader from '../components/layout/AppHeader.vue';
import PianoSection from '../components/input/PianoSection.vue';
import ChordPalette from '../components/layout/ChordPalette.vue';
import ScoreRenderer from '../components/display/ScoreRenderer.vue';
import AboutModal from '../components/modal/AboutModal.vue';
import DebugTerminal from '../components/display/DebugTerminal.vue';

const { playSingleChord } = useAudio();
const { startPlayback, resetPlayback, isPlaying } = usePlayback();

// 按半音顺序排列的调性列表（大调在前，小调在后）
const keys = [
  // 大调（按半音上行）
  'C 大调', '降D 大调', 'D 大调', '降E 大调', 'E 大调',
  'F 大调', '升F 大调', '降G 大调', 'G 大调', '降A 大调',
  'A 大调', '降B 大调', 'B 大调',
  // 小调（按半音上行）
  'a 小调', '降b 小调', 'b 小调', 'c 小调', '升c 小调',
  'd 小调', '升d 小调', 'e 小调', 'f 小调', '升f 小调',
  'g 小调', '升g 小调',
];

const showAboutModalFlag = ref(false);

function showAboutModal() {
  showAboutModalFlag.value = true;
}

function closeAboutModal() {
  showAboutModalFlag.value = false;
}

function handleKeyChange(event) {
  const newKey = event.target.value;
  const oldKey = store.key_name;
  if (oldKey === newKey) return;

  resetPlayback();
  store.key_name = newKey;
  transposeState(oldKey, newKey);
}

function handleModeChange() {
  resetState();
}

function handleReset() {
  resetPlayback();
  resetState();
}

async function handlePlaySequence() {
  if (store.history.length === 0) return;
  if (isPlaying.value) {
    resetPlayback();
    return;
  }
  await startPlayback(store.history);
}

function handlePianoClick(midi) {
  if (store.mode === 'COMPOSE') {
    store.pending_note = midi;
    syncState();
  } else if (store.mode === 'SOPRANO') {
    // 添加音符到目标旋律
    store.target_melody.push(midi);
  } else if (store.mode === 'BASS') {
    // 添加音符到目标低音旋律
    store.target_bass.push(midi);
  } else {
    playSingleChord({ S: midi });
  }
}

function handleUndoNote() {
  if (store.target_melody.length > 0) {
    store.target_melody.pop();
  }
}

function handleStartSoprano() {
  // 构建DAG并获取候选和弦
  syncState();
}

function handleUndoBass() {
  if (store.target_bass.length > 0) {
    store.target_bass.pop();
  }
}

function handleStartBass() {
  // 构建DAG并获取候选和弦（低音题）
  syncState();
}

function handleSelectChord(chord) {
  syncState(chord);
  if (store.history.length > 0) {
    playSingleChord(store.history[store.history.length - 1].voices);
  }
}



onMounted(() => {
  document.title = '斯波索宾和声引擎';
  syncState();
});
</script>

<style>
.workspace {
  padding: 20px;
  max-width: 1126px;
  margin: 0 auto;
}

.main-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.left-area {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-area {
  flex: 0 0 300px;
  min-width: 0;
}

.score-section {
  background: #fff;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 12px;
}

.toolbar-actions {
  display: flex;
  gap: 0;
}

.key-select {
  padding: 6px 12px;
  border-radius: var(--radius);
  border: 2px solid var(--border);
  background: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font);
  color: var(--fg);
  cursor: pointer;
  outline: none;
  transition: background .15s;
}

.key-select:hover {
  background: var(--hover);
}

.toolbar-actions {
  display: flex;
  border: 2px solid #000;
  border-radius: 4px;
  overflow: hidden;
}

.toolbar-actions .btn {
  color: #000;
  cursor: pointer;
  background: #fff;
  border: none;
  border-right: 2px solid #000;
  border-radius: 0;
  padding: 6px 12px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  transition: background .15s, color .15s;
}

.toolbar-actions .btn:last-child {
  border-right: none;
}

.toolbar-actions .btn:hover:not(:disabled):not(.active) {
  background: #f0f0f0;
}

.toolbar-actions .btn.active {
  color: #fff;
  background: #000;
}

.toolbar-actions .btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-actions .btn.btn-help {
  padding: 6px 10px;
  font-weight: 700;
}

/* Mobile portrait mode */
@media (max-width: 649px) {
  .workspace {
    padding: 12px;
  }

  .main-layout {
    flex-direction: column;
    gap: 12px;
  }

  .left-area,
  .right-area {
    flex: none;
    width: 100%;
  }

  .toolbar {
    flex-wrap: wrap;
  }

  .right-area .chord-panel {
    border-left: none;
    border-top: 2px solid #ccc;
    height: auto;
    max-height: none;
  }

  .mobile-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #ccc;
    font-size: 0.75rem;
    color: #666;
  }

  .mobile-footer .author-line {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .mobile-footer .author-link {
    color: #000;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .mobile-footer .author-label,
  .mobile-footer .author-text {
    color: #666;
  }
}

/* Desktop: hide mobile footer */
@media (min-width: 650px) {
  .mobile-footer {
    display: none;
  }
}
</style>
