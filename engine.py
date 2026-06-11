# engine.py
import itertools
from dna import AVAILABLE_NOTES
from rules import evaluate_voicing

def v_to_tuple(v): return (v['S'], v['A'], v['T'], v['B'])
def tuple_to_v(t): return {'S': t[0], 'A': t[1], 'T': t[2], 'B': t[3]}

def get_chord_siblings(chord_name, dna_db):
    """
    🌟 基于功能词根的精确同和弦转换判定：
    严格剥离转位与七/九扩展标记，提取绝对功能核心（如 Sᵢᵢ, D/IV, ♭VI）。
    彻底杜绝 D -> DD, S -> Sᵢᵢ 这种跨越功能体系的非法转换。
    """
    siblings = set()
    
    # 终止四六、那不勒斯六、增六和弦具有极强的定向解决趋势，禁止自由同和弦转换
    if "₆₄" in chord_name or "⁺⁶" in chord_name or chord_name == "N₆":
        return []
        
    def get_core(c):
        parts = c.split('/')
        core = parts[0]
        target = "/" + parts[1] if len(parts) > 1 else ""
        
        # 只剥离转位和扩展音数字，保留所有的功能前缀(♭)和变音属性
        suffixes = ["₆₄", "₅₆", "₃₄", "不完全", "双三", "₆", "₇", "₉", "₂", "⁶"]
        for suffix in suffixes:
            core = core.replace(suffix, "")
        return core + target

    my_core = get_core(chord_name)
    is_seventh_family = any(x in chord_name for x in ["₇", "₅₆", "₃₄", "₂", "₉"])
    
    for k in dna_db.keys():
        if "₆₄" in k or "⁺⁶" in k or k == "N₆":
            continue
        if get_core(k) == my_core:
            # 铁律：可以由三和弦平滑过渡为七和弦，但七/九和弦绝对不能退化回三和弦
            if is_seventh_family and not any(x in k for x in ["₇", "₅₆", "₃₄", "₂", "₉"]):
                continue
            siblings.add(k)
            
    return list(siblings)

def get_chord_candidates(chord_name, dna_db, target_s=None, target_b=None):
    dna = dna_db[chord_name]
    required_classes = dna["required"]
    max_counts = dna.get("max_counts", {})
    
    candidates = []
    
    # 🌟 新增：如果当前是低音题模式，强制筛选符合当前和弦低音要求的特定八度
    if target_b is not None:
        valid_bass_pcs = {b % 12 for b in dna["bass_options"]}
        if (target_b % 12) not in valid_bass_pcs: 
            return [] # 当前低音与和弦转位要求冲突，直接否决
        bass_candidates = [target_b]
    else:
        bass_candidates = dna["bass_options"]

    for new_bass in bass_candidates:
        if target_s is not None:
            new_S = target_s
            lower_bound_A = new_S - 12
            valid_A = [a for a in AVAILABLE_NOTES if lower_bound_A <= a <= new_S]
            for new_A in valid_A:
                lower_bound_T = new_A - 12
                valid_T = [t for t in AVAILABLE_NOTES if lower_bound_T <= t <= new_A and t >= new_bass]
                for new_T in valid_T:
                    all_pcs = [new_S % 12, new_A % 12, new_T % 12, new_bass % 12]
                    if set(all_pcs) != required_classes: continue
                    
                    fail_max_counts = False
                    for pc, max_allowed in max_counts.items():
                        if all_pcs.count(pc) > max_allowed:
                            fail_max_counts = True
                            break
                    if not fail_max_counts:
                        candidates.append({'S': new_S, 'A': new_A, 'T': new_T, 'B': new_bass})
        else:
            # 🚀 当目标为低音或自由模式时，从合法的物理距离内自由生成上方三声部
            for new_S in AVAILABLE_NOTES:
                if new_S <= new_bass: continue
                for new_A in range(max(new_S - 12, new_bass), new_S + 1):
                    for new_T in range(max(new_A - 12, new_bass), new_A + 1):
                        all_pcs = [new_S % 12, new_A % 12, new_T % 12, new_bass % 12]
                        if set(all_pcs) != required_classes: continue
                        
                        fail_max_counts = False
                        for pc, max_allowed in max_counts.items():
                            if all_pcs.count(pc) > max_allowed:
                                fail_max_counts = True
                                break
                        if not fail_max_counts:
                            candidates.append({'S': new_S, 'A': new_A, 'T': new_T, 'B': new_bass})
    return candidates

