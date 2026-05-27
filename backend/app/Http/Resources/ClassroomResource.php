<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ClassroomResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'level' => $this->level,
            'description' => $this->description,
            'students_count' => $this->whenCounted('students'),
            'created_at' => $this->created_at,
        ];
    }
}
