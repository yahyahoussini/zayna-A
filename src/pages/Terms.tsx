
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using MyCODStore, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>2. Payment and Cash on Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                MyCODStore operates exclusively on a Cash on Delivery (COD) payment system. This means:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Payment is made in cash when you receive your order</li>
                <li>No advance payment is required when placing an order</li>
                <li>You must have the exact amount ready upon delivery</li>
                <li>Delivery personnel cannot provide change for large denominations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>3. Order Process</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you place an order with us:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You will receive an order confirmation with a tracking number</li>
                <li>We will contact you to confirm delivery details</li>
                <li>Delivery typically takes 2-5 business days</li>
                <li>You must be available at the specified address during delivery</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Delivery Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our delivery policy includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Free delivery for orders over $50</li>
                <li>$9.99 delivery fee for orders under $50</li>
                <li>Delivery attempts will be made during business hours</li>
                <li>If delivery fails, we will contact you to reschedule</li>
                <li>Orders must be collected within 7 days of delivery attempt</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Returns and Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may return items within 30 days of delivery if:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Items are in original condition and packaging</li>
                <li>Items are not damaged due to misuse</li>
                <li>You have the original receipt or order confirmation</li>
                <li>Refunds will be processed within 5-7 business days</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                We strive to provide accurate product descriptions and images. However, we cannot guarantee that product colors will be exactly as shown on your screen due to monitor variations. If you receive a product that significantly differs from the description, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                MyCODStore shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-4 text-gray-700">
                <p>Email: info@mycodstore.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Business Street, City, State 12345</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-gray-600 mt-8">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