def build_full_dag(target_melody, dna_db, key_info):
    mode = key_info.get("app_mode")
    layers = []
    start_candidates = ["T", "T₆", "D", "D₆", "S", "S₆", "D₇", "t", "t₆", "s", "s₆"] 
    
    current_layer = {}
    for c in start_candidates:
        if c not in dna_db: continue
        tgt_note = target_melody[0]
        target_s = tgt_note if mode == "SOPRANO" else None
        target_b = tgt_note if mode == "BASS" else None
        for v in get_chord_candidates(c, dna_db, target_s=target_s, target_b=target_b):
            current_layer[(c, v_to_tuple(v))] = {'next': set(), 'prev': set()}
            
    if not current_layer:
        for c in dna_db.keys():
            tgt_note = target_melody[0]
            target_s = tgt_note if mode == "SOPRANO" else None
            target_b = tgt_note if mode == "BASS" else None
            for v in get_chord_candidates(c, dna_db, target_s=target_s, target_b=target_b):
                current_layer[(c, v_to_tuple(v))] = {'next': set(), 'prev': set()}
                
    layers.append(current_layer)

    for i in range(1, len(target_melody)):
        next_layer = {}
        tgt_note = target_melody[i]
        target_s = tgt_note if mode == "SOPRANO" else None
        target_b = tgt_note if mode == "BASS" else None

        all_possible_next_chords = set()
        for (c_name, _), _ in layers[-1].items():
            for nxt in dna_db.get(c_name, {}).get("next", []):
                all_possible_next_chords.add(nxt)
                all_possible_next_chords.update(get_chord_siblings(nxt, dna_db))
            all_possible_next_chords.update(get_chord_siblings(c_name, dna_db))

        cand_cache = {}
        for nxt_c in all_possible_next_chords:
            if nxt_c in dna_db:
                cand_cache[nxt_c] = get_chord_candidates(nxt_c, dna_db, target_s=target_s, target_b=target_b)

        for (c_name, v_tup), node_data in layers[-1].items():
            possible_nexts = set()
            for nxt in dna_db.get(c_name, {}).get("next", []):
                possible_nexts.add(nxt)
                possible_nexts.update(get_chord_siblings(nxt, dna_db))
            possible_nexts.update(get_chord_siblings(c_name, dna_db))

            for nxt_c in possible_nexts:
                if nxt_c not in dna_db: continue
                for nxt_v in cand_cache.get(nxt_c, []):
                    if evaluate_voicing(tuple_to_v(v_tup), nxt_v, c_name, nxt_c, key_info) < 999999:
                        nxt_state = (nxt_c, v_to_tuple(nxt_v))
                        if nxt_state not in next_layer:
                            next_layer[nxt_state] = {'next': set(), 'prev': set()}
                        next_layer[nxt_state]['prev'].add((c_name, v_tup))
                        node_data['next'].add(nxt_state)

        layers.append(next_layer)
        if not next_layer:
            prev_layer = layers[-2]  
            fallback_cands = {}
            for nxt_c in dna_db:
                fallback_cands[nxt_c] = get_chord_candidates(nxt_c, dna_db, target_s=target_s, target_b=target_b)
            for (c_name, v_tup), node_data in prev_layer.items():
                for nxt_c in dna_db:
                    if nxt_c not in dna_db: continue
                    for nxt_v in fallback_cands.get(nxt_c, []):
                        if evaluate_voicing(tuple_to_v(v_tup), nxt_v, c_name, nxt_c, key_info) < 999999:
                            nxt_state = (nxt_c, v_to_tuple(nxt_v))
                            if nxt_state not in next_layer:
                                next_layer[nxt_state] = {'next': set(), 'prev': set()}
                            next_layer[nxt_state]['prev'].add((c_name, v_tup))
                            node_data['next'].add(nxt_state)
            if not next_layer:
                return None
            layers.pop()
            layers.append(next_layer)

    valid_final_chords = {"T", "T不完全", "T双三", "t", "t不完全"}
    invalid_finals = [state for state in layers[-1].keys() if state[0] not in valid_final_chords]
    
    for inv_state in invalid_finals:
        if len(layers) > 1:
            for prev_state in layers[-1][inv_state]['prev']:
                layers[-2][prev_state]['next'].discard(inv_state)
        del layers[-1][inv_state]
        
    if not layers[-1]: return None

    for i in range(len(layers) - 1, 0, -1):
        dead_states = [state for state, data in layers[i].items() if i != len(layers)-1 and not data['next']]
        for dead in dead_states:
            for prev_state in layers[i][dead]['prev']:
                layers[i-1][prev_state]['next'].discard(dead)
            del layers[i][dead]

    dead_starts = [state for state, data in layers[0].items() if len(layers) > 1 and not data['next']]
    for dead in dead_starts:
        del layers[0][dead]
        
    if not layers[0]: return None
    return layers

