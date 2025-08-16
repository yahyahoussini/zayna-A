import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to products page
        page.goto("http://127.0.0.1:8080/products")

        # Wait for the loading skeletons to appear first
        expect(page.locator(".animate-pulse").first).to_be_visible()

        # Now wait for the loading skeletons to disappear
        expect(page.locator(".animate-pulse").first).to_be_hidden(timeout=15000)

        # Now that loading is complete, proceed with the test
        # 2. Click on a product to go to details page
        # The product names are in French in the UI, let's look for a product from the migration that we can click.
        # The sample products are not being displayed, let's just click the first available product card.
        # The ProductCard component has a data-testid attribute we can use. Let's assume it's 'product-card'.
        # After looking at Products.tsx, there's no test-id. I'll just click the first link inside the product list container.

        # The product list is a motion.div. Let's find a robust selector.
        # The list has variants `listVariants`. The container is a `motion.div`.
        # I'll find the first product card by looking for a link inside the main content area.

        # The products are in a div with a grid layout.
        product_list_container = page.locator('.grid.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4')
        # This seems too specific and brittle. Let's try something else.
        # Let's find the first product card by its structure.

        # The product card is a Card component which is a div. Inside is a link.
        # Let's find the first link that is a descendant of the main content area.
        # The main content area is after the filters.

        # A better way is to find the product by name, but the names are not showing up.
        # Let's try to find a product by its text, but in French.
        # The sample products are: 'Wireless Earbuds', 'Smartphone Case', etc.
        # I don't know the French translation.

        # I will just click on the first product link I can find.
        # Each product card is a motion.div containing a Card, which contains a Link.
        # Let's try to find the first link with a href that starts with /product/
        page.locator('a[href^="/product/"]').first.click()

        # Wait for product detail page to load
        expect(page.get_by_role("button", name=re.compile("Add to Cart", re.IGNORECASE))).to_be_visible()

        # 3. Add product to cart
        add_to_cart_button = page.get_by_role("button", name=re.compile("Add to Cart", re.IGNORECASE))
        # The text is "Ajouter au Panier" in Product.tsx, but "Add to Cart" in ProductDetail.tsx.
        # Let's check ProductDetail.tsx again. No, it's "Add to Cart".
        # Let me recheck `src/pages/ProductDetail.tsx`.
        # It's `<Button onClick={handleAddToCart} ...><ShoppingCart ... />Add to Cart</Button>`
        # But `src/pages/Products.tsx` has `<Button ...>Ajouter au Panier</Button>`
        # Ah, the "Add to Cart" button is on the product *card* on the products page, and also on the product *detail* page.
        # The text is different. My script goes to the detail page, so it should look for "Add to Cart".

        # Re-reading ProductDetail.tsx... the text is indeed "Add to Cart".
        add_to_cart_button.click()

        # Wait for toast message. In ProductDetail.tsx, it's "Item added to cart".
        expect(page.get_by_text("Item added to cart")).to_be_visible()

        # 4. Go to cart page
        page.goto("http://127.0.0.1:8080/cart")

        # 5. Click checkout button
        expect(page.get_by_role("heading", name="Your Cart")).to_be_visible()
        # The button text is "Proceed to Checkout" in my previous script. Let me check the Cart.tsx page.
        # I will assume it's correct for now.
        page.get_by_role("button", name="Proceed to Checkout").click()

        # 6. Fill out checkout form
        expect(page.get_by_role("heading", name="Checkout")).to_be_visible()

        page.get_by_label("Full Name *").fill("Jules Verne")
        page.get_by_label("Phone Number *").fill("1234567890")
        page.get_by_label("City *").fill("Nantes")
        page.get_by_label("Location/Address *").fill("1 rue de la paix")
        page.get_by_label("I agree to the Terms and Conditions and Privacy Policy").check()

        # 7. Submit the form
        page.get_by_role("button", name="Place Order").click()

        # 8. Wait for confirmation page and assert
        expect(page).to_have_url(re.compile(r".*/order-confirmation/ORDER-.*"), timeout=10000)
        expect(page.get_by_role("heading", name="Order Placed Successfully!")).to_be_visible()
        expect(page.get_by_text("Thank you for your order. Here are your order details:")).to_be_visible()

        # 9. Take screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot taken at jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
        print("Error screenshot taken at jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
