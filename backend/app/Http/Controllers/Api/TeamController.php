<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;

class TeamController extends Controller
{
    /**
     * Get team hierarchy for managers
     */
    public function getTeamHierarchy(Request $request)
    {
        $user = auth()->user();
        
        // If user is admin, show all managers and their teams
        if ($user->isAdmin()) {
            $managers = User::with(['employees.role', 'role'])
                ->whereHas('role', function($query) {
                    $query->where('name', 'manager');
                })
                ->get();
                
            return response()->json([
                'hierarchy' => $managers->map(function($manager) {
                    return [
                        'manager' => [
                            'id' => $manager->id,
                            'name' => $manager->name,
                            'email' => $manager->email,
                            'role' => $manager->role->label,
                            'status' => $manager->status,
                        ],
                        'employees' => $manager->employees->map(function($employee) {
                            return [
                                'id' => $employee->id,
                                'name' => $employee->name,
                                'email' => $employee->email,
                                'role' => $employee->role->label,
                                'status' => $employee->status,
                            ];
                        })
                    ];
                }),
                'stats' => [
                    'total_managers' => $managers->count(),
                    'total_employees' => $managers->sum(function($manager) {
                        return $manager->employees->count();
                    })
                ]
            ]);
        }
        
        // If user is manager, show only their team
        if ($user->isManager()) {
            $manager = User::with(['employees.role', 'role'])->find($user->id);
            
            return response()->json([
                'hierarchy' => [[
                    'manager' => [
                        'id' => $manager->id,
                        'name' => $manager->name,
                        'email' => $manager->email,
                        'role' => $manager->role->label,
                        'status' => $manager->status,
                    ],
                    'employees' => $manager->employees->map(function($employee) {
                        return [
                            'id' => $employee->id,
                            'name' => $employee->name,
                            'email' => $employee->email,
                            'role' => $employee->role->label,
                            'status' => $employee->status,
                        ];
                    })
                ]],
                'stats' => [
                    'total_managers' => 1,
                    'total_employees' => $manager->employees->count()
                ]
            ]);
        }
        
        return response()->json([
            'message' => 'Access denied. Only managers and admins can view team hierarchy.'
        ], 403);
    }
    
    /**
     * Assign employee to manager
     */
    public function assignEmployee(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:users,id',
            'manager_id' => 'required|exists:users,id',
        ]);
        
        $user = auth()->user();
        
        // Only admins can reassign employees
        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Only administrators can reassign employees.'
            ], 403);
        }
        
        $employee = User::find($request->employee_id);
        $manager = User::find($request->manager_id);
        
        // Validate that the target user is an employee
        if (!$employee->isEmployee()) {
            return response()->json([
                'message' => 'Target user must be an employee.'
            ], 422);
        }
        
        // Validate that the manager is actually a manager
        if (!$manager->isManager()) {
            return response()->json([
                'message' => 'Target user must be a manager.'
            ], 422);
        }
        
        $employee->update(['manager_id' => $manager->id]);
        
        return response()->json([
            'message' => 'Employee assigned successfully.',
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'manager' => [
                    'id' => $manager->id,
                    'name' => $manager->name,
                ]
            ]
        ]);
    }
}
