<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies
     */
    public function index(Request $request)
    {
        $query = Company::with(['user', 'primaryContact', 'contacts', 'leads', 'deals']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('industry', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhere('phone', 'like', '%' . $search . '%');
            });
        }

        // Filter by status
        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->byStatus($request->input('status'));
        }

        // Filter by industry
        if ($request->has('industry') && $request->input('industry') !== 'all') {
            $query->byIndustry($request->input('industry'));
        }

        // Order by name by default
        $query->orderBy('name');

        $companies = $query->paginate(15);

        return response()->json($companies);
    }

    /**
     * Store a newly created company
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'registration_number' => 'nullable|string|unique:companies,registration_number',
            'vat_number' => 'nullable|string',
            'industry' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:255',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'prospect'])],
            'revenue' => 'nullable|numeric|min:0',
            'employees_count' => 'nullable|integer|min:0',
            'founded_date' => 'nullable|date',
        ]);

        $company = Company::create([
            ...$request->all(),
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Company created successfully',
            'company' => $company->load(['user', 'primaryContact']),
        ], 201);
    }

    /**
     * Display the specified company
     */
    public function show(Company $company)
    {
        $company->load([
            'user',
            'contacts',
            'primaryContact',
            'leads' => function ($query) {
                $query->latest()->limit(10);
            },
            'deals' => function ($query) {
                $query->latest()->limit(10);
            }
        ]);

        return response()->json($company);
    }

    /**
     * Update the specified company
     */
    public function update(Request $request, Company $company)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'registration_number' => [
                'nullable',
                'string',
                Rule::unique('companies', 'registration_number')->ignore($company->id)
            ],
            'vat_number' => 'nullable|string',
            'industry' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:255',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'prospect'])],
            'revenue' => 'nullable|numeric|min:0',
            'employees_count' => 'nullable|integer|min:0',
            'founded_date' => 'nullable|date',
        ]);

        $company->update($request->all());

        return response()->json([
            'message' => 'Company updated successfully',
            'company' => $company->load(['user', 'primaryContact']),
        ]);
    }

    /**
     * Remove the specified company
     */
    public function destroy(Company $company)
    {
        $company->delete();

        return response()->json([
            'message' => 'Company deleted successfully',
        ]);
    }

    /**
     * Get company statistics
     */
    public function stats()
    {
        $totalCompanies = Company::count();
        $activeCompanies = Company::active()->count();
        $prospectCompanies = Company::prospects()->count();
        $companiesWithDeals = Company::whereHas('deals')->count();
        
        $topIndustries = Company::select('industry')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('industry')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return response()->json([
            'total_companies' => $totalCompanies,
            'active_companies' => $activeCompanies,
            'prospect_companies' => $prospectCompanies,
            'companies_with_deals' => $companiesWithDeals,
            'top_industries' => $topIndustries,
        ]);
    }

    /**
     * Get companies for dropdown/select options
     */
    public function options()
    {
        $companies = Company::select('id', 'name', 'industry')
            ->orderBy('name')
            ->get();

        return response()->json($companies);
    }
}