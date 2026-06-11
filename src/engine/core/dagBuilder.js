/**
 * DAG (有向无环图) 构建器
 *
 * 为高音题模式构建和弦进行的状态空间图。
 * 每一层代表旋律的一个音符位置，节点代表该位置的一个合法和弦配置，
 * 边代表两个连续位置之间合法的声部进行。
 *
 * 构建完成后，通过反向剪枝删除无法到达终止状态的死路节点，
 * 确保只保留从起始到终止的完整合法路径。
 */

import { getChordCandidates } from './candidateEngine.js';
import { evaluateVoicing } from '../rules/index.js';
import { vToTuple, tupleToV, getChordSiblings } from '../utils/index.js';
import { START_CANDIDATES } from '../../constants/modes.js';

/**
 * 构建完整DAG图
 *
 * @param {number[]} targetMelody - 目标旋律的MIDI音符数组
 * @param {Object} dnaDb - DNA数据库（已转调至当前调性）
 * @param {Object} keyInfo - 当前调性信息
 * @param {string} targetVoice - 固定声部 ('S' 或 'B')，默认 'S'
 * @returns {Array|null} DAG层数组或null（如果无法构建）
 *
 * 构建流程:
 *   1. 创建初始层: 从START_CANDIDATES中找出匹配第一个旋律音的所有配置
 *   2. 逐层扩展: 对每一对连续旋律音，根据DNA连接关系找出所有合法转移
 *   3. 连接边: 使用evaluateVoicing检查声部进行是否合法
 *   4. 终止剪枝: 仅保留以主和弦(T/t)结尾的路径
 *   5. 反向死路清除: 删除无法通向终止状态的中间节点
 */
