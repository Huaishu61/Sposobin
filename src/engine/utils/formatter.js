/**
 * 和弦名称格式化与分类模块
 *
 * 本模块处理和弦名称的显示格式化以及功能分组:
 *   - formatChordName: 将内部和弦标识转换为乐谱显示格式
 *   - categorizeChords: 将和弦按功能组分类
 *
 * 分类体系基于斯波索宾和声学的功能组理论:
 *   自然音阶: 主功能、下属功能、属功能、导功能
 *   离调体系: 副属和弦、副下属和弦、重属与变和弦
 */

/**
 * 格式化和弦名称为显示字符串
 * @param {string} name - 内部和弦标识符
 * @returns {string|Object} 格式化后的显示名称，若含汉字后缀则返回 {base, sup}
 *
 * 当前使用 LCBSposobin 字体自动处理角标显示，
 * 不需要额外的 Unicode 下标转换。
 */
export function formatChordName(name) {
  if (name === 'Dadd6') {
    return { base: 'D', sup: '\u2076' };
  }
  // 匹配尾部汉字后缀（如 "不完全"、"双三"、"阻碍"）
  const match = name.match(/^(.+?)([\u4e00-\u9fa5_][\u4e00-\u9fa5_]*)$/);
  if (match) {
    return { base: match[1], sup: match[2].replace(/_/g, '') };
  }
  return name;
}

/**
 * 将和弦列表按功能组分类
 * @param {string[]} chords - 和弦名称数组
 * @returns {Object} {diatonic: {}, tonicization: {}}
 *   - diatonic: 自然音阶功能组
 *   - tonicization: 离调体系
 *
 * 分类逻辑:
 *   1. 离调和弦（包含 "/"）：
 *      - D/Dvii开头 → 副属和弦
 *      - S/s/Sii/sii开头 → 副下属和弦
 *   2. 重属与变和弦（DD/N/It/Ger/Fr）→ 归入离调体系
 *   3. 其他和弦 → 自然音阶和弦
 *      - 按功能前缀分配到对应分组
 */
export function categorizeChords(chords) {
  // 自然音阶功能组定义
  const diatonic = {
    '主功能组': [],          // 主和弦及其变形
    '下属功能组': [],        // 下属和弦及平行调
    '属功能组': [],         // 属和弦及终止四六
    '导功能组': [],                // 导七和弦系列
    '特殊变音与扩展和弦': []     // 其他特殊和弦
  };

  const tonicization = {};  // 离调和弦动态分组

  for (const chord of chords) {
    // ===== 离调和弦分类 =====
    if (chord.includes('/')) {
      const target_deg = chord.split('/')[1];
      if (chord.startsWith('D') || chord.startsWith('Dvii')) {
        // 副属和弦: D/VI, Dvii7/II 等
        const cat = `${target_deg}级副属和弦`;
        if (!tonicization[cat]) tonicization[cat] = [];
        tonicization[cat].push(chord);
      } else if (chord.startsWith('S') || chord.startsWith('s') || chord.startsWith('Sii') || chord.startsWith('sii')) {
        // 副下属和弦: S/II, sii6/VI 等
        const cat = `${target_deg}级副下属和弦`;
        if (!tonicization[cat]) tonicization[cat] = [];
        tonicization[cat].push(chord);
      }
    }
    // ===== 重属与变和弦 → 归入离调体系 =====
    else if (chord.startsWith('DD') || chord.startsWith('N') || chord.startsWith('It') || chord.startsWith('Ger') || chord.startsWith('Fr')) {
      const cat = '重属与变和弦';
      if (!tonicization[cat]) tonicization[cat] = [];
      tonicization[cat].push(chord);
    }
    // ===== 自然音阶和弦分类 =====
    else {
      if (chord.startsWith('Dvii')) {
        diatonic['导功能组'].push(chord);
      } else if (chord.startsWith('T') || chord.startsWith('t') || chord.startsWith('DT')) {
        diatonic['主功能组'].push(chord);
      } else if (chord.startsWith('S') || chord.startsWith('s') || chord.startsWith('VI') || chord.startsWith('bVI')) {
        diatonic['下属功能组'].push(chord);
      } else if (chord.startsWith('D') || chord.startsWith('K') || chord.startsWith('VII') || chord.startsWith('bVII')) {
        diatonic['属功能组'].push(chord);
      } else {
        diatonic['特殊变音与扩展和弦'].push(chord);
      }
    }
  }

  // 过滤掉空分组，保持UI整洁
  const filtered_diatonic = {};
  for (const [k, v] of Object.entries(diatonic)) {
    if (v.length > 0) filtered_diatonic[k] = v;
  }

  return { diatonic: filtered_diatonic, tonicization };
}