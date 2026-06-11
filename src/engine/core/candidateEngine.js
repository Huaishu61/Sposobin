/**
 * 和弦候选生成引擎
 *
 * 本模块负责根据给定的和弦名称生成所有合法的四声部排列组合。
 * 采用"直接构造"算法替代传统的全组合枚举，大幅提升性能:
 *   - 传统方法: 从所有可用音符(60个)中组合选3个，复杂度O(C(60,3))≈34,220次/和弦
 *   - 本方法: 根据和弦必需的音级(required)直接构造有效排列，复杂度降至约144次/和弦
 *
 * 核心逻辑:
 *   1. 遍历该和弦所有可能的低音位置(bass_options)
 *   2. 根据是否需要固定高音(targetS)分两种策略构造
 *   3. 检查四声部音高集合是否匹配该和弦所需的音级集合
 *   4. 应用max_counts约束过滤重复音过多的排列
 */

import { AVAILABLE_NOTES } from '../data/index.js';

/** 可用音符集合，用于快速查找O(1)判断某MIDI音符是否可用 */
const NOTE_SET = new Set(AVAILABLE_NOTES);

/**
 * 检查给定的音高类数组是否满足和弦的音级要求和重复限制
 *
 * @param {number[]} pcs - 四声部的音高类数组 [S_pc, A_pc, T_pc, B_pc]
 * @param {Set} requiredSet - 和弦所需的音高类集合（来自DNA数据库）
 * @param {Object} maxCounts - 各音高类的最大出现次数限制
 * @returns {boolean} 是否满足所有约束
 *
 * 算法逻辑:
 *   1. 统计每个音高类在四声部中出现的次数
 *   2. 检查是否有音高类超过max_counts限制
 *   3. 检查实际出现的音高类集合是否与requiredSet完全一致
 */
function matchesRequired(pcs, requiredSet, maxCounts) {
  const counts = {};
  for (const pc of pcs) {
    counts[pc] = (counts[pc] || 0) + 1;
    // 如果某音高类出现次数超过允许的最大值，立即返回false
    if (counts[pc] > (maxCounts[pc] || 4)) return false;
  }
  // 检查实际集合大小是否与要求一致（避免缺少必要音级或多余音级）
  const actualSet = new Set(pcs);
  if (actualSet.size !== requiredSet.size) return false;
  // 检查每个实际出现的音高类是否都在requiredSet中
  for (const pc of actualSet) {
    if (!requiredSet.has(pc)) return false;
  }
  return true;
}

/**
 * 生成指定和弦的所有合法四声部排列
 *
 * @param {string} chordName - 和弦标识符，如 "T", "D7", "Sii6" 等
 * @param {Object} dnaDb - DNA数据库，包含和弦的连接关系、低音选项、必需音级等
 * @param {number|null} targetS - 固定高音MIDI值（高音题/写作模式使用），null表示自由模式
 * @param {number|null} targetB - 固定低音MIDI值（低音题模式使用），null表示自由模式
 * @returns {Array} 合法排列数组，每个元素为 {S, A, T, B} 对象
 *
 * 生成策略:
 *   自由模式(targetS=null, targetB=null):
 *     遍历所有可能的S(女高音)、A(女低音)、T(男高音)组合，
 *     只要满足音级要求且声部间距不超过纯八度即为合法。
 *
 *   固定高音模式(targetS有值):
 *     高音已锁定，只需搜索A和T的有效范围（受S和低音约束），
 *     大幅减少搜索空间。
 *
 *   固定低音模式(targetB有值):
 *     低音已锁定（且必须匹配该和弦的bass_options之一），
 *     只需搜索T、A、S的有效范围（受B约束）。
 */
