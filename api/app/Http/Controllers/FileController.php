<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function index(Request $request)
    {
        $parentId = $request->query('parent_id');

        // Handle 'null' string or missing value as root
        if ($parentId === 'null' || $parentId === 'root') {
            $parentId = null;
        }

        $files = File::where('parent_id', $parentId)
            ->orderBy('is_folder', 'desc') // Folders first
            ->orderBy('name', 'asc')
            ->get();

        // Build breadcrumbs
        $breadcrumbs = [];
        if ($parentId) {
            $current = File::find($parentId);
            while ($current) {
                array_unshift($breadcrumbs, ['id' => $current->id, 'name' => $current->name]);
                $current = $current->parent;
            }
        }

        return response()->json([
            'files' => $files,
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
            'parent_id' => 'nullable|exists:files,id',
        ]);

        $uploadedFile = $request->file('file');
        $fileName = $uploadedFile->getClientOriginalName();
        $parentId = $request->input('parent_id');

        // Check for duplicate name in the same folder
        $exists = File::where('parent_id', $parentId)
            ->where('name', $fileName)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'A file with this name already exists.'], 422);
        }

        // Store physical file
        $path = $uploadedFile->store('uploads'); // Stores in storage/app/uploads

        $file = File::create([
            'name' => $fileName,
            'path' => $path,
            'mime_type' => $uploadedFile->getMimeType(),
            'size' => $uploadedFile->getSize(),
            'parent_id' => $parentId,
            'is_folder' => false,
        ]);

        return response()->json($file, 201);
    }

    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:files,id',
        ]);

        // Check if folder with same name exists in this parent
        $exists = File::where('parent_id', $request->input('parent_id'))
            ->where('name', $request->input('name'))
            ->where('is_folder', true)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Folder already exists'], 422);
        }

        $folder = File::create([
            'name' => $request->input('name'),
            'path' => null, // Folders don't have a physical path in this virtual system
            'mime_type' => null,
            'size' => 0,
            'parent_id' => $request->input('parent_id'),
            'is_folder' => true,
        ]);

        return response()->json($folder, 201);
    }

    public function download(File $file)
    {
        // Prevent downloading folders
        if ($file->is_folder) {
            abort(422, 'Cannot download a folder directly.');
        }

        // Check if physical file exists
        if (!Storage::exists($file->path)) {
            abort(404, 'File not found on disk.');
        }

        return Storage::download($file->path, $file->name);
    }

    public function destroy(File $file)
    {
        if ($file->is_folder) {
            // Recursive delete for folders
            $this->deleteFolderContents($file);
        } else {
            // Single file delete
            if ($file->path && Storage::exists($file->path)) {
                Storage::delete($file->path);
            }
        }

        $file->delete();

        return response()->noContent();
    }

    /**
     * Helper to recursively delete folder contents
     */
    private function deleteFolderContents(File $folder)
    {
        // Get all children (files and folders)
        $children = File::where('parent_id', $folder->id)->get();

        foreach ($children as $child) {
            if ($child->is_folder) {
                $this->deleteFolderContents($child);
            } else {
                if ($child->path && Storage::exists($child->path)) {
                    Storage::delete($child->path);
                }
            }
            $child->delete();
        }
    }
}