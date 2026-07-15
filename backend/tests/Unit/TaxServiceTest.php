<?php

namespace Tests\Unit;

use App\Models\Item;
use App\Models\ItemTax;
use App\Models\TaxCategory;
use App\Services\TaxService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxServiceTest extends TestCase
{
    use RefreshDatabase;

    private TaxService $taxService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->taxService = new TaxService();
    }

    public function test_effective_tax_rate_is_zero_when_no_tax(): void
    {
        $item = Item::create([
            'name' => 'No Tax Item',
            'category' => 'Test',
            'cost_price' => 1.00,
            'unit_price' => 2.00,
        ]);

        $this->assertSame(0.0, $this->taxService->effectiveTaxRate($item));
    }

    public function test_effective_tax_rate_uses_tax_category(): void
    {
        $category = TaxCategory::create([
            'name' => 'VAT 10%',
            'tax_rate' => 10.000,
        ]);

        $item = Item::create([
            'name' => 'Taxed Item',
            'category' => 'Test',
            'cost_price' => 1.00,
            'unit_price' => 2.00,
            'tax_category_id' => $category->id,
        ]);

        $this->assertSame(10.0, $this->taxService->effectiveTaxRate($item));
        $this->assertSame('VAT 10%', $this->taxService->appliedTax($item)['name']);
        $this->assertSame(10.0, $this->taxService->appliedTax($item)['percent']);
    }

    public function test_effective_tax_rate_picks_highest_when_item_and_category_taxes_exist(): void
    {
        $category = TaxCategory::create([
            'name' => 'VAT 10%',
            'tax_rate' => 10.000,
        ]);

        $item = Item::create([
            'name' => 'Double Taxed',
            'category' => 'Test',
            'cost_price' => 1.00,
            'unit_price' => 2.00,
            'tax_category_id' => $category->id,
        ]);

        ItemTax::create([
            'item_id' => $item->item_id,
            'name' => 'Luxury',
            'percent' => 15.000,
        ]);

        $this->assertSame(15.0, $this->taxService->effectiveTaxRate($item));
        $this->assertSame('Luxury', $this->taxService->appliedTax($item)['name']);
    }

    public function test_line_amount_applies_discount(): void
    {
        $this->assertSame(40.00, $this->taxService->lineAmount(10, 5.0, 20));
        $this->assertSame(50.00, $this->taxService->lineAmount(10, 5.0, 0));
    }

    public function test_line_tax_amount_rounds_to_two_decimals(): void
    {
        $category = TaxCategory::create([
            'name' => 'VAT',
            'tax_rate' => 10.000,
        ]);

        $item = Item::create([
            'name' => 'Rounded',
            'category' => 'Test',
            'cost_price' => 1.00,
            'unit_price' => 3.33,
            'tax_category_id' => $category->id,
        ]);

        // 3.33 * 1 = 3.33 taxable, tax = 0.333 -> 0.33
        $this->assertSame(0.33, $this->taxService->lineTaxAmount($item, 1.0, 3.33));
    }
}
