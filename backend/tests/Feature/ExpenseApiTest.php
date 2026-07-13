<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Expense;
use App\Models\Person;
use App\Models\StockLocation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseApiTest extends TestCase
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

    public function test_guest_cannot_access_expenses(): void
    {
        $response = $this->getJson('/api/v1/expenses');

        $response->assertStatus(401);
    }

    public function test_can_create_expense(): void
    {
        $data = $this->seedBaseData();

        $payload = [
            'date' => now()->toDateString(),
            'amount' => 25.50,
            'category' => 'Supplies',
            'description' => 'Office supplies',
            'employee_id' => $data['employee_id'],
            'location_id' => $data['location_id'],
        ];

        $response = $this->postJson('/api/v1/expenses', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['message' => 'Expense created']);

        $this->assertDatabaseHas('expenses', ['category' => 'Supplies', 'amount' => 25.50]);
    }

    public function test_can_show_expense(): void
    {
        $data = $this->seedBaseData();

        $expense = Expense::create([
            'date' => now()->toDateString(),
            'amount' => 50.00,
            'category' => 'Rent',
            'description' => 'Rent',
            'employee_id' => $data['employee_id'],
            'location_id' => $data['location_id'],
            'deleted' => false,
        ]);

        $response = $this->getJson('/api/v1/expenses/' . $expense->expense_id);

        $response->assertStatus(200);
    }

    public function test_expense_store_requires_amount(): void
    {
        $data = $this->seedBaseData();

        $payload = [
            'date' => now()->toDateString(),
            'category' => 'Misc',
            'employee_id' => $data['employee_id'],
            'location_id' => $data['location_id'],
        ];

        $response = $this->postJson('/api/v1/expenses', $payload);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }
}
