import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = `file:///${path.resolve(__dirname, '../index.html').replace(/\\/g, '/')}`;

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
  // localStorage 초기화
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

// ─────────────────────────────────────────
// 1. 기본 렌더링
// ─────────────────────────────────────────
test('초기 상태: 빈 리스트 메시지가 보인다', async ({ page }) => {
  await expect(page.locator('.empty')).toBeVisible();
  await expect(page.locator('.empty')).toContainText('리스트가 비어 있어요');
  await expect(page.locator('#progress-label')).toHaveText('항목 없음');
});

test('초기 상태: "완료 항목 삭제" 버튼이 비활성화되어 있다', async ({ page }) => {
  await expect(page.locator('#clear-btn')).toBeDisabled();
});

// ─────────────────────────────────────────
// 2. 항목 추가
// ─────────────────────────────────────────
test('추가 버튼 클릭으로 항목을 추가할 수 있다', async ({ page }) => {
  await page.fill('#input', '우유');
  await page.click('#add-btn');

  await expect(page.locator('.item-text').first()).toHaveText('우유');
  await expect(page.locator('.empty')).not.toBeVisible();
});

test('Enter 키로 항목을 추가할 수 있다', async ({ page }) => {
  await page.fill('#input', '달걀');
  await page.press('#input', 'Enter');

  await expect(page.locator('.item-text').first()).toHaveText('달걀');
});

test('추가 후 입력창이 비워진다', async ({ page }) => {
  await page.fill('#input', '빵');
  await page.click('#add-btn');

  await expect(page.locator('#input')).toHaveValue('');
});

test('공백만 입력하면 항목이 추가되지 않는다', async ({ page }) => {
  await page.fill('#input', '   ');
  await page.click('#add-btn');

  await expect(page.locator('.empty')).toBeVisible();
});

test('여러 항목을 연속으로 추가할 수 있다', async ({ page }) => {
  for (const name of ['사과', '바나나', '오렌지']) {
    await page.fill('#input', name);
    await page.click('#add-btn');
  }

  const items = page.locator('.item-text');
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toHaveText('사과');
  await expect(items.nth(1)).toHaveText('바나나');
  await expect(items.nth(2)).toHaveText('오렌지');
});

// ─────────────────────────────────────────
// 3. 체크박스 (완료 토글)
// ─────────────────────────────────────────
test('체크박스를 클릭하면 항목이 완료 상태가 된다', async ({ page }) => {
  await page.fill('#input', '치즈');
  await page.click('#add-btn');

  const item = page.locator('.item').first();
  await item.locator('input[type="checkbox"]').check();

  await expect(item).toHaveClass(/done/);
  await expect(item.locator('.item-text')).toHaveCSS('text-decoration', /line-through/);
});

test('완료 상태에서 체크박스를 다시 클릭하면 미완료로 돌아간다', async ({ page }) => {
  await page.fill('#input', '요거트');
  await page.click('#add-btn');

  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.check();
  await checkbox.uncheck();

  await expect(page.locator('.item').first()).not.toHaveClass(/done/);
});

// ─────────────────────────────────────────
// 4. 진행률 표시
// ─────────────────────────────────────────
test('항목 추가 시 진행률 레이블이 업데이트된다', async ({ page }) => {
  await page.fill('#input', '버터');
  await page.click('#add-btn');

  await expect(page.locator('#progress-label')).toHaveText('0 / 1 완료 (0%)');
});

test('항목을 완료하면 진행률이 올라간다', async ({ page }) => {
  await page.fill('#input', '잼');
  await page.click('#add-btn');
  await page.locator('input[type="checkbox"]').first().check();

  await expect(page.locator('#progress-label')).toHaveText('1 / 1 완료 (100%)');
});

test('2개 중 1개 완료 시 50%로 표시된다', async ({ page }) => {
  for (const name of ['아이템1', '아이템2']) {
    await page.fill('#input', name);
    await page.click('#add-btn');
  }
  await page.locator('input[type="checkbox"]').first().check();

  await expect(page.locator('#progress-label')).toHaveText('1 / 2 완료 (50%)');
});

// ─────────────────────────────────────────
// 5. 항목 삭제
// ─────────────────────────────────────────
test('✕ 버튼으로 항목을 삭제할 수 있다', async ({ page }) => {
  await page.fill('#input', '우유');
  await page.click('#add-btn');

  await page.locator('.delete-btn').first().click();

  await expect(page.locator('.item')).toHaveCount(0);
  await expect(page.locator('.empty')).toBeVisible();
});

test('특정 항목만 삭제하고 나머지는 유지된다', async ({ page }) => {
  for (const name of ['A', 'B', 'C']) {
    await page.fill('#input', name);
    await page.click('#add-btn');
  }

  // 두 번째 항목(B) 삭제
  await page.locator('.delete-btn').nth(1).click();

  const items = page.locator('.item-text');
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toHaveText('A');
  await expect(items.nth(1)).toHaveText('C');
});

// ─────────────────────────────────────────
// 6. 완료 항목 일괄 삭제
// ─────────────────────────────────────────
test('완료 항목이 있으면 "완료 항목 삭제" 버튼이 활성화된다', async ({ page }) => {
  await page.fill('#input', '커피');
  await page.click('#add-btn');
  await page.locator('input[type="checkbox"]').first().check();

  await expect(page.locator('#clear-btn')).toBeEnabled();
});

test('"완료 항목 삭제" 클릭 시 완료 항목만 제거된다', async ({ page }) => {
  for (const name of ['완료1', '미완료', '완료2']) {
    await page.fill('#input', name);
    await page.click('#add-btn');
  }

  // 1번, 3번 완료
  await page.locator('input[type="checkbox"]').nth(0).check();
  await page.locator('input[type="checkbox"]').nth(2).check();

  await page.click('#clear-btn');

  const items = page.locator('.item-text');
  await expect(items).toHaveCount(1);
  await expect(items.first()).toHaveText('미완료');
});

// ─────────────────────────────────────────
// 7. localStorage 저장
// ─────────────────────────────────────────
test('페이지 새로고침 후에도 항목이 유지된다', async ({ page }) => {
  await page.fill('#input', '새로고침 테스트');
  await page.click('#add-btn');

  await page.reload();

  await expect(page.locator('.item-text').first()).toHaveText('새로고침 테스트');
});

test('체크 상태가 새로고침 후에도 유지된다', async ({ page }) => {
  await page.fill('#input', '지속성 테스트');
  await page.click('#add-btn');
  await page.locator('input[type="checkbox"]').first().check();

  await page.reload();

  await expect(page.locator('.item').first()).toHaveClass(/done/);
});
