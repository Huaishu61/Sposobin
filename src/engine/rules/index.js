/**
 * 声部进行评估总控模块
 *
 * 本模块是声部进行规则检查的主入口，协调所有子模块的评估流程:
 *   1. 硬约束检查（音域、间距）
 *   2. 声部进行规则（交叉、同向、平行）
 *   3. 和弦特定解决（七音、导音、增六等）
 *   4. 音程有效性（跳进限制）
 *   5. 平滑度惩罚（旋律线、内声部）
 *
 * 所有检查按阶段执行，一旦发现致命违规(INVALID_COST)立即返回，
 * 避免不必要的后续计算。
 */

import { spell_midi } from '../tonality/index.js';
import { INVALID_COST } from '../../constants/limits.js';
import * as voiceLeading from './voiceLeading.js';
import * as resolution from './resolution.js';
import * as intervals from './intervals.js';

/**
 * 评估两个连续和弦之间的声部进行
 *
 * @param {Object} oldVoices - 前一和弦声部配置 {S, A, T, B}
 * @param {Object} newVoices - 目标和弦声部配置 {S, A, T, B}
 * @param {string} lastChord - 前一和弦名称
 * @param {string} targetChord - 目标和弦名称
 * @param {Object} keyInfo - 当前调性信息（含调式类型、根音偏移等）
 * @returns {number} 总罚分值，若存在致命违规则返回INVALID_COST
 *
 * 评估流程:
 *   Phase 1: 硬约束（音域、间距）- 不可逾越
 *   Phase 2: 声部进行规则（交叉、同向、平行）- 核心古典法则
 *   Phase 3: 和弦特定约束（七音、导音、增六解决等）- 特性规则
 *   Phase 4: 音程有效性（跳进限制、罕见七和弦）- 横向运动规则
 *   Phase 5: 平滑度惩罚（旋律线、内声部）- 优化评分
 */
