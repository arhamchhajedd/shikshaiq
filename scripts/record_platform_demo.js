/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = "/tmp/demo_videos";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Injects a smooth visual mouse cursor indicator
async function injectCursor(page) {
  await page.evaluate(() => {
    const cursor = document.createElement("div");
    cursor.id = "playwright-demo-cursor";
    cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 20px;
      height: 20px;
      border: 2px solid #000;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: width 0.15s, height 0.15s, background-color 0.15s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(cursor);

    window.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    window.addEventListener("mousedown", () => {
      cursor.style.width = "28px";
      cursor.style.height = "28px";
      cursor.style.background = "rgba(0, 0, 0, 0.4)";
    });

    window.addEventListener("mouseup", () => {
      cursor.style.width = "20px";
      cursor.style.height = "20px";
      cursor.style.background = "rgba(255, 255, 255, 0.9)";
    });
  });
}

async function moveMouseSmooth(page, targetX, targetY, steps = 25) {
  await page.mouse.move(targetX, targetY, { steps });
}

async function smoothScrollBy(page, distance, durationMs = 1200) {
  const steps = 30;
  const stepDistance = distance / steps;
  const interval = durationMs / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy({ top: d, behavior: "instant" }), stepDistance);
    await page.waitForTimeout(interval);
  }
}

async function recordScene(sceneName, targetDurationSec, actionFn) {
  console.log(`Starting ${sceneName} (Target: ~${targetDurationSec}s)...`);
  const sceneDir = path.join(OUTPUT_DIR, sceneName);
  if (!fs.existsSync(sceneDir)) fs.mkdirSync(sceneDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--hide-scrollbars"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: sceneDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();
  const startTime = Date.now();

  try {
    await actionFn(page);
  } catch (err) {
    console.error(`Error in ${sceneName}:`, err);
  }

  // Ensure scene meets target duration
  const elapsedSec = (Date.now() - startTime) / 1000;
  if (elapsedSec < targetDurationSec) {
    const remainMs = Math.ceil((targetDurationSec - elapsedSec) * 1000);
    console.log(`Padding ${sceneName} with ${remainMs}ms...`);
    await page.waitForTimeout(remainMs);
  }

  await context.close();
  await browser.close();

  // Find recorded webm and rename
  const files = fs.readdirSync(sceneDir).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    const recordedPath = path.join(sceneDir, files[0]);
    const finalPath = path.join(OUTPUT_DIR, `${sceneName}.webm`);
    fs.renameSync(recordedPath, finalPath);
    console.log(`Completed ${sceneName} -> ${finalPath}`);
  }
}

