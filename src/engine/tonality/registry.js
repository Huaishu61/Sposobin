/**
 * 调性注册表与转调/拼写处理模块
 *
 * 本模块提供完整的调性系统支持，包括:
 *   - KEY_REGISTRY: 26种大小调的注册表（13大调+13小调，含等音调）
 *   - KEY_SIG_POSITIONS: 调号在高/低音谱表上的SVG位置坐标
 *   - transpose_dna: DNA数据库转调函数（根据调性偏移量平移所有音高类）
 *   - spell_midi: MIDI音符的同音异名拼写算法（处理变音记号与等音转换）
 *
 * 调性信息结构:
 *   - type: "MAJOR" 或 "MINOR"
 *   - shift: 相对于C大调/a小调的半音偏移量
 *   - sig_type: 调号类型 "sharp"/"flat"/"none"
 *   - sigs: 调号数量（0-7）
 *   - root_pc: 主音的音高类（0-11）
 *   - root_step: 主音的调式音级索引（0-6）
 */

/** 26大小调完整注册表（含等音调，如升F大调与降G大调并存） */
export const KEY_REGISTRY = {
  // === 大调（按半音顺序） ===
  "C 大调":     {type: "MAJOR", shift: 0, sig_type: "none", sigs: 0, root_pc: 0, root_step: 0},
  "降D 大调":   {type: "MAJOR", shift: 1, sig_type: "flat", sigs: 5, root_pc: 1, root_step: 1},
  "D 大调":     {type: "MAJOR", shift: 2, sig_type: "sharp", sigs: 2, root_pc: 2, root_step: 1},
  "降E 大调":   {type: "MAJOR", shift: 3, sig_type: "flat", sigs: 3, root_pc: 3, root_step: 2},
  "E 大调":     {type: "MAJOR", shift: 4, sig_type: "sharp", sigs: 4, root_pc: 4, root_step: 2},
  "F 大调":     {type: "MAJOR", shift: 5, sig_type: "flat", sigs: 1, root_pc: 5, root_step: 3},
  "升F 大调":   {type: "MAJOR", shift: 6, sig_type: "sharp", sigs: 6, root_pc: 6, root_step: 3},
  "降G 大调":   {type: "MAJOR", shift: 6, sig_type: "flat", sigs: 6, root_pc: 6, root_step: 4},
  "G 大调":     {type: "MAJOR", shift: -5, sig_type: "sharp", sigs: 1, root_pc: 7, root_step: 4},
  "降A 大调":   {type: "MAJOR", shift: -4, sig_type: "flat", sigs: 4, root_pc: 8, root_step: 5},
  "A 大调":     {type: "MAJOR", shift: -3, sig_type: "sharp", sigs: 3, root_pc: 9, root_step: 5},
  "降B 大调":   {type: "MAJOR", shift: -2, sig_type: "flat", sigs: 2, root_pc: 10, root_step: 6},
  "B 大调":     {type: "MAJOR", shift: -1, sig_type: "sharp", sigs: 5, root_pc: 11, root_step: 6},

  // === 小调（按半音顺序） ===
  "a 小调":     {type: "MINOR", shift: -3, sig_type: "none", sigs: 0, root_pc: 9, root_step: 5},
  "降b 小调":   {type: "MINOR", shift: -2, sig_type: "flat", sigs: 5, root_pc: 10, root_step: 6},
  "b 小调":     {type: "MINOR", shift: -1, sig_type: "sharp", sigs: 2, root_pc: 11, root_step: 6},
  "c 小调":     {type: "MINOR", shift: 0, sig_type: "flat", sigs: 3, root_pc: 0, root_step: 0},
  "升c 小调":   {type: "MINOR", shift: 1, sig_type: "sharp", sigs: 4, root_pc: 1, root_step: 0},
  "d 小调":     {type: "MINOR", shift: 2, sig_type: "flat", sigs: 1, root_pc: 2, root_step: 1},
  "升d 小调":   {type: "MINOR", shift: 3, sig_type: "sharp", sigs: 6, root_pc: 3, root_step: 1},
  "e 小调":     {type: "MINOR", shift: 4, sig_type: "sharp", sigs: 1, root_pc: 4, root_step: 2},
  "f 小调":     {type: "MINOR", shift: 5, sig_type: "flat", sigs: 4, root_pc: 5, root_step: 3},
  "升f 小调":   {type: "MINOR", shift: 6, sig_type: "sharp", sigs: 3, root_pc: 6, root_step: 3},
  "g 小调":     {type: "MINOR", shift: -5, sig_type: "flat", sigs: 2, root_pc: 7, root_step: 4},
  "升g 小调":   {type: "MINOR", shift: -4, sig_type: "sharp", sigs: 5, root_pc: 8, root_step: 4},
};

/**
 * 调号在高/低音谱表上的SVG Y坐标
 *
 * 升号/降号按五度圈顺序排列，索引0-6分别对应1-7个调号。
 * 数组值为SVG中的Y坐标（像素），用于ScoreRenderer中的调号渲染。
 */
