<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Item;
use App\Models\ItemQuantity;
use App\Models\Person;
use App\Models\StockLocation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryApiTest extends TestCase
{
    use RefreshDatabase;

    private function seedBaseData(): array
    {
        $location = StockLocation::create(['name' => 'Main Warehouse', 'address' => '123 Nowhere St']);
        $item = Item::create([
            'name' => 'Test Product',
            'category' => 'Test',
            'cost_price' => 2.00,
            'unit_price' => 4.00,
            'reorder_level' => 0,
        ]);
        ItemQuantity::create([
            'item_id' => $item->item_id,
            'location_id' => $location->id,
            'quantity' => 100,
        ]);

        $person = Person::create([
            'first_name' => 'Test',
            'last_name' => 'Employee',
            'phone_number' => '555-000-0',
            'email' => 'emp@kasirqu.local',
        ]);
        $employee = Employee::create([
            'person_id' => $person->person_id,
            'username' => 'tester',
            'password' => bcrypt('password'),
        ]);

        $user = User::create([
            'name' => 'Tester',
            'email' => 'tester@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $this->actingAs($user, 'sanctum');

        return [
            'item_id' => $item->item_id,
            'location_id' => $location->id,
            'employee_id' => $employee->person_id,
        ];
    }

    public function test_guest_cannot_access_inventory(): void
    {
        $response = $this->getJson('/api/v1/inventory');

        $response->assertStatus(401);
    }

    public function test_can_create_inventory_transaction(): void
    {
        $data = $this->seedBaseData();

        $payload = [
            'trans_items' => $data['item_id'],
            'trans_location' => $data['location_id'],
            'trans_inventory' => 5,
            'trans_comment' => 'Initial stock',
            'trans_user' => 'tester',
        ];

        $response = $this->postJson('/api/v1/inventory', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['message' => 'Inventory transaction created']);

        $this->assertDatabaseHas('inventory', [
            'trans_items' => $data['item_id'],
            'trans_inventory' => 5,
        ]);
        $this->assertDatabaseHas('item_quantities', [
            'item_id' => $data['item_id'],
            'location_id' => $data['location_id'],
            'quantity' => 105,
        ]);
    }

    public function test_can_show_inventory_transaction(): void
    {
        $data = $this->seedBaseData();

        $trans = \App\Models\Inventory::create([
            'trans_items' => $data['item_id'],
            'trans_location' => $data['location_id'],
            'trans_inventory' => -5,
            'trans_comment' => 'Adjust',
            'trans_date' => now()->toDateString(),
            'trans_user' => 'tester',
        ]);

        $response = $this->getJson('/api/v1/inventory/' . $trans->trans_id);

        $response->assertStatus(200);
    }

    public function test_can_transfer_inventory(): void
    {
        $data = $this->seedBaseData();

        $toLocation = StockLocation::create(['name' => 'Store Front', 'address' => '124 Nowhere St']);

        $payload = [
            'from_location' => $data['location_id'],
            'to_location' => $toLocation->id,
            'item_id' => $data['item_id'],
            'quantity' => 10,
            'trans_user' => 'tester',
        ];

        $response = $this->postJson('/api/v1/inventory/transfer', $payload);

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Transfer completed']);

        $this->assertDatabaseHas('item_quantities', [
            'item_id' => $data['item_id'],
            'location_id' => $data['location_id'],
            'quantity' => 90,
        ]);
        $this->assertDatabaseHas('item_quantities', [
            'item_id' => $data['item_id'],
            'location_id' => $toLocation->id,
            'quantity' => 10,
        ]);
        $this->assertDatabaseCount('inventory', 2);
    }

    public function test_inventory_store_requires_trans_items(): void
    {
        $this->seedBaseData();

        $payload = [
            'trans_location' => 1,
            'trans_inventory' => 5,
        ];

        $response = $this->postJson('/api/v1/inventory', $payload);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }
}
