import { authTest, expect, test } from "@/playwright/fixtures";
import { generateValidOTP } from "@/tests/utils/authenticator";
import { waitForCaptcha } from "@/tests/utils/captcha";
import { TOTP_USER_SECRET } from "@/tests/utils/constants";

test.describe("2FA Page", () => {
	test.beforeEach(async ({ page, twoFactorAuth }) => {
		// Navigate to login page
		await page.goto("http://localhost:5002/auth/login");

		// Wait for recaptcha to load
		await waitForCaptcha({ page });

		// Fill form with credentials that require 2FA
		await page.getByLabel("Email Address").fill(twoFactorAuth.account.email);
		await page
			.getByRole("textbox", { name: "Password Password" })
			.fill("Password123!");
		await page.getByRole("button", { name: "Log in" }).click();

		// Should redirect to 2FA page
		await page.waitForURL("http://localhost:5002/auth/2fa");

		// Wait for recaptcha to load
		await waitForCaptcha({ page });
	});

	test("should display 2FA form with all elements", async ({ page }) => {
		// Check page title
		await expect(page).toHaveTitle(/Two Factor Authentication/);

		// Check form elements
		await expect(page.getByLabel("Authentication Code")).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Verify Code" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Use a recovery code" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Try another sign in method" }),
		).toBeVisible();

		// ensure recaptcha terms and conditions are visible
		await expect(
			page.getByText(/This site is protected by Cloudflare Turnstile/),
		).toBeVisible();
		await expect(page.getByText("Cloudflare Privacy Policy")).toBeVisible();
	});

	test("should navigate to 2FA recovery page", async ({ page }) => {
		// increase timeout to incorporate navigation
		test.setTimeout(30_000);
		// Click on 2fa recovery link
		await page.getByRole("link", { name: /Use a recovery code/ }).click();

		// Verify navigation
		await expect(page).toHaveURL(/\/auth\/2fa\/recovery/);
	});

	test("should validate empty form submission", async ({ page }) => {
		// Submit without entering data
		await page.getByRole("button", { name: "Verify Code" }).click();

		// Check validation messages
		await expect(
			page
				.locator("div")
				.filter({ hasText: /^This field is required$/ })
				.first(),
		).toBeVisible();
	});

	test("should validate invalid authentication code", async ({ page }) => {
		// Enter invalid email
		await page.getByLabel("Authentication Code").fill("XXXXXXX");
		await page.getByRole("button", { name: "Verify Code" }).click();

		// Check validation message
		await expect(
			page
				.locator("div")
				.filter({ hasText: /^Invalid credentials provided.$/ })
				.first(),
		).toBeVisible();
	});

	test("should successfully verify valid authentication code", async ({
		page,
	}) => {
		const otp = await generateValidOTP({
			totp_secret: TOTP_USER_SECRET,
		});

		await page.getByLabel("Authentication Code").fill(otp);
		await page.getByRole("button", { name: "Verify Code" }).click();

		// Should redirect to home page
		await page.waitForURL("http://localhost:5000/");
	});
});

test.describe("2FA Page 2FA Challenge Redirects", () => {
	test("should redirect to login page when 2fa challenge expires/ is invalid", async ({
		page,
	}) => {
		// Navigate to 2FA page
		await page.goto("http://localhost:5002/auth/2fa");

		// expect to redirect to login page
		await page.waitForURL("http://localhost:5002/auth/login");
	});
});

authTest.describe("2FA Page 2FA Authentication Redirects", () => {
	authTest(
		"should redirect to home page when already authenticated",
		async ({ page }) => {
			await page.goto("http://localhost:5002/auth/2fa");
			await page.waitForURL("http://localhost:5000/");
		},
	);
});
