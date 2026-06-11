# renderer.py
from dna import PITCH_Y
from tonality import spell_midi, KEY_SIG_POSITIONS

class ScoreRenderer:
    def __init__(self, canvas):
        self.canvas = canvas

    def render_academic_layout(self, target_canvas, x, y, name, color="#E74C3C", font_size_core=16, font_size_sub=9):
        clean_name = name.replace("♮⁵", "").replace("♭⁵", "")
        base_name = clean_name.split('/')[0] if '/' in clean_name else clean_name
        suffix = "/" + clean_name.split('/')[1] if '/' in clean_name else ""

        core, sub = "", ""
        if "不完全" in base_name: 
            core_str = base_name.replace("不完全", "").replace("₇", "").replace("₉", "")
            core = core_str + "ᵢₙᶜ"
        elif "双三" in base_name: core = "Tᵈᵘᵃˡ"
        elif base_name.startswith("DD"): core = "DD"
        elif base_name.startswith("DT"): core = "DT"
        elif base_name.startswith("S"): core = "S"
        elif base_name.startswith("s"): core = "s"
        elif base_name.startswith("D"): core = "D"
        elif base_name.startswith("K"): core = "K"
        elif base_name.startswith("VII"): core = "VII"
        elif base_name.startswith("VI"): core = "VI"
        elif base_name.startswith("♭VI"): core = "♭VI"
        elif base_name.startswith("T"): core = "T"
        elif base_name.startswith("t"): core = "t"
        elif base_name.startswith("N"): core = "N"
        elif base_name.startswith("It"): core = "It"
        elif base_name.startswith("Ger"): core = "Ger"
        elif base_name.startswith("Fr"): core = "Fr"
        else: core = base_name

        if "ᵥᵢᵢ" in base_name: sub = "VII"
        elif "ᵢᵢᵢ" in base_name: sub = "III"
        elif "ᵢᵢ" in base_name: sub = "II"

        f_style = ("Times New Roman", font_size_core, "bold", "italic") if core in ["t", "s"] else ("Times New Roman", font_size_core, "bold")

        id_core = target_canvas.create_text(x - 12, y, text=core, font=f_style, fill=color, anchor="center")
        right_edge = target_canvas.bbox(id_core)[2]

        right_of_sub = right_edge
        if sub:
            id_sub = target_canvas.create_text(right_edge + 1, y + 4, text=sub, font=("Times New Roman", font_size_sub, "bold"), fill=color, anchor="nw")
            right_of_sub = target_canvas.bbox(id_sub)[2] 

        target_x = right_of_sub + 2 if sub else right_edge + 1
        f_size = font_size_sub - 1
        max_right = target_x

        def draw_script(txt, y_off):
            nonlocal max_right
            i = target_canvas.create_text(target_x, y + y_off, text=txt, font=("Times New Roman", f_size, "bold"), fill=color, anchor="nw")
            max_right = max(max_right, target_canvas.bbox(i)[2])

        if "⁺⁶" in base_name: draw_script("+6", -8)
        elif "₆₄" in base_name: draw_script("6", -8); draw_script("4", 1)
        elif "₅₆" in base_name: draw_script("5", -8); draw_script("6", 1)
        elif "₃₄" in base_name: draw_script("3", -8); draw_script("4", 1)
        elif "₆" in base_name or "⁶" in base_name: draw_script("6", -6)
        elif "₇" in base_name: draw_script("7", -6)
        elif "₉" in base_name: draw_script("9", -6)
        elif "₂" in base_name: draw_script("2", 1)

        if "♭⁵" in name or "♭" in base_name and "VI" not in base_name:
            flat_x = max_right + 2
            id_flat = target_canvas.create_text(flat_x, y - 7, text="♭5" if "♭⁵" in name else "♭", font=("Segoe UI Symbol", f_size, "bold"), fill=color, anchor="nw")
            max_right = max(max_right, target_canvas.bbox(id_flat)[2])
        elif "♮⁵" in name:
            nat_x = max_right + 2
            id_nat = target_canvas.create_text(nat_x, y - 7, text="♮5", font=("Segoe UI Symbol", f_size, "bold"), fill=color, anchor="nw")
            max_right = max(max_right, target_canvas.bbox(id_nat)[2])

        if suffix:
            target_canvas.create_text(max_right + 2, y, text=suffix, font=("Times New Roman", font_size_core - 4, "bold"), fill=color, anchor="w")

    def draw_key_signature(self, key_info):
        sig_count = key_info["sigs"]
        sig_type = key_info["sig_type"]
        if sig_count == 0 or sig_type == "none": return
        
        symbol = "♯" if sig_type == "sharp" else "♭"
        y_offset = 0 if sig_type == "sharp" else -9 
        
        for i in range(sig_count):
            x = 75 + i * 12
            treble_y = KEY_SIG_POSITIONS[sig_type]["treble"][i]
            bass_y = KEY_SIG_POSITIONS[sig_type]["bass"][i]
            self.canvas.create_text(x, treble_y + y_offset, text=symbol, font=("Segoe UI Symbol", 18, "bold"), fill="#2C3E50", anchor="center")
            self.canvas.create_text(x, bass_y + y_offset, text=symbol, font=("Segoe UI Symbol", 18, "bold"), fill="#2C3E50", anchor="center")

    def draw_entire_score(self, history, key_info, target_melody=None, playback_index=None, pending_note=None):
        self.canvas.delete("all")
        
        spacing = 85
        start_x = 95 + key_info["sigs"] * 12
        total_steps = max(len(history) + (1 if pending_note else 0), len(target_melody) if target_melody else 0)
        max_x = start_x + total_steps * spacing + 100
        
        self.canvas.update_idletasks()
        cw = self.canvas.winfo_width()
        if cw < 10: cw = 900
        canvas_width = max(cw, max_x)
        
        # 🌟 更新内部滚动区域的高度
        self.canvas.config(scrollregion=(0, 0, canvas_width, 270))

        # 🌟 重新布局五线谱线：低音谱表下移 50 像素，加大间距
        for i in range(5):
            self.canvas.create_line(50, 40 + i * 10, canvas_width, 40 + i * 10, fill="#6C757D")
            self.canvas.create_line(50, 170 + i * 10, canvas_width, 170 + i * 10, fill="#6C757D")
        
        # 🌟 左侧/右侧的贯通连接线相应拉长
        self.canvas.create_line(50, 40, 50, 210, fill="#6C757D", width=2)
        self.canvas.create_line(canvas_width-5, 40, canvas_width-5, 210, fill="#6C757D", width=2)
        
        # 🌟 谱号定位下移
        self.canvas.create_text(35, 68, text="𝄞", font=("Segoe UI Symbol", 42), fill="#6C757D")
        self.canvas.create_text(35, 184, text="𝄢", font=("Segoe UI Symbol", 38), fill="#6C757D")

        self.draw_key_signature(key_info)

        key_sig_alts = {s: 0 for s in range(7)}
        SHARPS_ORDER = [3, 0, 4, 1, 5, 2, 6] 
        FLATS_ORDER = [6, 2, 5, 1, 4, 0, 3]  
        if key_info["sig_type"] == "sharp":
            for i in range(key_info["sigs"]): key_sig_alts[SHARPS_ORDER[i]] = 1
        elif key_info["sig_type"] == "flat":
            for i in range(key_info["sigs"]): key_sig_alts[FLATS_ORDER[i]] = -1
            
        running_accidentals = {}

        for index, item in enumerate(history):
            x = start_x + index * spacing
            chord_name = item["chord"]
            voices = item["voices"]
            
            theme_color = "#E74C3C" if key_info["type"] == "MAJOR" else "#8E44AD"
            self.render_academic_layout(self.canvas, x, 25, chord_name, color=theme_color, font_size_core=16, font_size_sub=9)
            
            notes_to_draw = [('S', voices['S'], False), ('A', voices['A'], False), ('T', voices['T'], True), ('B', voices['B'], True)]
            y_positions = {}
            for voice_name, midi_num, is_bass in notes_to_draw:
                letter, abs_step, abs_alt, octave = spell_midi(midi_num, key_info, chord_name)
                y_lookup = f"{letter}{octave}" + ("_bass" if is_bass else "")
                y_positions[voice_name] = PITCH_Y.get(y_lookup)

            drawn_accidentals = {}
            for voice_name, midi_num, is_bass in notes_to_draw:
                letter, abs_step, abs_alt, octave = spell_midi(midi_num, key_info, chord_name)
                y_lookup = f"{letter}{octave}" + ("_bass" if is_bass else "")
                y = PITCH_Y.get(y_lookup)
                if y is None: continue
                
                staff = 1 if is_bass else 0
                acc_key = (staff, octave, abs_step)
                curr_alt = running_accidentals.get(acc_key, key_sig_alts[abs_step])
                if abs_alt != curr_alt:
                    drawn_accidentals[voice_name] = (y, abs_alt, acc_key)

            for voice_name, midi_num, is_bass in notes_to_draw:
                letter, abs_step, abs_alt, octave = spell_midi(midi_num, key_info, chord_name)
                y_lookup = f"{letter}{octave}" + ("_bass" if is_bass else "")
                y = PITCH_Y.get(y_lookup)
                if y is None: continue
                
                is_shifted = False
                for other_voice, other_y in y_positions.items():
                    if other_y is not None and other_voice != voice_name:
                        if other_y - y == 5: 
                            is_shifted = True
                            break
                note_x = x + 13 if is_shifted else x
                
                if voice_name in drawn_accidentals:
                    _, abs_alt, acc_key = drawn_accidentals[voice_name]
                    symbol = {-2: "♭♭", -1: "♭", 0: "♮", 1: "♯", 2: "x"}[abs_alt]
                    y_offset = -6 if abs_alt < 0 else 0 
                    
                    acc_x = note_x - 18
                    if is_shifted: acc_x = x - 3
                    else:
                        has_drawn_above = any(oy < y and y - oy <= 11 for ov, (oy, _, _) in drawn_accidentals.items() if ov != voice_name)
                        if has_drawn_above: acc_x = x - 28
                            
                    self.canvas.create_text(acc_x, y + y_offset, text=symbol, font=("Segoe UI Symbol", 14, "bold"), fill="#2C3E50", anchor="center")
                    running_accidentals[acc_key] = abs_alt

                # 🌟 点击判定区域随画布高度拉长
                click_area = self.canvas.create_rectangle(x - 20, 20, x + 20, 240, fill="", outline="", tags="chord_clickable")
                self.canvas.tag_bind(click_area, "<Button-1>", lambda e, idx=index: self.on_history_click(idx))

                self.canvas.create_oval(note_x-8, y-5.5, note_x+8, y+5.5, fill="#2C3E50", outline="#1A252F", width=1.5)
                
                if voice_name in ['S', 'T']: self.canvas.create_line(note_x+7, y, note_x+7, y-25, fill="#2C3E50", width=1.5)
                else: self.canvas.create_line(note_x-7, y, note_x-7, y+25, fill="#2C3E50", width=1.5)
                
                # 🌟 校准加线（Ledger lines）的生成范围判定
                if not is_bass:
                    if y >= 90:
                        for ly in range(90, y+1, 10): self.canvas.create_line(note_x-13, ly, note_x+13, ly, width=1.5)
                    if y <= 30:
                        for ly in range(30, y-1, -10): self.canvas.create_line(note_x-13, ly, note_x+13, ly, width=1.5)
                else:
                    if y <= 160:
                        for ly in range(160, y-1, -10): self.canvas.create_line(note_x-13, ly, note_x+13, ly, width=1.5)
                    if y >= 220:
                        for ly in range(220, y+1, 10): self.canvas.create_line(note_x-13, ly, note_x+13, ly, width=1.5)

        if pending_note is not None:
            x = start_x + len(history) * spacing
            letter, abs_step, abs_alt, octave = spell_midi(pending_note, key_info, "")
            y_lookup = f"{letter}{octave}"
            y = PITCH_Y.get(y_lookup)
            
            if y is not None:
                self.canvas.create_oval(x-8, y-5.5, x+8, y+5.5, fill="#E67E22", outline="#D35400", width=1.5)
                self.canvas.create_line(x+7, y, x+7, y-25, fill="#E67E22", width=1.5)
                
                if y >= 90:
                    for ly in range(90, y+1, 10): self.canvas.create_line(x-13, ly, x+13, ly, width=1.5, fill="#95A5A6")
                if y <= 30:
                    for ly in range(30, y-1, -10): self.canvas.create_line(x-13, ly, x+13, ly, width=1.5, fill="#95A5A6")

        elif target_melody and len(history) < len(target_melody):
            for i in range(len(history), len(target_melody)):
                x = start_x + i * spacing
                midi_num = target_melody[i]
                letter, abs_step, abs_alt, octave = spell_midi(midi_num, key_info, "")
                y_lookup = f"{letter}{octave}"
                y = PITCH_Y.get(y_lookup)
                if y is None: continue
                
                self.canvas.create_oval(x-8, y-5.5, x+8, y+5.5, outline="#95A5A6", width=2, dash=(2, 2))
                self.canvas.create_line(x+7, y, x+7, y-25, fill="#95A5A6", width=1.5, dash=(2, 2))
                
                if y >= 90:
                    for ly in range(90, y+1, 10): self.canvas.create_line(x-13, ly, x+13, ly, width=1.5, fill="#95A5A6")
                if y <= 30:
                    for ly in range(30, y-1, -10): self.canvas.create_line(x-13, ly, x+13, ly, width=1.5, fill="#95A5A6")

        self.update_playhead(history, key_info, target_melody, playback_index)

    def update_playhead(self, history, key_info, target_melody, playback_index):
        self.canvas.delete("playhead_layer") 
        
        spacing = 85
        start_x = 95 + key_info["sigs"] * 12
        cw = self.canvas.winfo_width()
        if cw < 10: cw = 900
        
        total_steps = max(len(history), len(target_melody) if target_melody else 0)
        max_x = start_x + total_steps * spacing + 100
        canvas_width = max(cw, max_x)
        
        if playback_index is not None:
            playhead_x = start_x + playback_index * spacing
        else:
            current_idx = len(history)
            if target_melody and current_idx < len(target_melody):
                playhead_x = start_x + current_idx * spacing
            else:
                playhead_x = start_x + max(0, len(history)-1) * spacing
            
        # 🌟 播放头指示线向下拉长
        self.canvas.create_line(playhead_x, 15, playhead_x, 235, fill="#2ECC71", width=2, dash=(4, 2), tags="playhead_layer")
        self.canvas.create_polygon(playhead_x-6, 15, playhead_x+6, 15, playhead_x, 25, fill="#2ECC71", tags="playhead_layer")

        golden_x = cw * 0.382
        target_scroll = playhead_x - golden_x
        
        if canvas_width > cw:
            fraction = max(0.0, min(1.0, target_scroll / canvas_width))
            self.canvas.xview_moveto(fraction)
        else:
            self.canvas.xview_moveto(0)
            
    def on_history_click(self, index):
        pass