<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\ItemKit;
use App\Models\StockLocation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemKitApiTest extends TestCase
{
    use RefreshDatabase;

    private function seedBaseData(): array
    {
        $item1 = Item::create([
            'name' => 'Bread',
            'category' => 'Bakery',
            'cost_price' => 1.20,
            'unit_price' => 2.50,
            'reorder_level' => 0,
        ]);
        $item2 = Item::create([
            'name' => 'Milk',
            'category' => 'Dairy',
            'cost_price' => 0.90,
            'unit_price' => 1.80,
            'reorder_level' => 0,
        ]);

        $user = User::create([
            'name' => 'Tester',
            'email' => 'tester@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $this->actingAs($user, 'sanctum');

        return ['item1' => $item1->item_id, 'item2' => $item2->item_id];
    }

    public function test_guest_cannot_access_item_kits(): void
    {
        $response = $this->getJson('/api/v1/item_kits');

        $response->assertStatus(401);
    }

    public function test_can_create_item_kit(): void
    {
        $data = $this->seedBaseData();

        $payload = [
            'name' => 'Breakfast Bundle',
            'description' => 'Bread and milk',
            'items' => [
                [
                    'item_id' => $data['item1'],
                    'quantity' => 2,
                    'cost_price' => 1.20,
                    'unit_price' => 2.50,
                ],
                [
                    'item_id' => $data['item2'],
                    'quantity' => 1,
                    'cost_price' => 0.90,
                    'unit_price' => 1.80,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/item_kits', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['message' => 'Item kit created']);

        $this->assertDatabaseHas('item_kits', ['name' => 'Breakfast Bundle']);
        $this->assertDatabaseCount('item_kit_items', 2);
    }

    public function test_can_show_item_kit(): void
    {
        $data = $this->seedBaseData();

        $kit = ItemKit::create([
            'name' => 'Test Kit',
            'description' => 'Test',
            'total_cost' => 3.30,
            'total_price' => 6.80,
            'deleted' => false,
        ]);

        $response = $this->getJson('/api/v1/item_kits/' . $kit->item_kit_id);

        $response->assertStatus(200);
    }

    public function test_item_kit_store_requires_items(): void
    {
        $this->seedBaseData();

        $payload = [
            'name' => 'Empty Kit',
            'items' => [],
        ];

        $response = $this->postJson('/api/v1/item_kits', $payload);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }
}
