<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_kit_items', function (Blueprint $table) {
            $table->unsignedBigInteger('item_kit_id');
            $table->unsignedBigInteger('item_id');
            $table->decimal('quantity', 15, 3)->default(1);
            $table->decimal('cost_price', 15, 2)->default(0);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->timestamps();

            $table->index('item_kit_id');
            $table->index('item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_kit_items');
    }
};
