<?php

namespace Database\Factories;

use App\Models\Classroom;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassroomFactory extends Factory
{
    protected $model = Classroom::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['Mathématiques', 'Français', 'Histoire', 'Sciences', 'Anglais']).' '.fake()->randomElement(['CM1', 'CM2', '6ème', '5ème', '4ème']),
            'level' => fake()->randomElement(['Primaire', 'Collège', 'Lycée']),
            'description' => fake()->sentence(),
        ];
    }
}
