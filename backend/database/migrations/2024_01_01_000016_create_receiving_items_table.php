<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receiving_items', function (Blueprint $table) {
            $table->bigInteger('receiving_id')->nullable(false);
            $table->unsignedBigInteger('item_id');
            $table->integer('line');
            $table->string('description')->default('');
            $table->decimal('quantity_purchased', 15, 3)->default(0);
            $table->decimal('item_cost_price', 15, 2)->default(0);
            $table->decimal('item_unit_price', 15, 2)->default(0);
            $table->decimal('discount_percent', 15, 2)->default(0);
            $table->unsignedBigInteger('location_id')->nullable();
            $table->timestamps();

            $table->index('receiving_id');
            $table->index('item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receiving_items');
    }
};
