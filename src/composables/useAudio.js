/**
 * 音频引擎组合式函数
 *
 * 基于 Tone.js 封装统一的音频播放功能，为和声写作台提供四声部和弦播放能力。
 * 使用单例模式管理底层音频节点（Limiter + PolySynth），避免重复创建。
 * 音色配置模拟经典正弦波叠加高八度泛音的管风琴风格，适合和声聆听。
 */

import { ref } from 'vue';
import * as Tone from 'tone';

// ===== 单例音频节点 =====

/** 主限制器节点: 防止音频削波失真，阈值设为-1dB提供安全余量 */
let mainLimiter = null;

/**
 * 全局多复音合成器
 * 使用自定义泛音结构: 基频权重1 + 第一泛音权重0.5
 * 模拟管风琴/弦乐的丰满音色
 */
let globalSynth = null;

/** 当前正在播放的序列合成器，用于停止功能 */
let currentSeqSynth = null;

/** 当前播放的setTimeout句柄 */
let seqTimeouts = [];

/** 音频引擎初始化状态标记，用于UI显示 */
const isInitialized = ref(false);

/** 合成器配置参数: 振荡器类型、包络、音量 */
const SYNTH_CONFIG = {
  oscillator: { type: 'custom', partials: [1, 0.5] },  // 自定义泛音: 基频+高八度泛音
  envelope: {
    attack: 0.05,    // 起音: 50ms，避免生硬的开头
    decay: 0.2,      // 衰减: 200ms
    sustain: 0.8,    // 持续: 80%音量
    release: 1.5     // 释音: 1.5秒，提供自然尾音
  },
  volume: -14        // 整体音量衰减14dB，防止多声部叠加过载
};

/**
 * 确保音频引擎已初始化
 * 采用懒加载策略: 首次播放时才创建音频节点
 * 限制器(Limiter)用于防止数字音频过载导致的爆音
 */
function ensureEngine() {
  if (!mainLimiter) {
    mainLimiter = new Tone.Limiter(-1).toDestination();
  }
  if (!globalSynth) {
    globalSynth = new Tone.PolySynth(Tone.Synth, SYNTH_CONFIG).connect(mainLimiter);
  }
  isInitialized.value = true;
}

/**
 * 音频控制组合式函数
 * @returns {Object} 包含播放控制方法和状态的对象
 */
export function useAudio() {
  /**
   * 播放单个和弦
   * @param {Object} voices - 四声部MIDI音符对象 {S, A, T, B}
   * @returns {Promise<void>}
   *
   * 注意: 浏览器要求音频上下文必须由用户交互触发，
   * 因此必须在按钮点击等事件中调用此方法。
   */
  async function playSingleChord(voices) {
    await Tone.start();           // 启动音频上下文（浏览器安全策略要求）
    ensureEngine();               // 懒初始化音频引擎
    // 将四个MIDI音符转换为频率数组
    const freqs = Object.values(voices).map(midi =>
      Tone.Frequency(midi, 'midi').toFrequency()
    );
    // 以二分音符时长触发播放
    globalSynth.triggerAttackRelease(freqs, '2n');
  }

  /**
   * 播放完整序列
   * @param {Array} history - 历史和弦数组，每个元素包含 {chord, voices}
   * @param {Function} onStep - 每步播放完成的回调函数，参数为当前索引
   * @returns {Promise<void>}
   *
   * 为每个和弦创建独立的PolySynth实例并顺序触发，
   * 播放结束后自动释放资源。
   */
  async function playSequence(history, onStep = null) {
    if (history.length === 0) return;
    await Tone.start();
    ensureEngine();

    // 先停止之前的播放
    stopSequence();

    // 为序列播放创建独立的合成器实例，避免与单和弦播放冲突
    const seqSynth = new Tone.PolySynth(Tone.Synth, SYNTH_CONFIG).connect(mainLimiter);
    currentSeqSynth = seqSynth;
    const now = Tone.now();       // 获取当前音频时间
    const duration = 1.0;         // 每个和弦持续1秒（相当于60 BPM的四分音符）

    history.forEach((item, index) => {
      const freqs = Object.values(item.voices).map(midi =>
        Tone.Frequency(midi, 'midi').toFrequency()
      );
      // 在指定时间点触发（使用now + offset实现精确时序）
      seqSynth.triggerAttackRelease(freqs, duration, now + index * duration);
      // 通过setTimeout同步UI播放头位置
      if (onStep) {
        const t = setTimeout(() => onStep(index), index * duration * 1000);
        seqTimeouts.push(t);
      }
    });

    // 序列播放结束后清理资源
    const cleanupDelay = (history.length * duration + 2) * 1000;
    const t = setTimeout(() => {
      if (currentSeqSynth === seqSynth) {
        currentSeqSynth = null;
      }
      seqSynth.dispose();         // 释放合成器内存
      if (onStep) {
        const t2 = setTimeout(() => onStep(null), duration * 1000);
        seqTimeouts.push(t2);
      }
    }, cleanupDelay);
    seqTimeouts.push(t);
  }

  /**
   * 停止序列播放
   * 释放当前序列合成器并清除所有定时器
   */
  function stopSequence() {
    seqTimeouts.forEach(t => clearTimeout(t));
    seqTimeouts = [];
    if (currentSeqSynth) {
      currentSeqSynth.releaseAll();
      currentSeqSynth.dispose();
      currentSeqSynth = null;
    }
  }

  return {
    isInitialized,    // 音频初始化状态（响应式）
    playSingleChord,  // 播放单个和弦
    playSequence,     // 播放完整序列
    stopSequence      // 停止序列播放
  };
}
