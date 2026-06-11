/**
 * 声部进行规则检查模块
 *
 * 本模块包含古典和声学中最核心的声部进行约束检查:
 *   1. 音域限制: 四声部不得超出各自的音域范围
 *   2. 间距限制: 相邻声部之间不得超过纯八度
 *   3. 声部交叉检查: 后一和弦中某声部不得超越前一和弦相邻声部位置
 *   4. 同向进行限制: 四声部不得全部同向进行
 *   5. 终止四六/辅助和弦的特殊限制: 声部进行必须极为平稳
 *   6. 平行进行检查: 严格禁止平行五度、平行八度、隐伏五度
 *   7. 同度音重叠惩罚: 相邻声部尽量避免同音
 */

import {
  INVALID_COST, VOICE_RANGES, SPACING_LIMITS, PARALLEL_PENALTIES, UNISON_PENALTIES
} from '../../constants/limits.js';

/**
 * 检查四声部是否都在各自的音域范围内
 * @param {Object} voices - 声部配置 {S, A, T, B}
 * @param {string} appMode - 应用模式（COMPOSE模式不限制音域）
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 注意: 在旋律写作模式(COMPOSE)中不执行音域检查，
 * 因为用户输入的旋律音可能暂时超出常规音域。
 */
export function checkVoiceRanges(voices, appMode) {
  if (appMode === 'COMPOSE') return 0;
  for (const [v, range] of Object.entries(VOICE_RANGES)) {
    if (voices[v] < range.min || voices[v] > range.max) return INVALID_COST;
  }
  return 0;
}

/**
 * 检查声部间距约束
 * @param {Object} voices - 声部配置 {S, A, T, B}
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 约束:
 *   - S >= A >= T > B（降序排列，避免声部交叉）
 *   - S-A 间距 <= 12半音（纯八度）
 *   - A-T 间距 <= 12半音（纯八度）
 */
export function checkVoiceSpacing(voices) {
  const { S, A, T, B } = voices;
  if (!(S >= A && A >= T && T > B)) return INVALID_COST;
  if ((S - A) > SPACING_LIMITS.maxOctaveBetweenSA) return INVALID_COST;
  if ((A - T) > SPACING_LIMITS.maxOctaveBetweenAT) return INVALID_COST;
  return 0;
}

/**
 * 检查声部交叉（Voice Overlap）
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 后一和弦声部配置
 * @param {boolean} isSameChord - 是否为同一和弦的重复
 * @returns {number} 罚分值，若超过阈值则返回INVALID_COST
 *
 * 声部交叉定义:
 *   后一和弦中某声部的音高超越了前一和弦中相邻声部的位置。
 *   例如: 后一和弦的S低于前一和弦的A，即构成交叉。
 *   同一和弦转换时不检查此项。
 */
export function checkVoiceOverlap(oldVoices, newVoices, isSameChord) {
  if (isSameChord) return 0;
  const { S: nS, A: nA, T: nT, B: nB } = newVoices;
  const { S: oS, A: oA, T: oT, B: oB } = oldVoices;

  // 严格禁止声部超越：后一和弦中某声部不得超越前一和弦相邻声部的位置
  if (nS < oA) return INVALID_COST;      // S低于前A
  if (nA > oS || nA < oT) return INVALID_COST;  // A超越前S或低于前T
  if (nT > oA || nT < oB) return INVALID_COST;  // T超越前A或低于前B
  if (nB > oT) return INVALID_COST;      // B超越前T

  return 0;
}

/**
 * 检查四声部是否全部同向进行
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 后一和弦声部配置
 * @returns {number} 罚分值
 *
 * 古典和声要求声部之间应有方向对比，全部同向进行会产生单调效果，
 * 因此给予罚分但不完全禁止。
 */