export const KEY_SIG_POSITIONS = {
  sharp: {treble: [40, 55, 35, 50, 65, 45, 60], bass: [180, 195, 175, 190, 205, 185, 200]},
  flat:  {treble: [60, 45, 65, 50, 70, 55, 75], bass: [200, 185, 205, 190, 210, 195, 215]}
};

/**
 * 转调DNA数据库
 * @param {Object} base_dna - 基础DNA数据库（基于C大调/a小调）
 * @param {number} shift - 目标调性的半音偏移量
 * @returns {Object} 转调后的DNA数据库
 *
 * 转调逻辑:
 *   - bass_options: 每个低音选项平移shift半音
 *   - required: 每个音高类平移shift半音（模12）
 *   - max_counts: 键值同步平移
 *   - next关系保持不变（和弦功能连接不受转调影响）
 */
export function transpose_dna(base_dna, shift) {
  const transposed_db = {};
  for (const [chord, rules] of Object.entries(base_dna)) {
    transposed_db[chord] = {
      next: rules.next,
      bass_options: rules.bass_options.map(b => b + shift),
      required: new Set([...rules.required].map(pc => ((pc + shift) % 12 + 12) % 12)),
      max_counts: Object.fromEntries(
        Object.entries(rules.max_counts).map(([pc, count]) => [((parseInt(pc) + shift) % 12 + 12) % 12, count])
      )
    };
  }
  return transposed_db;
}

/**
 * 自然大调音阶各音级的音高类（以C为0）
 * 索引0-6分别对应调式音级I-VII
 */
const NATURAL_PCS = {0: 0, 1: 2, 2: 4, 3: 5, 4: 7, 5: 9, 6: 11};

/**
 * 相对音高类到调式音级的映射表
 * 键: 相对于主音的音高类(0-11)
 * 值: [调式音级索引(0-6), 基础变音记号(升/降)]
 *
 * 例如: rel_pc=1 → [1, -1] 表示该音是调式的II级降半音
 */
const REL_MAP = {
  0: [0, 0], 1: [1, -1], 2: [1, 0], 3: [2, -1],
  4: [2, 0], 5: [3, 0], 6: [3, 1], 7: [4, 0],
  8: [5, -1], 9: [5, 0], 10: [6, -1], 11: [6, 0]
};

/** 音名字母表（固定音名顺序） */
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/**
 * MIDI音符的同音异名拼写算法
 * @param {number} midi_note - MIDI音符编号
 * @param {Object} key_info - 当前调性信息
 * @param {string} chord_name - 和弦名称（用于离调和弦的特殊拼写处理）
 * @returns {Array} [音名字母, 调式音级索引, 变音记号, 八度号]
 *
 * 算法说明:
 *   1. 计算该音相对于主音的音高类(rel_pc)
 *   2. 通过REL_MAP映射到调式音级(rel_step)和基础变音(rel_alt)
 *   3. 结合调性主音位置计算绝对调式音级(abs_step)
 *   4. 通过自然音阶计算实际变音记号(abs_alt)
 *   5. 特殊处理: 离调和弦（如D/VI）可能需要特殊的等音拼写
 *
 * 示例:
 *   spell_midi(61, C大调) => ["D#", 1, 1, 4]  或 ["Eb", 2, -1, 4]
 *   根据调性选择最合适的拼写形式
 */
export function spell_midi(midi_note, key_info, chord_name = "") {
  const root_pc = key_info.root_pc;
  const root_step = key_info.root_step;
  const pc = midi_note % 12;
  const rel_pc = ((pc - root_pc) % 12 + 12) % 12;
  let [rel_step, rel_alt] = REL_MAP[rel_pc];

  if (chord_name.includes("/") && !chord_name.includes("b")) {
    const target = chord_name.split("/")[1];
    if (key_info.type === "MAJOR") {
      if (target === "II" && rel_pc === 1) [rel_step, rel_alt] = [0, 1];
      else if (target === "III" && rel_pc === 3) [rel_step, rel_alt] = [1, 1];
      else if (target === "VI" && rel_pc === 8) [rel_step, rel_alt] = [4, 1];
    } else if (key_info.type === "MINOR") {
      if (target === "III" && rel_pc === 11) [rel_step, rel_alt] = [0, -1];
      else if (target === "VI" && rel_pc === 4) [rel_step, rel_alt] = [3, -1];
      else if (target === "VII" && rel_pc === 6) [rel_step, rel_alt] = [4, -1];
    }
  }

  const abs_step = (root_step + rel_step) % 7;
  const natural_pc = NATURAL_PCS[abs_step];
  const abs_alt = ((pc - natural_pc + 6) % 12) - 6;
  const octave = Math.floor((midi_note - natural_pc - abs_alt) / 12) - 1;

  return [LETTERS[abs_step], abs_step, abs_alt, octave];
}
