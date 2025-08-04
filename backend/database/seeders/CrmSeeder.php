<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\Deal;
use App\Models\User;
use Carbon\Carbon;

class CrmSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user as the default owner
        $user = User::first();
        if (!$user) {
            $this->command->error('No users found. Please run the user seeder first.');
            return;
        }

        // Sample company data
        $companies = [
            [
                'name' => 'TechCorp Solutions',
                'registration_number' => 'TC001234567',
                'vat_number' => 'VAT-TC-2024-001',
                'industry' => 'Information Technology',
                'website' => 'https://techcorp.com',
                'email' => 'info@techcorp.com',
                'phone' => '+1-555-0101',
                'address' => '123 Tech Street',
                'city' => 'San Francisco',
                'postal_code' => '94105',
                'country' => 'United States',
                'status' => 'active',
                'revenue' => 2500000.00,
                'employees_count' => 150,
                'founded_date' => '2018-03-15',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Green Energy Ltd',
                'registration_number' => 'GE002345678',
                'vat_number' => 'VAT-GE-2024-002',
                'industry' => 'Renewable Energy',
                'website' => 'https://greenenergy.com',
                'email' => 'contact@greenenergy.com',
                'phone' => '+1-555-0202',
                'address' => '456 Solar Avenue',
                'city' => 'Austin',
                'postal_code' => '73301',
                'country' => 'United States',
                'status' => 'active',
                'revenue' => 5000000.00,
                'employees_count' => 75,
                'founded_date' => '2020-06-10',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Digital Marketing Pro',
                'registration_number' => 'DMP003456789',
                'vat_number' => 'VAT-DMP-2024-003',
                'industry' => 'Marketing & Advertising',
                'website' => 'https://digitalmarketingpro.com',
                'email' => 'hello@digitalmarketingpro.com',
                'phone' => '+1-555-0303',
                'address' => '789 Marketing Boulevard',
                'city' => 'New York',
                'postal_code' => '10001',
                'country' => 'United States',
                'status' => 'prospect',
                'revenue' => 850000.00,
                'employees_count' => 25,
                'founded_date' => '2019-11-20',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Healthcare Innovations',
                'registration_number' => 'HI004567890',
                'vat_number' => 'VAT-HI-2024-004',
                'industry' => 'Healthcare',
                'website' => 'https://healthcareinnovations.com',
                'email' => 'info@healthcareinnovations.com',
                'phone' => '+1-555-0404',
                'address' => '321 Medical Center Drive',
                'city' => 'Boston',
                'postal_code' => '02101',
                'country' => 'United States',
                'status' => 'active',
                'revenue' => 3200000.00,
                'employees_count' => 200,
                'founded_date' => '2016-01-08',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Manufacturing Excellence',
                'registration_number' => 'ME005678901',
                'vat_number' => 'VAT-ME-2024-005',
                'industry' => 'Manufacturing',
                'website' => 'https://manufacturingexcellence.com',
                'email' => 'sales@manufacturingexcellence.com',
                'phone' => '+1-555-0505',
                'address' => '555 Industrial Park',
                'city' => 'Detroit',
                'postal_code' => '48201',
                'country' => 'United States',
                'status' => 'active',
                'revenue' => 8500000.00,
                'employees_count' => 350,
                'founded_date' => '2012-09-30',
                'user_id' => $user->id,
            ],
            [
                'name' => 'FinTech Innovations',
                'registration_number' => 'FT006789012',
                'vat_number' => 'VAT-FT-2024-006',
                'industry' => 'Financial Services',
                'website' => 'https://fintechinnovations.com',
                'email' => 'contact@fintechinnovations.com',
                'phone' => '+1-555-0606',
                'address' => '888 Finance Street',
                'city' => 'Chicago',
                'postal_code' => '60601',
                'country' => 'United States',
                'status' => 'prospect',
                'revenue' => 1200000.00,
                'employees_count' => 45,
                'founded_date' => '2021-04-12',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Retail Solutions Group',
                'registration_number' => 'RSG007890123',
                'vat_number' => 'VAT-RSG-2024-007',
                'industry' => 'Retail',
                'website' => 'https://retailsolutions.com',
                'email' => 'info@retailsolutions.com',
                'phone' => '+1-555-0707',
                'address' => '999 Commerce Plaza',
                'city' => 'Los Angeles',
                'postal_code' => '90210',
                'country' => 'United States',
                'status' => 'active',
                'revenue' => 4200000.00,
                'employees_count' => 120,
                'founded_date' => '2017-08-22',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Education Tech Partners',
                'registration_number' => 'ETP008901234',
                'vat_number' => 'VAT-ETP-2024-008',
                'industry' => 'Education Technology',
                'website' => 'https://edtechpartners.com',
                'email' => 'hello@edtechpartners.com',
                'phone' => '+1-555-0808',
                'address' => '111 Learning Lane',
                'city' => 'Seattle',
                'postal_code' => '98101',
                'country' => 'United States',
                'status' => 'prospect',
                'revenue' => 650000.00,
                'employees_count' => 18,
                'founded_date' => '2022-02-14',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Logistics Masters',
                'registration_number' => 'LM009012345',
                'vat_number' => 'VAT-LM-2024-009',
                'industry' => 'Logistics & Transportation',
                'website' => 'https://logisticsmasters.com',
                'email' => 'operations@logisticsmasters.com',
                'phone' => '+1-555-0909',
                'address' => '777 Shipping Drive',
                'city' => 'Miami',
                'postal_code' => '33101',
                'country' => 'United States',
                'status' => 'active',
                'revenue' => 3800000.00,
                'employees_count' => 85,
                'founded_date' => '2015-12-05',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Consulting Experts',
                'registration_number' => 'CE010123456',
                'vat_number' => 'VAT-CE-2024-010',
                'industry' => 'Business Consulting',
                'website' => 'https://consultingexperts.com',
                'email' => 'contact@consultingexperts.com',
                'phone' => '+1-555-1010',
                'address' => '222 Strategy Circle',
                'city' => 'Washington',
                'postal_code' => '20001',
                'country' => 'United States',
                'status' => 'inactive',
                'revenue' => 950000.00,
                'employees_count' => 12,
                'founded_date' => '2023-07-18',
                'user_id' => $user->id,
            ],
        ];

        // Create companies and their related data
        foreach ($companies as $companyData) {
            $company = Company::create($companyData);
            $this->command->info("Created company: {$company->name}");

            // Create contacts for each company (1-3 contacts per company)
            $contactsCount = rand(1, 3);
            $contactsData = $this->getContactsForCompany($company->name, $contactsCount);
            
            foreach ($contactsData as $index => $contactData) {
                $contact = Contact::create([
                    ...$contactData,
                    'company_id' => $company->id,
                    'user_id' => $user->id,
                    'is_primary' => $index === 0, // First contact is primary
                ]);
                $this->command->info("  - Created contact: {$contact->full_name}");
            }

            // Create leads for some companies (60% chance)
            if (rand(1, 10) <= 6) {
                $leadsCount = rand(1, 2);
                $leadsData = $this->getLeadsForCompany($company->name, $leadsCount);
                
                foreach ($leadsData as $leadData) {
                    $lead = Lead::create([
                        ...$leadData,
                        'company_id' => $company->id,
                        'assigned_to' => $user->id,
                    ]);
                    $this->command->info("  - Created lead: {$lead->name}");
                }
            }

            // Create deals for some companies (40% chance)
            if (rand(1, 10) <= 4) {
                $dealsCount = rand(1, 2);
                $dealsData = $this->getDealsForCompany($company->name, $dealsCount);
                
                foreach ($dealsData as $dealData) {
                    $deal = Deal::create([
                        ...$dealData,
                        'company_id' => $company->id,
                        'contact_id' => $company->contacts()->first()?->id,
                        'assigned_to' => $user->id,
                        'created_by' => $user->id,
                    ]);
                    $this->command->info("  - Created deal: {$deal->title}");
                }
            }
        }

        $this->command->info('CRM seeder completed successfully!');
    }

    /**
     * Get sample contacts for a company
     */
    private function getContactsForCompany(string $companyName, int $count): array
    {
        $contacts = [
            [
                'first_name' => 'John',
                'last_name' => 'Smith',
                'email' => 'john.smith@' . strtolower(str_replace(' ', '', $companyName)) . '.com',
                'phone' => '+1-555-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'mobile' => '+1-555-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'position' => 'CEO',
                'department' => 'Executive',
                'notes' => 'Primary decision maker for the company.',
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'email' => 'sarah.johnson@' . strtolower(str_replace(' ', '', $companyName)) . '.com',
                'phone' => '+1-555-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'mobile' => '+1-555-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'position' => 'CTO',
                'department' => 'Technology',
                'notes' => 'Technical lead and key stakeholder.',
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Brown',
                'email' => 'michael.brown@' . strtolower(str_replace(' ', '', $companyName)) . '.com',
                'phone' => '+1-555-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'mobile' => '+1-555-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'position' => 'VP Sales',
                'department' => 'Sales',
                'notes' => 'Handles procurement and vendor relationships.',
            ],
        ];

        return array_slice($contacts, 0, $count);
    }

    /**
     * Get sample leads for a company
     */
    private function getLeadsForCompany(string $companyName, int $count): array
    {
        $leadNames = [
            'Enterprise Software Implementation',
            'Cloud Migration Project',
            'Digital Transformation Initiative',
            'Security Audit and Compliance',
            'Process Automation Solution',
        ];

        $sources = ['website', 'referral', 'cold_call', 'trade_show', 'linkedin', 'email_campaign'];
        $statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];

        $leads = [];
        for ($i = 0; $i < $count; $i++) {
            $leads[] = [
                'name' => $leadNames[array_rand($leadNames)] . ' - ' . $companyName,
                'email' => 'lead' . ($i + 1) . '@' . strtolower(str_replace(' ', '', $companyName)) . '.com',
                'phone' => '+1-555-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'status' => $statuses[array_rand($statuses)],
                'source' => $sources[array_rand($sources)],
                'value' => rand(10000, 500000),
                'last_contact' => Carbon::now()->subDays(rand(1, 30)),
                'notes' => 'Generated lead for ' . $companyName . '. Interested in our services.',
            ];
        }

        return $leads;
    }

    /**
     * Get sample deals for a company
     */
    private function getDealsForCompany(string $companyName, int $count): array
    {
        $dealTitles = [
            'Q1 Software License Renewal',
            'Custom Development Project',
            'Annual Support Contract',
            'Infrastructure Upgrade',
            'Consulting Services Agreement',
        ];

        $stages = ['qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
        $sources = ['lead_conversion', 'referral', 'existing_customer', 'cold_outreach'];

        $deals = [];
        for ($i = 0; $i < $count; $i++) {
            $stage = $stages[array_rand($stages)];
            $amount = rand(25000, 1000000);
            $probability = match ($stage) {
                'qualified' => rand(20, 40),
                'proposal' => rand(40, 60),
                'negotiation' => rand(60, 80),
                'closed_won' => 100,
                'closed_lost' => 0,
                default => 50,
            };

            $deals[] = [
                'title' => $dealTitles[array_rand($dealTitles)] . ' - ' . $companyName,
                'description' => 'Strategic partnership opportunity with ' . $companyName . ' for comprehensive business solutions.',
                'amount' => $amount,
                'probability' => $probability,
                'stage' => $stage,
                'expected_close_date' => $stage === 'closed_won' || $stage === 'closed_lost' 
                    ? Carbon::now()->subDays(rand(1, 30))
                    : Carbon::now()->addDays(rand(15, 90)),
                'actual_close_date' => $stage === 'closed_won' || $stage === 'closed_lost' 
                    ? Carbon::now()->subDays(rand(1, 30)) 
                    : null,
                'source' => $sources[array_rand($sources)],
                'notes' => 'High-value opportunity with ' . $companyName . '. Regular follow-ups scheduled.',
            ];
        }

        return $deals;
    }
}