/**
 * 全局常量与阈值定义模块
 *
 * 本文件集中定义了和声推演引擎中使用的所有硬编码数值常量，
 * 包括罚分阈值、音域限制、声部间距限制、低音跳进限制等。
 * 集中管理这些数值便于统一调整与维护，避免魔术数字散布在代码各处。
 */

/** 非法配置的标记罚分值，任何大于等于此值的评分表示该声部进行被硬性阻断 */
export const INVALID_COST = 999999;

/**
 * 四声部各自的MIDI音域限制
 * S(女高音): C4-A5, A(女低音): F#3-F5, T(男高音): A2-C#5, B(男低音): C2-E4
 * 单位: MIDI音符编号
 */
export const VOICE_RANGES = {
  S: { min: 57, max: 84 },   // 女高音音域: C4 (60) 到 A5 (84)
  A: { min: 53, max: 74 },   // 女低音音域: F3 (53) 到 D5 (74)
  T: { min: 45, max: 69 },   // 男高音音域: A2 (45) 到 C#5 (69)
  B: { min: 36, max: 64 }    // 男低音音域: C2 (36) 到 E4 (64)
};

/**
 * 相邻声部之间的最大间距限制
 * S-A 和 A-T 之间不得超过纯八度（12个半音），避免声部交叉与过度分离
 */
export const SPACING_LIMITS = {
  maxOctaveBetweenSA: 12,    // 女高与女低之间最大间距: 纯八度
  maxOctaveBetweenAT: 12     // 女低与男高之间最大间距: 纯八度
};

/**
 * 低音声部跳进限制参数
 * 低音作为和声基础，其跳进幅度受到严格限制以确保声部进行的平滑性
 */
export const BASS_LEAP_LIMITS = {
  absoluteMax: 12,           // 低音绝对最大跳进: 纯八度
  forbidden: [10, 11],       // 禁止跳进的音程: 小七度、大七度（声部进行困难）
  diminishedFifthDown: -6,   // 减五度下行特殊标记值
  majorPenalty: [8, 9],      // 大跳音程（小六度、大六度）的惩罚区间
  minorPenaltyPerSemitone: 0.5,  // 普通跳进每半音的基础罚分
  diminishedPenalty: 80,     // 减五度下行的罚分值（虽允许但需惩罚）
  majorLeapPenalty: 50       // 大六度/小六度跳进的罚分值
};

/**
 * 平行进行相关的罚分配置
 * 平行五度与平行八度是古典和声中严格禁止的声部进行
 */
export const PARALLEL_PENALTIES = {
  octaveUnison: 10000,       // 平行八度/同度进行的罚分（致命级）
  fifth: 10000,              // 平行五度的罚分（致命级）
  hiddenFifth: 2000,         // 隐伏五度（同向进入五度）的罚分
  maxAllowed: 5000           // 平行进行罚分允许的最大阈值，超过则视为非法
};

/**
 * 同度音重叠罚分
 * 相邻声部之间出现同音（unison）在古典和声中应尽量避免，但在某些和弦中可容忍
 */
export const UNISON_PENALTIES = { SA: 20, AT: 15, TB: 20 };

/** 罕见七和弦（如T7、s7等）的使用罚分，鼓励使用常规和弦 */
export const RARE_SEVENTH_PENALTY = 2000;

/** 风格性乘数: 在副属、增六、重属等复杂和弦中使用同度的额外惩罚倍数 */
