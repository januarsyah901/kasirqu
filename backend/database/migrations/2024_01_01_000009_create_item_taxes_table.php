<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_taxes', function (Blueprint $table) {
            $table->unsignedBigInteger('item_id');
            $table->string('name');
            $table->decimal('percent', 15, 3)->default(0);
            $table->timestamps();

            $table->primary(['item_id', 'name', 'percent']);
            $table->foreign('item_id')->references('item_id')->on('items')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_taxes');
    }
};
