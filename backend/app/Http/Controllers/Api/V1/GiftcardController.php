<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\GiftcardResource;
use App\Models\Giftcard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GiftcardController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);

        $query = Giftcard::query()->where('deleted', false);

        return GiftcardResource::collection($query->orderByDesc('record_time')->paginate($perPage));
    }

    public function show(int $id)
    {
        $giftcard = Giftcard::where('deleted', false)->findOrFail($id);

        return new GiftcardResource($giftcard);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'giftcard_number' => 'required|integer|unique:giftcards,giftcard_number',
            'value' => 'required|numeric|min:0',
            'person_id' => 'nullable|exists:people,person_id',
        ]);

        $data['record_time'] = $data['record_time'] ?? now();
        $data['deleted'] = false;
        $giftcard = Giftcard::create($data);

        return (new GiftcardResource($giftcard))
            ->additional(['message' => 'Giftcard created'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, int $id)
    {
        $giftcard = Giftcard::where('deleted', false)->findOrFail($id);

        $data = $request->validate([
            'giftcard_number' => 'sometimes|integer|unique:giftcards,giftcard_number,' . $id . ',giftcard_id',
            'value' => 'sometimes|numeric|min:0',
            'person_id' => 'nullable|exists:people,person_id',
        ]);

        $giftcard->update($data);

        return new GiftcardResource($giftcard->fresh());
    }

    public function destroy(int $id)
    {
        $giftcard = Giftcard::where('deleted', false)->findOrFail($id);
        $giftcard->update(['deleted' => true]);

        return response()->noContent();
    }

    public function check(Request $request)
    {
        $request->validate([
            'number' => 'required|integer|exists:giftcards,giftcard_number',
        ]);

        $giftcard = Giftcard::where('giftcard_number', $request->number)
            ->where('deleted', false)
            ->firstOrFail();

        return new GiftcardResource($giftcard);
    }
}
