<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Lead::with('assignedUser');

        // Search filter
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->byStatus($request->get('status'));
        }

        // Source filter
        if ($request->has('source') && $request->get('source') !== 'all') {
            $query->bySource($request->get('source'));
        }

        $leads = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'leads' => $leads->map(function($lead) {
                return [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                    'company' => $lead->company,
                    'status' => $lead->status,
                    'source' => $lead->source,
                    'value' => (float) $lead->value,
                    'last_contact' => $lead->last_contact ? $lead->last_contact->format('Y-m-d') : null,
                    'notes' => $lead->notes,
                    'assigned_to' => $lead->assignedUser ? [
                        'id' => $lead->assignedUser->id,
                        'name' => $lead->assignedUser->name,
                    ] : null,
                    'created_at' => $lead->created_at->format('Y-m-d'),
                    'updated_at' => $lead->updated_at->format('Y-m-d H:i:s'),
                ];
            })
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'status' => 'sometimes|in:new,contacted,qualified,proposal,negotiation,won,lost',
            'source' => 'nullable|string|max:255',
            'value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = Lead::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'company' => $request->company,
            'status' => $request->get('status', 'new'),
            'source' => $request->source,
            'value' => $request->get('value', 0),
            'notes' => $request->notes,
            'assigned_to' => $request->assigned_to,
            'last_contact' => now(),
        ]);

        $lead->load('assignedUser');

        return response()->json([
            'message' => 'Lead created successfully',
            'lead' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'company' => $lead->company,
                'status' => $lead->status,
                'source' => $lead->source,
                'value' => (float) $lead->value,
                'last_contact' => $lead->last_contact ? $lead->last_contact->format('Y-m-d') : null,
                'notes' => $lead->notes,
                'assigned_to' => $lead->assignedUser ? [
                    'id' => $lead->assignedUser->id,
                    'name' => $lead->assignedUser->name,
                ] : null,
                'created_at' => $lead->created_at->format('Y-m-d'),
                'updated_at' => $lead->updated_at->format('Y-m-d H:i:s'),
            ]
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Lead $lead)
    {
        $lead->load('assignedUser');

        return response()->json([
            'lead' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'company' => $lead->company,
                'status' => $lead->status,
                'source' => $lead->source,
                'value' => (float) $lead->value,
                'last_contact' => $lead->last_contact ? $lead->last_contact->format('Y-m-d') : null,
                'notes' => $lead->notes,
                'assigned_to' => $lead->assignedUser ? [
                    'id' => $lead->assignedUser->id,
                    'name' => $lead->assignedUser->name,
                ] : null,
                'created_at' => $lead->created_at->format('Y-m-d'),
                'updated_at' => $lead->updated_at->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lead $lead)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'status' => 'sometimes|in:new,contacted,qualified,proposal,negotiation,won,lost',
            'source' => 'nullable|string|max:255',
            'value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $lead->update($request->only([
            'name', 'email', 'phone', 'company', 'status', 
            'source', 'value', 'notes', 'assigned_to'
        ]));

        $lead->load('assignedUser');

        return response()->json([
            'message' => 'Lead updated successfully',
            'lead' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'company' => $lead->company,
                'status' => $lead->status,
                'source' => $lead->source,
                'value' => (float) $lead->value,
                'last_contact' => $lead->last_contact ? $lead->last_contact->format('Y-m-d') : null,
                'notes' => $lead->notes,
                'assigned_to' => $lead->assignedUser ? [
                    'id' => $lead->assignedUser->id,
                    'name' => $lead->assignedUser->name,
                ] : null,
                'created_at' => $lead->created_at->format('Y-m-d'),
                'updated_at' => $lead->updated_at->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lead $lead)
    {
        $lead->delete();

        return response()->json([
            'message' => 'Lead deleted successfully'
        ]);
    }
}
