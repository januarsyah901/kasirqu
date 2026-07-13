<?php

namespace Database\Seeders;

use App\Models\CashUp;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Item;
use App\Models\Receiving;
use App\Models\ReceivingItem;
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
            ReceivingSeeder::class,
            ExpenseSeeder::class,
            CashUpSeeder::class,
            GiftcardSeeder::class,
            ItemKitSeeder::class,
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

class ReceivingSeeder extends Seeder
{
    public function run(): void
    {
        $employee = Employee::first();
        $suppliers = Supplier::all();
        $locations = StockLocation::all();
        $items = Item::all();

        for ($r = 1; $r <= 3; $r++) {
            $supplier = $suppliers[$r % $suppliers->count()];
            $location = $locations[0];

            $receiving = Receiving::create([
                'supplier_id' => $supplier->person_id,
                'employee_id' => $employee->person_id,
                'receiving_time' => now()->subDays($r),
                'comment' => "Receiving #{$r}",
                'payment_type' => 'Cash',
                'amount_tendered' => 0,
                'amount_owed' => 0,
                'reference' => 'PO' . str_pad((string) $r, 4, '0', STR_PAD_LEFT),
                'location_id' => $location->id,
                'deleted' => false,
            ]);

            $costTotal = 0;
            for ($line = 0; $line < 3; $line++) {
                $item = $items[($r + $line) % $items->count()];
                $qty = rand(5, 20);
                $cost = $item->cost_price;
                $costTotal += $qty * $cost;
                ReceivingItem::create([
                    'receiving_id' => $receiving->receiving_id,
                    'item_id' => $item->item_id,
                    'line' => $line + 1,
                    'description' => $item->name,
                    'quantity_purchased' => $qty,
                    'item_cost_price' => $cost,
                    'item_unit_price' => $item->unit_price,
                    'discount_percent' => 0,
                    'location_id' => $location->id,
                ]);
            }

            $receiving->update(['amount_tendered' => $costTotal, 'amount_owed' => 0]);
        }
    }
}

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $employee = Employee::first();
        $locations = StockLocation::all();

        $samples = [
            ['Utilities', 'Electricity bill', 120.50],
            ['Rent', 'Monthly store rent', 800.00],
            ['Supplies', 'Office supplies', 45.75],
        ];

        foreach ($samples as $idx => $s) {
            Expense::create([
                'date' => now()->subDays($idx + 1)->toDateString(),
                'amount' => $s[2],
                'category' => $s[0],
                'description' => $s[1],
                'employee_id' => $employee->person_id,
                'location_id' => $locations[0]->id,
                'deleted' => false,
            ]);
        }
    }
}

class CashUpSeeder extends Seeder
{
    public function run(): void
    {
        $employee = Employee::first();
        $locations = StockLocation::all();

        CashUp::create([
            'open_amount' => 100.00,
            'close_amount' => 540.25,
            'cash_sales_amount' => 440.25,
            'open_date' => now()->toDateString(),
            'close_date' => now()->toDateString(),
            'employee_id' => $employee->person_id,
            'location_id' => $locations[0]->id,
            'deleted' => false,
        ]);
    }
}

class GiftcardSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 3; $i++) {
            \App\Models\Giftcard::create([
                'giftcard_number' => 1000 + $i,
                'value' => rand(10, 100),
                'record_time' => now()->subDays($i),
                'deleted' => false,
            ]);
        }
    }
}

class ItemKitSeeder extends Seeder
{
    public function run(): void
    {
        $items = \App\Models\Item::all();
        if ($items->isEmpty()) {
            return;
        }

        for ($k = 1; $k <= 2; $k++) {
            $kit = \App\Models\ItemKit::create([
                'name' => 'Kit ' . $k,
                'description' => 'Bundle ' . $k,
                'total_cost' => 0,
                'total_price' => 0,
                'deleted' => false,
            ]);

            $costTotal = 0;
            $priceTotal = 0;

            for ($l = 0; $l < 2; $l++) {
                $item = $items[(($k + $l) % $items->count())];
                $qty = 2;
                $costTotal += $qty * $item->cost_price;
                $priceTotal += $qty * $item->unit_price;

                \App\Models\ItemKitItem::create([
                    'item_kit_id' => $kit->item_kit_id,
                    'item_id' => $item->item_id,
                    'quantity' => $qty,
                    'cost_price' => $item->cost_price,
                    'unit_price' => $item->unit_price,
                ]);
            }

            $kit->update([
                'total_cost' => $costTotal,
                'total_price' => $priceTotal,
            ]);
        }
    }
}
