/**
 * 和声DNA数据库与渲染数据
 *
 * 本文件是斯波索宾和声引擎的核心数据层，包含:
 *   - MAJOR_DNA: 大调体系的和弦功能网络数据库
 *   - MINOR_DNA: 小调体系的和弦功能网络数据库
 *   - PITCH_Y: 音符名称到SVG Y坐标的映射表（乐谱渲染用）
 *   - AVAILABLE_NOTES: 可用的MIDI音符范围（C2-C7）
 *
 * DNA数据结构:
 *   每个和弦条目包含:
 *     - next: 可连接的后续和弦列表（功能序进网络）
 *     - bass_options: 可能的低音MIDI音高数组（通常2个八度选项）
 *     - required: 必需的音高类集合（定义和弦音级结构）
 *     - max_counts: 各音高类的最大重复次数限制
 *
 * 注意: 本文件中的音高类数据基于C大调/a小调（偏移量0），
 * 实际使用时会通过transpose_dna函数转调至目标调性。
 */

/** 大调和弦功能网络数据库 */
export const MAJOR_DNA = {
  "T": {"next": ["S","D","D76","T6","S6","D6","VI","Sii6","D56","D34","D2","Sii7","Sii56","Dvii7","Dvii56","Dvii34","Dvii2","DTiii","Dvii6","D6","T7","S7","VI7","DTiii7","D9","DD","DD6","DD7","DD56","DDvii7","D46","S46","D7/II","Dvii7/II","D7/IV","Dvii7/IV","D7/VI","Dvii7/VI","D7/III","Dvii7/III","N6","It+6","Ger+6","Fr+6","s","s6","bVI","sii6","sii7","sii56","Dvii7b","Dvii56b","D9b"],"bass_options":[48,36],"required":[0,4,7],"max_counts":{"4":1}},
  "T不完全": {"next":["S","D","T6","S6","VI","D56","D34","D2","Sii7","Sii56","DTiii","DTiii7","s","s6","bVI"],"bass_options":[48,36],"required":[0,4],"max_counts":{"4":1}},
  "T双三": {"next":["S","D","T6","D7","D7不完全","Sii7","Sii56","sii7","sii56"],"bass_options":[48,36],"required":[0,4,7],"max_counts":{"0":1,"7":1}},
  "T6": {"next":["S","D","S6","D6","D56","D34","D2","Sii","Sii6","Sii7","Sii56","Sii34","Sii2","Dvii7","Dvii56","Dvii34","Dvii2","DTiii","Dvii6","VI7","S7","DD","DD6","DD7","DD56","D46","D7/II","Dvii7/II","D7/IV","Dvii7/IV","D7/VI","Dvii7/VI","D7/III","Dvii7/III","N6","It+6","Ger+6","Fr+6","s","s6","bVI","sii","sii6","sii7","sii56","Dvii7b","Dvii56b","D9b"],"bass_options":[40,52],"required":[0,4,7],"max_counts":{"4":1}},
  "T46": {"next":["S","S6","s","s6","D","D6","D7","D7不完全"],"bass_options":[43,55],"required":[0,4,7],"max_counts":{"0":1,"4":1}},
  "N6": {"next":["K46","D","D7","D7不完全","D6"],"bass_options":[41,53],"required":[1,5,8],"max_counts":{"1":1,"8":1}},
  "It+6": {"next":["K46","D","D7","D7不完全"],"bass_options":[44,32],"required":[8,0,6],"max_counts":{"8":1,"6":1}},
  "Ger+6": {"next":["K46","D","D7","D7不完全"],"bass_options":[44,32],"required":[8,0,3,6],"max_counts":{"8":1,"0":1,"3":1,"6":1}},
  "Fr+6": {"next":["K46","D","D7","D7不完全"],"bass_options":[44,32],"required":[8,0,2,6],"max_counts":{"8":1,"0":1,"2":1,"6":1}},
  "D7/II": {"next":["Sii","Sii6","sii6","sii"],"bass_options":[45,57],"required":[9,1,4,7],"max_counts":{"9":1,"1":1,"4":1,"7":1}},
  "D56/II": {"next":["Sii","Sii6","sii6","sii"],"bass_options":[49,37],"required":[9,1,4,7],"max_counts":{"9":1,"1":1,"4":1,"7":1}},
  "D34/II": {"next":["Sii","Sii6","sii6","sii"],"bass_options":[52,40],"required":[9,1,4,7],"max_counts":{"9":1,"1":1,"4":1,"7":1}},
  "D2/II": {"next":["Sii6","sii6"],"bass_options":[55,43],"required":[9,1,4,7],"max_counts":{"9":1,"1":1,"4":1,"7":1}},
  "Dvii7/II": {"next":["Sii","Sii6","sii6","sii"],"bass_options":[49,37],"required":[1,4,7,10],"max_counts":{"1":1,"4":1,"7":1,"10":1}},
  "Dvii56/II": {"next":["Sii","Sii6","sii6","sii"],"bass_options":[52,40],"required":[1,4,7,10],"max_counts":{"1":1,"4":1,"7":1,"10":1}},
  "Dvii34/II": {"next":["Sii","Sii6","sii6","sii"],"bass_options":[55,43],"required":[1,4,7,10],"max_counts":{"1":1,"4":1,"7":1,"10":1}},
  "Dvii2/II": {"next":["Sii6","sii6"],"bass_options":[58,46],"required":[1,4,7,10],"max_counts":{"1":1,"4":1,"7":1,"10":1}},
  "D7/III": {"next":["DTiii"],"bass_options":[47,59],"required":[11,3,6,9],"max_counts":{"11":1,"3":1,"6":1,"9":1}},
  "D56/III": {"next":["DTiii"],"bass_options":[51,39],"required":[11,3,6,9],"max_counts":{"11":1,"3":1,"6":1,"9":1}},
  "D34/III": {"next":["DTiii"],"bass_options":[54,42],"required":[11,3,6,9],"max_counts":{"11":1,"3":1,"6":1,"9":1}},
  "D2/III": {"next":["DTiii"],"bass_options":[57,45],"required":[11,3,6,9],"max_counts":{"11":1,"3":1,"6":1,"9":1}},
  "Dvii7/III": {"next":["DTiii"],"bass_options":[39,51],"required":[3,6,9,0],"max_counts":{"3":1,"6":1,"9":1,"0":1}},
  "Dvii56/III": {"next":["DTiii"],"bass_options":[54,42],"required":[3,6,9,0],"max_counts":{"3":1,"6":1,"9":1,"0":1}},
  "Dvii34/III": {"next":["DTiii"],"bass_options":[57,45],"required":[3,6,9,0],"max_counts":{"3":1,"6":1,"9":1,"0":1}},
  "Dvii2/III": {"next":["DTiii"],"bass_options":[48,36],"required":[3,6,9,0],"max_counts":{"3":1,"6":1,"9":1,"0":1}},
  "D7/IV": {"next":["S","S6","s","s6"],"bass_options":[48,36],"required":[0,4,7,10],"max_counts":{"0":1,"4":1,"7":1,"10":1}},
  "D56/IV": {"next":["S","S6","s","s6"],"bass_options":[52,40],"required":[0,4,7,10],"max_counts":{"0":1,"4":1,"7":1,"10":1}},
  "D34/IV": {"next":["S","S6","s","s6"],"bass_options":[55,43],"required":[0,4,7,10],"max_counts":{"0":1,"4":1,"7":1,"10":1}},
  "D2/IV": {"next":["S6","s6"],"bass_options":[58,46],"required":[0,4,7,10],"max_counts":{"0":1,"4":1,"7":1,"10":1}},
  "Dvii7/IV": {"next":["S","S6","s","s6"],"bass_options":[40,52],"required":[4,7,10,1],"max_counts":{"4":1,"7":1,"10":1,"1":1}},
  "Dvii56/IV": {"next":["S","S6","s","s6"],"bass_options":[55,43],"required":[4,7,10,1],"max_counts":{"4":1,"7":1,"10":1,"1":1}},
  "Dvii34/IV": {"next":["S","S6","s","s6"],"bass_options":[58,46],"required":[4,7,10,1],"max_counts":{"4":1,"7":1,"10":1,"1":1}},
  "Dvii2/IV": {"next":["S6","s6"],"bass_options":[61,49],"required":[4,7,10,1],"max_counts":{"4":1,"7":1,"10":1,"1":1}},
  "D7/VI": {"next":["VI","bVI"],"bass_options":[40,52],"required":[4,8,11,2],"max_counts":{"4":1,"8":1,"11":1,"2":1}},
  "D56/VI": {"next":["VI","bVI"],"bass_options":[56,44],"required":[4,8,11,2],"max_counts":{"4":1,"8":1,"11":1,"2":1}},
  "D34/VI": {"next":["VI","bVI"],"bass_options":[59,47],"required":[4,8,11,2],"max_counts":{"4":1,"8":1,"11":1,"2":1}},
  "D2/VI": {"next":["VI","bVI"],"bass_options":[50,62],"required":[4,8,11,2],"max_counts":{"4":1,"8":1,"11":1,"2":1}},
  "Dvii7/VI": {"next":["VI","bVI"],"bass_options":[44,32],"required":[8,11,2,5],"max_counts":{"8":1,"11":1,"2":1,"5":1}},
  "Dvii56/VI": {"next":["VI","bVI"],"bass_options":[59,47],"required":[8,11,2,5],"max_counts":{"8":1,"11":1,"2":1,"5":1}},
  "Dvii34/VI": {"next":["VI","bVI"],"bass_options":[62,50],"required":[8,11,2,5],"max_counts":{"8":1,"11":1,"2":1,"5":1}},
  "Dvii2/VI": {"next":["VI","bVI"],"bass_options":[65,53],"required":[8,11,2,5],"max_counts":{"8":1,"11":1,"2":1,"5":1}},
  "s": {"next":["D","D7","D7不完全","T","T6","s6","D6","K46","D56","D34","D2","sii7","sii56","Dvii7b","D6","DD","DD6","DD7","DD56","DDvii7","T46","N6","It+6","Ger+6","Fr+6","bVII","bVII6"],"bass_options":[41,53],"required":[5,8,0],"max_counts":{"8":1}},
  "s6": {"next":["s","D","D6","D7","D7不完全","T","T6","K46","D56","D34","D2","sii7","sii56","sii34","D6","DD","DD6","DD7","DD56","DDvii7","T46","N6","It+6","Ger+6","Fr+6","bVII","bVII6"],"bass_options":[44,56],"required":[5,8,0],"max_counts":{"8":1}},
  "s46": {"next":["T"],"bass_options":[48,36],"required":[5,8,0],"max_counts":{"5":1,"8":1}},
  "sii": {"next":["D","D7","D7不完全","K46","D56","D34","D2","sii7"],"bass_options":[50,38],"required":[2,5,8],"max_counts":{"8":1}},
  "sii6": {"next":["D","D7","D7不完全","K46","D56","D34","D2","sii7","sii56","sii34","D6","DD","DD6","DD7","DD56","DDvii7","N6","It+6","Ger+6","Fr+6","T6"],"bass_options":[41,53],"required":[2,5,8],"max_counts":{"8":1}},
  "sii7": {"next":["D","D7","D7不完全","K46"],"bass_options":[50,38],"required":[2,5,8,0],"max_counts":{"2":1,"5":1,"8":1,"0":1}},
  "sii56": {"next":["D","D7","D7不完全","K46"],"bass_options":[41,53],"required":[2,5,8,0],"max_counts":{"2":1,"5":1,"8":1,"0":1}},
  "sii34": {"next":["D","D7","D7不完全","K46"],"bass_options":[44,56],"required":[2,5,8,0],"max_counts":{"2":1,"5":1,"8":1,"0":1}},
  "sii2": {"next":["D6","K46"],"bass_options":[48,60],"required":[2,5,8,0],"max_counts":{"2":1,"5":1,"8":1,"0":1}},
  "bVI": {"next":["s","s6","S","S6","sii6","sii7","sii56","D","D6","D7","D7不完全","K46","N6","It+6","Ger+6","Fr+6","bVII","bVII6"],"bass_options":[44,32],"required":[8,0,3],"max_counts":{"3":1}},
  "bVII": {"next":["T","T6","t","t6","VI","bVI","s","s6","D","D7","D7不完全","K46","N6"],"bass_options":[46,34],"required":[10,2,5],"max_counts":{"10":1,"2":1}},
  "bVII6": {"next":["T","T6","t","t6","VI","bVI","D","D7","K46"],"bass_options":[50,38],"required":[10,2,5],"max_counts":{"10":1}},
  "D9b": {"next":["T","T不完全","VI_阻碍","bVI"],"bass_options":[43,55],"required":[7,11,5,8],"max_counts":{"7":1,"11":1,"5":1,"8":1}},
  "Dvii7b": {"next":["T双三","D7","D7不完全","D56"],"bass_options":[47,59],"required":[11,2,5,8],"max_counts":{"11":1,"2":1,"5":1,"8":1}},
  "Dvii56b":{"next":["T6","D7","D7不完全","D34"],"bass_options":[50,38],"required":[11,2,5,8],"max_counts":{"11":1,"2":1,"5":1,"8":1}},
  "Dvii34b":{"next":["T6","D2","K46"],"bass_options":[41,53],"required":[11,2,5,8],"max_counts":{"11":1,"2":1,"5":1,"8":1}},
  "Dvii2b": {"next":["T46","T6","D7","D7不完全"],"bass_options":[44,56],"required":[11,2,5,8],"max_counts":{"11":1,"2":1,"5":1,"8":1}},
  "t": {"next":["s","S","D","t6","S6","s6","VI","bVI","D56","D34","D2","Sii7","sii7","Dvii7","Dvii7b","Dvii34","Dvii2"],"bass_options":[48,36],"required":[0,3,7],"max_counts":{"3":1}},
  "t不完全": {"next":["s","S","D","t6","S6","s6","VI","bVI","D56","D34","D2","Sii7","sii7"],"bass_options":[48,36],"required":[0,3],"max_counts":{"3":1}},
  "t6": {"next":["s","S","D","t","S6","s6","VI","bVI","D56","D34","D2","Sii7","sii7","Dvii7","Dvii7b"],"bass_options":[39,51],"required":[0,3,7],"max_counts":{"3":1}},
  "S": {"next":["D","T","T6","S6","D6","K46","Sii","Sii6","D7","D7不完全","D56","D34","D2","Sii7","Sii56","Dvii7","Dvii56","Dvii34","Dvii2","Dvii6","D6","S7","VI7","DD","DD6","DD7","DD56","DDvii7","T46","D7/VI","Dvii7/VI","N6","It+6","Ger+6","Fr+6"],"bass_options":[41,53],"required":[5,9,0],"max_counts":{"9":1}},
  "S6": {"next":["S","D","D6","D7","D7不完全","T","K46","D56","D34","D2","Dvii7","Dvii56","Dvii34","Dvii2","Sii7","Sii56","Sii34","D6","S7","DD","DD6","DD7","DD56","T46","D7/VI","Dvii7/VI","N6","It+6","Ger+6","Fr+6"],"bass_options":[45,57],"required":[5,9,0],"max_counts":{"9":1}},
  "S46": {"next":["T"],"bass_options":[48,36],"required":[5,9,0],"max_counts":{"5":1,"9":1}},
  "Sii": {"next":["D","K46","D7","D7不完全","D56","D34","Sii7"],"bass_options":[50,38],"required":[2,5,9],"max_counts":{"9":1}},
  "Sii6": {"next":["D","D7","D7不完全","K46","D56","D34","D2","Sii7","Sii56","Sii34","D6","DD","DD6","DD7","DD56","DDvii7","N6","It+6","Ger+6","Fr+6","T6"],"bass_options":[41,53],"required":[2,5,9],"max_counts":{"2":1,"9":1}},
  "Sii7": {"next":["D","D7","D7不完全","K46"],"bass_options":[50,38],"required":[2,5,9,0],"max_counts":{"2":1,"5":1,"9":1,"0":1}},
  "Sii56": {"next":["D","D7","D7不完全","K46"],"bass_options":[41,53],"required":[2,5,9,0],"max_counts":{"2":1,"5":1,"9":1,"0":1}},
  "Sii34": {"next":["D","D7","D7不完全","K46"],"bass_options":[45,57],"required":[2,5,9,0],"max_counts":{"2":1,"5":1,"9":1,"0":1}},
  "Sii2": {"next":["D6","K46"],"bass_options":[48,60],"required":[2,5,9,0],"max_counts":{"2":1,"5":1,"9":1,"0":1}},
  "DD": {"next":["D","D7","D7不完全","K46"],"bass_options":[38,50],"required":[2,6,9],"max_counts":{"6":1,"9":1}},
  "DD6": {"next":["D","D7","D7不完全","K46"],"bass_options":[42,54],"required":[2,6,9],"max_counts":{"6":1}},
  "DD7": {"next":["D","D7","D7不完全","K46"],"bass_options":[38,50],"required":[2,6,9,0],"max_counts":{"2":1,"6":1,"9":1,"0":1}},
  "DD56": {"next":["D","D7","D7不完全","K46"],"bass_options":[42,54],"required":[2,6,9,0],"max_counts":{"2":1,"6":1,"9":1,"0":1}},
  "DDvii7": {"next":["D","D7","D7不完全","K46","T","T6"],"bass_options":[42,54],"required":[6,9,0,4],"max_counts":{"6":1,"9":1,"0":1,"4":1}},
  "D": {"next":["T","T6","VI_阻碍","bVI","D7","D7不完全","t","t6","T46"],"bass_options":[43,55],"required":[7,11,2],"max_counts":{"11":1}},
  "D6": {"next":["D","D7","D7不完全","D56","D34","D2","T","VI_阻碍","bVI","t"],"bass_options":[47,59],"required":[7,11,2],"max_counts":{"11":1}},
  "D46": {"next":["T","T6","t","t6"],"bass_options":[38,50],"required":[7,11,2],"max_counts":{"11":1}},
  "K46": {"next":["D","D7","D6","D9","D9b","D76","D7/VI","D56/VI","Dvii7/VI"],"bass_options":[43,55],"required":[0,4,7],"max_counts":{"0":1,"4":1}},
  "VI": {"next":["S","S6","Sii","Sii6","Sii7","Sii56","Dvii7","Dvii56","Dvii34","Dvii2","VI7","D","D6","D7","D7不完全","K46","D7/IV","Dvii7/IV","N6","It+6","Ger+6","Fr+6"],"bass_options":[45,33],"required":[9,0,4],"max_counts":{"4":1}},
  "VI_阻碍": {"next":["S","S6","Sii","Sii6","Sii7","Sii56","VI7","D7/IV","Dvii7/IV","N6","It+6","Ger+6","Fr+6"],"bass_options":[45,33],"required":[9,0,4],"max_counts":{"9":1,"4":1}},
  "D7": {"next":["T不完全","VI_阻碍","bVI","t不完全","t","T46"],"bass_options":[43,55],"required":[7,11,2,5],"max_counts":{"7":1,"11":1,"2":1,"5":1}},
  "D7不完全": {"next":["T","t"],"bass_options":[43,55],"required":[7,11,5],"max_counts":{"7":2,"11":1,"5":1}},
  "D56": {"next":["T","t"],"bass_options":[47,59],"required":[7,11,2,5],"max_counts":{"7":1,"11":1,"2":1,"5":1}},
  "D34": {"next":["T","T6","t","t6"],"bass_options":[38,50],"required":[7,11,2,5],"max_counts":{"7":1,"11":1,"2":1,"5":1}},
  "D2": {"next":["T6","t6"],"bass_options":[41,53],"required":[7,11,2,5],"max_counts":{"7":1,"11":1,"2":1,"5":1}},
  "D9": {"next":["T","T不完全"],"bass_options":[43,55],"required":[7,11,5,9],"max_counts":{"7":1,"11":1,"5":1,"9":1}},
  "DTiii": {"next":["S","S6","Sii6","D","VI","DTiii7"],"bass_options":[40,52],"required":[4,7,11],"max_counts":{"11":1}},
  "Dvii6": {"next":["T","T6"],"bass_options":[38,50],"required":[11,2,5],"max_counts":{"11":1}},
  "Dadd6": {"next":["T","T不完全"],"bass_options":[43,55],"required":[7,11,4],"max_counts":{"11":1,"4":1}},
  "T7": {"next":["S","S6","Sii7","Sii56","VI7","S7"],"bass_options":[48,36],"required":[0,4,7,11],"max_counts":{"0":1,"4":1,"7":1,"11":1}},
  "S7": {"next":["D","D7","K46","Sii7"],"bass_options":[41,53],"required":[5,9,0,4],"max_counts":{"5":1,"9":1,"0":1,"4":1}},
  "VI7": {"next":["S","Sii7","Sii56","D","K46"],"bass_options":[45,33],"required":[9,0,4,7],"max_counts":{"9":1,"0":1,"4":1,"7":1}},
  "DTiii7": {"next":["VI","VI7","S","S6"],"bass_options":[40,52],"required":[4,7,11,2],"max_counts":{"4":1,"7":1,"11":1,"2":1}},
  "Dvii7": {"next":["T双三","D7","D7不完全","D56"],"bass_options":[47,59],"required":[11,2,5,9],"max_counts":{"11":1,"2":1,"5":1,"9":1}},
  "Dvii56":{"next":["T","T6","D7","D7不完全","D34"],"bass_options":[50,38],"required":[11,2,5,9],"max_counts":{"11":1,"2":1,"5":1,"9":1}},
  "Dvii34":{"next":["T","T6","D2","K46"],"bass_options":[41,53],"required":[11,2,5,9],"max_counts":{"11":1,"2":1,"5":1,"9":1}},
  "Dvii2": {"next":["T46","T6","D7","D7不完全"],"bass_options":[45,57],"required":[11,2,5,9],"max_counts":{"11":1,"2":1,"5":1,"9":1}},
  "D76": {"next":["T","T不完全","t","t不完全","VI","VI_阻碍","D7","D7不完全"],"bass_options":[43,55],"required":[7,11,4,5],"max_counts":{"7":1,"11":1,"4":1,"5":1}},
  "DD76": {"next":["D","D7","D7不完全","K46"],"bass_options":[38,50],"required":[2,6,11,0],"max_counts":{"2":1,"6":1,"11":1,"0":1}},
};

