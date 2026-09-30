# WorkPlanner — Laravel + React (Inertia) + MySQL + Tailwind

Files here are an overlay for a fresh Laravel + Breeze (React) app. Routes live in `routes/web.php`.

## Setup
```bash
composer create-project laravel/laravel work-planner
cd work-planner
composer require laravel/breeze --dev
php artisan breeze:install react      # Inertia + React + Tailwind + auth

# copy this folder's contents over the project (overwrite routes/web.php)
# then in .env set DB_CONNECTION=mysql, DB_DATABASE=work_planner, DB_USERNAME, DB_PASSWORD

# app/Models/User.php -> add:
#   public function tasks()    { return $this->hasMany(\App\Models\Task::class); }
#   public function projects() { return $this->hasMany(\App\Models\Project::class); }

# resources/css/app.css -> add as the very first line:  @import './planner.css';
# (if Breeze puts @tailwind directives first and Vite complains, put the import after them)

php artisan migrate
npm install && npm run dev
php artisan serve
```
Register a user at /register and you land on the dashboard.

## How "carried forward" works
The dashboard queries every task with status pending/in_progress and a `task_date` before today, so yesterday's
unfinished work reappears automatically with no cron job. Buttons: Today / Tomorrow / Cancel, or tick to complete.

## Login, super admin and users (added)

Everyone logs in with Breeze's login page. Only a super admin can create accounts, and every user sees only their own tasks and projects.

1. Close public registration: in `routes/auth.php` delete the two `register` routes
   (`Route::get('register', ...)` and `Route::post('register', ...)`).
2. `app/Models/User.php`: add `'role', 'is_active'` to `$fillable`, plus
   `protected function casts(): array { return [..., 'is_active' => 'boolean']; }` (merge with the existing casts),
   and the relations `tasks()` and `projects()` from the first setup.
3. Register the middleware in `bootstrap/app.php`:
   ```php
   ->withMiddleware(function (Middleware $middleware) {
       $middleware->alias([
           'super_admin' => \App\Http\Middleware\EnsureSuperAdmin::class,
           'active'      => \App\Http\Middleware\EnsureActiveUser::class,
       ]);
   })
   ```
4. Optional `.env`: `SUPERADMIN_NAME`, `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`.
5. `php artisan migrate` then `php artisan db:seed --class=SuperAdminSeeder`.

Already registered an account? Promote it instead:
`php artisan tinker` then `User::where('email','you@example.com')->update(['role'=>'super_admin']);`

Super admin menu: sidebar shows Users, where you can create users, reset passwords, disable/enable and delete.
