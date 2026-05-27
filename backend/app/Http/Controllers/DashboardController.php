<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now()->toDateString();

        $totalStudents = $user->students()->count();
        $totalClassrooms = $user->classrooms()->count();

        // Today's attendance breakdown across all of the teacher's classes
        $todayBreakdown = DB::table('attendance_records')
            ->join('attendances', 'attendances.id', '=', 'attendance_records.attendance_id')
            ->where('attendances.user_id', $user->id)
            ->whereDate('attendances.date', $today)
            ->select('attendance_records.status', DB::raw('COUNT(*) as total'))
            ->groupBy('attendance_records.status')
            ->pluck('total', 'status');

        $absentToday = (int) ($todayBreakdown['absent'] ?? 0);
        $presentToday = (int) ($todayBreakdown['present'] ?? 0);
        $lateToday = (int) ($todayBreakdown['late'] ?? 0);
        $markedToday = $absentToday + $presentToday + $lateToday;

        // Overall attendance rate (present / total records)
        $overall = DB::table('attendance_records')
            ->join('attendances', 'attendances.id', '=', 'attendance_records.attendance_id')
            ->where('attendances.user_id', $user->id)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN attendance_records.status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN attendance_records.status = 'absent' THEN 1 ELSE 0 END) as absent
            ")
            ->first();

        $attendanceRate = $overall && $overall->total > 0
            ? round(($overall->present / $overall->total) * 100, 1)
            : 0.0;

        $absenceRate = $overall && $overall->total > 0
            ? round(($overall->absent / $overall->total) * 100, 1)
            : 0.0;

        return response()->json([
            'total_students' => $totalStudents,
            'total_classrooms' => $totalClassrooms,
            'absent_today' => $absentToday,
            'present_today' => $presentToday,
            'late_today' => $lateToday,
            'marked_today' => $markedToday,
            'attendance_rate' => $attendanceRate,
            'absence_rate' => $absenceRate,
        ]);
    }
}