/** 小调和弦功能网络数据库（结构同MAJOR_DNA，覆盖小调和声语汇） */
export const MINOR_DNA = {
  "t": {"next":["s","D","D76","t6","s6","D6","VI","sii6","D56","D34","D2","sii7","sii56","Dvii7","Dvii56","Dvii34","Dvii2","D6","t7","s7","VI7","D9","DD","DD6","DD7","DD56","DDvii7","D46","s46","D7/iv","Dvii7/iv","D7/VI","Dvii7/VI","D7/III","Dvii7/III","D7/VII","Dvii7/VII","N6","It+6","Ger+6","Fr+6","S","S6","Sii","Sii6","DD♮5","DD7♮5","VII","DTiii"],"bass_options":[48,36],"required":[0,3,7],"max_counts":{"3":1}},
  "t不完全": {"next":["s","D","t6","s6","VI","D56","D34","D2"],"bass_options":[48,36],"required":[0,3],"max_counts":{"3":1}},
  "t6": {"next":["s","S","D","t","S6","s6","VI","bVI","D56","D34","D2","Dvii7","Dvii56","Dvii34","Dvii2","sii","sii6","sii7","sii56","sii34","sii2","Dvii6","VI7","s7","DD","DD6","DD7","DD56","D46","D7/iv","Dvii7/iv","D7/VI","Dvii7/VI","D7/III","Dvii7/III","D7/VII","Dvii7/VII","N6","It+6","Ger+6","Fr+6","Sii","Sii6","Sii7","DD♮5","DD7♮5","VII","DTiii"],"bass_options":[39,51],"required":[0,3,7],"max_counts":{"3":1}},
  "t46": {"next":["s","s6","D","D6","D7","D7不完全"],"bass_options":[43,55],"required":[0,3,7],"max_counts":{"0":1,"3":1}},
  "S": {"next":["D","t","t6","D6","K46","D7","D7不完全","D56","D34","D2","t46","DTiii"],"bass_options":[41,53],"required":[5,9,0],"max_counts":{"9":1,"0":1}},
  "S6": {"next":["D","D6","D7","D7不完全","t","t6","K46","D56","D34","D2","t46"],"bass_options":[45,57],"required":[5,9,0],"max_counts":{"9":1}},
  "Sii": {"next":["D","K46","D7","D7不完全","D56","D34"],"bass_options":[50,38],"required":[2,5,9],"max_counts":{"5":1,"9":1}},
  "Sii6": {"next":["D","D7","D7不完全","K46","D56","D34","D2"],"bass_options":[41,53],"required":[2,5,9],"max_counts":{"2":1,"9":1}},
  "DD♮5": {"next":["D","D7","D7不完全","K46"],"bass_options":[38,50],"required":[2,6,9],"max_counts":{"6":1,"9":1}},
  "DD7♮5": {"next":["D","D7","D7不完全","K46"],"bass_options":[38,50],"required":[2,6,9,0],"max_counts":{"2":1,"6":1,"9":1,"0":1}},
  "N6": {"next":["K46","D","D7","D7不完全","D6"],"bass_options":[41,53],"required":[1,5,8],"max_counts":{"1":1,"8":1}},
  "It+6": {"next":["K46","D","D7","D7不完全"],"bass_options":[44,32],"required":[8,0,6],"max_counts":{"8":1,"6":1}},
  "Ger+6": {"next":["K46","D","D7","D7不完全"],"bass_options":[44,32],"required":[8,0,3,6],"max_counts":{"8":1,"0":1,"3":1,"6":1}},
  "Fr+6": {"next":["K46","D","D7","D7不完全"],"bass_options":[44,32],"required":[8,0,2,6],"max_counts":{"8":1,"0":1,"2":1,"6":1}},
  "DTiii": {"next":["VI","s","s6","sii6","D","S","S6","VII"],"bass_options":[39,51],"required":[3,7,10],"max_counts":{"7":1}},
  "VII": {"next":["DTiii","t","t6","VI","S","S6","s","s6","D","D6"],"bass_options":[46,58],"required":[10,2,5],"max_counts":{"2":1}},
  "D7/iv": {"next":["s","s6"],"bass_options":[48,36],"required":[0,4,7,10],"max_counts":{"0":1,"4":1,"7":1,"10":1}},
  "D56/iv": {"next":["s","s6"],"bass_options":[52,40],"required":[0,4,7,10],"max_counts":{"0":1,"4":1,"7":1,"10":1}},
  "D34/iv": {"next":["s","s6"],"bass_options":[55,43],"required":[0,4,7,10],"max_counts":{"0":1,"4":1,"7":1,"10":1}},
  "D2/iv": {"next":["s6"],"bass_options":[58,46],"required":[0,4,7,10],"max_counts":{"0":1,"4":1,"7":1,"10":1}},
  "Dvii7/iv": {"next":["s","s6"],"bass_options":[40,52],"required":[4,7,10,1],"max_counts":{"4":1,"7":1,"10":1,"1":1}},
  "Dvii56/iv": {"next":["s","s6"],"bass_options":[55,43],"required":[4,7,10,1],"max_counts":{"4":1,"7":1,"10":1,"1":1}},
  "Dvii34/iv": {"next":["s","s6"],"bass_options":[58,46],"required":[4,7,10,1],"max_counts":{"4":1,"7":1,"10":1,"1":1}},
  "Dvii2/iv": {"next":["s6"],"bass_options":[61,49],"required":[4,7,10,1],"max_counts":{"4":1,"7":1,"10":1,"1":1}},
  "D7/VI": {"next":["VI"],"bass_options":[39,51],"required":[3,7,10,1],"max_counts":{"3":1,"7":1,"10":1,"1":1}},
  "D56/VI": {"next":["VI"],"bass_options":[55,43],"required":[3,7,10,1],"max_counts":{"3":1,"7":1,"10":1,"1":1}},
  "D34/VI": {"next":["VI"],"bass_options":[58,46],"required":[3,7,10,1],"max_counts":{"3":1,"7":1,"10":1,"1":1}},
  "D2/VI": {"next":["VI"],"bass_options":[61,49],"required":[3,7,10,1],"max_counts":{"3":1,"7":1,"10":1,"1":1}},
  "Dvii7/VI": {"next":["VI"],"bass_options":[43,55],"required":[7,10,1,4],"max_counts":{"7":1,"10":1,"1":1,"4":1}},
  "Dvii56/VI": {"next":["VI"],"bass_options":[58,46],"required":[7,10,1,4],"max_counts":{"7":1,"10":1,"1":1,"4":1}},
  "Dvii34/VI": {"next":["VI"],"bass_options":[61,49],"required":[7,10,1,4],"max_counts":{"7":1,"10":1,"1":1,"4":1}},
  "Dvii2/VI": {"next":["VI"],"bass_options":[52,40],"required":[7,10,1,4],"max_counts":{"7":1,"10":1,"1":1,"4":1}},
  "D7/III": {"next":["DTiii"],"bass_options":[46,58],"required":[10,2,5,8],"max_counts":{"10":1,"2":1,"5":1,"8":1}},
  "D56/III": {"next":["DTiii"],"bass_options":[50,38],"required":[10,2,5,8],"max_counts":{"10":1,"2":1,"5":1,"8":1}},
  "D34/III": {"next":["DTiii"],"bass_options":[53,41],"required":[10,2,5,8],"max_counts":{"10":1,"2":1,"5":1,"8":1}},
  "D2/III": {"next":["DTiii"],"bass_options":[56,44],"required":[10,2,5,8],"max_counts":{"10":1,"2":1,"5":1,"8":1}},
  "Dvii7/III": {"next":["DTiii"],"bass_options":[38,50],"required":[2,5,8,11],"max_counts":{"2":1,"5":1,"8":1,"11":1}},
  "Dvii56/III": {"next":["DTiii"],"bass_options":[53,41],"required":[2,5,8,11],"max_counts":{"2":1,"5":1,"8":1,"11":1}},
  "Dvii34/III": {"next":["DTiii"],"bass_options":[56,44],"required":[2,5,8,11],"max_counts":{"2":1,"5":1,"8":1,"11":1}},
  "Dvii2/III": {"next":["DTiii"],"bass_options":[59,47],"required":[2,5,8,11],"max_counts":{"2":1,"5":1,"8":1,"11":1}},
  "D7/VII": {"next":["VII"],"bass_options":[41,53],"required":[5,9,0,3],"max_counts":{"5":1,"9":1,"0":1,"3":1}},
  "D56/VII": {"next":["VII"],"bass_options":[57,45],"required":[5,9,0,3],"max_counts":{"5":1,"9":1,"0":1,"3":1}},
  "D34/VII": {"next":["VII"],"bass_options":[48,36],"required":[5,9,0,3],"max_counts":{"5":1,"9":1,"0":1,"3":1}},
  "D2/VII": {"next":["VII"],"bass_options":[51,63],"required":[5,9,0,3],"max_counts":{"5":1,"9":1,"0":1,"3":1}},
  "Dvii7/VII": {"next":["VII"],"bass_options":[45,57],"required":[9,0,3,6],"max_counts":{"9":1,"0":1,"3":1,"6":1}},
  "Dvii56/VII": {"next":["VII"],"bass_options":[48,36],"required":[9,0,3,6],"max_counts":{"9":1,"0":1,"3":1,"6":1}},
  "Dvii34/VII": {"next":["VII"],"bass_options":[51,63],"required":[9,0,3,6],"max_counts":{"9":1,"0":1,"3":1,"6":1}},
  "Dvii2/VII": {"next":["VII"],"bass_options":[54,42],"required":[9,0,3,6],"max_counts":{"9":1,"0":1,"3":1,"6":1}},
  "s": {"next":["D","t","t6","s6","D6","K46","sii6","D7","D7不完全","D56","D34","D2","Dvii7","Dvii56","Dvii34","Dvii2","sii7","sii56","Dvii6","D6","s7","VI7","DD","DD6","DD7","DD56","DDvii7","t46","N6","It+6","Ger+6","Fr+6","VII","D7/III","Dvii7/III","D7/VII","Dvii7/VII","D7/iv","Dvii7/iv"],"bass_options":[41,53],"required":[5,8,0],"max_counts":{"8":1}},
  "s6": {"next":["s","D","D6","D7","D7不完全","t","K46","D56","D34","D2","Dvii7","Dvii56","Dvii34","Dvii2","sii7","sii56","sii34","D6","s7","DD","DD6","DD7","DD56","DDvii7","t46","N6","It+6","Ger+6","Fr+6","VII","D7/III","Dvii7/III","D7/VII","Dvii7/VII","D7/iv","Dvii7/iv"],"bass_options":[44,56],"required":[5,8,0],"max_counts":{"8":1}},
  "s46": {"next":["t"],"bass_options":[48,36],"required":[5,8,0],"max_counts":{"5":1,"8":1}},
  "sii": {"next":["D","K46","D7","D7不完全","D56","D34"],"bass_options":[50,38],"required":[2,5,8],"max_counts":{"8":1}},
  "sii6": {"next":["D","D7","D7不完全","K46","D56","D34","D2","sii7","sii56","sii34","D6","DD","DD6","DD7","DD56","DDvii7","N6","It+6","Ger+6","Fr+6","t6"],"bass_options":[41,53],"required":[2,5,8],"max_counts":{"2":1,"8":1}},
  "sii7": {"next":["D","D7","D7不完全","K46"],"bass_options":[50,38],"required":[2,5,8,0],"max_counts":{"2":1,"5":1,"8":1,"0":1}},
  "sii56": {"next":["D","D7","D7不完全","K46"],"bass_options":[41,53],"required":[2,5,8,0],"max_counts":{"2":1,"5":1,"8":1,"0":1}},
  "sii34": {"next":["D","D7","D7不完全","K46"],"bass_options":[44,56],"required":[2,5,8,0],"max_counts":{"2":1,"5":1,"8":1,"0":1}},
  "sii2": {"next":["D6","K46"],"bass_options":[48,60],"required":[2,5,8,0],"max_counts":{"2":1,"5":1,"8":1,"0":1}},
  "DD": {"next":["D","D7","D7不完全","K46"],"bass_options":[38,50],"required":[2,6,8],"max_counts":{"6":1,"8":1}},
  "DD6": {"next":["D","D7","D7不完全","K46"],"bass_options":[42,54],"required":[2,6,8],"max_counts":{"6":1}},
  "DD7": {"next":["D","D7","D7不完全","K46"],"bass_options":[38,50],"required":[2,6,8,0],"max_counts":{"2":1,"6":1,"8":1,"0":1}},
  "DD56": {"next":["D","D7","D7不完全","K46"],"bass_options":[42,54],"required":[2,6,8,0],"max_counts":{"2":1,"6":1,"8":1,"0":1}},
  "DDvii7": {"next":["D","D7","D7不完全","K46","S","S6","t","t6"],"bass_options":[42,54],"required":[6,8,0,3],"max_counts":{"6":1,"8":1,"0":1,"3":1}},
  "D": {"next":["t","t6","VI_阻碍","D7","D7不完全","t46"],"bass_options":[43,55],"required":[7,11,2],"max_counts":{"11":1}},
  "D6": {"next":["D","D7","D7不完全","D56","D34","D2","t","VI_阻碍"],"bass_options":[47,59],"required":[7,11,2],"max_counts":{"11":1}},
  "D46": {"next":["t","t6"],"bass_options":[38,50],"required":[7,11,2],"max_counts":{"11":1}},
  "K46": {"next":["D","D7","D6","D9","D76","D7/VI","D56/VI","Dvii7/VI"],"bass_options":[43,55],"required":[0,3,7],"max_counts":{"0":1,"3":1}},
  "VI": {"next":["s","s6","sii6","sii7","sii56","Dvii7","Dvii56","Dvii34","Dvii2","VI7","D7/iv","Dvii7/iv","N6","It+6","Ger+6","Fr+6","S","S6","Sii","Sii6","DD♮5","DD7♮5","D","D6","D7","D7不完全","K46","VII","D7/III","Dvii7/III","D7/VII","Dvii7/VII"],"bass_options":[44,32],"required":[8,0,3],"max_counts":{"3":1}},
  "VI_阻碍": {"next":["s","s6","sii6","sii7","sii56","VI7","D7/iv","Dvii7/iv","N6","It+6","Ger+6","Fr+6","S","S6","Sii","Sii6","DD♮5","DD7♮5","VII","D7/III","Dvii7/III","D7/VII","Dvii7/VII"],"bass_options":[44,32],"required":[8,0,3],"max_counts":{"8":1,"3":1}},
  "D7": {"next":["t不完全","VI_阻碍","t46"],"bass_options":[43,55],"required":[7,11,2,5],"max_counts":{"7":1,"11":1,"2":1,"5":1}},
  "D7不完全": {"next":["t"],"bass_options":[43,55],"required":[7,11,5],"max_counts":{"7":2,"11":1,"5":1}},
  "D56": {"next":["t","t6","S","S6"],"bass_options":[47,59],"required":[7,11,2,5],"max_counts":{"7":1,"11":1,"2":1,"5":1}},
  "D34": {"next":["t","t6","S","S6"],"bass_options":[38,50],"required":[7,11,2,5],"max_counts":{"7":1,"11":1,"2":1,"5":1}},
  "D2": {"next":["t6"],"bass_options":[41,53],"required":[7,11,2,5],"max_counts":{"7":1,"11":1,"2":1,"5":1}},
  "D9": {"next":["t","t不完全"],"bass_options":[43,55],"required":[7,11,5,8],"max_counts":{"7":1,"11":1,"5":1,"8":1}},
  "Dvii6": {"next":["t","t6"],"bass_options":[38,50],"required":[11,2,5],"max_counts":{"11":1}},
  "Dadd6": {"next":["t","t不完全"],"bass_options":[43,55],"required":[7,11,3],"max_counts":{"11":1,"4":1}},
  "t7": {"next":["s","s6","sii7","sii56","VI7","s7"],"bass_options":[48,36],"required":[0,3,7,10],"max_counts":{"0":1,"3":1,"7":1,"10":1}},
  "s7": {"next":["D","D7","K46","sii7"],"bass_options":[41,53],"required":[5,8,0,3],"max_counts":{"5":1,"8":1,"0":1,"3":1}},
  "VI7": {"next":["s","sii7","sii56","D","K46"],"bass_options":[44,32],"required":[8,0,3,7],"max_counts":{"8":1,"0":1,"3":1,"7":1}},
  "Dvii7": {"next":["t","D7","D7不完全","D56"],"bass_options":[47,59],"required":[11,2,5,8],"max_counts":{"11":1,"2":1,"5":1,"8":1}},
  "Dvii56":{"next":["t","t6","D7","D7不完全","D34"],"bass_options":[50,38],"required":[11,2,5,8],"max_counts":{"11":1,"2":1,"5":1,"8":1}},
  "Dvii34":{"next":["t","t6","D2","K46"],"bass_options":[41,53],"required":[11,2,5,8],"max_counts":{"11":1,"2":1,"5":1,"8":1}},
  "Dvii2": {"next":["t46","t6","D7","D7不完全"],"bass_options":[44,56],"required":[11,2,5,8],"max_counts":{"11":1,"2":1,"5":1,"8":1}},
  "D76": {"next":["t","t不完全","VI","VI_阻碍","D7","D7不完全"],"bass_options":[43,55],"required":[7,11,3,5],"max_counts":{"7":1,"11":1,"3":1,"5":1}},
  "DD76": {"next":["D","D7","D7不完全","K46"],"bass_options":[38,50],"required":[2,6,11,0],"max_counts":{"2":1,"6":1,"11":1,"0":1}},
};

