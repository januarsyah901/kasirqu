<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsUser(): User
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $this->actingAs($user, 'sanctum');

        return $user;
    }

    public function test_can_list_products(): void
    {
        $this->actingAsUser();

        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200);
    }

    public function test_can_create_product(): void
    {
        $this->actingAsUser();

        $response = $this->postJson('/api/v1/products', [
            'name' => 'Test Product',
            'cost_price' => 1.50,
            'unit_price' => 3.00,
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Test Product']);

        $this->assertDatabaseHas('items', ['name' => 'Test Product']);
    }

    public function test_can_show_product(): void
    {
        $this->actingAsUser();

        $item = Item::create([
            'name' => 'Show Product',
            'category' => 'Test',
            'cost_price' => 1.00,
            'unit_price' => 2.00,
            'reorder_level' => 0,
        ]);

        $response = $this->getJson('/api/v1/products/' . $item->item_id);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Show Product']);
    }
}
