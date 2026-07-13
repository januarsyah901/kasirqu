<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockLocationResource;
use App\Models\StockLocation;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $locations = StockLocation::where('deleted', false)->get();

        return StockLocationResource::collection($locations);
    }
}
