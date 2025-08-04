<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Quote;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\Company;
use App\Models\Contact;
use App\Models\User;
use Carbon\Carbon;

class SalesModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating Sales demo data...');

        // Get existing users, companies, and contacts
        $users = User::all();
        $companies = Company::with('contacts')->get();

        if ($users->isEmpty() || $companies->isEmpty()) {
            $this->command->error('Please run the basic seeders first to create users and companies.');
            return;
        }

        // Sample products/services for quotes
        $services = [
            ['name' => 'Website Development', 'price' => 5000, 'description' => 'Custom website development with responsive design'],
            ['name' => 'Mobile App Development', 'price' => 15000, 'description' => 'Native mobile application for iOS and Android'],
            ['name' => 'Digital Marketing Campaign', 'price' => 2500, 'description' => 'Complete digital marketing strategy and execution'],
            ['name' => 'SEO Optimization', 'price' => 1200, 'description' => '6-month SEO optimization package'],
            ['name' => 'Cloud Migration', 'price' => 8000, 'description' => 'Migration to cloud infrastructure with setup'],
            ['name' => 'Software Consulting', 'price' => 3500, 'description' => 'Technical consulting and architecture review'],
            ['name' => 'E-commerce Platform', 'price' => 12000, 'description' => 'Complete e-commerce solution with payment integration'],
            ['name' => 'Data Analytics Setup', 'price' => 4500, 'description' => 'Business intelligence and analytics implementation'],
            ['name' => 'CRM Integration', 'price' => 6500, 'description' => 'CRM system integration and customization'],
            ['name' => 'Security Audit', 'price' => 2800, 'description' => 'Comprehensive security assessment and recommendations'],
        ];

        $quotes = [];
        $orders = [];
        $invoices = [];

        // Create exactly 10 quotes with various statuses
        for ($i = 1; $i <= 10; $i++) {
            $company = $companies->random();
            $contact = $company->contacts->isNotEmpty() ? $company->contacts->random() : null;
            $user = $users->random();
            $service = $services[array_rand($services)];
            
            $quoteDate = Carbon::now()->subDays(rand(1, 90));
            $expiryDate = $quoteDate->copy()->addDays(30);
            
            $subtotal = $service['price'];
            $taxRate = rand(0, 15); // 0-15% tax
            $discountRate = rand(0, 10); // 0-10% discount
            
            $discountAmount = ($subtotal * $discountRate) / 100;
            $taxableAmount = $subtotal - $discountAmount;
            $taxAmount = ($taxableAmount * $taxRate) / 100;
            $totalAmount = $taxableAmount + $taxAmount;

            $status = ['draft', 'sent', 'accepted', 'rejected', 'expired'][rand(0, 4)];
            
            $quote = Quote::create([
                'quote_number' => $this->generateQuoteNumber($i),
                'company_id' => $company->id,
                'contact_id' => $contact?->id,
                'user_id' => $user->id,
                'title' => $service['name'] . ' for ' . $company->name,
                'description' => $service['description'],
                'status' => $status,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'tax_rate' => $taxRate,
                'discount_rate' => $discountRate,
                'currency' => 'USD',
                'quote_date' => $quoteDate,
                'expiry_date' => $expiryDate,
                'terms_conditions' => 'Payment due within 30 days. All work includes 3 months support.',
                'notes' => 'Please review and let us know if you have any questions.',
                'created_at' => $quoteDate,
                'updated_at' => $quoteDate,
            ]);

            $quotes[] = $quote;
        }

        $this->command->info('Created ' . count($quotes) . ' quotes');

        // Create exactly 10 orders (mix of from quotes and standalone)
        $acceptedQuotes = collect($quotes)->filter(fn($q) => $q->status === 'accepted');
        $ordersFromQuotes = min($acceptedQuotes->count(), 5); // Max 5 orders from quotes
        $standaloneOrders = 10 - $ordersFromQuotes; // Remaining as standalone orders
        
        // Create orders from accepted quotes
        $quoteOrders = $acceptedQuotes->take($ordersFromQuotes);
        foreach ($quoteOrders as $quote) {
            $orderDate = $quote->created_at->addDays(rand(1, 7));
            $expectedDeliveryDate = $orderDate->copy()->addDays(rand(30, 90));
            
            $status = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'][rand(0, 4)];
            
            $order = Order::create([
                'order_number' => $this->generateOrderNumber(count($orders) + 1),
                'company_id' => $quote->company_id,
                'contact_id' => $quote->contact_id,
                'user_id' => $quote->user_id,
                'quote_id' => $quote->id,
                'title' => $quote->title,
                'description' => $quote->description,
                'status' => $status,
                'subtotal' => $quote->subtotal,
                'tax_amount' => $quote->tax_amount,
                'discount_amount' => $quote->discount_amount,
                'total_amount' => $quote->total_amount,
                'tax_rate' => $quote->tax_rate,
                'discount_rate' => $quote->discount_rate,
                'currency' => $quote->currency,
                'order_date' => $orderDate,
                'expected_delivery_date' => $expectedDeliveryDate,
                'shipping_address' => $this->generateAddress(),
                'billing_address' => $this->generateAddress(),
                'notes' => 'Order converted from quote ' . $quote->quote_number,
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            $orders[] = $order;
        }

        // Create standalone orders to reach exactly 10 total
        for ($i = count($orders) + 1; $i <= 10; $i++) {
            $company = $companies->random();
            $contact = $company->contacts->isNotEmpty() ? $company->contacts->random() : null;
            $user = $users->random();
            $service = $services[array_rand($services)];
            
            $orderDate = Carbon::now()->subDays(rand(1, 60));
            $expectedDeliveryDate = $orderDate->copy()->addDays(rand(30, 90));
            
            $subtotal = $service['price'];
            $taxRate = rand(0, 15);
            $discountRate = rand(0, 10);
            
            $discountAmount = ($subtotal * $discountRate) / 100;
            $taxableAmount = $subtotal - $discountAmount;
            $taxAmount = ($taxableAmount * $taxRate) / 100;
            $totalAmount = $taxableAmount + $taxAmount;

            $status = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'][rand(0, 4)];
            
            $order = Order::create([
                'order_number' => $this->generateOrderNumber($i),
                'company_id' => $company->id,
                'contact_id' => $contact?->id,
                'user_id' => $user->id,
                'title' => $service['name'] . ' for ' . $company->name,
                'description' => $service['description'],
                'status' => $status,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'tax_rate' => $taxRate,
                'discount_rate' => $discountRate,
                'currency' => 'USD',
                'order_date' => $orderDate,
                'expected_delivery_date' => $expectedDeliveryDate,
                'shipping_address' => $this->generateAddress(),
                'billing_address' => $this->generateAddress(),
                'notes' => 'Direct order placement',
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            $orders[] = $order;
        }

        $this->command->info('Created ' . count($orders) . ' orders');

        // Create exactly 10 invoices (mix of from orders and standalone)
        $invoiceableOrders = collect($orders)->filter(fn($o) => in_array($o->status, ['confirmed', 'processing', 'shipped', 'delivered']));
        $invoicesFromOrders = min($invoiceableOrders->count(), 6); // Max 6 invoices from orders
        $standaloneInvoices = 10 - $invoicesFromOrders; // Remaining as standalone invoices
        
        // Create invoices from orders
        $orderInvoices = $invoiceableOrders->take($invoicesFromOrders);
        foreach ($orderInvoices as $order) {
            $invoiceDate = $order->created_at->addDays(rand(1, 14));
            $dueDate = $invoiceDate->copy()->addDays(30);
            
            $status = ['draft', 'sent', 'paid', 'partially_paid', 'overdue'][rand(0, 4)];
            
            // Calculate payment amounts based on status
            $paidAmount = 0;
            $dueAmount = $order->total_amount;
            $paidDate = null;
            
            if ($status === 'paid') {
                $paidAmount = $order->total_amount;
                $dueAmount = 0;
                $paidDate = $invoiceDate->copy()->addDays(rand(1, 30));
            } elseif ($status === 'partially_paid') {
                $paidAmount = $order->total_amount * (rand(20, 80) / 100); // 20-80% paid
                $dueAmount = $order->total_amount - $paidAmount;
                $paidDate = $invoiceDate->copy()->addDays(rand(1, 30));
            } elseif ($status === 'overdue') {
                $dueDate = Carbon::now()->subDays(rand(1, 30)); // Make it overdue
            }
            
            $invoice = Invoice::create([
                'invoice_number' => $this->generateInvoiceNumber(count($invoices) + 1),
                'company_id' => $order->company_id,
                'contact_id' => $order->contact_id,
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'quote_id' => $order->quote_id,
                'title' => $order->title,
                'description' => $order->description,
                'status' => $status,
                'subtotal' => $order->subtotal,
                'tax_amount' => $order->tax_amount,
                'discount_amount' => $order->discount_amount,
                'total_amount' => $order->total_amount,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'tax_rate' => $order->tax_rate,
                'discount_rate' => $order->discount_rate,
                'currency' => $order->currency,
                'invoice_date' => $invoiceDate,
                'due_date' => $dueDate,
                'paid_date' => $paidDate,
                'payment_terms' => 'Net 30 days. Late payment may incur additional charges.',
                'notes' => 'Invoice generated from order ' . $order->order_number,
                'created_at' => $invoiceDate,
                'updated_at' => $invoiceDate,
            ]);

            $invoices[] = $invoice;
        }

        // Create standalone invoices to reach exactly 10 total
        for ($i = count($invoices) + 1; $i <= 10; $i++) {
            $company = $companies->random();
            $contact = $company->contacts->isNotEmpty() ? $company->contacts->random() : null;
            $user = $users->random();
            $service = $services[array_rand($services)];
            
            $invoiceDate = Carbon::now()->subDays(rand(1, 45));
            $dueDate = $invoiceDate->copy()->addDays(30);
            
            $subtotal = $service['price'];
            $taxRate = rand(0, 15);
            $discountRate = rand(0, 10);
            
            $discountAmount = ($subtotal * $discountRate) / 100;
            $taxableAmount = $subtotal - $discountAmount;
            $taxAmount = ($taxableAmount * $taxRate) / 100;
            $totalAmount = $taxableAmount + $taxAmount;

            $status = ['draft', 'sent', 'paid', 'partially_paid', 'overdue'][rand(0, 4)];
            
            $paidAmount = 0;
            $dueAmount = $totalAmount;
            $paidDate = null;
            
            if ($status === 'paid') {
                $paidAmount = $totalAmount;
                $dueAmount = 0;
                $paidDate = $invoiceDate->copy()->addDays(rand(1, 30));
            } elseif ($status === 'partially_paid') {
                $paidAmount = $totalAmount * (rand(30, 70) / 100);
                $dueAmount = $totalAmount - $paidAmount;
                $paidDate = $invoiceDate->copy()->addDays(rand(1, 30));
            } elseif ($status === 'overdue') {
                $dueDate = Carbon::now()->subDays(rand(1, 30));
            }
            
            $invoice = Invoice::create([
                'invoice_number' => $this->generateInvoiceNumber($i),
                'company_id' => $company->id,
                'contact_id' => $contact?->id,
                'user_id' => $user->id,
                'title' => $service['name'] . ' for ' . $company->name,
                'description' => $service['description'],
                'status' => $status,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'tax_rate' => $taxRate,
                'discount_rate' => $discountRate,
                'currency' => 'USD',
                'invoice_date' => $invoiceDate,
                'due_date' => $dueDate,
                'paid_date' => $paidDate,
                'payment_terms' => 'Net 30 days. Late payment may incur additional charges.',
                'notes' => 'Direct invoice - no related order or quote',
                'created_at' => $invoiceDate,
                'updated_at' => $invoiceDate,
            ]);

            $invoices[] = $invoice;
        }

        $this->command->info('Created ' . count($invoices) . ' invoices');

        $this->command->info('Sales demo data created successfully!');
        $this->command->info('Summary:');
        $this->command->info('- Quotes: ' . count($quotes));
        $this->command->info('- Orders: ' . count($orders));
        $this->command->info('- Invoices: ' . count($invoices));
    }

    private function generateQuoteNumber($number): string
    {
        $year = date('Y');
        $month = date('m');
        return "QUO-{$year}{$month}-" . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    private function generateOrderNumber($number): string
    {
        $year = date('Y');
        $month = date('m');
        return "ORD-{$year}{$month}-" . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    private function generateInvoiceNumber($number): string
    {
        $year = date('Y');
        $month = date('m');
        return "INV-{$year}{$month}-" . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    private function generateAddress(): string
    {
        $addresses = [
            "123 Business St, Suite 100\nNew York, NY 10001",
            "456 Corporate Ave\nLos Angeles, CA 90210",
            "789 Enterprise Blvd\nChicago, IL 60601",
            "321 Commerce Dr, Floor 5\nMiami, FL 33101",
            "654 Industry Way\nSeattle, WA 98101",
            "987 Trade Center\nAustin, TX 78701",
            "147 Market Square\nBoston, MA 02101",
            "258 Innovation Hub\nSan Francisco, CA 94101",
        ];

        return $addresses[array_rand($addresses)];
    }
}
