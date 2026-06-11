# app.py
import secrets
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional
from starlette.middleware.base import BaseHTTPMiddleware

from tonality import KEY_REGISTRY, transpose_dna, spell_midi
from dna import MAJOR_DNA, MINOR_DNA, PITCH_Y
from engine import build_full_dag, calculate_best_voicing, get_chord_candidates, get_chord_siblings, tuple_to_v, v_to_tuple
from rules import evaluate_voicing

app = FastAPI(title="Sposobin Harmony Engine V1.1 Pro")

# [管理看板] 核心指标内存计数器
SERVER_METRICS = {
    "total_requests": 0,
    "bytes_ingress": 0,    # 上行流量
    "bytes_egress": 0,     # 下行流量
    "unique_ips": set()    # 独立使用人数
}

# 🌟 统一收集断链死胡同与错题上报池
GLOBAL_ISSUES_POOL = []

# [流量监控中间件] 拦截所有流量进行精准测算
class TrafficMonitorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        SERVER_METRICS["unique_ips"].add(client_ip)
        SERVER_METRICS["total_requests"] += 1

        content_length_in = request.headers.get("content-length")
        if content_length_in:
            SERVER_METRICS["bytes_ingress"] += int(content_length_in)
        
        response = await call_next(request)

        content_length_out = response.headers.get("content-length")
        if content_length_out:
            SERVER_METRICS["bytes_egress"] += int(content_length_out)
            
        return response

app.add_middleware(TrafficMonitorMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=200)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# [安全校验] 管理员账号密码保护
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "SposobinSecure2026"  

security = HTTPBasic()

