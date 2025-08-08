from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Go to products page
        page.goto("http://127.0.0.1:8080/products")
        expect(page.get_by_role("heading", name="Notre Collection")).to_be_visible()

        # Add a product to the cart
        page.locator('.grid > div:nth-child(1) > .overflow-hidden > .p-0 > .p-4 > .w-full').click(force=True)

        # Go to checkout page
        page.goto("http://127.0.0.1:8080/checkout")
        expect(page.get_by_role("heading", name="Checkout"), timeout=10000).to_be_visible()

        # Fill out the form
        page.get_by_label("Full Name").fill("Test User")
        page.get_by_label("Phone Number").fill("1234567890")
        page.get_by_label("City").fill("Test City")
        page.get_by_label("Location/Address").fill("Test Address")
        page.get_by_label("I agree to the Terms and Conditions and Privacy Policy").check()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/checkout.png")

    except Exception as e:
        page.screenshot(path="jules-scratch/verification/error.png")
        raise e

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