def calculate_best_voicing(chord_sequence, initial_voicing, dna_db, key_info, target_melody=None):
    mode = key_info.get("app_mode")
    first_chord = chord_sequence[0]
    first_tgt = target_melody[0] if target_melody and len(target_melody) > 0 else None
    
    target_s = first_tgt if mode == "SOPRANO" else None
    target_b = first_tgt if mode == "BASS" else None
    
    # 🌟 2. 重新生成第一个和弦的所有可能排列，彻底打开平行宇宙！
    first_cands = get_chord_candidates(first_chord, dna_db, target_s=target_s, target_b=target_b)
    if not first_cands: return None
    
    # 🌟 3. 引入初始基准分：防止开放起点后，引擎为了省 1 分而在八度间乱窜
    shift = key_info.get("shift", 0)
    v_shift = shift if shift <= 3 else shift - 12
    ideal_S, ideal_A, ideal_T, ideal_B = 72 + v_shift, 65 + v_shift, 60 + v_shift, 48 + v_shift
    score_initial = lambda v: abs(v['S']-ideal_S)*1.5 + abs(v['A']-ideal_A) + abs(v['T']-ideal_T) + abs(v['B']-ideal_B)
    
    dp = [{}]
    for v in first_cands:
        init_score = score_initial(v)
        dp[0][(first_chord, v_to_tuple(v))] = (init_score, None)
    
    for i in range(1, len(chord_sequence)):
        current_chord = chord_sequence[i]
        prev_chord = chord_sequence[i-1]
        next_layer = {}
        
        tgt_note = target_melody[i] if target_melody and i < len(target_melody) else None
        target_s = tgt_note if mode == "SOPRANO" else None
        target_b = tgt_note if mode == "BASS" else None
        
        candidates = get_chord_candidates(current_chord, dna_db, target_s=target_s, target_b=target_b)
        
        for (prev_c, prev_v_tup), (prev_cost, _) in dp[-1].items():
            for curr_v in candidates:
                cost = evaluate_voicing(tuple_to_v(prev_v_tup), curr_v, prev_c, current_chord, key_info)
                if cost < 999999:
                    total_cost = prev_cost + cost
                    curr_state = (current_chord, v_to_tuple(curr_v))
                    if curr_state not in next_layer or total_cost < next_layer[curr_state][0]:
                        next_layer[curr_state] = (total_cost, (prev_c, prev_v_tup))
        if not next_layer: return None
        
        # 🚀 提速点：Beam Search 精英保留机制，防止 DP 状态组合爆炸
        BEAM_WIDTH = 120  # 束宽：数值越小越快，数值越大越能防死胡同。120 是个绝佳的平衡点
        if len(next_layer) > BEAM_WIDTH:
            # 只保留 total_cost 最低的 BEAM_WIDTH 个状态继续往后推演
            sorted_states = sorted(next_layer.items(), key=lambda item: item[1][0])
            next_layer = dict(sorted_states[:BEAM_WIDTH])
            
        dp.append(next_layer)
        
    best_final_state = min(dp[-1].items(), key=lambda x: x[1][0])[0]
    
    path = []
    curr_state = best_final_state
    for i in range(len(chord_sequence)-1, -1, -1):
        path.append(tuple_to_v(curr_state[1]))
        curr_state = dp[i][curr_state][1]
        
    path.reverse()
    return path