<?php

namespace Tests\Feature;

use App\Models\CashUp;
use App\Models\Employee;
use App\Models\Person;
use App\Models\StockLocation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CashUpApiTest extends TestCase
{
    use RefreshDatabase;

    private function seedBaseData(): array
    {
        $location = StockLocation::create(['name' => 'Main Warehouse', 'address' => '123 Nowhere St']);

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
            'location_id' => $location->id,
            'employee_id' => $employee->person_id,
        ];
    }

    public function test_guest_cannot_access_cash_up(): void
    {
        $response = $this->getJson('/api/v1/cash_up');

        $response->assertStatus(401);
    }

    public function test_can_create_cash_up(): void
    {
        $data = $this->seedBaseData();

        $payload = [
            'open_amount' => 100.00,
            'close_amount' => 350.00,
            'cash_sales_amount' => 250.00,
            'open_date' => now()->toDateString(),
            'close_date' => now()->toDateString(),
            'employee_id' => $data['employee_id'],
            'location_id' => $data['location_id'],
        ];

        $response = $this->postJson('/api/v1/cash_up', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['message' => 'Cash up created']);

        $this->assertDatabaseHas('cash_up', ['close_amount' => 350.00]);
    }

    public function test_can_show_cash_up(): void
    {
        $data = $this->seedBaseData();

        $cashUp = CashUp::create([
            'open_amount' => 100.00,
            'close_amount' => 200.00,
            'cash_sales_amount' => 100.00,
            'open_date' => now()->toDateString(),
            'close_date' => now()->toDateString(),
            'employee_id' => $data['employee_id'],
            'location_id' => $data['location_id'],
            'deleted' => false,
        ]);

        $response = $this->getJson('/api/v1/cash_up/' . $cashUp->cashup_id);

        $response->assertStatus(200);
    }

    public function test_cash_up_store_requires_open_amount(): void
    {
        $data = $this->seedBaseData();

        $payload = [
            'close_amount' => 200.00,
            'open_date' => now()->toDateString(),
            'close_date' => now()->toDateString(),
            'employee_id' => $data['employee_id'],
            'location_id' => $data['location_id'],
        ];

        $response = $this->postJson('/api/v1/cash_up', $payload);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }
}
