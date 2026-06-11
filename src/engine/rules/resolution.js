/**
 * 和弦特定解决规则模块
 *
 * 本模块处理各类特性和弦的解决约束，包括:
 *   - 七和弦的七音解决（必须下行级进）
 *   - 属和弦的导音解决（必须上行到主音）
 *   - 增六和弦的扩张解决（降六级上行，升四级下行，都到属音）
 *   - 那不勒斯六和弦的特性解决（降二级下行）
 *   - 终止四六和弦的预备与解决
 *   - 属九和弦的九音位置与九音保持
 *   - 假关系（False Relation）检测
 *   - 附加六音和弦的六音位置检查
 */

import { INVALID_COST } from '../../constants/limits.js';

/**
 * 检查目标和弦的基本结构约束
 * @param {Object} newVoices - 目标和弦声部配置 {S, A, T, B}
 * @param {string} targetChord - 目标和弦名
 * @param {Object} keyInfo - 当前调性信息
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 当前处理:
 *   - D9/D9b: 九音必须在S声部，且与低音相距超过纯八度
 */
export function checkChordConstraints(newVoices, targetChord, keyInfo) {
  // D9 / D9b: 九音必须在女高音声部
  if (['D9', 'D9b'].includes(targetChord)) {
    const rootPc = keyInfo.root_pc;
    // 大调九音=大九度(root+2)，小调降九音=小九度(root+1)
    const ninthPc = targetChord === 'D9' ? (rootPc + 2) % 12 : (rootPc + 1) % 12;
    if (newVoices.S % 12 !== ninthPc) return INVALID_COST;
    if (newVoices.S - newVoices.B < 14) return INVALID_COST;  // 至少大九度间距
  }

  return 0;
}

/**
 * 检查属九和弦的九音保持
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {string} lastChord - 前一和弦名
 * @param {string} targetChord - 目标和弦名
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 连续的属九和弦之间，九音必须保持不动（作为共同音）。
 */
export function checkNinthResolution(oldVoices, newVoices, lastChord, targetChord) {
  if (['D9', 'D9b'].includes(lastChord) && ['D9', 'D9b'].includes(targetChord)) {
    if (Math.abs(newVoices.S - oldVoices.S) !== 0) return INVALID_COST;
  }
  return 0;
}

/**
 * 检查增六和弦的扩张解决
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {string} lastChord - 前一和弦名（应为It+6/Ger+6/Fr+6）
 * @param {Object} newSpells - 前后和弦的拼写信息 {last: {}, current: {}}
 * @param {Object} keyInfo - 当前调性信息
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 增六和弦的核心特征音:
 *   - 降六级(b6_step): 必须上行半音解决到属音
 *   - 升四级(#4_step): 必须下行半音解决到属音
 * 两者形成"向心"运动，同时进入属音，产生强烈的解决倾向。
 */
export function checkAugmentedSixthResolution(oldVoices, newVoices, lastChord, newSpells, keyInfo) {
  if (!lastChord.startsWith('It+6') && !lastChord.startsWith('Ger+6') && !lastChord.startsWith('Fr+6')) {
    return 0;
  }

  const b6Step = (keyInfo.root_step + 5) % 7;  // 降六级（在小调中自然存在）
  const sharp4Step = (keyInfo.root_step + 3) % 7;  // 升四级（特征音）
  const domStep = (keyInfo.root_step + 4) % 7;  // 属音（解决目标）

  for (const v of ['S', 'A', 'T', 'B']) {
    const oldStep = newSpells.last[v][1];  // 前一和弦中的音级

    // 降六级必须上行半音到属音
    if (oldStep === b6Step) {
      const newStep = newSpells.current[v][1];
      if (newStep !== domStep || (newVoices[v] - oldVoices[v] !== -1)) return INVALID_COST;
    }
    // 升四级必须下行半音到属音
    if (oldStep === sharp4Step) {
      const newStep = newSpells.current[v][1];
      if (newStep !== domStep || (newVoices[v] - oldVoices[v] !== 1)) return INVALID_COST;
    }
  }
  return 0;
}