export function buildFullDag(targetMelody, dnaDb, keyInfo, targetVoice = 'S') {
  const layers = [];

  // ===== 第0层: 初始和弦层 =====
  let currentLayer = {};
  // 优先使用常见的起始候选和弦（主、属、下属功能组）
  const firstTarget = targetMelody[0];
  for (const c of START_CANDIDATES) {
    if (!(c in dnaDb)) continue;
    const cands = targetVoice === 'B'
      ? getChordCandidates(c, dnaDb, null, firstTarget)
      : getChordCandidates(c, dnaDb, firstTarget);
    for (const v of cands) {
      const key = `${c}|${JSON.stringify(vToTuple(v))}`;
      currentLayer[key] = { next: new Set(), prev: new Set(), chord: c, tuple: vToTuple(v) };
    }
  }
  // 如果候选集为空，回退到DNA中所有和弦（兜底策略）
  if (Object.keys(currentLayer).length === 0) {
    for (const c of Object.keys(dnaDb)) {
      const cands = targetVoice === 'B'
        ? getChordCandidates(c, dnaDb, null, firstTarget)
        : getChordCandidates(c, dnaDb, firstTarget);
      for (const v of cands) {
        const key = `${c}|${JSON.stringify(vToTuple(v))}`;
        currentLayer[key] = { next: new Set(), prev: new Set(), chord: c, tuple: vToTuple(v) };
      }
    }
  }
  layers.push(currentLayer);

  // ===== 逐层构建 =====
  for (let i = 1; i < targetMelody.length; i++) {
    const nextLayer = {};
    const tgtS = targetMelody[i];          // 当前目标旋律音
    const prevLayer = layers[layers.length - 1];

    // 收集所有可能的下一和弦: 基于前一层的 outgoing connections
    const allPossibleNext = new Set();
    for (const stateKey of Object.keys(prevLayer)) {
      const cName = prevLayer[stateKey].chord;
      for (const nxt of dnaDb[cName]?.next || []) {
        allPossibleNext.add(nxt);
        for (const sib of getChordSiblings(nxt, dnaDb)) allPossibleNext.add(sib);
      }
      for (const sib of getChordSiblings(cName, dnaDb)) allPossibleNext.add(sib);
    }

    // 预计算候选声部排列，避免重复计算
    const candCache = {};
    for (const nxtC of allPossibleNext) {
      if (nxtC in dnaDb) {
        candCache[nxtC] = targetVoice === 'B'
          ? getChordCandidates(nxtC, dnaDb, null, tgtS)
          : getChordCandidates(nxtC, dnaDb, tgtS);
      }
    }

    // 建立层间连接: 遍历前一层的每个状态，尝试连接到下一层的所有可能和弦
    for (const [stateKey, nodeData] of Object.entries(prevLayer)) {
      const cName = nodeData.chord;
      const vTup = nodeData.tuple;
      const possibleNexts = new Set();

      // 获取当前和弦的所有合法下一和弦（包括兄弟姐妹转位）
      for (const nxt of dnaDb[cName]?.next || []) {
        possibleNexts.add(nxt);
        for (const sib of getChordSiblings(nxt, dnaDb)) possibleNexts.add(sib);
      }
      for (const sib of getChordSiblings(cName, dnaDb)) possibleNexts.add(sib);

      for (const nxtC of possibleNexts) {
        if (!(nxtC in dnaDb)) continue;
        for (const nxtV of candCache[nxtC] || []) {
          // 使用声部进行规则引擎评估转移是否合法
          if (evaluateVoicing(tupleToV(vTup), nxtV, cName, nxtC, keyInfo) < 999999) {
            const nxtKey = `${nxtC}|${JSON.stringify(vToTuple(nxtV))}`;
            if (!(nxtKey in nextLayer)) {
              nextLayer[nxtKey] = { next: new Set(), prev: new Set(), chord: nxtC, tuple: vToTuple(nxtV) };
            }
            nextLayer[nxtKey].prev.add(stateKey);  // 建立反向链接
            nodeData.next.add(nxtKey);              // 建立正向链接
          }
        }
      }
    }

    layers.push(nextLayer);

    // ===== 空层回退策略 =====
    // 如果当前层没有合法节点，尝试放宽约束（允许DNA中所有和弦连接）
    if (Object.keys(nextLayer).length === 0) {
      const fallbackLayer = {};
      const fallbackCache = {};
      for (const nxtC of Object.keys(dnaDb)) {
        fallbackCache[nxtC] = targetVoice === 'B'
          ? getChordCandidates(nxtC, dnaDb, null, tgtS)
          : getChordCandidates(nxtC, dnaDb, tgtS);
      }
      for (const [stateKey, nodeData] of Object.entries(prevLayer)) {
        const cName = nodeData.chord;
        const vTup = nodeData.tuple;
        for (const nxtC of Object.keys(dnaDb)) {
          for (const nxtV of fallbackCache[nxtC] || []) {
            if (evaluateVoicing(tupleToV(vTup), nxtV, cName, nxtC, keyInfo) < 999999) {
              const nxtKey = `${nxtC}|${JSON.stringify(vToTuple(nxtV))}`;
              if (!(nxtKey in fallbackLayer)) {
                fallbackLayer[nxtKey] = { next: new Set(), prev: new Set(), chord: nxtC, tuple: vToTuple(nxtV) };
              }
              fallbackLayer[nxtKey].prev.add(stateKey);
              nodeData.next.add(nxtKey);
            }
          }
        }
      }
      if (Object.keys(fallbackLayer).length === 0) return null;  // 彻底失败
      layers.pop();
      layers.push(fallbackLayer);
    }
  }

  // ===== 终止剪枝: 仅保留以主和弦结尾的路径 =====
  const validFinals = new Set(['T', 'T不完全', 'T双三', 't', 't不完全']);
  const invalidFinals = [];
  for (const stateKey of Object.keys(layers[layers.length - 1])) {
    if (!validFinals.has(layers[layers.length - 1][stateKey].chord)) {
      invalidFinals.push(stateKey);
    }
  }

  // 删除非法终止节点及其入边
  for (const invState of invalidFinals) {
    if (layers.length > 1) {
      for (const prevState of layers[layers.length - 1][invState].prev) {
        layers[layers.length - 2][prevState].next.delete(invState);
      }
    }
    delete layers[layers.length - 1][invState];
  }

  if (Object.keys(layers[layers.length - 1]).length === 0) return null;

  // ===== 反向死路清除 =====
  // 从终止层向前遍历，删除没有出路的中间节点
  for (let i = layers.length - 1; i > 0; i--) {
    const deadStates = [];
    for (const [stateKey, data] of Object.entries(layers[i])) {
      // 中间层节点如果没有下一跳则为死路（终止层除外）
      if (i !== layers.length - 1 && data.next.size === 0) {
        deadStates.push(stateKey);
      }
    }
    for (const dead of deadStates) {
      for (const prevState of layers[i][dead].prev) {
        layers[i - 1][prevState].next.delete(dead);
      }
      delete layers[i][dead];
    }
  }

  // 清理起始层中的孤立节点（没有出路的起始状态）
  const deadStarts = [];
  for (const [stateKey, data] of Object.entries(layers[0])) {
    if (layers.length > 1 && data.next.size === 0) {
      deadStarts.push(stateKey);
    }
  }
  for (const dead of deadStarts) {
    delete layers[0][dead];
  }

  if (Object.keys(layers[0]).length === 0) return null;
  return layers;
}