async function main() {
  // Scene 1: Public Landing Page
  await recordScene("scene1", 21.0, async (page) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await injectCursor(page);
    await moveMouseSmooth(page, 640, 280);
    await page.waitForTimeout(2500);

    // Scroll to Learning Paths section
    await smoothScrollBy(page, 850, 3000);
    await page.waitForTimeout(1500);

    // Hover over Rohan Sharma's Root Gap card
    await moveMouseSmooth(page, 950, 480, 30);
    await page.waitForTimeout(3000);

    // Scroll further to How it works
    await smoothScrollBy(page, 700, 2500);
    await page.waitForTimeout(2000);

    // Scroll back to header
    await smoothScrollBy(page, -1550, 2500);
    await page.waitForTimeout(1500);
  });

  // Scene 2: Authentication Portal
  await recordScene("scene2", 13.0, async (page) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await injectCursor(page);
    await page.waitForTimeout(1000);

    // Hover over supported roles
    await moveMouseSmooth(page, 640, 560, 25);
    await page.waitForTimeout(1500);

    // Fill credentials
    await moveMouseSmooth(page, 640, 285, 20);
    await page.click("#email");
    await page.fill("#email", "rohan_demo@shikshaiq.edu.in");
    await page.waitForTimeout(800);

    await moveMouseSmooth(page, 640, 365, 20);
    await page.click("#pass");
    await page.fill("#pass", "Password123!");
    await page.waitForTimeout(1000);

    // Click submit
    await moveMouseSmooth(page, 640, 435, 20);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
  });

  // Helper login for student session
  async function loginAsStudent(page) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("#email", "rohan_demo@shikshaiq.edu.in");
    await page.fill("#pass", "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/student", { timeout: 15000 });
  }

  // Scene 3: Student Learning Dashboard
  await recordScene("scene3", 23.5, async (page) => {
    await loginAsStudent(page);
    await injectCursor(page);
    await page.waitForTimeout(1500);

    // Hover over StreakCard
    await moveMouseSmooth(page, 320, 240, 25);
    await page.waitForTimeout(1500);

    // Hover over Star Rating
    await moveMouseSmooth(page, 640, 240, 25);
    await page.waitForTimeout(1500);

    // Click offline download
    const downloadBtn = await page.$("button:has-text('Download for Offline Practice')");
    if (downloadBtn) {
      const box = await downloadBtn.boundingBox();
      if (box) {
        await moveMouseSmooth(page, box.x + box.width / 2, box.y + box.height / 2, 25);
        await downloadBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    // Scroll to Parent Progress Report button
    const parentReportBtn = await page.$("button:has-text('Parent Progress Report')");
    if (parentReportBtn) {
      const box = await parentReportBtn.boundingBox();
      if (box) {
        await moveMouseSmooth(page, box.x + box.width / 2, box.y + box.height / 2, 25);
        await parentReportBtn.click();
        await page.waitForTimeout(3500);

        // Close report modal
        const closeBtn = await page.$("button:has-text('Close')");
        if (closeBtn) await closeBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // Scroll down to review concept modules
    await smoothScrollBy(page, 450, 2000);
    await page.waitForTimeout(2000);
  });

  // Scene 4: Diagnostic Assessment Runner
  await recordScene("scene4", 18.0, async (page) => {
    await loginAsStudent(page);
    await page.goto(`${BASE_URL}/student/assessment`, { waitUntil: "networkidle" });
    await injectCursor(page);
    await page.waitForTimeout(2000);

    // View Question 1, select an option
    const options = await page.$$("button[role='radio'], input[type='radio'], label");
    if (options.length > 0) {
      const box = await options[1].boundingBox();
      if (box) {
        await moveMouseSmooth(page, box.x + box.width / 2, box.y + box.height / 2, 20);
        await options[1].click();
        await page.waitForTimeout(1500);
      }
    }

    // Click Next
    const nextBtn = await page.$("button:has-text('Next Question')");
    if (nextBtn) {
      const box = await nextBtn.boundingBox();
      if (box) {
        await moveMouseSmooth(page, box.x + box.width / 2, box.y + box.height / 2, 20);
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Select option for Question 2
    const options2 = await page.$$("button[role='radio'], input[type='radio'], label");
    if (options2.length > 2) {
      const box = await options2[2].boundingBox();
      if (box) {
        await moveMouseSmooth(page, box.x + box.width / 2, box.y + box.height / 2, 20);
        await options2[2].click();
        await page.waitForTimeout(1500);
      }
    }

    // Hover over timer and question navigator
    await moveMouseSmooth(page, 950, 150, 25);
    await page.waitForTimeout(3000);
  });

  // Scene 5: Diagnostic Results & Prerequisite Root Gap
  await recordScene("scene5", 23.5, async (page) => {
    await loginAsStudent(page);
    await page.goto(`${BASE_URL}/student/results`, { waitUntil: "networkidle" });
    await injectCursor(page);
    await page.waitForTimeout(2000);

    // Scroll to results summary and root gap
    await smoothScrollBy(page, 300, 1500);
    await page.waitForTimeout(2000);

    // Hover over root gap alert
    await moveMouseSmooth(page, 640, 320, 25);
    await page.waitForTimeout(3500);

    // Scroll down to question-by-question review
    await smoothScrollBy(page, 450, 2000);
    await page.waitForTimeout(2500);

    // Expand accordion item
    const accordionBtn = await page.$("button:has-text('Question 1'), [aria-expanded]");
    if (accordionBtn) {
      const box = await accordionBtn.boundingBox();
      if (box) {
        await moveMouseSmooth(page, box.x + box.width / 2, box.y + box.height / 2, 20);
        await accordionBtn.click();
        await page.waitForTimeout(3000);
      }
    }
  });

  // Scene 6: Interactive Concept Lesson
  await recordScene("scene6", 11.5, async (page) => {
    await loginAsStudent(page);
    await page.goto(`${BASE_URL}/student/learn/equivalent-fractions`, { waitUntil: "networkidle" });
    await injectCursor(page);
    await page.waitForTimeout(1500);

    // Scroll down to visual diagrams and worked examples
    await smoothScrollBy(page, 500, 2500);
    await page.waitForTimeout(2000);

    // Scroll further to common misconceptions
    await smoothScrollBy(page, 500, 2500);
    await page.waitForTimeout(2000);
  });

  // Scene 7: Interactive Practice & AI Socratic Tutor
  await recordScene("scene7", 20.0, async (page) => {
    await loginAsStudent(page);
    await page.goto(`${BASE_URL}/student/practice/equivalent-fractions`, { waitUntil: "networkidle" });
    await injectCursor(page);
    await page.waitForTimeout(2000);

    // Move to and open AI Socratic Tutor drawer
    const tutorTrigger = await page.$("button:has-text('AI Tutor'), button:has-text('Ask Socratic Tutor')");
    if (tutorTrigger) {
      const box = await tutorTrigger.boundingBox();
      if (box) {
        await moveMouseSmooth(page, box.x + box.width / 2, box.y + box.height / 2, 25);
        await tutorTrigger.click();
        await page.waitForTimeout(2000);

        // Click a quick hint prompt
        const hintChip = await page.$("button:has-text('Give me a hint'), button:has-text('Explain this concept')");
        if (hintChip) {
          const cBox = await hintChip.boundingBox();
          if (cBox) {
            await moveMouseSmooth(page, cBox.x + cBox.width / 2, cBox.y + cBox.height / 2, 20);
            await hintChip.click();
            await page.waitForTimeout(5000);
          }
        }
      }
    } else {
      await page.waitForTimeout(5000);
    }
  });

  // Scene 8: Pending Teacher Zero-Trust Screen
  await recordScene("scene8", 19.0, async (page) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await injectCursor(page);

    // Enter teacher credentials
    await page.fill("#email", "demo_teacher_1793539569045@school.edu.in");
    await page.fill("#pass", "Password123!");
    await page.click('button[type="submit"]');

    // Waits for redirection to /pending-approval
    await page.waitForURL("**/pending-approval", { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Hover over Verification Required badge
    await moveMouseSmooth(page, 640, 260, 25);
    await page.waitForTimeout(2000);

    // Hover over Data Governance points
    await moveMouseSmooth(page, 640, 440, 25);
    await page.waitForTimeout(2500);

    // Hover over Check Status button
    const checkBtn = await page.$("button:has-text('Check Status')");
    if (checkBtn) {
      const bBox = await checkBtn.boundingBox();
      if (bBox) {
        await moveMouseSmooth(page, bBox.x + bBox.width / 2, bBox.y + bBox.height / 2, 20);
        await page.waitForTimeout(2500);
      }
    }
  });

  // Scene 9: Platform Outro
  await recordScene("scene9", 16.5, async (page) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await injectCursor(page);
    await page.waitForTimeout(1500);

    // Scroll to Final CTA section
    await smoothScrollBy(page, 1800, 3000);
    await page.waitForTimeout(2000);

    // Hover on Get Started button
    const ctaBtn = await page.$("a:has-text('Get Started'), button:has-text('Get Started')");
    if (ctaBtn) {
      const bBox = await ctaBtn.boundingBox();
      if (bBox) {
        await moveMouseSmooth(page, bBox.x + bBox.width / 2, bBox.y + bBox.height / 2, 25);
        await page.waitForTimeout(3000);
      }
    }
  });

  console.log("All scenes recorded successfully!");
}

main().catch(console.error);
