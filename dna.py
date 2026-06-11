# dna.py

MAJOR_DNA = {
    # 🌟 核心增补：在主和弦后方全面开放离调副下属和弦的进行通路
    "T": {"next": ["S", "D", "D₇⁶", "T₆", "S₆", "D₆", "VI", "Sᵢᵢ₆", "D₅₆", "D₃₄", "D₂", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "DTᵢᵢᵢ", "Dᵥᵢᵢ₆", "D⁶", "T₇", "S₇", "VI₇", "DTᵢᵢᵢ₇", "D₉", "DD", "DD₆", "DD₇", "DD₅₆", "DDᵥᵢᵢ₇", "D₆₄", "S₆₄", "D₇/II", "Dᵥᵢᵢ₇/II", "D₇/IV", "Dᵥᵢᵢ₇/IV", "D₇/VI", "Dᵥᵢᵢ₇/VI", "D₇/III", "Dᵥᵢᵢ₇/III", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "s", "s₆", "♭VI", "sᵢᵢ₆", "sᵢᵢ₇", "sᵢᵢ₅₆", "Dᵥᵢᵢ₇♭", "Dᵥᵢᵢ₅₆♭", "D₉♭",
                   "s/II", "s₆/II", "sᵢᵢ₆/II", "sᵢᵢ₅₆/II", "sᵢᵢ₆/III", "sᵢᵢ₅₆/III", "s/IV", "s₆/IV", "sᵢᵢ₆/IV"], "bass_options": [48, 36], "required": {0, 4, 7}, "max_counts": {4: 1}},  
    "T不完全": {"next": ["S", "D", "T₆", "S₆", "VI", "D₅₆", "D₃₄", "D₂", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "DTᵢᵢᵢ", "DTᵢᵢᵢ₇", "s", "s₆", "♭VI"], "bass_options": [48, 36], "required": {0, 4}, "max_counts": {4: 1}},
    "T双三": {"next": ["S", "D", "T₆", "D₇", "D₇不完全", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "sᵢᵢ₇", "sᵢᵢ₅₆"], "bass_options": [48, 36], "required": {0, 4, 7}, "max_counts": {0: 1, 7: 1}},
    "T₆": {"next": ["S", "D", "S₆", "D₆", "D₅₆", "D₃₄", "D₂", "Sᵢᵢ", "Sᵢᵢ₆", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "Sᵢᵢ₃₄", "Sᵢᵢ₂", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "DTᵢᵢᵢ", "Dᵥᵢᵢ₆", "VI₇", "S₇", "DD", "DD₆", "DD₇", "DD₅₆", "D₆₄", "D₇/II", "Dᵥᵢᵢ₇/II", "D₇/IV", "Dᵥᵢᵢ₇/IV", "D₇/VI", "Dᵥᵢᵢ₇/VI", "D₇/III", "Dᵥᵢᵢ₇/III", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "s", "s₆", "♭VI", "sᵢᵢ", "sᵢᵢ₆", "sᵢᵢ₇", "sᵢᵢ₅₆", "Dᵥᵢᵢ₇♭", "Dᵥᵢᵢ₅₆♭", "D₉♭",
                    "s/II", "s₆/II", "sᵢᵢ₆/II", "sᵢᵢ₅₆/II", "sᵢᵢ₆/III", "sᵢᵢ₅₆/III", "s/IV", "s₆/IV", "sᵢᵢ₆/IV"], "bass_options": [40, 52], "required": {0, 4, 7}},
    "T₆₄": {"next": ["S", "S₆", "s", "s₆", "D", "D₆", "D₇", "D₇不完全"], "bass_options": [43, 55], "required": {0, 4, 7}, "max_counts": {0: 1, 4: 1}},

    # 🌟 2. 注入大调体系下的所有主功能离调副下属变和弦配置 🌟
    # ---------------------------------------------------------------
    # 至 II 级(Dm)的副下属: 词根为 G minor(7,10,2) / E dim(4,7,10)
    "s/II": {"next": ["D₇/II", "D₅₆/II", "D₃₄/II", "D₂/II", "Dᵥᵢᵢ₇/II", "Dᵥᵢᵢ₅₆/II", "Sᵢᵢ"], "bass_options": [43, 55], "required": {7, 10, 2}, "max_counts": {10: 1}},
    "s₆/II": {"next": ["D₇/II", "D₅₆/II", "D₃₄/II", "D₂/II", "Dᵥᵢᵢ₇/II", "Dᵥᵢᵢ₅₆/II", "Sᵢᵢ₆"], "bass_options": [46, 58], "required": {7, 10, 2}, "max_counts": {10: 1}},
    "sᵢᵢ₆/II": {"next": ["D₇/II", "D₅₆/II", "D₃₄/II", "D₂/II", "Dᵥᵢᵢ₇/II", "Dᵥᵢᵢ₅₆/II", "Sᵢᵢ₆"], "bass_options": [43, 55], "required": {4, 7, 10}, "max_counts": {10: 1}},
    "sᵢᵢ₅₆/II": {"next": ["D₇/II", "D₅₆/II", "D₃₄/II", "Dᵥᵢᵢ₇/II", "Sᵢᵢ₅₆"], "bass_options": [43, 55], "required": {4, 7, 10, 2}, "max_counts": {4:1, 7:1, 10:1, 2:1}},
    
    # 至 III 级(Em)的副下属: 词根为 F# dim(6,9,0)
    "sᵢᵢ₆/III": {"next": ["D₇/III", "D₅₆/III", "D₃₄/III", "D₂/III", "Dᵥᵢᵢ₇/III", "DTᵢᵢᵢ"], "bass_options": [45, 57], "required": {6, 9, 0}, "max_counts": {6: 1}},
    "sᵢᵢ₅₆/III": {"next": ["D₇/III", "D₅₆/III", "D₃₄/III", "Dᵥᵢᵢ₇/III", "DTᵢᵢᵢ"], "bass_options": [45, 57], "required": {6, 9, 0, 4}, "max_counts": {6:1, 9:1, 0:1, 4:1}},
    
    # 至 IV 级(F)的副下属: 词根为 Bb minor(10,1,5) / G dim(7,10,1)
    "s/IV": {"next": ["D₇/IV", "D₅₆/IV", "D₃₄/IV", "D₂/IV", "Dᵥᵢᵢ₇/IV", "S"], "bass_options": [46, 34], "required": {10, 1, 5}, "max_counts": {10: 1, 1: 1}},
    "s₆/IV": {"next": ["D₇/IV", "D₅₆/IV", "D₃₄/IV", "D₂/IV", "Dᵥᵢᵢ₇/IV", "S₆"], "bass_options": [49, 37], "required": {10, 1, 5}, "max_counts": {10: 1, 1: 1}},
    "sᵢᵢ₆/IV": {"next": ["D₇/IV", "D₅₆/IV", "D₃₄/IV", "D₂/IV", "Dᵥᵢᵢ₇/IV", "Sᵢᵢ₆"], "bass_options": [46, 34], "required": {7, 10, 1}, "max_counts": {10: 1, 1: 1}},
    # ---------------------------------------------------------------

    "N₆": {"next": ["K₆₄", "D", "D₇", "D₇不完全", "D₆"], "bass_options": [41, 53], "required": {1, 5, 8}, "max_counts": {1: 1, 8: 1}}, 
    "It⁺⁶": {"next": ["K₆₄", "D", "D₇", "D₇不完全"], "bass_options": [44, 32], "required": {8, 0, 6}, "max_counts": {8: 1, 6: 1}},    
    "Ger⁺⁶": {"next": ["K₆₄", "D", "D₇", "D₇不完全"], "bass_options": [44, 32], "required": {8, 0, 3, 6}, "max_counts": {8: 1, 0: 1, 3: 1, 6: 1}},
    "Fr⁺⁶": {"next": ["K₆₄", "D", "D₇", "D₇不完全"], "bass_options": [44, 32], "required": {8, 0, 2, 6}, "max_counts": {8: 1, 0: 1, 2: 1, 6: 1}},

    "D₇/II": {"next": ["Sᵢᵢ", "Sᵢᵢ₆", "sᵢᵢ₆", "sᵢᵢ"], "bass_options": [45, 57], "required": {9, 1, 4, 7}, "max_counts": {9:1, 1:1, 4:1, 7:1}},
    "D₅₆/II": {"next": ["Sᵢᵢ", "Sᵢᵢ₆", "sᵢᵢ₆", "sᵢᵢ"], "bass_options": [49, 37], "required": {9, 1, 4, 7}, "max_counts": {9:1, 1:1, 4:1, 7:1}},
    "D₃₄/II": {"next": ["Sᵢᵢ", "Sᵢᵢ₆", "sᵢᵢ₆", "sᵢᵢ"], "bass_options": [52, 40], "required": {9, 1, 4, 7}, "max_counts": {9:1, 1:1, 4:1, 7:1}},
    "D₂/II": {"next": ["Sᵢᵢ₆", "sᵢᵢ₆"], "bass_options": [55, 43], "required": {9, 1, 4, 7}, "max_counts": {9:1, 1:1, 4:1, 7:1}},
    "Dᵥᵢᵢ₇/II": {"next": ["Sᵢᵢ", "Sᵢᵢ₆", "sᵢᵢ₆", "sᵢᵢ"], "bass_options": [49, 37], "required": {1, 4, 7, 10}, "max_counts": {1:1, 4:1, 7:1, 10:1}},
    "Dᵥᵢᵢ₅₆/II": {"next": ["Sᵢᵢ", "Sᵢᵢ₆", "sᵢᵢ₆", "sᵢᵢ"], "bass_options": [52, 40], "required": {1, 4, 7, 10}, "max_counts": {1:1, 4:1, 7:1, 10:1}},
    "Dᵥᵢᵢ₃₄/II": {"next": ["Sᵢᵢ", "Sᵢᵢ₆", "sᵢᵢ₆", "sᵢᵢ"], "bass_options": [55, 43], "required": {1, 4, 7, 10}, "max_counts": {1:1, 4:1, 7:1, 10:1}},
    "Dᵥᵢᵢ₂/II": {"next": ["Sᵢᵢ₆", "sᵢᵢ₆"], "bass_options": [58, 46], "required": {1, 4, 7, 10}, "max_counts": {1:1, 4:1, 7:1, 10:1}},
    "D₇/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [47, 59], "required": {11, 3, 6, 9}, "max_counts": {11:1, 3:1, 6:1, 9:1}},
    "D₅₆/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [51, 39], "required": {11, 3, 6, 9}, "max_counts": {11:1, 3:1, 6:1, 9:1}},
    "D₃₄/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [54, 42], "required": {11, 3, 6, 9}, "max_counts": {11:1, 3:1, 6:1, 9:1}},
    "D₂/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [57, 45], "required": {11, 3, 6, 9}, "max_counts": {11:1, 3:1, 6:1, 9:1}},
    "Dᵥᵢᵢ₇/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [39, 51], "required": {3, 6, 9, 0}, "max_counts": {3:1, 6:1, 9:1, 0:1}},
    "Dᵥᵢᵢ₅₆/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [54, 42], "required": {3, 6, 9, 0}, "max_counts": {3:1, 6:1, 9:1, 0:1}},
    "Dᵥᵢᵢ₃₄/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [57, 45], "required": {3, 6, 9, 0}, "max_counts": {3:1, 6:1, 9:1, 0:1}},
    "Dᵥᵢᵢ₂/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [48, 36], "required": {3, 6, 9, 0}, "max_counts": {3:1, 6:1, 9:1, 0:1}},
    "D₇/IV": {"next": ["S", "S₆", "s", "s₆"], "bass_options": [48, 36], "required": {0, 4, 7, 10}, "max_counts": {0:1, 4:1, 7:1, 10:1}},
    "D₅₆/IV": {"next": ["S", "S₆", "s", "s₆"], "bass_options": [52, 40], "required": {0, 4, 7, 10}, "max_counts": {0:1, 4:1, 7:1, 10:1}},
    "D₃₄/IV": {"next": ["S", "S₆", "s", "s₆"], "bass_options": [55, 43], "required": {0, 4, 7, 10}, "max_counts": {0:1, 4:1, 7:1, 10:1}},
    "D₂/IV": {"next": ["S₆", "s₆"], "bass_options": [58, 46], "required": {0, 4, 7, 10}, "max_counts": {0:1, 4:1, 7:1, 10:1}},
    "Dᵥᵢᵢ₇/IV": {"next": ["S", "S₆", "s", "s₆"], "bass_options": [40, 52], "required": {4, 7, 10, 1}, "max_counts": {4:1, 7:1, 10:1, 1:1}},
    "Dᵥᵢᵢ₅₆/IV": {"next": ["S", "S₆", "s", "s₆"], "bass_options": [55, 43], "required": {4, 7, 10, 1}, "max_counts": {4:1, 7:1, 10:1, 1:1}},
    "Dᵥᵢᵢ₃₄/IV": {"next": ["S", "S₆", "s", "s₆"], "bass_options": [58, 46], "required": {4, 7, 10, 1}, "max_counts": {4:1, 7:1, 10:1, 1:1}},
    "Dᵥᵢᵢ₂/IV": {"next": ["S₆", "s₆"], "bass_options": [61, 49], "required": {4, 7, 10, 1}, "max_counts": {4:1, 7:1, 10:1, 1:1}},
    "D₇/VI": {"next": ["VI", "♭VI"], "bass_options": [40, 52], "required": {4, 8, 11, 2}, "max_counts": {4:1, 8:1, 11:1, 2:1}},
    "D₅₆/VI": {"next": ["VI", "♭VI"], "bass_options": [56, 44], "required": {4, 8, 11, 2}, "max_counts": {4:1, 8:1, 11:1, 2:1}},
    "D₃₄/VI": {"next": ["VI", "♭VI"], "bass_options": [59, 47], "required": {4, 8, 11, 2}, "max_counts": {4:1, 8:1, 11:1, 2:1}},
    "D₂/VI": {"next": ["VI", "♭VI"], "bass_options": [50, 62], "required": {4, 8, 11, 2}, "max_counts": {4:1, 8:1, 11:1, 2:1}},
    "Dᵥᵢᵢ₇/VI": {"next": ["VI", "♭VI"], "bass_options": [44, 32], "required": {8, 11, 2, 5}, "max_counts": {8:1, 11:1, 2:1, 5:1}},
    "Dᵥᵢᵢ₅₆/VI": {"next": ["VI", "♭VI"], "bass_options": [59, 47], "required": {8, 11, 2, 5}, "max_counts": {8:1, 11:1, 2:1, 5:1}},
    "Dᵥᵢᵢ₃₄/VI": {"next": ["VI", "♭VI"], "bass_options": [62, 50], "required": {8, 11, 2, 5}, "max_counts": {8:1, 11:1, 2:1, 5:1}},
    "Dᵥᵢᵢ₂/VI": {"next": ["VI", "♭VI"], "bass_options": [65, 53], "required": {8, 11, 2, 5}, "max_counts": {8:1, 11:1, 2:1, 5:1}},

    "s": {"next": ["D", "D₇", "D₇不完全", "T", "T₆", "s₆", "D₆", "K₆₄", "D₅₆", "D₃₄", "D₂", "sᵢᵢ₇", "sᵢᵢ₅₆", "Dᵥᵢᵢ₇♭", "D⁶", "DD", "DD₆", "DD₇", "DD₅₆", "DDᵥᵢᵢ₇", "T₆₄", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "♭VII", "♭VII₆"], "bass_options": [41, 53], "required": {5, 8, 0}, "max_counts": {8: 1}},  
    "s₆": {"next": ["s", "D", "D₆", "D₇", "D₇不完全", "T", "T₆", "K₆₄", "D₅₆", "D₃₄", "D₂", "sᵢᵢ₇", "sᵢᵢ₅₆", "sᵢᵢ₃₄", "D⁶", "DD", "DD₆", "DD₇", "DD₅₆", "DDᵥᵢᵢ₇", "T₆₄", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "♭VII", "♭VII₆"], "bass_options": [44, 56], "required": {5, 8, 0}, "max_counts": {8: 1}},
    "s₆₄": {"next": ["T"], "bass_options": [48, 36], "required": {5, 8, 0}, "max_counts": {5: 1, 8: 1}},
    
    "sᵢᵢ": {"next": ["D", "D₇", "D₇不完全", "K₆₄", "D₅₆", "D₃₄", "D₂", "sᵢᵢ₇"], "bass_options": [50, 38], "required": {2, 5, 8}, "max_counts": {8: 1}},
    "sᵢᵢ₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄", "D₅₆", "D₃₄", "D₂", "sᵢᵢ₇", "sᵢᵢ₅₆", "sᵢᵢ₃₄", "D⁶", "DD", "DD₆", "DD₇", "DD₅₆", "DDᵥᵢᵢ₇", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "T₆"], "bass_options": [41, 53], "required": {2, 5, 8}, "max_counts": {8: 1}},  
    "sᵢᵢ₇":  {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [50, 38], "required": {2, 5, 8, 0}, "max_counts": {2:1, 5:1, 8:1, 0:1}}, 
    "sᵢᵢ₅₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [41, 53], "required": {2, 5, 8, 0}, "max_counts": {2:1, 5:1, 8:1, 0:1}}, 
    "sᵢᵢ₃₄": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [44, 56], "required": {2, 5, 8, 0}, "max_counts": {2:1, 5:1, 8:1, 0:1}}, 
    "sᵢᵢ₂":  {"next": ["D₆", "K₆₄"], "bass_options": [48, 60], "required": {2, 5, 8, 0}, "max_counts": {2:1, 5:1, 8:1, 0:1}}, 
    
    "♭VI": {"next": ["s", "s₆", "S", "S₆", "sᵢᵢ₆", "sᵢᵢ₇", "sᵢᵢ₅₆", "D", "D₆", "D₇", "D₇不完全", "K₆₄", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "♭VII", "♭VII₆"], "bass_options": [44, 32], "required": {8, 0, 3}, "max_counts": {3: 1}},
    
    "♭VII": {"next": ["T", "T₆", "t", "t₆", "VI", "♭VI", "s", "s₆", "D", "D₇", "D₇不完全", "K₆₄", "N₆"], "bass_options": [46, 34], "required": {10, 2, 5}, "max_counts": {10: 1, 2: 1}},
    "♭VII₆": {"next": ["T", "T₆", "t", "t₆", "VI", "♭VI", "D", "D₇", "K₆₄"], "bass_options": [50, 38], "required": {10, 2, 5}, "max_counts": {10: 1}},
    
    "D₉♭": {"next": ["T", "T不完全", "VI_阻碍", "♭VI"], "bass_options": [43, 55], "required": {7, 11, 5, 8}, "max_counts": {7: 1, 11: 1, 5: 1, 8: 1}},
    
    "Dᵥᵢᵢ₇♭": {"next": ["T双三", "D₇", "D₇不完全", "D₅₆"], "bass_options": [47, 59], "required": {11, 2, 5, 8}, "max_counts": {11:1, 2:1, 5:1, 8:1}},
    "Dᵥᵢᵢ₅₆♭":{"next": ["T₆", "D₇", "D₇不完全", "D₃₄"], "bass_options": [50, 38], "required": {11, 2, 5, 8}, "max_counts": {11:1, 2:1, 5:1, 8:1}},
    "Dᵥᵢᵢ₃₄♭":{"next": ["T₆", "D₂", "K₆₄"], "bass_options": [41, 53], "required": {11, 2, 5, 8}, "max_counts": {11:1, 2:1, 5:1, 8:1}},
    "Dᵥᵢᵢ₂♭": {"next": ["T₆₄", "T₆", "D₇", "D₇不完全"], "bass_options": [44, 56], "required": {11, 2, 5, 8}, "max_counts": {11:1, 2:1, 5:1, 8:1}},
    
    "t": {"next": ["s", "S", "D", "t₆", "S₆", "s₆", "VI", "♭VI", "D₅₆", "D₃₄", "D₂", "Sᵢᵢ₇", "sᵢᵢ₇", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₇♭", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂"], "bass_options": [48, 36], "required": {0, 3, 7}, "max_counts": {3: 1}},

    "t不完全": {"next": ["s", "S", "D", "t₆", "S₆", "s₆", "VI", "♭VI", "D₅₆", "D₃₄", "D₂", "Sᵢᵢ₇", "sᵢᵢ₇"], "bass_options": [48, 36], "required": {0, 3}, "max_counts": {3: 1}},

    "t₆": {"next": ["s", "S", "D", "t", "S₆", "s₆", "VI", "♭VI", "D₅₆", "D₃₄", "D₂", "Sᵢᵢ₇", "sᵢᵢ₇", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₇♭"], "bass_options": [39, 51], "required": {0, 3, 7}, "max_counts": {3: 1}},

    "S": {"next": ["D", "T", "T₆", "S₆", "D₆", "K₆₄", "Sᵢᵢ", "Sᵢᵢ₆", "D₇", "D₇不完全", "D₅₆", "D₃₄", "D₂", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "Dᵥᵢᵢ₆", "D⁶", "S₇", "VI₇", "DD", "DD₆", "DD₇", "DD₅₆", "DDᵥᵢᵢ₇", "T₆₄", "D₇/VI", "Dᵥᵢᵢ₇/VI", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶"], "bass_options": [41, 53], "required": {5, 9, 0}, "max_counts": {9: 1}},  
    "S₆": {"next": ["S", "D", "D₆", "D₇", "D₇不完全", "T", "K₆₄", "D₅₆", "D₃₄", "D₂", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "Sᵢᵢ₃₄", "D⁶", "S₇", "DD", "DD₆", "DD₇", "DD₅₆", "T₆₄", "D₇/VI", "Dᵥᵢᵢ₇/VI", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶"], "bass_options": [45, 57], "required": {5, 9, 0}, "max_counts": {9: 1}},
    "S₆₄": {"next": ["T"], "bass_options": [48, 36], "required": {5, 9, 0}, "max_counts": {5: 1, 9: 1}},
    "Sᵢᵢ": {"next": ["D", "K₆₄", "D₇", "D₇不完全", "D₅₆", "D₃₄", "Sᵢᵢ₇", "T₆"], "bass_options": [50, 38], "required": {2, 5, 9}, "max_counts": {9: 1}},
    "Sᵢᵢ₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄", "D₅₆", "D₃₄", "D₂", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "Sᵢᵢ₃₄", "D⁶", "DD", "DD₆", "DD₇", "DD₅₆", "DDᵥᵢᵢ₇", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "T₆"], "bass_options": [41, 53], "required": {2, 5, 9}, "max_counts": {2: 1, 9: 1}},  
    "Sᵢᵢ₇":  {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [50, 38], "required": {2, 5, 9, 0}, "max_counts": {2:1, 5:1, 9:1, 0:1}}, 
    "Sᵢᵢ₅₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [41, 53], "required": {2, 5, 9, 0}, "max_counts": {2:1, 5:1, 9:1, 0:1}}, 
    "Sᵢᵢ₃₄": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [45, 57], "required": {2, 5, 9, 0}, "max_counts": {2:1, 5:1, 9:1, 0:1}}, 
    "Sᵢᵢ₂":  {"next": ["D₆", "K₆₄"], "bass_options": [48, 60], "required": {2, 5, 9, 0}, "max_counts": {2:1, 5:1, 9:1, 0:1}}, 

    "DD": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [38, 50], "required": {2, 6, 9}, "max_counts": {6:1, 9:1}},
    "DD₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [42, 54], "required": {2, 6, 9}, "max_counts": {6:1}},
    "DD₇": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [38, 50], "required": {2, 6, 9, 0}, "max_counts": {2:1, 6:1, 9:1, 0:1}},
    "DD₅₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [42, 54], "required": {2, 6, 9, 0}, "max_counts": {2:1, 6:1, 9:1, 0:1}},
    "DDᵥᵢᵢ₇": {"next": ["D", "D₇", "D₇不完全", "K₆₄", "T", "T₆"], "bass_options": [42, 54], "required": {6, 9, 0, 4}, "max_counts": {6:1, 9:1, 0:1, 4:1}},

    "D":   {"next": ["T", "T₆", "VI_阻碍", "♭VI", "D₇", "D₇不完全", "t", "t₆", "T₆₄"], "bass_options": [43, 55], "required": {7, 11, 2}, "max_counts": {11: 1}}, 
    "D₆":  {"next": ["D", "D₇", "D₇不完全", "D₅₆", "D₃₄", "D₂", "T", "VI_阻碍", "♭VI", "t"], "bass_options": [47, 59], "required": {7, 11, 2}, "max_counts": {11: 1}},
    "D₆₄": {"next": ["T", "T₆", "t", "t₆"], "bass_options": [38, 50], "required": {7, 11, 2}, "max_counts": {11: 1}},
    "K₆₄": {"next": ["D", "D₇", "D⁶", "D₉", "D₉♭", "D₇⁶", "D₇/VI", "D₅₆/VI", "Dᵥᵢᵢ₇/VI"], "bass_options": [43, 55], "required": {0, 4, 7}, "max_counts": {0: 1, 4: 1}},  
    "VI":  {"next": ["S", "S₆", "Sᵢᵢ", "Sᵢᵢ₆", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "VI₇", "D", "D₆", "D₇", "D₇不完全", "K₆₄", "D₇/IV", "Dᵥᵢᵢ₇/IV", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶"], "bass_options": [45, 33], "required": {9, 0, 4}, "max_counts": {4: 1}},  
    "VI_阻碍": {"next": ["S", "S₆", "Sᵢᵢ", "Sᵢᵢ₆", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "VI₇", "D₇/IV", "Dᵥᵢᵢ₇/IV", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶"], "bass_options": [45, 33], "required": {9, 0, 4}, "max_counts": {9: 1, 4: 1}},  
    
    "D₇":  {"next": ["T不完全", "VI_阻碍", "♭VI", "t不完全", "t", "T₆₄"], "bass_options": [43, 55], "required": {7, 11, 2, 5}, "max_counts": {7: 1, 11: 1, 2: 1, 5: 1}},
    "D₇不完全": {"next": ["T", "t"], "bass_options": [43, 55], "required": {7, 11, 5}, "max_counts": {7: 2, 11: 1, 5: 1}},
    "D₅₆": {"next": ["T", "t"], "bass_options": [47, 59], "required": {7, 11, 2, 5}, "max_counts": {7: 1, 11: 1, 2: 1, 5: 1}},
    "D₃₄": {"next": ["T", "T₆", "t", "t₆"], "bass_options": [38, 50], "required": {7, 11, 2, 5}, "max_counts": {7: 1, 11: 1, 2: 1, 5: 1}},
    "D₂":  {"next": ["T₆", "t₆"], "bass_options": [41, 53], "required": {7, 11, 2, 5}, "max_counts": {7: 1, 11: 1, 2: 1, 5: 1}},
    "D₉":  {"next": ["T", "T不完全"], "bass_options": [43, 55], "required": {7, 11, 5, 9}, "max_counts": {7: 1, 11: 1, 5: 1, 9: 1}},

    "DTᵢᵢᵢ": {"next": ["S", "S₆", "Sᵢᵢ₆", "D", "VI", "DTᵢᵢᵢ₇"], "bass_options": [40, 52], "required": {4, 7, 11}, "max_counts": {11: 1}},
    "Dᵥᵢᵢ₆": {"next": ["T", "T₆"], "bass_options": [38, 50], "required": {11, 2, 5}, "max_counts": {11: 1}},
    "D⁶": {"next": ["T", "T不完全"], "bass_options": [43, 55], "required": {7, 11, 4}, "max_counts": {11: 1, 4: 1}},
    "T₇": {"next": ["S", "S₆", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "VI₇", "S₇"], "bass_options": [48, 36], "required": {0, 4, 7, 11}, "max_counts": {0: 1, 4: 1, 7: 1, 11: 1}},
    "S₇": {"next": ["D", "D₇", "K₆₄", "Sᵢᵢ₇"], "bass_options": [41, 53], "required": {5, 9, 0, 4}, "max_counts": {5: 1, 9: 1, 0: 1, 4: 1}},
    "VI₇": {"next": ["S", "Sᵢᵢ₇", "Sᵢᵢ₅₆", "D", "K₆₄"], "bass_options": [45, 33], "required": {9, 0, 4, 7}, "max_counts": {9: 1, 0: 1, 4: 1, 7: 1}},
    "DTᵢᵢᵢ₇": {"next": ["VI", "VI₇", "S", "S₆"], "bass_options": [40, 52], "required": {4, 7, 11, 2}, "max_counts": {4: 1, 7: 1, 11: 1, 2: 1}},
    
    "Dᵥᵢᵢ₇": {"next": ["T双三", "D₇", "D₇不完全", "D₅₆"], "bass_options": [47, 59], "required": {11, 2, 5, 9}, "max_counts": {11:1, 2:1, 5:1, 9:1}}, 
    "Dᵥᵢᵢ₅₆":{"next": ["T", "T₆", "D₇", "D₇不完全", "D₃₄"], "bass_options": [50, 38], "required": {11, 2, 5, 9}, "max_counts": {11:1, 2:1, 5:1, 9:1}}, 
    "Dᵥᵢᵢ₃₄":{"next": ["T", "T₆", "D₂", "K₆₄"], "bass_options": [41, 53], "required": {11, 2, 5, 9}, "max_counts": {11:1, 2:1, 5:1, 9:1}}, 
    "Dᵥᵢᵢ₂": {"next": ["T₆₄", "T₆", "D₇", "D₇不完全"], "bass_options": [45, 57], "required": {11, 2, 5, 9}, "max_counts": {11:1, 2:1, 5:1, 9:1}},  
    "D₇⁶": {"next": ["T", "T不完全", "t", "t不完全", "VI", "VI_阻碍", "D₇", "D₇不完全"], "bass_options": [43, 55], "required": {7, 11, 4, 5}, "max_counts": {7: 1, 11: 1, 4: 1, 5: 1}},
    
    "DD₇⁶": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [38, 50], "required": {2, 6, 11, 0}, "max_counts": {2: 1, 6: 1, 11: 1, 0: 1}},
}

MINOR_DNA = {
    # 🌟 核心增补：在小调主和弦后方全面开放离调副下属和弦的进行通路
    "t": {"next": ["s", "D", "D₇⁶", "t₆", "s₆", "D₆", "VI", "sᵢᵢ₆", "D₅₆", "D₃₄", "D₂", "sᵢᵢ₇", "sᵢᵢ₅₆", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "D⁶", "t₇", "s₇", "VI₇", "D₉", "DD", "DD₆", "DD₇", "DD₅₆", "DDᵥᵢᵢ₇", "D₆₄", "s₆₄", "D₇/iv", "Dᵥᵢᵢ₇/iv", "D₇/VI", "Dᵥᵢᵢ₇/VI", "D₇/III", "Dᵥᵢᵢ₇/III", "D₇/VII", "Dᵥᵢᵢ₇/VII", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "S", "S₆", "Sᵢᵢ", "Sᵢᵢ₆", "DD♮⁵", "DD₇♮⁵", "VII", "DTᵢᵢᵢ",
                   "s/iv", "s₆/iv", "sᵢᵢ₆/iv", "sᵢᵢ₅₆/iv", "sᵢᵢ₆/III", "sᵢᵢ₅₆/III", "s/VI", "s₆/VI", "sᵢᵢ₆/VI", "s/VII", "s₆/VII", "sᵢᵢ₆/VII"], "bass_options": [48, 36], "required": {0, 3, 7}, "max_counts": {3: 1}},  
    "t不完全": {"next": ["s", "D", "t₆", "s₆", "VI", "D₅₆", "D₃₄", "D₂"], "bass_options": [48, 36], "required": {0, 3}, "max_counts": {3: 1}},
    "t₆": {"next": ["s", "S", "D", "t", "S₆", "s₆", "VI", "♭VI", "D₅₆", "D₃₄", "D₂", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "sᵢᵢ", "sᵢᵢ₆", "sᵢᵢ₇", "sᵢᵢ₅₆", "sᵢᵢ₃₄", "sᵢᵢ₂", "Dᵥᵢᵢ₆", "VI₇", "s₇", "DD", "DD₆", "DD₇", "DD₅₆", "D₆₄", "D₇/iv", "Dᵥᵢᵢ₇/iv", "D₇/VI", "Dᵥᵢᵢ₇/VI", "D₇/III", "Dᵥᵢᵢ₇/III", "D₇/VII", "Dᵥᵢᵢ₇/VII", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "Sᵢᵢ", "Sᵢᵢ₆", "Sᵢᵢ₇", "DD♮⁵", "DD₇♮⁵", "VII", "DTᵢᵢᵢ",
                    "s/iv", "s₆/iv", "sᵢᵢ₆/iv", "sᵢᵢ₅₆/iv", "sᵢᵢ₆/III", "sᵢᵢ₅₆/III", "s/VI", "s₆/VI", "sᵢᵢ₆/VI", "s/VII", "s₆/VII", "sᵢᵢ₆/VII"], "bass_options": [39, 51], "required": {0, 3, 7}},
    "t₆₄": {"next": ["s", "s₆", "D", "D₆", "D₇", "D₇不完全"], "bass_options": [43, 55], "required": {0, 3, 7}, "max_counts": {0: 1, 3: 1}},

    # 🌟 4. 注入小调体系下的所有主功能离调副下属变和弦配置 🌟
    # ---------------------------------------------------------------
    # 至 iv 级(Fm)的副下属: 词根为 Bb minor(10,1,5) / G dim(7,10,1)
    "s/iv": {"next": ["D₇/iv", "D₅₆/iv", "D₃₄/iv", "D₂/iv", "Dᵥᵢᵢ₇/iv", "s"], "bass_options": [46, 34], "required": {10, 1, 5}, "max_counts": {10: 1, 1: 1}},
    "s₆/iv": {"next": ["D₇/iv", "D₅₆/iv", "D₃₄/iv", "D₂/iv", "Dᵥᵢᵢ₇/iv", "s₆"], "bass_options": [49, 37], "required": {10, 1, 5}, "max_counts": {10: 1, 1: 1}},
    "sᵢᵢ₆/iv": {"next": ["D₇/iv", "D₅₆/iv", "D₃₄/iv", "D₂/iv", "Dᵥᵢᵢ₇/iv", "sᵢᵢ₆"], "bass_options": [46, 34], "required": {7, 10, 1}, "max_counts": {10: 1, 1: 1}},
    "sᵢᵢ₅₆/iv": {"next": ["D₇/iv", "D₅₆/iv", "D₃₄/iv", "Dᵥᵢᵢ₇/iv", "sᵢᵢ₅₆"], "bass_options": [46, 34], "required": {7, 10, 1, 5}, "max_counts": {7:1, 10:1, 1:1, 5:1}},
    
    # 至 III 级(Eb大)的副下属: 词根为 F dim(5,8,0)
    "sᵢᵢ₆/III": {"next": ["D₇/III", "D₅₆/III", "D₃₄/III", "D₂/III", "Dᵥᵢᵢ₇/III", "DTᵢᵢᵢ"], "bass_options": [44, 56], "required": {5, 8, 0}, "max_counts": {8: 1}},
    "sᵢᵢ₅₆/III": {"next": ["D₇/III", "D₅₆/III", "D₃₄/III", "Dᵥᵢᵢ₇/III", "DTᵢᵢᵢ"], "bass_options": [44, 56], "required": {5, 8, 0, 3}, "max_counts": {5:1, 8:1, 0:1, 3:1}},
    
    # 至 VI 级(Ab大)的副下属: 词根为 Db Major(1,5,8) / Bb dim(10,1,5)
    "s/VI": {"next": ["D₇/VI", "D₅₆/VI", "D₃₄/VI", "D₂/VI", "Dᵥᵢᵢ₇/VI", "VI"], "bass_options": [49, 37], "required": {1, 5, 8}, "max_counts": {1: 1}},
    "s₆/VI": {"next": ["D₇/VI", "D₅₆/VI", "D₃₄/VI", "D₂/VI", "Dᵥᵢᵢ₇/VI", "VI"], "bass_options": [41, 53], "required": {1, 5, 8}, "max_counts": {1: 1}},
    "sᵢᵢ₆/VI": {"next": ["D₇/VI", "D₅₆/VI", "D₃₄/VI", "D₂/VI", "Dᵥᵢᵢ₇/VI", "sᵢᵢ₆"], "bass_options": [49, 37], "required": {10, 1, 5}, "max_counts": {10: 1, 1: 1}},
    
    # 至 VII 级(Bb大)的副下属: 词根为 Eb minor(3,6,10) / C dim(0,3,6)
    "s/VII": {"next": ["D₇/VII", "D₅₆/VII", "D₃₄/VII", "D₂/VII", "Dᵥᵢᵢ₇/VII", "VII"], "bass_options": [51, 39], "required": {3, 6, 10}, "max_counts": {6: 1}},
    "s₆/VII": {"next": ["D₇/VII", "D₅₆/VII", "D₃₄/VII", "D₂/VII", "Dᵥᵢᵢ₇/VII", "VII"], "bass_options": [54, 42], "required": {3, 6, 10}, "max_counts": {6: 1}},
    "sᵢᵢ₆/VII": {"next": ["D₇/VII", "D₅₆/VII", "D₃₄/VII", "D₂/VII", "Dᵥᵢᵢ₇/VII", "VII"], "bass_options": [51, 39], "required": {0, 3, 6}, "max_counts": {6: 1}},
    # ---------------------------------------------------------------

    "S": {"next": ["D", "t", "t₆", "D₆", "K₆₄", "D₇", "D₇不完全", "D₅₆", "D₃₄", "D₂", "t₆₄", "DTᵢᵢᵢ"], "bass_options": [41, 53], "required": {5, 9, 0}, "max_counts": {9: 1, 0: 1}},
    "S₆": {"next": ["D", "D₆", "D₇", "D₇不完全", "t", "t₆", "K₆₄", "D₅₆", "D₃₄", "D₂", "t₆₄"], "bass_options": [45, 57], "required": {5, 9, 0}, "max_counts": {9: 1}},
    "Sᵢᵢ": {"next": ["D", "K₆₄", "D₇", "D₇不完全", "D₅₆", "D₃₄"], "bass_options": [50, 38], "required": {2, 5, 9}, "max_counts": {5: 1, 9: 1}},
    "Sᵢᵢ₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄", "D₅₆", "D₃₄", "D₂"], "bass_options": [41, 53], "required": {2, 5, 9}, "max_counts": {2: 1, 9: 1}},
    "DD♮⁵": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [38, 50], "required": {2, 6, 9}, "max_counts": {6:1, 9:1}},
    "DD₇♮⁵": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [38, 50], "required": {2, 6, 9, 0}, "max_counts": {2:1, 6:1, 9:1, 0:1}},

    "N₆": {"next": ["K₆₄", "D", "D₇", "D₇不完全", "D₆"], "bass_options": [41, 53], "required": {1, 5, 8}, "max_counts": {1: 1, 8: 1}}, 
    "It⁺⁶": {"next": ["K₆₄", "D", "D₇", "D₇不完全"], "bass_options": [44, 32], "required": {8, 0, 6}, "max_counts": {8: 1, 6: 1}},    
    "Ger⁺⁶": {"next": ["K₆₄", "D", "D₇", "D₇不完全"], "bass_options": [44, 32], "required": {8, 0, 3, 6}, "max_counts": {8: 1, 0: 1, 3: 1, 6: 1}},
    "Fr⁺⁶": {"next": ["K₆₄", "D", "D₇", "D₇不完全"], "bass_options": [44, 32], "required": {8, 0, 2, 6}, "max_counts": {8: 1, 0: 1, 2: 1, 6: 1}},

    "DTᵢᵢᵢ": {"next": ["VI", "s", "s₆", "sᵢᵢ₆", "D", "S", "S₆", "VII"], "bass_options": [39, 51], "required": {3, 7, 10}, "max_counts": {7: 1}},
    "VII": {"next": ["DTᵢᵢᵢ", "t", "t₆", "VI", "S", "S₆", "s", "s₆", "D", "D₆"], "bass_options": [46, 58], "required": {10, 2, 5}, "max_counts": {2: 1}},

    "D₇/iv": {"next": ["s", "s₆"], "bass_options": [48, 36], "required": {0, 4, 7, 10}, "max_counts": {0:1, 4:1, 7:1, 10:1}},
    "D₅₆/iv": {"next": ["s", "s₆"], "bass_options": [52, 40], "required": {0, 4, 7, 10}, "max_counts": {0:1, 4:1, 7:1, 10:1}},
    "D₃₄/iv": {"next": ["s", "s₆"], "bass_options": [55, 43], "required": {0, 4, 7, 10}, "max_counts": {0:1, 4:1, 7:1, 10:1}},
    "D₂/iv": {"next": ["s₆"], "bass_options": [58, 46], "required": {0, 4, 7, 10}, "max_counts": {0:1, 4:1, 7:1, 10:1}},
    "Dᵥᵢᵢ₇/iv": {"next": ["s", "s₆"], "bass_options": [40, 52], "required": {4, 7, 10, 1}, "max_counts": {4:1, 7:1, 10:1, 1:1}},
    "Dᵥᵢᵢ₅₆/iv": {"next": ["s", "s₆"], "bass_options": [55, 43], "required": {4, 7, 10, 1}, "max_counts": {4:1, 7:1, 10:1, 1:1}},
    "Dᵥᵢᵢ₃₄/iv": {"next": ["s", "s₆"], "bass_options": [58, 46], "required": {4, 7, 10, 1}, "max_counts": {4:1, 7:1, 10:1, 1:1}},
    "Dᵥᵢᵢ₂/iv": {"next": ["s₆"], "bass_options": [61, 49], "required": {4, 7, 10, 1}, "max_counts": {4:1, 7:1, 10:1, 1:1}},
    "D₇/VI": {"next": ["VI"], "bass_options": [39, 51], "required": {3, 7, 10, 1}, "max_counts": {3:1, 7:1, 10:1, 1:1}},
    "D₅₆/VI": {"next": ["VI"], "bass_options": [55, 43], "required": {3, 7, 10, 1}, "max_counts": {3:1, 7:1, 10:1, 1:1}},
    "D₃₄/VI": {"next": ["VI"], "bass_options": [58, 46], "required": {3, 7, 10, 1}, "max_counts": {3:1, 7:1, 10:1, 1:1}},
    "D₂/VI": {"next": ["VI"], "bass_options": [61, 49], "required": {3, 7, 10, 1}, "max_counts": {3:1, 7:1, 10:1, 1:1}},
    "Dᵥᵢᵢ₇/VI": {"next": ["VI"], "bass_options": [43, 55], "required": {7, 10, 1, 4}, "max_counts": {7:1, 10:1, 1:1, 4:1}},
    "Dᵥᵢᵢ₅₆/VI": {"next": ["VI"], "bass_options": [58, 46], "required": {7, 10, 1, 4}, "max_counts": {7:1, 10:1, 1:1, 4:1}},
    "Dᵥᵢᵢ₃₄/VI": {"next": ["VI"], "bass_options": [61, 49], "required": {7, 10, 1, 4}, "max_counts": {7:1, 10:1, 1:1, 4:1}},
    "Dᵥᵢᵢ₂/VI": {"next": ["VI"], "bass_options": [52, 40], "required": {7, 10, 1, 4}, "max_counts": {7:1, 10:1, 1:1, 4:1}},
    "D₇/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [46, 58], "required": {10, 2, 5, 8}, "max_counts": {10:1, 2:1, 5:1, 8:1}},
    "D₅₆/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [50, 38], "required": {10, 2, 5, 8}, "max_counts": {10:1, 2:1, 5:1, 8:1}},
    "D₃₄/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [53, 41], "required": {10, 2, 5, 8}, "max_counts": {10:1, 2:1, 5:1, 8:1}},
    "D₂/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [56, 44], "required": {10, 2, 5, 8}, "max_counts": {10:1, 2:1, 5:1, 8:1}},
    "Dᵥᵢᵢ₇/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [38, 50], "required": {2, 5, 8, 11}, "max_counts": {2:1, 5:1, 8:1, 11:1}},
    "Dᵥᵢᵢ₅₆/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [53, 41], "required": {2, 5, 8, 11}, "max_counts": {2:1, 5:1, 8:1, 11:1}},
    "Dᵥᵢᵢ₃₄/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [56, 44], "required": {2, 5, 8, 11}, "max_counts": {2:1, 5:1, 8:1, 11:1}},
    "Dᵥᵢᵢ₂/III": {"next": ["DTᵢᵢᵢ"], "bass_options": [59, 47], "required": {2, 5, 8, 11}, "max_counts": {2:1, 5:1, 8:1, 11:1}},
    "D₇/VII": {"next": ["VII"], "bass_options": [41, 53], "required": {5, 9, 0, 3}, "max_counts": {5:1, 9:1, 0:1, 3:1}},
    "D₅₆/VII": {"next": ["VII"], "bass_options": [57, 45], "required": {5, 9, 0, 3}, "max_counts": {5:1, 9:1, 0:1, 3:1}},
    "D₃₄/VII": {"next": ["VII"], "bass_options": [48, 36], "required": {5, 9, 0, 3}, "max_counts": {5:1, 9:1, 0:1, 3:1}},
    "D₂/VII": {"next": ["VII"], "bass_options": [51, 63], "required": {5, 9, 0, 3}, "max_counts": {5:1, 9:1, 0:1, 3:1}},
    "Dᵥᵢᵢ₇/VII": {"next": ["VII"], "bass_options": [45, 57], "required": {9, 0, 3, 6}, "max_counts": {9:1, 0:1, 3:1, 6:1}},
    "Dᵥᵢᵢ₅₆/VII": {"next": ["VII"], "bass_options": [48, 36], "required": {9, 0, 3, 6}, "max_counts": {9:1, 0:1, 3:1, 6:1}},
    "Dᵥᵢᵢ₃₄/VII": {"next": ["VII"], "bass_options": [51, 63], "required": {9, 0, 3, 6}, "max_counts": {9:1, 0:1, 3:1, 6:1}},
    "Dᵥᵢᵢ₂/VII": {"next": ["VII"], "bass_options": [54, 42], "required": {9, 0, 3, 6}, "max_counts": {9:1, 0:1, 3:1, 6:1}},

    "s": {"next": ["D", "t", "t₆", "s₆", "D₆", "K₆₄", "sᵢᵢ₆", "D₇", "D₇不完全", "D₅₆", "D₃₄", "D₂", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "sᵢᵢ₇", "sᵢᵢ₅₆", "Dᵥᵢᵢ₆", "D⁶", "s₇", "VI₇", "DD", "DD₆", "DD₇", "DD₅₆", "DDᵥᵢᵢ₇", "t₆₄", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "VII", "D₇/III", "Dᵥᵢᵢ₇/III", "D₇/VII", "Dᵥᵢᵢ₇/VII", "D₇/iv", "Dᵥᵢᵢ₇/iv"], "bass_options": [41, 53], "required": {5, 8, 0}, "max_counts": {8: 1}},  
    "s₆": {"next": ["s", "D", "D₆", "D₇", "D₇不完全", "t", "K₆₄", "D₅₆", "D₃₄", "D₂", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "sᵢᵢ₇", "sᵢᵢ₅₆", "sᵢᵢ₃₄", "D⁶", "s₇", "DD", "DD₆", "DD₇", "DD₅₆", "DDᵥᵢᵢ₇", "t₆₄", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "VII", "D₇/III", "Dᵥᵢᵢ₇/III", "D₇/VII", "Dᵥᵢᵢ₇/VII", "D₇/iv", "Dᵥᵢᵢ₇/iv"], "bass_options": [44, 56], "required": {5, 8, 0}, "max_counts": {8: 1}},
    "s₆₄": {"next": ["t"], "bass_options": [48, 36], "required": {5, 8, 0}, "max_counts": {5: 1, 8: 1}},
    
    "sᵢᵢ": {"next": ["D", "K₆₄", "D₇", "D₇不完全", "D₅₆", "D₃₄", "t₆"], "bass_options": [50, 38], "required": {2, 5, 8}, "max_counts": {8: 1}},
    "sᵢᵢ₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄", "D₅₆", "D₃₄", "D₂", "sᵢᵢ₇", "sᵢᵢ₅₆", "sᵢᵢ₃₄", "D⁶", "DD", "DD₆", "DD₇", "DD₅₆", "DDᵥᵢᵢ₇", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "t₆"], "bass_options": [41, 53], "required": {2, 5, 8}, "max_counts": {2: 1, 8: 1}},  
    "sᵢᵢ₇":  {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [50, 38], "required": {2, 5, 8, 0}, "max_counts": {2:1, 5:1, 8:1, 0:1}}, 
    "sᵢᵢ₅₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [41, 53], "required": {2, 5, 8, 0}, "max_counts": {2:1, 5:1, 8:1, 0:1}}, 
    "sᵢᵢ₃₄": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [44, 56], "required": {2, 5, 8, 0}, "max_counts": {2:1, 5:1, 8:1, 0:1}}, 
    "sᵢᵢ₂":  {"next": ["D₆", "K₆₄"], "bass_options": [48, 60], "required": {2, 5, 8, 0}, "max_counts": {2:1, 5:1, 8:1, 0:1}}, 

    "DD": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [38, 50], "required": {2, 6, 8}, "max_counts": {6:1, 8:1}}, 
    "DD₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [42, 54], "required": {2, 6, 8}, "max_counts": {6:1}},
    "DD₇": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [38, 50], "required": {2, 6, 8, 0}, "max_counts": {2:1, 6:1, 8:1, 0:1}}, 
    "DD₅₆": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [42, 54], "required": {2, 6, 8, 0}, "max_counts": {2:1, 6:1, 8:1, 0:1}},
    "DDᵥᵢᵢ₇": {"next": ["D", "D₇", "D₇不完全", "K₆₄", "S", "S₆", "t", "t₆"], "bass_options": [42, 54], "required": {6, 8, 0, 3}, "max_counts": {6:1, 8:1, 0:1, 3:1}}, 

    "D":   {"next": ["t", "t₆", "VI_阻碍", "D₇", "D₇不完全", "t₆₄"], "bass_options": [43, 55], "required": {7, 11, 2}, "max_counts": {11: 1}}, 
    "D₆":  {"next": ["D", "D₇", "D₇不完全", "D₅₆", "D₃₄", "D₂", "t", "VI_阻碍"], "bass_options": [47, 59], "required": {7, 11, 2}, "max_counts": {11: 1}},
    "D₆₄": {"next": ["t", "t₆"], "bass_options": [38, 50], "required": {7, 11, 2}, "max_counts": {11: 1}},
    "K₆₄": {"next": ["D", "D₇", "D⁶", "D₉", "D₇⁶", "D₇/VI", "D₅₆/VI", "Dᵥᵢᵢ₇/VI"], "bass_options": [43, 55], "required": {0, 3, 7}, "max_counts": {0: 1, 3: 1}},  
    "VI":  {"next": ["s", "s₆", "sᵢᵢ₆", "sᵢᵢ₇", "sᵢᵢ₅₆", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "VI₇", "D₇/iv", "Dᵥᵢᵢ₇/iv", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "S", "S₆", "Sᵢᵢ", "Sᵢᵢ₆", "DD♮⁵", "DD₇♮⁵", "D", "D₆", "D₇", "D₇不完全", "K₆₄", "VII", "D₇/III", "Dᵥᵢᵢ₇/III", "D₇/VII", "Dᵥᵢᵢ₇/VII"], "bass_options": [44, 32], "required": {8, 0, 3}, "max_counts": {3: 1}},  
    "VI_阻碍": {"next": ["s", "s₆", "sᵢᵢ₆", "sᵢᵢ₇", "sᵢᵢ₅₆", "VI₇", "D₇/iv", "Dᵥᵢᵢ₇/iv", "N₆", "It⁺⁶", "Ger⁺⁶", "Fr⁺⁶", "S", "S₆", "Sᵢᵢ", "Sᵢᵢ₆", "DD♮⁵", "DD₇♮⁵", "VII", "D₇/III", "Dᵥᵢᵢ₇/III", "D₇/VII", "Dᵥᵢᵢ₇/VII"], "bass_options": [44, 32], "required": {8, 0, 3}, "max_counts": {8: 1, 3: 1}},  
    
    "D₇":  {"next": ["t不完全", "VI_阻碍", "t₆₄"], "bass_options": [43, 55], "required": {7, 11, 2, 5}, "max_counts": {7: 1, 11: 1, 2: 1, 5: 1}},
    "D₇不完全": {"next": ["t"], "bass_options": [43, 55], "required": {7, 11, 5}, "max_counts": {7: 2, 11: 1, 5: 1}},
    "D₅₆": {"next": ["t", "t₆", "S", "S₆"], "bass_options": [47, 59], "required": {7, 11, 2, 5}, "max_counts": {7: 1, 11: 1, 2: 1, 5: 1}},
    "D₃₄": {"next": ["t", "t₆", "S", "S₆"], "bass_options": [38, 50], "required": {7, 11, 2, 5}, "max_counts": {7: 1, 11: 1, 2: 1, 5: 1}},
    "D₂":  {"next": ["t₆"], "bass_options": [41, 53], "required": {7, 11, 2, 5}, "max_counts": {7: 1, 11: 1, 2: 1, 5: 1}},
    "D₉":  {"next": ["t", "t不完全"], "bass_options": [43, 55], "required": {7, 11, 5, 8}, "max_counts": {7: 1, 11: 1, 5: 1, 8: 1}},

    "Dᵥᵢᵢ₆": {"next": ["t", "t₆"], "bass_options": [38, 50], "required": {11, 2, 5}, "max_counts": {11: 1}},
    "D⁶": {"next": ["t", "t不完全"], "bass_options": [43, 55], "required": {7, 11, 3}, "max_counts": {11: 1, 4: 1}},
    "t₇": {"next": ["s", "s₆", "sᵢᵢ₇", "sᵢᵢ₅₆", "VI₇", "s₇"], "bass_options": [48, 36], "required": {0, 3, 7, 10}, "max_counts": {0: 1, 3: 1, 7: 1, 10: 1}},
    "s₇": {"next": ["D", "D₇", "K₆₄", "sᵢᵢ₇"], "bass_options": [41, 53], "required": {5, 8, 0, 3}, "max_counts": {5: 1, 8: 1, 0: 1, 3: 1}},
    "VI₇": {"next": ["s", "sᵢᵢ₇", "sᵢᵢ₅₆", "D", "K₆₄"], "bass_options": [44, 32], "required": {8, 0, 3, 7}, "max_counts": {8: 1, 0: 1, 3: 1, 7: 1}},
    
    "Dᵥᵢᵢ₇": {"next": ["t", "D₇", "D₇不完全", "D₅₆"], "bass_options": [47, 59], "required": {11, 2, 5, 8}, "max_counts": {11:1, 2:1, 5:1, 8:1}}, 
    "Dᵥᵢᵢ₅₆":{"next": ["t", "t₆", "D₇", "D₇不完全", "D₃₄"], "bass_options": [50, 38], "required": {11, 2, 5, 8}, "max_counts": {11:1, 2:1, 5:1, 8:1}}, 
    "Dᵥᵢᵢ₃₄":{"next": ["t", "t₆", "D₂", "K₆₄"], "bass_options": [41, 53], "required": {11, 2, 5, 8}, "max_counts": {11:1, 2:1, 5:1, 8:1}}, 
    "Dᵥᵢᵢ₂": {"next": ["t₆₄", "t₆", "D₇", "D₇不完全"], "bass_options": [44, 56], "required": {11, 2, 5, 8}, "max_counts": {11:1, 2:1, 5:1, 8:1}},  
    "D₇⁶": {"next": ["t", "t不完全", "VI", "VI_阻碍", "D₇", "D₇不完全"], "bass_options": [43, 55], "required": {7, 11, 3, 5}, "max_counts": {7: 1, 11: 1, 3: 1, 5: 1}},
    
    "DD₇⁶": {"next": ["D", "D₇", "D₇不完全", "K₆₄"], "bass_options": [38, 50], "required": {2, 6, 11, 0}, "max_counts": {2: 1, 6: 1, 11: 1, 0: 1}},
}

