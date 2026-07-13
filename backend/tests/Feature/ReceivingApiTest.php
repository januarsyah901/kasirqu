<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Item;
use App\Models\ItemQuantity;
use App\Models\Person;
use App\Models\Receiving;
use App\Models\ReceivingItem;
use App\Models\StockLocation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReceivingApiTest extends TestCase
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

    public function test_guest_cannot_access_receivings(): void
    {
        $response = $this->getJson('/api/v1/receivings');

        $response->assertStatus(401);
    }

    public function test_can_create_receiving(): void
    {
        $data = $this->seedBaseData();

        $payload = [
            'employee_id' => $data['employee_id'],
            'location_id' => $data['location_id'],
            'reference' => 'TEST-REF',
            'items' => [
                [
                    'item_id' => $data['item_id'],
                    'quantity_purchased' => 10,
                    'item_cost_price' => 2.00,
                    'item_unit_price' => 4.00,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/receivings', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['message' => 'Receiving created']);

        $this->assertDatabaseHas('receivings', ['reference' => 'TEST-REF']);
        $this->assertDatabaseHas('receiving_items', [
            'item_id' => $data['item_id'],
            'quantity_purchased' => 10,
        ]);
        $this->assertDatabaseHas('item_quantities', [
            'item_id' => $data['item_id'],
            'location_id' => $data['location_id'],
            'quantity' => 110,
        ]);
        $this->assertDatabaseHas('inventory', [
            'trans_items' => $data['item_id'],
            'trans_location' => $data['location_id'],
            'trans_inventory' => 10,
        ]);
    }

    public function test_can_show_receiving(): void
    {
        $data = $this->seedBaseData();

        $receiving = Receiving::create([
            'supplier_id' => null,
            'employee_id' => $data['employee_id'],
            'receiving_time' => now(),
            'comment' => '',
            'payment_type' => 'Cash',
            'amount_tendered' => 20,
            'amount_owed' => 0,
            'reference' => 'SHOW-REF',
            'location_id' => $data['location_id'],
            'deleted' => false,
        ]);

        $response = $this->getJson('/api/v1/receivings/' . $receiving->receiving_id);

        $response->assertStatus(200);
    }

    public function test_receiving_store_requires_items(): void
    {
        $data = $this->seedBaseData();

        $payload = [
            'employee_id' => $data['employee_id'],
            'location_id' => $data['location_id'],
            'items' => [],
        ];

        $response = $this->postJson('/api/v1/receivings', $payload);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }
}
