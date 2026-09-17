import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from PIL import Image, ImageDraw, ImageFont

os.makedirs("assets", exist_ok=True)

# -------------------------------------------------------------
# FIG 1: SYSTEM ARCHITECTURE DIAGRAM
# -------------------------------------------------------------
def generate_architecture():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(100, 0)  # Inverted y for top-down intuitive coordinates
    ax.axis('off')

    fig.patch.set_facecolor('#F8F9FA')
    ax.set_facecolor('#F8F9FA')

    # Overall system box
    rect_sys = patches.FancyBboxPatch((12, 6), 84, 88, boxstyle="round,pad=0.8,rounding_size=1.5",
                                      linewidth=1, edgecolor="#2B4C7E", facecolor="#FFFFFF")
    ax.add_patch(rect_sys)
    ax.text(54, 10, "ClearCall System Architecture", ha='center', va='center',
            fontsize=13, fontweight='bold', color="#1A365D", family='sans-serif')

    # PIPELINE 1: INCOMING AUDIO PIPELINE (TOP HALF)
    rect_pipe1 = patches.FancyBboxPatch((14, 14), 80, 36, boxstyle="round,pad=0.5,rounding_size=1.0",
                                        linewidth=1, edgecolor="#90CAF9", facecolor="#F0F7FF")
    ax.add_patch(rect_pipe1)
    ax.text(17, 18, "INCOMING CALL CAPTIONING PIPELINE (Deaf / Hard-of-Hearing Assistance)",
            ha='left', va='center', fontsize=9, fontweight='bold', color="#0D47A1")

    # Audio Input (Outside to Inside)
    ax.text(5, 33, "Incoming\nCall Audio\n(Cellular / VoIP)", ha='center', va='center',
            fontsize=8, fontweight='bold', color="#1E293B")
    
    # 1. Audio Capture Module
    box_capture = patches.FancyBboxPatch((16, 23), 12, 18, boxstyle="round,pad=0.3,rounding_size=0.8",
                                         linewidth=1, edgecolor="#1565C0", facecolor="#BBDEFB")
    ax.add_patch(box_capture)
    ax.text(22, 32, "Audio Capture\nModule\n(Mic / AudioRecord\nSpeakerphone)", ha='center', va='center',
            fontsize=7.5, fontweight='bold', color="#0D47A1")

    # 2. Speech Recognition Engine
    box_stt = patches.FancyBboxPatch((32, 23), 15, 18, boxstyle="round,pad=0.3,rounding_size=0.8",
                                     linewidth=1, edgecolor="#1565C0", facecolor="#E3F2FD")
    ax.add_patch(box_stt)
    ax.text(39.5, 32, "Speech-to-Text\nEngine\n(On-Device ML Kit /\nAndroid Recognizer)", ha='center', va='center',
            fontsize=7.5, fontweight='bold', color="#0D47A1")

    # 3. Language Detection & Routing
    box_lang = patches.FancyBboxPatch((51, 23), 13, 18, boxstyle="round,pad=0.3,rounding_size=0.8",
                                      linewidth=1, edgecolor="#1565C0", facecolor="#E3F2FD")
    ax.add_patch(box_lang)
    ax.text(57.5, 32, "Language\nIdentification\n(ML Kit NID)", ha='center', va='center',
            fontsize=7.5, fontweight='bold', color="#0D47A1")

    # 4. Translation Engine
    box_trans = patches.FancyBboxPatch((68, 23), 12, 18, boxstyle="round,pad=0.3,rounding_size=0.8",
                                       linewidth=1, edgecolor="#1565C0", facecolor="#E3F2FD")
    ax.add_patch(box_trans)
    ax.text(74, 32, "Translation\nModule\n(On-Device NMT)", ha='center', va='center',
            fontsize=7.5, fontweight='bold', color="#0D47A1")

    # 5. Caption Overlay Renderer
    box_overlay = patches.FancyBboxPatch((83, 23), 10, 18, boxstyle="round,pad=0.3,rounding_size=0.8",
                                         linewidth=1, edgecolor="#2E7D32", facecolor="#C8E6C9")
    ax.add_patch(box_overlay)
    ax.text(88, 32, "Caption\nOverlay\nRenderer\n(Compose)", ha='center', va='center',
            fontsize=7.5, fontweight='bold', color="#1B5E20")

    # Arrows for Top Pipeline
    ax.annotate('', xy=(16, 32), xytext=(9.5, 32), arrowprops=dict(facecolor='#1E293B', width=1, headwidth=6))
    ax.annotate('', xy=(32, 32), xytext=(28, 32), arrowprops=dict(facecolor='#1565C0', width=1, headwidth=6))
    ax.annotate('', xy=(51, 32), xytext=(47, 32), arrowprops=dict(facecolor='#1565C0', width=1, headwidth=6))
    ax.annotate('', xy=(68, 32), xytext=(64, 32), arrowprops=dict(facecolor='#1565C0', width=1, headwidth=6))
    ax.annotate('', xy=(83, 32), xytext=(80, 32), arrowprops=dict(facecolor='#1565C0', width=1, headwidth=6))

    # Cloud Fallback (Dotted Box)
    box_cloud = patches.FancyBboxPatch((32, 43.5), 32, 5.5, boxstyle="round,pad=0.2,rounding_size=0.5",
                                       linewidth=1, linestyle='--', edgecolor="#E65100", facecolor="#FFF3E0")
    ax.add_patch(box_cloud)
    ax.text(48, 46.2, "Cloud Fallback STT API (When Confidence < Thresh)", ha='center', va='center',
            fontsize=7, color="#E65100", fontweight='bold')
    ax.annotate('', xy=(39.5, 43.5), xytext=(39.5, 41), arrowprops=dict(arrowstyle='<->', color='#E65100', lw=1.2))

    # PIPELINE 2: OUTGOING TEXT-TO-SPEECH PIPELINE (BOTTOM HALF)
    rect_pipe2 = patches.FancyBboxPatch((14, 53), 80, 31, boxstyle="round,pad=0.5,rounding_size=1.0",
                                        linewidth=1, edgecolor="#C8E6C9", facecolor="#F1F8E9")
    ax.add_patch(rect_pipe2)
    ax.text(17, 57, "OUTGOING TEXT-TO-SPEECH PIPELINE (Nonspeaking User Vocalization)",
            ha='left', va='center', fontsize=9, fontweight='bold', color="#2E7D32")

    # 1. Text Input & Quick Phrases
    box_textin = patches.FancyBboxPatch((17, 62), 16, 17, boxstyle="round,pad=0.3,rounding_size=0.8",
                                        linewidth=1, edgecolor="#2E7D32", facecolor="#E8F5E9")
    ax.add_patch(box_textin)
    ax.text(25, 70.5, "Text Input &\nQuick Phrases Panel\n(Custom Typed /\nSaved Phrases)", ha='center', va='center',
            fontsize=7.5, fontweight='bold', color="#1B5E20")

    # 2. TTS Synthesis Engine
    box_tts = patches.FancyBboxPatch((40, 62), 16, 17, boxstyle="round,pad=0.3,rounding_size=0.8",
                                     linewidth=1, edgecolor="#2E7D32", facecolor="#C8E6C9")
    ax.add_patch(box_tts)
    ax.text(48, 70.5, "Text-to-Speech\n(TTS) Engine\n(Android TTS /\nNeural WaveNet)", ha='center', va='center',
            fontsize=7.5, fontweight='bold', color="#1B5E20")

    # 3. Audio Output Router
    box_router = patches.FancyBboxPatch((63, 62), 16, 17, boxstyle="round,pad=0.3,rounding_size=0.8",
                                        linewidth=1, edgecolor="#2E7D32", facecolor="#E8F5E9")
    ax.add_patch(box_router)
    ax.text(71, 70.5, "Audio Stream\nRouter\n(AudioManager /\nSTREAM_VOICE_CALL)", ha='center', va='center',
            fontsize=7.5, fontweight='bold', color="#1B5E20")

    # Output to participant
    ax.annotate('', xy=(40, 70.5), xytext=(33, 70.5), arrowprops=dict(facecolor='#2E7D32', width=1, headwidth=6))
    ax.annotate('', xy=(63, 70.5), xytext=(56, 70.5), arrowprops=dict(facecolor='#2E7D32', width=1, headwidth=6))
    ax.annotate('', xy=(86, 70.5), xytext=(79, 70.5), arrowprops=dict(facecolor='#2E7D32', width=1, headwidth=6))
    ax.text(91, 70.5, "Call Audio\nStream\n(Uplink Mic / Spkr)", ha='center', va='center',
            fontsize=8, fontweight='bold', color="#1E293B")

    # STORAGE SUBSYSTEM (BOTTOM RIGHT)
    box_db = patches.FancyBboxPatch((32, 86), 42, 6.5, boxstyle="round,pad=0.2,rounding_size=0.6",
                                    linewidth=1, edgecolor="#6A1B9A", facecolor="#F3E5F5")
    ax.add_patch(box_db)
    ax.text(53, 89.25, "Local Persistence Layer: Room SQLite DB [SavedPhrases | UserSettings | CaptionHistory]",
            ha='center', va='center', fontsize=7.2, fontweight='bold', color="#4A148C")

    # Connections to DB
    ax.annotate('', xy=(38, 86), xytext=(25, 79), arrowprops=dict(arrowstyle='<->', color='#6A1B9A', lw=1.2))
    ax.annotate('', xy=(66, 86), xytext=(88, 41), arrowprops=dict(arrowstyle='<-', color='#6A1B9A', lw=1.2))

    plt.tight_layout()
    plt.savefig("assets/fig1_architecture.png", dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------
# FIG 2: DATA FLOW DIAGRAM (LEVEL 0 & LEVEL 1)
# -------------------------------------------------------------
def generate_dfd():
    fig, (ax0, ax1) = plt.subplots(2, 1, figsize=(10, 8.5), dpi=300)
    
    for ax in (ax0, ax1):
        ax.set_xlim(0, 100)
        ax.set_ylim(0, 100)
        ax.axis('off')
        ax.set_facecolor('#FFFFFF')

    # DFD LEVEL 0 (CONTEXT DIAGRAM)
    ax0.set_title("Level 0 Data Flow Diagram (Context Level)", fontsize=11, fontweight='bold', color="#1A365D", pad=10)
    
    # Process 0
    p0 = patches.Circle((50, 50), 16, edgecolor="#1565C0", facecolor="#E3F2FD", linewidth=2)
    ax0.add_patch(p0)
    ax0.text(50, 53, "0.0", ha='center', va='center', fontsize=10, fontweight='bold', color="#0D47A1")
    ax0.text(50, 46, "ClearCall\nAccessibility\nSystem", ha='center', va='center', fontsize=8.5, fontweight='bold', color="#0D47A1")

    # Entities
    # Deaf/Nonspeaking User
    e_user = patches.Rectangle((4, 38), 18, 24, edgecolor="#2E7D32", facecolor="#E8F5E9", linewidth=1)
    ax0.add_patch(e_user)
    ax0.text(13, 50, "Deaf /\nNonspeaking\nUser", ha='center', va='center', fontsize=8.5, fontweight='bold', color="#1B5E20")

    # Remote Call Participant
    e_remote = patches.Rectangle((78, 38), 18, 24, edgecolor="#C62828", facecolor="#FFEBEE", linewidth=1)
    ax0.add_patch(e_remote)
    ax0.text(87, 50, "Remote Call\nParticipant", ha='center', va='center', fontsize=8.5, fontweight='bold', color="#B71C1C")

    # External Cloud Fallback
    e_cloud = patches.Rectangle((40, 82), 20, 14, edgecolor="#E65100", facecolor="#FFF3E0", linewidth=1)
    ax0.add_patch(e_cloud)
    ax0.text(50, 89, "Cloud Fallback\nEngine (STT API)", ha='center', va='center', fontsize=8, fontweight='bold', color="#E65100")

    # Arrows DFD Level 0
    # User to System
    ax0.annotate('Text Input / Quick Phrases', xy=(34, 44), xytext=(22, 44),
                 arrowprops=dict(facecolor='#2E7D32', width=1, headwidth=5), fontsize=7, color="#1B5E20")
    ax0.annotate('Real-Time Captions / Translations', xy=(22, 56), xytext=(34, 56),
                 arrowprops=dict(facecolor='#1565C0', width=1, headwidth=5), fontsize=7, color="#0D47A1", ha='right')

    # Remote to System
    ax0.annotate('Spoken Voice Audio', xy=(66, 56), xytext=(78, 56),
                 arrowprops=dict(facecolor='#C62828', width=1, headwidth=5), fontsize=7, color="#B71C1C", ha='right')
    ax0.annotate('Synthesized TTS Audio', xy=(78, 44), xytext=(66, 44),
                 arrowprops=dict(facecolor='#2E7D32', width=1, headwidth=5), fontsize=7, color="#1B5E20")

    # System to Cloud
    ax0.annotate('Low-Conf Audio Buffer', xy=(47, 82), xytext=(47, 66),
                 arrowprops=dict(facecolor='#E65100', width=1, headwidth=5), fontsize=6.5, color="#E65100", ha='right')
    ax0.annotate('Cloud Transcripts', xy=(53, 66), xytext=(53, 82),
                 arrowprops=dict(facecolor='#E65100', width=1, headwidth=5), fontsize=6.5, color="#E65100")

    # DFD LEVEL 1 (DETAILED DATA FLOW)
    ax1.set_title("Level 1 Data Flow Diagram (Detailed Functional Flow)", fontsize=11, fontweight='bold', color="#1A365D", pad=10)

    # Sub-processes
    # 1.0 Capture
    p1 = patches.Circle((14, 75), 7, edgecolor="#1565C0", facecolor="#E3F2FD", linewidth=1)
    ax1.add_patch(p1)
    ax1.text(14, 75, "1.0\nAudio\nCapture", ha='center', va='center', fontsize=7, fontweight='bold', color="#0D47A1")

    # 2.0 STT
    p2 = patches.Circle((38, 75), 7, edgecolor="#1565C0", facecolor="#E3F2FD", linewidth=1)
    ax1.add_patch(p2)
    ax1.text(38, 75, "2.0\nSpeech\nRecog", ha='center', va='center', fontsize=7, fontweight='bold', color="#0D47A1")

    # 3.0 Lang Detect & Trans
    p3 = patches.Circle((62, 75), 7, edgecolor="#1565C0", facecolor="#E3F2FD", linewidth=1)
    ax1.add_patch(p3)
    ax1.text(62, 75, "3.0\nDetect &\nTranslate", ha='center', va='center', fontsize=7, fontweight='bold', color="#0D47A1")

    # 4.0 Overlay Render
    p4 = patches.Circle((86, 75), 7, edgecolor="#2E7D32", facecolor="#C8E6C9", linewidth=1)
    ax1.add_patch(p4)
    ax1.text(86, 75, "4.0\nOverlay\nRender", ha='center', va='center', fontsize=7, fontweight='bold', color="#1B5E20")

    # 5.0 Text Input & TTS
    p5 = patches.Circle((28, 25), 7, edgecolor="#2E7D32", facecolor="#C8E6C9", linewidth=1)
    ax1.add_patch(p5)
    ax1.text(28, 25, "5.0\nPhrase\nSelection", ha='center', va='center', fontsize=7, fontweight='bold', color="#1B5E20")

    # 6.0 Audio Routing
    p6 = patches.Circle((62, 25), 7, edgecolor="#2E7D32", facecolor="#C8E6C9", linewidth=1)
    ax1.add_patch(p6)
    ax1.text(62, 25, "6.0\nTTS Audio\nRouting", ha='center', va='center', fontsize=7, fontweight='bold', color="#1B5E20")

    # Data Store D1: Room DB
    d1 = patches.Rectangle((40, 43), 20, 12, edgecolor="#6A1B9A", facecolor="#F3E5F5", linewidth=1)
    ax1.add_patch(d1)
    ax1.text(50, 49, "D1 | Room Database\n(Phrases, Logs, Config)", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#4A148C")

    # Connecting Arrows DFD Level 1
    ax1.annotate('Raw PCM', xy=(31, 75), xytext=(21, 75), arrowprops=dict(facecolor='#1565C0', width=1, headwidth=4), fontsize=6.5)
    ax1.annotate('Transcribed Text', xy=(55, 75), xytext=(45, 75), arrowprops=dict(facecolor='#1565C0', width=1, headwidth=4), fontsize=6.5)
    ax1.annotate('Subtitles', xy=(79, 75), xytext=(69, 75), arrowprops=dict(facecolor='#1565C0', width=1, headwidth=4), fontsize=6.5)

    ax1.annotate('Selected Phrase', xy=(55, 25), xytext=(35, 25), arrowprops=dict(facecolor='#2E7D32', width=1, headwidth=4), fontsize=6.5)
    
    # Store access
    ax1.annotate('', xy=(50, 43), xytext=(32, 29), arrowprops=dict(arrowstyle='<->', color='#6A1B9A', lw=1.2))
    ax1.annotate('', xy=(55, 55), xytext=(81, 71), arrowprops=dict(arrowstyle='->', color='#6A1B9A', lw=1.2))

    plt.tight_layout()
    plt.savefig("assets/fig2_dfd.png", dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------
# FIG 3: USE CASE DIAGRAM
# -------------------------------------------------------------
def generate_use_case():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#FFFFFF')

    # Boundary Box
    sys_box = patches.Rectangle((24, 6), 52, 88, edgecolor="#2B4C7E", facecolor="#F8FAFC", linewidth=1)
    ax.add_patch(sys_box)
    ax.text(50, 91, "ClearCall System Boundary", ha='center', va='center', fontsize=11, fontweight='bold', color="#1E293B")

    def draw_actor(x, y, name, color="#1565C0"):
        c = patches.Circle((x, y+4), 2.2, edgecolor=color, facecolor="#FFFFFF", linewidth=1)
        ax.add_patch(c)
        ax.plot([x, x], [y+1.8, y-4], color=color, linewidth=1)
        ax.plot([x-3.5, x+3.5], [y, y], color=color, linewidth=1)
        ax.plot([x, x-3], [y-4, y-9], color=color, linewidth=1)
        ax.plot([x, x+3], [y-4, y-9], color=color, linewidth=1)
        ax.text(x, y-12, name, ha='center', va='top', fontsize=8, fontweight='bold', color=color)

    draw_actor(10, 75, "Deaf / Hard-of-Hearing\nUser", color="#0D47A1")
    draw_actor(10, 32, "Nonspeaking\nUser", color="#1B5E20")
    draw_actor(90, 52, "Remote Call\nParticipant", color="#B71C1C")

    # Use Cases
    use_cases = [
        (50, 83, "UC1: Enable Live Call Captioning", "#E3F2FD", "#1565C0"),
        (50, 72, "UC2: View Real-Time Transcriptions", "#E3F2FD", "#1565C0"),
        (50, 61, "UC3: Select Source / Target Languages", "#E3F2FD", "#1565C0"),
        (50, 50, "UC4: Select / Type Quick-Response Phrases", "#E8F5E9", "#2E7D32"),
        (50, 39, "UC5: Trigger Text-to-Speech Playback", "#E8F5E9", "#2E7D32"),
        (50, 28, "UC6: Configure Audio Capture Mode", "#F3E5F5", "#6A1B9A"),
        (50, 17, "UC7: Manage Saved Phrases & History", "#F3E5F5", "#6A1B9A"),
    ]

    for (x, y, text, fc, ec) in use_cases:
        ellipse = patches.Ellipse((x, y), 38, 7.5, edgecolor=ec, facecolor=fc, linewidth=1)
        ax.add_patch(ellipse)
        ax.text(x, y, text, ha='center', va='center', fontsize=7.5, fontweight='bold', color="#1E293B")

    # Association Lines
    ax.plot([14, 31], [72, 83], color="#0D47A1", lw=1.2)
    ax.plot([14, 31], [70, 72], color="#0D47A1", lw=1.2)
    ax.plot([14, 31], [68, 61], color="#0D47A1", lw=1.2)
    ax.plot([14, 31], [66, 28], color="#0D47A1", lw=0.9, linestyle=':')
    ax.plot([14, 31], [65, 17], color="#0D47A1", lw=0.9, linestyle=':')

    ax.plot([14, 31], [34, 50], color="#1B5E20", lw=1.2)
    ax.plot([14, 31], [32, 39], color="#1B5E20", lw=1.2)
    ax.plot([14, 31], [36, 72], color="#1B5E20", lw=0.9, linestyle=':')
    ax.plot([14, 31], [30, 17], color="#1B5E20", lw=1.2)

    ax.plot([86, 69], [54, 83], color="#B71C1C", lw=1.2)
    ax.plot([86, 69], [50, 39], color="#B71C1C", lw=1.2)

    plt.tight_layout()
    plt.savefig("assets/fig3_use_case.png", dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------
# FIG 4: ER SCHEMA DIAGRAM
# -------------------------------------------------------------
def generate_er_schema():
    fig, ax = plt.subplots(figsize=(9.5, 4.8), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#FFFFFF')

    ax.text(50, 94, "ClearCall Local Database Schema (Room SQLite Architecture)",
            ha='center', va='center', fontsize=11, fontweight='bold', color="#1A365D")

    # Table 1: SavedPhrases
    p1 = patches.Rectangle((5, 25), 26, 60, edgecolor="#1565C0", facecolor="#F8FAFC", linewidth=1)
    ax.add_patch(p1)
    h1 = patches.Rectangle((5, 75), 26, 10, edgecolor="#1565C0", facecolor="#1565C0", linewidth=1)
    ax.add_patch(h1)
    ax.text(18, 80, "SavedPhrases", ha='center', va='center', fontsize=9, fontweight='bold', color="#FFFFFF")
    
    fields1 = [
        ("id : INTEGER [PK]", True),
        ("category : TEXT", False),
        ("phrase_text : TEXT", False),
        ("usage_count : INT", False),
        ("is_favorite : BOOL", False),
        ("created_at : LONG", False),
        ("last_used : LONG", False),
    ]
    y_curr = 68
    for f, is_pk in fields1:
        fontweight = 'bold' if is_pk else 'normal'
        color = '#B71C1C' if is_pk else '#1E293B'
        ax.text(7, y_curr, f, ha='left', va='center', fontsize=7.5, fontweight=fontweight, color=color)
        y_curr -= 6.5

    # Table 2: CaptionHistory
    p2 = patches.Rectangle((37, 20), 28, 65, edgecolor="#2E7D32", facecolor="#F8FAFC", linewidth=1)
    ax.add_patch(p2)
    h2 = patches.Rectangle((37, 75), 28, 10, edgecolor="#2E7D32", facecolor="#2E7D32", linewidth=1)
    ax.add_patch(h2)
    ax.text(51, 80, "CaptionHistory", ha='center', va='center', fontsize=9, fontweight='bold', color="#FFFFFF")

    fields2 = [
        ("history_id : INTEGER [PK]", True),
        ("session_id : TEXT [INDEX]", False),
        ("timestamp_ms : LONG", False),
        ("speaker_tag : TEXT", False),
        ("raw_transcription : TEXT", False),
        ("translated_text : TEXT", False),
        ("source_language : TEXT", False),
        ("target_language : TEXT", False),
        ("confidence_score : REAL", False),
        ("latency_ms : INT", False),
    ]
    y_curr = 69
    for f, is_pk in fields2:
        fontweight = 'bold' if is_pk else 'normal'
        color = '#B71C1C' if is_pk else '#1E293B'
        ax.text(39, y_curr, f, ha='left', va='center', fontsize=7, fontweight=fontweight, color=color)
        y_curr -= 5.3

    # Table 3: UserSettings
    p3 = patches.Rectangle((71, 30), 24, 55, edgecolor="#6A1B9A", facecolor="#F8FAFC", linewidth=1)
    ax.add_patch(p3)
    h3 = patches.Rectangle((71, 75), 24, 10, edgecolor="#6A1B9A", facecolor="#6A1B9A", linewidth=1)
    ax.add_patch(h3)
    ax.text(83, 80, "UserSettings", ha='center', va='center', fontsize=9, fontweight='bold', color="#FFFFFF")

    fields3 = [
        ("setting_key : TEXT [PK]", True),
        ("setting_val : TEXT", False),
        ("data_type : TEXT", False),
        ("last_updated : LONG", False),
        ("description : TEXT", False),
    ]
    y_curr = 68
    for f, is_pk in fields3:
        fontweight = 'bold' if is_pk else 'normal'
        color = '#B71C1C' if is_pk else '#1E293B'
        ax.text(73, y_curr, f, ha='left', va='center', fontsize=7.5, fontweight=fontweight, color=color)
        y_curr -= 7.5

    plt.tight_layout()
    plt.savefig("assets/fig4_er_schema.png", dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------
# FIG 5: PERFORMANCE GRAPH
# -------------------------------------------------------------
def generate_performance_graph():
    fig, ax = plt.subplots(figsize=(6.5, 4.2), dpi=300)
    
    noise_db = np.array([30, 40, 50, 60, 70, 75, 80, 85])
    on_device_latency = np.array([210, 218, 230, 245, 275, 310, 365, 430])
    cloud_latency = np.array([480, 492, 510, 535, 570, 615, 680, 745])
    hybrid_latency = np.array([215, 222, 235, 252, 290, 345, 440, 520])

    ax.plot(noise_db, on_device_latency, marker='o', color='#1565C0', linewidth=2, label='On-Device Engine (ML Kit)')
    ax.plot(noise_db, cloud_latency, marker='s', linestyle='--', color='#E65100', linewidth=1, label='Cloud Fallback Engine (Remote API)')
    ax.plot(noise_db, hybrid_latency, marker='^', color='#2E7D32', linewidth=2, label='ClearCall Hybrid Adaptive Mode')

    ax.axhline(y=450, color='#D32F2F', linestyle=':', label='Max Interactive Latency Threshold (450 ms)')

    ax.set_title("Caption Latency vs. Ambient Background Noise Level", fontsize=10.5, fontweight='bold', color="#1A365D", pad=8)
    ax.set_xlabel("Ambient Noise Level (dB SPL)", fontsize=9, fontweight='bold', color="#1E293B")
    ax.set_ylabel("End-to-End Latency (ms)", fontsize=9, fontweight='bold', color="#1E293B")
    ax.grid(True, linestyle='--', alpha=0.5)
    ax.legend(fontsize=7.5, loc='upper left', framealpha=0.9)
    ax.set_ylim(150, 800)
    ax.set_xlim(25, 90)

    ax.text(35, 170, "Quiet Office\n(35-45 dB)", fontsize=7, color="#555555", ha='center', style='italic')
    ax.text(75, 170, "Street Traffic / Bus\n(75-85 dB)", fontsize=7, color="#555555", ha='center', style='italic')

    plt.tight_layout()
    plt.savefig("assets/fig5_performance_graph.png", dpi=300, bbox_inches='tight')
    plt.close()

# -------------------------------------------------------------
# MOCKUP GENERATOR HELPER
# -------------------------------------------------------------
def create_phone_base(title_text):
    w, h = 420, 780
    img = Image.new("RGBA", (w, h), (240, 244, 248, 255))
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([(10, 10), (w-10, h-10)], radius=36, fill=(15, 23, 42, 255), outline=(51, 65, 85, 255), width=3)
    draw.rounded_rectangle([(20, 20), (w-20, h-20)], radius=28, fill=(24, 32, 47, 255))

    draw.rounded_rectangle([(w//2 - 45, 26), (w//2 + 45, 42)], radius=8, fill=(10, 15, 25, 255))
    draw.text((36, 28), "09:41", fill=(203, 213, 225, 255))
    draw.text((w-75, 28), "5G  100%", fill=(203, 213, 225, 255))

    draw.rounded_rectangle([(20, 50), (w-20, 105)], radius=0, fill=(30, 41, 59, 255))
    draw.text((36, 68), "ClearCall", fill=(56, 189, 248, 255))
    draw.text((w-140, 68), "v1.2.0 • Active", fill=(148, 163, 184, 255))

    draw.rounded_rectangle([(w//2 - 50, h-32), (w//2 + 50, h-26)], radius=3, fill=(100, 116, 139, 255))
    return img, draw, w, h

def generate_mockup_onboarding():
    img, draw, w, h = create_phone_base("Onboarding")

    draw.text((36, 125), "Welcome to ClearCall", fill=(255, 255, 255, 255))
    draw.text((36, 152), "Real-time call captions & voice synthesis\nfor accessible phone communication.", fill=(148, 163, 184, 255))

    draw.rounded_rectangle([(36, 205), (w-36, 285)], radius=12, fill=(30, 41, 59, 255), outline=(56, 189, 248, 255), width=1)
    draw.text((50, 218), "[MIC] Audio Record Access", fill=(255, 255, 255, 255))
    draw.text((50, 240), "Required to capture incoming speech via\nspeakerphone acoustic coupling.", fill=(148, 163, 184, 255))
    draw.rounded_rectangle([(w-95, 235), (w-48, 265)], radius=6, fill=(14, 165, 233, 255))
    draw.text((w-88, 244), "ALLOW", fill=(255, 255, 255, 255))

    draw.rounded_rectangle([(36, 305), (w-36, 385)], radius=12, fill=(30, 41, 59, 255), outline=(56, 189, 248, 255), width=1)
    draw.text((50, 318), "[OVL] System Alert Window", fill=(255, 255, 255, 255))
    draw.text((50, 340), "Displays floating real-time captions directly\nover active phone call screens.", fill=(148, 163, 184, 255))
    draw.rounded_rectangle([(w-95, 335), (w-48, 365)], radius=6, fill=(14, 165, 233, 255))
    draw.text((w-88, 344), "ALLOW", fill=(255, 255, 255, 255))

    draw.rounded_rectangle([(36, 405), (w-36, 490)], radius=12, fill=(44, 24, 16, 255), outline=(249, 115, 22, 255), width=1)
    draw.text((50, 418), "[!] Important Cellular Call Notice", fill=(251, 146, 60, 255))
    draw.text((50, 440), "Due to Android cellular security sandboxing,\nturn on Speakerphone during cellular calls\nso ClearCall can capture remote audio.", fill=(254, 215, 170, 255))

    draw.rounded_rectangle([(36, 630), (w-36, 685)], radius=14, fill=(14, 165, 233, 255))
    draw.text((w//2 - 65, 650), "Get Started ->", fill=(255, 255, 255, 255))

    img.save("assets/fig6_mockup_onboarding.png")

def generate_mockup_caption_overlay():
    img, draw, w, h = create_phone_base("Live Call")

    draw.rounded_rectangle([(36, 120), (w-36, 250)], radius=16, fill=(30, 41, 59, 255))
    draw.text((w//2 - 50, 138), "In Active Call...", fill=(148, 163, 184, 255))
    draw.text((w//2 - 68, 162), "Dr. Sarah Jenkins", fill=(255, 255, 255, 255))
    draw.text((w//2 - 40, 192), "04:18  [SPK ON]", fill=(56, 189, 248, 255))

    draw.rounded_rectangle([(28, 270), (w-28, 560)], radius=16, fill=(15, 23, 42, 245), outline=(56, 189, 248, 255), width=2)
    draw.rounded_rectangle([(28, 270), (w-28, 310)], radius=0, fill=(30, 41, 59, 255))
    draw.text((40, 282), "ClearCall Live Captions", fill=(56, 189, 248, 255))
    draw.text((w-115, 282), "Conf: 98% [ON]", fill=(74, 222, 128, 255))

    draw.text((40, 325), "Remote Speaker:", fill=(148, 163, 184, 255))
    draw.text((40, 350), "\"Hello! I am reviewing your blood test", fill=(255, 255, 255, 255))
    draw.text((40, 375), "results from yesterday. Everything is", fill=(255, 255, 255, 255))
    draw.text((40, 400), "looking completely normal and stable.", fill=(255, 255, 255, 255))
    draw.text((40, 425), "Can you hear me clearly?\"", fill=(56, 189, 248, 255))

    draw.rounded_rectangle([(40, 480), (145, 505)], radius=6, fill=(30, 41, 59, 255))
    draw.text((48, 488), "Latency: 218 ms", fill=(148, 163, 184, 255))

    draw.rounded_rectangle([(155, 480), (250, 505)], radius=6, fill=(30, 41, 59, 255))
    draw.text((163, 488), "Source: English", fill=(148, 163, 184, 255))

    draw.rounded_rectangle([(36, 580), (w//2 - 6, 625)], radius=10, fill=(30, 41, 59, 255), outline=(56, 189, 248, 255))
    draw.text((52, 596), "[T] Quick TTS Panel", fill=(255, 255, 255, 255))

    draw.rounded_rectangle([(w//2 + 6, 580), (w-36, 625)], radius=10, fill=(30, 41, 59, 255), outline=(148, 163, 184, 255))
    draw.text((w//2 + 20, 596), "[A] Translation Toggle", fill=(255, 255, 255, 255))

    img.save("assets/fig7_mockup_caption_overlay.png")

def generate_mockup_translation():
    img, draw, w, h = create_phone_base("Translation")

    draw.text((36, 120), "Multilingual Call Translation", fill=(255, 255, 255, 255))
    draw.text((36, 145), "Automatic Speech-to-Speech / Text Translation", fill=(148, 163, 184, 255))

    draw.rounded_rectangle([(36, 185), (w-36, 275)], radius=14, fill=(30, 41, 59, 255), outline=(56, 189, 248, 255), width=1)
    draw.text((52, 202), "SOURCE (CALLER)", fill=(148, 163, 184, 255))
    draw.text((52, 228), "Spanish (ES)", fill=(255, 255, 255, 255))

    draw.text((w//2 - 12, 220), "<--->", fill=(56, 189, 248, 255))

    draw.text((w-160, 202), "TARGET (USER)", fill=(148, 163, 184, 255))
    draw.text((w-160, 228), "English (US)", fill=(255, 255, 255, 255))

    draw.rounded_rectangle([(36, 295), (w-36, 520)], radius=14, fill=(15, 23, 42, 255), outline=(148, 163, 184, 255), width=1)
    draw.text((52, 315), "Original Spoken Audio (Spanish):", fill=(245, 158, 11, 255))
    draw.text((52, 340), "\"Buenos dias, le llamo de la clinica para", fill=(226, 232, 240, 255))
    draw.text((52, 362), "confirmar su cita medica manana a las 10.\"", fill=(226, 232, 240, 255))

    draw.line([(52, 395), (w-52, 395)], fill=(51, 65, 85, 255), width=1)

    draw.text((52, 415), "Real-Time Translated Caption (English):", fill=(56, 189, 248, 255))
    draw.text((52, 440), "\"Good morning, I am calling from the", fill=(255, 255, 255, 255))
    draw.text((52, 462), "clinic to confirm your appointment", fill=(255, 255, 255, 255))
    draw.text((52, 484), "tomorrow at 10:00 AM.\"", fill=(255, 255, 255, 255))

    draw.rounded_rectangle([(36, 545), (w-36, 610)], radius=12, fill=(30, 41, 59, 255))
    draw.text((52, 560), "Offline Translation Model: READY", fill=(74, 222, 128, 255))
    draw.text((52, 582), "ES <-> EN Neural Model (34 MB on-device)", fill=(148, 163, 184, 255))

    img.save("assets/fig8_mockup_translation.png")

def generate_mockup_quick_tts():
    img, draw, w, h = create_phone_base("Quick TTS")

    draw.text((36, 120), "Quick-Response Vocalizer", fill=(255, 255, 255, 255))
    draw.text((36, 145), "Tap a phrase to speak immediately into call", fill=(148, 163, 184, 255))

    categories = ["All", "Medical", "Emergency", "Greetings", "Work"]
    cx = 36
    for i, cat in enumerate(categories):
        fill_col = (14, 165, 233, 255) if i == 0 else (30, 41, 59, 255)
        text_col = (255, 255, 255, 255) if i == 0 else (148, 163, 184, 255)
        draw.rounded_rectangle([(cx, 180), (cx + 62, 212)], radius=16, fill=fill_col)
        draw.text((cx + 12, 190), cat, fill=text_col)
        cx += 70

    phrases = [
        "I am deaf and reading your voice as text.",
        "Please hold on while I type my response.",
        "Yes, I confirm the appointment tomorrow.",
        "Could you please speak a little slower?",
        "Thank you very much. Goodbye!"
    ]
    py = 230
    for p in phrases:
        draw.rounded_rectangle([(36, py), (w-36, py+52)], radius=10, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
        draw.text((50, py+16), p, fill=(241, 245, 249, 255))
        draw.rounded_rectangle([(w-82, py+12), (w-48, py+40)], radius=6, fill=(16, 185, 129, 255))
        draw.text((w-75, py+19), "SPEAK", fill=(255, 255, 255, 255))
        py += 62

    draw.rounded_rectangle([(36, 560), (w-36, 650)], radius=12, fill=(15, 23, 42, 255), outline=(56, 189, 248, 255), width=1)
    draw.text((50, 575), "Type custom response...", fill=(100, 116, 139, 255))
    draw.rounded_rectangle([(w-110, 600), (w-48, 638)], radius=8, fill=(14, 165, 233, 255))
    draw.text((w-98, 612), "SPEAK", fill=(255, 255, 255, 255))

    img.save("assets/fig9_mockup_quick_tts.png")

def generate_mockup_settings():
    img, draw, w, h = create_phone_base("Settings")

    draw.text((36, 120), "Application Settings", fill=(255, 255, 255, 255))
    draw.text((36, 145), "Audio, speech engines, and database controls", fill=(148, 163, 184, 255))

    draw.rounded_rectangle([(36, 180), (w-36, 245)], radius=10, fill=(30, 41, 59, 255))
    draw.text((50, 192), "Audio Capture Source", fill=(255, 255, 255, 255))
    draw.text((50, 214), "Speakerphone Coupling (Cellular) [ACTIVE]", fill=(56, 189, 248, 255))

    draw.rounded_rectangle([(36, 255), (w-36, 320)], radius=10, fill=(30, 41, 59, 255))
    draw.text((50, 267), "Recognition Engine Mode", fill=(255, 255, 255, 255))
    draw.text((50, 289), "On-Device First (Privacy-Preserving)", fill=(74, 222, 128, 255))

    draw.rounded_rectangle([(36, 330), (w-36, 395)], radius=10, fill=(30, 41, 59, 255))
    draw.text((50, 342), "Caption Font Size", fill=(255, 255, 255, 255))
    draw.text((50, 364), "Large (22 sp) - Optimal Accessibility", fill=(148, 163, 184, 255))

    draw.rounded_rectangle([(36, 405), (w-36, 485)], radius=10, fill=(30, 41, 59, 255))
    draw.text((50, 418), "Local Storage & Call Logs (Room DB)", fill=(255, 255, 255, 255))
    draw.text((50, 440), "24 Call Transcripts Stored (1.4 MB)", fill=(148, 163, 184, 255))
    draw.text((50, 460), "[Export JSON]  [Clear History]", fill=(245, 158, 11, 255))

    draw.rounded_rectangle([(36, 495), (w-36, 575)], radius=10, fill=(30, 41, 59, 255))
    draw.text((50, 508), "Downloaded Language Packs", fill=(255, 255, 255, 255))
    draw.text((50, 530), "English (US), Spanish (ES), French (FR)", fill=(148, 163, 184, 255))
    draw.text((50, 550), "[+] Download Additional Models", fill=(56, 189, 248, 255))

    img.save("assets/fig10_mockup_settings.png")

if __name__ == "__main__":
    print("Generating Fig 1: Architecture...")
    generate_architecture()
    print("Generating Fig 2: Data Flow Diagrams...")
    generate_dfd()
    print("Generating Fig 3: Use Case Diagram...")
    generate_use_case()
    print("Generating Fig 4: ER Schema Diagram...")
    generate_er_schema()
    print("Generating Fig 5: Performance Graph...")
    generate_performance_graph()
    print("Generating Mockup 1: Onboarding...")
    generate_mockup_onboarding()
    print("Generating Mockup 2: Live Caption Overlay...")
    generate_mockup_caption_overlay()
    print("Generating Mockup 3: Multilingual Translation...")
    generate_mockup_translation()
    print("Generating Mockup 4: Quick-Phrase TTS...")
    generate_mockup_quick_tts()
    print("Generating Mockup 5: Settings...")
    generate_mockup_settings()
    print("All visual assets generated successfully!")
