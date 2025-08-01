<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$permissions
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        $user = $request->user()->load('role.permissions');
        
        foreach ($permissions as $permission) {
            if (!$user->hasPermission($permission)) {
                return response()->json([
                    'message' => 'Insufficient permissions. Required permission: ' . $permission
                ], 403);
            }
        }

        return $next($request);
    }
}
