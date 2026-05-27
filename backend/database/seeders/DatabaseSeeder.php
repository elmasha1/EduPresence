<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\AttendanceRecord;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $teacher = User::factory()->create([
            'name' => 'Marie Dupont',
            'email' => 'teacher@edupresence.test',
            'password' => 'password',
        ]);

        // Create 3 classrooms for this teacher
        $classrooms = Classroom::factory()->count(3)->create(['user_id' => $teacher->id]);

        // Populate each classroom with 8-12 students
        foreach ($classrooms as $classroom) {
            $students = Student::factory()
                ->count(fake()->numberBetween(8, 12))
                ->create([
                    'user_id' => $teacher->id,
                    'classroom_id' => $classroom->id,
                ]);

            // Generate the past 7 weekdays of attendance for this classroom
            for ($i = 0; $i < 7; $i++) {
                $date = Carbon::today()->subDays($i);
                if ($date->isWeekend()) {
                    continue;
                }

                $attendance = Attendance::create([
                    'user_id' => $teacher->id,
                    'classroom_id' => $classroom->id,
                    'date' => $date->toDateString(),
                ]);

                foreach ($students as $student) {
                    AttendanceRecord::create([
                        'attendance_id' => $attendance->id,
                        'student_id' => $student->id,
                        'status' => fake()->randomElement([
                            'present', 'present', 'present', 'present', 'present',
                            'present', 'present', 'absent', 'late',
                        ]),
                    ]);
                }
            }
        }
    }
}