/**
 * 检查那不勒斯六和弦(N6)的解决
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {string} lastChord - 前一和弦名（应为N6）
 * @param {string} targetChord - 目标和弦名（应为属功能组）
 * @param {Object} newSpells - 拼写信息
 * @param {Object} keyInfo - 当前调性信息
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 那不勒斯六和弦的核心特征:
 *   - 降二级音(flat2_step)必须下行级进解决到导音或主音
 *   - 不允许上行解决（避免增音程）
 */
export function checkN6Resolution(oldVoices, newVoices, lastChord, targetChord, newSpells, keyInfo) {
  if (lastChord !== 'N6' || !['D', 'D7', 'D7不完全', 'D6', 'K64'].includes(targetChord)) {
    return 0;
  }

  const flat2Step = (keyInfo.root_step + 1) % 7;  // 降二级（那不勒斯和弦特征音）
  const leadStep = (keyInfo.root_step + 6) % 7;    // 导音
  const tonicStep = keyInfo.root_step;              // 主音

  for (const v of ['S', 'A', 'T', 'B']) {
    const oldStep = newSpells.last[v][1];
    if (oldStep === flat2Step) {
      const newStep = newSpells.current[v][1];
      // 降二级只能下行解决到导音或主音
      if (![leadStep, tonicStep].includes(newStep)) return INVALID_COST;
      // 必须下行（不能上行）
      if (newVoices[v] >= oldVoices[v]) return INVALID_COST;
    }
  }
  return 0;
}

/**
 * 检查七和弦的七音解决
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {string} lastChord - 前一和弦名（应为七和弦）
 * @param {string} targetChord - 目标和弦名（应为主功能组）
 * @param {Object} newSpells - 拼写信息
 * @param {Object} keyInfo - 当前调性信息
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 七音（调式的IV级音）必须下行级进解决到III级音。
 * 这是古典和声中最严格的解决规则之一。
 */
export function checkSeventhResolution(oldVoices, newVoices, lastChord, targetChord, newSpells, keyInfo) {
  const seventhChords = ['D7', 'D56', 'D34', 'D2', 'Dvii7', 'Dvii56', 'Dvii34', 'Dvii2', 'D7不完全', 'D76'];
  const targetTonics = ['T', 'T不完全', 'T6', 't', 't不完全', 't6', 'VI', 'VI6', 'VI_阻碍'];

  if (!seventhChords.includes(lastChord) || !targetTonics.includes(targetChord)) return 0;

  for (const v of ['S', 'A', 'T', 'B']) {
    const oldStep = newSpells.last[v][1];
    // 七音 = 调式IV级音
    if (oldStep === (keyInfo.root_step + 3) % 7) {
      const newStep = newSpells.current[v][1];
      // 必须下行级进到III级音
      if (newStep !== (keyInfo.root_step + 2) % 7) return INVALID_COST;
    }
  }
  return 0;
}

/**
 * 检查导音的解决
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {string} lastChord - 前一和弦名（应为属功能组）
 * @param {string} targetChord - 目标和弦名（应为主功能组）
 * @param {Object} newSpells - 拼写信息
 * @param {Object} keyInfo - 当前调性信息
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 导音（调式VII级音）在属和弦中具有强烈的上行倾向，
 * 必须上行级进解决到主音（I级）。
 * 例外: 当D6→VI时，S声部的导音可以下行到VI级音。
 */
export function checkLeadingToneResolution(oldVoices, newVoices, lastChord, targetChord, newSpells, keyInfo) {
  const dominantChords = ['D', 'D6', 'D7', 'D56', 'D34', 'D2', 'Dvii6', 'Dvii7', 'D7不完全', 'D76'];
  const targetTonics = ['T', 'T不完全', 'T6', 't', 't不完全', 't6', 'VI', 'VI6', 'VI_阻碍'];

  if (!dominantChords.includes(lastChord) || !targetTonics.includes(targetChord)) return 0;

  // 只检查S(女高音)和B(男低音)声部的导音解决
  for (const v of ['S', 'B']) {
    const oldStep = newSpells.last[v][1];
    if (oldStep === (keyInfo.root_step + 6) % 7) {  // 导音 = VII级
      const newStep = newSpells.current[v][1];
      // 例外: D6→VI时，S声部导音可下行到V级（VI和弦的三音）
      if (lastChord === 'D6' && targetChord === 'VI' && v === 'S' && newStep === (keyInfo.root_step + 5) % 7) {
        continue;
      }
      // 正常情况下必须上行到主音
      if (newStep !== keyInfo.root_step) return INVALID_COST;
    }
  }
  return 0;
}