/**
 * 音符到SVG Y坐标的映射表
 *
 * 用于乐谱渲染时将音符名称转换为精确的SVG垂直位置。
 * 高音谱表音符使用标准名称（如 "C5", "F4"），
 * 低音谱表音符使用后缀 "_bass"（如 "C4_bass", "F3_bass"）。
 *
 * 坐标系说明:
 *   - 高音谱表第一线(G4)对应 Y=40，每线/间间隔5px
 *   - 低音谱表第一线(G2)对应 Y=180
 *   - Y值越小，SVG位置越靠上（音高越高）
 */
export const PITCH_Y = {
  "B6": -10, "A6": -5, "G6": 0, "F6": 5, "E6": 10, "D6": 15, "C6": 20, "B5": 25,
  "A5": 30, "G5": 35, "F5": 40, "E5": 45, "D5": 50, "C5": 55, "B4": 60, "A4": 65, "G4": 70, "F4": 75, "E4": 80, "D4": 85, "C4": 90, "B3": 95, "A3": 100, "G3": 105,
  "F3": 110, "E3": 115, "D3": 120, "C3": 125, "B2": 130, "A2": 135, "G2": 140, "F2": 145, "E2": 150, "D2": 155, "C2": 160,
  "C6_bass": 90, "B5_bass": 95, "A5_bass": 100, "G5_bass": 105, "F5_bass": 110, "E5_bass": 115, "D5_bass": 120, "C5_bass": 125,
  "B4_bass": 130, "A4_bass": 135, "G4_bass": 140, "F4_bass": 145, "E4_bass": 150, "D4_bass": 155, "C4_bass": 160, "B3_bass": 165,
  "A3_bass": 170, "G3_bass": 175, "F3_bass": 180, "E3_bass": 185, "D3_bass": 190, "C3_bass": 195, "B2_bass": 200, "A2_bass": 205,
  "G2_bass": 210, "F2_bass": 215, "E2_bass": 220, "D2_bass": 225, "C2_bass": 230, "B1_bass": 235, "A1_bass": 240,
  "G1_bass": 245, "F1_bass": 250, "E1_bass": 255, "D1_bass": 260, "C1_bass": 265, "B0_bass": 270, "A0_bass": 275
};

/**
 * 可用MIDI音符范围
 *
 * 生成从C2(36)到B6(95)的所有MIDI音符编号数组，共60个音。
 * 覆盖四声部写作所需的完整音域:
 *   - 男低音最低可至C2(36)
 *   - 女高音最高可至B6(95)（但实际写作中通常不超过A5=84）
 *
 * 该数组用于候选生成时的音高遍历，确保只使用乐音范围内的音符。
 */
export const AVAILABLE_NOTES = Array.from({length: 60}, (_, i) => i + 36);
