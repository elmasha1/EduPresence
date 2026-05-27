<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;
        $studentId = $this->route('student')?->id;

        return [
            'classroom_id' => [
                'required',
                Rule::exists('classrooms', 'id')->where(fn ($q) => $q->where('user_id', $userId)),
            ],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            // CIN marocain : 1-2 lettres majuscules + 5-6 chiffres (ex: BE789012).
            'national_id' => [
                'required',
                'string',
                'regex:/^[A-Z]{1,2}[0-9]{5,6}$/',
                Rule::unique('students', 'national_id')->ignore($studentId),
            ],
            'email' => ['nullable', 'email', 'max:150'],
            'birth_date' => ['nullable', 'date', 'before:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'national_id.regex' => 'Le CIN doit comporter 1 ou 2 lettres majuscules suivies de 5 ou 6 chiffres (ex: BE789012).',
            'national_id.unique' => 'Ce CIN est déjà attribué à un autre élève.',
        ];
    }
}
