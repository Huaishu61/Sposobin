/**
 * 调性系统统一导出模块
 *
 * 本模块作为调性处理层的统一入口，导出:
 *   - KEY_REGISTRY: 26种大小调的注册表（含根音、偏移量、调号等）
 *   - KEY_SIG_POSITIONS: 调号在高低音谱表上的SVG位置
 *   - transpose_dna: DNA数据库转调函数
 *   - spell_midi: MIDI音符的同音异名拼写算法
 *
 * 所有调性相关的计算（转调、音名拼写、调号定位）都通过此模块访问。
 */

export { KEY_REGISTRY, KEY_SIG_POSITIONS, transpose_dna, spell_midi } from './registry.js';
