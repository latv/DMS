<?php

namespace App\Http\Requests;

use App\Models\File;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => 'required|file|max:10240',
            'parent_id' => 'nullable|exists:files,id',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Only proceed if basic rules passed
            if ($validator->failed()) {
                return;
            }

            $uploadedFile = $this->file('file');
            $fileName = $uploadedFile->getClientOriginalName();
            $parentId = $this->input('parent_id');

            // Check for duplicate name in the same folder
            $exists = File::where('parent_id', $parentId)
                ->where('name', $fileName)
                ->where('is_folder', false)
                ->exists();

            if ($exists) {
                $validator->errors()->add('file', 'A file with this name already exists in this folder.');
            }
        });
    }
}
