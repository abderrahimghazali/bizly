<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
            'status' => 'sometimes|in:new,contacted,qualified,proposal,negotiation,won,lost,converted',
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

        // Create activity for lead creation
        Activity::create([
            'type' => 'created',
            'subject' => 'Lead Created',
            'description' => "Lead '{$lead->name}' was created",
            'activityable_type' => Lead::class,
            'activityable_id' => $lead->id,
            'user_id' => Auth::id(),
            'activity_date' => now(),
        ]);

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
        $lead->load(['assignedUser', 'activities.user']);

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
                'activities' => $lead->activities->map(function($activity) {
                    return [
                        'id' => $activity->id,
                        'type' => $activity->type,
                        'subject' => $activity->subject,
                        'description' => $activity->description,
                        'activity_date' => $activity->activity_date->format('Y-m-d H:i:s'),
                        'user' => [
                            'id' => $activity->user->id,
                            'name' => $activity->user->name,
                        ],
                    ];
                }),
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
            'status' => 'sometimes|in:new,contacted,qualified,proposal,negotiation,won,lost,converted',
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

        $originalStatus = $lead->status;
        $originalAssignedTo = $lead->assigned_to;

        $lead->update($request->only([
            'name', 'email', 'phone', 'company', 'status', 
            'source', 'value', 'notes', 'assigned_to'
        ]));

        // Create activities for changes
        if ($request->has('status') && $originalStatus !== $lead->status) {
            Activity::create([
                'type' => 'status_change',
                'subject' => 'Status Changed',
                'description' => "Status changed from '{$originalStatus}' to '{$lead->status}'",
                'activityable_type' => Lead::class,
                'activityable_id' => $lead->id,
                'user_id' => Auth::id(),
                'activity_date' => now(),
            ]);
        }

        if ($request->has('assigned_to') && $originalAssignedTo !== $lead->assigned_to) {
            $newAssignee = $lead->assigned_to ? \App\Models\User::find($lead->assigned_to)->name : 'Unassigned';
            $oldAssignee = $originalAssignedTo ? \App\Models\User::find($originalAssignedTo)->name : 'Unassigned';
            
            Activity::create([
                'type' => 'assigned',
                'subject' => 'Assignment Changed',
                'description' => "Lead reassigned from '{$oldAssignee}' to '{$newAssignee}'",
                'activityable_type' => Lead::class,
                'activityable_id' => $lead->id,
                'user_id' => Auth::id(),
                'activity_date' => now(),
            ]);
        }

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

    /**
     * Convert a lead to company, contact, and optionally deal
     */
    public function convert(Request $request, Lead $lead)
    {
        // Check if lead is already converted
        if ($lead->status === 'converted') {
            return response()->json([
                'message' => 'Lead is already converted'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            // Company data
            'company_action' => 'required|in:create,existing',
            'company_id' => 'required_if:company_action,existing|exists:companies,id',
            'company_name' => 'required_if:company_action,create|string|max:255',
            'company_industry' => 'nullable|string|max:255',
            'company_website' => 'nullable|url|max:255',
            'company_phone' => 'nullable|string|max:20',
            'company_email' => 'nullable|email|max:255',
            'company_address' => 'nullable|string',
            
            // Contact data (always create new)
            'contact_first_name' => 'required|string|max:255',
            'contact_last_name' => 'required|string|max:255',
            'contact_position' => 'nullable|string|max:255',
            'contact_department' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'contact_mobile' => 'nullable|string|max:20',
            'contact_is_primary' => 'boolean',
            
            // Deal data (optional)
            'create_deal' => 'boolean',
            'deal_title' => 'required_if:create_deal,true|string|max:255',
            'deal_amount' => 'required_if:create_deal,true|numeric|min:0',
            'deal_probability' => 'nullable|integer|min:0|max:100',
            'deal_expected_close_date' => 'required_if:create_deal,true|date|after:today',
            'deal_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Step 1: Handle Company (create new or use existing)
            if ($request->company_action === 'create') {
                $company = Company::create([
                    'name' => $request->company_name,
                    'industry' => $request->company_industry,
                    'website' => $request->company_website,
                    'phone' => $request->company_phone ?: $lead->phone,
                    'email' => $request->company_email ?: $lead->email,
                    'address' => $request->company_address,
                    'status' => 'prospect',
                    'user_id' => Auth::id(),
                ]);
            } else {
                $company = Company::findOrFail($request->company_id);
            }

            // Step 2: Create Contact
            $contact = Contact::create([
                'first_name' => $request->contact_first_name,
                'last_name' => $request->contact_last_name,
                'email' => $lead->email,
                'phone' => $request->contact_phone ?: $lead->phone,
                'mobile' => $request->contact_mobile,
                'position' => $request->contact_position,
                'department' => $request->contact_department,
                'company_id' => $company->id,
                'user_id' => Auth::id(),
                'is_primary' => $request->contact_is_primary ?? false,
                'notes' => "Converted from lead: {$lead->name}",
            ]);

            // Set as primary contact if requested
            if ($request->contact_is_primary) {
                $contact->setPrimary();
            }

            $deal = null;
            // Step 3: Create Deal (if requested)
            if ($request->create_deal) {
                $deal = Deal::create([
                    'title' => $request->deal_title,
                    'description' => "Converted from lead: {$lead->name}",
                    'amount' => $request->deal_amount,
                    'probability' => $request->deal_probability ?? 50,
                    'stage' => 'qualified',
                    'expected_close_date' => $request->deal_expected_close_date,
                    'source' => $lead->source,
                    'notes' => $request->deal_notes ?: $lead->notes,
                    'lead_id' => $lead->id,
                    'company_id' => $company->id,
                    'contact_id' => $contact->id,
                    'assigned_to' => $lead->assigned_to,
                    'created_by' => Auth::id(),
                ]);
            }

            // Step 4: Update Lead Status
            $lead->update([
                'status' => 'converted',
                'company_id' => $company->id, // Link to company
            ]);

            DB::commit();

            // Load relationships for response
            $company->load(['primaryContact', 'contacts']);
            $contact->load(['company']);
            if ($deal) {
                $deal->load(['company', 'contact', 'assignedUser']);
            }

            return response()->json([
                'message' => 'Lead converted successfully',
                'company' => $company,
                'contact' => $contact,
                'deal' => $deal,
                'lead' => $lead->fresh(['assignedUser']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'message' => 'Lead conversion failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
