/**
 * 音程有效性与跳进检查模块
 *
 * 本模块处理各声部横向运动的约束:
 *   1. 低音跳进限制: 最大不超过纯八度，禁止小七度/大七度跳进
 *   2. 各声部音程性质检查: 确保跳进符合自然音阶逻辑
 *   3. 罕见七和弦检查: 对T7、VI7等不常用七和弦施加限制
 *   4. 旋律线惩罚计算: 根据跳进幅度计算声部平滑度评分
 */

import { INVALID_COST, BASS_LEAP_LIMITS, RARE_SEVENTH_PENALTY } from '../../constants/limits.js';

/**
 * 检查低音声部的跳进
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @returns {number} 罚分值，若非法则返回INVALID_COST
 *
 * 低音作为和声基础，其跳进限制最为严格:
 *   - 绝对禁止: 小七度(10)、大七度(11)、增四度上行等
 *   - 允许但惩罚: 减五度下行(特殊进行)、小六度/大六度
 *   - 推荐: 级进(1-2半音)或小三度(3-4半音)跳进
 */
export function checkBassLeap(oldVoices, newVoices) {
  const bassDiff = newVoices.B - oldVoices.B;  // 有方向跳进值
  const bassLeap = Math.abs(bassDiff);          // 绝对跳进幅度
  const isDim5Down = (bassDiff === -6);         // 是否减五度下行

  // 绝对限制: 超过纯八度禁止
  if (bassLeap > BASS_LEAP_LIMITS.absoluteMax) return INVALID_COST;
  // 绝对限制: 小七度、大七度禁止
  if (BASS_LEAP_LIMITS.forbidden.includes(bassLeap)) return INVALID_COST;
  // 减五度下行允许，但其他六度跳进禁止
  if (bassLeap === 6 && !isDim5Down) return INVALID_COST;

  // 罚分计算
  if (bassLeap === 6 && isDim5Down) return BASS_LEAP_LIMITS.diminishedPenalty;
  if (BASS_LEAP_LIMITS.majorPenalty.includes(bassLeap)) return BASS_LEAP_LIMITS.majorLeapPenalty;
  return bassLeap * BASS_LEAP_LIMITS.minorPenaltyPerSemitone;
}

/**
 * 检查各声部音程的有效性
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {string} lastChord - 前一和弦名
 * @param {string} targetChord - 目标和弦名
 * @param {Object} newSpells - 前后和弦的拼写信息
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 核心逻辑:
 *   将MIDI跳进映射到调式音级，检查音程的"音阶级"与"半音数"是否匹配。
 *   不匹配则视为非古典音程（如增二度、减七度等），通常禁止。
 *
 * 例外:
 *   - N6→D时允许减二度（那不勒斯和弦的特殊性）
 *   - 低音减五度下行允许
 *   - 女高音在特定解决中允许较大跳进
 */
export function checkIntervalValidity(oldVoices, newVoices, lastChord, targetChord, newSpells) {
  for (const v of ['S', 'A', 'T', 'B']) {
    const leap = Math.abs(newVoices[v] - oldVoices[v]);
    if (leap === 0) continue;  // 共同音保持，无需检查

    const oldStep = newSpells.last[v][1];      // 前一和弦中的调式音级
    const newStep = newSpells.current[v][1];   // 目标和弦中的调式音级

    const stepDiff = Math.abs(newStep - oldStep);           // 音级差
    const normStep = Math.min(stepDiff, 7 - stepDiff);      // 归一化到0-3度
    const normIc = Math.min(leap % 12, 12 - (leap % 12));  // 归一化音程类

    // 检查是否为非古典音程（音级与半音数不匹配）
    let isUnclassical = false;
    if (normStep === 1 && ![1, 2].includes(normIc)) isUnclassical = true;      // 二度必须是1-2半音
    else if (normStep === 2 && ![3, 4].includes(normIc)) isUnclassical = true;  // 三度必须是3-4半音
    else if (normStep === 3 && normIc !== 5) isUnclassical = true;              // 四度必须是5半音
    else if (normStep === 0 && ![0, 1].includes(normIc)) isUnclassical = true;  // 同度/半音必须是0-1半音

    // 例外1: N6→D允许减二度（那不勒斯和弦降二级到导音）
    if (lastChord === 'N6' && targetChord.startsWith('D')) {
      if (normStep === 2 && normIc === 2) isUnclassical = false;
    }

    if (isUnclassical) {
      // 例外2: 低音减五度下行允许
      if (v === 'B' && leap === 6 && newVoices[v] < oldVoices[v]) {
        // 允许通过
      }
      // 例外3: 女高音在特定解决中的赦免（由checkMelodyAmnesty处理）
      else if (v === 'S') {
        // 暂不阻断，由旋律惩罚处理
      } else {
        return INVALID_COST;
      }
    }

    // 限制非女高音声部的大跳: 超过纯五度（7半音）禁止
    if ((leap >= 9 && leap <= 11) || leap > 12) {
      if (v !== 'S') return INVALID_COST;
    }
  }

  return 0;
}

