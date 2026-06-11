# rules.py
from tonality import spell_midi

def evaluate_voicing(old_voices, new_voices, last_chord_name, target_chord_name, key_info):
    """
    计算两个和弦排列之间的声部连接代价（Penalty）。
    返回代价分数：分数越低代表连接越平稳规范；返回 999999 代表违反绝对铁律（死胡同）。
    """
    new_S, new_A, new_T, new_B = new_voices['S'], new_voices['A'], new_voices['T'], new_voices['B']
    
    # ==========================================
    # 1. 绝对音域限制 (Hard Limits)
    # ==========================================
    # 除非是旋律写作模式（COMPOSE允许稍宽的音域），否则严格限制在标准合唱音域内
    if key_info.get("app_mode") != "COMPOSE":
        if not (57 <= new_S <= 84): return 999999  # 女高音: A3 - C6
        if not (53 <= new_A <= 74): return 999999  # 女低音: F3 - D5
        if not (45 <= new_T <= 69): return 999999  # 男高音: A2 - A4
        if not (36 <= new_B <= 64): return 999999  # 男低音: C2 - E4

    # ==========================================
    # 2. 声部交叉与间距限制 (Voice Crossing & Spacing)
    # ==========================================
    # 铁律一：任一瞬时，上方声部绝不能低于下方声部（禁止声部交叉）
    if not (new_S >= new_A and new_A >= new_T and new_T > new_B): return 999999
    # 铁律二：上三声部之间（S-A, A-T）的物理间距绝不能超过八度（12个半音），T-B间距不限
    if (new_S - new_A) > 12 or (new_A - new_T) > 12: return 999999

    # 提取音级集合，判断是否为同和弦转换
    old_pcs_set = set(old_voices[v] % 12 for v in ['S', 'A', 'T', 'B'])
    new_pcs_set = set(new_voices[v] % 12 for v in ['S', 'A', 'T', 'B'])
    is_same_chord = len(old_pcs_set.intersection(new_pcs_set)) >= 3

    # ==========================================
    # 3. 🌟 声部超越绝对禁止 (Voice Overlap - Hard Block)
    # ==========================================
    # 铁律三：改变和弦时，某一声部进行到的新音高，绝对不能超过相邻声部原有的旧音高
    if not is_same_chord:
        if new_S < old_voices['A'] or \
           new_A > old_voices['S'] or new_A < old_voices['T'] or \
           new_T > old_voices['A'] or new_T < old_voices['B'] or \
           new_B > old_voices['T']:
            return 999999  # 触发声部超越，直接判定为死胡同

    # ==========================================
    # 4. 🌟 四声部同向进行绝对禁止 (Four-part Same Direction - Hard Block)
    # ==========================================
    directions = []
    for v in ['S', 'A', 'T', 'B']:
        diff = new_voices[v] - old_voices[v]
        directions.append(1 if diff > 0 else (-1 if diff < 0 else 0))
        
    # 铁律四：禁止四个声部在没有保持音的情况下，全部朝同一个方向（全上或全下）挪动
    if directions.count(0) == 0:
        if all(d == 1 for d in directions) or all(d == -1 for d in directions):
            return 999999  # 触发四部全同向，直接判定为死胡同

    # ==========================================
    # 5. 低音跳进规则 (Bass Leaps)
    # ==========================================
    bass_diff = new_B - old_voices['B']
    bass_leap = abs(bass_diff)
    bass_penalty = 0
    is_bass_dim5_down = (bass_diff == -6) # 特例：减五度下行跳进（通常允许）
    
    # 低音禁止超过八度的跳进，禁止大七度跳进，增四度/减五度（除特定下行外）也禁止
    if bass_leap > 12 or bass_leap == 11 or (bass_leap == 6 and not is_bass_dim5_down): 
        return 999999
    # 给允许的大跳赋予软性线性罚分
    elif bass_leap == 10: bass_penalty += 100 # 允许小七度跳进以适配斯波索宾部分器乐化大跳题
    elif bass_leap == 6 and is_bass_dim5_down: bass_penalty += 80   
    elif bass_leap in [8, 9]: bass_penalty += 50   
    else: bass_penalty += bass_leap * 0.5 

    # 预先计算所有声部的音名拼写（用于后续精确度数运算）
    old_spells = {v: spell_midi(old_voices[v], key_info, last_chord_name) for v in ['S', 'A', 'T', 'B']}
    new_spells = {v: spell_midi(new_voices[v], key_info, target_chord_name) for v in ['S', 'A', 'T', 'B']}

    # ==========================================
    # 6. 特定和弦的强制排列要求 (Specific Voicing Rules)
    # ==========================================
    # 附加六度音和弦 (如 D6, D76) 的六度音必须在最高声部 (Soprano)
    if target_chord_name in ["D⁶", "D₇⁶", "DD₇⁶"]:
        added_6th_step = (key_info["root_step"] + 2) % 7 if "DD" not in target_chord_name else (key_info["root_step"] + 6) % 7 
        _, s_step, _, _ = new_spells['S']
        if s_step != added_6th_step: return 999999 

    # 属九和弦 (D9) 的九音必须在最高声部，且与根音物理距离必须大于等于大九度(14半音)
    if target_chord_name in ["D₉", "D₉♭"]:
        root_pc = key_info["root_pc"]
        ninth_pc = (root_pc + 2) % 12 if target_chord_name == "D₉" else (root_pc + 1) % 12
        if new_voices['S'] % 12 != ninth_pc: return 999999  
        if new_voices['S'] - new_voices['B'] < 14: return 999999  
            
    # 同和弦转换时，九音禁止发生跳进
    if last_chord_name in ["D₉", "D₉♭"] and target_chord_name in ["D₉", "D₉♭"]:
        if abs(new_S - old_voices['S']) != 0: return 999999  

    leap_S = abs(new_S - old_voices['S'])
    leap_A = abs(new_A - old_voices['A'])
    leap_T = abs(new_T - old_voices['T'])

    # 特殊大跳豁免标记 (Amnesty)
    is_amnesty_S = False
    # 属功能到主功能的经典正格解决中，允许高音声部发生特定的四度/五度大跳
    if last_chord_name in ["D₃₄", "D₅₆", "D₇", "D⁶", "DD₃₄♭⁵", "DD₂♭⁵", "DD₅₆♭⁵", "DD₇♭⁵", "D₇不完全"] and target_chord_name in ["T", "T不完全", "T双三", "D", "D₇", "D₇不完全", "K₆₄", "t", "t不完全"]:
        if leap_S in [5, 7, 0]: is_amnesty_S = True 

    # 附加六度音和弦解决时，允许三度下行跳进
    if last_chord_name in ["D₇⁶", "DD₇⁶"] and target_chord_name in ["T", "T不完全", "t", "t不完全", "D", "D₇", "D₇不完全"]:
        if leap_S in [3, 4] and new_voices['S'] < old_voices['S']: is_amnesty_S = True

    # ==========================================
    # 7. 古典旋律音程限制 (Classical Melodic Intervals)
    # ==========================================
    # 校验每个声部的横向跳进，严格禁止增音程与非经典的七度跳进
    for v in ['S', 'A', 'T', 'B']:
        leap = abs(new_voices[v] - old_voices[v])
        if leap == 0: continue
            
        _, old_step, _, _ = old_spells[v]
        _, new_step, _, _ = new_spells[v]
        
        step_diff = abs(new_step - old_step)
        norm_step = min(step_diff, 7 - step_diff)
        norm_ic = min(leap % 12, 12 - (leap % 12))
        
        is_unclassical_interval = False
        # 物理半音数与自然音级跨度不符时，判定为非正规增减音程
        if norm_step == 1 and norm_ic not in [1, 2]: is_unclassical_interval = True
        elif norm_step == 2 and norm_ic not in [3, 4]: is_unclassical_interval = True
        elif norm_step == 3 and norm_ic != 5: is_unclassical_interval = True
        elif norm_step == 0 and norm_ic not in [0, 1]: is_unclassical_interval = True

        # 那不勒斯六和弦解决到属和弦时，允许减三度跳进
        if last_chord_name == "N₆" and target_chord_name.startswith("D"):
            if norm_step == 2 and norm_ic == 2: is_unclassical_interval = False

        if is_unclassical_interval:
            if v == 'B' and leap == 6 and new_voices[v] < old_voices[v]: pass # 低音减五度下行豁免
            elif v == 'S': pass # 女高音旋律线偶尔放开限制
            else: return 999999 # 内声部严格禁止增减音程横向大跳
                
        # 严禁大六度、七度、八度以上的非古典跳进 (女高音与男低音线条除外)
        if leap in [9, 10, 11] or leap > 12:
            if v not in ['S', 'B']: return 999999

    # ==========================================
    # 8. 变和弦专属解决规则 (Altered Chords Resolution)
    # ==========================================
    # 增六和弦 (It, Ger, Fr)：降六级音必须下行到属音，升四级音必须上行到属音（反向对流外扩解决）
    if last_chord_name.startswith(("It⁺⁶", "Ger⁺⁶", "Fr⁺⁶")):
        b6_step = (key_info["root_step"] + 5) % 7
        sharp4_step = (key_info["root_step"] + 3) % 7 
        dom_step = (key_info["root_step"] + 4) % 7    

        for v in ['S', 'A', 'T', 'B']:
            _, old_step, _, _ = old_spells[v]
            if old_step == b6_step:
                _, new_step, _, _ = new_spells[v]
                if new_step != dom_step or (new_voices[v] - old_voices[v] != -1): return 999999
            if old_step == sharp4_step:
                _, new_step, _, _ = new_spells[v]
                if new_step != dom_step or (new_voices[v] - old_voices[v] != 1): return 999999

    # 那不勒斯六和弦 (N6)：降二级音必须下行解决到主音或导音
    if last_chord_name == "N₆" and target_chord_name in ["D", "D₇", "D₇不完全", "D₆", "K₆₄"]:
        flat2_step = (key_info["root_step"] + 1) % 7 
        lead_step = (key_info["root_step"] + 6) % 7  
        tonic_step = key_info["root_step"]           
        
        for v in ['S', 'A', 'T', 'B']:
            _, old_step, _, _ = old_spells[v]
            if old_step == flat2_step:
                _, new_step, _, _ = new_spells[v]
                if new_step not in [lead_step, tonic_step]: return 999999
                if new_voices[v] >= old_voices[v]: return 999999

    # ==========================================
    # 9. 四六和弦与导音解决规则 (64 Chords & Leading Tone)
    # ==========================================
    is_64_context = any(c in ["S₆₄", "s₆₄", "D₆₄", "T₆₄", "t₆₄"] for c in [target_chord_name, last_chord_name])

    # 辅助/经过四六和弦：低音必须平稳或级进，上方声部也强制要求只能平稳级进
    if is_64_context:
        if bass_leap not in [0, 1, 2]: return 999999
        for v in ['S', 'A', 'T']:
            if abs(new_voices[v] - old_voices[v]) > 2: return 999999

    parallel_penalty = 0 
    # 隐伏五八度判定与保护限制
    if bass_leap in [1, 2]:
        bass_diff = new_B - old_voices['B']
        for v in ['S', 'A', 'T']:
            v_diff = new_voices[v] - old_voices[v]
            if v_diff != 0 and (v_diff * bass_diff) > 0:
                new_interval = abs(new_voices[v] - new_B) % 12
                if new_interval in [0, 5, 7]: return 999999
                else: parallel_penalty += 50

    # 线性平稳锁 (如 S - T6 - SII6)：声部线条必须全平稳，严禁超过3度的跳进
    is_auxiliary_linear = (last_chord_name in ["S", "s", "S₆", "s₆", "Sᵢᵢ₆", "sᵢᵢ₆", "Sᵢᵢ", "sᵢᵢ"] and target_chord_name in ["T₆", "t₆"]) or \
                          (last_chord_name in ["T₆", "t₆"] and target_chord_name in ["S", "s", "S₆", "s₆", "Sᵢᵢ₆", "sᵢᵢ₆", "Sᵢᵢ", "sᵢᵢ"])
    if is_auxiliary_linear:
        for v in ['S', 'A', 'T']:
            if abs(new_voices[v] - old_voices[v]) > 4: return 999999

    # 七和弦解决：七音必须强制下行级进解决
    if last_chord_name in ["D₇", "D₅₆", "D₃₄", "D₂", "D₇不完全", "D₇⁶"] and target_chord_name in ["T", "T不完全", "T双三", "T₆", "t", "t不完全", "t₆", "VI", "VI₆", "VI_阻碍"]:
        for v in ['S', 'A', 'T', 'B']:
            _, old_step, _, _ = old_spells[v]
            if old_step == (key_info["root_step"] + 3) % 7: 
                _, new_step, _, _ = new_spells[v]
                if new_step != (key_info["root_step"] + 2) % 7: return 999999
                    
    # 导音级进：导音 (七级音) 在外声部时必须强行上行解决到主音
    if last_chord_name in ["D", "D₆", "D₇", "D₅₆", "D₃₄", "D₂", "Dᵥᵢᵢ₆", "Dᵥᵢᵢ₇", "Dᵥᵢᵢ₅₆", "Dᵥᵢᵢ₃₄", "Dᵥᵢᵢ₂", "D₇不完全", "D₇⁶"] and target_chord_name in ["T", "T不完全", "T双三", "T₆", "t", "t不完全", "t₆", "VI", "VI₆", "VI_阻碍"]:
        for v in ['S', 'B']:
            _, old_step, _, _ = old_spells[v]
            if old_step == (key_info["root_step"] + 6) % 7: 
                _, new_step, _, _ = new_spells[v]
                # 🌟 修复：放宽特例允许男低音的导音也向下级进到 6 级音（满足经典下行低音线条 1-7-6）
                if last_chord_name == "D₆" and target_chord_name in ["VI", "VI_阻碍"] and new_step == (key_info["root_step"] + 5) % 7: continue
                if new_step != key_info["root_step"]: return 999999

    # 终止四六和弦 (K64) 解决：核心声部必须规整地下行转移到属功能和弦
    if last_chord_name == "K₆₄" and target_chord_name in ["D", "D₆", "D₇", "D₅₆", "D₃₄", "D₂", "D₉", "D₉♭"]:
        for v in ['S', 'A', 'T']:
            _, old_step, _, _ = old_spells[v]
            if old_step == key_info["root_step"]: 
                _, new_step, _, _ = new_spells[v]
                if new_step != (key_info["root_step"] + 6) % 7: return 999999
            if old_step == (key_info["root_step"] + 2) % 7: 
                _, new_step, _, _ = new_spells[v]
                if new_step not in [(key_info["root_step"] + 1) % 7, (key_info["root_step"] + 3) % 7]: return 999999

    # 避免半音变音级进中的反向对斜
    if last_chord_name.startswith("T") and target_chord_name.startswith("DD") and "♭⁵" in target_chord_name:
        for v in ['S', 'A', 'T', 'B']:
            root_pc = key_info["root_pc"]
            t_third = (root_pc + (3 if key_info["type"] == "MINOR" else 4)) % 12
            dd_third = (root_pc + 6) % 12
            if old_voices[v] % 12 == t_third and new_voices[v] % 12 == dd_third: return 999999

    # ==========================================
    # 10. 对斜法则绝对禁止 (False Relation - Hard Block)
    # ==========================================
    # 铁律五：相邻两个和弦若发生变音（如 C 到 C#），该变音必须发生在同一个声部，否则直接阻断
    for step in range(7):
        old_alts = {v: old_spells[v][2] for v in ['S', 'A', 'T', 'B'] if old_spells[v][1] == step}
        new_alts = {v: new_spells[v][2] for v in ['S', 'A', 'T', 'B'] if new_spells[v][1] == step}
        for v1, alt1 in old_alts.items():
            for v2, alt2 in new_alts.items():
                if alt1 != alt2 and v1 != v2:
                    if v2 not in old_alts or old_alts[v2] != alt1: return 999999

    # 附加六度音解决特例
    if last_chord_name in ["D₇⁶", "DD₇⁶"]:
        is_dd = (last_chord_name == "DD₇⁶")
        target_tonics = ["D", "D₇", "D₇不完全", "D₆", "K₆₄"] if is_dd else ["T", "T不完全", "T双三", "T₆", "t", "t不完全", "t₆"]
        if target_chord_name in target_tonics:
            _, old_s_step, _, _ = old_spells['S']
            _, new_s_step, _, _ = new_spells['S']
            target_root_step = (key_info["root_step"] + (4 if is_dd else 0)) % 7
            if new_s_step != target_root_step or (old_voices['S'] - new_voices['S'] not in [3, 4]): return 999999
        if not is_dd and target_chord_name in ["VI", "VI₆", "VI_阻碍"]:
            if old_voices['S'] != new_voices['S']: return 999999
        if (not is_dd and target_chord_name in ["D₇", "D₇不完全"]) or (is_dd and target_chord_name in ["DD₇", "DD₇不完全"]):
            if old_voices['B'] != new_voices['B'] or old_voices['T'] != new_voices['T'] or old_voices['A'] != new_voices['A']: return 999999
            if old_voices['S'] - new_voices['S'] not in [1, 2] or old_voices['S'] - new_voices['S'] > 2: return 999999

    # ==========================================
    # 11. 平行五八度铁律 (Parallel 5ths & 8ves - Hard Block)
    # ==========================================
    # 严格遍历所有两两声部组合，彻底阻断任何同向、反向的平行纯五度、纯八度
    voice_names = ['S', 'A', 'T', 'B']
    for i in range(len(voice_names)):
        for j in range(i+1, len(voice_names)):
            v1, v2 = voice_names[i], voice_names[j]
            o1, o2 = old_voices[v1], old_voices[v2]
            n1, n2 = new_voices[v1], new_voices[v2]
            
            if o1 == n1 and o2 == n2: continue 
            v1_diff = n1 - o1
            v2_diff = n2 - o2
            
            is_parallel_motion = (v1_diff * v2_diff) > 0  
            is_contrary_motion = (v1_diff * v2_diff) < 0  
            
            old_interval = abs(o1 - o2) % 12
            new_interval = abs(n1 - n2) % 12
            
            # 严格禁止任何平行/反向纯八度
            if old_interval == 0 and new_interval == 0:
                if is_parallel_motion or is_contrary_motion: return 999999
                    
            # 严格禁止任何平行/反向纯五度
            if old_interval == 7 and new_interval == 7:
                if is_parallel_motion:
                    if "Ger" in last_chord_name and target_chord_name in ["D", "D₆", "D₇", "D₇不完全"]: pass 
                    else: return 999999
                elif is_contrary_motion: return 999999
            
            # 减五度到纯五度的同向运动限制
            if is_parallel_motion and old_interval == 6 and new_interval == 7: return 999999
                
            # 外声部（S-B）隐伏纯音程限制判定
            if v1 == 'S' and v2 == 'B':
                if new_interval == 0 or new_interval == 7:
                    if is_parallel_motion and abs(n1 - o1) >= 3: parallel_penalty += 150

    # ==========================================
    # 12. 微观评分项与软惩罚 (Soft Penalties)
    # ==========================================
    unison_penalty = 0
    # 同度惩罚：轻微限制相邻声部齐唱同一个音的密集堆叠
    if new_S == new_A: unison_penalty += 20
    if new_A == new_T: unison_penalty += 15
    if new_T == new_B: unison_penalty += 20
    if unison_penalty > 0 and ("ᵥᵢᵢ" in target_chord_name or "⁺⁶" in target_chord_name or "DD" in target_chord_name):
        unison_penalty *= 4

    # 罕见七和弦限制分数
    rare_sevenths = ["T₇", "t₇", "VI₇", "DTᵢᵢᵢ₇", "S₇", "s₇"]
    stylistic_penalty = 0
    if target_chord_name in rare_sevenths:
        stylistic_penalty += 150  
        if leap_S > 2 or leap_A > 2 or leap_T > 2: return 999999  
            
    if last_chord_name in rare_sevenths:
        has_step_down = False
        for v in ['S', 'A', 'T', 'B']:
            if old_voices[v] - new_voices[v] in [1, 2]: 
                has_step_down = True
                break
        if not has_step_down: return 999999  

    # ==========================================
    # 13. 横向线条跳进得分核算 (Voice Leaps Cost)
    # ==========================================
    melody_penalty = 0
    if is_amnesty_S: melody_penalty = 0
    elif leap_S == 0: melody_penalty = 2.0 if is_same_chord else 0.0   
    elif leap_S in [1, 2]: melody_penalty = 0.0  
    elif leap_S in [3, 4, 5]: melody_penalty = 1.0 if is_same_chord else leap_S * 1.5
    else: melody_penalty = leap_S * 2.0 

    if key_info.get("app_mode") == "BASS":
        # 1. 鼓励外声部反向对流
        if (new_S - old_voices['S']) * (new_B - old_voices['B']) < 0:
            melody_penalty -= 15
        # 2. 严厉惩罚高音“死气沉沉”
        if leap_S == 0 and not is_same_chord:
            melody_penalty += 35
        # 3. 避免连续同向大跳
        if leap_S > 4:
            melody_penalty += 10

    inner_penalty = 0
    for leap in [leap_A, leap_T]:
        if leap == 0: inner_penalty += 0.0
        elif leap in [1, 2]: inner_penalty += leap * 0.5
        elif leap in [3, 4]: inner_penalty += leap * 1.2 
        else: inner_penalty += leap * 2.0 

    # 汇总计算最终的可行路径权重得分
    return bass_penalty + melody_penalty + inner_penalty + parallel_penalty + unison_penalty + stylistic_penalty + (20 if is_amnesty_S else 0)