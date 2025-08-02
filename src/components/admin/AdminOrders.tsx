import { useState } from 'react';
import { Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Order } from '@/types/admin';

// Interface pour inclure les articles de la commande
interface OrderWithItems extends Order {
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    product_price: number;
  }>;
  shipping_address: string; // S'assurer que l'adresse est incluse
}

interface AdminOrdersProps {
  orders: OrderWithItems[];
  updateOrderStatus: (orderId: string, newStatus: string) => void;
  page: number;
  setPage: (page: number) => void;
  total: number;
  itemsPerPage: number;
}

export const AdminOrders = ({ orders, updateOrderStatus, page, setPage, total, itemsPerPage }: AdminOrdersProps) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const totalPages = Math.ceil(total / itemsPerPage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Card className="non-printable">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Manage and track customer orders. Showing page {page} of {totalPages}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            ) : (
              orders.map((order) => (
                <div key={order.order_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{order.order_id}</p>
                        <p className="text-sm text-gray-600">
                          {order.customer_first_name} {order.customer_last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{(order.total || 0).toFixed(2)} DH </p>
                        <p className="text-sm text-gray-600">
                          {order.shipping_city}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      order.status === 'pending' ? 'default' :
                      order.status === 'shipped' ? 'secondary' :
                      order.status === 'canceled' || order.status === 'returned' ? 'destructive' :
                      'default'
                    } className={
                      order.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-500/80' : 
                      order.status === 'confirmed' ? 'bg-blue-500 hover:bg-blue-500/80' :
                      order.status === 'delivered' ? 'bg-green-500 hover:bg-green-500/80' : ''
                    }>
                      {order.status}
                    </Badge>
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.order_id, value)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Details</DialogTitle>
                          <DialogDescription>
                            Order ID: {selectedOrder?.order_id}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Customer Information</h4>
                              <p>{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                              {/* MISE À JOUR : Affiche l'email seulement s'il existe */}
                              {selectedOrder.customer_email && <p>{selectedOrder.customer_email}</p>}
                              <p>{selectedOrder.customer_phone}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Shipping Details</h4>
                              {/* MISE À JOUR : Ajout de l'adresse de livraison complète */}
                              <p>Address: {selectedOrder.shipping_address}</p>
                              <p>City: {selectedOrder.shipping_city}</p>
                              {selectedOrder.notes && <p>Notes: {selectedOrder.notes}</p>}
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Order Items</h4>
                                <ul className="space-y-2">
                                    {selectedOrder.order_items.map(item => (
                                        <li key={item.id} className="flex justify-between text-sm">
                                            <span>{item.product_name} x {item.quantity}</span>
                                            <span>{(item.product_price * item.quantity).toFixed(2)} DH </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>{(selectedOrder.total || 0).toFixed(2)} DH </span>
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Order
                            </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <div className="p-4 border-t flex justify-between items-center">
            <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
            >
                Previous
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
            >
                Next
            </Button>
        </div>
      </Card>
      
      {/* La section imprimable reste la même */}
      {selectedOrder && (
        <div id="printable-area" className="hidden print:block p-8">
            <h1 className="text-2xl font-bold mb-4">Order Invoice</h1>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <h2 className="font-semibold">MyCODStore</h2>
                    <p>123 Business Street</p>
                    <p>City, State 12345</p>
                </div>
                <div className="text-right">
                    <p><span className="font-semibold">Order ID:</span> {selectedOrder.order_id}</p>
                    <p><span className="font-semibold">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="mb-6">
                <h3 className="font-semibold border-b pb-1 mb-2">Bill To:</h3>
                <p>{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                <p>{selectedOrder.shipping_address}</p>
                <p>{selectedOrder.shipping_city}</p>
                <p>{selectedOrder.customer_phone}</p>
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2">Item</th>
                        <th className="p-2 text-center">Quantity</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedOrder.order_items.map(item => (
                        <tr key={item.id} className="border-b">
                            <td className="p-2">{item.product_name}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">{item.product_price.toFixed(2)} DH </td>
                            <td className="p-2 text-right">{(item.product_price * item.quantity).toFixed(2)} DH </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3} className="p-2 text-right font-semibold">Subtotal</td>
                        <td className="p-2 text-right">{selectedOrder.subtotal.toFixed(2)} DH </td>
                    </tr>
                    <tr>
                        <td colSpan={3} className="p-2 text-right font-semibold">Shipping</td>
                        <td className="p-2 text-right">{selectedOrder.shipping_cost.toFixed(2)} DH </td>
                    </tr>
                    <tr className="bg-gray-100 font-bold">
                        <td colSpan={3} className="p-2 text-right">Total</td>
                        <td className="p-2 text-right">{selectedOrder.total.toFixed(2)} DH </td>
                    </tr>
                </tfoot>
            </table>
            <p className="mt-8 text-center text-sm">Thank you for your business!</p>
        </div>
      )}
    </>
  );
};