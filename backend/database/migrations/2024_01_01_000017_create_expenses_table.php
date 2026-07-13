<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id('expense_id');
            $table->date('date')->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('category')->default('');
            $table->string('description')->default('');
            $table->unsignedBigInteger('employee_id')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->boolean('deleted')->default(false);
            $table->timestamps();

            $table->index('employee_id');
            $table->index('location_id');
            $table->index('deleted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
