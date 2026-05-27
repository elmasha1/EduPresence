<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date->toDateString(),
            'note' => $this->note,
            'classroom' => $this->whenLoaded('classroom', fn () => [
                'id' => $this->classroom->id,
                'name' => $this->classroom->name,
            ]),
            'records' => $this->whenLoaded('records', fn () => $this->records->map(fn ($r) => [
                'id' => $r->id,
                'student_id' => $r->student_id,
                'status' => $r->status,
                'student' => $r->relationLoaded('student') && $r->student ? [
                    'id' => $r->student->id,
                    'full_name' => $r->student->full_name,
                ] : null,
            ])),
            'created_at' => $this->created_at,
        ];
    }
}