export function checkSameDirection(oldVoices, newVoices) {
  const diffs = ['S', 'A', 'T', 'B'].map(v => {
    const d = newVoices[v] - oldVoices[v];
    return d > 0 ? 1 : (d < 0 ? -1 : 0);  // 1=上行, -1=下行, 0=保持
  });

  // 如果所有声部都上行或都下行（且没有保持不动的），严格禁止
  if (diffs.filter(d => d === 0).length === 0) {
    if (diffs.every(d => d === 1) || diffs.every(d => d === -1)) {
      return INVALID_COST;
    }
  }
  return 0;
}

/**
 * 检查终止四六和弦(K64)和其他六四和弦的声部进行约束
 * @param {string} lastChord - 前一和弦名
 * @param {string} targetChord - 目标和弦名
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 六四和弦在古典和声中通常作为经过性或辅助性和弦使用，
 * 要求所有声部进行都非常平稳（不超过全音级进）。
 */
export function checkCadential64Context(lastChord, targetChord, oldVoices, newVoices) {
  const is64 = [lastChord, targetChord].some(c => ['S64', 's64', 'D64', 'T64', 't64'].includes(c));
  if (!is64) return 0;

  // 低音只能级进（不超过全音）
  const bassLeap = Math.abs(newVoices.B - oldVoices.B);
  if (![0, 1, 2].includes(bassLeap)) return INVALID_COST;

  // 上方三声部也必须级进
  for (const v of ['S', 'A', 'T']) {
    if (Math.abs(newVoices[v] - oldVoices[v]) > 2) return INVALID_COST;
  }
  return 0;
}

/**
 * 检查辅助和弦（Auxiliary/Neighbor Chord）的线性进行约束
 * @param {string} lastChord - 前一和弦名
 * @param {string} targetChord - 目标和弦名
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 辅助和弦（如 S-T6-S 或 T6-S-T6 中的中间和弦）要求:
 *   所有声部都只做不超过全音的级进运动。
 */
export function checkAuxiliaryLinear(lastChord, targetChord, oldVoices, newVoices) {
  const isAux =
    (['S', 's', 'S6', 's6', 'Sii6', 'sii6'].includes(lastChord) && ['T6', 't6'].includes(targetChord)) ||
    (['T6', 't6'].includes(lastChord) && ['S', 's', 'S6', 's6', 'Sii6', 'sii6'].includes(targetChord));

  if (!isAux) return 0;

  for (const v of ['S', 'A', 'T']) {
    if (Math.abs(newVoices[v] - oldVoices[v]) > 2) return INVALID_COST;
  }
  return 0;
}

/**
 * 检查平行进行（Parallel Motion）
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 后一和弦声部配置
 * @param {string} lastChord - 前一和弦名
 * @param {string} targetChord - 目标和弦名
 * @returns {number} 罚分值，若超过阈值则返回INVALID_COST
 *
 * 严格禁止:
 *   - 平行八度/同度: 两声部保持八度/同度关系且同向运动
 *   - 平行五度: 两声部保持五度关系且同向运动
 *   - 隐伏五度: 两声部同向运动进入五度关系
 *
 * 例外:
 *   - German sixth 解决到属和弦时允许平行五度（古典和声中的著名例外）
 */