/**
 * 检查终止四六和弦(K64)的解决
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {string} lastChord - 前一和弦名（应为K64）
 * @param {string} targetChord - 目标和弦名（应为属功能组）
 * @param {Object} newSpells - 拼写信息
 * @param {Object} keyInfo - 当前调性信息
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * K64作为属功能的装饰性和弦，其上方三声部:
 *   - 主音(I级)必须下行级进到导音(VII级)
 *   - 三音(III级)可以下行到II级或上行到IV级
 */
export function checkCadential64Resolution(oldVoices, newVoices, lastChord, targetChord, newSpells, keyInfo) {
  if (lastChord !== 'K64' || !['D', 'D6', 'D7', 'D56', 'D34', 'D2', 'D9', 'D9b'].includes(targetChord)) {
    return 0;
  }

  for (const v of ['S', 'A', 'T']) {
    const oldStep = newSpells.last[v][1];
    // 主音(I级)必须下行到导音
    if (oldStep === keyInfo.root_step) {
      const newStep = newSpells.current[v][1];
      if (newStep !== (keyInfo.root_step + 6) % 7) return INVALID_COST;
    }
    // 三音(III级)可下行到II级或上行到IV级
    if (oldStep === (keyInfo.root_step + 2) % 7) {
      const newStep = newSpells.current[v][1];
      if (![(keyInfo.root_step + 1) % 7, (keyInfo.root_step + 3) % 7].includes(newStep)) return INVALID_COST;
    }
  }
  return 0;
}

/**
 * 检查主和弦到重属降五和弦(T→DDb5)的特定限制
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {string} lastChord - 前一和弦名（应为主和弦）
 * @param {string} targetChord - 目标和弦名（应为DD...b5）
 * @param {Object} keyInfo - 当前调性信息
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 避免主和弦的三音（大调=大十度，小调=小十度）
 * 直接跳进到重属和弦的三音（小十度/大十度），
 * 这种进行会产生不自然的增/减音程效果。
 */
export function checkTtoDDFlat5(oldVoices, newVoices, lastChord, targetChord, keyInfo) {
  if (!lastChord.startsWith('T') || !targetChord.startsWith('DD') || !targetChord.includes('b5')) {
    return 0;
  }

  const rootPc = keyInfo.root_pc;
  const tThird = (rootPc + (keyInfo.type === 'MINOR' ? 3 : 4)) % 12;  // 主和弦三音
  const ddThird = (rootPc + 6) % 12;  // 重属和弦三音

  for (const v of ['S', 'A', 'T', 'B']) {
    if (oldVoices[v] % 12 === tThird && newVoices[v] % 12 === ddThird) {
      return INVALID_COST;
    }
  }
  return 0;
}

/**
 * 检查假关系（False Relation / Cross Relation）
 * @param {Object} newSpells - 前后和弦的拼写信息 {last: {}, current: {}}
 * @returns {number} 罚分值
 *
 * 假关系定义:
 *   同一音级在不同声部中前后出现不同的变音形式。
 *   例如: 前和弦中某声部的A自然音，到后和弦中另一声部变为A#，
 *   且前一和弦中该声部并未出现过A#。
 *
 * 古典和声中应避免声部之间的这种"交叉变音"，
 * 因为它会造成调性模糊和声部线条不清晰。
 */
export function checkFalseRelations(newSpells) {
  let penalty = 0;

  // 检查每个音级（0-6，即C-B）
  for (let step = 0; step < 7; step++) {
    const oldAlts = {};   // 前一和弦中该音级在各声部的变音形式
    const newAlts = {};   // 后一和弦中该音级在各声部的变音形式

    // 收集前一和弦中该音级的变音信息
    for (const v of ['S', 'A', 'T', 'B']) {
      if (newSpells.last[v][1] === step) oldAlts[v] = newSpells.last[v][2];
      if (newSpells.current[v][1] === step) newAlts[v] = newSpells.current[v][2];
    }

    // 检查是否存在假关系
    for (const [v1, alt1] of Object.entries(oldAlts)) {
      for (const [v2, alt2] of Object.entries(newAlts)) {
        // 不同声部，同一音级，不同变音形式
        if (alt1 !== alt2 && v1 !== v2) {
          // 如果后一和弦的该声部在前一和弦中没有以相同变音形式出现过，
          // 则构成假关系
          if (!(v2 in oldAlts) || oldAlts[v2] !== alt1) {
            penalty += INVALID_COST;  // 假关系是严重违规
          }
        }
      }
    }
  }

  return penalty;
}

