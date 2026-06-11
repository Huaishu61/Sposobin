/**
 * 钢琴键盘数据生成组合式函数
 *
 * 负责生成可视化钢琴键盘的数据模型，包括键位布局、MIDI映射、标签等。
 * 支持 MIDI_START 到 MIDI_END 范围内的键盘渲染，自动计算黑白键的位置偏移。
 * 同时提供旋律字符串解析功能，将文本输入（如 "C5 Eb5 G5"）转换为 MIDI 数值数组。
 */

import { ref } from 'vue';

/** 钢琴键盘的MIDI范围: C2 (36) 到 C6 (84)，覆盖4个八度 */
const MIDI_START = 36;
const MIDI_END = 84;

/** 白键宽度: 26像素 */
const WHITE_KEY_WIDTH = 26;

/** 黑键宽度: 16像素（比白键窄，视觉效果更真实） */
const BLACK_KEY_WIDTH = 16;

/**
 * 白键在八度中的位置索引
 * C=0, D=2, E=4, F=5, G=7, A=9, B=11
 * 这些音级对应钢琴上的白键
 */
const WHITE_KEY_INDICES = [0, 2, 4, 5, 7, 9, 11];

/**
 * 钢琴键盘组合式函数
 * @returns {Object} 包含键盘数据、音符名转换和旋律解析方法
 */
export function usePiano() {
  /** 键盘键位数组，每个元素包含 {midi, isBlack, x, label} */
  const keys = ref([]);

  // 初始化键盘布局
  let whiteIndex = 0;  // 白键的水平位置计数器
  for (let midi = MIDI_START; midi <= MIDI_END; midi++) {
    const isBlack = !WHITE_KEY_INDICES.includes(midi % 12);

    if (isBlack) {
      // 黑键位于两个白键之间，向左偏移8像素
      keys.value.push({
        midi,                          // MIDI音符编号
        isBlack: true,                 // 标记为黑键
        x: whiteIndex * WHITE_KEY_WIDTH - 8,  // 相对白键左偏移
        label: ''                      // 黑键不显示标签
      });
    } else {
      // 计算八度标记: C音显示标签如 "C4", "C5"
      const octave = Math.floor(midi / 12) - 1;
      const isC = midi % 12 === 0;
      keys.value.push({
        midi,
        isBlack: false,                // 标记为白键
        x: whiteIndex * WHITE_KEY_WIDTH,  // 白键标准位置
        label: isC ? `C${octave}` : ''   // 仅C音显示八度标签
      });
      whiteIndex++;  // 只有白键才推进水平位置
    }
  }

  /**
   * 将MIDI数值转换为音符名称
   * @param {number} midi - MIDI音符编号
   * @returns {string} 音符名称，如 "C4", "F#5", "Bb3"
   *
   * 使用标准十二平均律命名: C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B
   */
  function midiToNoteName(midi) {
    const names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    return `${names[midi % 12]}${octave}`;
  }

  /**
   * 解析旋律字符串为MIDI数组
   * @param {string} text - 旋律文本，如 "C5 Eb5 G5" 或 "C#4 F##5 Bb3"
   * @returns {number[]} MIDI音符编号数组
   *
   * 支持以下变音记号:
   *   #, ♯ : 升半音 (+1)
   *   ##, x: 重升 (+2)
   *   b, ♭ : 降半音 (-1)
   *   bb   : 重降 (-2)
   */
  function parseMelodyStr(text) {
    const noteNames = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    // 正则匹配: 音名(A-G) + 可选变音记号 + 八度数字(0-9)
    const tokens = text.match(/([A-Ga-g])(bb|b|♭|##|x|#|♯)?\s*(\d)/g);
    if (!tokens) return [];

    return tokens.map(token => {
      const match = token.match(/([A-Ga-g])(bb|b|♭|##|x|#|♯)?\s*(\d)/);
      const base = noteNames[match[1].toUpperCase()];
      let alt = 0;  // 变音偏移量

      if (match[2]) {
        if (['#', '♯'].includes(match[2])) alt = 1;       // 升半音
        else if (['##', 'x'].includes(match[2])) alt = 2;  // 重升
        else if (['b', '♭'].includes(match[2])) alt = -1;  // 降半音
        else if (match[2] === 'bb') alt = -2;              // 重降
      }

      // 计算MIDI数值: (八度+1)*12 + 音名基础值 + 变音偏移
      return (parseInt(match[3], 10) + 1) * 12 + base + alt;
    });
  }

  return {
    keys,            // 键盘键位数据（响应式数组）
    midiToNoteName,  // MIDI转音符名
    parseMelodyStr   // 旋律字符串解析
  };
}
