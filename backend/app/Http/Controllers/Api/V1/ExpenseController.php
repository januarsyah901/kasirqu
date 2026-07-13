<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);
        $category = $request->query('category');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $query = Expense::query()
            ->with(['employee.person', 'location'])
            ->where('deleted', false);

        if ($category) {
            $query->where('category', $category);
        }
        if ($dateFrom) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('date', '<=', $dateTo);
        }

        return ExpenseResource::collection($query->orderByDesc('date')->paginate($perPage));
    }

    public function show(int $id)
    {
        $expense = Expense::with(['employee.person', 'location'])
            ->where('deleted', false)
            ->findOrFail($id);

        return new ExpenseResource($expense);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string|max:128',
            'description' => 'nullable|string|max:255',
            'employee_id' => 'required|exists:employees,person_id',
            'location_id' => 'required|exists:stock_locations,id',
        ]);

        $data['deleted'] = false;
        $expense = Expense::create($data);

        return (new ExpenseResource($expense->load(['employee.person', 'location'])))
            ->additional(['message' => 'Expense created'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, int $id)
    {
        $expense = Expense::where('deleted', false)->findOrFail($id);

        $data = $request->validate([
            'date' => 'sometimes|date',
            'amount' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|string|max:128',
            'description' => 'nullable|string|max:255',
            'employee_id' => 'sometimes|exists:employees,person_id',
            'location_id' => 'sometimes|exists:stock_locations,id',
        ]);

        $expense->update($data);

        return new ExpenseResource($expense->fresh()->load(['employee.person', 'location']));
    }

    public function destroy(int $id)
    {
        $expense = Expense::where('deleted', false)->findOrFail($id);
        $expense->update(['deleted' => true]);

        return response()->noContent();
    }
}
