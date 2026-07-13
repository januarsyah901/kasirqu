<?php

namespace Tests\Feature;

use App\Models\Giftcard;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GiftcardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_giftcards(): void
    {
        $response = $this->getJson('/api/v1/giftcards');

        $response->assertStatus(401);
    }

    public function test_can_create_giftcard(): void
    {
        $user = User::create([
            'name' => 'Tester',
            'email' => 'tester@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $this->actingAs($user, 'sanctum');

        $payload = [
            'giftcard_number' => 5001,
            'value' => 50.00,
        ];

        $response = $this->postJson('/api/v1/giftcards', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['message' => 'Giftcard created']);

        $this->assertDatabaseHas('giftcards', ['giftcard_number' => 5001]);
    }

    public function test_can_check_giftcard(): void
    {
        $user = User::create([
            'name' => 'Tester',
            'email' => 'tester@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $this->actingAs($user, 'sanctum');

        $giftcard = Giftcard::create([
            'giftcard_number' => 5002,
            'value' => 75.00,
            'record_time' => now(),
            'deleted' => false,
        ]);

        $response = $this->getJson('/api/v1/giftcards/check?number=5002');

        $response->assertStatus(200)
            ->assertJsonFragment(['giftcard_number' => 5002]);
    }

    public function test_giftcard_store_requires_number(): void
    {
        $user = User::create([
            'name' => 'Tester',
            'email' => 'tester@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/v1/giftcards', [
            'value' => 10.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }

    public function test_can_show_giftcard(): void
    {
        $user = User::create([
            'name' => 'Tester',
            'email' => 'tester@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $this->actingAs($user, 'sanctum');

        $giftcard = Giftcard::create([
            'giftcard_number' => 5003,
            'value' => 20.00,
            'record_time' => now(),
            'deleted' => false,
        ]);

        $response = $this->getJson('/api/v1/giftcards/' . $giftcard->giftcard_id);

        $response->assertStatus(200);
    }
}
