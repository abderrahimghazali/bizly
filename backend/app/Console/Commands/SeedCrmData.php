<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\CrmSeeder;

class SeedCrmData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crm:seed {--fresh : Clear existing CRM data before seeding}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed CRM data including companies, contacts, leads, and deals';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting CRM data seeding...');

        if ($this->option('fresh')) {
            $this->warn('Clearing existing CRM data...');
            
            // Truncate tables in correct order (respecting foreign keys)
            \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            \DB::table('deals')->truncate();
            \DB::table('leads')->truncate();
            \DB::table('contacts')->truncate();
            \DB::table('companies')->truncate();
            \DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            
            $this->info('Existing CRM data cleared.');
        }

        // Run the CRM seeder
        $seeder = new CrmSeeder();
        $seeder->setCommand($this);
        $seeder->run();

        $this->info('CRM data seeding completed successfully!');
        
        // Display summary
        $companiesCount = \DB::table('companies')->count();
        $contactsCount = \DB::table('contacts')->count();
        $leadsCount = \DB::table('leads')->count();
        $dealsCount = \DB::table('deals')->count();

        $this->newLine();
        $this->info("Summary:");
        $this->line("- Companies: {$companiesCount}");
        $this->line("- Contacts: {$contactsCount}");
        $this->line("- Leads: {$leadsCount}");
        $this->line("- Deals: {$dealsCount}");

        return 0;
    }
}
