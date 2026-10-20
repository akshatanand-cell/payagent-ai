import os
import sys
import asyncio
import subprocess
import edge_tts
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'output'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE = "en-US-AriaNeural"

SCRIPT_SEGMENTS = [
    {
        "id": "scene_1_intro",
        "text": "Welcome to PayAgent AI, the autonomous agentic commerce protocol built for the PayPal AI Hackathon. In today's digital economy, autonomous AI agents can search the web and summarize documents, but they cannot independently negotiate, purchase, or settle commercial contracts with financial safety guardrails. PayAgent AI bridges frontier artificial intelligence directly with PayPal's global payments infrastructure, empowering AI agents to procure goods and services autonomously while enforcing strict human-in-the-loop compliance.",
        "title": "PayAgent AI: Autonomous Commerce Protocol",
        "subtitle": "Bridging Agentic AI with PayPal Global Financial Infrastructure"
    },
    {
        "id": "scene_2_architecture",
        "text": "At the core of PayAgent AI is a multi-tier tool-calling commerce engine. When given a complex natural language procurement intent, the agent decomposes the request, queries live vendor catalogs, and computes a dynamic risk score from 0 to 100 based on vendor reputation, delivery guarantees, and monetary scale. Crucially, the system checks organizational spending policies, such as daily budget ceilings and single-transaction caps, before generating an order.",
        "title": "Autonomous Tool-Calling Architecture",
        "subtitle": "Budget Policy Verification • Vendor Selection • Risk Assessment"
    },
    {
        "id": "scene_3_paypal_sandbox",
        "text": "Here, PayAgent integrates deeply with the PayPal Developer Platform using the PayPal REST Orders v2 API. The agent programmatically generates structured purchase units with line-item breakdowns, tax allocations, and custom telemetry identifiers. If a transaction falls within autonomous safe limits, it settles immediately. However, if an order exceeds the policy threshold, our Human-in-the-Loop engine engages, presenting an interactive authorization gate with live PayPal smart capture.",
        "title": "Deep PayPal Developer Platform Integration",
        "subtitle": "PayPal Orders v2 API • Real-Time OAuth2 • Instant Capture"
    },
    {
        "id": "scene_4_aggrid_telemetry",
        "text": "For enterprise finance leaders and CFOs, PayAgent AI features an auditable financial command center powered by AG Grid. Every autonomous agent action, risk assessment score, vendor deliverable, and PayPal settlement state streams into this high-performance ledger with instant row animation, multi-column sorting, and compliance filtering, ensuring 100 percent transparency over all autonomous spending.",
        "title": "Live Financial Telemetry with AG Grid",
        "subtitle": "Real-Time Spend Tracking • Risk Indicators • Full Auditability"
    },
    {
        "id": "scene_5_conclusion",
        "text": "By uniting autonomous agentic intelligence, PayPal's trusted payment rails, and AG Grid's enterprise telemetry, PayAgent AI redefines modern procurement for the agentic era. The repository is completely open-source under the MIT license with complete setup guides. Thank you to PayPal and Devpost for this incredible opportunity.",
        "title": "The Future of Agentic Commerce",
        "subtitle": "Open-Source • Scalable • Built for PayPal AI Hackathon 2026"
    }
]

async def generate_voiceovers():
    print("🎙️ Generating Studio Neural Voiceovers...")
    for seg in SCRIPT_SEGMENTS:
        mp3_path = os.path.join(OUTPUT_DIR, f"{seg['id']}.mp3")
        communicate = edge_tts.Communicate(seg["text"], VOICE, rate="+4%")
        await communicate.save(mp3_path)
        print(f"  ✓ Created voiceover: {seg['id']}.mp3")