/**
 * 检查罕见七和弦的使用约束
 * @param {string} lastChord - 前一和弦名
 * @param {string} targetChord - 目标和弦名
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @returns {number} 罚分值，若非法则返回INVALID_COST
 *
 * 罕见七和弦（T7、t7、VI7等）在古典和声中极少使用，
 * 使用时要求:
 *   - 所有声部进行必须极为平稳（不超过全音级进）
 *   - 前接和弦必须有某声部下行级进（作为七音的预备）
 */
export function checkRareSevenths(lastChord, targetChord, oldVoices, newVoices) {
  const rareSevenths = ['T7', 't7', 'VI7', 'DTiii7', 'S7', 's7'];
  let penalty = 0;

  // 目标为罕见七和弦: 施加惩罚并限制跳进
  if (rareSevenths.includes(targetChord)) {
    penalty += RARE_SEVENTH_PENALTY;
    const leapS = Math.abs(newVoices.S - oldVoices.S);
    const leapA = Math.abs(newVoices.A - oldVoices.A);
    const leapT = Math.abs(newVoices.T - oldVoices.T);
    if (leapS > 2 || leapA > 2 || leapT > 2) return INVALID_COST;
  }

  // 前接罕见七和弦: 必须有某声部下行级进（七音的解决）
  if (rareSevenths.includes(lastChord)) {
    let hasStepDown = false;
    for (const v of ['S', 'A', 'T', 'B']) {
      const diff = oldVoices[v] - newVoices[v];  // 下行=正数
      if (diff === 1 || diff === 2) {  // 级进或全音下行
        hasStepDown = true;
        break;
      }
    }
    if (!hasStepDown) return INVALID_COST;
  }

  return penalty;
}

/**
 * 计算旋律线（女高音）的惩罚值
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {boolean} isSameChord - 是否为同一和弦的重复
 * @param {boolean} isAmnesty - 是否处于"赦免"状态（特定解决中允许大跳）
 * @returns {number} 罚分值
 *
 * 惩罚策略:
 *   - 级进(1-2半音): 最优，无惩罚
 *   - 三度/四度跳进(3-5半音): 中等惩罚
 *   - 五度以上跳进: 重罚
 *   - 保持不动: 同和弦重复时轻罚，不同和弦时无罚
 */
export function calculateMelodyPenalty(oldVoices, newVoices, isSameChord, isAmnesty) {
  if (isAmnesty) return 20;  // 赦免状态下的固定轻罚

  const leapS = Math.abs(newVoices.S - oldVoices.S);

  if (leapS === 0) return isSameChord ? 2.0 : 0.0;  // 保持不动
  if ([1, 2].includes(leapS)) return 0.0;            // 级进（最优）
  if ([3, 4, 5].includes(leapS)) {                   // 三度/四度跳进
    return isSameChord ? 1.0 : leapS * 1.5;
  }
  return leapS * 2.0;  // 五度以上大跳（重罚）
}

/**
 * 计算内声部（女低音+男高音）的惩罚值
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @returns {number} 罚分值
 *
 * 内声部应比旋律声部更平稳:
 *   - 级进: 半惩罚（因为内声部更应平稳）
 *   - 三度/四度: 中等惩罚
 *   - 五度以上: 重罚
 */
export function calculateInnerPenalty(oldVoices, newVoices) {
  let penalty = 0;
  for (const v of ['A', 'T']) {
    const leap = Math.abs(newVoices[v] - oldVoices[v]);
    if (leap === 0) continue;
    if ([1, 2].includes(leap)) penalty += leap * 0.5;   // 级进: 轻罚
    else if ([3, 4].includes(leap)) penalty += leap * 1.2;  // 三/四度: 中等
    else penalty += leap * 2.0;  // 大跳: 重罚
  }
  return penalty;
}
