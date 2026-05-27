<?php

namespace App\Http\Requests;

use App\Models\AttendanceRecord;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'classroom_id' => [
                'required',
                Rule::exists('classrooms', 'id')->where(fn ($q) => $q->where('user_id', $userId)),
            ],
            'date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:500'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => [
                'required',
                Rule::exists('students', 'id')->where(fn ($q) => $q->where('user_id', $userId)),
            ],
            'records.*.status' => ['required', Rule::in(AttendanceRecord::STATUSES)],
        ];
    }
}
