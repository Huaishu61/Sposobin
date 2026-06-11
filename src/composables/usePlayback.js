/**
 * 播放状态管理组合式函数
 *
 * 管理序列播放的进度状态（当前播放索引），
 * 协调音频播放与UI播放头的同步显示。
 * 提供播放控制和重置功能。
 */

import { ref, computed } from 'vue';
import { useAudio } from './useAudio.js';

/**
 * 当前播放索引的全局响应式状态
 * null 表示未在播放，number 表示当前播放到的和弦索引
 */
const playbackIndex = ref(null);

/**
 * 播放控制组合式函数
 * @returns {Object} 播放状态和控制方法
 */
export function usePlayback() {
  const { playSequence, stopSequence } = useAudio();

  /**
   * 是否正在播放的计算属性
   * 当 playbackIndex 不为 null 时返回 true
   */
  const isPlaying = computed(() => playbackIndex.value !== null);

  /**
   * 开始序列播放
   * @param {Array} history - 历史和弦数组
   * @returns {Promise<void>}
   *
   * 如果已经在播放中或历史为空则直接返回，
   * 通过回调函数同步更新 playbackIndex 以驱动播放头动画。
   */
  async function startPlayback(history) {
    if (history.length === 0 || isPlaying.value) return;

    await playSequence(history, (index) => {
      playbackIndex.value = index;
      if (index === null) {
        playbackIndex.value = null;
      }
    });
  }

  /**
   * 重置播放状态
   * 将播放索引设为 null，停止播放头动画
   */
  function resetPlayback() {
    stopSequence();
    playbackIndex.value = null;
  }

  return {
    playbackIndex,    // 当前播放位置（响应式）
    isPlaying,        // 是否正在播放（计算属性）
    startPlayback,    // 开始播放方法
    resetPlayback     // 重置播放方法
  };
}