def authenticate_admin(credentials: HTTPBasicCredentials = Depends(security)):
    is_user_ok = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    is_pass_ok = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (is_user_ok and is_pass_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="⚠️ 越权访问：管理员凭证错误！",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

def format_bytes(b: int) -> str:
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if b < 1024:
            return f"{b:.2f} {unit}"
        b /= 1024
    return f"{b:.2f} PB"

# 🌟 新增：提报信息数据模型
class IssueReportRequest(BaseModel):
    mode: str
    key_name: str
    target_melody: List[int]
    history: List[dict]
    source_info: str

# 🌟 新增：接收用户错题上报 API 接口
@app.post("/api/submit_issue")
def submit_issue(req: IssueReportRequest):
    history_path = " -> ".join([item["chord"] for item in req.history]) if req.history else "无(第一步断链)"
    melody_str = ", ".join(map(str, req.target_melody)) if req.target_melody else "未录入"
    
    GLOBAL_ISSUES_POOL.append({
        "mode": req.mode,
        "key_name": req.key_name,
        "melody": melody_str,
        "history": history_path,
        "source": req.source_info
    })
    return {"status": "success", "message": "已成功记录至云端监控面板"}

# [管理监控后台看板视图] 整合错题明细展现
@app.get("/admin", response_class=HTMLResponse)
def get_admin_dashboard(username: str = Depends(authenticate_admin)):
    total_users = len(SERVER_METRICS["unique_ips"])
    total_reqs = SERVER_METRICS["total_requests"]
    traffic_in = format_bytes(SERVER_METRICS["bytes_ingress"])
    traffic_out = format_bytes(SERVER_METRICS["bytes_egress"])
    
    # 动态组装错题数据 HTML 表格行
    table_rows = ""
    if not GLOBAL_ISSUES_POOL:
        table_rows = """<tr><td colspan="4" class="p-4 text-center text-slate-500 italic">🎉 暂无用户提报断链死胡同或教材错题</td></tr>"""
    else:
        for idx, issue in enumerate(reversed(GLOBAL_ISSUES_POOL)):
            bg_cls = "bg-slate-900/40" if idx % 2 == 0 else "bg-slate-800/40"
            table_rows += f"""
            <tr class="{bg_cls} border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <td class="p-3 font-medium text-sky-400 font-mono text-xs">{issue['mode']}<br><span class='text-slate-400'>{issue['key_name']}</span></td>
                <td class="p-3 text-xs font-mono max-w-xs truncate text-slate-300" title="{issue['melody']}">{issue['melody']}</td>
                <td class="p-3 text-xs font-serif text-rose-300">{issue['history']}</td>
                <td class="p-3 text-sm font-semibold text-amber-400">{issue['source']}</td>
            </tr>
            """

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="5">
        <title>Sposobin 引擎监控后台</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-900 text-slate-100 font-sans min-h-screen p-6 flex flex-col items-center">
        <div class="max-w-5xl w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
            <div class="flex justify-between items-center border-b border-slate-700 pb-6 mb-8">
                <div>
                    <h1 class="text-2xl font-bold text-sky-400">Sposobin Engine 核心云端控制台</h1>
                    <p class="text-slate-400 text-sm mt-1">当前身份: <span class="text-emerald-400 font-mono">{username}</span> (系统管理员)</p>
                </div>
                <div class="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-xs font-mono text-slate-400">实时监控中 (5s 自刷新)</span>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
                    <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider">独立人数 (IP)</div>
                    <div class="text-2xl font-extrabold text-white mt-1 font-mono">{total_users}</div>
                </div>
                <div class="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
                    <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider">交互请求频次</div>
                    <div class="text-2xl font-extrabold text-white mt-1 font-mono">{total_reqs}</div>
                </div>
                <div class="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
                    <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider">吞吐流量 (In)</div>
                    <div class="text-2xl font-extrabold text-white mt-1 font-mono">{traffic_in}</div>
                </div>
                <div class="bg-slate-900 p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950/20">
                    <div class="text-emerald-400 text-xs font-semibold uppercase tracking-wider">💸 计费下行 (Out)</div>
                    <div class="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{traffic_out}</div>
                </div>
            </div>

            <div class="bg-slate-900 rounded-xl border border-slate-700/60 overflow-hidden">
                <div class="p-4 bg-slate-800/60 border-b border-slate-700 flex justify-between items-center">
                    <h2 class="text-base font-bold text-rose-400 flex items-center gap-2">⚠️ 传统和声死胡同与错题问题提报池</h2>
                    <span class="text-xs bg-rose-500/20 text-rose-400 font-mono px-2 py-0.5 rounded-full">累计收录: {len(GLOBAL_ISSUES_POOL)} 条</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-800 text-slate-400 uppercase tracking-wider border-b border-slate-700">
                                <th class="p-3 w-32">工作模式/调性</th>
                                <th class="p-3 max-w-xs">高音旋律线 (MIDI 序列)</th>
                                <th class="p-3">断裂前历史级进路径</th>
                                <th class="p-3 text-amber-400">教材章节与错题出处</th>
                            </tr>
                        </thead>
                        <tbody>
                            {table_rows}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="mt-8 pt-4 border-t border-slate-700/50 text-center text-xs text-slate-500">
                和声算法内核强力驱动 © 2026 Sposobin Web Node. 密码保护审计区。
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


class EngineRequest(BaseModel):
    mode: str 
    key_name: str
    target_melody: List[int]
    history: List[dict]
    pending_note: Optional[int] = None
    action_chord: Optional[str] = None


# ==========================================
# 🌟 新增：和弦家族自动映射表 (语义 -> 物理)
# ==========================================
CHORD_FAMILIES = {
    "T": ["T", "T不完全", "T双三"],
    "t": ["t", "t不完全"],
    "D₇": ["D₇", "D₇不完全"]
}

def get_base_chord(chord_name):
    """将底层的变体和弦（如 T不完全）折叠回显示用的基础和弦（如 T）"""
    for base, variants in CHORD_FAMILIES.items():
        if chord_name in variants:
            return base
    return chord_name

# 全局 DAG 缓存池
GLOBAL_DAG_CACHE = {}

def get_cached_dag(key_name, target_melody, active_dna_db, key_info):
    if not target_melody: return None
    cache_key = f"{key_name}_{','.join(map(str, target_melody))}"
    if cache_key in GLOBAL_DAG_CACHE: return GLOBAL_DAG_CACHE[cache_key]
    dag = build_full_dag(target_melody, active_dna_db, key_info)
    if len(GLOBAL_DAG_CACHE) > 50: GLOBAL_DAG_CACHE.pop(next(iter(GLOBAL_DAG_CACHE)))
    GLOBAL_DAG_CACHE[cache_key] = dag
    return dag

def format_chord_name(name):
    # 彻底抹除底层结构后缀，让五线谱上的和弦标记保持纯粹的学术审美
    clean_name = name.replace("♮⁵", "").replace("♭⁵", "").replace("不完全", "").replace("双三", "")
    base_name = clean_name.split('/')[0] if '/' in clean_name else clean_name
    suffix = "/" + clean_name.split('/')[1] if '/' in clean_name else ""
    core = base_name
    if "♭⁵" in name or ("♭" in base_name and "VI" not in base_name): 
        core += "♭5" if "♭⁵" in name else "♭"
    elif "♮⁵" in name: 
        core += "♮5"
    return core + suffix

def get_render_data(history, key_info, target_melody, pending_note):
    render_nodes = []
    sig_count = key_info["sigs"]
    sig_type = key_info["sig_type"]
    sigs = []
    if sig_count > 0 and sig_type != "none":
        positions = {"sharp": {"treble": [40, 55, 35, 50, 65, 45, 60], "bass": [180, 195, 175, 190, 205, 185, 200]},
                     "flat":  {"treble": [60, 45, 65, 50, 70, 55, 75], "bass": [200, 185, 205, 190, 210, 195, 215]}}
        for i in range(sig_count): sigs.append({"sym": "♯" if sig_type == "sharp" else "♭", "t_y": positions[sig_type]["treble"][i], "b_y": positions[sig_type]["bass"][i]})

    key_sig_alts = {s: 0 for s in range(7)}
    if sig_type == "sharp":
        for i in range(sig_count): key_sig_alts[[3, 0, 4, 1, 5, 2, 6][i]] = 1
    elif sig_type == "flat":
        for i in range(sig_count): key_sig_alts[[6, 2, 5, 1, 4, 0, 3][i]] = -1
    running_accidentals = {}

    for index, item in enumerate(history):
        chord = item["chord"]
        voices = item["voices"]
        node = {"type": "history", "chord_display": format_chord_name(chord), "notes": [], "original_index": index} 
        
        y_positions = {}
        for v_name, is_bass in [('S', False), ('A', False), ('T', True), ('B', True)]:
            midi = voices[v_name]
            letter, abs_step, abs_alt, octave = spell_midi(midi, key_info, chord)
            y_positions[v_name] = PITCH_Y.get(f"{letter}{octave}" + ("_bass" if is_bass else ""))

        drawn_accidentals = {}
        for v_name, is_bass in [('S', False), ('A', False), ('T', True), ('B', True)]:
            midi = voices[v_name]
            letter, abs_step, abs_alt, octave = spell_midi(midi, key_info, chord)
            y = y_positions[v_name]
            if y is None: continue
            acc_key = (1 if is_bass else 0, octave, abs_step)
            curr_alt = running_accidentals.get(acc_key, key_sig_alts[abs_step])
            if abs_alt != curr_alt: drawn_accidentals[v_name] = (y, abs_alt, acc_key)

        for v_name, is_bass in [('S', False), ('A', False), ('T', True), ('B', True)]:
            y = y_positions[v_name]
            if y is None: continue

            is_shifted = False
            for other_voice, other_y in y_positions.items():
                if other_y is not None and other_voice != v_name and other_y - y == 5: 
                    is_shifted = True; break
            note_x = 13 if is_shifted else 0
            
            acc_str, acc_x = "", 0
            if v_name in drawn_accidentals:
                _, abs_alt, acc_key = drawn_accidentals[v_name]
                acc_str = {-2: "♭♭", -1: "♭", 0: "♮", 1: "♯", 2: "x"}.get(abs_alt, "")
                running_accidentals[acc_key] = abs_alt
                acc_x = -3 if is_shifted else (-28 if any(oy < y and y - oy <= 11 for ov, (oy, _, _) in drawn_accidentals.items() if ov != v_name) else -18)

            ledgers = []
            if not is_bass: ledgers = list(range(90, y+1, 10)) if y >= 90 else (list(range(30, y-1, -10)) if y <= 30 else [])
            else: ledgers = list(range(160, y-1, -10)) if y <= 160 else (list(range(220, y+1, 10)) if y >= 220 else [])

            node["notes"].append({"v": v_name, "y": y, "x": note_x, "acc": acc_str, "acc_x": acc_x, "ledgers": ledgers, "is_bass": is_bass})
        render_nodes.append(node)
        
    if pending_note is not None:
        letter, abs_step, abs_alt, octave = spell_midi(pending_note, key_info, "")
        y = PITCH_Y.get(f"{letter}{octave}", 90)
        ledgers = list(range(90, y+1, 10)) if y >= 90 else (list(range(30, y-1, -10)) if y <= 30 else [])
        render_nodes.append({"type": "pending", "chord_display": "?", "notes": [{"v": "S", "y": y, "x": 0, "acc": "", "acc_x": 0, "ledgers": ledgers, "is_bass": False}]})
        
    elif target_melody and key_info.get("app_mode") == "SOPRANO" and len(history) < len(target_melody):
        for i in range(len(history), len(target_melody)):
            letter, abs_step, abs_alt, octave = spell_midi(target_melody[i], key_info, "")
            y = PITCH_Y.get(f"{letter}{octave}", 90)
            ledgers = list(range(90, y+1, 10)) if y >= 90 else (list(range(30, y-1, -10)) if y <= 30 else [])
            render_nodes.append({"type": "target", "chord_display": "", "notes": [{"v": "S", "y": y, "x": 0, "acc": "", "acc_x": 0, "ledgers": ledgers, "is_bass": False}]})
            
    return {"sigs": sigs, "nodes": render_nodes}

@app.post("/api/sync_state")
def sync_state(req: EngineRequest):
    key_info = KEY_REGISTRY.get(req.key_name)
    key_info["app_mode"] = req.mode
    base_db = MAJOR_DNA if key_info["type"] == "MAJOR" else MINOR_DNA
    active_dna_db = transpose_dna(base_db, key_info["shift"])
    
    debug_msg = None 

    if req.action_chord:
        # 🌟 自动将用户传入的 "T" 展开为 ["T", "T不完全", "T双三"]
        target_chord_base = req.action_chord
        target_variants = CHORD_FAMILIES.get(target_chord_base, [target_chord_base])
        
        shift = key_info["shift"]
        v_shift = shift if shift <= 3 else shift - 12
        ideal_S, ideal_A, ideal_T, ideal_B = 72 + v_shift, 65 + v_shift, 60 + v_shift, 48 + v_shift
        score_initial = lambda v: abs(v['S']-ideal_S)*1.5 + abs(v['A']-ideal_A) + abs(v['T']-ideal_T) + abs(v['B']-ideal_B)

        if req.mode == "SOPRANO" and req.target_melody:
            dag_layers = get_cached_dag(req.key_name, req.target_melody, active_dna_db, key_info)
            if dag_layers:
                step = len(req.history)
                valid_states = []
                # 遍历所有物理变体，从 DAG 图中收集所有合法的连接可能
                for tc in target_variants:
                    if step == 0: 
                        valid_states.extend([s for s in dag_layers[0].keys() if s[0] == tc])
                    else:
                        last_h = req.history[-1]
                        state_data = dag_layers[step-1].get((last_h['chord'], v_to_tuple(last_h['voices'])))
                        if state_data:
                            valid_states.extend([s for s in state_data['next'] if s[0] == tc])
                if valid_states:
                    best_state = min(valid_states, key=lambda s: score_initial(tuple_to_v(s[1])))
                    req.history.append({"chord": best_state[0], "voices": tuple_to_v(best_state[1])})

        elif req.mode == "COMPOSE" and req.pending_note is not None:
            tgt_s = req.pending_note
            valid_states = []
            for tc in target_variants:
                if not req.history:
                    for v in get_chord_candidates(tc, active_dna_db, tgt_s): 
                        valid_states.append((tc, v_to_tuple(v)))
                else:
                    last_c, last_v = req.history[-1]["chord"], req.history[-1]["voices"]
                    for nxt_v in get_chord_candidates(tc, active_dna_db, tgt_s):
                        if evaluate_voicing(last_v, nxt_v, last_c, tc, key_info) < 999999: 
                            valid_states.append((tc, v_to_tuple(nxt_v)))
            if valid_states:
                best_state = min(valid_states, key=lambda s: score_initial(tuple_to_v(s[1])))
                req.history.append({"chord": best_state[0], "voices": tuple_to_v(best_state[1])})
                req.target_melody.append(tgt_s)
                req.pending_note = None

        elif req.mode == "FREE":
            if not req.history:
                valid_states = []
                for tc in target_variants:
                    cands = get_chord_candidates(tc, active_dna_db, None)
                    if cands:
                        best_v = min(cands, key=score_initial)
                        valid_states.append((tc, v_to_tuple(best_v)))
                if valid_states:
                    best_state = min(valid_states, key=lambda s: score_initial(tuple_to_v(s[1])))
                    req.history.append({"chord": best_state[0], "voices": tuple_to_v(best_state[1])})
            else:
                best_overall_path = None
                best_cost = 999999
                # 针对每一种变体计算一次动态规划，寻找整体惩罚值最低的完美路线
                for tc in target_variants:
                    chord_sequence = [item["chord"] for item in req.history] + [tc]
                    global_path = calculate_best_voicing(chord_sequence, req.history[0]["voices"], active_dna_db, key_info, None)
                    if global_path: 
                        last_c, last_v = req.history[-1]["chord"], req.history[-1]["voices"]
                        curr_v = global_path[-1]
                        cost = evaluate_voicing(last_v, curr_v, last_c, tc, key_info)
                        if cost < best_cost:
                            best_cost = cost
                            best_overall_path = (tc, global_path)
                if best_overall_path:
                    tc, global_path = best_overall_path
                    chord_sequence = [item["chord"] for item in req.history] + [tc]
                    req.history = [{"chord": c, "voices": v} for c, v in zip(chord_sequence, global_path)]

    next_chords = []
    is_completed = False
    
    if req.mode == "SOPRANO" and req.target_melody:
        if len(req.history) == len(req.target_melody):
            is_completed = True
            
        dag = get_cached_dag(req.key_name, req.target_melody, active_dna_db, key_info)
        if not dag or len(dag) < len(req.target_melody):
            logs = []
            logs.append("=== 启动 DAG 连通性诊断探针 ===")
            logs.append(f"调性: {key_info['type']} / 根音偏移: {key_info['shift']}")
            logs.append(f"目标序列 (MIDI): {req.target_melody}")
            logs.append("-" * 50)
            
            current_layer = {}
            start_index = 0
            if not req.history:
                start_chord = "T" if key_info["type"] == "MAJOR" else "t"
                cands = get_chord_candidates(start_chord, active_dna_db, req.target_melody[0])
                for v in cands: current_layer[(start_chord, v_to_tuple(v))] = {start_chord}
                logs.append(f"[节点 0] 目标 MIDI={req.target_melody[0]}, 初始 '{start_chord}' 合法状态数: {len(current_layer)}")
            else:
                last_h = req.history[-1]
                start_index = len(req.history)
                current_layer[(last_h["chord"], v_to_tuple(last_h["voices"]))] = {last_h["chord"]}
                logs.append(f"基于已有状态集，从第 {start_index} 个节点继续推演...")

            for i in range(start_index + 1 if req.history else 1, len(req.target_melody)):
                next_layer = {}
                tgt_s = req.target_melody[i]
                all_possible_nexts = set()
                for c_name, _ in current_layer.keys():
                    all_possible_nexts.update(active_dna_db.get(c_name, {}).get("next", []))
                cand_cache = {}
                for nxt_chord in all_possible_nexts:
                    if nxt_chord in active_dna_db: cand_cache[nxt_chord] = get_chord_candidates(nxt_chord, active_dna_db, tgt_s)
                for (c_name, v_tup), _ in current_layer.items():
                    possible_nexts = active_dna_db.get(c_name, {}).get("next", [])
                    for nxt_chord in possible_nexts:
                        if nxt_chord not in active_dna_db: continue
                        for nxt_v in cand_cache.get(nxt_chord, []):
                            if evaluate_voicing(tuple_to_v(v_tup), nxt_v, c_name, nxt_chord, key_info) < 999999: 
                                next_layer[(nxt_chord, v_to_tuple(nxt_v))] = True
                logs.append(f"[节点 {i}] 目标 MIDI={tgt_s}, 存活的合法连接状态数: {len(next_layer)}")
                if not next_layer:
                    logs.append("-" * 50)
                    logs.append(f"❌ 连通性异常：路径已断开")
                    logs.append(f"中断点: 节点 {i} (目标 MIDI: {tgt_s})")
                    logs.append(f"在上一个节点 (MIDI: {req.target_melody[i-1]}) 时，可用的合法配置包含：")
                    surviving_chords = {}
                    for c_name, _ in current_layer.keys(): surviving_chords[c_name] = surviving_chords.get(c_name, 0) + 1
                    for c, count in surviving_chords.items(): logs.append(f" - {c}: {count} 个有效声部排列")
                    break
                current_layer = next_layer
            debug_msg = "\n".join(logs)
        else:
            if not req.history: next_chords = list(set([s[0] for s in dag[0].keys()]))
            elif len(req.history) < len(req.target_melody):
                last_item = req.history[-1]
                state_data = dag[len(req.history)-1].get((last_item['chord'], v_to_tuple(last_item['voices'])))
                if state_data: next_chords = list(set([s[0] for s in state_data['next']]))

    elif not req.history:
        if req.mode == "COMPOSE" and req.pending_note is not None:
            for c_name in active_dna_db.keys():
                if get_chord_candidates(c_name, active_dna_db, req.pending_note): next_chords.append(c_name)
        elif req.mode == "FREE": 
            next_chords = list(active_dna_db.keys())
    else:
        last_item = req.history[-1]
        
        # 🌟 修复后的核心处理逻辑，包含全模式的同和弦转换支持 🌟
        if req.mode == "COMPOSE":
            if req.pending_note is not None:
                last_c, last_v = last_item["chord"], last_item["voices"]
                possible_nexts = set()
                # 提取 DNA 定义中的 next 及它们的衍生兄弟
                for nxt in active_dna_db.get(last_c, {}).get("next", []):
                    possible_nexts.add(nxt)
                    possible_nexts.update(get_chord_siblings(nxt, active_dna_db))
                
                # 追加自身和弦的兄弟，支持同功能/同和弦内部转换
                possible_nexts.update(get_chord_siblings(last_c, active_dna_db))
                
                for nxt_c in possible_nexts:
                    if nxt_c in active_dna_db:
                        for nxt_v in get_chord_candidates(nxt_c, active_dna_db, req.pending_note):
                            if evaluate_voicing(last_v, nxt_v, last_c, nxt_c, key_info) < 999999:
                                next_chords.append(nxt_c); break
                                
        elif req.mode == "FREE":
            last_c, last_v = last_item["chord"], last_item["voices"]
            possible_nexts = set()
            # 提取 DNA 定义中的 next 及它们的衍生兄弟
            for nxt in active_dna_db.get(last_c, {}).get("next", []):
                possible_nexts.add(nxt)
                possible_nexts.update(get_chord_siblings(nxt, active_dna_db))
                
            # 追加自身和弦的兄弟，支持同功能/同和弦内部转换
            possible_nexts.update(get_chord_siblings(last_c, active_dna_db))
            
            for nxt_c in possible_nexts:
                if nxt_c in active_dna_db:
                    for nxt_v in get_chord_candidates(nxt_c, active_dna_db, None):
                        if evaluate_voicing(last_v, nxt_v, last_c, nxt_c, key_info) < 999999:
                            next_chords.append(nxt_c); break

    # 🌟 智能合并：将引擎深层推演出的变体名称，全数洗净折叠回大类！
    folded_next_chords = set()
    for chord in next_chords:
        folded_next_chords.add(get_base_chord(chord))
    next_chords = list(folded_next_chords)

    is_dead_end = False
    if len(req.history) > 0 and not is_completed and not debug_msg:
        if req.mode != "COMPOSE" and not next_chords:
            is_dead_end = True
        elif req.mode == "COMPOSE" and req.pending_note is not None and not next_chords:
            is_dead_end = True

    if is_dead_end:
        debug_msg = "⚠️ 死胡同警告：当前的声部排列导致前方无路可走！\n\n【诊断信息】\n引擎已经穷尽了所有合法的和声连接，但在严格遵守声部进行法则的前提下，无法找到下一步的合法排列。\n\n👉 建议：直接点击乐谱上历史节点进行【状态回退】！"

    diatonic = {
        "主功能组 (T / t / DT)": [], 
        "下属功能组 (S / s / VI)": [], 
        "变和弦组 (N / +6)": [], 
        "属功能组 (D / K / VII)": [], 
        "导功能组 (Dᵥᵢᵢ)": [], 
        "重属功能组 (DD)": [],
        "特殊变音与扩展和弦 (Others)": []
    }
    tonicization = {}
    
    for chord in next_chords:
        if "/" in chord and not chord.startswith(("It", "Ger", "Fr")):
            target_deg = chord.split('/')[1]
            if chord.startswith(("D", "Dᵥᵢᵢ")):
                cat = f"副属和弦 (至 {target_deg} 级)"
                if cat not in tonicization: tonicization[cat] = []
                tonicization[cat].append(chord)
            elif chord.startswith(("S", "s", "Sᵢᵢ", "sᵢᵢ")):
                cat = f"副下属和弦 (至 {target_deg} 级)"
                if cat not in tonicization: tonicization[cat] = []
                tonicization[cat].append(chord)
        else:
            if chord.startswith(("N", "It", "Ger", "Fr")): diatonic["变和弦组 (N / +6)"].append(chord)
            elif chord.startswith("DD"): diatonic["重属功能组 (DD)"].append(chord)
            elif chord.startswith("Dᵥᵢᵢ"): diatonic["导功能组 (Dᵥᵢᵢ)"] .append(chord)
            elif chord.startswith(("T", "t", "DT")): diatonic["主功能组 (T / t / DT)"].append(chord)
            elif chord.startswith(("S", "s", "VI", "♭VI", "sᵢᵢ", "Sᵢᵢ")): diatonic["下属功能组 (S / s / VI)"].append(chord)
            elif chord.startswith(("D", "K", "VII", "♭VII")): diatonic["属功能组 (D / K / VII)"].append(chord)
            else: diatonic["特殊变音与扩展和弦 (Others)"].append(chord)

    return {
        "mode": req.mode,
        "key_name": req.key_name,
        "history": req.history,
        "target_melody": req.target_melody,
        "pending_note": req.pending_note, 
        "renderData": get_render_data(req.history, key_info, req.target_melody, req.pending_note),
        "categories": {"diatonic": {k: v for k, v in diatonic.items() if v}, "tonicization": tonicization},
        "debug_message": debug_msg,
        "is_completed": is_completed 
    }