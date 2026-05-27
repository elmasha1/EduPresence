<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->students()->with('classroom');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($classroomId = $request->query('classroom_id')) {
            $query->where('classroom_id', $classroomId);
        }

        $perPage = min((int) $request->query('per_page', 10), 50);

        return StudentResource::collection(
            $query->orderBy('last_name')->orderBy('first_name')->paginate($perPage)
        );
    }

    public function store(StudentRequest $request)
    {
        $student = $request->user()->students()->create($request->validated());

        return new StudentResource($student->load('classroom'));
    }

    public function show(Request $request, Student $student)
    {
        $this->authorizeOwner($request, $student);

        return new StudentResource($student->load('classroom'));
    }

    public function update(StudentRequest $request, Student $student)
    {
        $this->authorizeOwner($request, $student);
        $student->update($request->validated());

        return new StudentResource($student->load('classroom'));
    }

    public function destroy(Request $request, Student $student)
    {
        $this->authorizeOwner($request, $student);
        $student->delete();

        return response()->json(['message' => 'Élève supprimé.']);
    }

    private function authorizeOwner(Request $request, Student $student): void
    {
        abort_if($student->user_id !== $request->user()->id, 403);
    }
}