/**
 * 检查D76和DD76和弦的附加六音解决规则
 * @param {Object} oldVoices - 前一和弦声部配置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {string} lastChord - 前一和弦名（应为D76或DD76）
 * @param {string} targetChord - 目标和弦名
 * @param {Object} newSpells - 拼写信息
 * @param {Object} keyInfo - 当前调性信息
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * D76: 属七和弦附加六度音（六度音通常在高音声部）
 * 解决时:
 *   - S声部(六度音)必须下行3-4半音到主音
 *   - 到VI时S声部必须保持不动
 *   - 到D7时只有S声部移动，其他声部保持
 */
export function checkD7_6Rules(oldVoices, newVoices, lastChord, targetChord, newSpells, keyInfo) {
  if (!['D76', 'DD76'].includes(lastChord)) return 0;

  const isDD = lastChord === 'DD76';
  // DD76解决到D功能组，D76解决到T功能组
  const targetTonics = isDD
    ? ['D', 'D7', 'D7不完全', 'D6', 'K64']
    : ['T', 'T不完全', 'T6', 't', 't不完全', 't6'];

  if (targetTonics.includes(targetChord)) {
    const oldSStep = newSpells.last.S[1];    // 前一和弦S声部的音级
    const newSStep = newSpells.current.S[1]; // 目标和弦S声部的音级
    // 解决目标: DD76→D的根音 或 D76→T的根音
    const targetRootStep = (keyInfo.root_step + (isDD ? 4 : 0)) % 7;
    // S声部必须下行3-4半音到目标根音
    if (newSStep !== targetRootStep || (![3, 4].includes(oldVoices.S - newVoices.S))) {
      return INVALID_COST;
    }
  }

  // D76→VI时，S声部必须保持（作为共同音）
  if (!isDD && ['VI', 'VI6', 'VI_阻碍'].includes(targetChord)) {
    if (oldVoices.S !== newVoices.S) return INVALID_COST;
  }

  // 同家族和弦转换时(D76→D7 或 DD76→DD7)
  const sameFamilyTargets = !isDD ? ['D7', 'D7不完全'] : ['DD7', 'DD7不完全'];
  if (sameFamilyTargets.includes(targetChord)) {
    // B/T/A声部必须保持不动，只有S声部下行1-2半音
    if (oldVoices.B !== newVoices.B || oldVoices.T !== newVoices.T || oldVoices.A !== newVoices.A) {
      return INVALID_COST;
    }
    const sDiff = oldVoices.S - newVoices.S;
    if (![1, 2].includes(sDiff) || sDiff > 2) return INVALID_COST;
  }

  return 0;
}

/**
 * 检查附加六音和弦的六音位置
 * @param {Object} newVoices - 目标和弦声部配置
 * @param {string} targetChord - 目标和弦名（D6/D76/DD76）
 * @param {Object} newSpells - 拼写信息
 * @param {Object} keyInfo - 当前调性信息
 * @returns {number} 0表示合法，INVALID_COST表示非法
 *
 * 附加六度音必须在S(女高音)声部，这是古典和声的惯例，
 * 因为六度音作为旋律性附加音通常放在最高声部。
 */
export function checkD6Constraint(newVoices, targetChord, newSpells, keyInfo) {
  if (!['D6', 'D76', 'DD76'].includes(targetChord)) return 0;

  // 六度音的音级: DD76=下中音(VI级)，D7⁽⁶⁾=上主音(II级)
  const addedSixthStep = targetChord.includes('DD')
    ? (keyInfo.root_step + 6) % 7
    : (keyInfo.root_step + 2) % 7;

  if (newSpells.current.S[1] !== addedSixthStep) return INVALID_COST;
  return 0;
}
