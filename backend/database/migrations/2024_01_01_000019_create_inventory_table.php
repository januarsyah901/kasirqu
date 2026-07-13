<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id('trans_id');
            $table->integer('trans_items')->default(0);
            $table->unsignedBigInteger('trans_location')->nullable();
            $table->string('trans_user')->nullable();
            $table->string('trans_comment')->default('');
            $table->date('trans_date')->nullable();
            $table->integer('trans_inventory')->default(0);
            $table->timestamps();

            $table->index('trans_items');
            $table->index('trans_location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};
