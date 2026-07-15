<?php

namespace Tests\Unit;

use App\Models\Employee;
use App\Models\Item;
use App\Models\ItemQuantity;
use App\Models\Person;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\SaleItemTax;
use App\Models\StockLocation;
use App\Models\TaxCategory;
use App\Services\SaleService;
use App\Services\TaxService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaleServiceTest extends TestCase
{
    use RefreshDatabase;

    private SaleService $saleService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->saleService = new SaleService(new TaxService());
    }

    public function test_calculate_totals_sums_correctly(): void
    {
        $category = TaxCategory::create([
            'name' => 'VAT 10%',
            'tax_rate' => 10.000,
        ]);

        $item = Item::create([
            'name' => 'Widget',
            'category' => 'Test',
            'cost_price' => 2.00,
            'unit_price' => 4.00,
            'tax_category_id' => $category->id,
        ]);

        $totals = $this->saleService->calculateTotals([
            ['item_id' => $item->item_id, 'quantity_purchased' => 2, 'item_unit_price' => 4.00, 'discount_percent' => 0],
        ]);

        $this->assertCount(1, $totals['lines']);
        $this->assertSame(8.00, $totals['subtotal']);
        $this->assertSame(0.80, $totals['total_tax']);
        $this->assertSame(8.80, $totals['total']);
    }

    public function test_calculate_totals_discount_reduces_taxable_amount(): void
    {
        $category = TaxCategory::create([
            'name' => 'VAT',
            'tax_rate' => 10.000,
        ]);

        $item = Item::create([
            'name' => 'Widget',
            'category' => 'Test',
            'cost_price' => 2.00,
            'unit_price' => 10.00,
            'tax_category_id' => $category->id,
        ]);

        $totals = $this->saleService->calculateTotals([
            ['item_id' => $item->item_id, 'quantity_purchased' => 1, 'item_unit_price' => 10.00, 'discount_percent' => 50],
        ]);

        $this->assertSame(5.00, $totals['subtotal']);
        $this->assertSame(0.50, $totals['total_tax']);
    }

    public function test_create_sale_writes_rows_and_decrements_stock(): void
    {
        $location = StockLocation::create(['name' => 'WH', 'address' => '']);
        $item = Item::create([
            'name' => 'Widget',
            'category' => 'Test',
            'cost_price' => 2.00,
            'unit_price' => 4.00,
            'tax_category_id' => null,
        ]);
        ItemQuantity::create([
            'item_id' => $item->item_id,
            'location_id' => $location->id,
            'quantity' => 100,
        ]);

        $person = Person::create([
            'first_name' => 'E',
            'last_name' => 'mp',
            'phone_number' => '',
            'email' => 'e@test',
        ]);
        $employee = Employee::create([
            'person_id' => $person->person_id,
            'username' => 'cashier',
            'password' => 'hash',
        ]);

        $sale = $this->saleService->createSale([
            'employee_id' => $employee->person_id,
            'items' => [
                [
                    'item_id' => $item->item_id,
                    'quantity_purchased' => 3,
                    'item_unit_price' => 4.00,
                    'item_location' => $location->id,
                ],
            ],
            'payments' => [
                ['payment_type' => 'Cash', 'payment_amount' => 12.00],
            ],
        ]);

        $this->assertInstanceOf(Sale::class, $sale);
        $this->assertDatabaseCount('sales', 1);
        $this->assertDatabaseCount('sales_items', 1);
        $this->assertDatabaseCount('sales_payments', 1);
        $this->assertDatabaseHas('item_quantities', [
            'item_id' => $item->item_id,
            'location_id' => $location->id,
            'quantity' => 97,
        ]);

        $saleItem = SaleItem::first();
        $this->assertSame('2.00', $saleItem->item_cost_price);
        $this->assertSame(12.00, $saleItem->quantity_purchased * $saleItem->item_unit_price);
    }

    public function test_build_receipt_sums_correctly(): void
    {
        $location = StockLocation::create(['name' => 'WH', 'address' => '']);
        $category = TaxCategory::create([
            'name' => 'VAT',
            'tax_rate' => 10.000,
        ]);
        $item = Item::create([
            'name' => 'Widget',
            'category' => 'Test',
            'cost_price' => 2.00,
            'unit_price' => 10.00,
            'tax_category_id' => $category->id,
        ]);

        $person = Person::create([
            'first_name' => 'E',
            'last_name' => 'mp',
            'phone_number' => '',
            'email' => 'e@test',
        ]);
        $employee = Employee::create([
            'person_id' => $person->person_id,
            'username' => 'cashier',
            'password' => 'hash',
        ]);

        $sale = Sale::create(['employee_id' => $employee->person_id]);
        SaleItem::create([
            'sale_id' => $sale->sale_id,
            'item_id' => $item->item_id,
            'line' => 1,
            'quantity_purchased' => 2,
            'item_unit_price' => 10.00,
            'discount_percent' => 0,
            'item_location' => $location->id,
        ]);
        SaleItemTax::create([
            'sale_id' => $sale->sale_id,
            'item_id' => $item->item_id,
            'line' => 1,
            'name' => 'VAT',
            'percent' => 10.000,
        ]);
        SalePayment::create([
            'sale_id' => $sale->sale_id,
            'payment_type' => 'Cash',
            'payment_amount' => 22.00,
        ]);

        $receipt = $this->saleService->buildReceipt($sale->fresh());

        $this->assertSame(1, count($receipt['items']));
        $this->assertSame(20.00, $receipt['subtotal']);
        $this->assertSame(2.00, $receipt['total_tax']);
        $this->assertSame(22.00, $receipt['total']);
        $this->assertSame(22.00, $receipt['amount_paid']);
        $this->assertSame(0.00, $receipt['change']);
    }
}
