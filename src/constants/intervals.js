/**
 * 音程常量定义模块
 *
 * 本模块定义了和声规则校验中使用的基本音程常量（以半音数表示），
 * 以及完美音程和协和音程的集合，用于平行进行、跳进限制等规则的判定。
 */

/**
 * 基本音程枚举（以半音数为单位的音程距离）
 * 涵盖从同度到纯八度的所有常见音程
 */
export const INTERVALS = {
  UNISON: 0,         // 同度/纯一度: 0个半音
  MINOR_SECOND: 1,   // 小二度: 1个半音
  MAJOR_SECOND: 2,   // 大二度: 2个半音
  MINOR_THIRD: 3,    // 小三度: 3个半音
  MAJOR_THIRD: 4,    // 大三度: 4个半音
  PERFECT_FOURTH: 5, // 纯四度: 5个半音
  TRITONE: 6,        // 增四度/减五度（三全音）: 6个半音
  PERFECT_FIFTH: 7,  // 纯五度: 7个半音
  MINOR_SIXTH: 8,    // 小六度: 8个半音
  MAJOR_SIXTH: 9,    // 大六度: 9个半音
  MINOR_SEVENTH: 10, // 小七度: 10个半音
  MAJOR_SEVENTH: 11, // 大七度: 11个半音
  OCTAVE: 12         // 纯八度: 12个半音
};

/**
 * 完美音程集合
 * 包括纯一度(0)、纯五度(7)、纯八度(12)
 * 这些音程具有高度协和性，但平行进行被严格禁止
 */
export const PERFECT_INTERVALS = [INTERVALS.UNISON, INTERVALS.PERFECT_FIFTH, INTERVALS.OCTAVE];

/**
 * 协和音程集合
 * 包括纯一度、大小三度、纯五度、大小六度、纯八度
 * 这些音程在和声学中被视为协和的，允许自由使用
 */
export const CONSONANT_INTERVALS = [
  INTERVALS.UNISON,      // 纯一度
  INTERVALS.MINOR_THIRD, // 小三度
  INTERVALS.MAJOR_THIRD, // 大三度
  INTERVALS.PERFECT_FIFTH, // 纯五度
  INTERVALS.MINOR_SIXTH,   // 小六度
  INTERVALS.MAJOR_SIXTH,   // 大六度
  INTERVALS.OCTAVE         // 纯八度
];
