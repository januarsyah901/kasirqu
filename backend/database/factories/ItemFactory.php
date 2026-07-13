<?php

namespace Database\Factories;

use App\Models\Item;
use App\Models\StockLocation;
use App\Models\TaxCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItemFactory extends Factory
{
    protected $model = Item::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'category' => $this->faker->word(),
            'item_number' => 'SKU' . $this->faker->unique()->numerify('####'),
            'description' => $this->faker->sentence(),
            'cost_price' => $this->faker->randomFloat(2, 0.5, 10),
            'unit_price' => $this->faker->randomFloat(2, 1, 20),
            'reorder_level' => 10,
            'receiving_quantity' => 1,
            'allow_alt_description' => false,
            'is_serialized' => false,
            'deleted' => false,
            'stock_type' => 'STOCK',
            'item_type' => 'NORMAL',
            'tax_category_id' => TaxCategory::factory(),
            'supplier_id' => null,
        ];
    }
}