PITCH_Y = {
    "B6": -10, "A6": -5, "G6": 0, "F6": 5, "E6": 10, "D6": 15, "C6": 20, "B5": 25,
    "A5": 30, "G5": 35, "F5": 40, "E5": 45, "D5": 50, "C5": 55, "B4": 60, "A4": 65, "G4": 70, "F4": 75, "E4": 80, "D4": 85, "C4": 90, "B3": 95, "A3": 100, "G3": 105, 
    "F3": 110, "E3": 115, "D3": 120, "C3": 125, "B2": 130, "A2": 135, "G2": 140, "F2": 145, "E2": 150, "D2": 155, "C2": 160,
    
    "C6_bass": 90, "B5_bass": 95, "A5_bass": 100, "G5_bass": 105, "F5_bass": 110, "E5_bass": 115, "D5_bass": 120, "C5_bass": 125,
    "B4_bass": 130, "A4_bass": 135, "G4_bass": 140, "F4_bass": 145, "E4_bass": 150, "D4_bass": 155, "C4_bass": 160, "B3_bass": 165,
    "A3_bass": 170, "G3_bass": 175, "F3_bass": 180, "E3_bass": 185, "D3_bass": 190, "C3_bass": 195, "B2_bass": 200, "A2_bass": 205,
    "G2_bass": 210, "F2_bass": 215, "E2_bass": 220, "D2_bass": 225, "C2_bass": 230, "B1_bass": 235, "A1_bass": 240, 
    "G1_bass": 245, "F1_bass": 250, "E1_bass": 255, "D1_bass": 260, "C1_bass": 265, "B0_bass": 270, "A0_bass": 275
}

AVAILABLE_NOTES = list(range(36, 96))