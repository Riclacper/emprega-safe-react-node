import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of ["/", "/login", "/register"]) {
  test(`has no serious accessibility violations on ${route}`, async ({
    page,
  }, testInfo) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact),
    );

    await testInfo.attach("axe-results", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });

    expect(seriousViolations).toEqual([]);
  });
}

for (const route of ["/", "/login", "/register"]) {
  test(`dark theme has no serious accessibility violations on ${route}`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(route);

    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact),
    );

    await testInfo.attach("axe-dark-theme-results", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });

    expect(seriousViolations).toEqual([]);
  });
}
