<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_quantities', function (Blueprint $table) {
            $table->unsignedBigInteger('item_id');
            $table->unsignedBigInteger('location_id');
            $table->decimal('quantity', 15, 3)->default(0);
            $table->timestamps();

            $table->primary(['item_id', 'location_id']);
            $table->foreign('item_id')->references('item_id')->on('items')->cascadeOnDelete();
            $table->foreign('location_id')->references('id')->on('stock_locations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_quantities');
    }
};
