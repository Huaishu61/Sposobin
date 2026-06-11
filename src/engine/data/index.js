/**
 * 数据层统一导出模块
 *
 * 本模块作为数据层的统一入口，集中导出所有与和声数据相关的常量:
 *   - MAJOR_DNA / MINOR_DNA: 大小调的和弦功能网络数据库
 *   - PITCH_Y: 音符到SVG Y坐标的映射表（用于乐谱渲染）
 *   - AVAILABLE_NOTES: 可用的MIDI音符范围集合
 *
 * 通过统一入口导入可简化外部依赖，并便于未来数据层重构。
 */

export { MAJOR_DNA, MINOR_DNA, PITCH_Y, AVAILABLE_NOTES } from './network.js';
