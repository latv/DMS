<?php

namespace App\Services;

use App\Models\File;
use Illuminate\Support\Facades\Storage;

class FileService
{
    public function deleteFile(File $file): void
    {
        if ($file->is_folder) {
            $this->deleteFolderContents($file);
        } else {
            $this->physicalDelete($file);
        }
        $file->delete();
    }

    public function breadcrumbs(?int $parentId): array
    {
        $breadcrumbs = [];
        if ($parentId) {
            $current = File::find($parentId);
            while ($current) {
                array_unshift($breadcrumbs, ['id' => $current->id, 'name' => $current->name]);
                $current = $current->parent;
            }
        }

        return $breadcrumbs;
    }

    private function deleteFolderContents(File $folder): void
    {
        foreach ($folder->children()->cursor() as $child) {
            $this->deleteFile($child);
        }
    }

    private function physicalDelete(File $file): void
    {
        if ($file->path && Storage::exists($file->path)) {
            Storage::delete($file->path);
        }
    }
}
