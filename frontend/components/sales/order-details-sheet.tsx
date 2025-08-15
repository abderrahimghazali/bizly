'use client';

import React, { useState, useCallback } from 'react';
import { Order, ordersApi, UpdateOrderData, orderStatuses } from '@/lib/api/orders';
import { BusinessSheet } from '@/components/ui/business-sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  IconEdit, 
  IconPhone, 
  IconMail, 
  IconClock, 
  IconBuilding,
  IconCurrencyDollar,
  IconUser,
  IconDeviceFloppy,
  IconX,
  IconCalendar,
  IconMapPin,
  IconId,
  IconShoppingCart,
  IconTruck,
  IconFileText
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface OrderDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
  onOrderUpdate?: (order: Order) => void;
}

export function OrderDetailsSheet({ open, onOpenChange, orderId, onOrderUpdate }: OrderDetailsSheetProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateOrderData>({
    title: '',
    description: '',
    status: 'pending',
    order_date: '',
    expected_delivery_date: '',
    subtotal: 0,
    tax_rate: 0,
    discount_rate: 0,
    currency: 'USD',
    shipping_address: '',
    billing_address: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      const orderData = await ordersApi.getById(orderId);
      setOrder(orderData);
      setEditData({
        title: orderData.title,
        description: orderData.description || '',
        status: orderData.status,
        order_date: orderData.order_date,
        expected_delivery_date: orderData.expected_delivery_date || '',
        subtotal: orderData.subtotal,
        tax_rate: orderData.tax_rate,
        discount_rate: orderData.discount_rate,
        currency: orderData.currency,
        shipping_address: orderData.shipping_address || '',
        billing_address: orderData.billing_address || '',
        notes: orderData.notes || '',
      });
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails();
    } else {
      setOrder(null);
      setIsEditing(false);
    }
  }, [open, orderId, fetchOrderDetails]);

  const handleSave = async () => {
    if (!order) return;
    
    try {
      setSaving(true);
      const response = await ordersApi.update(order.id, editData);
      
      if (response.success) {
        const updatedOrder = response.order;
        setOrder(updatedOrder);
        setIsEditing(false);
        onOrderUpdate?.(updatedOrder);
        toast.success(response.message || 'Order updated successfully!');
      }
    } catch (error: any) {
      console.error('Failed to update order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!order) return;
    setEditData({
      title: order.title,
      description: order.description || '',
      status: order.status,
      order_date: order.order_date,
      expected_delivery_date: order.expected_delivery_date || '',
      subtotal: order.subtotal,
      tax_rate: order.tax_rate,
      discount_rate: order.discount_rate,
      currency: order.currency,
      shipping_address: order.shipping_address || '',
      billing_address: order.billing_address || '',
      notes: order.notes || '',
    });
    setIsEditing(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <BusinessSheet 
        open={open}
        onOpenChange={onOpenChange}
        title="Loading..."
        description="Loading order details..."
        size="wide"
      >
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </BusinessSheet>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <BusinessSheet 
      open={open} 
      onOpenChange={onOpenChange}
      title={order.order_number}
      description={isEditing ? 'Edit order details' : 'View order information'}
      size="wide"
    >
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconShoppingCart className="h-5 w-5" />
              <span className="text-lg font-semibold">{order.order_number}</span>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} size="sm" disabled={saving}>
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline">
                    <IconX className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconFileText className="h-4 w-4" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Number</Label>
                  <div className="flex items-center space-x-2">
                    <IconId className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.order_number}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select
                      value={editData.status}
                      onValueChange={(value) => setEditData({ ...editData, status: value as Order['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(orderStatuses).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getStatusColor(order.status)}>
                      {orderStatuses[order.status]}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                {isEditing ? (
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="Order title"
                  />
                ) : (
                  <p className="text-sm">{order.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Order description"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {order.description || 'No description provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company & Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconBuilding className="h-4 w-4" />
                <span>Company & Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <div className="flex items-center space-x-2">
                    <IconBuilding className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.company?.name || 'No company'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <div className="flex items-center space-x-2">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.contact?.name || 'No contact'}</span>
                  </div>
                </div>
              </div>
              {order.contact?.email && (
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <div className="flex items-center space-x-2">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.contact.email}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconCurrencyDollar className="h-4 w-4" />
                <span>Financial Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subtotal</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.subtotal}
                      onChange={(e) => setEditData({ ...editData, subtotal: parseFloat(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="font-medium">{formatCurrency(order.subtotal, order.currency)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.tax_rate}
                      onChange={(e) => setEditData({ ...editData, tax_rate: parseFloat(e.target.value) || 0 })}
                    />
                  ) : (
                    <p>{order.tax_rate}%</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Rate (%)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.discount_rate}
                      onChange={(e) => setEditData({ ...editData, discount_rate: parseFloat(e.target.value) || 0 })}
                    />
                  ) : (
                    <p>{order.discount_rate}%</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  {isEditing ? (
                    <Input
                      value={editData.currency}
                      onChange={(e) => setEditData({ ...editData, currency: e.target.value })}
                    />
                  ) : (
                    <p>{order.currency}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Total Amount</Label>
                  <p className="text-lg font-bold">{formatCurrency(order.total_amount, order.currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconCalendar className="h-4 w-4" />
                <span>Dates & Delivery</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.order_date}
                      onChange={(e) => setEditData({ ...editData, order_date: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(order.order_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Expected Delivery</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.expected_delivery_date}
                      onChange={(e) => setEditData({ ...editData, expected_delivery_date: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <IconTruck className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {order.expected_delivery_date 
                          ? new Date(order.expected_delivery_date).toLocaleDateString() 
                          : 'Not set'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconMapPin className="h-4 w-4" />
                <span>Addresses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Shipping Address</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.shipping_address}
                    onChange={(e) => setEditData({ ...editData, shipping_address: e.target.value })}
                    placeholder="Shipping address"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {order.shipping_address || 'No shipping address provided'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Billing Address</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.billing_address}
                    onChange={(e) => setEditData({ ...editData, billing_address: e.target.value })}
                    placeholder="Billing address"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {order.billing_address || 'No billing address provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isEditing ? (
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Additional notes"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {order.notes || 'No notes provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quote Reference */}
          {order.quote && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconFileText className="h-4 w-4" />
                  <span>Quote Reference</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <IconFileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{order.quote.quote_number}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-sm text-muted-foreground">{order.quote.title}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconClock className="h-4 w-4" />
                <span>Timestamps</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created</Label>
                  <div className="flex items-center space-x-2">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <Label>Updated</Label>
                  <div className="flex items-center space-x-2">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(order.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </BusinessSheet>
  );
}