export function evaluateVoicing(oldVoices, newVoices, lastChord, targetChord, keyInfo) {
  // ===== Phase 1: 硬约束检查 =====
  let cost = voiceLeading.checkVoiceRanges(newVoices, keyInfo.app_mode);
  if (cost >= INVALID_COST) return INVALID_COST;

  cost = voiceLeading.checkVoiceSpacing(newVoices);
  if (cost >= INVALID_COST) return INVALID_COST;

  // 判断是否为同一和弦的重复（影响部分规则的应用）
  const oldPcs = new Set(['S', 'A', 'T', 'B'].map(v => oldVoices[v] % 12));
  const newPcs = new Set(['S', 'A', 'T', 'B'].map(v => newVoices[v] % 12));
  let commonCount = 0;
  for (const x of oldPcs) if (newPcs.has(x)) commonCount++;
  const isSameChord = commonCount >= 3;

  // 预计算所有声部的拼写信息（避免重复调用spell_midi）
  const spells = { last: {}, current: {} };
  for (const v of ['S', 'A', 'T', 'B']) {
    spells.last[v] = spell_midi(oldVoices[v], keyInfo, lastChord);
    spells.current[v] = spell_midi(newVoices[v], keyInfo, targetChord);
  }

  // ===== Phase 2: 声部进行规则 =====
  cost = voiceLeading.checkVoiceOverlap(oldVoices, newVoices, isSameChord);
  if (cost >= INVALID_COST) return INVALID_COST;
  let totalPenalty = cost;

  cost = voiceLeading.checkSameDirection(oldVoices, newVoices);
  if (cost >= INVALID_COST) return INVALID_COST;
  totalPenalty += cost;

  cost = voiceLeading.checkCadential64Context(lastChord, targetChord, oldVoices, newVoices);
  if (cost >= INVALID_COST) return INVALID_COST;

  cost = voiceLeading.checkAuxiliaryLinear(lastChord, targetChord, oldVoices, newVoices);
  if (cost >= INVALID_COST) return INVALID_COST;

  // ===== Phase 3: 低音跳进与和弦结构约束 =====
  totalPenalty += intervals.checkBassLeap(oldVoices, newVoices);

  cost = resolution.checkChordConstraints(newVoices, targetChord, keyInfo);
  if (cost >= INVALID_COST) return INVALID_COST;

  cost = resolution.checkNinthResolution(oldVoices, newVoices, lastChord, targetChord);
  if (cost >= INVALID_COST) return INVALID_COST;

  cost = resolution.checkD6Constraint(newVoices, targetChord, spells, keyInfo);
  if (cost >= INVALID_COST) return INVALID_COST;

  // ===== Phase 4: 音程有效性 =====
  cost = intervals.checkIntervalValidity(oldVoices, newVoices, lastChord, targetChord, spells);
  if (cost >= INVALID_COST) return INVALID_COST;

  // ===== Phase 5: 特性和弦解决规则 =====
  cost = resolution.checkAugmentedSixthResolution(oldVoices, newVoices, lastChord, spells, keyInfo);
  if (cost >= INVALID_COST) return INVALID_COST;

  cost = resolution.checkN6Resolution(oldVoices, newVoices, lastChord, targetChord, spells, keyInfo);
  if (cost >= INVALID_COST) return INVALID_COST;

  cost = resolution.checkSeventhResolution(oldVoices, newVoices, lastChord, targetChord, spells, keyInfo);
  if (cost >= INVALID_COST) return INVALID_COST;

  cost = resolution.checkLeadingToneResolution(oldVoices, newVoices, lastChord, targetChord, spells, keyInfo);
  if (cost >= INVALID_COST) return INVALID_COST;

  cost = resolution.checkCadential64Resolution(oldVoices, newVoices, lastChord, targetChord, spells, keyInfo);
  if (cost >= INVALID_COST) return INVALID_COST;

  cost = resolution.checkTtoDDFlat5(oldVoices, newVoices, lastChord, targetChord, keyInfo);
  if (cost >= INVALID_COST) return INVALID_COST;

  cost = resolution.checkD7_6Rules(oldVoices, newVoices, lastChord, targetChord, spells, keyInfo);
  if (cost >= INVALID_COST) return INVALID_COST;

  totalPenalty += resolution.checkFalseRelations(spells);

  // ===== Phase 6: 平行进行与低音平行检查 =====
  cost = voiceLeading.checkBassParallel(lastChord, targetChord, oldVoices, newVoices);
  if (cost >= INVALID_COST) return INVALID_COST;
  totalPenalty += cost;

  cost = voiceLeading.checkParallelIntervals(oldVoices, newVoices, lastChord, targetChord);
  if (cost >= INVALID_COST) return INVALID_COST;
  totalPenalty += cost;

  totalPenalty += voiceLeading.checkUnisons(newVoices, targetChord);

  cost = intervals.checkRareSevenths(lastChord, targetChord, oldVoices, newVoices);
  if (cost >= INVALID_COST) return INVALID_COST;
  totalPenalty += cost;

  // ===== Phase 7: 平滑度惩罚 =====
  // 计算女高音旋律赦免状态（特定解决中允许大跳）
  const leapS = Math.abs(newVoices.S - oldVoices.S);
  let isAmnesty = false;
  if (['D34', 'D56', 'D7', 'D6', 'DD34b5', 'DD2b5', 'DD56b5', 'DD7b5', 'D7不完全'].includes(lastChord) &&
      ['T', 'T不完全', 'D', 'D7', 'K64', 't', 't不完全'].includes(targetChord)) {
    if ([5, 7, 0].includes(leapS)) isAmnesty = true;
  }
  if (['D7⁶', 'DD7⁶'].includes(lastChord) &&
      ['T', 'T不完全', 't', 't不完全', 'D', 'D7', 'D7不完全'].includes(targetChord)) {
    if ([3, 4].includes(leapS) && newVoices.S < oldVoices.S) isAmnesty = true;
  }

  totalPenalty += intervals.calculateMelodyPenalty(oldVoices, newVoices, isSameChord, isAmnesty);
  totalPenalty += intervals.calculateInnerPenalty(oldVoices, newVoices);

  return totalPenalty;
}
