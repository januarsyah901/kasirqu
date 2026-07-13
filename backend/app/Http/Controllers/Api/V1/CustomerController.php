<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/customers",
     *     summary="List customers",
     *     @OA\Response(response=200, description="Customers list")
     * )
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);
        $search = $request->query('search');

        $query = Customer::with('person')->where('deleted', false);

        if ($search) {
            $query->whereHas('person', function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                  ->orWhere('last_name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        return CustomerResource::collection($query->paginate($perPage));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/customers",
     *     summary="Create customer",
     *     @OA\Response(response=201, description="Created")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255|unique:customers,account_number',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $person = Person::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email ?? '',
            'phone_number' => $request->phone_number ?? '',
            'address_1' => $request->address_1 ?? '',
            'address_2' => $request->address_2 ?? '',
            'city' => $request->city ?? '',
            'state' => $request->state ?? '',
            'zip' => $request->zip ?? '',
            'country' => $request->country ?? '',
            'comments' => $request->comments ?? '',
        ]);

        $customer = Customer::create([
            'person_id' => $person->person_id,
            'company_name' => $request->company_name,
            'account_number' => $request->account_number,
        ]);

        return (new CustomerResource($customer->load('person')))
            ->additional(['message' => 'Customer created'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/customers/{id}",
     *     summary="Get customer",
     *     @OA\Response(response=200, description="Customer detail")
     * )
     */
    public function show(int $id)
    {
        $customer = Customer::with('person')->findOrFail($id);
        return new CustomerResource($customer);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/customers/{id}",
     *     summary="Update customer",
     *     @OA\Response(response=200, description="Updated")
     * )
     */
    public function update(Request $request, int $id)
    {
        $customer = Customer::with('person')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'nullable|email|max:255',
            'company_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255|unique:customers,account_number,' . $id . ',person_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $personData = [];
        if ($request->has('first_name')) $personData['first_name'] = $request->first_name;
        if ($request->has('last_name')) $personData['last_name'] = $request->last_name;
        if ($request->has('email')) $personData['email'] = $request->email;
        if ($request->has('phone_number')) $personData['phone_number'] = $request->phone_number;

        if (!empty($personData)) {
            $customer->person->update($personData);
        }

        $customer->update($request->only(['company_name', 'account_number', 'discount', 'discount_type', 'points', 'deleted']));

        return new CustomerResource($customer->fresh()->load('person'));
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/customers/{id}",
     *     summary="Soft delete customer",
     *     @OA\Response(response=204, description="No content")
     * )
     */
    public function destroy(int $id)
    {
        $customer = Customer::findOrFail($id);
        $customer->update(['deleted' => true]);

        return response()->noContent();
    }
}
