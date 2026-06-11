/**
 * 和声转调核心模块
 *
 * 支持大小调之间的和弦功能映射与MIDI平移。
 * 处理音域超限时的八度折叠。
 */

import { VOICE_RANGES } from '../../constants/limits.js';
import { MAJOR_DNA, MINOR_DNA } from '../data/index.js';

/**
 * 大调→小调和弦功能映射表
 * 键：大调和弦名，值：小调对应和弦名
 */
const MAJOR_TO_MINOR_MAP = {
  'T': 't',
  'T不完全': 't不完全',
  'T双三': 't',
  'T6': 't6',
  'T46': 't46',
  'T7': 't7',
  'S7': 's7',
  // 副属和弦映射：大调 II 级 → 小调 iv 级
  'D7/II': 'D7/iv',
  'D56/II': 'D56/iv',
  'D34/II': 'D34/iv',
  'D2/II': 'D2/iv',
  'Dvii7/II': 'Dvii7/iv',
  'Dvii56/II': 'Dvii56/iv',
  'Dvii34/II': 'Dvii34/iv',
  'Dvii2/II': 'Dvii2/iv',
  // 大调特有变和弦 → 小调最接近等价物
  'D9b': 'D9',
  'Dvii7b': 'Dvii7',
  'Dvii56b': 'Dvii56',
  'Dvii34b': 'Dvii34',
  'Dvii2b': 'Dvii2',
  'DTiii7': 'DTiii',
  'DD76': 'DD76',
};

/**
 * 小调→大调和弦功能映射表
 */
const MINOR_TO_MAJOR_MAP = {
  't': 'T',
  't不完全': 'T不完全',
  't6': 'T6',
  't46': 'T46',
  't7': 'T7',
  's7': 'S7',
  'VII': 'VI',
  // 副属和弦映射：小调 iv 级 → 大调 II 级
  'D7/iv': 'D7/II',
  'D56/iv': 'D56/II',
  'D34/iv': 'D34/II',
  'D2/iv': 'D2/II',
  'Dvii7/iv': 'Dvii7/II',
  'Dvii56/iv': 'Dvii56/II',
  'Dvii34/iv': 'Dvii34/II',
  'Dvii2/iv': 'Dvii2/II',
  // 小调特有和弦 → 大调最接近等价物
  'DD♮5': 'DD',
  'DD7♮5': 'DD7',
};

/**
 * 将和弦名映射到目标调性体系
 * @param {string} chordName - 原和弦名
 * @param {boolean} toMinor - 是否映射到小调（true=大→小，false=小→大）
 * @returns {string|null} 映射后的和弦名，null表示无法映射
 */
export function mapChordName(chordName, toMinor) {
  const targetDb = toMinor ? MINOR_DNA : MAJOR_DNA;

  const map = toMinor ? MAJOR_TO_MINOR_MAP : MINOR_TO_MAJOR_MAP;

  // 1. 查映射表（优先功能映射）
  const mapped = map[chordName];
  if (mapped && targetDb[mapped]) {
    return mapped;
  }

  // 2. 如果目标DNA中已有同名和弦，直接保留
  if (targetDb[chordName]) {
    return chordName;
  }

  // 3. 尝试通用规则：大写首字母互换
  if (toMinor) {
    // 大→小：T→t, S→s（但小调DNA中可能已有S，已在步骤1处理）
    if (chordName.startsWith('T') && !chordName.startsWith('T_')) {
      const tryName = 't' + chordName.slice(1);
      if (targetDb[tryName]) return tryName;
    }
  } else {
    if (chordName.startsWith('t')) {
      const tryName = 'T' + chordName.slice(1);
      if (targetDb[tryName]) return tryName;
    }
  }

  // 4. 无法映射
  return null;
}

/**
 * 将单个MIDI音符折叠到指定音域范围内
 * 优先保持音高类不变，只调整八度
 * @param {number} midi - MIDI音符编号
 * @param {number} min - 音域下限
 * @param {number} max - 音域上限
 * @returns {number} 折叠后的MIDI值
 */
function foldToRange(midi, min, max) {
  if (midi >= min && midi <= max) return midi;

  const pc = midi % 12;
  let best = null;
  let bestDist = Infinity;

  for (let m = min; m <= max; m++) {
    if (m % 12 === pc) {
      const dist = Math.abs(m - midi);
      if (dist < bestDist) {
        bestDist = dist;
        best = m;
      }
    }
  }

  if (best !== null) {
    return best;
  }

  //  fallback: 截断到边界
  return Math.max(min, Math.min(max, midi));
}

/**
 * 平移声部配置并处理音域超限
 * @param {Object} voices - {S, A, T, B}
 * @param {number} delta - 半音偏移量
 * @returns {Object} 平移后的声部配置
 */
export function transposeVoices(voices, delta) {
  return {
    S: foldToRange(voices.S + delta, VOICE_RANGES.S.min, VOICE_RANGES.S.max),
    A: foldToRange(voices.A + delta, VOICE_RANGES.A.min, VOICE_RANGES.A.max),
    T: foldToRange(voices.T + delta, VOICE_RANGES.T.min, VOICE_RANGES.T.max),
    B: foldToRange(voices.B + delta, VOICE_RANGES.B.min, VOICE_RANGES.B.max),
  };
}

/**
 * 转调history数组
 * @param {Array} history - 历史记录数组
 * @param {number} delta - 半音偏移量
 * @param {boolean} toMinor - 是否映射到小调
 * @returns {Object} {history: 转调后的history, failures: 映射失败的和弦名列表}
 */
export function transposeHistory(history, delta, toMinor) {
  const result = [];
  const failures = [];

  for (const item of history) {
    const mappedChord = mapChordName(item.chord, toMinor);
    if (mappedChord === null) {
      failures.push(item.chord);
      continue;
    }
    result.push({
      chord: mappedChord,
      voices: transposeVoices(item.voices, delta),
    });
  }

  return { history: result, failures };
}

/**
 * 转调旋律数组
 * @param {number[]} melody - MIDI数组
 * @param {number} delta - 半音偏移量
 * @returns {number[]} 转调后的旋律
 */
export function transposeMelody(melody, delta) {
  return melody.map(m => m + delta);
}
