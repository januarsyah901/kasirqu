<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('giftcards', function (Blueprint $table) {
            $table->id('giftcard_id');
            $table->timestamp('record_time')->useCurrent();
            $table->integer('giftcard_number')->unique();
            $table->decimal('value', 15, 2)->default(0);
            $table->boolean('deleted')->default(false);
            $table->unsignedBigInteger('person_id')->nullable();
            $table->timestamps();

            $table->index('person_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('giftcards');
    }
};
