<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MemberController extends Controller
{
    public function search(Request $request)
    {
        $fullName = $request->input('full_name');
        $member = DB::table('members')->where('full_name', $fullName)->first();
        if (!$member) return response()->json(['status' => 'not_found']);
        if ($member->registered) return response()->json(['status' => 'already_registered']);
        return response()->json(['status' => 'ok']);
    }

    public function register(Request $request)
    {
        $fullName = $request->input('full_name');
        $member = DB::table('members')->where('full_name', $fullName)->lockForUpdate()->first();
        if (!$member) return response()->json(['status' => 'not_found']);
        if ($member->registered) return response()->json(['status' => 'already_registered']);
        $now = Carbon::now();
        DB::table('members')->where('id', $member->id)->update([
            'registered' => true,
            'registered_at' => $now
        ]);
        return response()->json([
            'status' => 'registered',
            'registered_at' => $now->toDateTimeString(),
            'coupon_no' => $member->id
        ]);
    }
}
