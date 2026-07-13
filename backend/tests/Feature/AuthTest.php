<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function registerUser(): array
    {
        return [
            'name' => 'Test User',
            'email' => 'test@kasirqu.local',
            'password' => 'password',
            'password_confirmation' => 'password',
        ];
    }

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->registerUser());

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'token'])
            ->assertJson([
                'user' => [
                    'name' => 'Test User',
                    'email' => 'test@kasirqu.local',
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'test@kasirqu.local']);
    }

    public function test_user_can_login(): void
    {
        User::create([
            'name' => 'Test User',
            'email' => 'test@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@kasirqu.local',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_user_can_get_profile(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $token = $user->createToken('kasirqu')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'email' => 'test@kasirqu.local',
            ]);
    }

    public function test_user_can_logout(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@kasirqu.local',
            'password' => bcrypt('password'),
        ]);

        $token = $user->createToken('kasirqu')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Revoked']);
    }
}
