<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ManageUserStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:status
                            {status : The status to set (active, pending, suspended)}
                            {--user= : Target specific user by email}
                            {--all : Apply to all users}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage user statuses (active, pending, suspended)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $status = $this->argument('status');
        $userEmail = $this->option('user');
        $applyToAll = $this->option('all');

        // Validate status
        if (!in_array($status, ['active', 'pending', 'suspended'])) {
            $this->error('Invalid status. Must be: active, pending, or suspended');
            return Command::FAILURE;
        }

        if (!$userEmail && !$applyToAll) {
            $this->error('Please specify either --user=email or --all');
            return Command::FAILURE;
        }

        if ($userEmail && $applyToAll) {
            $this->error('Cannot use both --user and --all options together');
            return Command::FAILURE;
        }

        try {
            if ($applyToAll) {
                $count = User::query()->update(['status' => $status]);
                $this->info("Updated {$count} users to '{$status}' status.");
            } else {
                $user = User::where('email', $userEmail)->first();
                if (!$user) {
                    $this->error("User with email '{$userEmail}' not found.");
                    return Command::FAILURE;
                }

                $user->update(['status' => $status]);
                $this->info("Updated user '{$user->name}' ({$userEmail}) to '{$status}' status.");
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to update user status: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