export function checkParallelIntervals(oldVoices, newVoices, lastChord, targetChord) {
  let penalty = 0;
  const voiceNames = ['S', 'A', 'T', 'B'];

  // 检查所有声部对组合（S-A, S-T, S-B, A-T, A-B, T-B）
  for (let i = 0; i < voiceNames.length; i++) {
    for (let j = i + 1; j < voiceNames.length; j++) {
      const v1 = voiceNames[i];
      const v2 = voiceNames[j];
      const o1 = oldVoices[v1], o2 = oldVoices[v2];
      const n1 = newVoices[v1], n2 = newVoices[v2];

      // 两声部都没有移动，跳过检查
      if (o1 === n1 && o2 === n2) continue;

      const d1 = n1 - o1;  // 声部1的运动方向与幅度
      const d2 = n2 - o2;  // 声部2的运动方向与幅度
      const sameDir = (d1 * d2) > 0;    // 是否同向运动
      const contraDir = (d1 * d2) < 0;  // 是否反向运动

      const oldInt = Math.abs(o1 - o2) % 12;  // 前一和弦中的音程
      const newInt = Math.abs(n1 - n2) % 12;  // 后一和弦中的音程

      // === 平行八度/同度 ===
      if (oldInt === 0 && newInt === 0) {
        if (sameDir || contraDir) penalty += PARALLEL_PENALTIES.octaveUnison;
      }

      // === 平行五度 ===
      if (oldInt === 7 && newInt === 7) {
        if (sameDir) {
          // German sixth 例外: 德国增六和弦解决到属和弦时允许平行五度
          if (lastChord.includes('Ger') && ['D', 'D6', 'D7', 'D7不完全'].includes(targetChord)) {
            // 允许通过
          } else {
            penalty += PARALLEL_PENALTIES.fifth;
          }
        } else if (contraDir) {
          penalty += PARALLEL_PENALTIES.fifth;
        }
      }

      // === 隐伏五度 ===
      if (sameDir && oldInt === 6 && newInt === 7) {
        penalty += PARALLEL_PENALTIES.hiddenFifth;
      }

      // === S-B隐伏八度/五度 ===
      // 女高与男低同向跳进进入八度或五度是隐伏进行的典型情况
      if (v1 === 'S' && v2 === 'B') {
        if ((newInt === 0 || newInt === 7) && sameDir && Math.abs(n1 - o1) >= 3) {
          penalty += PARALLEL_PENALTIES.octaveUnison;
        }
      }
    }
  }

  return penalty >= PARALLEL_PENALTIES.maxAllowed ? INVALID_COST : penalty;
}

/**
 * 检查低音与上方声部的平行进行（低音级进时）
 * @param {string} lastChord - 前一和弦名
 * @param {string} targetChord - 目标和弦名
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @returns {number} 罚分值，若非法则返回INVALID_COST
 *
 * 当低音做级进（1-2半音）时，检查上方声部是否与低音同向运动
 * 进入完美的八度、五度或同度关系。
 */
export function checkBassParallel(lastChord, targetChord, oldVoices, newVoices) {
  const bassLeap = Math.abs(newVoices.B - oldVoices.B);
  if (![1, 2].includes(bassLeap)) return 0;  // 非级进跳过

  const bassDiff = newVoices.B - oldVoices.B;
  let penalty = 0;

  for (const v of ['S', 'A', 'T']) {
    const vDiff = newVoices[v] - oldVoices[v];
    // 上方声部与低音同向运动
    if (vDiff !== 0 && (vDiff * bassDiff) > 0) {
      const newInterval = Math.abs(newVoices[v] - newVoices.B) % 12;
      // 同向级进进入完美音程: 严格禁止
      if ([0, 5, 7].includes(newInterval)) {
        return INVALID_COST;
      } else {
        penalty += 500;  // 其他情况给予罚分
      }
    }
  }
  return penalty;
}

/**
 * 检查同度音重叠惩罚
 * @param {Object} voices - 声部配置 {S, A, T, B}
 * @param {string} targetChord - 目标和弦名
 * @returns {number} 罚分值
 *
 * 相邻声部之间出现同音（unison）在古典和声中应尽量避免，
 * 但在副属、增六、重属等复杂和弦中容忍度更低，罚分加倍。
 */
export function checkUnisons(voices, targetChord) {
  const { S, A, T, B } = voices;
  let penalty = 0;
  if (S === A) penalty += UNISON_PENALTIES.SA;  // 女高-女低同度
  if (A === T) penalty += UNISON_PENALTIES.AT;  // 女低-男高同度
  if (T === B) penalty += UNISON_PENALTIES.TB;  // 男高-男低同度

  // 在复杂和弦中同度更加不自然，罚分乘以风格乘数
  if (penalty > 0 &&
      (targetChord.includes('vii') || targetChord.includes('+6') || targetChord.includes('DD'))) {
    penalty *= 4;
  }
  return penalty;
}