export function getChordCandidates(chordName, dnaDb, targetS = null, targetB = null) {
  const dna = dnaDb[chordName];
  if (!dna) return [];  // DNA中无此和弦定义

  const candidates = [];
  const requiredSet = dna.required;      // 和弦必需的音高类集合
  const maxCounts = dna.max_counts || {}; // 各音高类的最大重复次数

  // 遍历该和弦所有可能的低音位置
  for (const bass of dna.bass_options) {
    if (!NOTE_SET.has(bass)) continue;   // 跳过不在可用音符范围内的低音
    const bassPc = bass % 12;
    if (!requiredSet.has(bassPc)) continue; // 低音音级必须属于必需集合

    if (targetB !== null) {
      // ===== 固定低音模式 =====
      if (bass !== targetB) continue;  // 低音必须匹配 targetB
      const bPc = targetB % 12;

      // T(男高音)范围: (低音, 低音+24]，但不超过可用范围
      const minT = bass + 1;
      const maxT = Math.min(bass + 24, 69);  // 69 = C#5，男高音上限
      for (let t = minT; t <= maxT; t++) {
        if (!NOTE_SET.has(t)) continue;
        const tPc = t % 12;

        // A(女低音)范围: [T, min(T+12, 74)]，74 = D5，女低音上限
        const maxA = Math.min(t + 12, 74);
        for (let a = t; a <= maxA; a++) {
          if (!NOTE_SET.has(a)) continue;
          if (a - t > 12) continue;  // 女低与男高之间不能超过纯八度
          const aPc = a % 12;

          // S(女高音)范围: [A, min(A+12, 84)]，84 = A5，女高音上限
          const maxS = Math.min(a + 12, 84);
          for (let s = a; s <= maxS; s++) {
            if (!NOTE_SET.has(s)) continue;
            if (s - a > 12) continue;  // 女高与女低之间不能超过纯八度
            const sPc = s % 12;

            const pcs = [sPc, aPc, tPc, bPc];
            if (matchesRequired(pcs, requiredSet, maxCounts)) {
              candidates.push({ S: s, A: a, T: t, B: targetB });
            }
          }
        }
      }
    } else if (targetS !== null) {
      // ===== 固定高音模式 =====
      const sPc = targetS % 12;
      if (!requiredSet.has(sPc)) continue;  // 高音音级必须属于必需集合
      if (targetS <= bass) continue;         // 高音必须高于低音

      // A(女低音)的有效范围: [max(低音+1, 高音-12), 高音]
      // 确保 A <= S 且 A - T <= 12
      const minA = Math.max(bass + 1, targetS - 12);
      for (let a = targetS; a >= minA; a--) {
        if (!NOTE_SET.has(a)) continue;
        const aPc = a % 12;

        // T(男高音)的有效范围: (低音, A]
        const minT = bass + 1;
        const maxT = Math.min(a, a); // T <= A
        for (let t = minT; t <= maxT; t++) {
          if (!NOTE_SET.has(t)) continue;
          if (a - t > 12) continue;  // 女低与男高之间不能超过纯八度

          // 检查四声部音级组合是否满足和弦要求
          const pcs = [sPc, aPc, t % 12, bassPc];
          if (matchesRequired(pcs, requiredSet, maxCounts)) {
            candidates.push({ S: targetS, A: a, T: t, B: bass });
          }
        }
      }
    } else {
      // ===== 自由模式 =====
      // S(女高音)范围: (低音, 合理上限]
      const minS = bass + 1;
      const maxS = Math.min(84, 95);  // 84=A5，95超出常规女高音范围但留有余量

      for (let s = minS; s <= maxS; s++) {
        if (!NOTE_SET.has(s)) continue;
        const sPc = s % 12;
        if (!requiredSet.has(sPc)) continue;

        // A(女低音)范围: [max(低音+1, 高音-12), 高音]
        const minA = Math.max(bass + 1, s - 12);
        for (let a = s; a >= minA; a--) {
          if (!NOTE_SET.has(a)) continue;
          const aPc = a % 12;

          // T(男高音)范围: (低音, A]
          const minT = bass + 1;
          for (let t = minT; t <= a; t++) {
            if (!NOTE_SET.has(t)) continue;
            if (a - t > 12) continue;

            const pcs = [sPc, aPc, t % 12, bassPc];
            if (matchesRequired(pcs, requiredSet, maxCounts)) {
              candidates.push({ S: s, A: a, T: t, B: bass });
            }
          }
        }
      }
    }
  }

  return candidates;
}
