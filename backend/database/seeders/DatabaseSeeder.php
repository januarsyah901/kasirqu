<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Item;
use App\Models\Person;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\StockLocation;
use App\Models\Supplier;
use App\Models\TaxCategory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            StockLocationSeeder::class,
            TaxCategorySeeder::class,
            EmployeeSeeder::class,
            CustomerSeeder::class,
            SupplierSeeder::class,
            ProductSeeder::class,
            SaleSeeder::class,
        ]);
    }
}

class StockLocationSeeder extends Seeder
{
    public function run(): void
    {
        StockLocation::create(['name' => 'Main Warehouse', 'address' => '123 Nowhere St']);
        StockLocation::create(['name' => 'Store Front', 'address' => '124 Nowhere St']);
    }
}

class TaxCategorySeeder extends Seeder
{
    public function run(): void
    {
        TaxCategory::create(['name' => 'Default', 'tax_rate' => 8.000]);
        TaxCategory::create(['name' => 'Food', 'tax_rate' => 0.000]);
    }
}

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $person = Person::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'phone_number' => '555-555-5555',
            'email' => 'admin@kasirqu.local',
        ]);
        Employee::create([
            'person_id' => $person->person_id,
            'username' => 'admin',
            'password' => bcrypt('password'),
        ]);
    }
}

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $person = Person::create([
                'first_name' => "Customer{$i}",
                'last_name' => 'Last',
                'phone_number' => "555-000-{$i}",
                'email' => "customer{$i}@example.com",
            ]);
            Customer::create([
                'person_id' => $person->person_id,
                'company_name' => $i % 3 === 0 ? "Company {$i}" : null,
                'account_number' => 'CUST' . str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                'discount' => 0,
            ]);
        }
    }
}

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $person = Person::create([
                'first_name' => "Supplier{$i}",
                'last_name' => 'Co',
                'phone_number' => "555-100-{$i}",
                'email' => "supplier{$i}@example.com",
            ]);
            Supplier::create([
                'person_id' => $person->person_id,
                'account_number' => 'SUP' . $i,
            ]);
        }
    }
}

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = Supplier::all();
        $taxCategories = TaxCategory::all();
        $locations = StockLocation::all();

        $names = [
            ['Bread', 'Bakery', 1.20, 2.50],
            ['Milk 1L', 'Dairy', 0.90, 1.80],
            ['Eggs 12pk', 'Dairy', 1.50, 3.20],
            ['Rice 5kg', 'Grains', 3.00, 6.00],
            ['Coffee 250g', 'Beverages', 2.10, 4.50],
            ['Water 600ml', 'Beverages', 0.30, 0.80],
            ['Soap', 'Household', 0.50, 1.20],
            ['Chocolate Bar', 'Snacks', 0.70, 1.50],
            ['Apple 1kg', 'Produce', 1.00, 2.20],
            ['Tea 100pk', 'Beverages', 1.80, 3.90],
        ];

        foreach ($names as $idx => $n) {
            $item = Item::create([
                'name' => $n[0],
                'category' => $n[1],
                'supplier_id' => $suppliers[$idx % $suppliers->count()]->person_id,
                'item_number' => 'SKU' . str_pad((string) ($idx + 1), 4, '0', STR_PAD_LEFT),
                'description' => $n[0] . ' product',
                'cost_price' => $n[2],
                'unit_price' => $n[3],
                'reorder_level' => 10,
                'tax_category_id' => $taxCategories[$idx % 2]->id,
                'stock_type' => 'STOCK',
                'item_type' => 'NORMAL',
            ]);

            foreach ($locations as $loc) {
                \App\Models\ItemQuantity::create([
                    'item_id' => $item->item_id,
                    'location_id' => $loc->id,
                    'quantity' => rand(20, 200),
                ]);
            }
        }
    }
}

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        $employee = Employee::first();
        $customers = Customer::all();
        $items = Item::all();
        $locations = StockLocation::all();

        for ($s = 1; $s <= 5; $s++) {
            $sale = Sale::create([
                'sale_time' => now()->subDays($s),
                'customer_id' => $customers[$s % $customers->count()]->person_id,
                'employee_id' => $employee->person_id,
                'comment' => '',
                'sale_type' => 'SALE',
            ]);

            for ($line = 0; $line < 3; $line++) {
                $item = $items[($s + $line) % $items->count()];
                SaleItem::create([
                    'sale_id' => $sale->sale_id,
                    'item_id' => $item->item_id,
                    'line' => $line + 1,
                    'quantity_purchased' => rand(1, 5),
                    'item_unit_price' => $item->unit_price,
                    'item_cost_price' => $item->cost_price,
                    'item_location' => $locations[0]->id,
                ]);
            }

            $total = $sale->items->sum(fn($i) => $i->quantity_purchased * $i->item_unit_price);
            SalePayment::create([
                'sale_id' => $sale->sale_id,
                'payment_type' => 'Cash',
                'payment_amount' => $total,
            ]);
        }
    }
}
