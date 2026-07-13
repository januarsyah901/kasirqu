<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CashUpResource;
use App\Models\CashUp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CashUpController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);

        $query = CashUp::query()
            ->with(['employee.person', 'location'])
            ->where('deleted', false);

        return CashUpResource::collection($query->orderByDesc('open_date')->paginate($perPage));
    }

    public function show(int $id)
    {
        $cashUp = CashUp::with(['employee.person', 'location'])
            ->where('deleted', false)
            ->findOrFail($id);

        return new CashUpResource($cashUp);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'open_amount' => 'required|numeric|min:0',
            'close_amount' => 'required|numeric|min:0',
            'cash_sales_amount' => 'nullable|numeric|min:0',
            'open_date' => 'required|date',
            'close_date' => 'required|date',
            'employee_id' => 'required|exists:employees,person_id',
            'location_id' => 'required|exists:stock_locations,id',
        ]);

        $data['cash_sales_amount'] = $data['cash_sales_amount'] ?? 0;
        $data['deleted'] = false;
        $cashUp = CashUp::create($data);

        return (new CashUpResource($cashUp->load(['employee.person', 'location'])))
            ->additional(['message' => 'Cash up created'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, int $id)
    {
        $cashUp = CashUp::where('deleted', false)->findOrFail($id);

        $data = $request->validate([
            'open_amount' => 'sometimes|numeric|min:0',
            'close_amount' => 'sometimes|numeric|min:0',
            'cash_sales_amount' => 'nullable|numeric|min:0',
            'open_date' => 'sometimes|date',
            'close_date' => 'sometimes|date',
            'employee_id' => 'sometimes|exists:employees,person_id',
            'location_id' => 'sometimes|exists:stock_locations,id',
        ]);

        $cashUp->update($data);

        return new CashUpResource($cashUp->fresh()->load(['employee.person', 'location']));
    }

    public function destroy(int $id)
    {
        $cashUp = CashUp::where('deleted', false)->findOrFail($id);
        $cashUp->update(['deleted' => true]);

        return response()->noContent();
    }
}
