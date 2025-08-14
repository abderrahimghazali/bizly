<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['company', 'contact', 'user', 'order', 'quote']);
        
        // If user is not admin, only show their own invoices
        if (!auth()->user()->hasRole('admin')) {
            $query->where('user_id', auth()->id());
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $invoices = $query->latest()->paginate(10);

        return response()->json($invoices);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'order_id' => 'nullable|exists:orders,id',
            'quote_id' => 'nullable|exists:quotes,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after:invoice_date',
            'subtotal' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|size:3',
            'payment_terms' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $taxRate = $validated['tax_rate'] ?? 0;
        $discountRate = $validated['discount_rate'] ?? 0;
        $subtotal = $validated['subtotal'];

        $discountAmount = ($subtotal * $discountRate) / 100;
        $taxableAmount = $subtotal - $discountAmount;
        $taxAmount = ($taxableAmount * $taxRate) / 100;
        $totalAmount = $taxableAmount + $taxAmount;

        $invoice = Invoice::create([
            ...$validated,
            'user_id' => auth()->id(),
            'invoice_number' => $this->generateInvoiceNumber(),
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'due_amount' => $totalAmount,
            'paid_amount' => 0,
            'status' => 'draft',
        ]);

        return response()->json($invoice->load(['company', 'contact', 'user', 'order', 'quote']), 201);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json($invoice->load(['company', 'contact', 'user', 'order', 'quote']));
    }

    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $this->authorize('update', $invoice);

        $validated = $request->validate([
            'company_id' => 'sometimes|exists:companies,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'order_id' => 'nullable|exists:orders,id',
            'quote_id' => 'nullable|exists:quotes,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:draft,sent,paid,partially_paid,overdue,cancelled',
            'invoice_date' => 'sometimes|date',
            'due_date' => 'sometimes|date|after:invoice_date',
            'subtotal' => 'sometimes|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|size:3',
            'payment_terms' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['subtotal']) || isset($validated['tax_rate']) || isset($validated['discount_rate'])) {
            $taxRate = $validated['tax_rate'] ?? $invoice->tax_rate;
            $discountRate = $validated['discount_rate'] ?? $invoice->discount_rate;
            $subtotal = $validated['subtotal'] ?? $invoice->subtotal;

            $discountAmount = ($subtotal * $discountRate) / 100;
            $taxableAmount = $subtotal - $discountAmount;
            $taxAmount = ($taxableAmount * $taxRate) / 100;
            $totalAmount = $taxableAmount + $taxAmount;

            $validated['tax_amount'] = $taxAmount;
            $validated['discount_amount'] = $discountAmount;
            $validated['total_amount'] = $totalAmount;
            $validated['due_amount'] = $totalAmount - $invoice->paid_amount;
        }

        $invoice->update($validated);

        return response()->json($invoice->load(['company', 'contact', 'user', 'order', 'quote']));
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $this->authorize('delete', $invoice);
        $invoice->delete();
        return response()->json(['message' => 'Invoice deleted successfully']);
    }

    public function markAsPaid(Request $request, Invoice $invoice): JsonResponse
    {
        $this->authorize('update', $invoice);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0|max:' . $invoice->due_amount,
            'paid_date' => 'nullable|date',
        ]);

        $paidAmount = $invoice->paid_amount + $validated['amount'];
        $dueAmount = $invoice->total_amount - $paidAmount;
        
        $status = $dueAmount <= 0 ? 'paid' : 'partially_paid';

        $invoice->update([
            'paid_amount' => $paidAmount,
            'due_amount' => $dueAmount,
            'status' => $status,
            'paid_date' => $status === 'paid' ? ($validated['paid_date'] ?? now()) : $invoice->paid_date,
        ]);

        return response()->json($invoice->load(['company', 'contact', 'user', 'order', 'quote']));
    }

    public function stats(): JsonResponse
    {
        $userId = auth()->id();
        
        $stats = [
            'total' => Invoice::where('user_id', $userId)->count(),
            'draft' => Invoice::where('user_id', $userId)->where('status', 'draft')->count(),
            'sent' => Invoice::where('user_id', $userId)->where('status', 'sent')->count(),
            'paid' => Invoice::where('user_id', $userId)->where('status', 'paid')->count(),
            'overdue' => Invoice::where('user_id', $userId)->where('status', 'overdue')->count(),
            'total_value' => Invoice::where('user_id', $userId)->sum('total_amount'),
            'paid_value' => Invoice::where('user_id', $userId)->sum('paid_amount'),
            'due_value' => Invoice::where('user_id', $userId)->sum('due_amount'),
        ];

        return response()->json($stats);
    }

    public function createFromOrder(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        if (!in_array($order->status, ['confirmed', 'processing', 'shipped', 'delivered'])) {
            return response()->json(['error' => 'Order must be confirmed or in progress to create an invoice'], 400);
        }

        $invoice = Invoice::create([
            'company_id' => $order->company_id,
            'contact_id' => $order->contact_id,
            'user_id' => $order->user_id,
            'order_id' => $order->id,
            'quote_id' => $order->quote_id,
            'title' => $order->title,
            'description' => $order->description,
            'invoice_number' => $this->generateInvoiceNumber(),
            'subtotal' => $order->subtotal,
            'tax_amount' => $order->tax_amount,
            'discount_amount' => $order->discount_amount,
            'total_amount' => $order->total_amount,
            'due_amount' => $order->total_amount,
            'paid_amount' => 0,
            'tax_rate' => $order->tax_rate,
            'discount_rate' => $order->discount_rate,
            'currency' => $order->currency,
            'invoice_date' => now(),
            'due_date' => now()->addDays(30),
            'notes' => $order->notes,
            'status' => 'draft',
        ]);

        return response()->json($invoice->load(['company', 'contact', 'user', 'order', 'quote']), 201);
    }

    private function generateInvoiceNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $lastInvoice = Invoice::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastInvoice ? (int)substr($lastInvoice->invoice_number, -4) + 1 : 1;
        
        return "INV-{$year}{$month}-" . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}