async def capture_browser_scenes():
    print("📸 Capturing High-Res 1080p UI Visuals with Playwright...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
        page = await context.new_page()

        # Scene 1: Dashboard overview
        try:
            await page.goto("http://localhost:3000", wait_until="networkidle", timeout=15000)
            await asyncio.sleep(2)
            await page.screenshot(path=os.path.join(OUTPUT_DIR, "scene_1_intro.png"))
            print("  ✓ Captured scene_1_intro.png")

            # Scene 2: Interactive Prompt & Reasoning
            await page.click('button:has-text("Provision GPU Cloud Instance under $60")')
            await asyncio.sleep(3)
            await page.screenshot(path=os.path.join(OUTPUT_DIR, "scene_2_architecture.png"))
            print("  ✓ Captured scene_2_architecture.png")

            # Scene 3: Human in the loop authorization
            await page.click('button:has-text("Procure 2 ergonomic mechanical keyboards")')
            await asyncio.sleep(3)
            await page.screenshot(path=os.path.join(OUTPUT_DIR, "scene_3_paypal_sandbox.png"))
            print("  ✓ Captured scene_3_paypal_sandbox.png")

            # Scene 4: Scroll down to AG Grid
            await page.evaluate("window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })")
            await asyncio.sleep(2)
            await page.screenshot(path=os.path.join(OUTPUT_DIR, "scene_4_aggrid_telemetry.png"))
            print("  ✓ Captured scene_4_aggrid_telemetry.png")

            # Scene 5: Conclusion
            await page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
            await asyncio.sleep(1)
            await page.screenshot(path=os.path.join(OUTPUT_DIR, "scene_5_conclusion.png"))
            print("  ✓ Captured scene_5_conclusion.png")
        except Exception as e:
            print(f"  ⚠️ Warning capturing browser: {e}")
        finally:
            await browser.close()

def compile_video():
    print("🎬 Compiling 1080p Video with FFmpeg...")
    segment_videos = []

    for idx, seg in enumerate(SCRIPT_SEGMENTS):
        seg_id = seg["id"]
        img_path = os.path.join(OUTPUT_DIR, f"{seg_id}.png")
        mp3_path = os.path.join(OUTPUT_DIR, f"{seg_id}.mp3")
        seg_out = os.path.join(OUTPUT_DIR, f"{seg_id}_rendered.mp4")

        # Get audio duration
        probe_cmd = [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", mp3_path
        ]
        duration = float(subprocess.check_output(probe_cmd).decode().strip())

        # Subtitle text overlay
        safe_title = seg["title"].replace(":", " -")
        safe_subtitle = seg["subtitle"]

        draw_title = f"drawtext=text='{safe_title}':x=60:y=60:fontsize=36:fontcolor=white:box=1:boxcolor=black@0.75:boxborderw=12"
        draw_sub = f"drawtext=text='{safe_subtitle}':x=60:y=115:fontsize=22:fontcolor=0x38BDF8:box=1:boxcolor=black@0.75:boxborderw=8"

        # Zoom/pan effect + overlay
        filter_complex = f"scale=1920:1080,format=yuv420p,{draw_title},{draw_sub}"

        cmd = [
            "ffmpeg", "-y",
            "-loop", "1", "-i", img_path,
            "-i", mp3_path,
            "-vf", filter_complex,
            "-c:v", "libx264", "-tune", "stillimage", "-c:a", "aac", "-b:a", "192k",
            "-pix_fmt", "yuv420p", "-shortest",
            "-t", str(duration + 0.5),
            seg_out
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        segment_videos.append(seg_out)
        print(f"  ✓ Rendered video segment: {seg_id}_rendered.mp4 ({duration:.1f}s)")

    # Concatenate all segments
    concat_list = os.path.join(OUTPUT_DIR, "concat_list.txt")
    with open(concat_list, "w") as f:
        for v in segment_videos:
            f.write(f"file '{v.replace(chr(92), '/')}'\n")

    final_mp4 = os.path.join(OUTPUT_DIR, "PayAgent_AI_Official_Demo_1080p.mp4")
    concat_cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-c", "copy",
        final_mp4
    ]
    subprocess.run(concat_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"🎉 FINAL DEMO VIDEO READY: {final_mp4}")

async def main():
    await generate_voiceovers()
    await capture_browser_scenes()
    compile_video()

if __name__ == "__main__":
    asyncio.run(main())
