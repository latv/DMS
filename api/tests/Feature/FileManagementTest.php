<?php

namespace Tests\Feature;

use App\Models\File;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum; // Ensure Sanctum is installed/imported
use Tests\TestCase;

class FileManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test listing files (root directory).
     */
    public function test_user_can_list_files(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        File::create([
            'name' => 'Folder A',
            'is_folder' => true,
            'parent_id' => null,
        ]);
        File::create([
            'name' => 'File B.txt',
            'is_folder' => false,
            'parent_id' => null,
            'path' => 'uploads/test.txt',
            'mime_type' => 'text/plain',
            'size' => 1024,
        ]);

        $response = $this->getJson('/api/files');

        $response->assertStatus(200)
            ->assertJsonStructure(['files', 'breadcrumbs'])
            ->assertJsonCount(2, 'files');
    }

    public function test_user_can_upload_file(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Storage::fake('local');

        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->postJson('/api/files', [
            'file' => $file,
            'parent_id' => null,
        ]);

        $response->assertStatus(201)
            ->assertJson(['name' => 'document.pdf']);

        $this->assertDatabaseHas('files', [
            'name' => 'document.pdf',
            'mime_type' => 'application/pdf',
        ]);

        $path = 'uploads/' . $file->hashName();
        Storage::disk('local')->assertExists($path);
    }

    /**
     * Test creating a folder.
     */
    public function test_user_can_create_folder(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/folders', [
            'name' => 'New Folder',
            'parent_id' => null,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'name' => 'New Folder',
                'is_folder' => true
            ]);

        $this->assertDatabaseHas('files', [
            'name' => 'New Folder',
            'is_folder' => true,
        ]);
    }

    /**
     * Test downloading a file.
     */
    public function test_user_can_download_file(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        Storage::fake('local');

        $uploadedFile = UploadedFile::fake()->create('image.jpg');
        $path = $uploadedFile->store('uploads');

        $fileRecord = File::create([
            'name' => 'image.jpg',
            'path' => $path,
            'mime_type' => 'image/jpeg',
            'size' => 500,
            'is_folder' => false,
        ]);

        $response = $this->getJson("/api/files/{$fileRecord->id}/download");

        $response->assertStatus(200);
        $response->assertHeader('content-disposition', 'attachment; filename=image.jpg');
    }

    public function test_user_can_delete_file(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        Storage::fake('local');

        $uploadedFile = UploadedFile::fake()->create('data.csv');
        $path = $uploadedFile->store('uploads');

        $fileRecord = File::create([
            'name' => 'data.csv',
            'path' => $path,
            'is_folder' => false,
        ]);

        $response = $this->deleteJson("/api/files/{$fileRecord->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('files', ['id' => $fileRecord->id]);
        Storage::assertMissing($path);
    }

    public function test_deleting_folder_removes_children(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        Storage::fake('local');

        $folder = File::create([
            'name' => 'Parent Folder',
            'is_folder' => true,
        ]);

        $childFile = File::create([
            'name' => 'child.txt',
            'path' => 'uploads/child.txt',
            'parent_id' => $folder->id,
            'is_folder' => false,
        ]);
        
        Storage::put('uploads/child.txt', 'content');

        $response = $this->deleteJson("/api/files/{$folder->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('files', ['id' => $folder->id]);
        $this->assertDatabaseMissing('files', ['id' => $childFile->id]);
        
        Storage::assertMissing('uploads/child.txt');
    }
}