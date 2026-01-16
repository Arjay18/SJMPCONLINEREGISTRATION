<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RegistrationController extends Controller
{
    public function showForm()
    {
        return view('register');
    }

    public function register(Request $request)
    {
        $request->validate(['full_name' => 'required|string']);
        $fullName = $request->input('full_name');

        // Transaction + row locking
        $member = DB::transaction(function () use ($fullName) {
            $member = DB::table('members')
                ->where('full_name', $fullName)
                ->lockForUpdate()
                ->first();

            if (!$member) return ['status' => 'not_found'];
            if ($member->registered) return ['status' => 'already_registered'];

            DB::table('members')
                ->where('id', $member->id)
                ->update([
                    'registered' => true,
                    'registered_at' => Carbon::now()
                ]);

            return [
                'status' => 'registered',
                'member' => $member,
                'registered_at' => Carbon::now()->toDateTimeString(),
                'coupon_no' => $member->id
            ];
        });

        return response()->json($member);
    }
}
