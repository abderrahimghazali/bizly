<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
    /**
     * Display a listing of contacts
     */
    public function index(Request $request)
    {
        $query = Contact::with(['company', 'user']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', '%' . $search . '%')
                  ->orWhere('last_name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhere('phone', 'like', '%' . $search . '%')
                  ->orWhere('position', 'like', '%' . $search . '%')
                  ->orWhereHas('company', function ($q) use ($search) {
                      $q->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        // Filter by company
        if ($request->has('company_id') && $request->input('company_id') !== 'all') {
            $query->byCompany($request->input('company_id'));
        }

        // Filter by department
        if ($request->has('department') && $request->input('department') !== 'all') {
            $query->byDepartment($request->input('department'));
        }

        // Show primary contacts first
        $query->orderBy('is_primary', 'desc')
              ->orderBy('first_name')
              ->orderBy('last_name');

        $contacts = $query->paginate(15);

        return response()->json($contacts);
    }

    /**
     * Store a newly created contact
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'company_id' => 'required|exists:companies,id',
            'is_primary' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $contact = Contact::create([
            ...$request->all(),
            'user_id' => Auth::id(),
        ]);

        // If this is set as primary, make sure no other contacts for this company are primary
        if ($contact->is_primary) {
            $contact->setPrimary();
        }

        return response()->json([
            'message' => 'Contact created successfully',
            'contact' => $contact->load(['company', 'user']),
        ], 201);
    }

    /**
     * Display the specified contact
     */
    public function show(Contact $contact)
    {
        $contact->load([
            'company',
            'user',
            'deals' => function ($query) {
                $query->latest()->limit(10);
            }
        ]);

        return response()->json($contact);
    }

    /**
     * Update the specified contact
     */
    public function update(Request $request, Contact $contact)
    {
        $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'company_id' => 'sometimes|required|exists:companies,id',
            'is_primary' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $contact->update($request->all());

        // If this is set as primary, make sure no other contacts for this company are primary
        if ($request->has('is_primary') && $request->input('is_primary')) {
            $contact->setPrimary();
        }

        return response()->json([
            'message' => 'Contact updated successfully',
            'contact' => $contact->load(['company', 'user']),
        ]);
    }

    /**
     * Remove the specified contact
     */
    public function destroy(Contact $contact)
    {
        $contact->delete();

        return response()->json([
            'message' => 'Contact deleted successfully',
        ]);
    }

    /**
     * Set contact as primary for their company
     */
    public function setPrimary(Contact $contact)
    {
        $contact->setPrimary();

        return response()->json([
            'message' => 'Contact set as primary successfully',
            'contact' => $contact->load(['company', 'user']),
        ]);
    }

    /**
     * Get contacts by company
     */
    public function byCompany(Company $company)
    {
        $contacts = $company->contacts()
            ->orderBy('is_primary', 'desc')
            ->orderBy('first_name')
            ->get();

        return response()->json($contacts);
    }

    /**
     * Get contact statistics
     */
    public function stats()
    {
        $totalContacts = Contact::count();
        $primaryContacts = Contact::primary()->count();
        $contactsWithDeals = Contact::whereHas('deals')->count();
        
        $topDepartments = Contact::select('department')
            ->selectRaw('COUNT(*) as count')
            ->whereNotNull('department')
            ->groupBy('department')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return response()->json([
            'total_contacts' => $totalContacts,
            'primary_contacts' => $primaryContacts,
            'contacts_with_deals' => $contactsWithDeals,
            'top_departments' => $topDepartments,
        ]);
    }

    /**
     * Get contacts for dropdown/select options
     */
    public function options(Request $request)
    {
        $query = Contact::select('id', 'first_name', 'last_name', 'company_id', 'position')
            ->with('company:id,name');

        // Filter by company if provided
        if ($request->has('company_id')) {
            $query->where('company_id', $request->input('company_id'));
        }

        $contacts = $query->orderBy('first_name')
            ->orderBy('last_name')
            ->get()
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'name' => $contact->full_name,
                    'position' => $contact->position,
                    'company' => $contact->company->name ?? null,
                ];
            });

        return response()->json($contacts);
    }
}