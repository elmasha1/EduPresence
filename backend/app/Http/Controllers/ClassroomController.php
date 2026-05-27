<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClassroomRequest;
use App\Http\Resources\ClassroomResource;
use App\Models\Classroom;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    public function index(Request $request)
    {
        $classrooms = $request->user()
            ->classrooms()
            ->withCount('students')
            ->latest()
            ->get();

        return ClassroomResource::collection($classrooms);
    }

    public function store(ClassroomRequest $request)
    {
        $classroom = $request->user()->classrooms()->create($request->validated());

        return new ClassroomResource($classroom);
    }

    public function show(Request $request, Classroom $classroom)
    {
        $this->authorizeOwner($request, $classroom);

        return new ClassroomResource($classroom->loadCount('students'));
    }

    public function update(ClassroomRequest $request, Classroom $classroom)
    {
        $this->authorizeOwner($request, $classroom);
        $classroom->update($request->validated());

        return new ClassroomResource($classroom);
    }

    public function destroy(Request $request, Classroom $classroom)
    {
        $this->authorizeOwner($request, $classroom);
        $classroom->delete();

        return response()->json(['message' => 'Classe supprimée.']);
    }

    private function authorizeOwner(Request $request, Classroom $classroom): void
    {
        abort_if($classroom->user_id !== $request->user()->id, 403);
    }
}
