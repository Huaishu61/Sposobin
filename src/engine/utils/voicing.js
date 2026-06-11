/**
 * 声部工具函数模块
 *
 * 提供声部数据的序列化/反序列化，以及和弦兄弟姐妹查找功能。
 * 这些工具函数是引擎核心算法（DAG构建、Viterbi搜索）的基础依赖。
 */

/**
 * 将声部对象转换为元组数组
 * @param {Object} v - 声部对象 {S, A, T, B}
 * @returns {number[]} 元组数组 [S, A, T, B]
 *
 * 序列化用于DAG节点键生成和状态存储。
 */
export function vToTuple(v) {
  return [v.S, v.A, v.T, v.B];
}

/**
 * 将元组数组还原为声部对象
 * @param {number[]} t - 元组数组 [S, A, T, B]
 * @returns {Object} 声部对象 {S, A, T, B}
 *
 * 反序列化用于从DAG节点或DP状态恢复声部配置。
 */
export function tupleToV(t) {
  return { S: t[0], A: t[1], T: t[2], B: t[3] };
}

/**
 * 获取和弦的"兄弟姐妹"（同一功能的不同转位/变形）
 * @param {string} chord_name - 和弦标识符
 * @param {Object} dna_db - DNA数据库
 * @returns {string[]} 兄弟姐妹和弦名称数组
 *
 * 兄弟姐妹定义:
 *   同一核心功能的不同形式，如:
 *   - D7, D56, D34, D2 都是D功能的兄弟姐妹（属七及其转位）
 *   - S, S6, Sᵢᵢ 都是S功能的兄弟姐妹（下属功能组）
 *
 * 排除:
 *   - 六四和弦（64）: 功能特殊，不视为兄弟姐妹
 *   - 增六和弦（+6）: 特性和弦，独立处理
 *   - N6（那不勒斯六和弦）: 特性和弦，独立处理
 */
export function getChordSiblings(chord_name, dna_db) {
  if (chord_name.includes('64') || chord_name.includes('+6') || chord_name === 'N6') {
    return [];
  }

  /**
   * 提取和弦的核心功能名
   * 去除所有转位标记和附加音标记，保留基础功能名
   */
  function get_core(c) {
    const parts = c.split('/');
    let core = parts[0];
    const target = parts.length > 1 ? '/' + parts[1] : '';
    // 按长度降序排列，确保先匹配长后缀
    const suffixes = ['64', '56', '34', '不完全', '双三', '6', '7', '9', '2', '⁶'];
    for (const suffix of suffixes) {
      core = core.replace(suffix, '');
    }
    return core + target;
  }

  const my_core = get_core(chord_name);
  // 判断是否为七和弦家族（包含七音的和弦）
  const is_seventh_family = ['7', '56', '34', '2', '9'].some(x => chord_name.includes(x));
  const siblings = new Set();

  for (const k of Object.keys(dna_db)) {
    if (k.includes('64') || k.includes('+6') || k === 'N6') continue;
    if (get_core(k) === my_core) {
      // 七和弦家族只与其他七和弦形式互为兄弟姐妹
      if (is_seventh_family && !['7', '56', '34', '2', '9'].some(x => k.includes(x))) {
        continue;
      }
      siblings.add(k);
    }
  }
  return [...siblings];
}
