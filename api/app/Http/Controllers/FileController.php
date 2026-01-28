<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateFolderRequest;
use App\Http\Requests\StoreFileRequest;
use App\Models\File;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    public function __construct(protected FileService $fileService) {}

    public function index(Request $request): JsonResponse
    {
        $parentId = $request->query('parent_id');

        if ($parentId === 'null' || $parentId === 'root') {
            $parentId = null;
        }

        $files = File::where('parent_id', $parentId)
            ->orderBy('is_folder', 'desc')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'files' => $files,
            'breadcrumbs' => $this->fileService->breadcrumbs($parentId),
        ]);
    }

    public function store(StoreFileRequest $request): JsonResponse
    {
        $uploadedFile = $request->file('file');
        $fileName = $uploadedFile->getClientOriginalName();
        $parentId = $request->input('parent_id');

        $path = $uploadedFile->store('uploads');

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

    public function createFolder(CreateFolderRequest $request): JsonResponse
    {
        $folder = File::create([
            'name' => $request->input('name'),
            'path' => null,
            'mime_type' => null,
            'size' => 0,
            'parent_id' => $request->input('parent_id'),
            'is_folder' => true,
        ]);

        return response()->json($folder, 201);
    }

    public function download(File $file): StreamedResponse
    {
        if ($file->is_folder) {
            abort(422, 'Cannot download a folder directly.');
        }

        if (! Storage::exists($file->path)) {
            abort(404, 'File not found on disk.');
        }

        return Storage::download($file->path, $file->name);
    }

    public function destroy(File $file): Response
    {
        $this->fileService->deleteFile($file);

        return response()->noContent();
    }

    private function deleteFolderContents(File $folder)
    {
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
