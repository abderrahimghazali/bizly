<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        $user = $request->user()->load('role');
        
        // Check if user has any of the required roles
        if (!$user->hasAnyRole($roles)) {
            return response()->json([
                'message' => 'Insufficient permissions. Required roles: ' . implode(', ', $roles)
            ], 403);
        }

        return $next($request);
    }
}
