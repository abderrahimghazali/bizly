<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Models\Company;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class QuoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Quote::with(['company', 'contact', 'user']);
        
        // If user is not admin, only show their own quotes
        if (!auth()->user()->hasRole('admin')) {
            $query->where('user_id', auth()->id());
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $quotes = $query->latest()->paginate(10);

        return response()->json($quotes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quote_date' => 'required|date',
            'expiry_date' => 'required|date|after:quote_date',
            'subtotal' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|size:3',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $taxRate = $validated['tax_rate'] ?? 0;
        $discountRate = $validated['discount_rate'] ?? 0;
        $subtotal = $validated['subtotal'];

        $discountAmount = ($subtotal * $discountRate) / 100;
        $taxableAmount = $subtotal - $discountAmount;
        $taxAmount = ($taxableAmount * $taxRate) / 100;
        $totalAmount = $taxableAmount + $taxAmount;

        $quote = Quote::create([
            ...$validated,
            'user_id' => auth()->id(),
            'quote_number' => $this->generateQuoteNumber(),
            'tax_amount' => $taxAmount,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'status' => 'draft',
        ]);

        return response()->json($quote->load(['company', 'contact', 'user']), 201);
    }

    public function show(Quote $quote): JsonResponse
    {
        return response()->json($quote->load(['company', 'contact', 'user']));
    }

    public function update(Request $request, Quote $quote): JsonResponse
    {
        $this->authorize('update', $quote);

        $validated = $request->validate([
            'company_id' => 'sometimes|exists:companies,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:draft,sent,accepted,rejected,expired',
            'quote_date' => 'sometimes|date',
            'expiry_date' => 'sometimes|date|after:quote_date',
            'subtotal' => 'sometimes|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_rate' => 'nullable|numeric|min:0|max:100',
            'currency' => 'nullable|string|size:3',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['subtotal']) || isset($validated['tax_rate']) || isset($validated['discount_rate'])) {
            $taxRate = $validated['tax_rate'] ?? $quote->tax_rate;
            $discountRate = $validated['discount_rate'] ?? $quote->discount_rate;
            $subtotal = $validated['subtotal'] ?? $quote->subtotal;

            $discountAmount = ($subtotal * $discountRate) / 100;
            $taxableAmount = $subtotal - $discountAmount;
            $taxAmount = ($taxableAmount * $taxRate) / 100;
            $totalAmount = $taxableAmount + $taxAmount;

            $validated['tax_amount'] = $taxAmount;
            $validated['discount_amount'] = $discountAmount;
            $validated['total_amount'] = $totalAmount;
        }

        $quote->update($validated);

        return response()->json($quote->load(['company', 'contact', 'user']));
    }

    public function destroy(Quote $quote): JsonResponse
    {
        $this->authorize('delete', $quote);
        $quote->delete();
        return response()->json(['message' => 'Quote deleted successfully']);
    }

    public function stats(): JsonResponse
    {
        $userId = auth()->id();
        
        $stats = [
            'total' => Quote::where('user_id', $userId)->count(),
            'draft' => Quote::where('user_id', $userId)->where('status', 'draft')->count(),
            'sent' => Quote::where('user_id', $userId)->where('status', 'sent')->count(),
            'accepted' => Quote::where('user_id', $userId)->where('status', 'accepted')->count(),
            'total_value' => Quote::where('user_id', $userId)->sum('total_amount'),
        ];

        return response()->json($stats);
    }

    private function generateQuoteNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $lastQuote = Quote::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastQuote ? (int)substr($lastQuote->quote_number, -4) + 1 : 1;
        
        return "QUO-{$year}{$month}-" . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}
