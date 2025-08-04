<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['company', 'contact', 'user', 'quote']);
        
        // If user is not admin, only show their own orders
        if (!auth()->user()->hasRole('admin')) {
            $query->where('user_id', auth()->id());
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $orders = $query->latest()->paginate(10);

        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'quote_id' => 'nullable|exists:quotes,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date|after:order_date',
            'subtotal' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|size:3',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $taxRate = $validated['tax_rate'] ?? 0;
        $discountRate = $validated['discount_rate'] ?? 0;
        $subtotal = $validated['subtotal'];

        $discountAmount = ($subtotal * $discountRate) / 100;
        $taxableAmount = $subtotal - $discountAmount;
        $taxAmount = ($taxableAmount * $taxRate) / 100;
        $totalAmount = $taxableAmount + $taxAmount;

        $order = Order::create([
            ...$validated,
            'user_id' => auth()->id(),
            'order_number' => $this->generateOrderNumber(),
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'status' => 'pending',
        ]);

        return response()->json($order->load(['company', 'contact', 'user', 'quote']), 201);
    }

    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);
        return response()->json($order->load(['company', 'contact', 'user', 'quote']));
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $this->authorize('update', $order);

        $validated = $request->validate([
            'company_id' => 'sometimes|exists:companies,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'quote_id' => 'nullable|exists:quotes,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,confirmed,processing,shipped,delivered,cancelled',
            'order_date' => 'sometimes|date',
            'expected_delivery_date' => 'nullable|date|after:order_date',
            'subtotal' => 'sometimes|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|size:3',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['subtotal']) || isset($validated['tax_rate']) || isset($validated['discount_rate'])) {
            $taxRate = $validated['tax_rate'] ?? $order->tax_rate;
            $discountRate = $validated['discount_rate'] ?? $order->discount_rate;
            $subtotal = $validated['subtotal'] ?? $order->subtotal;

            $discountAmount = ($subtotal * $discountRate) / 100;
            $taxableAmount = $subtotal - $discountAmount;
            $taxAmount = ($taxableAmount * $taxRate) / 100;
            $totalAmount = $taxableAmount + $taxAmount;

            $validated['tax_amount'] = $taxAmount;
            $validated['discount_amount'] = $discountAmount;
            $validated['total_amount'] = $totalAmount;
        }

        $order->update($validated);

        return response()->json($order->load(['company', 'contact', 'user', 'quote']));
    }

    public function destroy(Order $order): JsonResponse
    {
        $this->authorize('delete', $order);
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function stats(): JsonResponse
    {
        $userId = auth()->id();
        
        $stats = [
            'total' => Order::where('user_id', $userId)->count(),
            'pending' => Order::where('user_id', $userId)->where('status', 'pending')->count(),
            'confirmed' => Order::where('user_id', $userId)->where('status', 'confirmed')->count(),
            'delivered' => Order::where('user_id', $userId)->where('status', 'delivered')->count(),
            'total_value' => Order::where('user_id', $userId)->sum('total_amount'),
        ];

        return response()->json($stats);
    }

    public function createFromQuote(Quote $quote): JsonResponse
    {
        $this->authorize('view', $quote);

        if ($quote->status !== 'accepted') {
            return response()->json(['error' => 'Quote must be accepted to create an order'], 400);
        }

        $order = Order::create([
            'company_id' => $quote->company_id,
            'contact_id' => $quote->contact_id,
            'user_id' => $quote->user_id,
            'quote_id' => $quote->id,
            'title' => $quote->title,
            'description' => $quote->description,
            'order_number' => $this->generateOrderNumber(),
            'subtotal' => $quote->subtotal,
            'tax_amount' => $quote->tax_amount,
            'discount_amount' => $quote->discount_amount,
            'total_amount' => $quote->total_amount,
            'tax_rate' => $quote->tax_rate,
            'discount_rate' => $quote->discount_rate,
            'currency' => $quote->currency,
            'order_date' => now(),
            'notes' => $quote->notes,
            'status' => 'pending',
        ]);

        return response()->json($order->load(['company', 'contact', 'user', 'quote']), 201);
    }

    private function generateOrderNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $lastOrder = Order::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastOrder ? (int)substr($lastOrder->order_number, -4) + 1 : 1;
        
        return "ORD-{$year}{$month}-" . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}
