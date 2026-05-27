<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()
            ->attendances()
            ->with(['classroom', 'records']);

        if ($classroomId = $request->query('classroom_id')) {
            $query->where('classroom_id', $classroomId);
        }

        if ($date = $request->query('date')) {
            $query->whereDate('date', $date);
        }

        return AttendanceResource::collection($query->latest('date')->paginate(15));
    }

    public function show(Request $request, Attendance $attendance)
    {
        $this->authorizeOwner($request, $attendance);

        return new AttendanceResource($attendance->load(['classroom', 'records.student']));
    }

    /**
     * Create or update the attendance sheet for a class on a given date.
     * Idempotent — re-submitting for the same (classroom, date) replaces records.
     */
    public function store(AttendanceRequest $request)
    {
        $data = $request->validated();

        $attendance = DB::transaction(function () use ($data, $request) {
            $attendance = Attendance::updateOrCreate(
                [
                    'classroom_id' => $data['classroom_id'],
                    'date' => $data['date'],
                ],
                [
                    'user_id' => $request->user()->id,
                    'note' => $data['note'] ?? null,
                ]
            );

            $attendance->records()->delete();
            $attendance->records()->createMany($data['records']);

            return $attendance;
        });

        return new AttendanceResource($attendance->load(['classroom', 'records.student']));
    }

    public function destroy(Request $request, Attendance $attendance)
    {
        $this->authorizeOwner($request, $attendance);
        $attendance->delete();

        return response()->json(['message' => 'Présence supprimée.']);
    }

    /**
     * Lookup the existing sheet for a class on a given date, if any.
     * Used by the frontend to pre-fill the marking form.
     */
    public function lookup(Request $request)
    {
        $request->validate([
            'classroom_id' => ['required', 'integer'],
            'date' => ['required', 'date'],
        ]);

        $attendance = $request->user()
            ->attendances()
            ->with(['records.student'])
            ->where('classroom_id', $request->classroom_id)
            ->whereDate('date', $request->date)
            ->first();

        return $attendance
            ? new AttendanceResource($attendance)
            : response()->json(null);
    }

    private function authorizeOwner(Request $request, Attendance $attendance): void
    {
        abort_if($attendance->user_id !== $request->user()->id, 403);
    }
}
