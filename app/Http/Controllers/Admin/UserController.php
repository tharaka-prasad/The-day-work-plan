<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::withCount(['tasks', 'projects'])->orderBy('id')
                ->get(['id', 'name', 'email', 'role', 'is_active', 'created_at']),
        ]);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:user,super_admin',
        ]);

        $data['password'] = Hash::make($data['password']);
        (new User)->forceFill($data + ['is_active' => true, 'email_verified_at' => now()])->save();

        return back();
    }

    public function update(Request $r, User $user)
    {
        $data = $r->validate([
            'is_active' => 'sometimes|boolean',
            'role' => 'sometimes|in:user,super_admin',
            'password' => 'sometimes|nullable|string|min:8',
        ]);

        // Stops the admin from locking themselves out
        if ($user->id === $r->user()->id) {
            unset($data['is_active'], $data['role']);
        }

        if (array_key_exists('password', $data)) {
            if ($data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
        }

        $user->forceFill($data)->save();
        return back();
    }

    public function destroy(Request $r, User $user)
    {
        abort_if($user->id === $r->user()->id, 422, 'You cannot delete your own account.');
        $user->delete(); // tasks and projects are removed by the cascade
        return back();
    }
}
