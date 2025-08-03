<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class DealController extends Controller
{
    /**
     * Display a listing of deals.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Deal::with(['assignedUser', 'creator', 'company', 'contact', 'lead']);

            // Filter by stage if provided
            if ($request->has('stage') && $request->stage !== 'all') {
                $query->byStage($request->stage);
            }

            // Filter by assigned user if provided
            if ($request->has('assigned_to') && $request->assigned_to !== 'all') {
                $query->assignedTo($request->assigned_to);
            }

            // Filter by source if provided
            if ($request->has('source') && $request->source !== 'all') {
                $query->where('source', $request->source);
            }

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('notes', 'like', "%{$search}%")
                      ->orWhereHas('company', function ($companyQuery) use ($search) {
                          $companyQuery->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('contact', function ($contactQuery) use ($search) {
                          $contactQuery->where('name', 'like', "%{$search}%");
                      });
                });
            }

            // Sort by expected_close_date by default
            $sortBy = $request->get('sort_by', 'expected_close_date');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $deals = $query->get();

            return response()->json([
                'success' => true,
                'deals' => $deals,
                'total' => $deals->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch deals: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch deals',
            ], 500);
        }
    }

    /**
     * Store a newly created deal.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'amount' => 'required|numeric|min:0',
                'probability' => 'nullable|numeric|min:0|max:100',
                'stage' => ['required', Rule::in(['qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])],
                'expected_close_date' => 'required|date|after_or_equal:today',
                'actual_close_date' => 'nullable|date',
                'source' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
                'lead_id' => 'nullable|exists:leads,id',
                'company_id' => 'nullable|exists:companies,id',
                'contact_id' => 'nullable|exists:contacts,id',
                'assigned_to' => 'nullable|exists:users,id',
            ]);

            $validated['created_by'] = Auth::id();
            $validated['probability'] = $validated['probability'] ?? 50;

            $deal = Deal::create($validated);
            $deal->load(['assignedUser', 'creator', 'company', 'contact', 'lead']);

            return response()->json([
                'success' => true,
                'message' => 'Deal created successfully',
                'deal' => $deal,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create deal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create deal',
            ], 500);
        }
    }

    /**
     * Display the specified deal.
     */
    public function show(Deal $deal): JsonResponse
    {
        try {
            $deal->load(['assignedUser', 'creator', 'company', 'contact', 'lead']);
            
            return response()->json([
                'success' => true,
                'deal' => $deal,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch deal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch deal',
            ], 500);
        }
    }

    /**
     * Update the specified deal.
     */
    public function update(Request $request, Deal $deal): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'amount' => 'sometimes|required|numeric|min:0',
                'probability' => 'nullable|numeric|min:0|max:100',
                'stage' => ['sometimes', 'required', Rule::in(['qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])],
                'expected_close_date' => 'sometimes|required|date',
                'actual_close_date' => 'nullable|date',
                'source' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
                'lead_id' => 'nullable|exists:leads,id',
                'company_id' => 'nullable|exists:companies,id',
                'contact_id' => 'nullable|exists:contacts,id',
                'assigned_to' => 'nullable|exists:users,id',
            ]);

            // Auto-set actual_close_date if stage is being changed to closed
            if (isset($validated['stage']) && in_array($validated['stage'], ['closed_won', 'closed_lost'])) {
                if (!$deal->actual_close_date) {
                    $validated['actual_close_date'] = now()->toDateString();
                }
            }

            $deal->update($validated);
            $deal->load(['assignedUser', 'creator', 'company', 'contact', 'lead']);

            return response()->json([
                'success' => true,
                'message' => 'Deal updated successfully',
                'deal' => $deal,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update deal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update deal',
            ], 500);
        }
    }

    /**
     * Remove the specified deal.
     */
    public function destroy(Deal $deal): JsonResponse
    {
        try {
            $deal->delete();

            return response()->json([
                'success' => true,
                'message' => 'Deal deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete deal: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete deal',
            ], 500);
        }
    }

    /**
     * Get deal statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_deals' => Deal::count(),
                'open_deals' => Deal::open()->count(),
                'won_deals' => Deal::won()->count(),
                'lost_deals' => Deal::lost()->count(),
                'total_value' => Deal::sum('amount'),
                'won_value' => Deal::won()->sum('amount'),
                'weighted_pipeline' => Deal::open()->get()->sum('weighted_amount'),
                'overdue_deals' => Deal::overdue()->count(),
                'avg_deal_size' => Deal::avg('amount'),
                'conversion_rate' => Deal::count() > 0 ? (Deal::won()->count() / Deal::count()) * 100 : 0,
            ];

            // Stage breakdown
            $stageStats = [];
            foreach (Deal::getStages() as $stage => $label) {
                $stageStats[$stage] = [
                    'count' => Deal::byStage($stage)->count(),
                    'value' => Deal::byStage($stage)->sum('amount'),
                    'label' => $label,
                ];
            }
            $stats['by_stage'] = $stageStats;

            return response()->json([
                'success' => true,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch deal stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch deal statistics',
            ], 500);
        }
    }

    /**
     * Get assignable users for deals (CRM managers and employees)
     */
    public function getAssignableUsers(): JsonResponse
    {
        try {
            $users = User::with('role')
                ->whereHas('role', function ($query) {
                    $query->whereIn('name', ['admin', 'manager', 'employee']);
                })
                ->where('status', 'active')
                ->select('id', 'name', 'email', 'role_id')
                ->orderBy('name')
                ->get();

            $formattedUsers = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ? $user->role->label : 'Unknown',
                ];
            });

            return response()->json([
                'success' => true,
                'users' => $formattedUsers,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch assignable users: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch assignable users',
            ], 500);
        }
    }
}