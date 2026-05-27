<?php

namespace Database\Factories;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    /** Common Moroccan first names (mixed). */
    private const FIRST_NAMES = [
        // Male
        'Mohamed', 'Ahmed', 'Hassan', 'Youssef', 'Omar', 'Karim', 'Said', 'Khalid',
        'Rachid', 'Mustapha', 'Anas', 'Adam', 'Yassine', 'Ayoub', 'Hamza', 'Ilyas',
        'Mehdi', 'Othmane', 'Walid', 'Bilal', 'Amine', 'Zakaria', 'Ismail', 'Nabil',
        'Abderrahim', 'Soufiane', 'Tarik', 'Reda', 'Hicham',
        // Female
        'Fatima', 'Khadija', 'Aicha', 'Zineb', 'Salma', 'Imane', 'Sara', 'Nadia',
        'Samira', 'Laila', 'Houda', 'Hanane', 'Meryem', 'Soukaina', 'Asma', 'Yasmine',
        'Najat', 'Hajar', 'Ikram', 'Chaimae', 'Oumaima', 'Wafaa', 'Malika', 'Naima',
        'Kawtar', 'Rania', 'Lina', 'Dounia',
    ];

    /** Common Moroccan family names. */
    private const LAST_NAMES = [
        'Alaoui', 'Bennani', 'Berrada', 'Bensouda', 'Chraibi', 'El Idrissi', 'El Fassi',
        'Tazi', 'Lahlou', 'Cherkaoui', 'Sefrioui', 'Ouazzani', 'Skalli', 'Lamrani',
        'Benjelloun', 'Filali', 'Boukhari', 'Tahiri', 'Mansouri', 'Ziani', 'Naciri',
        'El Amrani', 'Saidi', 'Hakimi', 'Bouazza', 'Andaloussi', 'El Khattabi', 'Bennis',
        'Squalli', 'Mekouar', 'El Maliki', 'Rifi', 'Belhaj', 'Kabbaj', 'Tahri',
        'El Mahdaoui', 'Ouahbi', 'Zerouali', 'El Ghazali',
    ];

    /** CIN region prefixes — 1 or 2 uppercase letters seen on real Moroccan CINs. */
    private const CIN_PREFIXES = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'BE', 'BH', 'BJ', 'BK', 'CD', 'EE', 'FA', 'GA', 'GB', 'GK', 'GM', 'GN',
        'JB', 'JC', 'JT', 'KA', 'LA', 'LB', 'LC', 'MC', 'MJ', 'PA', 'PB', 'Q',
        'SH', 'SJ', 'TA', 'TK', 'UA', 'VA', 'WA', 'XA', 'YA', 'ZG', 'ZT',
    ];

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'classroom_id' => Classroom::factory(),
            'first_name' => fake()->randomElement(self::FIRST_NAMES),
            'last_name' => fake()->randomElement(self::LAST_NAMES),
            'national_id' => $this->makeCin(),
            'email' => fake()->optional()->safeEmail(),
            'birth_date' => fake()->dateTimeBetween('-18 years', '-6 years')->format('Y-m-d'),
        ];
    }

    private function makeCin(): string
    {
        $prefix = fake()->randomElement(self::CIN_PREFIXES);
        $digits = (string) fake()->numberBetween(100000, 999999);

        return $prefix.$digits;
    }
}
