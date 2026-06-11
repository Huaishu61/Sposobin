/**
 * Viterbi 路径搜索算法
 *
 * 用于自由模式下寻找最优的全局和声配置。
 * 给定一个和弦序列（如 ["T", "D", "T"]），在保持第一和弦声部固定的前提下，
 * 寻找后续每个和弦的最优声部排列，使得总声部进行代价最小。
 *
 * 算法特性:
 *   - 动态规划: 每个位置只保留到达该状态的最小代价路径
 *   - 全局最优: 确保整个序列的总代价最小，而非局部贪心
 *   - 可约束高音: 在高音题模式下可固定每个位置的S声部
 */

import { getChordCandidates } from './candidateEngine.js';
import { evaluateVoicing } from '../rules/index.js';
import { vToTuple, tupleToV } from '../utils/index.js';

/**
 * 计算最优声部排列路径
 *
 * @param {string[]} chordSequence - 和弦名称序列，如 ["T", "D7", "T"]
 * @param {Object} initialVoicing - 第一和弦的声部配置 {S, A, T, B}
 * @param {Object} dnaDb - DNA数据库
 * @param {Object} keyInfo - 当前调性信息
 * @param {number[]|null} targetMelody - 可选的高音约束数组
 * @returns {Object[]|null} 最优声部配置数组，或null（如果无解）
 *
 * DP状态设计:
 *   dp[i][stateKey] = {cost, prev, chord, tuple}
 *   stateKey = "和弦名|[S,A,T,B]" 的字符串形式
 *   cost: 到达该状态的累计最小代价
 *   prev: 前一状态的状态键（用于回溯）
 */
export function calculateBestVoicing(chordSequence, initialVoicing, dnaDb, keyInfo, targetMelody = null) {
  const dp = [];

  // 初始化第0层: 只有初始声部配置一个状态
  dp.push({
    [`${chordSequence[0]}|${JSON.stringify(vToTuple(initialVoicing))}`]: {
      cost: 0,                           // 初始代价为0
      prev: null,                        // 无前驱
      chord: chordSequence[0],           // 和弦名
      tuple: vToTuple(initialVoicing)  // 声部元组 [S,A,T,B]
    }
  });

  // 逐层推进DP
  for (let i = 1; i < chordSequence.length; i++) {
    const currentChord = chordSequence[i];    // 当前和弦名
    const lastChord = chordSequence[i - 1];   // 前一和弦名
    const nextLayer = {};                      // 下一层DP状态

    // 如果有高音约束，取当前位置的S声部目标值
    const targetS = targetMelody && i < targetMelody.length ? targetMelody[i] : null;

    // 获取当前和弦的所有候选声部排列
    const candidates = getChordCandidates(currentChord, dnaDb, targetS);

    // 遍历前一层的所有状态，尝试转移到当前层的每个候选
    for (const [prevKey, prevData] of Object.entries(dp[dp.length - 1])) {
      const prevC = prevData.chord;          // 前一和弦名
      const prevV = tupleToV(prevData.tuple);  // 前一声部配置

      for (const currV of candidates) {
        // 评估从前一状态到当前候选的声部进行代价
        const cost = evaluateVoicing(prevV, currV, prevC, currentChord, keyInfo);
        if (cost < 999999) {  // 999999表示非法进行
          const totalCost = prevData.cost + cost;  // 累计代价
          const currKey = `${currentChord}|${JSON.stringify(vToTuple(currV))}`;

          // 动态规划核心: 只保留到达每个状态的最小代价路径
          if (!(currKey in nextLayer) || totalCost < nextLayer[currKey].cost) {
            nextLayer[currKey] = {
              cost: totalCost,
              prev: prevKey,                 // 记录前驱用于回溯
              chord: currentChord,
              tuple: vToTuple(currV)
            };
          }
        }
      }
    }

    // 如果某一层没有任何合法状态，说明该序列无解
    if (Object.keys(nextLayer).length === 0) return null;
    dp.push(nextLayer);
  }

  // ===== 回溯最优路径 =====
  // 1. 在最后一层中找到代价最小的终止状态
  let bestFinalKey = null;
  let bestCost = Infinity;
  for (const [key, data] of Object.entries(dp[dp.length - 1])) {
    if (data.cost < bestCost) {
      bestCost = data.cost;
      bestFinalKey = key;
    }
  }

  // 2. 通过 prev 指针回溯完整路径
  const path = [];
  let currKey = bestFinalKey;
  for (let i = dp.length - 1; i >= 0; i--) {
    path.push(tupleToV(dp[i][currKey].tuple));
    currKey = dp[i][currKey].prev;
    // 如果在非起始层遇到null前驱，说明路径断裂
    if (currKey === null && i > 0) return null;
  }
  path.reverse();  // 反转得到从起始到终止的正序路径
  return path;
}
