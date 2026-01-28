<?php

namespace App\Http\Requests;

use App\Models\File;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CreateFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:files,id',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->failed()) {
                return;
            }

            // Check for duplicate folder name
            $exists = File::where('parent_id', $this->input('parent_id'))
                ->where('name', $this->input('name'))
                ->where('is_folder', true)
                ->exists();

            if ($exists) {
                $validator->errors()->add('name', 'A folder with this name already exists.');
            }
        });
    }
}
