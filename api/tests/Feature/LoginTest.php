<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        // 1. Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        // 2. Attempt login via API
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        // 3. Assert success and token presence
        $response->assertStatus(200)
                 ->assertJsonStructure(['access_token', 'user']);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $user = User::factory()->create(['password' => 'password']);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Invalid credentials.']);
    }
}