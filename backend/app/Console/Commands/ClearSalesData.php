<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Quote;
use App\Models\Order;
use App\Models\Invoice;

class ClearSalesData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sales:clear';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all sales data (quotes, orders, invoices)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->confirm('This will delete ALL sales data. Are you sure?')) {
            $this->info('Operation cancelled.');
            return;
        }

        $this->info('Clearing sales data...');

        // Delete in reverse order to handle foreign keys
        $invoiceCount = Invoice::count();
        Invoice::query()->delete();
        $this->info("Deleted {$invoiceCount} invoices");

        $orderCount = Order::count();
        Order::query()->delete();
        $this->info("Deleted {$orderCount} orders");

        $quoteCount = Quote::count();
        Quote::query()->delete();
        $this->info("Deleted {$quoteCount} quotes");

        $this->info('Sales data cleared successfully!');
    }
}
