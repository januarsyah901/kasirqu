<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_kits', function (Blueprint $table) {
            $table->id('item_kit_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2)->default(0);
            $table->boolean('deleted')->default(false);
            $table->timestamps();

            $table->index('deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_kits');
    }
};
