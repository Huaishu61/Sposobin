<template>
  <transition name="modal">
    <div v-if="store.debug_message" class="terminal-overlay" @click="$emit('close')">
      <div class="terminal-window" @click.stop>
        <div class="terminal-header">
          <div class="terminal-title">调试信息</div>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        <div class="terminal-body">
          <pre>{{ store.debug_message }}</pre>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { store } from '../../engine/store.js';
defineEmits(['close']);
</script>

<style scoped>
.terminal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}

.terminal-window {
  width: 700px;
  max-width: 100%;
  max-height: 70vh;
  background: #fff;
  border: 2px solid #000;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.terminal-header {
  padding: 10px 16px;
  border-bottom: 2px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.terminal-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #000;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #000;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background .15s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.terminal-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.terminal-body pre {
  font-family: 'Consolas', 'Monaco', ui-monospace, monospace;
  font-size: 0.8125rem;
  color: #000;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity .2s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* thin scrollbar */
.terminal-body::-webkit-scrollbar {
  width: 3px;
}

.terminal-body::-webkit-scrollbar-track {
  background: transparent;
}

.terminal-body::-webkit-scrollbar-thumb {
  background: #000;
}
</style>
