<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);

        $query = Supplier::query()->with('person')->where('deleted', false);

        return SupplierResource::collection($query->orderBy('person_id')->paginate($perPage));
    }

    public function show(int $id)
    {
        $supplier = Supplier::with('person')->where('deleted', false)->findOrFail($id);

        return new SupplierResource($supplier);
    }
}
