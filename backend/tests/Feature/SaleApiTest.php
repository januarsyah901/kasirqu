<?php

namespace Tests\Feature;

use App\Models\CashUp;
use App\Models\Employee;
use App\Models\Item;
use App\Models\ItemQuantity;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\StockLocation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaleApiTest extends TestCase
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
        $person = \App\Models\Person::create([
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

    public function test_can_create_sale(): void
    {
        $data = $this->seedBaseData();

        $payload = [
            'employee_id' => $data['employee_id'],
            'items' => [
                [
                    'item_id' => $data['item_id'],
                    'quantity_purchased' => 2,
                    'item_unit_price' => 4.00,
                    'item_location' => $data['location_id'],
                ],
            ],
            'payments' => [
                [
                    'payment_type' => 'Cash',
                    'payment_amount' => 8.00,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/sales', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['message' => 'Sale created']);

        $this->assertDatabaseCount('sales', 1);
        $this->assertDatabaseCount('sales_items', 1);
        $this->assertDatabaseCount('sales_payments', 1);
    }

    public function test_sale_requires_items(): void
    {
        $data = $this->seedBaseData();

        $payload = [
            'employee_id' => $data['employee_id'],
            'items' => [],
            'payments' => [],
        ];

        $response = $this->postJson('/api/v1/sales', $payload);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }

    public function test_can_list_sales(): void
    {
        $this->actingAsUser();

        $response = $this->getJson('/api/v1/sales');

        $response->assertStatus(200);
    }

    public function test_can_show_sale(): void
    {
        $data = $this->seedBaseData();

        $sale = Sale::create([
            'employee_id' => $data['employee_id'],
            'sale_type' => 'SALE',
        ]);

        SaleItem::create([
            'sale_id' => $sale->sale_id,
            'item_id' => $data['item_id'],
            'line' => 1,
            'quantity_purchased' => 1,
            'item_unit_price' => 4.00,
            'item_cost_price' => 2.00,
            'item_location' => $data['location_id'],
        ]);

        $response = $this->getJson('/api/v1/sales/' . $sale->sale_id);

        $response->assertStatus(200);
    }

    private function actingAsUser(): User
    {
        $user = User::create([
            'name' => 'Tester',
            'email' => 'tester@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $this->actingAs($user, 'sanctum');

        return $user;
    }
}
