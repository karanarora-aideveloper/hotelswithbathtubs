import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const USER_DATA_DIR = path.join(process.cwd(), '.pinterest_browser_profile');

/**
 * Ensures user profile dir exists and is gitignored
 */
function ensureProfileDir() {
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  // Ensure gitignored
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    if (!content.includes('.pinterest_browser_profile')) {
      fs.appendFileSync(gitignorePath, '\n.pinterest_browser_profile\n');
    }
  }
}

/**
 * Launches persistent browser context
 */
export async function getPinterestContext(headless = true) {
  ensureProfileDir();

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    executablePath: CHROME_PATH,
    headless: headless,
    viewport: { width: 1280, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });

  return context;
}

/**
 * Checks if user is logged into Pinterest
 */
export async function isPinterestLoggedIn(context) {
  const page = await context.newPage();
  await page.goto('https://www.pinterest.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const url = page.url();
  const isLoggedIn = !url.includes('/login') && (await page.locator('[data-test-id="header-profile"], [aria-label*="profile" i], [aria-label*="Profile" i], a[href*="/settings/"]').count()) > 0;
  await page.close();
  return isLoggedIn;
}

/**
 * Interactive 1-time login to save cookies
 */
export async function loginInteractive() {
  console.log('Opening Chrome for Pinterest Login...');
  const context = await getPinterestContext(false);
  const page = await context.newPage();
  await page.goto('https://www.pinterest.com/login/');

  console.log('👉 Please log into your Pinterest account in the opened Chrome window.');
  console.log('Waiting for successful login...');

  while (true) {
    await page.waitForTimeout(2000);
    const url = page.url();
    if (!url.includes('/login') && !url.includes('/signup')) {
      const loggedIn = await isPinterestLoggedIn(context);
      if (loggedIn) {
        console.log('✓ Successfully logged into Pinterest! Session saved.');
        break;
      }
    }
  }

  await context.close();
}

/**
 * Publishes a pin using Playwright
 */
export async function publishPinViaBrowser({ imagePath, title, description, link, boardName = 'Hotels with Bathtubs' }) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Pin image not found at ${imagePath}`);
  }

  const context = await getPinterestContext(true);

  try {
    const page = await context.newPage();
    console.log('Navigating to Pinterest Pin Creation Tool...');
    await page.goto('https://www.pinterest.com/pin-creation-tool/', { waitUntil: 'networkidle', timeout: 30000 });

    // Verify logged in
    if (page.url().includes('/login')) {
      await context.close();
      throw new Error('Not logged into Pinterest in browser profile. Please run `node scripts/pinterest_playwright.mjs --login` first.');
    }

    console.log('Uploading pin image...');
    const fileInput = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
    await fileInput.setInputFiles(imagePath);
    await page.waitForTimeout(2000);

    // Title input
    console.log('Entering pin title...');
    const titleSelector = '[placeholder*="Add a title"], [placeholder*="Title"], [data-test-id*="pin-draft-title"], textarea[id*="title"]';
    await page.waitForSelector(titleSelector, { timeout: 10000 });
    await page.fill(titleSelector, title);

    // Description input
    console.log('Entering pin description...');
    const descSelector = '[placeholder*="Tell everyone what your Pin is about"], [placeholder*="What is your Pin about"], [data-test-id*="pin-draft-description"], textarea[id*="description"], div[contenteditable="true"]';
    try {
      await page.fill(descSelector, description);
    } catch (e) {
      console.log('Trying fallback description field...');
      await page.locator(descSelector).first().fill(description);
    }

    // Link input
    console.log('Entering destination link...');
    const linkSelector = '[placeholder*="Add a link"], [placeholder*="Add a destination link"], [data-test-id*="pin-draft-link"], input[id*="link"]';
    await page.fill(linkSelector, link);

    // Select Board
    console.log(`Selecting board: ${boardName}...`);
    const boardDropdown = page.locator('[data-test-id="board-dropdown-select-button"], button[aria-label*="board" i]').first();
    if (await boardDropdown.isVisible()) {
      await boardDropdown.click();
      await page.waitForTimeout(1000);
      const boardOption = page.locator(`text=${boardName}`).first();
      if (await boardOption.isVisible()) {
        await boardOption.click();
      }
    }

    // Publish button
    console.log('Clicking Publish button...');
    const publishButton = page.locator('button:has-text("Publish"), [data-test-id="board-dropdown-save-button"]').first();
    await publishButton.click();

    // Wait for creation completion
    await page.waitForTimeout(5000);
    console.log('✓ Pin publication submitted successfully!');

    await context.close();
    return {
      success: true,
      title,
      link,
    };
  } catch (err) {
    await context.close();
    throw err;
  }
}

// CLI handler
if (process.argv.includes('--login')) {
  loginInteractive()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
