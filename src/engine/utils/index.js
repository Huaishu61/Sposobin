/**
 * 工具函数统一导出模块
 *
 * 本模块集中导出引擎层使用的所有通用工具函数:
 *   - vToTuple / tupleToV: 声部对象的序列化与反序列化
 *   - getChordSiblings: 获取和弦的兄弟姐妹（同功能不同转位）
 *   - formatChordName: 和弦名称格式化（显示用）
 *   - categorizeChords: 和弦功能分组分类
 *
 * 通过统一入口导入可简化模块依赖管理。
 */

export { vToTuple, tupleToV, getChordSiblings } from './voicing.js';
export { formatChordName, categorizeChords } from './formatter.js';
