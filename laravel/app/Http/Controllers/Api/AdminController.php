<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function export(Request $request)
    {
        $members = DB::table('members')->get();
        $csv = "id,passbook_no,full_name,registered,registered_at\n";
        foreach ($members as $m) {
            $csv .= "{$m->id},{$m->passbook_no},\"{$m->full_name}\",{$m->registered},{$m->registered_at}\n";
        }
        $filename = 'members_export_' . date('Ymd_His') . '.csv';
        Storage::disk('local')->put($filename, $csv);
        $url = url('storage/' . $filename);
        return response()->json(['success' => true, 'fileUrl' => $url]);
    }

    public function reset(Request $request)
    {
        DB::table('members')->update(['registered' => false, 'registered_at' => null]);
        return response()->json(['success' => true]);
    }
}
